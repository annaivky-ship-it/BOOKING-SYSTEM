

// services/api.ts
import { supabase } from './supabaseClient';
import { mockPerformers, mockBookings, mockDoNotServeList, mockCommunications } from '../data/mockData';
import type { Performer, Booking, BookingStatus, DoNotServeEntry, DoNotServeStatus, Communication, PerformerStatus, Profile } from '../types';
import { type BookingFormState } from '../components/BookingProcess';
import type { Session, User } from 'https://esm.sh/@supabase/supabase-js@^2.44.4';


const isDemoMode = !supabase;

// Helper to simulate network delay for a better demo experience
const delay = (ms: number) => new Promise(res => window.setTimeout(res, ms));

// In-memory "database" for demo mode to simulate state changes
let demoPerformers = JSON.parse(JSON.stringify(mockPerformers));
let demoBookings = JSON.parse(JSON.stringify(mockBookings));
let demoDoNotServeList = JSON.parse(JSON.stringify(mockDoNotServeList));
let demoCommunications = JSON.parse(JSON.stringify(mockCommunications));
let demoSession: Session | null = null;
const demoProfiles: Profile[] = [
    { id: 'april-flavor-uuid', role: 'performer', performer_id: 5 },
    { id: 'admin-uuid', role: 'admin' }
];

// --- Demo Mode Auth State Management ---
let demoAuthCallback: ((event: string, session: Session | null) => void) | null = null;
const triggerDemoAuthChange = (event: string, session: Session | null) => {
    if (demoAuthCallback) {
        demoAuthCallback(event, session);
    }
};
// ------------------------------------


export const api = {
  // Reset function for demo purposes if needed, e.g., for storybook or testing.
  async resetDemoData() {
    if (!isDemoMode) return;
    await delay(100);
    demoPerformers = JSON.parse(JSON.stringify(mockPerformers));
    demoBookings = JSON.parse(JSON.stringify(mockBookings));
    demoDoNotServeList = JSON.parse(JSON.stringify(mockDoNotServeList));
    demoCommunications = JSON.parse(JSON.stringify(mockCommunications));
    demoSession = null;
    triggerDemoAuthChange('SIGNED_OUT', null);
  },

  // --- AUTH ---
  async getSession() {
      if (isDemoMode) {
          await delay(100);
          return { data: { session: demoSession }, error: null };
      }
      return supabase.auth.getSession();
  },
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
      if (isDemoMode) {
          demoAuthCallback = callback;
          return { data: { subscription: { unsubscribe: () => { demoAuthCallback = null; } } } };
      }
      return supabase.auth.onAuthStateChange(callback);
  },
  async signInWithPassword(email: string, password: string): Promise<{ data: any, error: any }> {
      if (isDemoMode) {
          await delay(1000);
          if (password !== 'password123') {
              return { data: {}, error: { message: 'Invalid password. Use "password123" for demo.' } };
          }
          
          let profile: Profile | undefined;
          if (email.toLowerCase() === 'april@flavor.com') {
              profile = demoProfiles.find(p => p.role === 'performer');
          } else if (email.toLowerCase() === 'admin@flavor.com') {
              profile = demoProfiles.find(p => p.role === 'admin');
          }

          if (profile) {
              demoSession = {
                  access_token: 'demo-token',
                  token_type: 'bearer',
                  user: { id: profile.id, email, app_metadata: {}, user_metadata: {}, aud: '', created_at: '' },
                  expires_in: 3600,
                  refresh_token: 'demo-refresh-token',
                  expires_at: Math.floor(Date.now() / 1000) + 3600,
              };
              triggerDemoAuthChange('SIGNED_IN', demoSession);
              return { data: { session: demoSession, user: demoSession.user }, error: null };
          }
          
          return { data: {}, error: { message: 'Invalid credentials. Use april@flavor.com or admin@flavor.com.' } };
      }
      return supabase.auth.signInWithPassword({ email, password });
  },
  async signOut() {
      if (isDemoMode) {
          await delay(500);
          demoSession = null;
          triggerDemoAuthChange('SIGNED_OUT', null);
          return { error: null };
      }
      return supabase.auth.signOut();
  },
  async getProfile(user: User) : Promise<{ data: Profile | null, error: any }> {
      if (isDemoMode) {
          await delay(200);
          const profile = demoProfiles.find(p => p.id === user.id);
          return { data: profile || null, error: profile ? null : { message: 'Profile not found' } };
      }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      return { data, error };
  },

  // --- GETTERS ---
  async getInitialData() {
    if (isDemoMode) {
      await delay(1000);
      // Simulate joins
      const performers = { data: demoPerformers, error: null };
      const bookings = { data: demoBookings.map(b => ({...b, performer: demoPerformers.find(p => p.id === b.performer_id)})), error: null };
      const doNotServeList = { data: demoDoNotServeList.map(d => ({...d, performer: demoPerformers.find(p => p.id === d.submitted_by_performer_id)})), error: null };
      const communications = { data: demoCommunications, error: null };
      return { performers, bookings, doNotServeList, communications };
    }
    const [performers, bookings, doNotServeList, communications] = await Promise.all([
        supabase.from('performers').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*, performer:performers(id, name)').order('created_at', { ascending: false }),
        supabase.from('do_not_serve_list').select('*, performer:performers(name)').order('created_at', { ascending: false }),
        supabase.from('communications').select('*').order('created_at', { ascending: false }),
    ]);
    return { performers, bookings, doNotServeList, communications };
  },

  // --- MUTATIONS ---
  async addCommunication(commData: Omit<Communication, 'id' | 'created_at' | 'read'>) {
      if (isDemoMode) {
          await delay(100);
          const newComm: Communication = {
              ...commData,
              id: `comm-${Math.random()}`,
              created_at: new Date().toISOString(),
              read: false
          };
          demoCommunications.unshift(newComm);
          return { data: [newComm], error: null };
      }
      return supabase.from('communications').insert(commData).select();
  },

  async updatePerformerStatus(performerId: number, status: PerformerStatus) {
    if (isDemoMode) {
      await delay(500);
      const performer = demoPerformers.find(p => p.id === performerId);
      if (performer) performer.status = status;
      return { error: null };
    }
    return supabase.from('performers').update({ status }).eq('id', performerId);
  },
  
  async updateBookingStatus(bookingId: string, status: BookingStatus, extraData: Partial<Booking> = {}) {
    if (isDemoMode) {
        await delay(500);
        const booking = demoBookings.find(b => b.id === bookingId);
        if (booking) {
            Object.assign(booking, { status, ...extraData });
        }
        return { error: null };
    }
    return supabase.from('bookings').update({ status, ...extraData }).eq('id', bookingId);
  },

  async updateDoNotServeStatus(entryId: string, status: DoNotServeStatus) {
      if (isDemoMode) {
          await delay(500);
          const entry = demoDoNotServeList.find(e => e.id === entryId);
          if (entry) entry.status = status;
          return { error: null };
      }
      return supabase.from('do_not_serve_list').update({ status }).eq('id', entryId);
  },

  async createDoNotServeEntry(newEntryData: Omit<DoNotServeEntry, 'id' | 'created_at' | 'status'>) {
      if (isDemoMode) {
          await delay(800);
          const newEntry: DoNotServeEntry = {
              ...newEntryData,
              id: `dns-${Math.random()}`,
              created_at: new Date().toISOString(),
              status: 'pending',
              performer: demoPerformers.find(p => p.id === newEntryData.submitted_by_performer_id)
          };
          demoDoNotServeList.unshift(newEntry);
          return { data: [newEntry], error: null };
      }
      return supabase.from('do_not_serve_list').insert(newEntryData).select('*, performer:performers(name)');
  },

  async createBookingRequest(formState: BookingFormState, requestedPerformers: Performer[]) {
      if (isDemoMode) {
          await delay(1200);
          const newBookings: Booking[] = requestedPerformers.map(performer => ({
              id: `booking-${Math.random().toString(36).substr(2, 9)}`,
              performer_id: performer.id,
              client_name: formState.fullName,
              client_email: formState.email,
              client_phone: formState.mobile,
              event_date: formState.eventDate,
              event_time: formState.eventTime,
              event_address: formState.eventAddress,
              event_type: formState.eventType,
              status: 'pending_performer_acceptance',
              id_document_path: formState.idDocument ? `uploads/ids/${formState.idDocument.name}` : null,
              deposit_receipt_path: null,
              created_at: new Date().toISOString(),
              duration_hours: Number(formState.duration),
              number_of_guests: Number(formState.numberOfGuests),
              services_requested: formState.selectedServices,
              verified_by_admin_name: null,
              verified_at: null,
              client_message: formState.client_message,
              performer: { id: performer.id, name: performer.name },
          }));
          demoBookings.unshift(...newBookings);
          return { data: newBookings, error: null };
      }

      // Real Supabase logic would involve uploading the ID if it exists,
      // then creating the booking records.
      // This is a simplified version.
      const bookingRecords = requestedPerformers.map(performer => ({
          performer_id: performer.id,
          client_name: formState.fullName,
          client_email: formState.email,
          client_phone: formState.mobile,
          event_date: formState.eventDate,
          event_time: formState.eventTime,
          event_address: formState.eventAddress,
          event_type: formState.eventType,
          status: 'pending_performer_acceptance',
          duration_hours: Number(formState.duration),
          number_of_guests: Number(formState.numberOfGuests),
          services_requested: formState.selectedServices,
          client_message: formState.client_message,
          // id_document_path would be set after upload
      }));
      return supabase.from('bookings').insert(bookingRecords).select('*, performer:performers(id, name)');
  },

  async updateReferralFeeStatus(bookingId: string, feeAmount: number, receiptPath: string) {
      if (isDemoMode) {
          await delay(800);
          const booking = demoBookings.find(b => b.id === bookingId);
          if (booking) {
              booking.referral_fee_paid = true;
              booking.referral_fee_amount = feeAmount;
              booking.referral_fee_receipt_path = receiptPath;
          }
          return { error: null };
      }
      return supabase.from('bookings').update({
          referral_fee_paid: true,
          referral_fee_amount: feeAmount,
          referral_fee_receipt_path: receiptPath
      }).eq('id', bookingId);
  }
};
