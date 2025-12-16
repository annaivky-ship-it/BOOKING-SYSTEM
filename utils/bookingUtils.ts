
import { allServices } from '../data/mockData';
import { DEPOSIT_PERCENTAGE, REFERRAL_FEE_PERCENTAGE } from '../constants';

export const calculateBookingCost = (durationHours: number, serviceIds: string[], numPerformers: number) => {
    if (serviceIds.length === 0 || numPerformers === 0) return { totalCost: 0, depositAmount: 0, referralFee: 0 };
        
    const durationNum = Number(durationHours) || 0;
    let hourlyCost = 0;
    let flatCost = 0;

    serviceIds.forEach(serviceId => {
        const service = allServices.find(s => s.id === serviceId);
        if (!service) return;

        if (service.rate_type === 'flat') {
            flatCost += service.rate;
        } else if (service.rate_type === 'per_hour') {
            const hours = Math.max(durationNum, service.min_duration_hours || 0);
            hourlyCost += service.rate * hours;
        }
    });
    
    // Both hourly and flat costs are per performer
    const totalCost = (hourlyCost + flatCost) * numPerformers;
    const depositAmount = totalCost * DEPOSIT_PERCENTAGE;
    const referralFee = totalCost * REFERRAL_FEE_PERCENTAGE;
    return { totalCost, depositAmount, referralFee };
};
