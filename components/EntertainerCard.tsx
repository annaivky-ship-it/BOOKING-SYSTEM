import React, { useState } from 'react';
import { Eye, Zap, MapPin, Check, Star, Clock, PlusCircle, CheckCircle, XCircle, LoaderCircle, ArrowRight } from 'lucide-react';
import type { Performer, PerformerStatus } from '../types';
import { allServices } from '../data/mockData';

interface PerformerCardProps {
  performer: Performer;
  onViewProfile: (performer: Performer) => void;
  onToggleSelection: (performer: Performer) => void;
  onBook: (performer: Performer) => void;
  isSelected: boolean;
}

type AvailabilityFeedback = 'idle' | 'checking' | 'available' | 'unavailable';

const statusConfig: Record<PerformerStatus, { dot: string; label: string }> = {
  available: { dot: 'bg-green-500', label: 'Available Now' },
  unavailable: { dot: 'bg-zinc-500', label: 'Book Future' },
  pending: { dot: 'bg-purple-500', label: 'Vetting' },
  rejected: { dot: 'bg-red-500', label: 'Busy' },
};

const PerformerCard: React.FC<PerformerCardProps> = ({ performer, onViewProfile, onToggleSelection, onBook, isSelected }) => {
  const [availCheck, setAvailCheck] = useState<AvailabilityFeedback>('idle');
  
  const statusStyle = statusConfig[performer.status];
  const isAvailable = performer.status === 'available';

  // Extract specialty and price range
  const performerServices = allServices.filter(s => performer.service_ids.includes(s.id));
  const specialty = performerServices[0]?.name || 'Premium Talent';
  const rates = performerServices.map(s => s.rate);
  const minRate = rates.length > 0 ? Math.min(...rates) : 0;

  const handleCheckAvailability = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvailCheck('checking');
    
    // Simulate API delay
    setTimeout(() => {
        const result = performer.status === 'available' ? 'available' : 'unavailable';
        setAvailCheck(result);
    }, 1500);
  };

  const renderAvailabilityOverlay = () => {
    if (availCheck === 'idle') return null;

    return (
      <div className="absolute inset-0 z-40 bg-zinc-950/98 backdrop-blur-xl animate-fade-in flex flex-col items-center justify-center p-8 text-center">
        <button 
          onClick={(e) => { e.stopPropagation(); setAvailCheck('idle'); }}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors p-2"
        >
          <XCircle size={24} />
        </button>

        {availCheck === 'checking' && (
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full"></div>
              <Clock size={56} className="text-yellow-500 mx-auto animate-pulse relative" />
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-black text-sm uppercase tracking-[0.3em]">Scanning Roster</h4>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">Confirming real-time arrival window...</p>
            </div>
            <LoaderCircle size={28} className="text-orange-500 mx-auto animate-spin" />
          </div>
        )}

        {availCheck === 'available' && (
          <div className="space-y-8 w-full max-w-[240px]">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
              <CheckCircle size={64} className="text-green-500 mx-auto relative" />
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-black text-sm uppercase tracking-[0.3em]">Ready for Dispatch</h4>
              <p className="text-green-500/80 text-[10px] font-black uppercase tracking-widest leading-relaxed">Talent is online and ready for your location</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onBook(performer); }}
              className="btn-primary !w-full !py-5 !rounded-2xl !text-[11px] font-black shadow-[0_20px_40px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              BOOK NOW
            </button>
          </div>
        )}

        {availCheck === 'unavailable' && (
          <div className="space-y-8 w-full max-w-[240px]">
            <XCircle size={64} className="text-red-500/50 mx-auto" />
            <div className="space-y-3">
              <h4 className="text-white font-black text-sm uppercase tracking-[0.3em]">Fully Booked</h4>
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">This talent is currently on a gig.</p>
            </div>
            <div className="pt-4 border-t border-white/5 space-y-3">
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-2">Available Alternatives:</p>
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setAvailCheck('idle'); }}
                        className="text-[9px] font-black text-zinc-300 uppercase tracking-widest bg-white/5 py-3 px-4 rounded-xl hover:bg-white/10 border border-white/5 flex items-center justify-between group/alt"
                    >
                        Other {specialty}s <ArrowRight size={12} className="group-hover/alt:translate-x-1 transition-transform" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setAvailCheck('idle'); }}
                        className="text-[9px] font-black text-zinc-300 uppercase tracking-widest bg-white/5 py-3 px-4 rounded-xl hover:bg-white/10 border border-white/5 flex items-center justify-between group/alt"
                    >
                        Nearby Talent <ArrowRight size={12} className="group-hover/alt:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`relative bg-zinc-950 rounded-[2.5rem] overflow-hidden group transition-all duration-700 border flex flex-col h-full ${isSelected ? 'border-orange-500 shadow-[0_30px_60px_-15px_rgba(249,115,22,0.3)] scale-[1.02]' : 'border-white/5 hover:border-white/20'}`}
    >
      {renderAvailabilityOverlay()}

      {/* Photo Area */}
      <div className="relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => onViewProfile(performer)}>
        <img
          src={performer.photo_url}
          alt={performer.name}
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
        />
        
        {/* Availability Dot Indicator */}
        <div className="absolute top-5 left-5 z-20 flex items-center gap-2.5 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-2xl">
          <div className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot} ${isAvailable ? 'animate-pulse shadow-[0_0_10px_currentColor]' : ''}`}></div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{statusStyle.label}</span>
        </div>

        {/* Info Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
        
        {/* Detail Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-8 z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-orange-500">
              {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-current" />)}
            </div>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Verified Talent</span>
          </div>
          <h3 className="font-logo-main text-5xl text-white tracking-tighter uppercase leading-none mb-2">
            {performer.name}
          </h3>
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            {specialty}
          </p>
          <div className="flex items-center gap-4 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><MapPin size={12} className="text-orange-500/70"/> {performer.service_areas[0]?.split(' ')[0]}</span>
            <span className="flex items-center gap-1.5"><Clock size={12} className="text-orange-500/70"/> From ${minRate}</span>
          </div>
        </div>
      </div>

      {/* Primary Action Area (Always Visible) */}
      <div className="p-6 pt-2 space-y-4 mt-auto bg-zinc-950 relative z-10">
        <div className="space-y-3">
          <button 
            onClick={(e) => { e.stopPropagation(); onBook(performer); }}
            className="w-full btn-primary !py-5 !rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:shadow-orange-500/20 transition-all active:scale-[0.98] group/book"
          >
            {isAvailable ? <Zap size={18} className="fill-white group-hover:scale-110 transition-transform" /> : <Clock size={18} />}
            <span className="font-black tracking-[0.2em] text-[11px] uppercase">{isAvailable ? 'INSTANT BOOK' : 'CHECK DATES'}</span>
          </button>

          <button 
            onClick={handleCheckAvailability}
            className="w-full py-4 rounded-2xl border border-orange-500/10 bg-orange-500/[0.03] text-orange-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-500/10 hover:border-orange-500/30 transition-all flex items-center justify-center gap-3"
          >
            <Clock size={14} />
            CHECK AVAILABILITY
          </button>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => onViewProfile(performer)}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-2.5 text-[10px] tracking-[0.2em] uppercase"
          >
            <Eye size={16} /> PROFILE
          </button>
          <button
            onClick={() => onToggleSelection(performer)}
            className={`w-14 font-black rounded-2xl border transition-all flex items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-400 text-white shadow-lg' : 'bg-zinc-900 border-white/5 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-400'}`}
          >
            {isSelected ? <Check size={20} strokeWidth={3} /> : <PlusCircle size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformerCard;