import React, { useState } from 'react';
import { X, Upload, UserPlus, Loader } from 'lucide-react';
import { allServices } from '../data/mockData';

interface AddPerformerModalProps {
  onClose: () => void;
  onAddPerformer: (performer: NewPerformer) => Promise<void>;
}

export interface NewPerformer {
  name: string;
  tagline: string;
  photo_url: string;
  bio: string;
  service_ids: string[];
  service_areas: string[];
  status: 'available' | 'busy' | 'offline';
  phone: string;
  email: string;
  rate_multiplier?: number;
}

const AddPerformerModal: React.FC<AddPerformerModalProps> = ({ onClose, onAddPerformer }) => {
  const [formData, setFormData] = useState<NewPerformer>({
    name: '',
    tagline: '',
    photo_url: '',
    bio: '',
    service_ids: [],
    service_areas: [],
    status: 'offline',
    phone: '',
    email: '',
    rate_multiplier: 1.0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const serviceAreas = [
    'Perth North',
    'Perth South',
    'Perth East',
    'Perth West',
    'Fremantle',
    'Joondalup',
    'Rockingham',
    'Mandurah',
    'Swan Valley'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.tagline.trim()) {
      setError('Tagline is required');
      return;
    }
    if (!formData.bio.trim()) {
      setError('Bio is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (formData.service_ids.length === 0) {
      setError('Please select at least one service');
      return;
    }
    if (formData.service_areas.length === 0) {
      setError('Please select at least one service area');
      return;
    }

    setLoading(true);
    try {
      await onAddPerformer(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add performer');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter(id => id !== serviceId)
        : [...prev.service_ids, serviceId]
    }));
  };

  const toggleServiceArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      service_areas: prev.service_areas.includes(area)
        ? prev.service_areas.filter(a => a !== area)
        : [...prev.service_areas, area]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-purple-500/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-purple-500/20 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-purple-300">Add New Performer</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-300">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-800 border border-purple-500/30 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="April Flavor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tagline *
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full bg-gray-800 border border-purple-500/30 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Sweet, sassy, and always a delight"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number * (WhatsApp)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-800 border border-purple-500/30 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="+61412345678 or 0412345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-800 border border-purple-500/30 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="performer@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Photo URL *
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  className="flex-1 bg-gray-800 border border-purple-500/30 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="https://example.com/photo.jpg"
                />
                <button
                  type="button"
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              </div>
              {formData.photo_url && (
                <img
                  src={formData.photo_url}
                  alt="Preview"
                  className="mt-2 h-32 w-32 object-cover rounded border border-purple-500/30"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full bg-gray-800 border border-purple-500/30 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                placeholder="Tell us about this performer..."
              />
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-300">Services Offered *</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allServices.map(service => (
                <label
                  key={service.id}
                  className={`
                    flex items-start gap-3 p-3 rounded border cursor-pointer transition-all
                    ${formData.service_ids.includes(service.id)
                      ? 'bg-purple-900/30 border-purple-500'
                      : 'bg-gray-800 border-gray-700 hover:border-purple-500/50'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={formData.service_ids.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white">{service.name}</div>
                    <div className="text-xs text-gray-400">${service.base_price}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Service Areas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-300">Service Areas *</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {serviceAreas.map(area => (
                <label
                  key={area}
                  className={`
                    flex items-center gap-2 p-3 rounded border cursor-pointer transition-all
                    ${formData.service_areas.includes(area)
                      ? 'bg-purple-900/30 border-purple-500'
                      : 'bg-gray-800 border-gray-700 hover:border-purple-500/50'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={formData.service_areas.includes(area)}
                    onChange={() => toggleServiceArea(area)}
                  />
                  <span className="text-white">{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-300">Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-gray-800 border border-purple-500/30 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="offline">Offline</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rate Multiplier (optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="2.0"
                  value={formData.rate_multiplier}
                  onChange={(e) => setFormData({ ...formData, rate_multiplier: parseFloat(e.target.value) })}
                  className="w-full bg-gray-800 border border-purple-500/30 rounded px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="1.0"
                />
                <p className="text-xs text-gray-400 mt-1">
                  1.0 = standard pricing, 1.5 = 50% premium
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-purple-500/20">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add Performer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPerformerModal;
