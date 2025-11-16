// services/api.ts
import { supabase } from './supabaseClient';
import { mockPerformers, mockBookings, mockDoNotServeList, mockCommunications } from '../data/mockData';
import type { Performer, Booking, BookingStatus, DoNotServeEntry, DoNotServeStatus, Communication, PerformerStatus } from '../types';
import { BookingFormState } from '../components/BookingProcess';

let isDemoMode = !supabase;

const switchToDemoMode = () => {
    if (!isDemoMode) {
        console.warn("Switching to demo mode due to Supabase schema errors. Please ensure your database tables are set up correctly.");
        isDemoMode = true;
    }
};

// Helper to simulate network delay for a better demo experience
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// In-memory "database" for demo mode to simulate state changes
let demoPerformers = JSON.parse(JSON.stringify(mockPerformers));
let demoBookings = JSON.parse(JSON.stringify(mockBookings));
let demoDoNotServeList = JSON.parse(JSON.stringify(mockDoNotServeList));
let demoCommunications = JSON.parse(JSON.stringify(mockCommunications));

export const resetDemoData = () => {
  demoPerformers = JSON.parse(JSON.stringify(mockPerformers));
  demoBookings = JSON.parse(JSON.stringify(mockBookings));
  demoDoNotServeList = JSON.parse(JSON.stringify(mockDoNotServeList));
  demoCommunications = JSON.parse(JSON.stringify(mockCommunications));
};

export const api = {
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
      supabase!.from('performers').select('*').order('id'),
      supabase!.from('bookings').select('*, performer:performer_id(id, name)').order('created_at', { ascending: false }),
      supabase!.from('do_not_serve_list').select('*, performer:submitted_by_performer_id(name)').order('created_at', { ascending: false }),
      supabase!.from('communications').select('*').order('created_at', { ascending: false }),
    ]);
    
    // Graceful fallback to demo mode if tables don't exist
    if (performers.error && performers.error.message.includes("schema cache")) {
        switchToDemoMode();
        resetDemoData(); // Ensure we're using the base mock data
        return {
            performers: { data: demoPerformers, error: null },
            bookings: { data: demoBookings, error: null },
            doNotServeList: { data: demoDoNotServeList, error: null },
            communications: { data: demoCommunications, error: null },
        };
    }

    return { performers, bookings, doNotServeList, communications };
  },
  
  async getBookingMessages(bookingId: string): Promise<{ data: Communication[] | null, error: any }> {
      if (isDemoMode) {
          await delay(300);
          const messages = demoCommunications.filter((c: Communication) => 
              c.booking_id === bookingId && c.type === 'direct_message'
          ).sort((a: Communication, b: Communication) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          return { data: messages, error: null };
      }
      return supabase!.from('communications')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('type', 'direct_message')
        .order('created_at', { ascending: true });
  },

  // --- MUTATIONS ---

  async addCommunication(comm: Omit<Communication, 'id' | 'created_at' | 'read'>): Promise<{ data: Communication[] | null, error: any }> {
    if (isDemoMode) {
      await delay(200);
      const newComm: Communication = {
        ...comm,
        id: `comm-demo-${Date.now()}`,
        created_at: new Date().toISOString(),
        read: false,
      };
      demoCommunications.unshift(newComm);
      return { data: [newComm], error: null };
    }
    
    return supabase!.from('communications').insert({ ...comm, read: false }).select();
  },
  
  async sendBookingMessage(bookingId: string, message: string, senderName: string, recipientName: string): Promise<{ data: Communication | null, error: any }> {
      const commData = {
          booking_id: bookingId,
          sender: senderName,
          recipient: recipientName,
          message: message,
          type: 'direct_message',
          read: false
      };
      
      if (isDemoMode) {
          await delay(300);
          const newComm = { ...commData, id: `chat-${Date.now()}`, created_at: new Date().toISOString() };
          demoCommunications.push(newComm);
          return { data: newComm as Communication, error: null };
      }
      return supabase!.from('communications').insert(commData).select().single();
  },

  async updatePerformerStatus(performerId: number, status: PerformerStatus): Promise<{ data: Performer[] | null, error: any }> {
    if (isDemoMode) {
        await delay(800);
        const performer = demoPerformers.find((p: Performer) => p.id === performerId);
        if (performer) {
            performer.status = status;
            return { data: [performer], error: null };
        }
        return { data: null, error: { message: 'Performer not found' } };
    }
    return supabase!.from('performers').update({ status }).eq('id', performerId).select();
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus, updates: Partial<Booking> = {}): Promise<{ data: Booking[] | null, error: any }> {
    if (isDemoMode) {
      await delay(1000);
      const bookingIndex = demoBookings.findIndex((b: Booking) => b.id === bookingId);
      if (bookingIndex !== -1) {
        demoBookings[bookingIndex] = { ...demoBookings[bookingIndex], status, ...updates };
        return { data: [demoBookings[bookingIndex]], error: null };
      }
      return { data: null, error: { message: 'Booking not found' } };
    }
    return supabase!.from('bookings').update({ status, ...updates }).eq('id', bookingId).select('*, performer:performer_id(id, name)');
  },

  async updateDoNotServeStatus(entryId: string, status: DoNotServeStatus): Promise<{ data: DoNotServeEntry[] | null, error: any }> {
    if (isDemoMode) {
      await delay(1000);
      const entry = demoDoNotServeList.find((e: DoNotServeEntry) => e.id === entryId);
      if(entry) {
        entry.status = status;
        return { data: [entry], error: null };
      }
      return { data: null, error: { message: 'Entry not found' } };
    }
    return supabase!.from('do_not_serve_list').update({ status }).eq('id', entryId).select('*, performer:submitted_by_performer_id(name)');
  },

  async createDoNotServeEntry(newEntry: Omit<DoNotServeEntry, 'id' | 'created_at' | 'status' | 'performer'>): Promise<{ data: DoNotServeEntry[] | null, error: any }> {
     if (isDemoMode) {
          await delay(1200);
          const performer = demoPerformers.find((p: Performer) => p.id === newEntry.submitted_by_performer_id);
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
      return supabase!.from('do_not_serve_list').insert(newEntry).select('*, performer:submitted_by_performer_id(name)');
  },

  async createBookingRequest(formState: BookingFormState, requestedPerformers: Performer[]): Promise<{ data: Booking[] | null, error: any }> {
     if (isDemoMode) {
        await delay(1500);
        const approvedDNS = demoDoNotServeList.filter((e: DoNotServeEntry) => e.status === 'approved');
        const isBlocked = approvedDNS.some((entry: DoNotServeEntry) => {
            const nameMatch = entry.client_name.trim().toLowerCase() === formState.fullName.trim().toLowerCase();
            const emailMatch = formState.email && entry.client_email && entry.client_email.trim().toLowerCase() === formState.email.trim().toLowerCase();
            const phoneMatch = formState.mobile && entry.client_phone && entry.client_phone.replace(/\s+/g, '') === formState.mobile.replace(/\s+/g, '');
            return nameMatch || emailMatch || phoneMatch;
        });

        if (isBlocked) {
             // In real app this communication would be handled by the caller or a trigger
            return { data: null, error: { message: "This client is on the 'Do Not Serve' list." }};
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
            status: 'pending_performer_acceptance',
            duration_hours: Number(formState.duration),
            services_requested: formState.selectedServices,
            id_document_path: `demo/id-${Date.now()}.pdf`,
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

    // Real Supabase Implementation
    let idDocumentPath = null;
    if (formState.idDocument) {
        const fileExt = formState.idDocument.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase!.storage
            .from('documents')
            .upload(fileName, formState.idDocument);

        if (uploadError) {
             return { data: null, error: { message: `ID Upload failed: ${uploadError.message}` } };
        }
        idDocumentPath = uploadData.path;
    }

    const bookingsToInsert = requestedPerformers.map(p => ({
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
        status: 'pending_performer_acceptance',
        duration_hours: Number(formState.duration),
        services_requested: formState.selectedServices,
        id_document_path: idDocumentPath,
        // created_at handled by DB default
    }));

    const { data, error } = await supabase!
        .from('bookings')
        .insert(bookingsToInsert)
        .select('*, performer:performer_id(id, name)');

    return { data: data as Booking[], error };
  },

  // --- CREATE PERFORMER ---
  async createPerformer(performerData: {
    name: string;
    tagline: string;
    photo_url: string;
    bio: string;
    service_ids: string[];
    service_areas: string[];
    status: PerformerStatus;
    phone: string;
    email?: string;
    rate_multiplier?: number;
  }) {
    if (isDemoMode) {
      await delay(800);
      const newPerformer: Performer = {
        id: Math.max(...demoPerformers.map(p => p.id)) + 1,
        ...performerData,
        created_at: new Date().toISOString(),
      };
      demoPerformers.push(newPerformer);
      return { data: newPerformer, error: null };
    }

    const { data, error } = await supabase!
      .from('performers')
      .insert([{
        name: performerData.name,
        tagline: performerData.tagline,
        photo_url: performerData.photo_url,
        bio: performerData.bio,
        service_ids: performerData.service_ids,
        service_areas: performerData.service_areas,
        status: performerData.status,
        phone: performerData.phone,
        email: performerData.email,
        rate_multiplier: performerData.rate_multiplier || 1.0
      }])
      .select()
      .single();

    return { data: data as Performer | null, error };
  }
};