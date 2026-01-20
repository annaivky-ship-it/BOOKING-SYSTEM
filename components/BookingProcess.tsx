

import React, { useState, useMemo, useEffect } from 'react';
import type { Performer, Booking, BookingStatus, DoNotServeEntry, Communication } from '../types';
import { allServices } from '../data/mockData';
import { PAY_ID_EMAIL, PAY_ID_NAME, DEPOSIT_PERCENTAGE, CANCELLATION_POLICY, DEPOSIT_RULES } from '../constants';
import PayIDSimulationModal from './PayIDSimulationModal';
import CardPaymentModal from './CardPaymentModal';
import InputField from './InputField';
import { ArrowLeft, User, Mail, Phone, Calendar, Clock, MapPin, PartyPopper, UploadCloud, ShieldCheck, Copy, Send, Briefcase, ListChecks, Info, AlertTriangle, ShieldX, CheckCircle, ChevronDown, FileText, LoaderCircle, DollarSign, Users as UsersIcon, Wallet, CreditCard, Receipt } from 'lucide-react';

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
    client?: { full_name: string; email: string; phone?: string | null }; // Add client prop
    onBack: () => void;
    onBookingSubmitted: () => void;
    bookings: Booking[];
    onUpdateBookingStatus?: (bookingId: string, status: BookingStatus) => Promise<void>;
    onBookingRequest: (formState: BookingFormState, performers: Performer[]) => Promise<{ success: boolean; message: string; bookingIds?: string[] }>;
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


const BookingProcess: React.FC<BookingProcessProps> = ({ performers, client, onBack, onBookingSubmitted, bookings, onUpdateBookingStatus, onBookingRequest, doNotServeList, addCommunication, onShowPrivacyPolicy, onShowTermsOfService }) => {
    const [stage, setStage] = useState<BookingStage>('form');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Start at step 2 if client details are provided
    const [currentStep, setCurrentStep] = useState(client ? 2 : 1);
    const [form, setForm] = useState<BookingFormState>({
        fullName: client?.full_name || '',
        email: client?.email || '',
        mobile: client?.phone || '',
        eventDate: '',
        eventTime: '',
        eventAddress: '',
        eventType: '',
        duration: '2',
        numberOfGuests: '',
        selectedServices: [],
        idDocument: null,
        client_message: ''
    });
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [bookingIds, setBookingIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [isPayIdModalOpen, setIsPayIdModalOpen] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isVerifiedBooker, setIsVerifiedBooker] = useState(false);

    useEffect(() => {
        const checkVerifiedBooker = () => {
            if (!form.email && !form.mobile) return setIsVerifiedBooker(false);
            const hasConfirmedBooking = bookings.some(b =>
                b.status === 'confirmed' && (
                    (form.email && b.client_email.toLowerCase() === form.email.toLowerCase()) ||
                    (form.mobile && b.client_phone.replace(/\s+/g, '') === form.mobile.replace(/\s+/g, ''))
                )
            );
            setIsVerifiedBooker(hasConfirmedBooking);
        };
        const debounceTimer = window.setTimeout(checkVerifiedBooker, 500);
        return () => window.clearTimeout(debounceTimer);
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
        if (form.selectedServices.length === 0 || performers.length === 0) return { totalCost: 0, depositAmount: 0 };

        const durationNum = Number(form.duration) || 0;
        let hourlyCost = 0;
        let flatCost = 0;

        form.selectedServices.forEach(serviceId => {
            const service = allServices.find(s => s.id === serviceId);
            if (!service) return;

            if (service.rate_type === 'flat') {
                flatCost += service.rate;
            } else if (service.rate_type === 'per_hour') {
                const hours = Math.max(durationNum, service.min_duration_hours || 0);
                hourlyCost += service.rate * hours;
            }
        });

        const calculatedTotal = (hourlyCost * performers.length) + flatCost;
        return { totalCost: calculatedTotal, depositAmount: calculatedTotal * DEPOSIT_PERCENTAGE };
    }, [form.selectedServices, form.duration, performers.length]);

    const validateStep = (step: number): boolean => {
        setError(null);
        switch (step) {
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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred during submission.');
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
            await Promise.all(bookingIds.map(id => onUpdateBookingStatus(id, 'pending_deposit_confirmation')));
            const firstBookingId = bookingIds[0];
            await addCommunication({ sender: 'System', recipient: 'admin', message: `Simulated PayID payment received for booking #${firstBookingId.slice(0, 8)}. Ready for verification.`, booking_id: firstBookingId, type: 'admin_message' });
            setStage('deposit_confirmation_pending');
        } catch (err) {
            setError("Failed to process payment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        window.setTimeout(() => {
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
                        <InputField icon={<Phone />} type="tel" name="mobile" placeholder="Mobile (e.g., 0412 345 678)" value={form.mobile} onChange={handleChange} required pattern="^(\+614|04)\d{8}$" title="Please enter a valid Australian mobile number, e.g., 0412345678 or +61412345678" />
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
                            <ListChecks className="h-6 w-6" /> Select Services
                        </h3>
                        {Object.entries(servicesByCategory).map(([category, services]) => (
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
                                                    ${service.rate} {service.rate_type === 'per_hour' ? '/hr' : 'flat rate'}
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
                <div className="bg-purple-900/40 p-4 rounded-lg border border-purple-600/50 mt-6 text-sm">
                    <h3 className="font-bold text-purple-300 flex items-center justify-center gap-2"><Info /> DEMO INSTRUCTIONS</h3>
                    <p className="text-purple-200/80 mt-2">A message has been simulated on the Performer's phone. In the demo popup, click <strong>'Accept'</strong> to proceed to the next stage.</p>
                </div>
            </StatusScreen>
        )
    }

    if (stage === 'vetting_pending') {
        return (
            <StatusScreen icon={ShieldCheck} title="Performer Accepted!" buttonText="Back to Gallery" onButtonClick={onBack} bgColor="bg-gradient-to-br from-yellow-900/30 to-zinc-900">
                <p><strong>{performers.map(p => p.name).join(', ')}</strong> has accepted your request! It's now with our admin team for final review and vetting.</p>
                <div className="bg-yellow-900/40 p-4 rounded-lg border border-yellow-600/50 mt-6 text-sm">
                    <h3 className="font-bold text-yellow-300 flex items-center justify-center gap-2"><Info /> DEMO INSTRUCTIONS</h3>
                    <p className="text-yellow-200/80 mt-2">To continue, switch to the <strong>Admin View</strong>. Find this booking and click 'Approve Vetting'. Then, switch back to the <strong>User View</strong> to see this screen update.</p>
                </div>
            </StatusScreen>
        )
    }

    if (stage === 'deposit_confirmation_pending') {
        return (
            <StatusScreen icon={Send} title="Receipt Submitted!" buttonText="Back to Gallery" onButtonClick={onBack} bgColor="bg-gradient-to-br from-blue-900/30 to-zinc-900">
                <p>Your deposit receipt is being confirmed by our administration team. You will receive a final confirmation shortly.</p>
                <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-600/50 mt-6 text-sm">
                    <h3 className="font-bold text-blue-300 flex items-center justify-center gap-2"><Info /> DEMO INSTRUCTIONS</h3>
                    <p className="text-blue-200/80 mt-2">Switch to the <strong>Admin View</strong> again. Find this booking and click 'Confirm Deposit'. Then, switch back to the <strong>User View</strong> to see the final confirmation.</p>
                </div>
            </StatusScreen>
        )
    }

    if (stage === 'rejected') {
        return (
            <StatusScreen icon={ShieldX} title="Booking Rejected" buttonText="Return to Gallery" onButtonClick={onBookingSubmitted} bgColor="bg-gradient-to-br from-red-900/30 to-zinc-900">
                <p>Unfortunately, your booking request could not be fulfilled at this time. This may be due to performer unavailability or other factors. Please try booking another performer.</p>
            </StatusScreen>
        )
    }

    if (stage === 'confirmed') {
        const finalBalance = totalCost - depositAmount;
        const bookingReference = bookingIds[0]?.slice(0, 8).toUpperCase() || 'REF-PENDING';

        return (
            <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
                <StatusScreen icon={CheckCircle} title="Booking Confirmed!" buttonText="Finish & Return to Gallery" onButtonClick={onBookingSubmitted} bgColor="bg-gradient-to-br from-green-900/30 to-zinc-900">
                    <p className="text-xl">Your booking is locked in! <strong>{performers.map(p => p.name).join(', ')}</strong> will see you on <strong>{new Date(form.eventDate).toLocaleDateString()}</strong>.</p>
                </StatusScreen>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="card-base !p-6 !bg-zinc-900/50 border-green-500/20">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                            <Wallet className="text-orange-500" /> Remaining Balance
                        </h3>
                        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-3 mb-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Balance Due:</span>
                                <span className="text-xl font-black text-white">${finalBalance.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pt-2 border-t border-zinc-800">
                                <span className="text-zinc-400">Payment Reference:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-orange-400 font-bold">{bookingReference}</span>
                                    <button onClick={() => copyToClipboard(bookingReference, 'ref')} className="text-zinc-500 hover:text-white transition-colors">
                                        {copiedStates['ref'] ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-zinc-300">Please pay the remaining balance via PayID prior to or upon arrival:</p>
                            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center">
                                <span className="text-xs text-zinc-500">PayID Email</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono text-white">{PAY_ID_EMAIL}</span>
                                    <button onClick={() => copyToClipboard(PAY_ID_EMAIL, 'payid')} className="text-zinc-500 hover:text-white transition-colors">
                                        {copiedStates['payid'] ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-base !p-6 !bg-zinc-900/50 border-orange-500/20">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                            <Receipt className="text-orange-500" /> Terms & Rules
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">Cancellation Policy</h4>
                                <div className="text-xs text-zinc-400 whitespace-pre-line leading-relaxed">
                                    {CANCELLATION_POLICY}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-zinc-800">
                                <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">Deposit Disclosure</h4>
                                <div className="text-xs text-zinc-400 whitespace-pre-line leading-relaxed">
                                    {DEPOSIT_RULES}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    if (stage === 'deposit_pending') {
        return (
            <div className="animate-fade-in max-w-4xl mx-auto">
                <div className="card-base !p-8 text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CreditCard className="h-10 w-10 text-orange-400" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Step 5: Secure Your Booking</h2>
                    <p className="text-zinc-300 mb-8">Your booking request has been approved. A 15% deposit is now required to lock in your performer and date.</p>

                    <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 mb-8 shadow-inner">
                        <div className="flex justify-between items-center text-sm mb-4">
                            <span className="text-zinc-500">Deposit Amount (15%):</span>
                            <span className="text-3xl font-black text-orange-500">${depositAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-left">
                            <ShieldCheck className="text-green-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-zinc-300 uppercase mb-1">Secure Checkout</p>
                                <p className="text-xs text-zinc-500">Your deposit is held securely. We only release funds to the performer once the booking is fully confirmed and active.</p>
                            </div>
                        </div>
                    </div>

                    <ErrorDisplay message={error} />

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => setIsCardModalOpen(true)}
                            className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3 shadow-orange-500/20 shadow-lg"
                        >
                            <CreditCard className="h-6 w-6" /> Pay Deposit by Card
                        </button>
                        <p className="text-xs text-zinc-500 flex items-center justify-center gap-1">
                            <ShieldCheck size={12} /> Encrypted & Secure Payment
                        </p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto mt-12 grid grid-cols-2 gap-6 opacity-60">
                    <div className="text-left">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Cancellation Rule</h4>
                        <p className="text-[10px] text-zinc-500 leading-relaxed">Cancellations 48h prior receive full refund. Within 24-48h, 50% credit. Within 24h, non-refundable.</p>
                    </div>
                    <div className="text-left">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Deposit Usage</h4>
                        <p className="text-[10px] text-zinc-500 leading-relaxed">Deposit ensures performer availability. Balance due upon arrival via PayID or Cash.</p>
                    </div>
                </div>

                {isCardModalOpen && (
                    <CardPaymentModal
                        amount={depositAmount}
                        performerName={performers.map(p => p.name).join(', ')}
                        eventDate={form.eventDate}
                        onClose={() => setIsCardModalOpen(false)}
                        onPaymentSuccess={handleSimulatedPaymentSuccess}
                    />
                )}
            </div>
        );
    }

    // Default 'form' stage
    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <button
                onClick={onBack}
                className="mb-8 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Gallery
            </button>

            <div className="text-center mb-10">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-3">Booking Request</h1>
                <p className="text-lg text-zinc-400">For {performers.map(p => p.name).join(' & ')}</p>
            </div>

            <ProgressIndicator currentStep={currentStep} />
            <ErrorDisplay message={error} />

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit}>
                        {renderStepContent()}

                        <div className="mt-8 flex justify-between">
                            <button type="button" onClick={handlePrev} disabled={currentStep === 1} className="btn-secondary">
                                Previous
                            </button>
                            {currentStep < 4 ? (
                                <button type="button" onClick={handleNext} className="btn-primary">
                                    Next
                                </button>
                            ) : (
                                <button type="submit" disabled={isSubmitting || !agreedTerms} className="btn-primary w-48 flex items-center justify-center">
                                    {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Submit Booking Request'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
                <div className="lg:col-span-1">
                    <div className="sticky top-28 card-base !p-6 !bg-zinc-950/50">
                        <h3 className="text-xl font-semibold text-orange-400 mb-4 border-b border-zinc-700 pb-3">Booking Summary</h3>
                        <div className="space-y-4">
                            <DetailItem icon={<UsersIcon size={16} />} label="Performers" value={performers.map(p => p.name).join(', ')} />
                            {form.duration && <DetailItem icon={<Clock size={16} />} label="Duration" value={`${form.duration} hours`} />}
                            {form.selectedServices.length > 0 && (
                                <DetailItem icon={<Briefcase size={16} />} label="Services" value={
                                    <ul className="text-sm list-disc pl-5">
                                        {form.selectedServices.map(id => <li key={id}>{allServices.find(s => s.id === id)?.name}</li>)}
                                    </ul>
                                } />
                            )}
                            <div className="pt-4 border-t border-zinc-700/50 space-y-2">
                                <DetailItem icon={<DollarSign size={16} />} label="Estimated Total" value={`$${totalCost.toFixed(2)}`} />
                                <DetailItem icon={<Wallet size={16} />} label="Deposit Required" value={`$${depositAmount.toFixed(2)}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingProcess;
