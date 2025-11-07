

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Briefcase, ChevronDown, ShoppingCart, Radio, LoaderCircle, CalendarCheck, Clock, Users, Settings, Calendar } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import PerformerCard from './components/EntertainerCard';
import PerformerProfile from './components/EntertainerProfile';
import AgeGate from './components/AgeGate';
// FIX: Use type-only import for BookingFormState
import BookingProcess, { type BookingFormState } from './components/BookingProcess';
import PerformerDashboard from './components/PerformerDashboard';
import AdminDashboard from './components/AdminDashboard';
import DoNotServe from './components/DoNotServe';
import DemoPhone from './components/DemoPhone';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import PresentationVideo from './components/PresentationVideo';
import UserSettings from './components/UserSettings';
import Auth from './components/Auth';
import ServicesPage from './components/ServicesPage';
import CalendarView from './components/CalendarView';
import InteractiveWalkthrough from './components/InteractiveWalkthrough';
import { api } from './services/api';
import type { Performer, Booking, Role, PerformerStatus, BookingStatus, DoNotServeEntry, DoNotServeStatus, Communication, PhoneMessage, Profile, WalkthroughStep } from './types';
import { allServices } from './data/mockData';
import { PAY_ID_EMAIL } from './constants';
import { calculateBookingCost } from './utils/bookingUtils';
import type { Session } from '@supabase/supabase-js';

type GalleryView = 'available_now' | 'future_bookings';
// FIX: Added 'calendar_view' to the main view state type to align with its usage in the component.
type ViewState = GalleryView | 'profile' | 'booking' | 'performer_dashboard' | 'admin_dashboard' | 'do_not_serve' | 'user_settings' | 'auth' | 'services_page' | 'calendar_view';


interface NotificationSettings {
    bookingUpdates: boolean;
    confirmations: boolean;
}

const App: React.FC = () => {
  const [ageVerified, setAgeVerified] = useState(false);
  const [view, setView] = useState<ViewState>('available_now');
  const [bookingOrigin, setBookingOrigin] = useState<GalleryView>('available_now');
  const [viewedPerformer, setViewedPerformer] = useState<Performer | null>(null);
  const [selectedForBooking, setSelectedForBooking] = useState<Performer[]>([]);
  const [viewRole, setViewRole] = useState<Role>('user');
  
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [doNotServeList, setDoNotServeList] = useState<DoNotServeEntry[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPerformerIdForAdmin, setCurrentPerformerIdForAdmin] = useState<number | null>(null);
  const [phoneMessage, setPhoneMessage] = useState<PhoneMessage>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    bookingUpdates: true,
    confirmations: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [walkthrough, setWalkthrough] = useState({ isActive: false, step: 0 });

  // Auth effect
  useEffect(() => {
    const fetchSession = async () => {
        const { data: { session }, error } = await api.getSession();
        if (error) {
            console.error('Error fetching session:', error);
            setError('Could not connect to authentication service.');
        } else {
            setSession(session);
        }
        setIsAuthLoading(false);
    };
    fetchSession();

    const { data: { subscription } } = api.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Profile fetching effect
  useEffect(() => {
    if (session?.user) {
      setIsLoading(true);
      api.getProfile(session.user).then(({ data, error }) => {
        if (error) {
          setError("Could not fetch user profile.");
          console.error(error);
        } else {
          setUserProfile(data);
          const newRole = data?.role || 'user';
          setViewRole(newRole); // Set actual role
           if (newRole === 'admin') setView('admin_dashboard');
           else if (newRole === 'performer') setView('performer_dashboard');
           else setView('available_now');
        }
        setIsLoading(false);
      });
    } else {
      setUserProfile(null);
      setViewRole('user'); // Reset to default when logged out
      setView('available_now');
    }
  }, [session]);

  const handleNotificationSettingsChange = (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  };
  
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setNotificationSettings(JSON.parse(savedSettings));
    }
  }, []);

  const showPhoneMessage = useCallback((msg: PhoneMessage) => {
    setPhoneMessage(msg);
    window.setTimeout(() => {
      setPhoneMessage(null);
    }, 7000); // Message disappears after 7 seconds
  }, []);

  const handleShowPrivacyPolicy = () => {
    window.scrollTo(0, 0);
    setShowPrivacyPolicy(true);
  };
  
  const handleShowTermsOfService = () => {
    window.scrollTo(0, 0);
    setShowTermsOfService(true);
  };
  
  const handleShowPresentation = () => {
    window.scrollTo(0, 0);
    setShowPresentation(true);
  }

  const handleShowServicesPage = () => {
    window.scrollTo(0, 0);
    setView('services_page');
  };


  const addCommunication = useCallback(async (commData: Omit<Communication, 'id' | 'created_at' | 'read'>) => {
    // Client-side filtering based on settings
    if (commData.recipient === 'user') {
        if (commData.type === 'booking_update' && !notificationSettings.bookingUpdates) {
            console.log("Skipping user notification for booking update due to user settings.");
            return;
        }
        if (commData.type === 'booking_confirmation' && !notificationSettings.confirmations) {
             console.log("Skipping user notification for booking confirmation due to user settings.");
            return;
        }
    }
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const newComm: Communication = { ...commData, id: tempId, created_at: new Date().toISOString(), read: false };
    setCommunications(prev => [newComm, ...prev]);

    try {
        const { data, error } = await api.addCommunication(commData);
        if (error) throw error;
        // Replace temp comm with real one from backend
        setCommunications(prev => prev.map(c => c.id === tempId ? data![0] : c));
    } catch (err) {
        console.error("Failed to add communication:", err);
        // Revert optimistic update
        setCommunications(prev => prev.filter(c => c.id !== tempId));
    }
  }, [notificationSettings]);


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { performers, bookings, doNotServeList, communications } = await api.getInitialData();

      if (performers.error) throw new Error(`Performers: ${performers.error.message}`);
      setPerformers(performers.data as Performer[] || []);
      if(performers.data && performers.data.length > 0 && !currentPerformerIdForAdmin){
          setCurrentPerformerIdForAdmin(performers.data[0].id);
      }

      if (bookings.error) throw new Error(`Bookings: ${bookings.error.message}`);
      setBookings(bookings.data as Booking[] || []);

      if (doNotServeList.error) throw new Error(`DNS List: ${doNotServeList.error.message}`);
      setDoNotServeList(doNotServeList.data as DoNotServeEntry[] || []);

      if (communications.error) throw new Error(`Communications: ${communications.error.message}`);
      setCommunications(communications.data as Communication[] || []);

    } catch (err: any) {
      setError(`Failed to fetch data: ${err.message}.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPerformerIdForAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const isVerified = localStorage.getItem('ageVerified') === 'true';
    setAgeVerified(isVerified);
  }, []);

  const handleAgeVerified = () => {
    localStorage.setItem('ageVerified', 'true');
    setAgeVerified(true);
  };
  
  const handleNavigation = (targetView: 'admin_dashboard' | 'performer_dashboard' | 'available_now') => {
      setView(targetView);
      window.scrollTo(0,0);
  };
  
  const handleSignInClick = () => {
    setView('auth');
    window.scrollTo(0,0);
  }


  const handlePerformerStatusChange = async (performerId: number, status: PerformerStatus) => {
    const performerName = performers.find(p => p.id === performerId)?.name || 'A performer';
    const originalPerformers = performers;
    
    // Optimistic update
    setPerformers(prev => prev.map(p => p.id === performerId ? { ...p, status } : p));
    
    try {
        const { error } = await api.updatePerformerStatus(performerId, status);
        if (error) throw error;
        addCommunication({ sender: 'System', recipient: 'admin', message: `${performerName}'s status changed to ${status}.`, type: 'admin_message' });
    } catch (err) {
        console.error("Failed to update status:", err);
        setPerformers(originalPerformers); // Revert
        setError("Could not update performer status.");
    }
  };
  
  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const originalBookings = bookings;
    const booking = originalBookings.find(b => b.id === bookingId);
    if (!booking) return;

    let updatedBookingData: Partial<Booking> = { status };
    if (status === 'confirmed') {
        updatedBookingData = { ...updatedBookingData, verified_by_admin_name: 'Admin Demo', verified_at: new Date().toISOString() };
    }
    if (status === 'pending_deposit_confirmation') {
       updatedBookingData.deposit_receipt_path = `simulated/receipt-${bookingId.slice(0,8)}.pdf`;
    }
    
    const updatedBookings = originalBookings.map(b => b.id === bookingId ? { ...b, ...updatedBookingData } : b);
    setBookings(updatedBookings); // Optimistic Update

    try {
      const { error } = await api.updateBookingStatus(bookingId, status, updatedBookingData);
      if (error) throw error;

      // Notifications on success
      const { totalCost, depositAmount } = calculateBookingCost(booking.duration_hours, booking.services_requested, 1);
      const finalBalance = totalCost - depositAmount;

      if (status !== 'confirmed') {
        const clientMessage = {
          deposit_pending: `✅ Booking Approved! Your application for ${booking.event_type} with ${booking.performer?.name} is approved. Please pay the deposit to confirm.`,
          pending_deposit_confirmation: `🧾 Deposit Submitted! We've received your confirmation. An admin will verify it shortly.`,
          rejected: `❗️ Booking Rejected. Unfortunately, your application for ${booking.event_type} has been rejected by administration.`,
        }[status as 'deposit_pending' | 'pending_deposit_confirmation' | 'rejected'];
        if (clientMessage) addCommunication({ sender: 'System', recipient: 'user', message: clientMessage, booking_id: bookingId, type: 'booking_update' });

        const clientPhoneMessage = {
             pending_deposit_confirmation: { for: 'Client', content: <p>🧾 <strong>Deposit Submitted!</strong><br />We've received your confirmation and will verify it shortly. We'll let you know when everything is confirmed!</p> },
             rejected: { for: 'Client', content: <p>❗️ <strong>Booking Update</strong><br />Unfortunately, your application for {booking.event_type} with {booking.performer?.name} has been rejected by administration.</p> },
        }[status as 'pending_deposit_confirmation' | 'rejected'];
        
        if (clientPhoneMessage) {
            showPhoneMessage(clientPhoneMessage as PhoneMessage);
        }
      }
      
      if (status === 'deposit_pending') showPhoneMessage({ for: 'Client', content: <p>🎉 <strong>Booking Approved!</strong><br />Your application for {booking.event_type} with <strong>{booking.performer?.name}</strong> is approved. Please pay the deposit to confirm.<br/><br/><strong>PAYID:</strong> {PAY_ID_EMAIL}<br/><strong>Amount:</strong> ${depositAmount.toFixed(2)}</p> });
      
      if (status === 'confirmed') {
        showPhoneMessage({ for: 'Client', content: <p>✅ <strong>Booking Confirmed!</strong><br/>Your event with <strong>{booking.performer?.name}</strong> is locked in. See you on {new Date(booking.event_date).toLocaleDateString()}!<br/><br/><span className="text-xs">Final balance of <strong>${finalBalance.toFixed(2)}</strong> due in cash on arrival.</span></p> });
        addCommunication({ sender: 'System', recipient: 'user', message: `🎉 Booking Confirmed! Your event with ${booking.performer?.name} is locked in. Final balance of $${finalBalance.toFixed(2)} due in cash on arrival. See you on ${new Date(booking.event_date).toLocaleDateString()}!`, booking_id: bookingId, type: 'booking_confirmation' });
        
        window.setTimeout(() => showPhoneMessage({ for: 'Performer', content: <p>💰 <strong>DEPOSIT PAID!</strong><br />Your booking is confirmed:<br />👤 Client: <strong>{booking.client_name}</strong><br />📞 Phone: {booking.client_phone}<br />📍 Address: {booking.event_address}<br />📅 When: {new Date(booking.event_date).toLocaleDateString()}, {booking.event_time}<br />👥 Guests: {booking.number_of_guests}<br />{booking.client_message && <><br/>📝 <strong>Note:</strong> "{booking.client_message}"</>}<br/><br/>She's coming in hot 🔥 Get ready!</p>}), 6000);
        window.setTimeout(() => showPhoneMessage({ for: 'Admin', content: <p>✅ <strong>DEPOSIT CONFIRMED</strong><br/>Booking locked in:<br/>👤 Client: <strong>{booking.client_name}</strong><br/>🍑 Performer: <strong>{booking.performer?.name}</strong><br/>📅 When: {new Date(booking.event_date).toLocaleDateString()}, {booking.event_time}<br/><br/>Booking ID: #{booking.id.slice(0, 8)}...</p> }), 12000);
      }

      if (status === 'confirmed') {
        addCommunication({ sender: 'System', recipient: booking.performer_id, message: `🎉 BOOKING CONFIRMED! The deposit for your event with ${booking.client_name} on ${new Date(booking.event_date).toLocaleDateString()} is paid. Client Address: ${booking.event_address}. Phone: ${booking.client_phone}.`, booking_id: bookingId, type: 'booking_confirmation' });
      } else {
        const performerMessage = {
            deposit_pending: `✅ Booking Vetted! The application from ${booking.client_name} for ${new Date(booking.event_date).toLocaleDateString()} has been approved. Awaiting deposit.`,
            rejected: `❗️ Booking Rejected: The application from ${booking.client_name} for ${new Date(booking.event_date).toLocaleDateString()} has been rejected.`,
        }[status as 'deposit_pending' | 'rejected'];
        if(performerMessage) addCommunication({ sender: 'System', recipient: booking.performer_id, message: performerMessage, booking_id: bookingId, type: 'booking_update' });
      }

      const adminMessage = {
          pending_deposit_confirmation: `🧾 Client for booking #${bookingId.slice(0, 8)} (${booking.client_name}) has confirmed deposit payment. Please verify.`,
          confirmed: `✅ Booking Confirmed for ${booking.client_name} with ${booking.performer?.name}.`,
          rejected: `❌ Booking Rejected for ${booking.client_name} with ${booking.performer?.name}.`,
      }[status];
      if (adminMessage) addCommunication({ sender: 'System', recipient: 'admin', message: adminMessage, booking_id: bookingId, type: 'admin_message' });

    } catch (err) {
        console.error("Failed to update booking:", err);
        setBookings(originalBookings); // Revert
        setError("Could not update booking status.");
    }
  };
  
  const handleUpdateDoNotServeStatus = async (entryId: string, status: DoNotServeStatus) => {
      const entry = doNotServeList.find(e => e.id === entryId);
      if(!entry) return;
      const originalList = doNotServeList;

      // Optimistic Update
      setDoNotServeList(prev => prev.map(e => e.id === entryId ? { ...e, status } : e));
      
      try {
        const { error } = await api.updateDoNotServeStatus(entryId, status);
        if (error) throw error;
        const message = `The 'Do Not Serve' submission for '${entry.client_name}' submitted by ${entry.performer?.name} has been ${status}.`;
        addCommunication({ sender: 'System', recipient: 'admin', message, type: 'admin_message' });
        if (entry.submitted_by_performer_id !== 0) {
           addCommunication({ sender: 'System', recipient: entry.submitted_by_performer_id, message, type: 'admin_message' });
        }
      } catch (err) {
        console.error("Failed to update DNS entry:", err);
        setDoNotServeList(originalList); // Revert
        setError("Could not update 'Do Not Serve' entry.");
      }
  }

  const handleCreateDoNotServeEntry = async (newEntryData: Omit<DoNotServeEntry, 'id' | 'created_at' | 'status'>, submitterName: Performer['name']) => {
      try {
        const { data, error } = await api.createDoNotServeEntry(newEntryData);
        if (error) throw error;
        setDoNotServeList(prev => [data![0], ...prev]);
        addCommunication({ sender: submitterName, recipient: 'admin', message: `New 'Do Not Serve' entry submitted by ${submitterName} for review against "${newEntryData.client_name}".`, type: 'admin_message' })
      } catch(err) {
          console.error("Failed to create DNS entry:", err);
          setError("Could not create 'Do Not Serve' entry.");
      }
  };

  const handlePerformerBookingDecision = async (bookingId: string, decision: 'accepted' | 'declined', eta?: number) => {
      const booking = bookings.find(b => b.id === bookingId);
      if(!booking) return;

      const performerName = booking.performer?.name || 'The performer';
      
      if (decision === 'declined') {
        await handleUpdateBookingStatus(bookingId, 'rejected');
        addCommunication({ sender: performerName, recipient: 'admin', message: `${performerName} has DECLINED the booking request from ${booking.client_name}.`, type: 'admin_message' });
        addCommunication({ sender: 'System', recipient: 'user', message: `We're sorry, ${performerName} is unable to accept your booking request at this time. Please try booking another performer.`, booking_id: booking.id, type: 'booking_update' });
        return;
      }
      
      const isVerifiedBooker = bookings.some(b => 
          b.status === 'confirmed' && b.client_email.toLowerCase() === booking.client_email.toLowerCase()
      );
      const newStatus = isVerifiedBooker ? 'deposit_pending' : 'pending_vetting';
      
      const updateData: Partial<Booking> = { status: newStatus };
      if (eta && eta > 0) {
          updateData.performer_eta_minutes = eta;
      }
      
      const originalBookings = bookings;
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updateData } : b));

      try {
        const { error } = await api.updateBookingStatus(bookingId, newStatus, updateData);
        if (error) throw error;
        
        const etaMessagePartAdmin = eta && eta > 0 ? ` with an ETA of ${eta} minutes` : '';
        const etaMessagePartUser = eta && eta > 0 ? ` Her ETA is ~${eta} minutes.` : '';

        if (isVerifiedBooker) {
          addCommunication({ sender: performerName, recipient: 'admin', message: `${performerName} has ACCEPTED the booking from verified client ${booking.client_name}${etaMessagePartAdmin}. It has automatically skipped vetting and is awaiting deposit.`, type: 'admin_message' });
          addCommunication({ sender: 'System', recipient: 'user', message: `${performerName} has accepted your request!${etaMessagePartUser} As a verified client, you can now proceed to payment.`, booking_id: booking.id, type: 'booking_update' });
          handleUpdateBookingStatus(bookingId, 'deposit_pending'); // Trigger notifications for this status
        } else {
          addCommunication({ sender: performerName, recipient: 'admin', message: `${performerName} has ACCEPTED the booking request from ${booking.client_name}${etaMessagePartAdmin}. It is now pending your vetting.`, type: 'admin_message' });
          addCommunication({ sender: 'System', recipient: 'user', message: `${performerName} has accepted your request!${etaMessagePartUser} Your booking is now with our admin team for final review.`, booking_id: booking.id, type: 'booking_update' });
          showPhoneMessage({ for: 'Client', content: <p>✅ <strong>Performer Accepted!</strong><br /><strong>{performerName}</strong> has accepted your request! Your booking is now with our admin team for a final review.</p> });
        }
      } catch (err) {
          console.error("Failed performer decision update:", err);
          setBookings(originalBookings);
          setError("Failed to process performer decision.");
      }
  };
  
  const handleAdminBookingDecisionForPerformer = async (bookingId: string, decision: 'accepted' | 'declined') => {
      const booking = bookings.find(b => b.id === bookingId);
      if(!booking) return;
      
      addCommunication({ sender: 'Admin', recipient: booking.performer_id, message: `An admin has ${decision} the booking from ${booking.client_name} on your behalf.`, type: 'booking_update' });
      await handlePerformerBookingDecision(bookingId, decision, undefined);
  }

  const handleAdminChangePerformer = async (bookingId: string, newPerformerId: number) => {
    const booking = bookings.find(b => b.id === bookingId);
    const newPerformer = performers.find(p => p.id === newPerformerId);
    if (!booking || !newPerformer) return;
    
    const oldPerformerId = booking.performer_id;
    const oldPerformerName = booking.performer?.name || 'Previous Performer';

    const updates: Partial<Booking> = { 
        performer_id: newPerformerId,
        status: 'pending_performer_acceptance',
        performer_reassigned_from_id: oldPerformerId,
    };

    const originalBookings = bookings;
    setBookings(prev => prev.map(b => b.id === bookingId ? { 
        ...b, 
        ...updates,
        performer: { id: newPerformerId, name: newPerformer.name },
    } : b));

    try {
        const { error } = await api.updateBookingStatus(bookingId, 'pending_performer_acceptance', updates);
        if(error) throw error;

        addCommunication({ sender: 'Admin', recipient: 'admin', message: `Booking for ${booking.client_name} has been reassigned from ${oldPerformerName} to ${newPerformer.name}.`, type: 'admin_message' });
        addCommunication({ sender: 'Admin', recipient: 'user', message: `An update on your booking: ${newPerformer.name} has now been assigned to your event. We are awaiting their confirmation.`, booking_id: booking.id, type: 'booking_update' });
        addCommunication({ sender: 'Admin', recipient: oldPerformerId, message: `Your booking for ${booking.client_name} has been reassigned to another performer by an administrator.`, booking_id: booking.id, type: 'booking_update' });
        addCommunication({ sender: 'Admin', recipient: newPerformerId, message: `You have been newly assigned a booking for ${booking.client_name}. Please review and accept/decline.`, booking_id: booking.id, type: 'booking_update' });
        
        showPhoneMessage({ for: 'Client', content: <p>🔄 <strong>Booking Update</strong><br />An administrator has reassigned your booking. <strong>{newPerformer.name}</strong> is now assigned to your event, pending their confirmation.</p> });
        window.setTimeout(() => showPhoneMessage({ for: 'Performer', content: <p>🆕 <strong>New Assigned Booking!</strong><br />Admin has assigned you a booking for <strong>{booking.client_name}</strong>. Please review and accept/decline in your dashboard.</p> }), 6000);

    } catch (err) {
        console.error("Failed to reassign performer:", err);
        setBookings(originalBookings);
        setError("Could not reassign performer.");
    }
  };
  
  const handleReferralFeePaid = async (bookingId: string, feeAmount: number, receiptFile: File) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Simulate upload and get path for demo
    const receiptPath = `referral-receipts/receipt-${bookingId.slice(0, 8)}-${receiptFile.name}`;

    // Optimistic update
    const originalBookings = bookings;
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, referral_fee_paid: true, referral_fee_amount: feeAmount, referral_fee_receipt_path: receiptPath } : b));
    
    try {
        const { error } = await api.updateReferralFeeStatus(bookingId, feeAmount, receiptPath);
        if (error) throw error;
        
        addCommunication({
            sender: booking.performer?.name || 'Performer',
            recipient: 'admin',
            message: `${booking.performer?.name} has submitted their referral fee payment for the booking with ${booking.client_name}.`,
            booking_id: bookingId,
            type: 'admin_message'
        });
    } catch(err) {
        console.error("Failed to update referral fee status:", err);
        setBookings(originalBookings); // Revert
        setError("Could not submit referral fee payment. Please try again.");
    }
  };

  const handleBookingRequest = async (formState: BookingFormState, requestedPerformers: Performer[]) => {
     try {
        const { data: newBookings, error } = await api.createBookingRequest(formState, requestedPerformers);
        if (error) throw error;
        
        setBookings(prev => [...newBookings!, ...prev]);

        const firstBooking = newBookings![0];
        addCommunication({ sender: 'System', recipient: 'user', message: `🎉 Booking Request Sent! We've notified ${newBookings!.map(b=>b.performer?.name).join(', ')} of your request.`, booking_id: firstBooking.id, type: 'booking_update' });
        addCommunication({ sender: 'System', recipient: 'admin', message: `📥 New Booking Request: for ${formState.fullName} with ${newBookings!.map(b=>b.performer?.name).join(', ')}. Awaiting performer acceptance.`, type: 'admin_message' });

        showPhoneMessage({ for: 'Client', content: <p>🎉 <strong>Request Sent!</strong><br />We've sent your request to <strong>{newBookings!.map(b => b.performer?.name).join(' & ')}</strong>. We'll notify you as soon as they respond!</p> });

        window.setTimeout(() => {
            const { totalCost, depositAmount } = calculateBookingCost(firstBooking.duration_hours, firstBooking.services_requested, newBookings!.length);
            showPhoneMessage({
                for: 'Performer',
                content: <p>🎭 <strong>New Booking Request!</strong><br />From: <strong>{firstBooking.client_name}</strong><br/>For: {new Date(firstBooking.event_date).toLocaleDateString()}<br/>Event: {firstBooking.event_type}<br/>Guests: {firstBooking.number_of_guests}<br/><br/><strong>Total Value:</strong> ${totalCost.toFixed(2)}<br/><strong>Deposit:</strong> ${depositAmount.toFixed(2)}</p>,
                actions: [
                    { label: '✅ Accept Booking', onClick: () => handlePerformerBookingDecision(firstBooking.id, 'accepted'), style: 'primary' },
                    { label: '❌ Decline Booking', onClick: () => handlePerformerBookingDecision(firstBooking.id, 'declined'), style: 'secondary' },
                ]
            });
        }, 6000); 
        return { success: true, message: 'Booking submitted', bookingIds: newBookings!.map(b => b.id) };
    } catch(err: any) {
        return { success: false, message: err.message || 'An unknown error occurred.' };
    }
  };

  const handleBookingSubmitted = () => {
      fetchData();
      setSelectedForBooking([]);
      setView(bookingOrigin);
  };
  
  const handleMarkCommunicationsRead = () => {
     // This would be a backend call in a real app
     const currentPerformerId = (userProfile?.role === 'performer') ? userProfile.performer_id : currentPerformerIdForAdmin;
     setCommunications(prev => prev.map(c => {
        const isForAdmin = viewRole === 'admin' && c.recipient === 'admin';
        const isForUser = viewRole === 'user' && c.recipient === 'user';
        const isForPerformer = viewRole === 'performer' && c.recipient === currentPerformerId;

        if (isForAdmin || isForUser || isForPerformer) {
            return { ...c, read: true };
        }
        return c;
     }));
  }

  const handleViewProfile = (performer: Performer) => {
    window.scrollTo(0, 0);
    if (view === 'available_now' || view === 'future_bookings') {
        setBookingOrigin(view as GalleryView);
    }
    setViewedPerformer(performer);
    setView('profile');
  };
  
  const handleViewDoNotServe = () => {
      setView('do_not_serve');
  };

  const handleViewUserSettings = () => {
    window.scrollTo(0, 0);
    setView('user_settings');
  };

  const handleBackToDashboard = () => {
      if (userProfile?.role === 'admin') setView('admin_dashboard');
      else if (userProfile?.role === 'performer') setView('performer_dashboard');
      else setView('available_now');
  }

  const handleProceedToBooking = () => {
    if (view === 'available_now' || view === 'future_bookings') {
        setBookingOrigin(view);
    }
    window.scrollTo(0, 0);
    setView('booking');
  };

  const handleBookSinglePerformer = (performer: Performer) => {
    setSelectedForBooking([performer]);
    handleProceedToBooking();
  };

  const handleTogglePerformerSelection = (performerToToggle: Performer) => {
    setSelectedForBooking(prev => {
        const isSelected = prev.some(p => p.id === performerToToggle.id);
        if (isSelected) {
            return prev.filter(p => p.id !== performerToToggle.id);
        } else {
            return [...prev, performerToToggle];
        }
    });
  };

  const handleReturnToGallery = () => {
    setViewedPerformer(null);
    setSelectedForBooking([]);
    setView(bookingOrigin);
  };

  const uniqueCategories = useMemo(() => [...new Set(allServices.map(s => s.category))], []);
  
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<PerformerStatus | ''>('');

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const isGalleryView = view === 'available_now' || view === 'future_bookings';
    if (query.trim() !== '' && !isGalleryView) {
        setView('future_bookings');
        // Clear other filters for a clean search experience
        setCategoryFilter('');
        setAvailabilityFilter('');
    }
  };

  const filteredPerformers = useMemo(() => {
    const basePerformers = view === 'available_now'
        ? performers.filter(p => p.status === 'available')
        : performers;

    const lowerCaseQuery = searchQuery.toLowerCase().trim();

    return basePerformers.filter(p => {
       const categoryMatch = !categoryFilter || p.service_ids.some(id => {
            const service = allServices.find(s => s.id === id);
            return service && service.category === categoryFilter;
       });
       const availabilityMatch = view === 'available_now' || !availabilityFilter || p.status === availabilityFilter;

       const searchMatch = !lowerCaseQuery || (
           p.name.toLowerCase().includes(lowerCaseQuery) ||
           p.tagline.toLowerCase().includes(lowerCaseQuery) ||
           p.service_ids.some(id => {
               const service = allServices.find(s => s.id === id);
               return service && service.name.toLowerCase().includes(lowerCaseQuery);
           })
       );

       return categoryMatch && availabilityMatch && searchMatch;
    });
  }, [performers, categoryFilter, availabilityFilter, view, searchQuery]);

    // --- Interactive Walkthrough Logic ---
    const tourSteps: WalkthroughStep[] = [
        { elementSelector: '[data-tour-id="gallery-tabs"]', title: "Welcome! The Client Gallery", content: "This is what your clients see: a clean, professional gallery. Let's walk through a booking from their perspective.", position: 'bottom' },
        { elementSelector: '[data-tour-id="performer-card-5"]', title: "Selecting Performers", content: "Clients can select one or multiple performers for their event. We'll select April for this demo.", before: () => {
            const april = performers.find(p => p.id === 5);
            if (april) handleTogglePerformerSelection(april);
        }, position: 'bottom' },
        { elementSelector: '[data-tour-id="book-button"]', title: "Secure Booking Form", content: "Once selected, they proceed to our multi-step booking form which captures all necessary details, including ID for new clients.", position: 'bottom' },
        { elementSelector: '[data-tour-id="nav-admin-dashboard"]', title: "The Admin Dashboard", content: "Now, let's switch to your view. The Admin Dashboard is your command center for the entire business.", before: async () => {
            await api.resetDemoData(); // Reset data for a clean tour
            await fetchData();
            setView('admin_dashboard');
            setUserProfile({ id: 'admin-uuid', role: 'admin' });
        }, position: 'bottom' },
        { elementSelector: '[data-tour-id="admin-stats"]', title: "Business At a Glance", content: "Key metrics give you a real-time overview of total bookings, confirmed events, and critical pending actions.", position: 'bottom' },
        { elementSelector: '[data-tour-id="dns-approve-dns-2"]', title: "Proactive Safety: DNS Vetting", content: "This is our core safety feature. A 'Do Not Serve' submission from a performer lands here. Approving it protects your talent.", before: () => {
            document.querySelector('[data-tour-id="admin-dns-pending"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, position: 'top' },
        { elementSelector: '[data-tour-id="admin-booking-management"]', title: "Automated Booking Pipeline", content: "All bookings flow through an automated pipeline. Let's find one that a performer has accepted and is now waiting for your review.", before: async () => {
            await handleUpdateDoNotServeStatus('dns-2', 'approved');
            document.querySelector('[data-tour-id="admin-booking-management"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, position: 'bottom' },
        { elementSelector: '[data-tour-id="admin-approve-vetting-9c5e3f5b-b9d1-4a2e-8c6f-7d1a2b3c4d5e"]', title: "Step 1: Admin Vetting", content: "You review the client's details. With one click, you approve the booking to proceed. The system automatically notifies the client to pay their deposit.", before: async () => {
            // Simulate performer accepting
            await api.updateBookingStatus('9c5e3f5b-b9d1-4a2e-8c6f-7d1a2b3c4d5e', 'pending_vetting');
            await fetchData();
        }, position: 'bottom' },
        { elementSelector: '[data-tour-id="admin-confirm-deposit-9c5e3f5b-b9d1-4a2e-8c6f-7d1a2b3c4d5e"]', title: "Step 2: Deposit Confirmation", content: "Once the client pays, you verify it here. This click locks in the booking and sends detailed confirmations to both client and performer.", before: async () => {
            await handleUpdateBookingStatus('9c5e3f5b-b9d1-4a2e-8c6f-7d1a2b3c4d5e', 'pending_deposit_confirmation');
        }, position: 'top' },
        { elementSelector: '[data-tour-id="admin-confirmed-booking-9c5e3f5b-b9d1-4a2e-8c6f-7d1a2b3c4d5e"]', title: "Booking Confirmed!", content: "The booking is now confirmed and all parties are notified. The entire process is automated, secure, and tracked.", before: async () => {
            await handleUpdateBookingStatus('9c5e3f5b-b9d1-4a2e-8c6f-7d1a2b3c4d5e', 'confirmed');
        }, position: 'top' },
        { elementSelector: '[data-tour-id="reassign-booking-a1b2c3d4-e5f6-7890-1234-567890abcdef"]', title: "Powerful Exception Handling", content: "Need to make a change? You can instantly reassign a booking to another performer. The system handles all notifications automatically.", position: 'top' },
        { elementSelector: '[data-tour-id="nav-performer-view"]', title: "The Performer's View", content: "Now, let's see what your talent sees. You can switch to any performer's view without needing their password for support or oversight.", before: () => {
            setView('performer_dashboard');
            setCurrentPerformerIdForAdmin(1); // Scarlett
        }, position: 'bottom' },
        { elementSelector: '[data-tour-id="pay-referral-fee-bfa3e8a7-58d6-44b1-8798-294956e105b6"]', title: "Closing the Financial Loop", content: "After an event, the system tracks referral fees. Performers are prompted to pay, completing the automated financial cycle.", before: () => {
            setView('performer_dashboard');
            setCurrentPerformerIdForAdmin(1); // Scarlett has a confirmed booking
            document.querySelector('[data-tour-id="pay-referral-fee-bfa3e8a7-58d6-44b1-8798-294956e105b6"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, position: 'top' },
        { elementSelector: '[data-tour-id="performer-availability"]', title: "Managing Availability", content: "Performers can instantly update their availability, which is reflected on the client-facing gallery in real-time.", position: 'bottom' },
        { elementSelector: '[data-tour-id="header-logo"]', title: "End-to-End Automation", content: "From client request to final payment, this platform reduces admin time, enhances safety, and provides a premium experience. This concludes our tour!", before: async () => {
             await api.resetDemoData();
             await fetchData();
             setView('available_now');
             setUserProfile(null);
        }, position: 'bottom' }
    ];

    const startWalkthrough = () => setWalkthrough({ isActive: true, step: 0 });
    const endWalkthrough = async () => {
      setWalkthrough({ isActive: false, step: 0 });
      // Reset state after tour ends for a clean slate
      await api.resetDemoData();
      await fetchData();
      setView('available_now');
      setUserProfile(null);
      setSelectedForBooking([]);
    };
    
    const handleNextStep = async () => {
        const nextStepIndex = walkthrough.step + 1;
        if (nextStepIndex < tourSteps.length) {
            const nextStep = tourSteps[nextStepIndex];
            if (nextStep.before) {
                await nextStep.before();
            }
            setWalkthrough(prev => ({ ...prev, step: nextStepIndex }));
        } else {
            endWalkthrough();
        }
    };
    const handlePrevStep = async () => {
        const prevStepIndex = walkthrough.step - 1;
        if (prevStepIndex >= 0) {
             const prevStep = tourSteps[prevStepIndex];
            if (prevStep.before) {
                await prevStep.before();
            }
            setWalkthrough(prev => ({ ...prev, step: prevStepIndex }));
        }
    };


  if (isAuthLoading) {
     return (
        <div className="fixed inset-0 bg-zinc-900 flex flex-col items-center justify-center text-zinc-400">
            <LoaderCircle className="w-16 h-16 animate-spin text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold text-zinc-200">Connecting...</h2>
        </div>
     )
  }
  
  if (!ageVerified) {
    return <AgeGate onVerified={handleAgeVerified} onShowPrivacyPolicy={handleShowPrivacyPolicy} onShowTermsOfService={handleShowTermsOfService} />;
  }

  const renderContent = () => {
    if (isLoading && !['auth'].includes(view)) {
       return (
         <div className="flex flex-col items-center justify-center p-12 text-zinc-400">
            <LoaderCircle className="w-16 h-16 animate-spin text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold text-zinc-200">Loading Talent...</h2>
            <p>Please wait a moment.</p>
         </div>
       );
    }
    
    if (error) {
        return <div className="text-center p-8 bg-red-900/50 border border-red-500 rounded-lg text-white max-w-4xl mx-auto"><h2 className="text-xl font-bold">An Error Occurred</h2><p className="mt-2 text-red-200">{error}</p></div>;
    }

    switch (view) {
      case 'auth':
        return <Auth onBack={() => setView('available_now')} />;
      case 'profile':
        return viewedPerformer && <PerformerProfile performer={viewedPerformer} onBack={handleReturnToGallery} onBook={handleBookSinglePerformer} />;
      case 'booking':
        const approvedDNS = doNotServeList.filter(e => e.status === 'approved');
        return selectedForBooking.length > 0 && (
            <BookingProcess
                performers={selectedForBooking}
                onBack={handleReturnToGallery}
                onBookingSubmitted={handleBookingSubmitted}
                bookings={bookings}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onBookingRequest={handleBookingRequest}
                doNotServeList={approvedDNS}
                addCommunication={addCommunication}
                onShowPrivacyPolicy={handleShowPrivacyPolicy}
                onShowTermsOfService={handleShowTermsOfService}
            />
        );
      case 'user_settings':
        return <UserSettings 
                  settings={notificationSettings} 
                  onSettingsChange={handleNotificationSettingsChange} 
                  onBack={handleReturnToGallery} 
                />
      case 'services_page':
        return <ServicesPage onBack={handleReturnToGallery} />;
      case 'admin_dashboard':
         if (userProfile?.role !== 'admin' && !walkthrough.isActive) return <p>Access Denied</p>;
        return <AdminDashboard 
            bookings={bookings} 
            performers={performers} 
            doNotServeList={doNotServeList} 
            onUpdateBookingStatus={handleUpdateBookingStatus} 
            onUpdateDoNotServeStatus={handleUpdateDoNotServeStatus} 
            onViewDoNotServe={handleViewDoNotServe} 
            communications={communications} 
            onAdminDecisionForPerformer={handleAdminBookingDecisionForPerformer}
            onAdminChangePerformer={handleAdminChangePerformer}
          />;
      case 'performer_dashboard':
        if (!['performer', 'admin'].includes(userProfile?.role || '') && !walkthrough.isActive) return <p>Access Denied</p>;
        const currentPerformerId = (userProfile?.role === 'performer' && userProfile.performer_id) 
            ? userProfile.performer_id 
            : currentPerformerIdForAdmin;

        const currentPerformer = performers.find(p => p.id === currentPerformerId);
        const performerBookings = bookings.filter(b => b.performer_id === currentPerformerId);
        const performerCommunications = communications.filter(c => c.recipient === currentPerformerId);
        return currentPerformer ? <PerformerDashboard performer={currentPerformer} bookings={performerBookings} communications={performerCommunications} onToggleStatus={(status) => handlePerformerStatusChange(currentPerformer.id, status)} onViewDoNotServe={handleViewDoNotServe} onBookingDecision={handlePerformerBookingDecision} onReferralFeePaid={handleReferralFeePaid} /> : <p className="text-center text-gray-400">Select a performer to view their dashboard.</p>;
      case 'do_not_serve':
         const performerIdForDns = (userProfile?.role === 'performer') ? userProfile.performer_id : currentPerformerIdForAdmin;
        const performerSubmitting = performers.find(p => p.id === performerIdForDns);
        return <DoNotServe 
                  role={viewRole}
                  currentPerformer={performerSubmitting}
                  doNotServeList={doNotServeList}
                  onBack={handleBackToDashboard}
                  onCreateEntry={handleCreateDoNotServeEntry}
                  addCommunication={addCommunication}
               />
      // FIX: Combined calendar_view with gallery views to fix type error and share tab navigation.
      case 'available_now':
      case 'future_bookings':
      case 'calendar_view':
      default:
        const isAvailableNow = view === 'available_now';
        return (
          <div className="animate-fade-in">
             <div className="mb-8 flex justify-center border-b border-zinc-800" data-tour-id="gallery-tabs">
                <button 
                    onClick={() => setView('available_now')}
                    className={`flex items-center gap-2 py-4 px-6 text-sm font-semibold transition-colors ${view === 'available_now' ? 'border-b-2 border-orange-500 text-orange-400' : 'border-b-2 border-transparent text-zinc-400 hover:text-white'}`}
                >
                    <Clock size={16} /> Available Now
                </button>
                <button
                    onClick={() => setView('future_bookings')}
                    className={`flex items-center gap-2 py-4 px-6 text-sm font-semibold transition-colors ${view === 'future_bookings' ? 'border-b-2 border-orange-500 text-orange-400' : 'border-b-2 border-transparent text-zinc-400 hover:text-white'}`}
                >
                    <CalendarCheck size={16} /> Book for Future
                </button>
                {['admin', 'performer'].includes(userProfile?.role || '') && (
                  <button
                      onClick={() => setView('calendar_view')}
                      className={`flex items-center gap-2 py-4 px-6 text-sm font-semibold transition-colors ${view === 'calendar_view' ? 'border-b-2 border-orange-500 text-orange-400' : 'border-b-2 border-transparent text-zinc-400 hover:text-white'}`}
                  >
                      <Calendar size={16} /> Events Calendar
                  </button>
                )}
            </div>

            {view === 'calendar_view' ? (
              !['admin', 'performer'].includes(userProfile?.role || '') ? (
                <p className="text-center text-xl text-zinc-400">Access Denied. This view is for performers and administrators only.</p>
              ) : (
                <CalendarView bookings={bookings} onBack={handleBackToDashboard} />
              )
            ) : (
              <>
                <div className="text-center mb-12">
                  <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                    {isAvailableNow ? 'Available Now' : 'Schedule a Future Booking'}
                  </h1>
                  <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                    {isAvailableNow
                        ? "These performers are online and ready for immediate bookings."
                        : "Browse all professionals. Select one or more to begin your booking for a future date."
                    }
                  </p>
                </div>
                <div className={`mb-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl max-w-2xl mx-auto grid grid-cols-1 ${!isAvailableNow ? 'md:grid-cols-2' : ''} gap-4`}>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                    <select onChange={(e) => setCategoryFilter(e.target.value)} value={categoryFilter} className="input-base input-with-icon appearance-none">
                      <option value="">All Service Categories</option>
                      {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
                  </div>
                  {!isAvailableNow && (
                  <div className="relative">
                    <Radio className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                    <select onChange={(e) => setAvailabilityFilter(e.target.value as PerformerStatus | '')} value={availabilityFilter} className="input-base input-with-icon appearance-none">
                      <option value="">All Availabilities</option>
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="offline">Offline</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
                  </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {filteredPerformers.map((performer) => (
                    <PerformerCard
                      key={performer.id}
                      performer={performer}
                      onViewProfile={handleViewProfile}
                      onToggleSelection={handleTogglePerformerSelection}
                      isSelected={selectedForBooking.some(p => p.id === performer.id)}
                      tourId={`performer-card-${performer.id}`}
                    />
                  ))}
                </div>
                {filteredPerformers.length === 0 && !isLoading && (
                  <div className="text-center col-span-full py-12">
                      <p className="text-zinc-500">
                        {searchQuery ? `No performers match your search for "${searchQuery}".` : 'No performers match the current filters.'}
                      </p>
                  </div>
                )}
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
       <Header
        view={view}
        onNavigate={handleNavigation}
        userProfile={userProfile}
        communications={communications}
        onMarkRead={handleMarkCommunicationsRead}
        onShowPresentation={handleShowPresentation}
        onStartWalkthrough={startWalkthrough}
        onViewUserSettings={handleViewUserSettings}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        session={session}
        onSignInClick={handleSignInClick}
        onSignOut={async () => {
            const { error } = await api.signOut();
            if (error) setError("Failed to sign out.");
        }}
        performers={performers}
        currentPerformerIdForAdmin={currentPerformerIdForAdmin}
        onPerformerChangeForAdmin={setCurrentPerformerIdForAdmin}
      >
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">Demo Mode</span>
          {viewRole === 'user' && selectedForBooking.length > 0 && (
             <button
              onClick={handleProceedToBooking}
              className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
              data-tour-id="book-button"
            >
              <ShoppingCart className="h-4 w-4" />
              Book ({selectedForBooking.length})
            </button>
          )}
        </div>
      </Header>
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {renderContent()}
      </main>
      <Footer onShowPrivacyPolicy={handleShowPrivacyPolicy} onShowTermsOfService={handleShowTermsOfService} onShowServicesPage={handleShowServicesPage} />
      {phoneMessage && <DemoPhone message={phoneMessage} onClose={() => setPhoneMessage(null)} />}
      {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
      {showTermsOfService && <TermsOfService onClose={() => setShowTermsOfService(false)} />}
      {showPresentation && <PresentationVideo onClose={() => setShowPresentation(false)} />}
      <InteractiveWalkthrough 
        isActive={walkthrough.isActive}
        steps={tourSteps}
        currentStepIndex={walkthrough.step}
        onNext={handleNextStep}
        onPrev={handlePrevStep}
        onEnd={endWalkthrough}
      />
    </div>
  );
};

export default App;