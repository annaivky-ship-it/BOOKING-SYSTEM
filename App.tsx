
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
  const [bookingPreferAsap, setBookingPreferAsap] = useState(true); // Default to ASAP
  
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
        console.error("Failed to add communication:", err);
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
    setPerformers(prev => prev.map(p => p.id === performerId ? { ...p, status } : p));
    try {
        const { error } = await api.updatePerformerStatus(performerId, status);
        if (error) throw error;
        addCommunication({ sender: 'System', recipient: 'admin', message: `${performerName}'s status changed to ${status}.`, type: 'admin_message' });
    } catch (err) {
        console.error("Failed to update status:", err);
        setPerformers(originalPerformers); 
        setError("Could not update status.");
    }
  };

  const handleCreatePerformer = async (data: Omit<Performer, 'id' | 'created_at'>) => {
      try {
          const { data: newPerformers, error } = await api.createPerformer(data);
          if (error) throw error;
          if (newPerformers) {
              setPerformers(prev => [...newPerformers, ...prev]);
              addCommunication({ sender: 'System', recipient: 'admin', message: `Talent Created: ${data.name} has been added to the roster.`, type: 'admin_message' });
          }
      } catch (err) {
          console.error("Create performer failed:", err);
          setError("Failed to add talent profile.");
      }
  };

  const handleUpdatePerformer = async (id: number, updates: Partial<Performer>) => {
      try {
          const { data: updatedPerformers, error } = await api.updatePerformerProfile(id, updates);
          if (error) throw error;
          if (updatedPerformers) {
              setPerformers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
              addCommunication({ sender: 'System', recipient: 'admin', message: `Talent Updated: ${updates.name || 'Profile'} has been modified.`, type: 'admin_message' });
          }
      } catch (err) {
          console.error("Update performer failed:", err);
          setError("Failed to update talent profile.");
      }
  };

  const handleDeletePerformer = async (id: number) => {
      try {
          const { success, error } = await api.deletePerformer(id);
          if (error || !success) throw error;
          setPerformers(prev => prev.filter(p => p.id !== id));
          addCommunication({ sender: 'System', recipient: 'admin', message: `Talent Deleted: Performer ID #${id} removed.`, type: 'admin_message' });
      } catch (err) {
          console.error("Delete performer failed:", err);
          setError("Failed to delete talent profile.");
      }
  };
  
  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const originalBookings = bookings;
    const booking = originalBookings.find(b => b.id === bookingId);
    if (!booking) return;

    let updatedBookingData: Partial<Booking> = { status };
    if (status === 'confirmed') {
        updatedBookingData = { ...updatedBookingData, verified_by_admin_name: 'Admin', verified_at: new Date().toISOString() };
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
          deposit_pending: `✅ Request Approved! Your booking for ${booking.event_type} with ${booking.performer?.name} is ready. Please pay the deposit to confirm.`,
          pending_deposit_confirmation: `🧾 Payment Received! We've got your receipt. We will confirm your booking shortly.`,
          rejected: `❗️ Request Declined. We are unable to take your booking for ${booking.event_type} right now.`,
        }[status as 'deposit_pending' | 'pending_deposit_confirmation' | 'rejected'];
        if (clientMessage) addCommunication({ sender: 'System', recipient: 'user', message: clientMessage, booking_id: bookingId, type: 'booking_update' });
      }
      if (status === 'confirmed') {
        addCommunication({ sender: 'System', recipient: 'user', message: `🎉 All Set! Your booking with ${booking.performer?.name} is confirmed. Balance of $${finalBalance.toFixed(2)} due on arrival. Date: ${new Date(booking.event_date).toLocaleDateString()}.`, booking_id: bookingId, type: 'booking_confirmation' });
        addCommunication({ sender: 'System', recipient: booking.performer_id, message: `🎉 BOOKING CONFIRMED: Deposit paid for ${booking.client_name} on ${new Date(booking.event_date).toLocaleDateString()}. Location: ${booking.event_address}. Phone: ${booking.client_phone}.`, booking_id: bookingId, type: 'booking_confirmation' });
      } else {
        const performerMessage = {
            deposit_pending: `✅ Request Checked: The request from ${booking.client_name} for ${new Date(booking.event_date).toLocaleDateString()} is waiting for payment.`,
            rejected: `❗️ Request Cancelled: The request from ${booking.client_name} has been declined.`,
        }[status as 'deposit_pending' | 'rejected'];
        if(performerMessage) addCommunication({ sender: 'System', recipient: booking.performer_id, message: performerMessage, booking_id: bookingId, type: 'booking_update' });
      }
      const adminMessage = {
          pending_deposit_confirmation: `🧾 Payment Check: Booking #${bookingId.slice(0, 8)} (${booking.client_name}) sent a receipt.`,
          confirmed: `✅ Booking Confirmed: ${booking.client_name} and ${booking.performer?.name}.`,
          rejected: `❌ Booking Declined: ${booking.client_name} and ${booking.performer?.name}.`,
      }[status];
      if (adminMessage) addCommunication({ sender: 'System', recipient: 'admin', message: adminMessage, booking_id: bookingId, type: 'admin_message' });
    } catch (err) {
        console.error("Failed to update booking:", err);
        setBookings(originalBookings);
        setError("Could not update booking status.");
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
        console.error("Failed to update booking details:", err);
        setBookings(originalBookings);
        setError("Could not update booking.");
    }
  };
  
  const handleUpdateDoNotServeStatus = async (entryId: string, status: DoNotServeStatus) => {
      const entry = doNotServeList.find(e => e.id === entryId);
      if(!entry) return;
      const originalList = doNotServeList;
      setDoNotServeList(prev => prev.map(e => e.id === entryId ? { ...e, status } : e));
      try {
        const { error } = await api.updateDoNotServeStatus(entryId, status);
        if (error) throw error;
        const message = `Safety List update: '${entry.client_name}' by ${entry.performer?.name} is now ${status}.`;
        addCommunication({ sender: 'System', recipient: 'admin', message, type: 'admin_message' });
        if (entry.submitted_by_performer_id !== 0) {
           addCommunication({ sender: 'System', recipient: entry.submitted_by_performer_id, message, type: 'admin_message' });
        }
      } catch (err) {
        console.error("Failed to update DNS entry:", err);
        setDoNotServeList(originalList);
        setError("Could not update safety list.");
      }
  }

  const handleCreateDoNotServeEntry = async (newEntryData: Omit<DoNotServeEntry, 'id' | 'created_at' | 'status' | 'performer'>, submitterName: Performer['name']) => {
      try {
        const { data, error } = await api.createDoNotServeEntry(newEntryData);
        if (error) throw error;
        setDoNotServeList(prev => [data![0], ...prev]);
        addCommunication({ sender: submitterName, recipient: 'admin', message: `Safety Alert: Submission from ${submitterName} against "${newEntryData.client_name}".`, type: 'admin_message' })
      } catch(err) {
          console.error("Failed to create DNS entry:", err);
          setError("Could not submit safety report.");
      }
  };

  const handlePerformerBookingDecision = async (bookingId: string, decision: 'accepted' | 'declined', eta?: number) => {
      const booking = bookings.find(b => b.id === bookingId);
      if(!booking) return;
      
      const performerName = booking.performer?.name || 'Talent';
      
      if (decision === 'declined') {
        await handleUpdateBookingStatus(bookingId, 'rejected');
        addCommunication({ sender: performerName, recipient: 'admin', message: `${performerName} DECLINED the request from ${booking.client_name}.`, type: 'admin_message' });
        addCommunication({ sender: 'System', recipient: 'user', message: `We're sorry, ${performerName} is not available for this booking.`, booking_id: booking.id, type: 'booking_update' });
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
          verified_by_admin_name: shouldSkipManualVetting ? 'System (Automated Vetting)' : null,
          verified_at: shouldSkipManualVetting ? new Date().toISOString() : null
      };
      
      if (eta && eta > 0) updateData.performer_eta_minutes = eta;
      
      const originalBookings = bookings;
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updateData } : b));
      
      try {
        const { error } = await api.updateBookingStatus(bookingId, newStatus, updateData);
        if (error) throw error;
        
        const etaMessagePartAdmin = eta && eta > 0 ? ` with an ETA of ${eta} mins` : '';
        const etaMessagePartUser = eta && eta > 0 ? ` ETA is about ${eta} minutes.` : '';
        
        if (shouldSkipManualVetting) {
          addCommunication({ sender: performerName, recipient: 'admin', message: `${performerName} ACCEPTED ${booking.client_name}${etaMessagePartAdmin}. System Auto-Cleared via DNS check.`, type: 'admin_message' });
          addCommunication({ sender: 'System', recipient: 'user', message: `✅ Request Cleared! ${performerName} has accepted.${etaMessagePartUser} Please pay the deposit to lock it in.`, booking_id: booking.id, type: 'booking_update' });
        } else {
          if (isBlocked) {
              addCommunication({ sender: 'System', recipient: 'admin', message: `⚠️ WARNING: ${performerName} accepted ${booking.client_name}, but client matches DNS LIST. Holding for review.`, type: 'system_alert' });
          }
          addCommunication({ sender: performerName, recipient: 'admin', message: `${performerName} ACCEPTED ${booking.client_name}${etaMessagePartAdmin}. Manual review required.`, type: 'admin_message' });
          addCommunication({ sender: 'System', recipient: 'user', message: `${performerName} has accepted!${etaMessagePartUser} Our team is now doing a quick final check.`, booking_id: booking.id, type: 'booking_update' });
        }
      } catch (err) {
          console.error("Failed performer decision update:", err);
          setBookings(originalBookings);
          setError("Failed to process decision.");
      }
  };
  
  const handleAdminBookingDecisionForPerformer = async (bookingId: string, decision: 'accepted' | 'declined') => {
      const booking = bookings.find(b => b.id === bookingId);
      if(!booking) return;
      addCommunication({ sender: 'Admin', recipient: booking.performer_id, message: `Admin has marked the request from ${booking.client_name} as ${decision}.`, type: 'booking_update' });
      await handlePerformerBookingDecision(bookingId, decision, undefined);
  }

  const handleAdminChangePerformer = async (bookingId: string, newPerformerId: number) => {
    const booking = bookings.find(b => b.id === bookingId);
    const newPerformer = performers.find(p => p.id === newPerformerId);
    if (!booking || !newPerformer) return;
    const oldPerformerId = booking.performer_id;
    const oldPerformerName = booking.performer?.name || 'Previous Talent';
    const updates: Partial<Booking> = { performer_id: newPerformerId, status: 'pending_performer_acceptance', performer_reassigned_from_id: oldPerformerId };
    const originalBookings = bookings;
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates, performer: { id: newPerformerId, name: newPerformer.name } } : b));
    try {
        const { error } = await api.updateBookingStatus(bookingId, 'pending_performer_acceptance', updates);
        if(error) throw error;
        addCommunication({ sender: 'Admin', recipient: 'admin', message: `Booking for ${booking.client_name} moved from ${oldPerformerName} to ${newPerformer.name}.`, type: 'admin_message' });
        addCommunication({ sender: 'Admin', recipient: 'user', message: `Update: ${newPerformer.name} is now assigned to your booking. Waiting for their confirmation.`, booking_id: booking.id, type: 'booking_update' });
        addCommunication({ sender: 'Admin', recipient: oldPerformerId, message: `Update: Your booking for ${booking.client_name} has been moved to another professional.`, booking_id: booking.id, type: 'booking_update' });
        addCommunication({ sender: 'Admin', recipient: newPerformerId, message: `New Booking: ${booking.client_name}. Please check and accept in your dashboard.`, booking_id: booking.id, type: 'booking_update' });
    } catch (err) {
        console.error("Failed to reassign performer:", err);
        setBookings(originalBookings);
        setError("Could not move booking.");
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
        addCommunication({ sender: booking.performer?.name || 'Talent', recipient: 'admin', message: `${booking.performer?.name} paid the agency fee for ${booking.client_name}.`, booking_id: bookingId, type: 'admin_message' });
    } catch(err) {
        console.error("Failed to update referral fee status:", err);
        setBookings(originalBookings);
        setError("Payment submission failed.");
    }
  };

  const handleBookingRequest = async (formState: BookingFormState, requestedPerformers: Performer[]) => {
     try {
        const { data: newBookings, error } = await api.createBookingRequest(formState, requestedPerformers);
        if (error) throw error;
        setBookings(prev => [...newBookings!, ...prev]);
        const firstBooking = newBookings![0];
        if (firstBooking.status === 'rejected') {
             addCommunication({ sender: 'System', recipient: 'admin', message: `🚫 BLOCKED: ${formState.fullName} is on the safety list.`, type: 'system_alert' });
             addCommunication({ sender: 'System', recipient: 'user', message: `Request Declined.`, booking_id: firstBooking.id, type: 'booking_update' });
        } else {
             addCommunication({ sender: 'System', recipient: 'user', message: `🎉 Request Sent! We've notified ${newBookings!.map(b=>b.performer?.name).join(', ')}.`, booking_id: firstBooking.id, type: 'booking_update' });
             addCommunication({ sender: 'System', recipient: 'admin', message: `📥 New Request: for ${formState.fullName} with ${newBookings!.map(b=>b.performer?.name).join(', ')}.`, type: 'admin_message' });
        }
        return { success: true, message: 'Request sent', bookingIds: newBookings!.map(b => b.id) };
    } catch(err: any) {
        return { success: false, message: err.message || 'Error sending request.' };
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
    await addCommunication({ sender: data.name, recipient: 'admin', message: `[Contact] Subject: ${data.subject}\n\n${data.message}\n\nFrom: ${data.email}`, type: 'system_alert' });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() !== '' && !['available_now', 'future_bookings'].includes(view)) {
        setView('future_bookings');
    }
  };

  if (isAuthLoading) {
     return <div className="fixed inset-0 bg-zinc-900 flex flex-col items-center justify-center text-zinc-400"><LoaderCircle className="w-16 h-16 animate-spin text-orange-500 mb-4" /><h2 className="text-xl font-semibold text-zinc-200">Connecting...</h2></div>
  }
  if (!ageVerified) return <AgeGate onVerified={handleAgeVerified} onShowPrivacyPolicy={handleShowPrivacyPolicy} onShowTermsOfService={handleShowTermsOfService} />;

  const renderContent = () => {
    if (isLoading && !['auth', 'performer_registration'].includes(view)) {
       return <div className="flex flex-col items-center justify-center p-12 text-zinc-400"><LoaderCircle className="w-16 h-16 animate-spin text-orange-500 mb-4" /><h2 className="text-xl font-semibold text-zinc-200">Loading...</h2><p>Please wait.</p></div>;
    }
    if (error) return <div className="text-center p-8 bg-red-900/50 border border-red-500 rounded-lg text-white max-w-4xl mx-auto"><h2 className="text-xl font-bold">Error</h2><p className="mt-2 text-red-200">{error}</p></div>;

    switch (view) {
      case 'auth': return <Auth onBack={() => setView('available_now')} onRegisterClick={() => setView('performer_registration')} />;
      case 'performer_registration':
        if (registrationSuccess) {
            return <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in"><div className="bg-zinc-900/80 p-10 rounded-2xl border border-zinc-700 max-w-lg"><div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><CalendarCheck className="h-10 w-10 text-green-500" /></div><h2 className="text-3xl font-bold text-white mb-4">Request Sent!</h2><p className="text-zinc-400 mb-8">Your application is in. Our team will review your profile shortly.</p><button onClick={() => { setRegistrationSuccess(false); setView('auth'); }} className="btn-primary px-8 py-3">Sign In</button></div></div>;
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
         if (userProfile?.role !== 'admin') return <p>Access Denied</p>;
        return <AdminDashboard bookings={bookings} performers={performers} doNotServeList={doNotServeList} onUpdateBookingStatus={handleUpdateBookingStatus} onUpdateDoNotServeStatus={handleUpdateDoNotServeStatus} onViewDoNotServe={handleViewDoNotServe} communications={communications} onAdminDecisionForPerformer={handleAdminBookingDecisionForPerformer} onAdminChangePerformer={handleAdminChangePerformer} onViewPerformer={handleViewProfile} isAutoVetEnabled={isAutoVetEnabled} onToggleAutoVet={(enabled) => setIsAutoVetEnabled(enabled)} onAddPerformer={handleCreatePerformer} onUpdatePerformer={handleUpdatePerformer} onDeletePerformer={handleDeletePerformer} />;
      case 'performer_dashboard': {
        if (!['performer', 'admin'].includes(userProfile?.role || '')) return <p>Access Denied</p>;
        const currentPerformerId = (userProfile?.role === 'performer' && userProfile.performer_id) ? userProfile.performer_id : currentPerformerIdForAdmin;
        const currentPerformer = performers.find(p => p.id === currentPerformerId);
        return currentPerformer ? <PerformerDashboard performer={currentPerformer} bookings={bookings.filter(b => b.performer_id === currentPerformerId)} communications={communications.filter(c => c.recipient === currentPerformerId)} onToggleStatus={(status) => handlePerformerStatusChange(currentPerformer.id, status)} onViewDoNotServe={handleViewDoNotServe} onBookingDecision={handlePerformerBookingDecision} onReferralFeePaid={handleReferralFeePaid} /> : <p className="text-center text-gray-400">Select a profile to view dashboard.</p>;
      }
      case 'do_not_serve':
         const performerIdForDns = (userProfile?.role === 'performer') ? userProfile.performer_id : currentPerformerIdForAdmin;
        return <DoNotServe role={viewRole} currentPerformer={performers.find(p => p.id === performerIdForDns)} doNotServeList={doNotServeList} onBack={handleBackToDashboard} onCreateEntry={handleCreateDoNotServeEntry} addCommunication={addCommunication} />
      case 'available_now':
      case 'future_bookings':
      default:
        const isAvailableNow = view === 'available_now';
        const onlinePerformersCount = performers.filter(p => p.status === 'available').length;

        return (
          <div className="animate-fade-in">
             {/* Hero Section */}
             <div className="py-12 md:py-24 text-center max-w-4xl mx-auto px-4">
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full mb-8">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Available Now: {onlinePerformersCount} Professionals</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-logo-main text-white uppercase tracking-tighter leading-[0.8] mb-8">
                  Secure Perth's <span className="text-orange-500">Elite Talent</span>
                </h1>
                <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-12">
                  Direct booking for Western Australia's most sought-after professional entertainers. Discretion, safety, and excellence guaranteed.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={() => setView('available_now')}
                      className={`btn-primary !px-10 !py-4 flex items-center gap-3 transition-all ${isAvailableNow ? 'ring-2 ring-orange-500 ring-offset-4 ring-offset-zinc-900' : 'opacity-80'}`}
                    >
                      <Zap size={20} className={isAvailableNow ? "animate-pulse" : ""} />
                      BOOK ASAP
                    </button>
                    <button 
                      onClick={() => setView('future_bookings')}
                      className={`px-10 py-4 rounded-xl border font-black text-[11px] uppercase tracking-widest transition-all ${!isAvailableNow ? 'bg-white/10 text-white border-white/20 ring-2 ring-white/10 ring-offset-4 ring-offset-zinc-900' : 'bg-white/5 text-zinc-400 border-white/5 hover:text-white'}`}
                    >
                      <CalendarCheck size={20} className="inline mr-2" />
                      RESERVE FUTURE DATE
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
       <Header view={view} onNavigate={handleNavigation} userProfile={userProfile} communications={communications} onMarkRead={handleMarkCommunicationsRead} onViewUserSettings={handleViewUserSettings} searchQuery={searchQuery} onSearchChange={handleSearchChange} session={session} onSignInClick={handleSignInClick} onSignOut={async () => { const { error } = await api.signOut(); if (error) setError("Could not sign out."); }} performers={performers} currentPerformerIdForAdmin={currentPerformerIdForAdmin} onPerformerChangeForAdmin={setCurrentPerformerIdForAdmin} >
        <div className="flex items-center gap-4">{viewRole === 'user' && selectedForBooking.length > 0 && (<button onClick={() => handleProceedToBooking(false)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2 uppercase font-black tracking-widest"><ShoppingCart className="h-4 w-4" />Review ({selectedForBooking.length})</button>)}</div>
      </Header>
      <main className="flex-grow container mx-auto px-4 py-2 md:py-6">{renderContent()}</main>
      <Footer onShowPrivacyPolicy={handleShowPrivacyPolicy} onShowTermsOfService={handleShowTermsOfService} onShowServicesPage={handleShowServicesPage} onShowContactUs={handleShowContactUs} />
      {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
      {showTermsOfService && <TermsOfService onClose={() => setShowTermsOfService(false)} />}
    </div>
  );
};

export default App;
