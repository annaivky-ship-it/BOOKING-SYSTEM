import React, { useState } from 'react';
import { Performer, PerformerStatus, Booking, Communication } from '../types';
import { ToggleLeft, ToggleRight, Radio, Calendar, User, Clock, ShieldAlert, MessageSquare, Inbox, Check, X, Users, Timer, LoaderCircle, DollarSign, CalendarPlus } from 'lucide-react';
import { calculateBookingCost } from '../utils/bookingUtils';
import ReferralFeeModal from './ReferralFeeModal';

interface PerformerDashboardProps {
  performer: Performer;
  bookings: Booking[];
  communications: Communication[];
  onToggleStatus: (status: PerformerStatus) => Promise<void>;
  onViewDoNotServe: () => void;
  onBookingDecision: (bookingId: string, decision: 'accepted' | 'declined', eta?: number) => Promise<void>;
  onReferralFeePaid: (bookingId: string, feeAmount: number, receiptFile: File) => Promise<void>;
}

const statusConfig: Record<PerformerStatus, { color: string; label: string; icon: React.ReactNode; bgColor: string; }> = {
    available: { color: 'text-green-400', label: 'Available', icon: <ToggleRight size={20}/>, bgColor: 'bg-green-500/20' },
    busy: { color: 'text-yellow-400', label: 'Busy', icon: <ToggleLeft size={20}/>, bgColor: 'bg-yellow-500/20' },
    offline: { color: 'text-zinc-400', label: 'Offline', icon: <Radio size={20}/>, bgColor: 'bg-zinc-500/20' },
};

const bookingStatusClasses: Record<Booking['status'], string> = {
  confirmed: 'text-green-400',
  pending_deposit_confirmation: 'text-blue-400',
  deposit_pending: 'text-orange-400',
  pending_vetting: 'text-yellow-400',
  pending_performer_acceptance: 'text-purple-400',
  rejected: 'text-red-400'
}

const generateGoogleCalendarLink = (booking: Booking): string => {
    const {
        event_type,
        client_name,
        event_date,
        event_time,
        duration_hours,
        event_address,
        client_phone,
        number_of_guests,
        client_message,
    } = booking;

    const startTime = new Date(`${event_date}T${event_time}`);
    if (isNaN(startTime.getTime())) {
        console.error("Invalid date for booking:", booking.id);
        return '#';
    }

    const endTime = new Date(startTime.getTime() + duration_hours * 60 * 60 * 1000);

    const toGoogleFormat = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `Flavor Booking: ${event_type} w/ ${client_name}`,
        dates: `${toGoogleFormat(startTime)}/${toGoogleFormat(endTime)}`,
        details: `Booking Details:\n\nClient: ${client_name}\nPhone: ${client_phone}\nAddress: ${event_address}\nGuests: ${number_of_guests}\n\nNotes From Client:\n${client_message || 'N/A'}\n\n---\nBooked via Flavor Entertainers`,
        location: event_address,
    });

    return `https://www.google.com/calendar/render?${params.toString()}`;
};

interface BookingCardProps {
  booking: Booking;
  onDecision: (bookingId: string, decision: 'accepted' | 'declined', eta?: number) => Promise<void>;
  etaValue: string;
  onEtaChange: (bookingId: string, value: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onDecision, etaValue, onEtaChange }) => {
  const [isLoading, setIsLoading] = useState<'accept' | 'decline' | null>(null);

  const handleDecision = async (decision: 'accepted' | 'declined') => {
    setIsLoading(decision === 'accepted' ? 'accept' : 'decline');
    try {
      await onDecision(booking.id, decision, Number(etaValue) || undefined);
    } catch (error) {
      console.error("Failed to process booking decision", error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="bg-zinc-900/70 p-4 rounded-lg border border-zinc-700/50">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
            <div>
                <p className="font-bold text-lg text-white">{booking.event_type}</p>
                <p className={`text-sm font-semibold capitalize ${bookingStatusClasses[booking.status]}`}>{booking.status.replace(/_/g, ' ')}</p>
            </div>
            <div className="text-left sm:text-right text-sm">
               <div className="flex items-center gap-2 text-zinc-300"><Calendar className="h-4 w-4 text-orange-400"/> {new Date(booking.event_date).toLocaleDateString()}</div>
               <div className="flex items-center gap-2 text-zinc-300 mt-1"><Clock className="h-4 w-4 text-orange-400"/> {booking.event_time}</div>
            </div>
        </div>
         <div className="mt-3 pt-3 border-t border-zinc-700 flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-400 text-sm">
           <span className="flex items-center gap-2"><User className="h-4 w-4 text-orange-400" /> Client: {booking.client_name}</span>
           <span className="flex items-center gap-2"><Users className="h-4 w-4 text-orange-400" /> Guests: {booking.number_of_guests}</span>
        </div>
         {booking.status === 'pending_performer_acceptance' && (
            <div className="mt-4 pt-4 border-t border-zinc-700/50 flex flex-col sm:flex-row items-center gap-3">
                <p className="text-xs font-semibold text-zinc-300 mr-2 flex-shrink-0">Action Required:</p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                   <div className="relative flex-grow">
                      <Timer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                      <input
                        type="number"
                        placeholder="ETA (mins)"
                        value={etaValue}
                        onChange={(e) => onEtaChange(booking.id, e.target.value)}
                        className="bg-zinc-800 border border-zinc-600 text-white text-xs rounded-md focus:ring-orange-500 focus:border-orange-500 block w-full pl-8 pr-2 py-1.5 transition-colors"
                        disabled={!!isLoading}
                      />
                   </div>
                   <button onClick={() => handleDecision('accepted')} disabled={!!isLoading} className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-md flex-shrink-0 w-24">
                      {isLoading === 'accept' ? <LoaderCircle size={14} className="animate-spin" /> : <><Check size={14}/> Accept</>}
                   </button>
                   <button onClick={() => handleDecision('declined')} disabled={!!isLoading} className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-md flex-shrink-0 w-24">
                      {isLoading === 'decline' ? <LoaderCircle size={14} className="animate-spin" /> : <><X size={14}/> Decline</>}
                   </button>
                </div>
            </div>
        )}
    </div>
  );
};


const PerformerDashboard: React.FC<PerformerDashboardProps> = ({ performer, bookings, communications, onToggleStatus, onViewDoNotServe, onBookingDecision, onReferralFeePaid }) => {
  const [etas, setEtas] = useState<Record<string, string>>({});
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [referralModalBooking, setReferralModalBooking] = useState<Booking | null>(null);

  const handleEtaChange = (bookingId: string, value: string) => {
    setEtas(prev => ({ ...prev, [bookingId]: value }));
  };
  
  const handleToggleStatus = async () => {
    setIsTogglingStatus(true);
    try {
      await onToggleStatus(nextStatus[performer.status]);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const nextStatus: Record<PerformerStatus, PerformerStatus> = {
    available: 'busy',
    busy: 'offline',
    offline: 'available',
  };

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const pendingBookings = bookings.filter(b => b.status !== 'confirmed' && b.status !== 'rejected');

  return (
    <>
    {referralModalBooking && (
        <ReferralFeeModal
            booking={referralModalBooking}
            onClose={() => setReferralModalBooking(null)}
            onSubmit={async (bookingId, feeAmount, file) => {
                await onReferralFeePaid(bookingId, feeAmount, file);
                setReferralModalBooking(null);
            }}
        />
    )}
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Performer Dashboard</h1>
          <p className="text-xl text-orange-400 mt-1">Welcome, {performer.name}</p>
        </div>
        <button 
          onClick={onViewDoNotServe}
          className="bg-red-600/90 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
        >
          <ShieldAlert className="h-5 w-5" />
          'Do Not Serve' List
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-base !p-6 lg:col-span-1">
          <h2 className="text-2xl font-semibold text-white mb-4">Your Availability</h2>
          <div className="flex items-center gap-4">
            <p className="text-zinc-300">Current Status:</p>
            <span className={`font-bold py-1 px-3 rounded-full text-sm ${statusConfig[performer.status].bgColor} ${statusConfig[performer.status].color}`}>{statusConfig[performer.status].label}</span>
          </div>
          <button 
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
            className="btn-primary mt-6 w-full flex items-center justify-center gap-2"
          >
            {isTogglingStatus ? <LoaderCircle size={20} className="animate-spin" /> : statusConfig[nextStatus[performer.status]].icon}
            {isTogglingStatus ? 'Updating...' : `Switch to ${statusConfig[nextStatus[performer.status]].label}`}
          </button>
        </div>
         <div className="card-base !p-6 lg:col-span-2">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3"><MessageSquare /> Communications</h2>
             {communications.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 -mr-2">
                  {communications.map(comm => (
                    <div key={comm.id} className="bg-zinc-900/70 p-3 rounded-md text-sm border border-zinc-700/50">
                        <p className="text-zinc-200">{comm.message}</p>
                        <p className="text-xs text-zinc-500 mt-1">From: <span className="text-orange-400 font-semibold">{comm.sender}</span> &bull; {new Date(comm.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="text-center py-8 text-zinc-500">
                   <Inbox className="h-12 w-12 mx-auto mb-2 text-zinc-600" />
                   <p>No new messages.</p>
                </div>
             )}
        </div>
      </div>

      <div className="card-base !p-6">
         <h2 className="text-2xl font-semibold text-white mb-4">Your Bookings</h2>
         
         <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-orange-400 mb-3">Pending Actions ({pendingBookings.length})</h3>
              {pendingBookings.length > 0 ? (
                  <div className="space-y-4">
                      {pendingBookings.map(booking => <BookingCard key={booking.id} booking={booking} onDecision={onBookingDecision} etaValue={etas[booking.id] || ''} onEtaChange={handleEtaChange} />)}
                  </div>
              ) : (
                  <p className="text-zinc-400 text-sm">No bookings require your attention.</p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-3">Confirmed Bookings ({confirmedBookings.length})</h3>
              {confirmedBookings.length > 0 ? (
                  <div className="space-y-4">
                     {confirmedBookings.map(booking => {
                        const { totalCost, referralFee } = calculateBookingCost(booking.duration_hours, booking.services_requested, 1);
                        return (
                           <div key={booking.id} className="bg-zinc-900/70 p-4 rounded-lg border border-zinc-700/50">
                              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                                  <div>
                                      <p className="font-bold text-lg text-white">{booking.event_type}</p>
                                      <p className={`text-sm font-semibold capitalize ${bookingStatusClasses[booking.status]}`}>{booking.status.replace(/_/g, ' ')}</p>
                                  </div>
                                  <div className="text-left sm:text-right text-sm">
                                      <div className="flex items-center gap-2 text-zinc-300"><Calendar className="h-4 w-4 text-orange-400"/> {new Date(booking.event_date).toLocaleDateString()}</div>
                                      <div className="flex items-center gap-2 text-zinc-300 mt-1"><Clock className="h-4 w-4 text-orange-400"/> {booking.event_time}</div>
                                  </div>
                              </div>
                              <div className="mt-3 pt-3 border-t border-zinc-700 flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-400 text-sm">
                                  <span className="flex items-center gap-2"><User className="h-4 w-4 text-orange-400" /> Client: {booking.client_name}</span>
                                  <span className="flex items-center gap-2"><Users className="h-4 w-4 text-orange-400" /> Guests: {booking.number_of_guests}</span>
                              </div>
                              <div className="mt-4 pt-4 border-t border-zinc-700/50">
                                  <h4 className="text-sm font-semibold text-zinc-200 mb-2 flex items-center gap-2"><DollarSign size={16}/> Financials</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-400">Total Booking Value:</span>
                                        <span className="font-bold text-white">${totalCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-400">Referral Fee Due:</span>
                                        <span className="font-bold text-orange-400">${referralFee.toFixed(2)}</span>
                                    </div>
                                  </div>
                              </div>
                               <div className="mt-4 pt-4 border-t border-zinc-700/50 flex justify-between items-center">
                                    <a
                                        href={generateGoogleCalendarLink(booking)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-md"
                                    >
                                        <CalendarPlus size={14} /> Add to Calendar
                                    </a>
                                   <div>
                                      {booking.referral_fee_paid ? (
                                        <span className="text-xs bg-green-500/20 text-green-300 font-bold py-1.5 px-3 rounded-full flex items-center gap-1.5"><Check size={14}/> Fee Paid</span>
                                      ) : (
                                        <button onClick={() => setReferralModalBooking(booking)} className="btn-primary !py-1.5 !px-4 !text-xs !font-bold flex items-center gap-2">
                                            Pay Referral Fee
                                        </button>
                                      )}
                                   </div>
                               </div>
                           </div>
                        );
                     })}
                  </div>
              ) : (
                  <p className="text-zinc-400 text-sm">You have no confirmed bookings yet.</p>
              )}
            </div>
         </div>
         
         {bookings.length === 0 && (
            <p className="text-zinc-400">You have no bookings assigned yet.</p>
         )}
      </div>
    </div>
    </>
  );
};

export default PerformerDashboard;