import React, { useMemo } from 'react';
import { ArrowLeft, Briefcase, Clock, Info } from 'lucide-react';
import type { Service } from '../types';
import { allServices } from '../data/mockData';

interface ServicesPageProps {
  onBack: () => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ onBack }) => {
  const servicesByCategory = useMemo(() => {
    return allServices.reduce((acc, service) => {
      (acc[service.category] = acc[service.category] || []).push(service);
      return acc;
    }, {} as Record<string, Service[]>);
  }, []);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="mb-8 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Gallery
      </button>

      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">Our Services</h1>
        <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
          Detailed explanations of the premium entertainment options we offer. All services are performed with the utmost professionalism and are tailored to create a memorable experience.
        </p>
      </div>

      <div className="space-y-12">
        {Object.entries(servicesByCategory).map(([category, services]: [string, Service[]]) => (
          <div key={category}>
            <h2 className="text-3xl font-bold text-orange-400 mb-6 border-b-2 border-orange-500/30 pb-3 flex items-center gap-3">
              <Briefcase /> {category}
            </h2>
            <div className="space-y-6">
              {services.map((service) => (
                <div key={service.id} className="card-base !p-6 !bg-zinc-900/50 transform hover:-translate-y-1 transition-transform">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{service.name}</h3>
                      <p className="text-zinc-300 mt-1">{service.description}</p>
                    </div>
                    <div className="flex-shrink-0 bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-lg font-bold whitespace-nowrap">
                      ${service.rate}
                      <span className="text-sm font-semibold">{service.rate_type === 'per_hour' ? '/hr' : ' flat'}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-700/50 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-400">
                    {service.min_duration_hours && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-orange-500" />
                        <span>Minimum: {service.min_duration_hours} hour{service.min_duration_hours > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {service.duration_minutes && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-orange-500" />
                        <span>Duration: {service.duration_minutes} minutes</span>
                      </div>
                    )}
                    {service.booking_notes && (
                      <div className="flex items-center gap-2">
                        <Info size={16} className="text-orange-500" />
                        <span>Note: {service.booking_notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;