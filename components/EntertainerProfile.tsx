
import React, { useMemo, useState } from 'react';
import type { Performer, Service, Booking, PerformerStatus } from '../types';
import { allServices } from '../data/mockData';
import { ArrowLeft, Briefcase, Sparkles, Clock, AlertCircle, ChevronDown, Plus, Check, CalendarCheck, CalendarPlus, RefreshCcw, Camera, X } from 'lucide-react';

interface PerformerProfileProps {
  performer: Performer;
  onBack: () => void;
  onBook: (performer: Performer) => void;
  isSelected: boolean;
  onToggleSelection: (performer: Performer) => void;
  bookings: Booking[];
  canEditStatus?: boolean;
  onStatusChange?: (status: PerformerStatus) => void;
}

const statusConfig: Record<PerformerStatus, { label: string; classes: string; dot: string }> = {
    available: { label: 'Available', classes: 'bg-green-950/80 border-green-500 text-green-400', dot: 'bg-green-500' },
    busy: { label: 'Busy', classes: 'bg-yellow-950/80 border-yellow-500 text-yellow-400', dot: 'bg-yellow-500' },
    offline: { label: 'Offline', classes: 'bg-zinc-950/80 border-zinc-500 text-zinc-400', dot: 'bg-zinc-500' },
    pending: { label: 'Pending Review', classes: 'bg-purple-950/80 border-purple-500 text-purple-400', dot: 'bg-purple-500' },
};

const PerformerProfile: React.FC<PerformerProfileProps> = ({ performer, onBack, onBook, isSelected, onToggleSelection, bookings, canEditStatus, onStatusChange }) => {
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const performerServices = useMemo(() => {
    return allServices.filter(service => performer.service_ids.includes(service.id));
  }, [performer.service_ids]);

  const servicesByCategory = useMemo(() => {
    return performerServices.reduce((acc, service) => {
      (acc[service.category] = acc[service.category] || []).push(service);
      return acc;
    }, {} as Record<string, typeof performerServices>);
  }, [performerServices]);

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings
        .filter(b => {
            const eventDate = new Date(`${b.event_date}T${b.event_time}`);
            // Show confirmed bookings in the future
            return eventDate > now && b.status === 'confirmed'; 
        })
        .sort((a, b) => new Date(`${a.event_date}T${a.event_time}`).getTime() - new Date(`${b.event_date}T${b.event_time}`).getTime());
  }, [bookings]);

  const toggleExpand = (id: string) => {
    setExpandedServiceId(prev => prev === id ? null : id);
  };

  const handleStatusToggle = () => {
      if (!canEditStatus || !onStatusChange) return;
      const nextStatus: Record<PerformerStatus, PerformerStatus> = {
          available: 'busy',
          busy: 'offline',
          offline: 'available',
          pending: 'pending' // Cannot toggle pending via profile page
      };
      onStatusChange(nextStatus[performer.status]);
  };

  const statusStyle = statusConfig[performer.status];

  return (
    <div className="animate-fade-in">
        {selectedImage && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
                <div className="relative max-w-5xl w-full max-h-screen">
                    <button className="absolute -top-12 right-0 text-zinc-400 hover:text-white transition-colors" onClick={() => setSelectedImage(null)}>
                        <X size={32} />
                    </button>
                    <img src={selectedImage} alt="Full view" className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl" />
                </div>
            </div>
        )}

      <button
        onClick={onBack}
        className="mb-8 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Gallery
      </button>

      <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
        <div className="md:col-span-2">
          <div className="sticky top-28 space-y-8">
            <div className="relative group">
                <img
                  src={performer.photo_url}
                  alt={performer.name}
                  className="rounded-2xl shadow-2xl shadow-black/50 w-full h-auto object-cover aspect-[3/4] border-4 border-zinc-800 relative z-10"
                />
                
                {/* Status Badge / Toggle */}
                <button
                    onClick={handleStatusToggle}
                    disabled={!canEditStatus || performer.status === 'pending'}
                    className={`absolute top-4 right-4 z-20 px-4 py-2 rounded-full border backdrop-blur-md flex items-center gap-2 shadow-xl transition-all ${statusStyle.classes} ${canEditStatus && performer.status !== 'pending' ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}
                    title={canEditStatus ? "Click to change status" : `Current status: ${statusStyle.label}`}
                >
                    <div className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot} animate-pulse shadow-[0_0_8px_currentColor]`}></div>
                    <span className="font-bold text-sm uppercase tracking-wide">{statusStyle.label}</span>
                    {canEditStatus && performer.status !== 'pending' && <RefreshCcw size={14} className="ml-1 opacity-70" />}
                </button>

                <div className="absolute -inset-2 rounded-2xl bg-orange-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CalendarCheck className="text-orange-500" size={20} />
                    Future Bookings
                </h3>
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                    {performer.name} works as a freelancer across multiple agencies. As such, online availability may not be real-time.
                    <br/><br/>
                    Please submit a booking request for your desired date. We will confirm availability with the performer immediately.
                </p>
                <button 
                    onClick={() => onBook(performer)}
                    className="w-full btn-primary py-3 flex items-center justify-center gap-2 font-bold"
                >
                    <CalendarPlus size={18} />
                    Request Date
                </button>
            </div>

            {upcomingBookings.length > 0 && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="text-orange-500" size={20} />
                        Next Up (Flavor Only)
                    </h3>
                    <div className="space-y-3">
                        {upcomingBookings.slice(0, 3).map(booking => (
                            <div key={booking.id} className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/50 text-sm">
                                <div className="font-semibold text-zinc-200">{booking.event_type}</div>
                                <div className="text-zinc-400 mt-1 flex justify-between">
                                    <span>{new Date(booking.event_date).toLocaleDateString()}</span>
                                    <span>{booking.client_name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>

        <div className="md:col-span-3">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-2">{performer.name}</h1>
          <p className="text-2xl text-orange-400 font-medium mb-6">{performer.tagline}</p>
          
          <div className="flex flex-wrap gap-4 mb-6">
             <button 
               onClick={() => onBook(performer)}
               className="btn-primary flex-1 md:flex-none py-3 px-8 text-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transform hover:-translate-y-1 transition-all"
            >
              <Sparkles className="h-5 w-5" />
              Book Solo Now
             </button>
             <button
                onClick={() => onToggleSelection(performer)}
                className={`flex-1 md:flex-none py-3 px-8 text-lg flex items-center justify-center gap-2 rounded-lg font-semibold transition-all border ${isSelected ? 'bg-green-600 border-green-500 text-white hover:bg-green-700' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'}`}
             >
                {isSelected ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {isSelected ? 'Added to Booking' : 'Add to Group Booking'}
             </button>
          </div>

          <button
            onClick={() => onBook(performer)}
            className="w-full mb-10 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] border border-green-500"
          >
            <CalendarCheck className="h-6 w-6" />
            <span className="text-lg">Confirm Booking for {performer.name}</span>
          </button>

          <div className="prose prose-invert prose-lg max-w-none text-zinc-300 mb-10 leading-relaxed">
            <p>{performer.bio}</p>
          </div>
          
          {performer.gallery_urls && performer.gallery_urls.length > 0 && (
             <div className="mb-12">
                <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <Camera className="h-7 w-7 text-orange-500" />
                    Photo Gallery
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {performer.gallery_urls.map((url, index) => (
                        <div key={index} className="aspect-square rounded-xl overflow-hidden cursor-pointer border border-zinc-800 hover:border-orange-500 transition-colors group relative" onClick={() => setSelectedImage(url)}>
                            <img 
                                src={url} 
                                alt={`${performer.name} gallery ${index + 1}`} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}
                </div>
             </div>
          )}

           {/* Services Section */}
           <div>
               <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                   <Briefcase className="h-7 w-7 text-orange-500" />
                   Services
               </h3>
               <div className="grid gap-4">
                   {Object.entries(servicesByCategory).map(([category, services]) => (
                       <div key={category} className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
                           <div className="bg-zinc-800/50 px-6 py-3 border-b border-zinc-800">
                               <h4 className="font-bold text-orange-400">{category}</h4>
                           </div>
                           <div className="p-2">
                               {services.map(service => (
                                   <div key={service.id} className="border-b border-zinc-800/50 last:border-0">
                                       <button 
                                           onClick={() => toggleExpand(service.id)}
                                           className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/30 transition-colors rounded-lg"
                                       >
                                           <div>
                                               <span className="font-semibold text-white block">{service.name}</span>
                                               <span className="text-xs text-orange-400 font-mono">${service.rate} {service.rate_type === 'per_hour' ? '/hr' : ' flat'}</span>
                                           </div>
                                            {expandedServiceId === service.id ? <ChevronDown className="text-zinc-500" size={18}/> : <ChevronDown className="text-zinc-500 -rotate-90" size={18}/>}
                                       </button>
                                       {expandedServiceId === service.id && (
                                           <div className="px-4 pb-4 pt-0 text-sm text-zinc-400 pl-4 border-l-2 border-orange-500/20 ml-4 mb-2 animate-fade-in-down">
                                               <p>{service.description}</p>
                                               {service.min_duration_hours && <p className="mt-2 text-xs opacity-70">Min Duration: {service.min_duration_hours} hr</p>}
                                               {service.booking_notes && <div className="mt-2 flex items-start gap-1.5 text-xs text-yellow-500/80 bg-yellow-900/10 p-2 rounded"><AlertCircle size={12} className="mt-0.5"/> {service.booking_notes}</div>}
                                           </div>
                                       )}
                                   </div>
                               ))}
                           </div>
                       </div>
                   ))}
               </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default PerformerProfile;
