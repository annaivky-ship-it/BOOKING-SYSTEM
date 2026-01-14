
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingCart, LoaderCircle, CalendarCheck, Zap, Star, ShieldCheck, Clock, Users } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import PerformerProfile from './components/EntertainerProfile';
import AgeGate from './components/AgeGate';
import BookingProcess, { BookingFormState } from './components/BookingProcess';
import PerformerDashboard from './components/PerformerDashboard';
import AdminDashboard from './components/AdminDashboard';
import DoNotServe from './components/DoNotServe';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import UserSettings from './components/UserSettings';
import Auth from './components/Auth';
import PerformerRegistration from './components/PerformerRegistration';
import ServicesPage from './components/ServicesPage';
import ContactUs, { ContactFormData } from './components/ContactUs';
import HowItWorks from './components/HowItWorks';
import PerformerGallery from './components/PerformerGallery';
import { api } from './services/api';
import type { Performer, Booking, Role, PerformerStatus, BookingStatus, DoNotServeEntry, DoNotServeStatus, Communication, Profile } from './types';
import { calculateBookingCost } from './utils/bookingUtils';
import type { Session } from 'https://esm.sh/@supabase/supabase-js@^2.44.4';

type GalleryView = 'available_now' | 'future_bookings';

interface NotificationSettings {
    bookingUpdates: boolean;
    confirmations: boolean;
}

const App: React.FC = () => {
  const [ageVerified, setAgeVerified] = useState(false);
  const [view, setView] = useState<GalleryView | 'profile' | 'booking' | 'performer_dashboard' | 'admin_dashboard' | 'do_not_serve' | 'user_settings' | 'auth' | 'performer_registration' | 'services_page' | 'contact_us'>('available_now');
  const [bookingOrigin, setBookingOrigin] = useState<GalleryView | 'admin_dashboard'>('available_now');
  const [viewedPerformer, setViewedPerformer] = useState<Performer | null>(null);
  const [selectedForBooking, setSelectedForBooking] = useState<Performer[]>([]);
  const [viewRole, setViewRole] = useState<Role>('user');
  const [bookingPreferAsap, setBookingPreferAsap] = useState(true);
  
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [doNotServeList, setDoNotServeList] = useState<DoNotServeEntry[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPerformerIdForAdmin, setCurrentPerformerIdForAdmin] = useState<number | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    bookingUpdates: true,
    confirmations: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isAutoVetEnabled, setIsAutoVetEnabled] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
        const { data: { session }, error } = await api.getSession();
        if (error) {
            console.error('Session retrieval error:', error);
            setError('System authentication unavailable.');
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

  useEffect(() => {
    if (session?.user) {
      setIsLoading(true);
      api.getProfile(session.user).then(({ data, error }) => {
        if (error) {
          setError("Profile data currently inaccessible.");
          console.error(error);
        } else {
          setUserProfile(data);
          const newRole = data?.role || 'user';
          setViewRole(newRole); 
           if (newRole === 'admin') setView('admin_dashboard');
           else if (newRole === 'performer') setView('performer_dashboard');
           else setView('available_now');
        }
        setIsLoading(false);
      });
    } else {
      setUserProfile(null);
      setViewRole('user');
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

  const handleShowPrivacyPolicy = () => {
    window.scrollTo(0, 0);
    setShowPrivacyPolicy(true);
  };
  
  const handleShowTermsOfService = () => {
    window.scrollTo(0, 0);
    setShowTermsOfService(true);
  };
  
  const handleShowServicesPage = () => {
    window.scrollTo(0, 0);
    setView('services_page');
  };

  const handleShowContactUs = () => {
    window.scrollTo(0, 0);
    setView('contact_us');
  };

  const addCommunication = useCallback(async (commData: Omit<Communication, 'id' | 'created_at' | 'read'>) => {
    if (commData.recipient === 'user') {
        if (commData.type === 'booking_update' && !notificationSettings.bookingUpdates) {
            return;
        }
        if (commData.type === 'booking_confirmation' && !notificationSettings.confirmations) {
            return;
        }
    }
    
    const tempId = `temp-${Date.now()}`;
    const newComm: Communication = { ...commData, id: tempId, created_at: new Date().toISOString(), read: false };
    setCommunications(prev => [newComm, ...prev]);

    try {
        const { data, error } = await api.addCommunication(commData);
        if (error) throw error;
        setCommunications(prev => prev.map(c => c.id === tempId ? data![0] : c));
    } catch (err) {
        console.error("Communication failure:", err);
        setCommunications(prev => prev.filter(c => c.id !== tempId));
    }
  }, [notificationSettings]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { performers, bookings, doNotServeList, communications } = await api.getInitialData();
      if (performers.error) throw new Error(`Agency Error: ${performers.error.message}`);
      setPerformers(performers.data as Performer[] || []);
      if(performers.data && performers.data.length > 0 && !currentPerformerIdForAdmin){
          setCurrentPerformerIdForAdmin(performers.data[0].id);
      }
      if (bookings.error) throw new Error(`Booking Data Error: ${bookings.error.message}`);
      setBookings(bookings.data as Booking[] || []);
      if (doNotServeList.error) throw new Error(`Safety List Error: ${doNotServeList.error.message}`);
      setDoNotServeList(doNotServeList.data as DoNotServeEntry[] || []);
      if (communications.error) throw new Error(`Message Registry Error: ${communications.error.message}`);
      setCommunications(communications.data as Communication[] || []);
    } catch (err: any) {
      setError(`Operational data retrieval failed: ${err.message}.`);
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
    const performerName = performers.find(p => p.id === performerId)?.name || 'Performer';
    const originalPerformers = performers;
    setPerformers(prev => prev.map(p => p.id === performerId ? { ...p, status } : p));
    try {
        const { error } = await api.updatePerformerStatus(performerId, status);
        if (error) throw error;
        addCommunication({ sender: 'System', recipient: 'admin', message: `Status Update: ${performerName} is now ${status}.`, type: 'admin_message' });
    } catch (err) {
        console.error("Status update error:", err);
        setPerformers(originalPerformers); 
        setError("Status update failed.");
    }
  };

  const handleCreatePerformer = async (data: Omit<Performer, 'id' | 'created_at'>) => {
      try {
          const { data: newPerformers, error } = await api.createPerformer(data);
          if (error) throw error;
          if (newPerformers) {
              setPerformers(prev => [...newPerformers, ...prev]);
              addCommunication({ sender: 'System', recipient: 'admin', message: `Profile Activated: ${data.name} added to roster.`, type: 'admin_message' });
          }
      } catch (err) {
          console.error("Profile initialisation error:", err);
          setError("Failed to initialise profile.");
      }
  };

  const handleUpdatePerformer = async (id: number, updates: Partial<Performer>) => {
      try {
          const { data: updatedPerformers, error } = await api.updatePerformerProfile(id, updates);
          if (error) throw error;
          if (updatedPerformers) {
              setPerformers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
              addCommunication({ sender: 'System', recipient: 'admin', message: `Profile Update: ${updates.name || 'Professional'} profile modified.`, type: 'admin_message' });
          }
      } catch (err) {
          console.error("Profile update error:", err);
          setError("Failed to update roster record.");
      }
  };

  const handleDeletePerformer = async (id: number) => {
      try {
          const { success, error } = await api.deletePerformer(id);
          if (error || !success) throw error;
          setPerformers(prev => prev.filter(p => p.id !== id));
          addCommunication({ sender: 'System', recipient: 'admin', message: `Profile Deactivated: Performer ID #${id} removed.`, type: 'admin_message' });
      } catch (err) {
          console.error("Profile removal error:", err);
          setError("Failed to remove profile.");
      }
  };
  
  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const originalBookings = bookings;
    const booking = originalBookings.find(b => b.id === bookingId);
    if (!booking) return;

    let updatedBookingData: Partial<Booking> = { status };
    if (status === 'confirmed') {
        updatedBookingData = { ...updatedBookingData, verified_by_admin_name: 'Agency Review', verified_at: new Date().toISOString() };
    }
    const updatedBookings = originalBookings.map(b => b.id === bookingId ? { ...b, ...updatedBookingData } : b);
    setBookings(updatedBookings);

    try {
      const { error } = await api.updateBookingStatus(bookingId, status, updatedBookingData);
      if (error) throw error;
      const { totalCost, depositAmount } = calculateBookingCost(booking.duration_hours, booking.services_requested, 1);
      const finalBalance = totalCost - depositAmount;
      if (status !== 'confirmed') {
        const clientMessage = {
          deposit_pending: `Confirmation: Booking for ${booking.performer?.name} cleared. Secure your date via deposit.`,
          pending_deposit_confirmation: `Notice: Payment received. Final verification in progress.`,
          rejected: `Notice: Request declined. The requested time for ${booking.event_type} is currently unavailable.`,
        }[status as 'deposit_pending' | 'pending_deposit_confirmation' | 'rejected'];
        if (clientMessage) addCommunication({ sender: 'System', recipient: 'user', message: clientMessage, booking_id: bookingId, type: 'booking_update' });
      }
      if (status === 'confirmed') {
        addCommunication({ sender: 'System', recipient: 'user', message: `Confirmed! Your booking with ${booking.performer?.name} is locked in. Balance of $${finalBalance.toFixed(2)} due upon arrival. Date: ${new Date(booking.event_date).toLocaleDateString('en-AU')}.`, booking_id: bookingId, type: 'booking_confirmation' });
        addCommunication({ sender: 'System', recipient: booking.performer_id, message: `Booking Confirmed: Security deposit received for ${new Date(booking.event_date).toLocaleDateString('en-AU')}. Location: ${booking.event_address}. Contact: ${booking.client_phone}.`, booking_id: bookingId, type: 'booking_confirmation' });
      } else {
        const performerMessage = {
            deposit_pending: `New Lead: Engagement from ${booking.client_name} for ${new Date(booking.event_date).toLocaleDateString('en-AU')} awaiting deposit.`,
            rejected: `Status Update: Inquiry from ${booking.client_name} declined or expired.`,
        }[status as 'deposit_pending' | 'rejected'];
        if(performerMessage) addCommunication({ sender: 'System', recipient: booking.performer_id, message: performerMessage, booking_id: bookingId, type: 'booking_update' });
      }
      const adminMessage = {
          pending_deposit_confirmation: `Payment Alert: Remittance uploaded for Booking #${bookingId.slice(0, 8)} (${booking.client_name}).`,
          confirmed: `Success: Booking secured for ${booking.client_name} and ${booking.performer?.name}.`,
          rejected: `Update: Request for ${booking.client_name} terminated.`,
      }[status];
      if (adminMessage) addCommunication({ sender: 'System', recipient: 'admin', message: adminMessage, booking_id: bookingId, type: 'admin_message' });
    } catch (err) {
        console.error("Booking status update failure:", err);
        setBookings(originalBookings);
        setError("Update failed.");
    }
  };

  const handleUpdateBookingDetails = async (bookingId: string, updates: Partial<Booking>) => {
    const originalBookings = bookings;
    const booking = originalBookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));

    try {
        const { error } = await api.updateBookingStatus(bookingId, booking.status, updates);
        if (error) throw error;
    } catch (err) {
        console.error("Detail update failure:", err);
        setBookings(originalBookings);
        setError("Detail update failed.");
    }
  };
  
  const handleUpdateDoNotServeStatus = async (entryId: string, status: DoNotServeStatus) => {
      const entry = doNotServeList.find(e => e.id === entryId);
      if(!entry) return;
      const originalList = doNotServeList;
      // Fixed: setDoNotServeList should be used instead of setBookings to avoid type mismatch
      setDoNotServeList(prev => prev.map(e => e.id === entryId ? { ...e, status } : e));
      try {
        const { error } = await api.updateDoNotServeStatus(entryId, status);
        if (error) throw error;
        const message = `Safety List Update: Entry '${entry.client_name}' changed to ${status}.`;
        addCommunication({ sender: 'System', recipient: 'admin', message, type: 'admin_message' });
        if (entry.submitted_by_performer_id !== 0) {
           addCommunication({ sender: 'System', recipient: entry.submitted_by_performer_id, message, type: 'admin_message' });
        }
      } catch (err) {
        console.error("Safety registry update failure:", err);
        setDoNotServeList(originalList);
        setError("Safety list update failed.");
      }
  }

  const handleCreateDoNotServeEntry = async (newEntryData: Omit<DoNotServeEntry, 'id' | 'created_at' | 'status' | 'performer'>, submitterName: Performer['name']) => {
      try {
        const { data, error } = await api.createDoNotServeEntry(newEntryData);
        if (error) throw error;
        setDoNotServeList(prev => [data![0], ...prev]);
        addCommunication({ sender: submitterName, recipient: 'admin', message: `Safety Alert: New entry for "${newEntryData.client_name}" submitted for review.`, type: 'admin_message' })
      } catch(err) {
          console.error("Safety list submission failure:", err);
          setError("Failed to submit safety entry.");
      }
  };

  const handlePerformerBookingDecision = async (bookingId: string, decision: 'accepted' | 'declined', eta?: number) => {
      const booking = bookings.find(b => b.id === bookingId);
      if(!booking) return;
      
      const performerName = booking.performer?.name || 'Performer';
      
      if (decision === 'declined') {
        await handleUpdateBookingStatus(bookingId, 'rejected');
        addCommunication({ sender: performerName, recipient: 'admin', message: `${performerName} declined the inquiry from ${booking.client_name}.`, type: 'admin_message' });
        addCommunication({ sender: 'System', recipient: 'user', message: `Update: ${performerName} is unavailable for your requested time.`, booking_id: booking.id, type: 'booking_update' });
        return;
      }

      const isBlocked = doNotServeList.some(entry => {
          if (entry.status !== 'approved') return false;
          const emailMatch = booking.client_email && entry.client_email && entry.client_email.trim().toLowerCase() === booking.client_email.trim().toLowerCase();
          const phoneMatch = booking.client_phone && entry.client_phone && entry.client_phone.replace(/\s+/g, '') === booking.client_phone.replace(/\s+/g, '');
          return emailMatch || phoneMatch;
      });

      const isVerifiedBooker = bookings.some(b => b.status === 'confirmed' && b.client_email.toLowerCase() === booking.client_email.toLowerCase());
      const shouldSkipManualVetting = !isBlocked && (isVerifiedBooker || isAutoVetEnabled);
      
      const newStatus = shouldSkipManualVetting ? 'deposit_pending' : 'pending_vetting';
      
      const updateData: Partial<Booking> = { 
          status: newStatus,
          verified_by_admin_name: shouldSkipManualVetting ? 'Verified Client Protocol' : null,
          verified_at: shouldSkipManualVetting ? new Date().toISOString() : null
      };
      
      if (eta && eta > 0) updateData.performer_eta_minutes = eta;
      
      const originalBookings = bookings;
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updateData } : b));
      
      try {
        const { error } = await api.updateBookingStatus(bookingId, newStatus, updateData);
        if (error) throw error;
        
        const etaMessagePartAdmin = eta && eta > 0 ? ` with a projected arrival of ${eta} mins` : '';
        const etaMessagePartUser = eta && eta > 0 ? ` Estimated arrival window: approximately ${eta} minutes.` : '';
        
        if (shouldSkipManualVetting) {
          addCommunication({ sender: performerName, recipient: 'admin', message: `${performerName} accepted ${booking.client_name}${etaMessagePartAdmin}. Verified protocol active.`, type: 'admin_message' });
          addCommunication({ sender: 'System', recipient: 'user', message: `Great news! Your request is approved. ${performerName} is available.${etaMessagePartUser} Pay deposit to confirm.`, booking_id: booking.id, type: 'booking_update' });
        } else {
          if (isBlocked) {
              addCommunication({ sender: 'System', recipient: 'admin', message: `SAFETY ALERT: ${performerName} accepted ${booking.client_name}, but a safety match was detected. Held for review.`, type: 'system_alert' });
          }
          addCommunication({ sender: performerName, recipient: 'admin', message: `${performerName} accepted ${booking.client_name}${etaMessagePartAdmin}. Awaiting agency review.`, type: 'admin_message' });
          addCommunication({ sender: 'System', recipient: 'user', message: `Update: ${performerName} is available. Our agency is performing a final discretion check.`, booking_id: booking.id, type: 'booking_update' });
        }
      } catch (err) {
          console.error("Decision processing failure:", err);
          setBookings(originalBookings);
          setError("Booking decision processing failed.");
      }
  };
  
  const handleAdminBookingDecisionForPerformer = async (bookingId: string, decision: 'accepted' | 'declined') => {
      const booking = bookings.find(b => b.id === bookingId);
      if(!booking) return;
      addCommunication({ sender: 'Admin', recipient: booking.performer_id, message: `Agency Notice: The booking for ${booking.client_name} was marked as ${decision}.`, type: 'booking_update' });
      await handlePerformerBookingDecision(bookingId, decision, undefined);
  }

  const handleAdminChangePerformer = async (bookingId: string, newPerformerId: number) => {
    const booking = bookings.find(b => b.id === bookingId);
    const newPerformer = performers.find(p => p.id === newPerformerId);
    if (!booking || !newPerformer) return;
    const oldPerformerId = booking.performer_id;
    const oldPerformerName = booking.performer?.name || 'Previous Performer';
    const updates: Partial<Booking> = { performer_id: newPerformerId, status: 'pending_performer_acceptance', performer_reassigned_from_id: oldPerformerId };
    const originalBookings = bookings;
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates, performer: { id: newPerformerId, name: newPerformer.name } } : b));
    try {
        const { error } = await api.updateBookingStatus(bookingId, 'pending_performer_acceptance', updates);
        if(error) throw error;
        addCommunication({ sender: 'Admin', recipient: 'admin', message: `Update: Booking for ${booking.client_name} reassigned from ${oldPerformerName} to ${newPerformer.name}.`, type: 'admin_message' });
        addCommunication({ sender: 'Admin', recipient: 'user', message: `Agency Notice: ${newPerformer.name} is now assigned to your request. Waiting for confirmation.`, booking_id: booking.id, type: 'booking_update' });
        addCommunication({ sender: 'Admin', recipient: oldPerformerId, message: `Update: Your booking for ${booking.client_name} has been reassigned.`, booking_id: booking.id, type: 'booking_update' });
        addCommunication({ sender: 'Admin', recipient: newPerformerId, message: `New Request: Inbound inquiry for ${booking.client_name}. Confirm availability in your portal.`, booking_id: booking.id, type: 'booking_update' });
    } catch (err) {
        console.error("Reassignment failure:", err);
        setBookings(originalBookings);
        setError("Reassignment failed.");
    }
  };
  
  const handleReferralFeePaid = async (bookingId: string, feeAmount: number, receiptFile: File) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    const receiptPath = `referral-receipts/receipt-${bookingId.slice(0, 8)}-${receiptFile.name}`;
    const originalBookings = bookings;
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, referral_fee_paid: true, referral_fee_amount: feeAmount, referral_fee_receipt_path: receiptPath } : b));
    try {
        const { error } = await api.updateReferralFeeStatus(bookingId, feeAmount, receiptPath);
        if (error) throw error;
        addCommunication({ sender: booking.performer?.name || 'Professional', recipient: 'admin', message: `Agency Notice: ${booking.performer?.name} settled the referral fee for ${booking.client_name}.`, booking_id: bookingId, type: 'admin_message' });
    } catch(err) {
        console.error("Referral fee update failure:", err);
        setBookings(originalBookings);
        setError("Remittance submission failed.");
    }
  };

  const handleBookingRequest = async (formState: BookingFormState, requestedPerformers: Performer[]) => {
     try {
        const { data: newBookings, error } = await api.createBookingRequest(formState, requestedPerformers);
        if (error) throw error;
        setBookings(prev => [...newBookings!, ...prev]);
        const firstBooking = newBookings![0];
        if (firstBooking.status === 'rejected') {
             addCommunication({ sender: 'System', recipient: 'admin', message: `SECURITY ALERT: Request from ${formState.fullName} blocked due to safety match.`, type: 'system_alert' });
             addCommunication({ sender: 'System', recipient: 'user', message: `Notice: Internal safety protocols prevent us from fulfilling this request.`, booking_id: firstBooking.id, type: 'booking_update' });
        } else {
             addCommunication({ sender: 'System', recipient: 'user', message: `Success: Inquiry transmitted to ${newBookings!.map(b=>b.performer?.name).join(', ')}.`, booking_id: firstBooking.id, type: 'booking_update' });
             addCommunication({ sender: 'System', recipient: 'admin', message: `New Inquiry: Inbound request received from ${formState.fullName}.`, type: 'admin_message' });
        }
        return { success: true, message: 'Request Transmitted', bookingIds: newBookings!.map(b => b.id) };
    } catch(err: any) {
        return { success: false, message: err.message || 'Request transmission failed.' };
    }
  };

  const handleBookingSubmitted = () => {
      fetchData();
      setSelectedForBooking([]);
      setView(bookingOrigin);
  };
  
  const handleMarkCommunicationsRead = () => {
     const currentPerformerId = (userProfile?.role === 'performer') ? userProfile.performer_id : currentPerformerIdForAdmin;
     setCommunications(prev => prev.map(c => {
        const isForAdmin = viewRole === 'admin' && c.recipient === 'admin';
        const isForUser = viewRole === 'user' && c.recipient === 'user';
        const isForPerformer = viewRole === 'performer' && c.recipient === currentPerformerId;
        if (isForAdmin || isForUser || isForPerformer) return { ...c, read: true };
        return c;
     }));
  }

  const handleViewProfile = (performer: Performer) => {
    window.scrollTo(0, 0);
    if (view === 'available_now' || view === 'future_bookings' || view === 'admin_dashboard') setBookingOrigin(view);
    setViewedPerformer(performer);
    setView('profile');
  };
  
  const handleViewDoNotServe = () => setView('do_not_serve');
  const handleViewUserSettings = () => { window.scrollTo(0, 0); setView('user_settings'); };
  const handleBackToDashboard = () => {
      if (userProfile?.role === 'admin') setView('admin_dashboard');
      else if (userProfile?.role === 'performer') setView('performer_dashboard');
      else setView('available_now');
  }

  const handleProceedToBooking = (preferAsap: boolean = false) => {
    if (view === 'available_now' || view === 'future_bookings') setBookingOrigin(view);
    setBookingPreferAsap(preferAsap);
    window.scrollTo(0, 0);
    setView('booking');
  };

  const handleBookSinglePerformer = (performer: Performer, preferAsap: boolean = false) => {
    setSelectedForBooking([performer]);
    handleProceedToBooking(preferAsap);
  };

  const handleTogglePerformerSelection = useCallback((performerToToggle: Performer) => {
    setSelectedForBooking(prev => prev.some(p => p.id === performerToToggle.id) ? prev.filter(p => p.id !== performerToToggle.id) : [...prev, performerToToggle]);
  }, []);

  const handleReturnToGallery = () => { setViewedPerformer(null); setSelectedForBooking([]); setView(bookingOrigin); };
  const handleContactSubmit = async (data: ContactFormData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await addCommunication({ sender: data.name, recipient: 'admin', message: `Support [${data.subject}]: ${data.message}`, type: 'system_alert' });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() !== '' && !['available_now', 'future_bookings'].includes(view)) {
        setView('future_bookings');
    }
  };

  if (isAuthLoading) {
     return <div className="fixed inset-0 bg-zinc-900 flex flex-col items-center justify-center text-zinc-400"><LoaderCircle className="w-16 h-16 animate-spin text-orange-500 mb-4" /><h2 className="text-xl font-semibold text-zinc-200">Securing Connection...</h2></div>
  }
  if (!ageVerified) return <AgeGate onVerified={handleAgeVerified} onShowPrivacyPolicy={handleShowPrivacyPolicy} onShowTermsOfService={handleShowTermsOfService} />;

  const renderContent = () => {
    if (isLoading && !['auth', 'performer_registration'].includes(view)) {
       return <div className="flex flex-col items-center justify-center p-12 text-zinc-400"><LoaderCircle className="w-16 h-16 animate-spin text-orange-500 mb-4" /><h2 className="text-xl font-semibold text-zinc-200">Synchronising Roster...</h2></div>;
    }
    if (error) return <div className="text-center p-8 bg-red-900/50 border border-red-500 rounded-lg text-white max-w-4xl mx-auto"><h2 className="text-xl font-bold">Inquiry Alert</h2><p className="mt-2 text-red-200">{error}</p></div>;

    switch (view) {
      case 'auth': return <Auth onBack={() => setView('available_now')} onRegisterClick={() => setView('performer_registration')} />;
      case 'performer_registration':
        if (registrationSuccess) {
            return <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in"><div className="bg-zinc-900/80 p-10 rounded-2xl border border-zinc-700 max-w-lg"><div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><CalendarCheck className="h-10 w-10 text-green-500" /></div><h2 className="text-3xl font-bold text-white mb-4">Application Sent</h2><p className="text-zinc-400 mb-8">Your profile is currently being reviewed by our agency. You will be notified once approval is granted.</p><button onClick={() => { setRegistrationSuccess(false); setView('auth'); }} className="btn-primary px-8 py-3">Return to Login</button></div></div>;
        }
        return <PerformerRegistration onBack={() => setView('auth')} onSuccess={() => setRegistrationSuccess(true)} />;
      case 'profile': {
        const performerBookings = viewedPerformer ? bookings.filter(b => b.performer_id === viewedPerformer.id) : [];
        const canEditStatus = !!(userProfile && (userProfile.role === 'admin' || (userProfile.role === 'performer' && userProfile.performer_id === viewedPerformer?.id)));
        return viewedPerformer && <PerformerProfile performer={viewedPerformer} onBack={handleReturnToGallery} onBook={handleBookSinglePerformer} isSelected={selectedForBooking.some(p => p.id === viewedPerformer.id)} onToggleSelection={handleTogglePerformerSelection} bookings={performerBookings} canEditStatus={canEditStatus} onStatusChange={(status) => handlePerformerStatusChange(viewedPerformer.id, status)} onUpdateBooking={handleUpdateBookingDetails} />;
      }
      case 'booking': return selectedForBooking.length > 0 && <BookingProcess performers={selectedForBooking} onBack={handleReturnToGallery} onBookingSubmitted={handleBookingSubmitted} bookings={bookings} onUpdateBookingStatus={handleUpdateBookingStatus} onBookingRequest={handleBookingRequest} doNotServeList={doNotServeList.filter(e => e.status === 'approved')} addCommunication={addCommunication} onShowPrivacyPolicy={handleShowPrivacyPolicy} onShowTermsOfService={handleShowTermsOfService} initialPreferAsap={bookingPreferAsap} />;
      case 'user_settings': return <UserSettings settings={notificationSettings} onSettingsChange={handleNotificationSettingsChange} onBack={handleReturnToGallery} />
      case 'services_page': return <ServicesPage onBack={handleReturnToGallery} />;
      case 'contact_us': return <ContactUs onBack={handleReturnToGallery} onSubmit={handleContactSubmit} />;
      case 'admin_dashboard':
         if (userProfile?.role !== 'admin') return <p>Access Restricted: Credentials Required.</p>;
        return <AdminDashboard bookings={bookings} performers={performers} doNotServeList={doNotServeList} onUpdateBookingStatus={handleUpdateBookingStatus} onUpdateDoNotServeStatus={handleUpdateDoNotServeStatus} onViewDoNotServe={handleViewDoNotServe} communications={communications} onAdminDecisionForPerformer={handleAdminBookingDecisionForPerformer} onAdminChangePerformer={handleAdminChangePerformer} onViewPerformer={handleViewProfile} isAutoVetEnabled={isAutoVetEnabled} onToggleAutoVet={(enabled) => setIsAutoVetEnabled(enabled)} onAddPerformer={handleCreatePerformer} onUpdatePerformer={handleUpdatePerformer} onDeletePerformer={handleDeletePerformer} />;
      case 'performer_dashboard': {
        if (!['performer', 'admin'].includes(userProfile?.role || '')) return <p>Access Restricted: Professional Login Required.</p>;
        const currentPerformerId = (userProfile?.role === 'performer' && userProfile.performer_id) ? userProfile.performer_id : currentPerformerIdForAdmin;
        const currentPerformer = performers.find(p => p.id === currentPerformerId);
        return currentPerformer ? <PerformerDashboard performer={currentPerformer} bookings={bookings.filter(b => b.performer_id === currentPerformerId)} communications={communications.filter(c => c.recipient === currentPerformerId)} onToggleStatus={(status) => handlePerformerStatusChange(currentPerformer.id, status)} onViewDoNotServe={handleViewDoNotServe} onBookingDecision={handlePerformerBookingDecision} onReferralFeePaid={handleReferralFeePaid} /> : <p className="text-center text-zinc-400">Select professional profile.</p>;
      }
      case 'do_not_serve':
         const performerIdForDns = (userProfile?.role === 'performer') ? userProfile.performer_id : currentPerformerIdForAdmin;
        return <DoNotServe role={viewRole} currentPerformer={performers.find(p => p.id === performerIdForDns)} doNotServeList={doNotServeList} onBack={handleBackToDashboard} onCreateEntry={handleCreateDoNotServeEntry} addCommunication={addCommunication} />
      case 'available_now':
      case 'future_bookings':
      default:
        const isAvailableNow = view === 'available_now';
        const onlineCount = performers.filter(p => p.status === 'available').length;

        return (
          <div className="animate-fade-in">
             <div className="py-12 md:py-24 text-center max-w-4xl mx-auto px-4">
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full mb-8">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{onlineCount} Performers Active: Available for Immediate Service</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-logo-main text-white uppercase tracking-tighter leading-[0.8] mb-8">
                  Western Australia's <span className="text-orange-500">Elite Talent</span>
                </h1>
                <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-12">
                  Connecting you with Perth's most exclusive professional entertainers. Premium service, absolute discretion, and guaranteed excellence.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={() => setView('available_now')}
                      className={`btn-primary !px-10 !py-4 flex items-center gap-3 transition-all ${isAvailableNow ? 'ring-2 ring-orange-500 ring-offset-4 ring-offset-zinc-900' : 'opacity-80'}`}
                    >
                      <Zap size={20} className={isAvailableNow ? "animate-pulse" : ""} />
                      BOOK NOW
                    </button>
                    <button 
                      onClick={() => setView('future_bookings')}
                      className={`px-10 py-4 rounded-xl border font-black text-[11px] uppercase tracking-widest transition-all ${!isAvailableNow ? 'bg-white/10 text-white border-white/20 ring-2 ring-white/10 ring-offset-4 ring-offset-zinc-900' : 'bg-white/5 text-zinc-400 border-white/5 hover:text-white'}`}
                    >
                      <CalendarCheck size={20} className="inline mr-2" />
                      RESERVE A FUTURE DATE
                    </button>
                </div>
             </div>

             <HowItWorks />

            <PerformerGallery
              performers={performers}
              onViewProfile={handleViewProfile}
              onToggleSelection={handleTogglePerformerSelection}
              onBook={handleBookSinglePerformer}
              onProceedToBooking={handleProceedToBooking}
              selectedIds={selectedForBooking.map(p => p.id)}
              searchQuery={searchQuery}
              viewMode={isAvailableNow ? 'available_now' : 'future_bookings'}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
       <Header view={view} onNavigate={handleNavigation} userProfile={userProfile} communications={communications} onMarkRead={handleMarkCommunicationsRead} onViewUserSettings={handleViewUserSettings} searchQuery={searchQuery} onSearchChange={handleSearchChange} session={session} onSignInClick={handleSignInClick} onSignOut={async () => { const { error } = await api.signOut(); if (error) setError("Sign out error."); }} performers={performers} currentPerformerIdForAdmin={currentPerformerIdForAdmin} onPerformerChangeForAdmin={setCurrentPerformerIdForAdmin} >
        <div className="flex items-center gap-4">{viewRole === 'user' && selectedForBooking.length > 0 && (<button onClick={() => handleProceedToBooking(false)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2 uppercase font-black tracking-widest"><ShoppingCart className="h-4 w-4" />Review Inquiry ({selectedForBooking.length})</button>)}</div>
      </Header>
      <main className="flex-grow container mx-auto px-4 py-2 md:py-6">{renderContent()}</main>
      <Footer onShowPrivacyPolicy={handleShowPrivacyPolicy} onShowTermsOfService={handleShowTermsOfService} onShowServicesPage={handleShowServicesPage} onShowContactUs={handleShowContactUs} />
      {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
      {showTermsOfService && <TermsOfService onClose={() => setShowTermsOfService(false)} />}
    </div>
  );
};

export default App;
