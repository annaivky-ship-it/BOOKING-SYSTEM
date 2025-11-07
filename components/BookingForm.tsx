'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/database';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Upload,
  DollarSign,
  User as UserIcon,
  Briefcase,
  Send,
} from 'lucide-react';

interface BookingFormProps {
  performer: User;
  client: User;
}

export default function BookingForm({ performer, client }: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    eventType: '',
    eventName: '',
    eventDate: '',
    eventTime: '',
    durationHours: '2',
    location: '',
    specialRequirements: '',
    hourlyRate: '150',
    totalAmount: '300',
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  function handleInputChange(field: string, value: string) {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate total amount when hourly rate or duration changes
      if (field === 'hourlyRate' || field === 'durationHours') {
        const rate = parseFloat(field === 'hourlyRate' ? value : updated.hourlyRate) || 0;
        const hours = parseFloat(field === 'durationHours' ? value : updated.durationHours) || 0;
        updated.totalAmount = (rate * hours).toFixed(2);
      }

      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate receipt file
      if (!receiptFile) {
        throw new Error('Please upload a payment receipt');
      }

      // Create booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          performer_id: performer.id,
          event_type: formData.eventType,
          event_name: formData.eventName,
          event_date: formData.eventDate,
          event_time: formData.eventTime,
          duration_hours: parseFloat(formData.durationHours),
          location: formData.location,
          special_requirements: formData.specialRequirements || null,
          hourly_rate: parseFloat(formData.hourlyRate),
          total_amount: parseFloat(formData.totalAmount),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const { booking, uploadUrl } = await response.json();

      // Upload receipt to Supabase Storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': receiptFile.type,
        },
        body: receiptFile,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload receipt');
      }

      // Success - redirect to dashboard
      alert(`Booking created successfully! Booking #${booking.booking_number}`);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-8"
    >
      {/* Performer Info */}
      <div className="bg-gradient-to-r from-magenta-900/30 to-magenta-600/30 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4">
          {performer.avatar_url ? (
            <img
              src={performer.avatar_url}
              alt={performer.full_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-magenta-500/20 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-magenta-500" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold">{performer.full_name}</h3>
            <p className="text-gray-400">Performer</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Briefcase className="w-4 h-4 inline mr-2" />
            Event Type
          </label>
          <select
            value={formData.eventType}
            onChange={(e) => handleInputChange('eventType', e.target.value)}
            className="input-field w-full"
            required
          >
            <option value="">Select event type</option>
            <option value="Wedding">Wedding</option>
            <option value="Corporate Event">Corporate Event</option>
            <option value="Birthday Party">Birthday Party</option>
            <option value="Private Party">Private Party</option>
            <option value="Festival">Festival</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Event Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Event Name
          </label>
          <input
            type="text"
            value={formData.eventName}
            onChange={(e) => handleInputChange('eventName', e.target.value)}
            placeholder="e.g., John & Sarah's Wedding"
            className="input-field w-full"
            required
          />
        </div>

        {/* Date and Time */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Event Date
            </label>
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) => handleInputChange('eventDate', e.target.value)}
              className="input-field w-full"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Event Time
            </label>
            <input
              type="time"
              value={formData.eventTime}
              onChange={(e) => handleInputChange('eventTime', e.target.value)}
              className="input-field w-full"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g., 123 Main St, Perth WA"
            className="input-field w-full"
            required
          />
        </div>

        {/* Duration and Rates */}
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Duration (hours)
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              value={formData.durationHours}
              onChange={(e) => handleInputChange('durationHours', e.target.value)}
              className="input-field w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Hourly Rate (AUD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.hourlyRate}
              onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
              className="input-field w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Total Amount (AUD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.totalAmount}
              className="input-field w-full bg-gray-800"
              readOnly
            />
          </div>
        </div>

        {/* Special Requirements */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Special Requirements (Optional)
          </label>
          <textarea
            value={formData.specialRequirements}
            onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
            placeholder="Any special requirements or notes..."
            className="input-field w-full h-24 resize-none"
          />
        </div>

        {/* Payment Receipt Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Upload className="w-4 h-4 inline mr-2" />
            Payment Receipt (Required)
          </label>
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-magenta-500/50 transition-colors">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              className="hidden"
              id="receipt-upload"
              required
            />
            <label
              htmlFor="receipt-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8 text-magenta-500" />
              <span className="text-sm text-gray-400">
                {receiptFile ? receiptFile.name : 'Click to upload payment receipt'}
              </span>
              <span className="text-xs text-gray-500">PNG, JPG, or PDF (max 5MB)</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Upload proof of PayID payment to {performer.full_name}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Booking...
            </div>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2 inline" />
              Create Booking
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By creating this booking, you agree to the terms and conditions.
          The performer will be notified and can accept or decline your booking.
        </p>
      </form>
    </motion.div>
  );
}
