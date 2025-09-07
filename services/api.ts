// services/api.ts
import { supabase } from './supabaseClient';
import { mockPerformers, mockBookings, mockDoNotServeList, mockCommunications } from '../data/mockData';
import type { Performer, Booking, BookingStatus, DoNotServeEntry, DoNotServeStatus, Communication, PerformerStatus, Profile } from '../types';
import { BookingFormState } from '../components/BookingProcess';
import type { Session, User } from 'https://esm.sh/@supabase/supabase-js@^2.44.4';


const isDemoMode = !supabase;

// Helper to simulate network delay for a better demo experience
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

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


// Reset function for demo purposes if needed, e.g., for storybook or testing.
export const resetDemoData = () => {
  demoPerformers = JSON.parse(JSON.stringify(mockPerformers));
  demoBookings = JSON.parse(JSON.stringify(mockBookings));
  demoDoNotServeList = JSON.parse(JSON.stringify(mockDoNotServeList));
  demoCommunications = JSON.parse(JSON.stringify(mockCommunications));
  demoSession = null;
};


export const api = {
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
      await delay(500);
      return {
        performers: { data: demoPerformers, error: null },
        bookings: { data: demoBookings, error: null },
        doNotServeList: { data: demoDoNotServeList, error: null },
        communications: { data: demoCommunications, error: null },
      };
    }

    const [performers, bookings, doNotServeList, communications] = await Promise.all([
      supabase.from('performers').select('*').order('id'),
      supabase.from('bookings').select('*, performer:performer_id(id, name)').order('created_at', { ascending: false }),
      supabase.from('do_not_serve').select('*, performer:submitted_by_performer_id(name)').order('created_at', { ascending: false }),
      supabase.from('communications').select('*').order('created_at', { ascending: false }),
    ]);

    return { performers, bookings, doNotServeList, communications };
  },

  // --- MUTATIONS ---

  async addCommunication(comm: Omit<Communication, 'id' | 'created_at' | 'read'>): Promise<{ data: Communication[] | null, error: any }> {
     const newComm: Omit<Communication, 'id' | 'created_at'> & { read: false } = {
      ...comm,
      read: false,
    };
    if (isDemoMode) {
      await delay(200);
      const fullComm = { ...newComm, id: `comm-demo-${Date.now()}`, created_at: new Date().toISOString() };
      demoCommunications.unshift(fullComm);
      return { data: [fullComm], error: null };
    }
    return supabase.from('communications').insert(newComm).select();
  },

  async updatePerformerStatus(performerId: number, status: PerformerStatus): Promise<{ data: Performer[] | null, error: any }> {
    if (isDemoMode) {
        await delay(800);
        const performer = demoPerformers.find(p => p.id === performerId);
        if (performer) {
            performer.status = status;
            return { data: [performer], error: null };
        }
        return { data: null, error: { message: 'Performer not found' } };
    }
    return supabase.from('performers').update({ status }).eq('id', performerId).select();
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus, updates: Partial<Booking> = {}): Promise<{ data: Booking[] | null, error: any }> {
    const dataToUpdate = { status, ...updates };
    if (isDemoMode) {
      await delay(1000);
      const bookingIndex = demoBookings.findIndex(b => b.id === bookingId);
      if (bookingIndex !== -1) {
        demoBookings[bookingIndex] = { ...demoBookings[bookingIndex], ...dataToUpdate };
        return { data: [demoBookings[bookingIndex]], error: null };
      }
      return { data: null, error: { message: 'Booking not found' } };
    }
    return supabase.from('bookings').update(dataToUpdate).eq('id', bookingId).select('*, performer:performer_id(id, name)');
  },

  async updateDoNotServeStatus(entryId: string, status: DoNotServeStatus): Promise<{ data: DoNotServeEntry[] | null, error: any }> {
    if (isDemoMode) {
      await delay(1000);
      const entry = demoDoNotServeList.find(e => e.id === entryId);
      if(entry) {
        entry.status = status;
        return { data: [entry], error: null };
      }
      return { data: null, error: { message: 'Entry not found' } };
    }
    return supabase.from('do_not_serve').update({ status }).eq('id', entryId).select('*, performer:submitted_by_performer_id(name)');
  },

  async createDoNotServeEntry(newEntry: Omit<DoNotServeEntry, 'id' | 'created_at' | 'status' | 'performer'>): Promise<{ data: DoNotServeEntry[] | null, error: any }> {
     if (isDemoMode) {
          await delay(1200);
          const performer = demoPerformers.find(p => p.id === newEntry.submitted_by_performer_id);
          const entry: DoNotServeEntry = {
              ...newEntry,
              id: `dns-demo-${Date.now()}`,
              created_at: new Date().toISOString(),
              status: 'pending',
              performer: { name: performer?.name || 'Unknown' }
          };
          demoDoNotServeList.unshift(entry);
          return { data: [entry], error: null };
      }
      return supabase.from('do_not_serve').insert({ ...newEntry, status: 'pending' }).select('*, performer:submitted_by_performer_id(name)');
  },

  async createBookingRequest(formState: BookingFormState, requestedPerformers: Performer[]): Promise<{ data: Booking[] | null, error: any }> {
     if (isDemoMode) {
        await delay(1500);
        const approvedDNS = demoDoNotServeList.filter(e => e.status === 'approved');
        const isBlocked = approvedDNS.some(entry => {
            const nameMatch = entry.client_name.trim().toLowerCase() === formState.fullName.trim().toLowerCase();
            const emailMatch = formState.email && entry.client_email && entry.client_email.trim().toLowerCase() === formState.email.trim().toLowerCase();
            const phoneMatch = formState.mobile && entry.client_phone && entry.client_phone.replace(/\s+/g, '') === formState.mobile.replace(/\s+/g, '');
            return nameMatch || emailMatch || phoneMatch;
        });

        if (isBlocked) {
            this.addCommunication({
                sender: 'System',
                recipient: 'admin',
                message: `BLOCKED BOOKING ATTEMPT: A client on the 'Do Not Serve' list (${formState.fullName}) tried to book. The system prevented it.`,
                type: 'system_alert'
            });
            return { data: null, error: { message: "This client is on the 'Do Not Serve' list and cannot be booked. The system has blocked the request and notified administration." }};
        }
        
        const newBookings: Booking[] = requestedPerformers.map((p, i) => ({
            id: `demo-${Date.now()}-${i}`,
            performer_id: p.id,
            client_name: formState.fullName,
            client_email: formState.email,
            client_phone: formState.mobile,
            event_date: formState.eventDate,
            event_time: formState.eventTime,
            event_address: formState.eventAddress,
            event_type: formState.eventType,
            number_of_guests: Number(formState.numberOfGuests),
            client_message: formState.client_message,
            status: 'pending_performer_acceptance' as const,
            duration_hours: Number(formState.duration),
            services_requested: formState.selectedServices,
            id_document_path: formState.idDocument ? `demo/id-${Date.now()}-${formState.idDocument.name}` : null,
            deposit_receipt_path: null,
            created_at: new Date().toISOString(),
            verified_by_admin_name: null,
            verified_at: null,
            performer: { id: p.id, name: p.name },
            performer_eta_minutes: null,
        }));
        
        demoBookings.unshift(...newBookings);
        return { data: newBookings, error: null };
    }

    // --- Supabase logic ---
    if (!supabase) {
      return { data: null, error: { message: 'Supabase client is not initialized.' } };
    }

    // 1. DNS Check
    const { data: dnsList, error: dnsError } = await supabase
      .from('do_not_serve')
      .select('client_name, client_email, client_phone')
      .eq('status', 'approved');

    if (dnsError) {
      return { data: null, error: { message: `Failed to check DNS list: ${dnsError.message}` } };
    }

    const isBlocked = dnsList.some(entry => {
        const nameMatch = entry.client_name.trim().toLowerCase() === formState.fullName.trim().toLowerCase();
        const emailMatch = formState.email && entry.client_email && entry.client_email.trim().toLowerCase() === formState.email.trim().toLowerCase();
        const phoneMatch = formState.mobile && entry.client_phone && entry.client_phone.replace(/\s+/g, '') === formState.mobile.replace(/\s+/g, '');
        return nameMatch || emailMatch || phoneMatch;
    });

    if (isBlocked) {
        this.addCommunication({
            sender: 'System',
            recipient: 'admin',
            message: `BLOCKED BOOKING ATTEMPT: A client on the 'Do Not Serve' list (${formState.fullName}) tried to book. The system prevented it.`,
            type: 'system_alert'
        });
        return { data: null, error: { message: "This client is on the 'Do Not Serve' list and cannot be booked. The system has blocked the request and notified administration." }};
    }

    // 2. File Upload
    let idDocumentPath: string | null = null;
    if (formState.idDocument) {
      const file = formState.idDocument;
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `id-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents') // Assuming a bucket named 'documents'
        .upload(filePath, file);

      if (uploadError) {
        return { data: null, error: { message: `Failed to upload ID document: ${uploadError.message}` } };
      }
      idDocumentPath = filePath;
    }

    // 3. Prepare booking data
    const newBookingsData: Omit<Booking, 'id' | 'created_at' | 'performer' | 'verified_by_admin_name' | 'verified_at' | 'deposit_receipt_path' | 'performer_reassigned_from_id' | 'performer_eta_minutes'>[] = requestedPerformers.map(p => ({
        performer_id: p.id,
        client_name: formState.fullName,
        client_email: formState.email,
        client_phone: formState.mobile,
        event_date: formState.eventDate,
        event_time: formState.eventTime,
        event_address: formState.eventAddress,
        event_type: formState.eventType,
        number_of_guests: Number(formState.numberOfGuests),
        client_message: formState.client_message,
        status: 'pending_performer_acceptance' as const,
        duration_hours: Number(formState.duration),
        services_requested: formState.selectedServices,
        id_document_path: idDocumentPath,
    }));

    // 4. Insert bookings
    const { data, error } = await supabase
      .from('bookings')
      .insert(newBookingsData)
      .select('*, performer:performer_id(id, name)'); // fetch performer name too

    if (error) {
      return { data: null, error: { message: `Failed to create booking: ${error.message}` } };
    }

    return { data, error: null };
  }
};