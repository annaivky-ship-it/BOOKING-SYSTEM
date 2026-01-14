
import React, { useState, useMemo, useEffect } from 'react';
import type { Performer, Booking, BookingStatus, DoNotServeEntry, Communication } from '../types';
import { allServices } from '../data/mockData';
import InputField from './InputField';
// Added Timer to the lucide-react import list
import { ArrowLeft, User, Phone, MapPin, FileText, PartyPopper, ShieldCheck, Zap, CheckCircle, Check, LoaderCircle, Users, Calendar, MessageSquare, ArrowRight, Info, ChevronDown, ChevronUp, Timer } from 'lucide-react';
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
    { id: 1, name: 'Event Details', icon: FileText },
    { id: 2, name: 'Verify & Confirm', icon: ShieldCheck },
];

const ProgressIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <nav aria-label="Booking Progress" className="mb-10 max-w-xs mx-auto">
        <ol role="list" className="flex items-center justify-between">
            {wizardSteps.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                    <li key={step.name} className="relative flex flex-col items-center flex-1">
                        {index !== wizardSteps.length - 1 && (
                            <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-10 transition-colors duration-500 ${isCompleted ? 'bg-orange-500' : 'bg-zinc-800'}`}></div>
                        )}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all duration-500 mb-2 ${isCompleted ? 'bg-orange-500 border-orange-500 text-white' : isCurrent ? 'bg-zinc-950 border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-zinc-950 border-zinc-800 text-zinc-700'}`}>
                            {isCompleted ? <Check size={14} strokeWidth={3} /> : <step.icon size={14} />}
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isCurrent || isCompleted ? 'text-white' : 'text-zinc-700'}`}>
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
    const [showSpecialRequirements, setShowSpecialRequirements] = useState(false);
    const [timingMode, setTimingMode] = useState<'asap' | 'tomorrow' | 'choose'>('asap');

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const [form, setForm] = useState<BookingFormState>({
        fullName: '', email: '', mobile: '', 
        eventDate: today, 
        eventTime: currentTime, 
        eventAddress: '', eventType: 'Private Event', duration: '2', numberOfGuests: '', selectedServices: [], 
        serviceDurations: {}, 
        idDocument: null, confirmationDocument: null, client_message: ''
    });
    
    const [error, setError] = useState<string | null>(null);

    // Default to the performer's first service if none selected
    useEffect(() => {
        if (selectedPerformers.length > 0 && form.selectedServices.length === 0) {
            const firstServiceId = selectedPerformers[0].service_ids[0];
            if (firstServiceId) {
                setForm(prev => ({ ...prev, selectedServices: [firstServiceId] }));
            }
        }
    }, [selectedPerformers]);

    const { totalCost, depositAmount, breakdown } = useMemo(() => {
        return calculateBookingCost(Number(form.duration), form.selectedServices, selectedPerformers.length, form.serviceDurations);
    }, [form.duration, form.selectedServices, selectedPerformers.length, form.serviceDurations]);

    const handleNext = () => {
        if (currentStep === 1) {
            if (!form.fullName || !form.mobile || !form.eventAddress) {
                setError("Please provide your name, mobile, and event address to continue.");
                return;
            }
            if (form.selectedServices.length === 0) {
                setError("Please select at least one professional service.");
                return;
            }
        }
        setError(null);
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleTimingShortcut = (mode: 'asap' | 'tomorrow' | 'choose') => {
        setTimingMode(mode);
        if (mode === 'asap') {
            setForm({ ...form, eventDate: today, eventTime: currentTime });
        } else if (mode === 'tomorrow') {
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
            setError(err.message || 'We could not process your booking. Please check your event details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (stage === 'success') {
        const calendarLinks = generateCalendarLinks({
            title: `Flavor Event: ${selectedPerformers.map(p => p.name).join(' & ')}`,
            description: `Booking Confirmed.\nServices: ${breakdown.map(b => b.name).join(', ')}`,
            location: form.eventAddress,
            date: form.eventDate,
            time: form.eventTime,
            durationHours: Number(form.duration)
        });

        return (
            <div className="animate-fade-in max-w-2xl mx-auto py-12 px-4">
                <div className="card-base !p-12 !bg-zinc-950/40 border-emerald-500/20 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 text-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                        <CheckCircle size={40} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-4">Booking Request Sent</h2>
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em] leading-relaxed max-w-sm mx-auto mb-12">
                        Your request for {selectedPerformers.map(p => p.name).join(' & ')} has been submitted. You will hear back via SMS within 30 minutes.
                    </p>

                    <div className="space-y-4 mb-12 text-left bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 text-center">Event Summary</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-zinc-500 uppercase text-[10px] font-black">Date</span> <span className="text-white font-bold">{form.eventDate}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500 uppercase text-[10px] font-black">Time</span> <span className="text-white font-bold">{form.eventTime}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500 uppercase text-[10px] font-black">Ref</span> <span className="text-white font-mono font-bold">FLV-{Date.now().toString().slice(-6)}</span></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <button onClick={() => window.open(calendarLinks.googleUrl, '_blank')} className="py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all">Google Calendar</button>
                        <button onClick={() => window.open(calendarLinks.outlookUrl, '_blank')} className="py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all">Outlook Calendar</button>
                    </div>

                    <button onClick={onBookingSubmitted} className="btn-primary w-full py-6 font-black text-xs tracking-[0.3em] uppercase shadow-2xl shadow-orange-500/20">
                        RETURN TO GALLERY
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-4xl mx-auto py-4 pb-32 px-4">
            <button onClick={onBack} className="mb-8 group text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-white flex items-center gap-3 transition-colors">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                Abort Booking
            </button>

            <div className="card-base !p-8 md:!p-16 !bg-zinc-950/60 border-white/5 backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
                <ProgressIndicator currentStep={currentStep} />
                
                {error && <div className="mb-10 p-6 bg-red-950/30 border border-red-500/40 rounded-[2rem] text-red-400 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{error}</div>}

                <div className="min-h-[400px]">
                    {currentStep === 1 && (
                        <div className="space-y-12 animate-fade-in">
                            {/* Timing Selection Shortcuts */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button 
                                    onClick={() => handleTimingShortcut('asap')}
                                    className={`p-6 rounded-3xl border transition-all text-left flex flex-col gap-2 ${timingMode === 'asap' ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/5' : 'bg-zinc-900/40 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Zap size={16} className={timingMode === 'asap' ? 'text-orange-500' : 'text-zinc-500'} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${timingMode === 'asap' ? 'text-orange-400' : 'text-zinc-400'}`}>Instant</span>
                                    </div>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Today (ASAP)</h4>
                                </button>
                                <button 
                                    onClick={() => handleTimingShortcut('tomorrow')}
                                    className={`p-6 rounded-3xl border transition-all text-left flex flex-col gap-2 ${timingMode === 'tomorrow' ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/5' : 'bg-zinc-900/40 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className={timingMode === 'tomorrow' ? 'text-orange-500' : 'text-zinc-500'} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${timingMode === 'tomorrow' ? 'text-orange-400' : 'text-zinc-400'}`}>Planned</span>
                                    </div>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Tomorrow</h4>
                                </button>
                                <button 
                                    onClick={() => handleTimingShortcut('choose')}
                                    className={`p-6 rounded-3xl border transition-all text-left flex flex-col gap-2 ${timingMode === 'choose' ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/5' : 'bg-zinc-900/40 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className={timingMode === 'choose' ? 'text-orange-500' : 'text-zinc-500'} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${timingMode === 'choose' ? 'text-orange-400' : 'text-zinc-400'}`}>Advanced</span>
                                    </div>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Choose Date</h4>
                                </button>
                            </div>

                            {/* Manual Date/Time Selection (only if timingMode is 'choose') */}
                            {timingMode === 'choose' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                                    <InputField icon={<Calendar size={18}/>} type="date" value={form.eventDate} onChange={(e) => setForm({...form, eventDate: e.target.value})} />
                                    <InputField icon={<Timer size={18}/>} type="time" value={form.eventTime} onChange={(e) => setForm({...form, eventTime: e.target.value})} />
                                </div>
                            )}

                            {/* Client Registration Details */}
                            <div className="space-y-5">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-3">
                                    <User size={16} className="text-orange-500" /> Client Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField icon={<User size={18}/>} placeholder="Full Legal Name" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} />
                                    <InputField icon={<Phone size={18}/>} placeholder="Australian Mobile" value={form.mobile} onChange={(e) => setForm({...form, mobile: e.target.value})} />
                                </div>
                                <InputField icon={<MapPin size={18}/>} placeholder="Event Location / Venue Address" value={form.eventAddress} onChange={(e) => setForm({...form, eventAddress: e.target.value})} />
                            </div>

                            {/* Service Selection */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-3 pt-4">
                                    <PartyPopper size={16} className="text-orange-500" /> Selected Service
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {allServices.filter(s => selectedPerformers[0]?.service_ids.includes(s.id)).map(s => {
                                        const isSelected = form.selectedServices.includes(s.id);
                                        return (
                                            <button 
                                                key={s.id}
                                                onClick={() => toggleService(s.id)}
                                                className={`p-5 rounded-2xl border transition-all flex items-center justify-between text-left ${isSelected ? 'bg-orange-500/20 border-orange-500/40 shadow-lg' : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-900'}`}
                                            >
                                                <div>
                                                    <p className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-1">{s.name}</p>
                                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">${s.rate}{s.rate_type === 'per_hour' ? '/hr' : ' (Flat)'}</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-zinc-800 bg-zinc-950'}`}>
                                                    {isSelected && <Check size={12} className="text-white" strokeWidth={4}/>}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Special Requirements Toggle */}
                            <div className="pt-4">
                                <button 
                                    onClick={() => setShowSpecialRequirements(!showSpecialRequirements)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showSpecialRequirements ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                    Special Requirements & Notes
                                </button>

                                {showSpecialRequirements && (
                                    <div className="mt-6 space-y-5 animate-fade-in border-t border-white/5 pt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <InputField icon={<Users size={18}/>} placeholder="Number of Guests (Optional)" type="number" value={form.numberOfGuests} onChange={(e) => setForm({...form, numberOfGuests: e.target.value})} />
                                            <InputField icon={<Info size={18}/>} placeholder="Type of Event (e.g. Bucks, Party)" value={form.eventType} onChange={(e) => setForm({...form, eventType: e.target.value})} />
                                        </div>
                                        <div className="relative">
                                            <MessageSquare size={18} className="absolute left-4 top-4 text-zinc-500" />
                                            <textarea 
                                                placeholder="Special requests or instructions (max 200 chars)" 
                                                maxLength={200}
                                                className="input-base !pl-14 h-24 resize-none !bg-zinc-950/80 !text-[11px] font-medium tracking-wide"
                                                value={form.client_message}
                                                onChange={(e) => setForm({...form, client_message: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-10 animate-fade-in max-w-xl mx-auto">
                            <div className="text-center">
                                <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.4em] mb-6">Verify & Confirm</h3>
                                <div className="flex justify-center -space-x-3 mb-2">
                                    {selectedPerformers.map(p => (
                                        <div key={p.id} className="w-20 h-20 rounded-2xl border-4 border-zinc-950 overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
                                            <img src={p.photo_url} className="w-full h-full object-cover" alt={p.name} />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Info size={16} className="text-white"/>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-lg font-black text-white uppercase tracking-widest mt-4">
                                    {selectedPerformers.map(p => p.name).join(' & ')}
                                </p>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                    {allServices.find(s => selectedPerformers[0]?.service_ids.includes(s.id))?.name || 'Professional Performer'}
                                </p>
                            </div>

                            <div className="bg-zinc-950 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                                <div className="p-8 border-b border-white/5 bg-zinc-900/40">
                                    <div className="flex justify-between items-end mb-8">
                                        <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">Service Summary</h3>
                                        <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.4em]">
                                            {form.eventDate === today && timingMode === 'asap' ? 'ASAP' : `${form.eventDate} @ ${form.eventTime}`}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        {breakdown.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <div className="space-y-0.5">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest block">{item.name}</span>
                                                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{item.details}</span>
                                                </div>
                                                <span className="text-[11px] font-black text-white tracking-widest">${item.cost.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-8 space-y-6 bg-zinc-950/80">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Total Value</p>
                                            <p className="text-4xl font-black text-white tracking-tighter">${totalCost.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1.5">Security Deposit (15%)</p>
                                            <p className="text-2xl font-black text-orange-500 tracking-tighter">${depositAmount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-orange-500/5 p-5 rounded-2xl border border-orange-500/10 flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                            <Info size={16} className="text-orange-500" />
                                        </div>
                                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                                            Your security deposit secures the date. Outstanding balance is payable directly upon arrival. Performer availability will be confirmed shortly after submission.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-zinc-900/30 p-5 rounded-2xl border border-white/5">
                                <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                                    Secure and discreet booking protocol. Identity verification may be required during the review process.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-4">
                    {currentStep === 2 && (
                        <button 
                            onClick={() => setCurrentStep(1)} 
                            className="px-10 py-5 text-zinc-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors active:scale-95"
                        >
                            Modify Details
                        </button>
                    )}
                    
                    {currentStep === 1 ? (
                        <button 
                            onClick={handleNext} 
                            className="btn-primary w-full sm:w-72 py-6 font-black text-xs tracking-[0.3em] shadow-2xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3"
                        >
                            REVIEW BOOKING <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting || selectedPerformers.length === 0} 
                            className="btn-primary w-full sm:w-72 py-6 font-black text-xs tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl shadow-orange-500/30 active:scale-95 disabled:opacity-20"
                        >
                            {isSubmitting ? <LoaderCircle className="animate-spin" size={20} strokeWidth={3} /> : <Zap size={20} className="fill-white" />}
                            {isSubmitting ? 'PROCESSING...' : 'CONFIRM & SEND BOOKING'}
                        </button>
                    )}
                </div>
                
                <div className="mt-12 text-center">
                    <p className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.6em]">Flavor Premium Agency &bull; Western Australia</p>
                </div>
            </div>
        </div>
    );
};

export default BookingProcess;
