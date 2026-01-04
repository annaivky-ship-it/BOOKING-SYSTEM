
import { allServices } from '../data/mockData';
import { DEPOSIT_PERCENTAGE, REFERRAL_FEE_PERCENTAGE, PAY_ID_EMAIL } from '../constants';

export const calculateBookingCost = (
  globalDuration: number, 
  serviceIds: string[], 
  numPerformers: number,
  serviceDurations?: Record<string, number>
) => {
    if (serviceIds.length === 0 || numPerformers === 0) {
      return { totalCost: 0, depositAmount: 0, referralFee: 0, breakdown: [] };
    }
        
    let totalCost = 0;
    const breakdown: Array<{name: string, cost: number, details: string}> = [];

    serviceIds.forEach(serviceId => {
        const service = allServices.find(s => s.id === serviceId);
        if (!service) return;

        let serviceCost = 0;
        let details = "";

        if (service.rate_type === 'flat') {
            serviceCost = service.rate * numPerformers;
            details = `${numPerformers}x ${service.name} (Flat Rate)`;
        } else if (service.rate_type === 'per_hour') {
            // Use specific service duration if provided, otherwise fallback to global
            const duration = serviceDurations?.[serviceId] || globalDuration;
            const hours = Math.max(duration, service.min_duration_hours || 0);
            serviceCost = service.rate * hours * numPerformers;
            details = `${numPerformers}x ${service.name} (${hours}h @ $${service.rate}/h)`;
        }
        
        totalCost += serviceCost;
        breakdown.push({ name: service.name, cost: serviceCost, details });
    });
    
    const depositAmount = totalCost * DEPOSIT_PERCENTAGE;
    const referralFee = totalCost * REFERRAL_FEE_PERCENTAGE;
    
    return { totalCost, depositAmount, referralFee, breakdown };
};

export const generatePayIDLink = (amount: number, reference: string, email: string = PAY_ID_EMAIL) => {
  const baseUrl = `payto://payid/${email}`;
  const params = new URLSearchParams({
    amount: amount.toFixed(2),
    currency: 'AUD',
    description: reference.substring(0, 18),
  });
  return `${baseUrl}?${params.toString()}`;
};

interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationHours: number;
}

export const generateCalendarLinks = (event: CalendarEvent) => {
  const start = new Date(`${event.date}T${event.time}`);
  const end = new Date(start.getTime() + event.durationHours * 60 * 60 * 1000);

  const formatUTC = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');

  const googleParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatUTC(start)}/${formatUTC(end)}`,
    details: event.description,
    location: event.location,
  });
  const googleUrl = `https://www.google.com/calendar/render?${googleParams.toString()}`;

  const outlookParams = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: event.description,
    location: event.location,
  });
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?${outlookParams.toString()}`;

  const yahooParams = new URLSearchParams({
    v: '60',
    title: event.title,
    st: formatUTC(start),
    dur: (event.durationHours * 100).toString(), // Yahoo uses HHmm duration
    desc: event.description,
    in_loc: event.location
  });
  const yahooUrl = `https://calendar.yahoo.com/?${yahooParams.toString()}`;

  return { googleUrl, outlookUrl, yahooUrl };
};
