import React, { useState, useMemo } from 'react';
import { Briefcase, ChevronDown, MapPin, Radio, Search, Zap, ShoppingCart, X, ArrowRight, Filter } from 'lucide-react';
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

  // Get name of first selected performer if only one is selected
  const selectedName = useMemo(() => {
    if (selectedCount === 1) {
      return performers.find(p => p.id === selectedIds[0])?.name;
    }
    return null;
  }, [selectedIds, performers, selectedCount]);

  const handleClearSelection = () => {
    selectedIds.forEach(id => {
      const p = performers.find(perf => perf.id === id);
      if (p) onToggleSelection(p);
    });
  };

  return (
    <div className="animate-fade-in space-y-10 pb-32">
      {/* Sticky Action Bar: Center-bottom on Mobile, Floating-right on Desktop */}
      <div 
        className={`fixed z-[70] transition-all duration-500 transform 
          bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-lg
          md:left-auto md:right-8 md:translate-x-0 md:w-80
          ${selectedCount > 0 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="glass !bg-zinc-900/95 !backdrop-blur-3xl border-orange-500/40 rounded-[2rem] p-3 flex flex-col md:gap-4 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border-2">
           <div className="flex items-center justify-between px-2 md:px-4 md:pt-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <ShoppingCart size={18} strokeWidth={3} />
                  </div>
                  {selectedCount > 1 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-black text-[10px] font-black flex items-center justify-center border-2 border-zinc-900">
                      {selectedCount}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                   <p className="text-white font-black text-[11px] uppercase tracking-widest leading-none">
                      {selectedName ? selectedName : `${selectedCount} Talent Selected`}
                   </p>
                   <button 
                    onClick={handleClearSelection}
                    className="text-zinc-500 hover:text-red-400 text-[8px] font-black uppercase tracking-[0.2em] mt-1 text-left transition-colors flex items-center gap-1 group/clear"
                  >
                    <X size={10} className="group-hover/clear:rotate-90 transition-transform" />
                    Clear Selection
                  </button>
                </div>
              </div>

              {/* Mobile layout keeps Book Now next to info, Desktop moves it below */}
              <button 
                onClick={() => onProceedToBooking(isAvailableNow)}
                className="md:hidden btn-primary !py-3 !px-6 !rounded-xl !text-[10px] font-black flex items-center gap-2 group/btn shadow-xl shadow-orange-500/20"
              >
                BOOK NOW
                <ArrowRight size={14} />
              </button>
           </div>

           {/* Desktop Book Now Button (Full Width) */}
           <button 
            onClick={() => onProceedToBooking(isAvailableNow)}
            className="hidden md:flex btn-primary !w-full !py-5 !rounded-2xl !text-[11px] font-black items-center justify-center gap-3 group/btn shadow-xl shadow-orange-500/20 active:scale-95"
           >
            INITIATE BOOKING
            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>

      {/* Simplified Filter Bar */}
      <div className="bg-zinc-950/40 border border-white/5 rounded-[2rem] p-4 md:p-6 backdrop-blur-xl shadow-2xl max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                <select
                    onChange={(e) => setAreaFilter(e.target.value)}
                    value={areaFilter}
                    className="input-base !pl-12 !py-3.5 !text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer border-transparent bg-zinc-900/50 hover:bg-zinc-900"
                >
                    <option value="">Any Location</option>
                    {WA_REGIONS.map((area) => <option key={area} value={area}>{area.toUpperCase()}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600 pointer-events-none" />
            </div>

            <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                <select
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    value={categoryFilter}
                    className="input-base !pl-12 !py-3.5 !text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer border-transparent bg-zinc-900/50 hover:bg-zinc-900"
                >
                    <option value="">Any Service</option>
                    {uniqueCategories.map((cat) => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600 pointer-events-none" />
            </div>

            <div className="relative group">
                <Radio className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                <select
                    onChange={(e) => setStatusFilter(e.target.value as PerformerStatus | '')}
                    value={statusFilter}
                    className="input-base !pl-12 !py-3.5 !text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer border-transparent bg-zinc-900/50 hover:bg-zinc-900"
                >
                    <option value="">Any Availability</option>
                    <option value="available">Online Now</option>
                    <option value="unavailable">Book Future</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600 pointer-events-none" />
            </div>
        </div>
      </div>

      {/* Available Count Header */}
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full mb-4">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">
            {performers.filter(p => p.status === 'available').length} Professionals Online Now
          </span>
        </div>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
          Select your favorite talent to check their arrival time for your location.
        </p>
      </div>

      {/* Grid */}
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
  );
};

export default PerformerGallery;