'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Briefcase, ChevronDown, ShoppingCart, Radio, LoaderCircle, CalendarCheck, Clock, Users, Settings, ListChecks } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import PerformerCard from './components/EntertainerCard';
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
import { api } from './services/api';
import type { Performer, Booking, Role, PerformerStatus, BookingStatus, DoNotServeEntry, DoNotServeStatus, Communication, Profile } from './types';
import { allServices } from './data/mockData';
import { calculateBookingCost } from './utils/bookingUtils';
import type { Session } from '@supabase/supabase-js';

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
  
  // Admin Automation Settings
  const [isAutoVetEnabled, setIsAutoVetEnabled] = useState(false);

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
    // Client-side filtering based on settings
    if (commData.recipient === 'user') {
        if (commData.type === 'booking_update' && !notificationSettings.bookingUpdates) {
            return;
        }
        if (commData.type === 'booking_confirmation' && !notificationSettings.confirmations) {
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
        updatedBookingData = { ...updatedBookingData, verified_by_admin_name: 'Admin', verified_at: new Date().toISOString() };
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
      }
      
      if (status === 'confirmed') {
        addCommunication({ sender: 'System', recipient: 'user', message: `🎉 Booking Confirmed! Your event with ${booking.performer?.name} is locked in. Final balance of $${finalBalance.toFixed(2)} due in cash on arrival. See you on ${new Date(booking.event_date).toLocaleDateString()}!`, booking_id: bookingId, type: 'booking_confirmation' });
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

  const handleCreateDoNotServeEntry = async (newEntryData: Omit<DoNotServeEntry, 'id' | 'created_at' | 'status' | 'performer'>, submitterName: Performer['name']) => {
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
      
      // AUTO-VETTING LOGIC: Skip pending_vetting if verified OR if auto-vet mode is ON
      const shouldSkipVetting = isVerifiedBooker || isAutoVetEnabled;
      const newStatus = shouldSkipVetting ? 'deposit_pending' : 'pending_vetting';
      
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

        if (shouldSkipVetting) {
          const autoMsg = isAutoVetEnabled ? " (Auto-Vetting Enabled)" : " (Verified Client)";
          addCommunication({ sender: performerName, recipient: 'admin', message: `${performerName} has ACCEPTED the booking from ${booking.client_name}${etaMessagePartAdmin}. System bypassed vetting${autoMsg}, awaiting deposit.`, type: 'admin_message' });
          addCommunication({ sender: 'System', recipient: 'user', message: `${performerName} has accepted your request!${etaMessagePartUser} Your application has been approved. Please proceed to payment.`, booking_id: booking.id, type: 'booking_update' });
          handleUpdateBookingStatus(bookingId, 'deposit_pending'); // Trigger notifications for this status
        } else {
          addCommunication({ sender: performerName, recipient: 'admin', message: `${performerName} has ACCEPTED the booking request from ${booking.client_name}${etaMessagePartAdmin}. It is now pending your vetting.`, type: 'admin_message' });
          addCommunication({ sender: 'System', recipient: 'user', message: `${performerName} has accepted your request!${etaMessagePartUser} Your booking is now with our admin team for final review.`, booking_id: booking.id, type: 'booking_update' });
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
        
        if (firstBooking.status === 'rejected') {
             addCommunication({ sender: 'System', recipient: 'admin', message: `🚫 AUTO-REJECTED BOOKING: Client ${formState.fullName} attempted to book but is on the 'Do Not Serve' list.`, type: 'system_alert' });
             addCommunication({ sender: 'System', recipient: 'user', message: `Booking Application Rejected.`, booking_id: firstBooking.id, type: 'booking_update' });
        } else {
             addCommunication({ sender: 'System', recipient: 'user', message: `🎉 Booking Request Sent! We've notified ${newBookings!.map(b=>b.performer?.name).join(', ')} of your request.`, booking_id: firstBooking.id, type: 'booking_update' });
             addCommunication({ sender: 'System', recipient: 'admin', message: `📥 New Booking Request: for ${formState.fullName} with ${newBookings!.map(b=>b.performer?.name).join(', ')}. Awaiting performer acceptance.`, type: 'admin_message' });
        }

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
    if (view === 'available_now' || view === 'future_bookings' || view === 'admin_dashboard') {
        setBookingOrigin(view);
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

  const handleContactSubmit = async (data: ContactFormData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await addCommunication({
        sender: data.name,
        recipient: 'admin', 
        message: `[Contact Form] Subject: ${data.subject}\n\n${data.message}\n\nFrom: ${data.email}`,
        type: 'system_alert'
    });
  };

  const uniqueCategories = useMemo(() => [...new Set(allServices.map(s => s.category))], []);
  
  const [categoryFilter, setCategoryFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<PerformerStatus | ''>('');

  const availableServicesForFilter = useMemo(() => {
    let services = allServices;
    if (categoryFilter) {
        services = services.filter(s => s.category === categoryFilter);
    }
    return [...services].sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryFilter]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() !== '' && !['available_now', 'future_bookings'].includes(view)) {
        setView('future_bookings');
        // Clear other filters for a clean search experience
        setCategoryFilter('');
        setServiceFilter('');
        setAvailabilityFilter('');
    }
  };

  const filteredPerformers = useMemo(() => {
    // Only show performers who are NOT pending in the public gallery view
    // Admins can see pending performers in their dashboard separately
    const publicPerformers = performers.filter(p => p.status !== 'pending');

    const basePerformers = view === 'available_now'
        ? publicPerformers.filter(p => p.status === 'available')
        : publicPerformers;

    const lowerCaseQuery = searchQuery.toLowerCase().trim();

    return basePerformers.filter(p => {
       const categoryMatch = !categoryFilter || p.service_ids.some(id => {
            const service = allServices.find(s => s.id === id);
            return service && service.category === categoryFilter;
       });

       const serviceMatch = !serviceFilter || p.service_ids.includes(serviceFilter);

       const availabilityMatch = view === 'available_now' || !availabilityFilter || p.status === availabilityFilter;

       const searchMatch = !lowerCaseQuery || (
           p.name.toLowerCase().includes(lowerCaseQuery) ||
           p.tagline.toLowerCase().includes(lowerCaseQuery) ||
           p.service_ids.some(id => {
               const service = allServices.find(s => s.id === id);
               return service && service.name.toLowerCase().includes(lowerCaseQuery);
           })
       );

       return categoryMatch && serviceMatch && availabilityMatch && searchMatch;
    });
  }, [performers, categoryFilter, serviceFilter, availabilityFilter, view, searchQuery]);

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
    if (isLoading && !['auth', 'performer_registration'].includes(view)) {
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
        return <Auth onBack={() => setView('available_now')} onRegisterClick={() => setView('performer_registration')} />;
      case 'performer_registration':
        if (registrationSuccess) {
            return (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in">
                    <div className="bg-zinc-900/80 p-10 rounded-2xl border border-zinc-700 max-w-lg">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CalendarCheck className="h-10 w-10 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Registration Successful!</h2>
                        <p className="text-zinc-400 mb-8">
                            Your application has been received. An admin will review your profile shortly. You can sign in to check your status.
                        </p>
                        <button 
                            onClick={() => { setRegistrationSuccess(false); setView('auth'); }}
                            className="btn-primary px-8 py-3"
                        >
                            Go to Sign In
                        </button>
                    </div>
                </div>
            );
        }
        return <PerformerRegistration onBack={() => setView('auth')} onSuccess={() => setRegistrationSuccess(true)} />;
      case 'profile': {
        const performerBookings = viewedPerformer ? bookings.filter(b => b.performer_id === viewedPerformer.id) : [];
        const canEditStatus = !!(userProfile && (userProfile.role === 'admin' || (userProfile.role === 'performer' && userProfile.performer_id === viewedPerformer?.id)));
        
        return viewedPerformer && (
            <PerformerProfile 
                performer={viewedPerformer} 
                onBack={handleReturnToGallery} 
                onBook={handleBookSinglePerformer}
                isSelected={selectedForBooking.some(p => p.id === viewedPerformer.id)}
                onToggleSelection={handleTogglePerformerSelection}
                bookings={performerBookings}
                canEditStatus={canEditStatus}
                onStatusChange={(status) => handlePerformerStatusChange(viewedPerformer.id, status)}
            />
        );
      }
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
      case 'contact_us':
        return <ContactUs onBack={handleReturnToGallery} onSubmit={handleContactSubmit} />;
      case 'admin_dashboard':
         if (userProfile?.role !== 'admin') return <p>Access Denied</p>;
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
            onViewPerformer={handleViewProfile}
            isAutoVetEnabled={isAutoVetEnabled}
            onToggleAutoVet={(enabled) => setIsAutoVetEnabled(enabled)}
          />;
      case 'performer_dashboard': {
        if (!['performer', 'admin'].includes(userProfile?.role || '')) return <p>Access Denied</p>;
        const currentPerformerId = (userProfile?.role === 'performer' && userProfile.performer_id) 
            ? userProfile.performer_id 
            : currentPerformerIdForAdmin;

        const currentPerformer = performers.find(p => p.id === currentPerformerId);
        const performerBookings = bookings.filter(b => b.performer_id === currentPerformerId);
        const performerCommunications = communications.filter(c => c.recipient === currentPerformerId);
        return currentPerformer ? <PerformerDashboard performer={currentPerformer} bookings={performerBookings} communications={performerCommunications} onToggleStatus={(status) => handlePerformerStatusChange(currentPerformer.id, status)} onViewDoNotServe={handleViewDoNotServe} onBookingDecision={handlePerformerBookingDecision} onReferralFeePaid={handleReferralFeePaid} /> : <p className="text-center text-gray-400">Select a performer to view their dashboard.</p>;
      }
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
      case 'available_now':
      case 'future_bookings':
      default:
        const isAvailableNow = view === 'available_now';
        return (
          <div className="animate-fade-in">
             <div className="mb-8 flex justify-center border-b border-zinc-800">
                <button 
                    onClick={() => setView('available_now')}
                    className={`flex items-center gap-2 py-4 px-6 text-sm font-semibold transition-colors ${isAvailableNow ? 'border-b-2 border-orange-500 text-orange-400' : 'border-b-2 border-transparent text-zinc-400 hover:text-white'}`}
                >
                    <Clock size={16} /> Available Now
                </button>
                <button
                    onClick={() => setView('future_bookings')}
                    className={`flex items-center gap-2 py-4 px-6 text-sm font-semibold transition-colors ${!isAvailableNow ? 'border-b-2 border-orange-500 text-orange-400' : 'border-b-2 border-transparent text-zinc-400 hover:text-white'}`}
                >
                    <CalendarCheck size={16} /> Book for Future
                </button>
            </div>
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                {isAvailableNow ? 'Available Now' : 'Schedule a Future Booking'}
              </h1>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
                {isAvailableNow
                    ? "Perth's hottest skimmys, topless and nude waitresses and strippers available now to party with you."
                    : "Browse all professionals. Select one or more to begin your booking for a future date."
                }
              </p>
            </div>
            
            <HowItWorks />

            <div className="mb-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <select onChange={(e) => { setCategoryFilter(e.target.value); setServiceFilter(''); }} value={categoryFilter} className="input-base input-with-icon appearance-none">
                  <option value="">All Service Categories</option>
                  {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
              </div>
              
              <div className="relative">
                <ListChecks className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <select onChange={(e) => setServiceFilter(e.target.value)} value={serviceFilter} className="input-base input-with-icon appearance-none">
                  <option value="">All Services</option>
                  {availableServicesForFilter.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
              </div>

               <div className="relative">
                <Radio className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <select onChange={(e) => {
                    const status = e.target.value as PerformerStatus | '';
                    setAvailabilityFilter(status);
                    if (status && view === 'available_now') setView('future_bookings');
                }} value={availabilityFilter} className="input-base input-with-icon appearance-none">
                  <option value="">All Availabilities</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {filteredPerformers.map((performer) => (
                <PerformerCard
                  key={performer.id}
                  performer={performer}
                  onViewProfile={handleViewProfile}
                  onToggleSelection={handleTogglePerformerSelection}
                  onBook={handleBookSinglePerformer}
                  isSelected={selectedForBooking.some(p => p.id === performer.id)}
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
          {viewRole === 'user' && selectedForBooking.length > 0 && (
             <button
              onClick={handleProceedToBooking}
              className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
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
      <Footer onShowPrivacyPolicy={handleShowPrivacyPolicy} onShowTermsOfService={handleShowTermsOfService} onShowServicesPage={handleShowServicesPage} onShowContactUs={handleShowContactUs} />
      {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
      {showTermsOfService && <TermsOfService onClose={() => setShowTermsOfService(false)} />}
    </div>
  );
};

export default App;
