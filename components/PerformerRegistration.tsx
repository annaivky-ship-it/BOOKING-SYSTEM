
import React, { useState, useMemo } from 'react';
import { api } from '../services/api';
import { ArrowLeft, User, Mail, Lock, Sparkles, Image as ImageIcon, Briefcase, CheckCircle, LoaderCircle, AlertTriangle, Camera } from 'lucide-react';
import InputField from './InputField';
import { allServices } from '../data/mockData';
import type { Service } from '../types';

interface PerformerRegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
}

const steps = [
  { id: 1, title: 'Account', icon: Lock },
  { id: 2, title: 'Profile', icon: User },
  { id: 3, title: 'Services', icon: Briefcase },
];

const PerformerRegistration: React.FC<PerformerRegistrationProps> = ({ onBack, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    tagline: '',
    bio: '',
    photo_url: '',
    service_ids: [] as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleServiceToggle = (id: string) => {
    setFormData(prev => {
        const exists = prev.service_ids.includes(id);
        if (exists) {
            return { ...prev, service_ids: prev.service_ids.filter(sid => sid !== id) };
        } else {
            return { ...prev, service_ids: [...prev.service_ids, id] };
        }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
          setError("Image size must be less than 5MB");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo_url: reader.result as string }));
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number) => {
    setError(null);
    if (step === 1) {
        if (!formData.email || !formData.password) {
            setError("Email and Password are required.");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return false;
        }
    }
    if (step === 2) {
        if (!formData.name || !formData.tagline || !formData.bio) {
            setError("Stage Name, Tagline, and Bio are required.");
            return false;
        }
    }
    if (step === 3) {
        if (formData.service_ids.length === 0) {
            setError("Please select at least one service you provide.");
            return false;
        }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
        setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
     if (!validateStep(3)) return;
     
     setIsSubmitting(true);
     setError(null);
     
     try {
         const { success, error } = await api.registerPerformer({
             email: formData.email,
             password: formData.password,
             name: formData.name,
             tagline: formData.tagline,
             bio: formData.bio,
             photo_url: formData.photo_url || 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800', // Demo default
             service_ids: formData.service_ids
         });
         
         if (!success) {
             throw new Error(error.message || 'Registration failed.');
         }
         
         onSuccess();
     } catch (err: any) {
         setError(err.message);
     } finally {
         setIsSubmitting(false);
     }
  };

  const servicesByCategory = useMemo(() => {
    return allServices.reduce((acc, service) => {
      (acc[service.category] = acc[service.category] || []).push(service);
      return acc;
    }, {} as Record<string, Service[]>);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        <button onClick={onBack} className="mb-6 text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft size={20} /> Back to Sign In
        </button>

        <div className="card-base !p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Join as Talent</h1>
                <p className="text-zinc-400">Apply to become a Flavor Performer.</p>
            </div>

            {/* Steps Indicator */}
            <div className="flex justify-center items-center gap-4 mb-8">
                {steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div className={`flex items-center gap-2 ${currentStep >= step.id ? 'text-orange-400' : 'text-zinc-600'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold transition-colors ${currentStep >= step.id ? 'border-orange-400 bg-orange-400/10' : 'border-zinc-700'}`}>
                                {step.id}
                            </div>
                            <span className="hidden sm:inline font-medium text-sm">{step.title}</span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`h-0.5 w-12 ${currentStep > step.id ? 'bg-orange-500' : 'bg-zinc-700'}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg flex items-start gap-3 text-red-200">
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-semibold text-white mb-4">Account Credentials</h2>
                    <InputField 
                        icon={<Mail />} 
                        type="email" 
                        name="email" 
                        placeholder="Email Address" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                    />
                    <InputField 
                        icon={<Lock />} 
                        type="password" 
                        name="password" 
                        placeholder="Password (min 6 chars)" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                    />
                    <InputField 
                        icon={<Lock />} 
                        type="password" 
                        name="confirmPassword" 
                        placeholder="Confirm Password" 
                        value={formData.confirmPassword} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-semibold text-white mb-4">Public Profile</h2>
                    
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative w-32 h-32 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-600 flex items-center justify-center overflow-hidden group hover:border-orange-500 transition-colors cursor-pointer">
                            {formData.photo_url ? (
                                <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center text-zinc-500 group-hover:text-orange-500 transition-colors">
                                    <Camera size={32} />
                                    <span className="text-xs mt-1 font-semibold">Add Photo</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">Tap to take a photo or select from device</p>
                    </div>

                    <InputField 
                        icon={<Sparkles />} 
                        name="name" 
                        placeholder="Stage Name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                    />
                    <InputField 
                        icon={<Briefcase />} 
                        name="tagline" 
                        placeholder="Tagline (e.g., 'The Life of the Party')" 
                        value={formData.tagline} 
                        onChange={handleChange} 
                        required 
                    />
                     <div className="relative">
                        <User className="absolute left-4 top-4 h-5 w-5 text-zinc-500" />
                        <textarea
                            name="bio"
                            placeholder="Your Bio (Tell clients about yourself and your style)"
                            value={formData.bio}
                            onChange={handleChange}
                            required
                            className="input-base input-with-icon h-32 resize-y"
                        />
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-semibold text-white mb-4">Select Your Services</h2>
                    <p className="text-zinc-400 text-sm mb-4">Choose the services you are willing to perform. You can update these later.</p>
                    <div className="max-h-80 overflow-y-auto pr-2">
                        {Object.entries(servicesByCategory).map(([category, services]) => (
                            <div key={category} className="mb-6">
                                <h3 className="text-orange-400 font-semibold mb-3 border-b border-zinc-700 pb-1">{category}</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {services.map(service => (
                                        <label key={service.id} className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${formData.service_ids.includes(service.id) ? 'bg-orange-500/10 border-orange-500/50' : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={formData.service_ids.includes(service.id)} 
                                                onChange={() => handleServiceToggle(service.id)}
                                                className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-orange-600 focus:ring-orange-500"
                                            />
                                            <div className="ml-3">
                                                <span className={`block font-medium ${formData.service_ids.includes(service.id) ? 'text-white' : 'text-zinc-300'}`}>{service.name}</span>
                                                <span className="text-xs text-zinc-500">${service.rate} {service.rate_type === 'per_hour' ? '/hr' : ' flat'}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-8 flex justify-between pt-6 border-t border-zinc-800">
                <button 
                    onClick={handlePrev} 
                    disabled={currentStep === 1 || isSubmitting}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${currentStep === 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700'}`}
                >
                    Back
                </button>
                
                {currentStep < 3 ? (
                    <button onClick={handleNext} className="btn-primary px-8 py-2">
                        Next
                    </button>
                ) : (
                    <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary px-8 py-2 flex items-center gap-2">
                        {isSubmitting ? <LoaderCircle className="animate-spin h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                        {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
                    </button>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default PerformerRegistration;
