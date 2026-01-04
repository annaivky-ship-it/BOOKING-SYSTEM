
import React, { useState, useMemo, useEffect } from 'react';
import type { Performer, Booking, BookingStatus, DoNotServeEntry, Communication, Service } from '../types';
import { allServices } from '../data/mockData';
import InputField from './InputField';
// Added FileText to imports
import { ArrowLeft, User, Mail, Phone, MapPin, FileText, PartyPopper, ShieldCheck, Zap, CheckCircle, Check, LoaderCircle, Users, Clock, Plus, Minus, Info, Trash2, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { calculateBookingCost, generateCalendarLinks } from '../utils/bookingUtils';

export interface BookingFormState {
  fullName: string;
  email: string;
  mobile: string;
  eventDate: string;
  eventTime: string;
  eventAddress: string;
  eventType: string;
  duration: string;
  numberOfGuests: string;
  selectedServices: string[];
  serviceDurations: Record<string, number>;
  idDocument: File | null;
  confirmationDocument: File | null;
  client_message: string;
}

interface BookingProcessProps {
  performers: Performer[];
  onBack: () => void;
  onBookingSubmitted: () => void;
  bookings: Booking[];
  onUpdateBookingStatus?: (bookingId: string, status: BookingStatus) => Promise<void>;
  onBookingRequest: (formState: BookingFormState, performers: Performer[]) => Promise<{success: boolean; message: string; bookingIds?: string[]}>;
  doNotServeList: DoNotServeEntry[];
  addCommunication: (commData: Omit<Communication, 'id' | 'created_at' | 'read'>) => Promise<void>;
  onShowPrivacyPolicy: () => void;
  onShowTermsOfService: () => void;
  initialPreferAsap?: boolean;
}

const wizardSteps = [
    { id: 1, name: 'Details', icon: MapPin },
    { id: 2, name: 'Confirm', icon: FileText },
    { id: 3, name: 'Secure', icon: ShieldCheck },
];

const ProgressIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <nav aria-label="Booking Progress" className="mb-12 max-w-sm mx-auto">
        <ol role="list" className="flex items-center justify-between">
            {wizardSteps.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                    <li key={step.name} className={`relative flex flex-col items-center flex-1`}>
                        {index !== wizardSteps.length - 1 && (
                            <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 transition-colors duration-500 ${isCompleted ? 'bg-orange-500' : 'bg-zinc-800'}`}></div>
                        )}
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 mb-2 ${isCompleted ? 'bg-orange-500 border-orange-500 text-white' : isCurrent ? 'bg-zinc-950 border-orange-500 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-zinc-950 border-zinc-800 text-zinc-700'}`}>
                            {isCompleted ? <Check size={18} strokeWidth={3} /> : <step.icon size={18} />}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isCurrent || isCompleted ? 'text-white' : 'text-zinc-700'}`}>
                            {step.name}
                        </span>
                    </li>
                );
            })}
        </ol>
    </nav>
);

const BookingProcess: React.FC<BookingProcessProps> = ({ performers: initialPerformers, onBack, onBookingSubmitted, bookings, onUpdateBookingStatus, onBookingRequest, initialPreferAsap = true }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stage, setStage] = useState<'form' | 'success'>('form');
    const [selectedPerformers, setSelectedPerformers] = useState<Performer[]>(initialPerformers);

    // Get today and tomorrow dates
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

    const [form, setForm] = useState<BookingFormState>({
        fullName: '', email: '', mobile: '', 
        eventDate: today, 
        eventTime: 'ASAP', 
        eventAddress: '', eventType: 'Private Event', duration: '2', numberOfGuests: '1-10', selectedServices: [], 
        serviceDurations: {}, 
        idDocument: null, confirmationDocument: null, client_message: ''
    });
    
    const [error, setError] = useState<string | null>(null);

    const { totalCost, depositAmount, breakdown } = useMemo(() => {
        return calculateBookingCost(Number(form.duration), form.selectedServices, selectedPerformers.length, form.serviceDurations);
    }, [form.duration, form.selectedServices, selectedPerformers.length, form.serviceDurations]);

    const handleNext = () => {
        if (currentStep === 1) {
            if (!form.fullName || !form.mobile || !form.eventAddress) {
                setError("Please provide your name, mobile, and location.");
                return;
            }
            if (form.selectedServices.length === 0) {
                setError("Please select at least one service.");
                return;
            }
        }
        setError(null);
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleAsapShortcut = (isAsap: boolean) => {
        if (isAsap) {
            setForm({ ...form, eventDate: today, eventTime: 'ASAP' });
        } else {
            setForm({ ...form, eventDate: tomorrow, eventTime: '19:00' });
        }
    };

    const toggleService = (id: string) => {
        const isSelected = form.selectedServices.includes(id);
        const service = allServices.find(s => s.id === id);
        
        if (isSelected) {
            const updatedServices = form.selectedServices.filter(sid => sid !== id);
            const updatedDurations = { ...form.serviceDurations };
            delete updatedDurations[id];
            setForm({ ...form, selectedServices: updatedServices, serviceDurations: updatedDurations });
        } else {
            const updatedServices = [...form.selectedServices, id];
            const updatedDurations = { ...form.serviceDurations };
            if (service?.rate_type === 'per_hour') {
                updatedDurations[id] = service.min_duration_hours || 2;
            }
            setForm({ ...form, selectedServices: updatedServices, serviceDurations: updatedDurations });
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await onBookingRequest(form, selectedPerformers);
            if (res.success) setStage('success');
            else throw new Error(res.message);
        } catch (err: any) {
            setError(err.message || 'Verification failed. Please check details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (stage === 'success') {
        const calendarLinks = generateCalendarLinks({
            title: `Flavor Booking: ${selectedPerformers.map(p => p.name).join(' & ')}`,
            description: `Confirmed via Flavor Entertainers.\nServices: ${breakdown.map(b => b.name).join(', ')}`,
            location: form.eventAddress,
            date: form.eventDate,
            time: form.eventTime === 'ASAP' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : form.eventTime,
            durationHours: Number(form.duration)
        });

        return (
            <div className="animate-fade-in max-w-2xl mx-auto py-12 px-4">
                <div className="card-base !p-12 !bg-zinc-950/40 border-emerald-500/20 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 text-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                        <CheckCircle size={48} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-4">Request Transmitted</h2>
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em] leading-relaxed max-w-sm mx-auto mb-12">
                        Professionals notified. An SMS arrival window will be sent to your device shortly.
                    </p>

                    <div className="space-y-4 mb-12">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Add to your schedule</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => window.open(calendarLinks.googleUrl, '_blank')}
                                className="py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Google Calendar
                            </button>
                            <button 
                                onClick={() => window.open(calendarLinks.outlookUrl, '_blank')}
                                className="py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Outlook
                            </button>
                        </div>
                    </div>

                    <button onClick={onBookingSubmitted} className="btn-primary w-full py-6 font-black text-xs tracking-[0.3em] uppercase shadow-2xl shadow-orange-500/20">
                        RETURN TO HUB
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-5xl mx-auto py-6 pb-32 px-4">
            <button onClick={onBack} className="mb-12 group text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-white flex items-center gap-3 transition-colors">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                Cancel Booking
            </button>

            <div className="card-base !p-8 md:!p-20 !bg-zinc-950/60 border-white/5 backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
                <ProgressIndicator currentStep={currentStep} />
                
                {error && <div className="mb-10 p-6 bg-red-950/30 border border-red-500/40 rounded-3xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{error}</div>}

                <div className="min-h-[450px]">
                    {currentStep === 1 && (
                        <div className="space-y-12 animate-fade-in">
                            {/* Timing Shortcuts */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button 
                                    onClick={() => handleAsapShortcut(true)}
                                    className={`p-6 rounded-3xl border transition-all text-left flex flex-col gap-2 ${form.eventTime === 'ASAP' ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/5' : 'bg-zinc-900/40 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Zap size={16} className={form.eventTime === 'ASAP' ? 'text-orange-500' : 'text-zinc-500'} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${form.eventTime === 'ASAP' ? 'text-orange-400' : 'text-zinc-400'}`}>Dispatch ASAP</span>
                                    </div>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Today</h4>
                                </button>
                                <button 
                                    onClick={() => handleAsapShortcut(false)}
                                    className={`p-6 rounded-3xl border transition-all text-left flex flex-col gap-2 ${form.eventTime !== 'ASAP' ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/5' : 'bg-zinc-900/40 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className={form.eventTime !== 'ASAP' ? 'text-orange-500' : 'text-zinc-500'} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${form.eventTime !== 'ASAP' ? 'text-orange-400' : 'text-zinc-400'}`}>Schedule</span>
                                    </div>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Tomorrow</h4>
                                </button>
                            </div>

                            {/* Service Selection */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-3">
                                    <PartyPopper size={16} /> Select Preferred Service
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {allServices.filter(s => selectedPerformers[0]?.service_ids.includes(s.id)).map(s => {
                                        const isSelected = form.selectedServices.includes(s.id);
                                        return (
                                            <button 
                                                key={s.id}
                                                onClick={() => toggleService(s.id)}
                                                className={`p-5 rounded-2xl border transition-all flex items-center justify-between text-left ${isSelected ? 'bg-orange-500/20 border-orange-500/40' : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-900'}`}
                                            >
                                                <div>
                                                    <p className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-1">{s.name}</p>
                                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">${s.rate}{s.rate_type === 'per_hour' ? '/hr' : ' flat'}</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-zinc-800 bg-zinc-950'}`}>
                                                    {isSelected && <Check size={12} className="text-white" strokeWidth={4}/>}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="space-y-5">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-3 pt-4">
                                    <User size={16} /> Contact & Location
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField icon={<User size={18}/>} placeholder="Full Legal Name" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} />
                                    <InputField icon={<Phone size={18}/>} placeholder="Australian Mobile (SMS updates)" value={form.mobile} onChange={(e) => setForm({...form, mobile: e.target.value})} />
                                </div>
                                <InputField icon={<MapPin size={18}/>} placeholder="Full Event Address / Venue Location" value={form.eventAddress} onChange={(e) => setForm({...form, eventAddress: e.target.value})} />
                                <div className="relative group">
                                    <MessageSquare size={18} className="absolute left-4 top-4 text-zinc-500" />
                                    <textarea 
                                        placeholder="Special notes or arrival instructions (e.g. entry code, room number)" 
                                        className="input-base !pl-14 !h-32 resize-none !bg-zinc-950/80 !text-[11px] font-medium tracking-wide leading-relaxed"
                                        value={form.client_message}
                                        onChange={(e) => setForm({...form, client_message: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-10 animate-fade-in max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.4em] mb-4">Confirm Your Booking</h3>
                                <div className="flex justify-center -space-x-4 mb-6">
                                    {selectedPerformers.map(p => (
                                        <div key={p.id} className="w-16 h-16 rounded-[1.5rem] border-4 border-zinc-950 overflow-hidden shadow-2xl">
                                            <img src={p.photo_url} className="w-full h-full object-cover" alt={p.name} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-zinc-950 rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                                <div className="p-10 border-b border-white/5 bg-zinc-900/40">
                                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-8">Digital Invoice</h3>
                                    <div className="space-y-6">
                                        {breakdown.map((item, i) => (
                                            <div key={i} className="flex justify-between items-start group">
                                                <div className="space-y-1">
                                                    <span className="text-xs font-black text-white uppercase tracking-widest block">{item.name}</span>
                                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{item.details}</span>
                                                </div>
                                                <span className="text-xs font-black text-white tracking-widest">${item.cost.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-10 space-y-8 bg-zinc-950/80">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Total Value</p>
                                            <p className="text-5xl font-black text-white tracking-tighter">${totalCost.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Dispatch Deposit</p>
                                            <p className="text-3xl font-black text-orange-500 tracking-tighter">${depositAmount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-orange-500/5 p-6 rounded-3xl border border-orange-500/10 flex items-start gap-4">
                                        <Info size={20} className="text-orange-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                                                This 15% deposit secures your talent. The remaining <span className="text-white">${(totalCost - depositAmount).toFixed(2)}</span> is payable directly to the professional on arrival.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-zinc-900/30 p-6 rounded-3xl border border-white/5">
                                <ShieldCheck size={24} className="text-emerald-500 shrink-0" />
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                                    Your data is encrypted. We vet all bookings for performer safety and client discretion.
                                </p>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        /* Payment Simulation Step (The user requested Step 3 to be Success, but we need to submit first) */
                        <div className="flex flex-col items-center justify-center text-center py-20 animate-fade-in">
                            <LoaderCircle className="w-16 h-16 animate-spin text-orange-500 mb-8" strokeWidth={3} />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Securing Roster</h3>
                            <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.3em]">Connecting to encrypted gateway...</p>
                        </div>
                    )}
                </div>

                <div className="mt-20 flex flex-col sm:flex-row justify-center items-center gap-4">
                    {currentStep > 1 && (
                        <button 
                            onClick={() => setCurrentStep(prev => prev - 1)} 
                            className="px-12 py-5 text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors active:scale-95 sm:order-1"
                        >
                            Review Details
                        </button>
                    )}
                    
                    {currentStep < 2 ? (
                        <button 
                            onClick={handleNext} 
                            className="btn-primary w-full sm:w-80 py-6 font-black text-xs tracking-[0.3em] shadow-2xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3 sm:order-2"
                        >
                            REVIEW BOOKING <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting || selectedPerformers.length === 0} 
                            className="btn-primary w-full sm:w-80 py-6 font-black text-xs tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl shadow-orange-500/30 active:scale-95 disabled:opacity-20 sm:order-2"
                        >
                            {isSubmitting ? <LoaderCircle className="animate-spin" size={20} strokeWidth={3} /> : <ShieldCheck size={20} />}
                            {isSubmitting ? 'VERIFYING...' : 'CONFIRM & SECURE'}
                        </button>
                    )}
                </div>
                
                <div className="mt-12 text-center">
                    <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.5em]">Flavor Premium Entertainment &bull; Western Australia</p>
                </div>
            </div>
        </div>
    );
};

export default BookingProcess;
