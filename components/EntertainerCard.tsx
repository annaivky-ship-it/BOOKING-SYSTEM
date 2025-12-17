
import React from 'react';
import { Eye, PlusCircle, CheckCircle, Sparkles } from 'lucide-react';
import type { Performer, PerformerStatus } from '../types';

interface PerformerCardProps {
  performer: Performer;
  onViewProfile: (performer: Performer) => void;
  onToggleSelection: (performer: Performer) => void;
  onBook: (performer: Performer) => void;
  isSelected: boolean;
}

const statusConfig: Record<PerformerStatus, { dot: string; badge: string }> = {
  available: { dot: 'bg-green-500', badge: 'bg-black/60 border-green-500/50 text-green-400' },
  busy: { dot: 'bg-yellow-500', badge: 'bg-black/60 border-yellow-500/50 text-yellow-400' },
  offline: { dot: 'bg-zinc-500', badge: 'bg-black/60 border-zinc-500/50 text-zinc-400' },
  pending: { dot: 'bg-purple-500', badge: 'bg-black/60 border-purple-500/50 text-purple-400' },
};

const PerformerCard: React.FC<PerformerCardProps> = ({ performer, onViewProfile, onToggleSelection, onBook, isSelected }) => {
  const cardStyle = {
    '--glow-color': isSelected ? 'rgba(249, 115, 22, 0.5)' : 'rgba(249, 115, 22, 0.3)',
    '--glow-opacity-hover': isSelected ? '1' : '1',
    '--glow-opacity-base': isSelected ? '1' : '0'
  } as React.CSSProperties;

  const statusStyle = statusConfig[performer.status];

  return (
    <div
      style={cardStyle}
      className={`relative bg-zinc-900 rounded-xl overflow-hidden group transition-all duration-300 ease-in-out border border-zinc-800 flex flex-col`}
    >
      <div 
        className={`absolute -inset-1 rounded-xl bg-[var(--glow-color)] blur-lg transition-opacity duration-300 opacity-[var(--glow-opacity-base)] group-hover:opacity-[var(--glow-opacity-hover)] -z-10`}
      ></div>

      <div className="relative">
        <img
          src={performer.photo_url}
          alt={performer.name}
          className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className={`absolute top-3 right-3 flex items-center gap-2 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border shadow-lg ${statusStyle.badge}`}>
          <span className={`h-2 w-2 rounded-full ${statusStyle.dot} animate-pulse`}></span>
          <span>{performer.status}</span>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h3 className="text-2xl font-bold text-white">{performer.name}</h3>
          <p className="text-orange-400 text-sm font-medium">{performer.tagline}</p>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
         <div className="pt-2 flex flex-col gap-3">
            <button 
                onClick={() => onBook(performer)}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 shadow-lg shadow-orange-500/20"
            >
                <Sparkles className="h-4 w-4" />
                Book Now
            </button>
            <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onViewProfile(performer)}
                  className="w-full bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => onToggleSelection(performer)}
                  className={`w-full font-semibold px-4 py-2 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 text-sm backdrop-blur-sm ${isSelected ? 'bg-green-600/90 hover:bg-green-700 text-white' : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white'}`}
                >
                  {isSelected ? <CheckCircle className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                  {isSelected ? 'Added' : 'Add'}
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PerformerCard;
