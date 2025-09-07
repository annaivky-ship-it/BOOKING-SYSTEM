
import React, { useMemo } from 'react';
import type { Performer } from '../types';
import { allServices } from '../data/mockData';
import { ArrowLeft, Briefcase, Tag, Sparkles } from 'lucide-react';

interface PerformerProfileProps {
  performer: Performer;
  onBack: () => void;
  onBook: (performer: Performer) => void;
}

const PerformerProfile: React.FC<PerformerProfileProps> = ({ performer, onBack, onBook }) => {
  const performerServices = useMemo(() => {
    return allServices.filter(service => performer.service_ids.includes(service.id));
  }, [performer.service_ids]);

  const servicesByCategory = useMemo(() => {
    return performerServices.reduce((acc, service) => {
      (acc[service.category] = acc[service.category] || []).push(service);
      return acc;
    }, {} as Record<string, typeof performerServices>);
  }, [performerServices]);

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="mb-8 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Gallery
      </button>

      <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
        <div className="md:col-span-2">
          <div className="sticky top-28">
            <div className="relative">
                <img
                  src={performer.photo_url}
                  alt={performer.name}
                  className="rounded-2xl shadow-2xl shadow-black/50 w-full h-auto object-cover aspect-[3/4] border-4 border-zinc-800"
                />
                <div className="absolute -inset-2 rounded-2xl bg-orange-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-2">{performer.name}</h1>
          <p className="text-2xl text-orange-400 font-medium mb-8">{performer.tagline}</p>
          
          <div className="prose prose-invert prose-lg max-w-none text-zinc-300 mb-10 leading-relaxed">
            <p>{performer.bio}</p>
          </div>
          
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Briefcase className="h-7 w-7 text-orange-500" />
              Services Offered
            </h3>
            <div className="space-y-6">
              {Object.entries(servicesByCategory).map(([category, services]) => (
                <div key={category} className="card-base !p-6 !bg-zinc-900/50">
                  <h4 className="text-xl font-semibold text-orange-400 mb-4 border-b border-zinc-700 pb-3">{category}</h4>
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="text-zinc-300">
                        <div className="flex justify-between items-center gap-4">
                          <p className="font-bold text-white flex-1">{service.name}</p>
                          <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                            ${service.rate}
                            {service.rate_type === 'per_hour' ? '/hr' : ' flat'}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 mt-1">{service.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
           <button 
             onClick={() => onBook(performer)}
             className="btn-primary w-full md:w-auto py-4 px-10 text-lg flex items-center justify-center gap-3"
            >
            <Sparkles />
            Book {performer.name} Now
           </button>
        </div>
      </div>
    </div>
  );
};

export default PerformerProfile;