
import React, { useMemo, useState, useEffect } from 'react';
import type { Performer, Service, Booking, PerformerStatus } from '../types';
import { allServices } from '../data/mockData';
import { ArrowLeft, Briefcase, Sparkles, Clock, AlertCircle, ChevronDown, Plus, Check, CalendarPlus, RefreshCcw, Camera, X, Shuffle, History, Zap, MapPin, Calendar, Star, Layers, CalendarCheck, Info, Timer, LoaderCircle } from 'lucide-react';

interface PerformerProfileProps {
  performer: Performer;
  onBack: () => void;
  onBook: (performer: Performer, preferAsap?: boolean) => void;
  isSelected: boolean;
  onToggleSelection: (performer: Performer) => void;
  bookings: Booking[];
  canEditStatus?: boolean;
  onStatusChange?: (status: PerformerStatus) => void;
  onUpdateBooking?: (id: string, updates: Partial<Booking>) => Promise<void>;
}

const statusConfig: Record<PerformerStatus, { label: string; classes: string; dot: string }> = {
    available: { label: 'Available Now', classes: 'bg-green-500/20 border-green-500/40 text-green-400', dot: 'bg-green-400' },
    unavailable: { label: 'In High Demand', classes: 'bg-zinc-800/80 border-zinc-700 text-zinc-400', dot: 'bg-zinc-500' },
    pending: { label: 'System Review', classes: 'bg-purple-500/20 border-purple-500/40 text-purple-400', dot: 'bg-purple-400' },
    rejected: { label: 'Inactive', classes: 'bg-red-500/20 border-red-500/40 text-red-400', dot: 'bg-red-400' },
};

const PerformerProfile: React.FC<PerformerProfileProps> = ({ performer, onBack, onBook, isSelected, onToggleSelection, bookings, canEditStatus, onStatusChange, onUpdateBooking }) => {
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [gallerySortMode, setGallerySortMode] = useState<'default' | 'random'>('default');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [editingEtaId, setEditingEtaId] = useState<string | null>(null);
  const [etaValue, setEtaValue] = useState<string>('');
  const [isUpdatingEta, setIsUpdatingEta] = useState(false);

  const isAvailable = performer.status === 'available';

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const performerServices = useMemo(() => {
    return allServices.filter(service => performer.service_ids.includes(service.id));
  }, [performer.service_ids]);

  const servicesByCategory = useMemo(() => {
    return performerServices.reduce((acc, service) => {
      (acc[service.category] = acc[service.category] || []).push(service);
      return acc;
    }, {} as Record<string, Service[]>);
  }, [performerServices]);

  const toggleExpandService = (id: string) => {
    setExpandedServiceId(prev => prev === id ? null : id);
  };

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({
        ...prev,
        [category]: !prev[category]
    }));
  };

  const handleStatusToggle = () => {
      if (!canEditStatus || !onStatusChange || performer.status === 'rejected') return;
      const nextStatus: Record<PerformerStatus, PerformerStatus> = {
          available: 'unavailable',
          unavailable: 'available',
          pending: 'pending',
          rejected: 'rejected'
      };
      onStatusChange(nextStatus[performer.status]);
  };

  const handleUpdateEta = async (bookingId: string) => {
    if (!onUpdateBooking) return;
    setIsUpdatingEta(true);
    try {
      await onUpdateBooking(bookingId, { performer_eta_minutes: parseInt(etaValue) || null });
      setEditingEtaId(null);
    } finally {
      setIsUpdatingEta(false);
    }
  };

  const statusStyle = statusConfig[performer.status];

  const displayGallery = useMemo(() => {
    const urls = [...performer.gallery_urls];
    if (gallerySortMode === 'random') {
      for (let i = urls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [urls[i], urls[j]] = [urls[j], urls[i]];
      }
      return urls;
    }
    return urls;
  }, [performer.gallery_urls, gallerySortMode]);

  const confirmedUpcomingBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'confirmed').sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }, [bookings]);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-24 md:pb-0">
        {selectedImage && (
            <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl animate-fade-in" onClick={() => setSelectedImage(null)}>
                <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
                    <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-all p-3 bg-white/5 hover:bg-white/10 rounded-full z-10" onClick={() => setSelectedImage(null)}>
                        <X size={32} />
                    </button>
                    <img src={selectedImage} alt="Portfolio View" className="max-w-full max-h-full object-contain rounded-lg shadow-[0_0_100px_rgba(249,115,22,0.1)] border border-white/10" />
                </div>
            </div>
        )}

      <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden transition-transform duration-500 transform ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="glass !bg-zinc-900/90 !backdrop-blur-2xl border-white/10 rounded-[2rem] p-3 flex items-center justify-between shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.5)]">
           <div className="flex items-center gap-3 ml-2">
              <div className="relative">
                <img src={performer.photo_url} className="w-12 h-12 rounded-full object-cover border border-white/10" alt="" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 ${statusStyle.dot}`}></div>
              </div>
              <div>
                <p className="text-white font-black text-[10px] uppercase tracking-wider">{performer.name}</p>
                <p className="text-zinc-500 text-[8px] font-bold uppercase tracking-[0.2em]">{isAvailable ? 'Ready Now' : 'Schedule Future'}</p>
              </div>
           </div>
           <button 
            onClick={() => onBook(performer, isAvailable)}
            className="btn-primary !py-3.5 !px-6 !rounded-2xl !text-[10px] font-black flex items-center gap-2 shadow-lg shadow-orange-500/20"
           >
             {isAvailable ? <Zap size={14} className="fill-white" /> : <CalendarCheck size={14} />}
             BOOK NOW
           </button>
        </div>
      </div>

      <button
        onClick={onBack}
        className="mb-8 group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Return to Gallery
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        <div className="lg:col-span-4 space-y-8">
          <div className="lg:sticky lg:top-28 space-y-8">
            <div className="relative group">
                <div className="relative z-10 overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl aspect-[3/4]">
                    <img
                      src={performer.photo_url}
                      alt={performer.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                        <button
                            onClick={handleStatusToggle}
                            disabled={!canEditStatus || performer.status === 'pending' || performer.status === 'rejected'}
                            className={`w-full px-4 py-3 rounded-2xl border backdrop-blur-xl flex items-center justify-between shadow-2xl transition-all ${statusStyle.classes} ${canEditStatus && performer.status !== 'pending' && performer.status !== 'rejected' ? 'hover:scale-[1.02] active:scale-95 cursor-pointer' : 'cursor-default'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot} ${isAvailable ? 'animate-pulse' : ''} shadow-[0_0_12px_currentColor]`}></div>
                                <span className="font-black text-[11px] uppercase tracking-[0.15em]">{statusStyle.label}</span>
                            </div>
                            {canEditStatus && performer.status !== 'pending' && performer.status !== 'rejected' && <RefreshCcw size={14} className="opacity-70" />}
                        </button>
                    </div>
                </div>
                <div className="absolute -inset-4 rounded-[3.5rem] bg-orange-500/5 blur-3xl -z-0"></div>
            </div>

            <div className="card-base !p-8 bg-zinc-900/40 border-white/5 space-y-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Exclusive Booking</p>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Request {performer.name}</h3>
                </div>
                <div className="space-y-3">
                    <button 
                        onClick={() => onBook(performer, isAvailable)}
                        disabled={performer.status === 'rejected'}
                        className={`w-full btn-primary !py-5 flex items-center justify-center gap-3 !text-[11px] font-black shadow-xl hover:shadow-orange-500/20 ${!isAvailable ? 'grayscale opacity-80 hover:grayscale-0' : ''} ${performer.status === 'rejected' ? '!bg-zinc-800 cursor-not-allowed grayscale' : ''}`}
                    >
                        {isAvailable ? <Zap size={18} className="fill-white" /> : <CalendarPlus size={18} />}
                        {performer.status === 'rejected' ? 'UNAVAILABLE' : (isAvailable ? 'BOOK NOW' : 'PLAN AN EVENT')}
                    </button>
                    <button
                        onClick={() => onToggleSelection(performer)}
                        disabled={performer.status === 'rejected'}
                        className={`w-full py-5 rounded-2xl border transition-all flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest ${isSelected ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'} ${performer.status === 'rejected' ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                        {isSelected ? <Check size={18} /> : <Plus size={18} />}
                        {isSelected ? 'Selected' : 'Add to Inquiry'}
                    </button>
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center">
                    Identity Verified &bull; Confidentially Managed
                </p>
            </div>

            {performer.service_areas && performer.service_areas.length > 0 && (
                <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Available Regions</p>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">{performer.service_areas[0]}</p>
                    </div>
                </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-16 lg:pt-4">
          <section className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                </div>
                <h1 className="font-logo-main text-7xl md:text-8xl lg:text-9xl text-white tracking-tight uppercase leading-[0.85] break-words">
                  {performer.name}
                </h1>
                <p className="text-xl md:text-2xl text-zinc-400 font-black uppercase tracking-[0.2em] pt-4">
                  {performer.tagline}
                </p>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-medium first-letter:text-5xl first-letter:font-black first-letter:text-orange-500 first-letter:mr-3 first-letter:float-left first-letter:mt-1">
                {performer.bio}
              </p>
            </div>
            <div className="pt-8 flex flex-col sm:flex-row items-center gap-6">
               <button 
                  onClick={() => onBook(performer, isAvailable)}
                  className="btn-primary !py-6 !px-12 !text-base font-black tracking-[0.2em] flex items-center gap-4 group shadow-2xl hover:scale-105 transition-all"
               >
                  {isAvailable ? <Zap size={24} className="fill-white group-hover:scale-110 transition-transform" /> : <CalendarCheck size={24} />}
                  INITIATE BOOKING REQUEST
               </button>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Inquiry Response Time</span>
                  <span className="text-white font-bold uppercase tracking-widest text-xs">&lt; 15 Minutes (Instant)</span>
               </div>
            </div>
          </section>

          {performer.gallery_urls && performer.gallery_urls.length > 0 && (
             <section className="space-y-8">
                <div className="flex items-end justify-between border-b border-white/5 pb-6">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Camera size={24} className="text-orange-500" /> Portfolio
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Candid Visual Assets</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {displayGallery.map((url, index) => (
                        <div 
                          key={`${url}-${index}`} 
                          className="aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer border border-white/5 hover:border-orange-500/50 transition-all group relative bg-zinc-950" 
                          onClick={() => setSelectedImage(url)}
                        >
                            <img src={url} alt="Portfolio" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}
                </div>
             </section>
          )}

          <section className="space-y-8">
               <div className="space-y-1 border-b border-white/5 pb-6">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                       <Briefcase size={24} className="text-orange-500" /> Professional Services
                   </h3>
                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Select an option to view rates and engagement details</p>
               </div>
               
               <div className="space-y-6">
                   {(Object.entries(servicesByCategory) as [string, Service[]][]).map(([category, services]) => {
                       const isCollapsed = !!collapsedCategories[category];
                       return (
                           <div key={category} className="bg-zinc-900/20 rounded-[2.5rem] border border-white/5 overflow-hidden transition-all hover:border-orange-500/20 shadow-xl">
                               <button 
                                   onClick={() => toggleCategory(category)}
                                   className="w-full flex items-center justify-between bg-zinc-950/60 px-8 py-7 hover:bg-zinc-900 transition-all text-left group/cat"
                               >
                                   <div className="flex items-center gap-5">
                                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isCollapsed ? 'bg-zinc-900 text-zinc-600' : 'bg-orange-500 text-white shadow-lg'}`}>
                                           <Layers size={20} />
                                       </div>
                                       <div>
                                           <h4 className="font-black text-white text-xs uppercase tracking-[0.35em] group-hover/cat:text-orange-400 transition-colors">{category}</h4>
                                           <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{services.length} Premium Option{services.length !== 1 ? 's' : ''}</p>
                                       </div>
                                   </div>
                                   <div className={`w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-zinc-600 transition-all duration-500 ${isCollapsed ? '' : 'rotate-180 bg-white/5 text-white'}`}>
                                       <ChevronDown size={20} />
                                   </div>
                               </button>
                               
                               {!isCollapsed && (
                                   <div className="p-4 md:p-6 animate-fade-in space-y-4 bg-zinc-950/40">
                                       {services.map(service => (
                                           <div key={service.id} className="bg-zinc-900/50 rounded-3xl border border-white/[0.03] overflow-hidden group/item hover:border-white/10 transition-all shadow-lg">
                                               <button 
                                                   onClick={() => toggleExpandService(service.id)}
                                                   className="w-full flex items-center justify-between p-6 md:p-8 text-left transition-all hover:bg-white/[0.01]"
                                               >
                                                   <div className="flex-1">
                                                       <span className="font-black text-white text-lg block uppercase tracking-tight group-hover/item:text-orange-400 transition-colors leading-none">{service.name}</span>
                                                       <div className="flex items-center gap-3 mt-4">
                                                            <div className="bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                                                <span className="text-[12px] text-orange-500 font-black uppercase tracking-widest">${service.rate} AUD</span>
                                                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">{service.rate_type === 'per_hour' ? '/ HOUR' : ' (FIXED)'}</span>
                                                            </div>
                                                            {service.duration_minutes && <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] flex items-center gap-1.5 ml-2"><Clock size={12} className="text-zinc-700"/> {service.duration_minutes} MINS</span>}
                                                       </div>
                                                   </div>
                                                    <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-700 transition-all duration-300 group-hover/item:text-orange-500 ${expandedServiceId === service.id ? 'rotate-180 bg-orange-500/10 text-orange-500' : ''}`}>
                                                        {expandedServiceId === service.id ? <ChevronDown size={24} /> : <Plus size={24} />}
                                                    </div>
                                               </button>
                                               {expandedServiceId === service.id && (
                                                   <div className="px-8 pb-10 pt-4 animate-fade-in border-t border-white/[0.03] bg-black/10">
                                                       <div className="space-y-6 max-w-2xl">
                                                           <div>
                                                               <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                                                   <Info size={14} className="text-orange-500" /> Service Details
                                                               </p>
                                                               <p className="text-zinc-300 text-base leading-relaxed font-medium">{service.description}</p>
                                                           </div>
                                                           {service.booking_notes && (
                                                              <div className="mt-8 p-6 rounded-2xl bg-orange-500/[0.03] border border-orange-500/10">
                                                                  <div className="flex items-center gap-3 mb-3">
                                                                      <AlertCircle size={18} className="text-orange-500"/> 
                                                                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Guidelines</span>
                                                                  </div>
                                                                  <p className="text-[11px] font-bold uppercase tracking-widest text-orange-400/70 leading-relaxed italic">
                                                                      "{service.booking_notes}"
                                                                  </p>
                                                              </div>
                                                           )}
                                                       </div>
                                                   </div>
                                               )}
                                           </div>
                                       ))}
                                   </div>
                               )}
                           </div>
                       );
                   })}
               </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PerformerProfile;
