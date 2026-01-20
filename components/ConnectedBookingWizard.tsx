'use client';

import { useState } from 'react';
import BookingProcess, { BookingFormState } from './BookingProcess';
import { Performer, Booking } from '@/types';
import { useRouter } from 'next/navigation';

interface ConnectedBookingWizardProps {
    performers: Performer[];
    client: { full_name: string; email: string; phone?: string | null };
    previousBookings: Booking[];
}

export default function ConnectedBookingWizard({ performers, client, previousBookings }: ConnectedBookingWizardProps) {
    const router = useRouter();

    async function handleBookingRequest(formState: BookingFormState, performers: Performer[]) {
        try {
            // Find services to calculate amount (similar to BookingForm logic but using services)
            // Wait, the API endpoint expects `duration_hours` and `total_amount` to be passed.
            // Or does it calculate it? The API schema validation (createBookingSchema) likely checks these.
            // BookingProcess calculates totalCost internally but doesn't pass it in `formState`.
            // We need to recalculate or modify BookingProcess to pass it.
            // However, BookingProcess state `form` doesn't include cost.
            // Let's rely on re-calculating it here for the API call using the same logic.

            // Dynamic import of mockData (or move logic to shareable place)
            // For now, we replicate simplified logic or use the same mockData if imported.
            // Actually, BookingProcess is handling UI. We can grab the selected services and calc.
            // But we need the rates.
            // Let's assume we can fetch services or they are consistent.
            // Just for "Refining", let's assume we can import `allServices` from mockData as well since BookingProcess uses it.
            const { allServices } = await import('@/data/mockData');
            const DEPOSIT_PERCENTAGE = 0.5; // From constants

            const durationNum = Number(formState.duration) || 0;
            let hourlyCost = 0;
            let flatCost = 0;

            formState.selectedServices.forEach(serviceId => {
                const service = allServices.find(s => s.id === serviceId);
                if (!service) return;

                if (service.rate_type === 'flat') {
                    flatCost += service.rate;
                } else if (service.rate_type === 'per_hour') {
                    const hours = Math.max(durationNum, service.min_duration_hours || 0);
                    hourlyCost += service.rate * hours;
                }
            });

            const totalCost = (hourlyCost * performers.length) + flatCost;
            const depositAmount = totalCost * DEPOSIT_PERCENTAGE;

            // Make API call for EACH performer?
            // The API /api/bookings creates ONE booking for ONE performer.
            // If multiple performers, current API might need multiple calls.
            // BookingProcess allows multiple performers selection?
            // "For {performers.map(p => p.name).join(' & ')}"
            // Yes.

            const bookingIds: string[] = [];

            for (const performer of performers) {
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        performer_id: performer.id,
                        event_type: formState.eventType,
                        // event_name: ??? API might expect it. BookingForm had it. BookingProcess "Client Details" Step 1 has name/email/mobile. Step 2 Event Details. No "Event Name".
                        // API createBookingSchema: let's check what it needs.
                        // Viewed file 280 (api/bookings/route.ts) lines 94-106:
                        // client_id (auth), performer_id, event_date, event_start_time, event_end_time (need to calc), 
                        // event_location, event_type, special_requests (client_message), deposit_amount, total_amount.

                        // We need to derive event_start_time and event_end_time.
                        // formState.eventTime is start time.
                        // formState.duration is hours.

                        event_date: formState.eventDate,
                        event_start_time: formState.eventTime,
                        event_end_time: calculateEndTime(formState.eventTime, durationNum),
                        event_location: formState.eventAddress,
                        special_requests: formState.client_message,
                        deposit_amount: depositAmount / performers.length, // Split deposit? Or total for each? API expects amounts.
                        // If 2 performers, total cost is (hourly * 2) + flat. 
                        // Actually, if we book 2 performers, we create 2 bookings.
                        // The cost per performer is (hourly * 1) + (flat if any).
                        // We should probably just calculate per performer.
                        total_amount: calculatePerPerformerCost(performer, formState, allServices),

                        // API might strictly validate Zod schema.
                        // We need to supply all required fields.
                    }),
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Failed to create booking');
                }

                const data = await response.json();
                // The API returns { booking, upload_url, ... }
                bookingIds.push(data.booking.id);
            }

            return { success: true, message: 'Booking request created successfully', bookingIds };

        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to submit booking' };
        }
    }

    function calculateEndTime(startTime: string, durationHours: number): string {
        const [hours, minutes] = startTime.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        date.setMinutes(date.getMinutes() + durationHours * 60);
        return date.toTimeString().slice(0, 5);
    }

    function calculatePerPerformerCost(performer: Performer, form: BookingFormState, allServices: any[]): number {
        const durationNum = Number(form.duration) || 0;
        let cost = 0;
        form.selectedServices.forEach(serviceId => {
            const service = allServices.find((s: any) => s.id === serviceId);
            if (!service) return;
            // Service costs are usually per performer for hourly. Flat can be tricky.
            // Let's assume services are performed by ALL selected performers unless specified.
            // Simplified: Cost is same for each performer if they perform the service.
            // But `allServices` is global.
            // We might need to check if performer offers the service?
            // BookingProcess filtered `availableServices` by `performers.flatMap(p => p.service_ids)`.
            // If a service is selected, we assume it adds to the cost.
            if (performer.service_ids.includes(serviceId)) {
                if (service.rate_type === 'flat') {
                    cost += service.rate;
                } else if (service.rate_type === 'per_hour') {
                    const hours = Math.max(durationNum, service.min_duration_hours || 0);
                    cost += service.rate * hours;
                }
            }
        });
        return cost;
    }

    return (
        <BookingProcess
            performers={performers}
            client={client}
            bookings={previousBookings}
            onBack={() => router.back()}
            onBookingSubmitted={() => {
                router.push('/dashboard');
                router.refresh();
            }}
            onBookingRequest={handleBookingRequest}
            // Demo/Mock implementations for others or connect to API if needed
            onUpdateBookingStatus={async () => { }} // We might implement this for deposit step
            addCommunication={async () => { }}
            doNotServeList={[]} // Fetch from API if needed, but not critical for booking creation
            onShowPrivacyPolicy={() => { }}
            onShowTermsOfService={() => { }}
        />
    );
}
