
import React, { useState, useMemo } from 'react';
import { Briefcase, ChevronDown, MapPin, Radio, Search, Zap, ShoppingCart, X, ArrowRight, Filter, Crown, Star, RotateCcw, Users } from 'lucide-react';
import type { Performer, PerformerStatus } from '../types';
import { allServices, WA_REGIONS } from '../data/mockData';
import PerformerCard from './EntertainerCard';

interface PerformerGalleryProps {
  performers: Performer[];
  onViewProfile: (performer: Performer) => void;
  onToggleSelection: (performer: Performer) => void;
  onBook: (performer: Performer) => void;
  onProceedToBooking: (preferAsap?: boolean) => void;
  selectedIds: number[];
  searchQuery: string;
  viewMode: 'available_now' | 'future_bookings';
}

const FeaturedPerformerCard: React.FC<{
    performer: Performer;
    onViewProfile: (p: Performer) => void;
    onBook: (p: Performer) => void;
}> = ({ performer, onViewProfile, onBook }) => {
    return (
        <div 
            onClick={() => onViewProfile(performer)}
            className="group relative h-[500px] rounded-[3rem] overflow-hidden border border-orange-500/20 shadow-2xl transition-all hover:border-orange-500/50 cursor-pointer"
        >
            <img src={performer.photo_url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={performer.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
            
            <div className="absolute top-6 left-6 flex items-centre gap-2 bg-orange-500 text-white px-4 py-2 rounded-2xl shadow-xl z-20">
                <Crown size={16} fill="white" />
                <span className="text-[10px] font-black uppercase tracking-widest">PREMIER ASSET</span>
            </div>

            <div className="absolute bottom-10 left-10 right-10 z-20 space-y-4">
                <div className="flex items-centre gap-2">
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Vetted Elite</span>
                </div>
                <div>
                    <h3 className="font-logo-main text-6xl text-white uppercase tracking-tighter leading-none mb-2">{performer.name}</h3>
                    <p className="text-orange-400 text-sm font-black uppercase tracking-[0.2em]">{performer.tagline}</p>
                </div>
                <div className="flex gap-4 pt-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onBook(performer); }}
                        className="btn-primary !px-8 !py-4 !rounded-2xl !text-[10px] font-black shadow-xl shadow-orange-500/20"
                    >
                        INITIATE DISPATCH
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 backdrop-blur-xl px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all">
                        VIEW PROFILE
                    </button>
                </div>
            </div>
        </div>
    );
}

const PerformerGallery: React.FC<PerformerGalleryProps> = ({
  performers,
  onViewProfile,
  onToggleSelection,
  onBook,
  onProceedToBooking,
  selectedIds,
  searchQuery,
  viewMode,
}) => {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<PerformerStatus | ''>('');

  const uniqueCategories = useMemo(() => [...new Set(allServices.map((s) => s.category))], []);

  const filteredPerformers = useMemo(() => {
    const publicPerformers = performers.filter((p) => p.status === 'available' || p.status === 'unavailable');
    const basePerformers = viewMode === 'available_now' ? publicPerformers.filter(p => p.status === 'available') : publicPerformers;
    
    return basePerformers.filter((p) => {
      const categoryMatch = !categoryFilter || p.service_ids.some((id) => allServices.find((s) => s.id === id)?.category === categoryFilter);
      const areaMatch = !areaFilter || (p.service_areas && p.service_areas.includes(areaFilter));
      const statusMatch = !statusFilter || p.status === statusFilter;
      const searchMatch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && areaMatch && statusMatch && searchMatch;
    });
  }, [performers, categoryFilter, areaFilter, statusFilter, viewMode, searchQuery]);

  const selectedCount = selectedIds.length;
  const isAvailableNow = viewMode === 'available_now';

  const handleResetFilters = () => {
    setCategoryFilter('');
    setAreaFilter('');
    setStatusFilter('');
  };

  return (
    <div className="animate-fade-in space-y-20 pb-32">
      <div 
        className={`fixed z-[70] transition-all duration-500 transform 
          bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-lg
          md:left-auto md:right-8 md:translate-x-0 md:w-80
          ${selectedCount > 0 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="glass !bg-zinc-900/95 !backdrop-blur-3xl border-orange-500/40 rounded-[2rem] p-3 flex flex-col md:gap-4 shadow-2xl border-2">
           <div className="flex items-centre justify-between px-2 md:px-4 md:pt-2">
              <div className="flex items-centre gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-centre justify-centre text-white">
                    <ShoppingCart size={18} strokeWidth={3} />
                  </div>
                  {selectedCount > 1 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-black text-[10px] font-black flex items-centre justify-centre border-2 border-zinc-900">
                      {selectedCount}
                    </span>
                  )}
                </div>
                <p className="text-white font-black text-[11px] uppercase tracking-widest">{selectedCount} Assets Selected</p>
              </div>
              <button 
                onClick={() => onProceedToBooking(isAvailableNow)}
                className="btn-primary !py-3 !px-6 !rounded-xl !text-[10px] font-black"
              >
                DISPATCH
              </button>
           </div>
           <button 
            onClick={() => onProceedToBooking(isAvailableNow)}
            className="hidden md:flex btn-primary !w-full !py-5 !rounded-2xl !text-[11px] font-black items-centre justify-centre shadow-xl"
           >
            INITIATE DISPATCH
           </button>
        </div>
      </div>

      <div className="space-y-12">
          {/* Simplified operational filters */}
          <div className="bg-zinc-950/40 border border-white/5 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-xl shadow-2xl max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Location</label>
                    <select
                        onChange={(e) => setAreaFilter(e.target.value)}
                        value={areaFilter}
                        className="input-base !py-4 !text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer border-white/5 bg-zinc-900/60"
                    >
                        <option value="">All Regions</option>
                        {WA_REGIONS.map((area) => <option key={area} value={area}>{area.toUpperCase()}</option>)}
                    </select>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Service Type</label>
                    <select
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        value={categoryFilter}
                        className="input-base !py-4 !text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer border-white/5 bg-zinc-900/60"
                    >
                        <option value="">All Categories</option>
                        {uniqueCategories.map((cat) => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                    </select>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Availability</label>
                    <select
                        onChange={(e) => setStatusFilter(e.target.value as PerformerStatus | '')}
                        value={statusFilter}
                        className="input-base !py-4 !text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer border-white/5 bg-zinc-900/60"
                        disabled={isAvailableNow}
                    >
                        {isAvailableNow ? (
                          <option value="available">Available Now</option>
                        ) : (
                          <>
                            <option value="">Any Status</option>
                            <option value="available">Available Now</option>
                            <option value="unavailable">Engaged</option>
                          </>
                        )}
                    </select>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex items-centre justify-between">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  {filteredPerformers.length} Assets Identified
              </span>
              <div className="flex items-centre gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isAvailableNow ? 'bg-green-500 shadow-lg' : 'bg-zinc-700'}`}></div>
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                    {isAvailableNow ? 'LIVE DISPATCH REGISTRY ACTIVE' : 'REGISTRY SYNCHRONISED'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredPerformers.map((performer) => (
              <PerformerCard
                key={performer.id}
                performer={performer}
                onViewProfile={onViewProfile}
                onToggleSelection={onToggleSelection}
                onBook={onBook}
                isSelected={selectedIds.includes(performer.id)}
              />
            ))}
          </div>
      </div>
    </div>
  );
};

export default PerformerGallery;
