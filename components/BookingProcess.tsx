
import React, { useState, useMemo, useEffect } from 'react';
import type { Performer, Booking, BookingStatus, DoNotServeEntry, Communication, Service } from '../types';
import { allServices } from '../data/mockData';
import { PAY_ID_EMAIL, PAY_ID_NAME, DEPOSIT_PERCENTAGE } from '../constants';
import PayIDSimulationModal from './PayIDSimulationModal';
import InputField from './InputField';
import { ArrowLeft, User, Mail, Phone, Calendar, Clock, MapPin, PartyPopper, UploadCloud, ShieldCheck, Copy, Send, Briefcase, ListChecks, Info, AlertTriangle, ShieldX, CheckCircle, ChevronDown, FileText, LoaderCircle, DollarSign, Users as UsersIcon, Wallet, CreditCard } from 'lucide-react';
import { calculateBookingCost } from '../utils/bookingUtils';

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
  idDocument: File | null;
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
}

type BookingStage = 'form' | 'performer_acceptance_pending' | 'vetting_pending' | 'deposit_pending' | 'deposit_confirmation_pending' | 'confirmed' | 'rejected';


const eventTypes = ['Bucks Party', 'Birthday Party', 'Corporate Event', 'Hens Party', 'Private Gathering', 'Other'];

interface FileUploadFieldProps {
  file: File | null;
  setFile: (f: File | null) => void;
  id: string;
  label: string;
  accept: string;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({ file, setFile, id, label, accept }) => {
    const [error, setError] = useState('');
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size must be under 5MB.');
                setFile(null);
            } else {
                setError('');
                setFile(selectedFile);
            }
        }
    };
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-zinc-300 mb-2">{label}</label>
            <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-zinc-700 px-6 py-10 bg-zinc-900/50 hover:border-orange-500 transition-colors">
                <div className="text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-zinc-500" />
                    <div className="mt-4 flex text-sm leading-6 text-zinc-400">
                        <label htmlFor={id} className="relative cursor-pointer rounded-md font-semibold text-orange-500 hover:text-orange-400">
                            <span>Upload a file</span>
                            <input id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} accept={accept} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-zinc-500">PNG, JPG, PDF up to 5MB</p>
                    {file && <p className="text-sm mt-2 text-green-400 font-semibold">{file.name}</p>}
                    {error && <p className="text-sm mt-2 text-red-400">{error}</p>}
                </div>
            </div>
        </div>
    );
};

const ErrorDisplay = ({ message }: { message: string | null }) => message ? (
    <div className="p-4 mb-6 text-sm text-red-200 bg-red-900/50 rounded-lg border border-red-500 flex items-start gap-3" role="alert">
        <AlertTriangle className="h-5 w-5 mt-0.5 text-red-400 flex-shrink-0" />
        <div>
            <span className="font-bold">Error:</span> {message}
        </div>
    </div>
) : null;

interface StatusScreenProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  bgColor: string;
  buttonText: string;
  onButtonClick: () => void;
}
    
const StatusScreen: React.FC<StatusScreenProps> = ({ icon: Icon, title, children, bgColor, buttonText, onButtonClick }) => (
  <div className={`flex flex-col items-center justify-center min-h-[60vh] text-center p-4 animate-fade-in ${bgColor}`}>
    <div className="bg-black/40 backdrop-blur-md p-8 sm:p-12 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full">
        <Icon className="mx-auto h-20 w-20 text-orange-400 mb-6" />
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h2>
        <div className="text-zinc-300 mt-2 mb-8 max-w-lg mx-auto leading-relaxed">
          {children}
        </div>
        <button onClick={onButtonClick} className="btn-primary px-8 py-3 text-lg">
            {buttonText}
        </button>
    </div>
  </div>
);


const wizardSteps = [
    { id: 1, name: 'Client Details', icon: User },
    { id: 2, name: 'Event Details', icon: Calendar },
    { id: 3, name: 'Services', icon: ListChecks },
    { id: 4, name: 'Confirm & Submit', icon: ShieldCheck },
];

const ProgressIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0 mb-10">
            {wizardSteps.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                    <li key={step.name} className="md:flex-1">
                        <div className={`group flex flex-col border-l-4 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0 ${isCompleted ? 'border-orange-500' : isCurrent ? 'border-orange-500' : 'border-zinc-700'}`}>
                            <span className={`text-sm font-medium transition-colors ${isCompleted ? 'text-orange-400' : isCurrent ? 'text-orange-400' : 'text-zinc-400'}`}>
                                Step {step.id}
                            </span>
                            <span className="text-sm font-medium text-white">{step.name}</span>
                        </div>
                    </li>
                );
            })}
        </ol>
    </nav>
);

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="mt-1 text-orange-400 flex-shrink-0 h-5 w-5 flex items-center justify-center">{icon}</div>
        <div>
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="font-semibold text-white">{value}</p>
        </div>
    </div>
);


const BookingProcess: React.FC<BookingProcessProps> = ({ performers, onBack, onBookingSubmitted, bookings, onUpdateBookingStatus, onBookingRequest, doNotServeList, addCommunication, onShowPrivacyPolicy, onShowTermsOfService }) => {
    const [stage, setStage] = useState<BookingStage>('form');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [form, setForm] = useState<BookingFormState>({
        fullName: '', email: '', mobile: '', eventDate: '', eventTime: '', eventAddress: '', eventType: '', duration: '2', numberOfGuests: '', selectedServices: [], idDocument: null, client_message: ''
    });
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [bookingIds, setBookingIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [isPayIdModalOpen, setIsPayIdModalOpen] = useState(false);
    const [isVerifiedBooker, setIsVerifiedBooker] = useState(false);

    useEffect(() => {
      const checkVerifiedBooker = () => {
        if(!form.email && !form.mobile) return setIsVerifiedBooker(false);
        const hasConfirmedBooking = bookings.some(b => 
          b.status === 'confirmed' && (
            (form.email && b.client_email.toLowerCase() === form.email.toLowerCase()) ||
            (form.mobile && b.client_phone.replace(/\s+/g, '') === form.mobile.replace(/\s+/g, ''))
          )
        );
        setIsVerifiedBooker(hasConfirmedBooking);
      };
      const debounceTimer = setTimeout(checkVerifiedBooker, 500);
      return () => clearTimeout(debounceTimer);
    }, [form.email, form.mobile, bookings]);

    useEffect(() => {
        if (!bookings || bookingIds.length === 0) return;

        const currentBooking = bookings.find(b => b.id === bookingIds[0]);
        if (!currentBooking) return;

        const currentStatus = currentBooking.status;
        
        if (currentStatus === 'pending_performer_acceptance' && stage !== 'performer_acceptance_pending') {
            setStage('performer_acceptance_pending');
        } else if (currentStatus === 'pending_vetting' && stage !== 'vetting_pending') {
            setStage('vetting_pending');
        } else if (currentStatus === 'deposit_pending' && stage !== 'deposit_pending') {
            setStage('deposit_pending');
        } else if (currentStatus === 'pending_deposit_confirmation' && stage !== 'deposit_confirmation_pending') {
            setStage('deposit_confirmation_pending');
        } else if (currentStatus === 'confirmed' && stage !== 'confirmed') {
            setStage('confirmed');
        } else if (currentStatus === 'rejected' && stage !== 'rejected') {
            setStage('rejected');
        }
    }, [bookings, bookingIds, stage]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleServiceChange = (serviceId: string) => {
        setForm(prev => {
            const selectedServices = prev.selectedServices.includes(serviceId)
                ? prev.selectedServices.filter(s => s !== serviceId)
                : [...prev.selectedServices, serviceId];
            return { ...prev, selectedServices };
        });
    };
    
    const availableServices = useMemo(() => {
      const uniqueServiceIds = [...new Set(performers.flatMap(p => p.service_ids))];
      return allServices.filter(s => uniqueServiceIds.includes(s.id));
    }, [performers]);

    const servicesByCategory = useMemo(() => {
        return availableServices.reduce((acc, service) => {
          (acc[service.category] = acc[service.category] || []).push(service);
          return acc;
        }, {} as Record<string, typeof availableServices>);
    }, [availableServices]);

    const { totalCost, depositAmount } = useMemo(() => {
        return calculateBookingCost(Number(form.duration), form.selectedServices, performers.length);
    }, [form.selectedServices, form.duration, performers.length]);
    
    const validateStep = (step: number): boolean => {
        setError(null);
        switch(step) {
            case 1:
                if (!form.fullName || !form.email || !/^(\+614|04)\d{8}$/.test(form.mobile.replace(/\s+/g, ''))) {
                    setError("Please provide a full name, valid email, and a valid Australian mobile number (e.g., 0412345678).");
                    return false;
                }
                return true;
            case 2:
                if (!form.eventDate || !form.eventTime || !form.duration || Number(form.duration) <= 0 || !form.numberOfGuests || Number(form.numberOfGuests) <= 0 || !form.eventAddress || !form.eventType) {
                    setError("Please fill in all event details with valid values.");
                    return false;
                }
                return true;
            case 3:
                 if (form.selectedServices.length === 0) {
                    setError("Please select at least one service.");
                    return false;
                }
                return true;
            case 4:
                const idDocumentRequired = !isVerifiedBooker;
                if ((idDocumentRequired && !form.idDocument) || !agreedTerms) {
                    setError("Please upload your ID (if required) and agree to the Terms & Conditions.");
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep(4)) return;

        setIsSubmitting(true);
        setError(null);
        try {
            const result = await onBookingRequest(form, performers);
            if (result.success && result.bookingIds) {
                setBookingIds(result.bookingIds);
                setStage('performer_acceptance_pending');
            } else {
                throw new Error(result.message);
            }
        } catch(err: any) {
            setError(err.message || 'An unexpected error occurred during submission.');
            setCurrentStep(1);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDepositPaid = async () => {
        if (!receiptFile) {
            setError("Please upload your deposit receipt to continue.");
            return;
        }
        setError(null);
        if (!onUpdateBookingStatus || bookingIds.length === 0) return;
        
        setIsSubmitting(true);
        try {
            await Promise.all(bookingIds.map(id => onUpdateBookingStatus(id, 'pending_deposit_confirmation')));
            setStage('deposit_confirmation_pending');
        } catch (err) {
            setError("Failed to submit receipt. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSimulatedPaymentSuccess = async () => {
        if (!onUpdateBookingStatus || bookingIds.length === 0) return;
        
        setIsSubmitting(true);
        try {
            // AUTOMATED WORKFLOW: Automatically confirm booking instead of setting to pending
            await Promise.all(bookingIds.map(id => onUpdateBookingStatus(id, 'confirmed')));
            const firstBookingId = bookingIds[0];
            await addCommunication({ sender: 'System', recipient: 'admin', message: `Instant PayID payment verified for booking #${firstBookingId.slice(0,8)}. System auto-confirmed the booking.`, booking_id: firstBookingId, type: 'admin_message' });
            setStage('confirmed');
        } catch(err) {
            setError("Failed to process payment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        setTimeout(() => {
            setCopiedStates(prev => ({ ...prev, [key]: false }));
        }, 2000);
    };
    
    const renderStepContent = () => {
        return (
            <div key={currentStep} className="animate-fade-in">
                {currentStep === 1 && (
                    <div className="space-y-6 card-base !p-6 !bg-zinc-950/50">
                         <h3 className="text-xl font-semibold text-orange-400 border-b border-zinc-700 pb-3 mb-4">Your Details</h3>
                         <InputField icon={<User />} type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
                         <InputField icon={<Mail />} type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
                         <InputField icon={<Phone />} type="tel" name="mobile" placeholder="Mobile (e.g., 0412 345 678)" value={form.mobile} onChange={handleChange} required pattern="^(\+614|04)\d{8}$" title="Please enter a valid Australian mobile number, e.g., 0412345678 or +61412345678"/>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6 card-base !p-6 !bg-zinc-950/50">
                         <h3 className="text-xl font-semibold text-orange-400 border-b border-zinc-700 pb-3 mb-4">Event Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField icon={<Calendar />} type="date" name="eventDate" value={form.eventDate} onChange={handleChange} required />
                            <InputField icon={<Clock />} type="time" name="eventTime" value={form.eventTime} onChange={handleChange} required />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField icon={<Clock />} type="number" name="duration" placeholder="Duration (hours)" value={form.duration} onChange={handleChange} required min="1" />
                            <InputField icon={<UsersIcon />} type="number" name="numberOfGuests" placeholder="Number of Guests" value={form.numberOfGuests} onChange={handleChange} required min="1" />
                        </div>
                        <InputField icon={<MapPin />} type="text" name="eventAddress" placeholder="Event Address" value={form.eventAddress} onChange={handleChange} required />
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500"><PartyPopper /></div>
                            <select name="eventType" value={form.eventType} onChange={handleChange} required className="input-base input-with-icon appearance-none">
                                <option value="" disabled>Select Event Type</option>
                                {eventTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <FileText className="absolute left-4 top-4 h-5 w-5 text-zinc-500" />
                            <textarea
                                name="client_message"
                                placeholder="Message / Special Requests (optional)"
                                value={form.client_message}
                                onChange={handleChange}
                                className="input-base input-with-icon h-24 resize-y"
                            />
                        </div>
                    </div>
                )}
                
                {currentStep === 3 && (
                    <div className="space-y-4 card-base !p-6 !bg-zinc-950/50">
                        <h3 className="text-xl font-semibold text-orange-400 border-b border-zinc-700 pb-3 mb-4 flex items-center gap-2">
                            <ListChecks className="h-6 w-6" /> Select Services <span className="text-sm font-normal text-zinc-400 ml-2">(for all {performers.length} performers)</span>
                        </h3>
                        {Object.entries(servicesByCategory).map(([category, services]: [string, Service[]]) => (
                            <div key={category}>
                                <h4 className="font-semibold text-zinc-200 mt-4 mb-2">{category}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {services.map(service => (
                                    <label key={service.id} className="flex items-start p-3 bg-zinc-900 rounded-lg border border-zinc-700/50 hover:bg-zinc-800/70 cursor-pointer transition-colors">
                                        <input
                                        type="checkbox"
                                        checked={form.selectedServices.includes(service.id)}
                                        onChange={() => handleServiceChange(service.id)}
                                        className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-orange-600 focus:ring-orange-500"
                                        />
                                        <div className="ml-3 text-sm">
                                            <span className="font-medium text-white">{service.name}</span>
                                            <p className="text-zinc-400">{service.description}</p>
                                            <p className="text-orange-400 font-semibold mt-1">
                                                ${service.rate} {service.rate_type === 'per_hour' ? '/hr' : ' flat rate'}
                                            </p>
                                        </div>
                                    </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {currentStep === 4 && (
                    <div className="card-base !p-6 !bg-zinc-950/50">
                        <h3 className="text-xl font-semibold text-orange-400 border-b border-zinc-700 pb-3 mb-6">Verification & Agreement</h3>
                        {isVerifiedBooker ? (
                           <div className="p-4 text-center text-green-200 bg-green-900/30 rounded-lg border border-green-500 flex items-center justify-center gap-3">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-medium">Welcome back! As a verified client, you can skip the ID upload.</span>
                           </div>
                        ) : (
                           <FileUploadField
                              file={form.idDocument}
                              setFile={(f) => setForm(prev => ({ ...prev, idDocument: f }))}
                              id="idUpload"
                              label="Upload Government-Issued ID"
                              accept="image/png, image/jpeg, application/pdf"
                           />
                        )}
                        <div className="mt-6">
                            <label htmlFor="terms-check-booking" className="flex items-center p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-700/70 hover:border-zinc-600 transition-all duration-200">
                                <div className="relative h-6 w-6 flex-shrink-0">
                                <input id="terms-check-booking" type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} className="appearance-none h-6 w-6 rounded-md border-2 border-zinc-600 bg-zinc-900 checked:bg-orange-500 checked:border-orange-500 transition-all" />
                                {agreedTerms && <CheckCircle className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none" />}
                                </div>
                                <span className="ml-4 text-zinc-200">
                                I have read and agree to the{' '}
                                <a href="#" onClick={(e) => { e.preventDefault(); onShowTermsOfService(); }} className="underline text-orange-400 hover:text-orange-300">Terms &amp; Conditions</a>
                                {' and '}
                                <a href="#" onClick={(e) => { e.preventDefault(); onShowPrivacyPolicy(); }} className="underline text-orange-400 hover:text-orange-300">Privacy Policy</a>.
                                </span>
                            </label>
                        </div>
                    </div>
                )}

            </div>
        )
    }

    
    if (stage === 'performer_acceptance_pending') {
        return (
            <StatusScreen icon={Send} title="Request Sent!" buttonText="Back to Gallery" onButtonClick={onBack} bgColor="bg-gradient-to-br from-purple-900/30 to-zinc-900">
                <p>Your request has been sent to <strong>{performers.map(p => p.name).join(', ')}</strong>. We are awaiting their response and will notify you of any updates.</p>
            </StatusScreen>
        )
    }

    if (stage === 'vetting_pending') {
        return (
             <StatusScreen icon={ShieldCheck} title="Performer Accepted!" buttonText="Back to Gallery" onButtonClick={onBack} bgColor="bg-gradient-to-br from-yellow-900/30 to-zinc-900">
                 <p><strong>{performers.map(p => p.name).join(', ')}</strong> has accepted your request! It's now with our admin team for final review and vetting.</p>
             </StatusScreen>
        )
    }

    if (stage === 'deposit_confirmation_pending') {
        return (
             <StatusScreen icon={Send} title="Receipt Submitted!" buttonText="Back to Gallery" onButtonClick={onBack} bgColor="bg-gradient-to-br from-blue-900/30 to-zinc-900">
                <p>Your deposit receipt is being confirmed by our administration team. You will receive a final confirmation shortly.</p>
             </StatusScreen>
        )
    }
    
    if (stage === 'rejected') {
        return (
            <StatusScreen icon={ShieldX} title="Booking Rejected" buttonText="Return to Gallery" onButtonClick={onBookingSubmitted} bgColor="bg-gradient-to-br from-red-900/30 to-zinc-900">
                <p>Unfortunately, your booking application for <strong>{performers.map(p => p.name).join(', ')}</strong> has been rejected.</p>
            </StatusScreen>
        )
    }

    if (stage === 'confirmed') {
        const confirmedServices = allServices.filter(s => form.selectedServices.includes(s.id));
        const finalBalance = totalCost - depositAmount;

        return (
            <div className="animate-fade-in max-w-4xl mx-auto">
                <div className="card-base !p-8 sm:!p-10 !bg-gradient-to-br from-green-900/30 via-zinc-900 to-zinc-900 border-green-500/50">
                    <div className="text-center">
                        <CheckCircle className="mx-auto h-20 w-20 text-green-400 mb-6" />
                        <h2 className="text-4xl font-bold text-white mb-4">Booking Confirmed!</h2>
                        <p className="text-zinc-300 max-w-2xl mx-auto mb-10">
                            Your event is locked in. We've sent a confirmation to <strong>{form.email}</strong>.
                            Here is a summary of your booking:
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-10 mb-10">
                        {/* Left Column: Event Details */}
                        <div className="space-y-5">
                            <h3 className="text-xl font-semibold text-orange-400 border-b border-zinc-700 pb-2 flex items-center gap-2"><Briefcase size={20}/> Event Details</h3>
                            <DetailItem icon={<User />} label="Performer(s)" value={performers.map(p => p.name).join(', ')} />
                            <DetailItem icon={<Calendar />} label="Date & Time" value={`${new Date(form.eventDate).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${form.eventTime}`} />
                            <DetailItem icon={<MapPin />} label="Address" value={form.eventAddress} />
                            <DetailItem icon={<PartyPopper />} label="Event Type" value={form.eventType} />
                            <DetailItem icon={<UsersIcon />} label="Guests" value={form.numberOfGuests} />
                            <DetailItem icon={<Clock />} label="Duration" value={`${form.duration} hours`} />
                        </div>

                        {/* Right Column: Financials & Services */}
                        <div className="space-y-5">
                             <h3 className="text-xl font-semibold text-orange-400 border-b border-zinc-700 pb-2 flex items-center gap-2"><DollarSign size={20}/> Financial Summary</h3>
                             <DetailItem icon={<DollarSign />} label="Total Cost" value={`$${totalCost.toFixed(2)}`} />
                             <DetailItem icon={<CreditCard />} label="Deposit Paid" value={`$${depositAmount.toFixed(2)}`} />
                             <DetailItem icon={<Wallet />} label="Balance Due on Arrival" value={<span className="text-orange-400 text-lg">${finalBalance.toFixed(2)}</span>} />

                             <h3 className="text-xl font-semibold text-orange-400 border-b border-zinc-700 pb-2 pt-4 flex items-center gap-2"><ListChecks size={20}/> Services Requested</h3>
                             <ul className="space-y-2 pl-5">
                                {confirmedServices.map(service => (
                                    <li key={service.id} className="text-white list-disc list-outside marker:text-orange-500">{service.name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="text-center bg-zinc-950/50 p-6 rounded-lg border border-zinc-800">
                         <h3 className="text-xl font-semibold text-white mb-2">What's Next?</h3>
                         <p className="text-zinc-400">
                            Your performer, <strong>{performers.map(p => p.name).join(', ')}</strong>, has received all the details. The final balance of <strong>${finalBalance.toFixed(2)}</strong> is due in cash upon their arrival. We'll see you on the day!
                         </p>
                    </div>

                    <div className="text-center mt-10">
                        <button onClick={onBookingSubmitted} className="btn-primary px-8 py-3 text-lg">
                            Return to Gallery
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (stage === 'deposit_pending') {
        return (
            <>
            {isPayIdModalOpen && (
                <PayIDSimulationModal 
                    amount={depositAmount}
                    onPaymentSuccess={handleSimulatedPaymentSuccess}
                    onClose={() => setIsPayIdModalOpen(false)}
                />
            )}
            <div className="animate-fade-in max-w-3xl mx-auto">
                <div className="card-base !p-0 !bg-transparent !border-0">
                    <div className="p-4 mb-6 text-green-200 bg-green-900/30 rounded-lg border border-green-500 text-center">
                        <span className="font-medium">Application Approved!</span> Your initial application has been vetted and approved. Please pay the deposit to confirm the booking.
                    </div>
                    <div className="card-base !p-8 sm:!p-10 !bg-zinc-900/70">
                        <ErrorDisplay message={error} />
                        <h2 className="text-3xl font-bold text-white mb-2">Deposit Required</h2>
                        <p className="text-zinc-300 mb-6">To confirm your booking with <strong>{performers.map(p => p.name).join(', ')}</strong>, please pay the {DEPOSIT_PERCENTAGE * 100}% deposit.</p>

                        <button 
                            onClick={() => setIsPayIdModalOpen(true)}
                            className="w-full py-4 text-lg flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:-translate-y-0.5 mb-6"
                            disabled={isSubmitting}
                        >
                           🚀 Pay now with PayID
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-zinc-700" /></div>
                            <div className="relative flex justify-center"><span className="bg-zinc-900 px-2 text-zinc-500 text-sm">Or Manually Upload Receipt</span></div>
                        </div>

                        <div className="space-y-4 bg-zinc-950 p-6 rounded-lg mb-8 border border-zinc-700">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-zinc-300">PayID Name:</span>
                                <span className="font-mono">{PAY_ID_NAME}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-zinc-300">PayID Email:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono">{PAY_ID_EMAIL}</span>
                                    <button onClick={() => copyToClipboard(PAY_ID_EMAIL, 'email')} className="text-orange-400 hover:text-orange-300 transition-colors">
                                        {copiedStates['email'] ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4"/>}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-orange-400 font-bold text-lg pt-4 border-t border-zinc-800">
                                <span>Deposit Amount ({DEPOSIT_PERCENTAGE * 100}%):</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono">${depositAmount.toFixed(2)}</span>
                                    <button onClick={() => copyToClipboard(depositAmount.toFixed(2), 'amount')} className="text-orange-400 hover:text-orange-300 transition-colors">
                                        {copiedStates['amount'] ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4"/>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <FileUploadField file={receiptFile} setFile={setReceiptFile} id="receiptUpload" label="Upload Deposit Receipt" accept="image/png, image/jpeg, application/pdf" />
                        </div>

                        <button 
                            onClick={handleConfirmDepositPaid}
                            disabled={!receiptFile || isSubmitting}
                            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
                        >
                           {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                           Submit Manual Receipt
                        </button>
                    </div>
                </div>
            </div>
            </>
        )
    }

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="mb-8 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                Back
            </button>
            <form onSubmit={handleSubmit} className="card-base !p-0 sm:!p-0 !bg-transparent !border-0 max-w-4xl mx-auto">
                 <div className="card-base !p-8 sm:!p-10 !bg-zinc-900/70 space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Booking Application For:</h2>
                        <p className="text-orange-400 text-xl font-semibold">{performers.map(p => p.name).join(', ')}</p>
                    </div>

                    <ProgressIndicator currentStep={currentStep} />
                    
                    <ErrorDisplay message={error} />
                    
                    {renderStepContent()}
                     
                    {(currentStep === 3 || currentStep === 4) && (
                        <div className="card-base !p-6 !bg-zinc-950/50 mt-8">
                            <h3 className="text-xl font-semibold text-orange-400 flex items-center gap-2"><DollarSign /> Cost Estimate</h3>
                            <div className="mt-4 space-y-2 text-zinc-300">
                                <div className="flex justify-between items-center">
                                    <span>Total Booking Cost:</span>
                                    <span className="font-bold text-2xl text-white">${totalCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Deposit Due ({DEPOSIT_PERCENTAGE * 100}%):</span>
                                    <span className="font-semibold text-xl text-orange-400">${depositAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}


                    <div className="mt-8 flex items-center justify-between">
                        <button 
                            type="button" 
                            onClick={handlePrev} 
                            className={`bg-zinc-700 hover:bg-zinc-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        >
                            Back
                        </button>
                       {currentStep < 4 ? (
                          <button type="button" onClick={handleNext} className="btn-primary text-lg px-8 py-3">
                              Next
                          </button>
                       ) : (
                          <button type="submit" disabled={isSubmitting} className="btn-primary text-lg py-3 px-6 flex items-center justify-center gap-3">
                              {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin"/> : <Send className="h-5 w-5" />}
                              {isSubmitting ? 'Submitting...' : 'Submit Booking Application'}
                          </button>
                       )}
                    </div>

                 </div>
            </form>
        </div>
    );
};

export default BookingProcess;
