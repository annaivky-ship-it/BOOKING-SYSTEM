
import React, { useMemo } from 'react';
import { Sparkles, Zap, ShieldCheck, Heart, Star, CalendarCheck, Crown, Shield } from 'lucide-react';
import type { Performer } from '../types';

interface BannerCarouselProps {
  performers: Performer[];
  isAvailableNow?: boolean;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ performers, isAvailableNow = true }) => {
  const seoPhrases = [
    "PERTH'S ELITE",
    "PREMIUM TALENT",
    "EXOTIC HOSTING",
    "READY TO DISPATCH",
    "BEYOND SPECTACLE",
    "WESTERN AUSTRALIA",
    "VIP EXPERIENCE",
    "SIGNATURE SERVICE",
    "UNMATCHED VIBE",
    "CULTURE OF FLAVOR"
  ];

  const marqueeItems = useMemo(() => {
    if (performers.length === 0) return [];
    
    const items = [];
    const maxItems = Math.max(performers.length, seoPhrases.length);
    
    for (let i = 0; i < maxItems; i++) {
      if (performers[i % performers.length]) {
        items.push({ type: 'performer', content: performers[i % performers.length] });
      }
      if (seoPhrases[i % seoPhrases.length]) {
        items.push({ type: 'text', content: seoPhrases[i % seoPhrases.length] });
      }
    }
    
    // Triple the items to ensure seamless loop
    return [...items, ...items, ...items];
  }, [performers]);

  if (marqueeItems.length === 0) return null;

  return (
    <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-16 md:mb-32 overflow-hidden select-none bg-zinc-950/40 border-y border-white/[0.03] py-16 md:py-32">
      
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full animate-pulse-slow delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.03)_0%,transparent_70%)]"></div>
      </div>

      {/* Editorial Brand Header */}
      <div className="container mx-auto px-4 mb-20 md:mb-40 relative z-20">
        <div className="text-center max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] px-6 py-2.5 rounded-full mb-10 shadow-2xl backdrop-blur-2xl transition-all hover:border-orange-500/30 group cursor-default">
            {isAvailableNow ? (
              <Zap size={14} className="text-orange-500 animate-pulse fill-orange-500" />
            ) : (
              <CalendarCheck size={14} className="text-orange-400" />
            )}
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 group-hover:text-white transition-colors">
              {isAvailableNow ? "LIVE NETWORK ACTIVE" : "ADVANCE BOOKING WINDOW"}
            </span>
          </div>
          
          <div className="relative inline-block">
            <h1 className="font-logo-main text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] text-white tracking-[-0.04em] uppercase leading-[0.8] mb-10 relative">
              {isAvailableNow ? (
                <>
                  <span className="relative inline-block">INSTANT</span> 
                  <span className="text-orange-500 italic block sm:inline ml-0 sm:ml-4">FLAVOR</span>
                </>
              ) : (
                <>
                  <span className="relative inline-block">THE NEXT</span> 
                  <span className="text-orange-500 italic block sm:inline ml-0 sm:ml-4">LEVEL</span>
                </>
              )}
            </h1>
            {/* Floating Decorative Elements */}
            <div className="absolute -top-6 -right-12 text-orange-500/20 hidden lg:block animate-bounce-slow">
                <Crown size={80} strokeWidth={1} />
            </div>
          </div>
          
          <p className="text-zinc-500 text-sm sm:text-base md:text-xl font-bold uppercase tracking-[0.35em] max-w-4xl mx-auto leading-relaxed px-4 opacity-70 mt-4">
            {isAvailableNow 
              ? "Perth's most prestigious talent network. Direct-to-event dispatch within 60 minutes." 
              : "Curate your environment with Western Australia's most sought-after professional entertainers."
            }
          </p>
        </div>
      </div>

      {/* High-Velocity Kinetic Ticker */}
      <div className="bg-orange-500 py-3 mb-20 md:mb-32 transform -rotate-1 shadow-[0_30px_100px_rgba(249,115,22,0.15)] z-30 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
        <div className="flex whitespace-nowrap animate-ticker">
           {[...Array(10)].map((_, i) => (
             <span key={i} className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.5em] text-black px-12 md:px-24 flex items-center gap-8">
               <Shield size={14} fill="black" /> ELITE ROSTER &bull; SECURE VETTING &bull; PRIVATE DISPATCH <Shield size={14} fill="black" />
             </span>
           ))}
        </div>
      </div>

      {/* Cinematic Fluid Marquee */}
      <div className="relative group/marquee py-12">
        {/* Soft Edge Masks */}
        <div className="absolute inset-y-0 left-0 w-32 md:w-96 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 md:w-96 bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent z-10 pointer-events-none"></div>

        <div className="flex whitespace-nowrap animate-marquee-smooth hover:[animation-play-state:paused] items-center group-hover/marquee:opacity-90">
          {marqueeItems.map((item, idx) => (
            <div key={idx} className="inline-flex items-center mx-10 md:mx-32 group/item">
              {item.type === 'performer' ? (
                <div 
                  className={`relative w-40 h-40 sm:w-56 sm:h-56 md:w-80 md:h-80 rounded-[4rem] md:rounded-[6rem] overflow-hidden border border-white/10 transition-all duration-700 cursor-pointer shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] transform group-hover/item:scale-105 group-hover/item:border-orange-500/50 ${idx % 2 === 0 ? 'translate-y-4' : '-translate-y-4'}`}
                  onClick={() => window.scrollTo({ top: 1800, behavior: 'smooth' })}
                >
                  <img 
                    src={(item.content as Performer).photo_url} 
                    alt="Talent" 
                    className="w-full h-full object-cover grayscale-[0.3] group-hover/item:grayscale-0 transition-all duration-1000"
                    loading="lazy"
                  />
                  
                  {/* Ready Indicator Slab */}
                  {(item.content as Performer).status === 'available' && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-green-500/90 backdrop-blur-xl text-white px-5 py-2 rounded-2xl text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl ring-1 ring-white/20 animate-float opacity-0 group-hover/item:opacity-100 transition-opacity">
                       ONLINE NOW
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-700"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-5xl sm:text-7xl md:text-[9rem] font-logo-main text-white/5 tracking-[-0.02em] uppercase italic transition-all duration-700 group-hover/item:text-white/20 group-hover/item:scale-110">
                    {item.content as string}
                  </span>
                  <div className="flex gap-6 mt-10 opacity-20 group-hover/item:opacity-50 transition-opacity">
                    {[...Array(3)].map((_, i) => <Star key={i} size={20} fill="currentColor" className="text-orange-500" />)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Premium Trust Footprint */}
      <div className="mt-24 md:mt-48 container mx-auto px-6 relative z-20">
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-32">
           <div className="flex items-center gap-6 group/badge cursor-default">
             <div className="w-16 h-16 rounded-[2rem] bg-white/[0.03] flex items-center justify-center border border-white/[0.08] group-hover/badge:border-orange-500/40 group-hover/badge:bg-orange-500/10 group-hover/badge:scale-110 transition-all duration-500 shadow-2xl">
               <ShieldCheck size={28} className="text-orange-500 group-hover/badge:text-orange-400" />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-300 group-hover/badge:text-white transition-colors">Vetted Elite</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600 mt-1">Certified Professionals</span>
             </div>
           </div>
           
           <div className="flex items-center gap-6 group/badge cursor-default">
             <div className="w-16 h-16 rounded-[2rem] bg-white/[0.03] flex items-center justify-center border border-white/[0.08] group-hover/badge:border-orange-500/40 group-hover/badge:bg-orange-500/10 group-hover/badge:scale-110 transition-all duration-500 shadow-2xl">
               <Heart size={28} className="text-orange-500 group-hover/badge:text-orange-400" />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-300 group-hover/badge:text-white transition-colors">Discreet</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600 mt-1">NDA Compliant Flow</span>
             </div>
           </div>

           <div className="flex items-center gap-6 group/badge cursor-default">
             <div className="w-16 h-16 rounded-[2rem] bg-white/[0.03] flex items-center justify-center border border-white/[0.08] group-hover/badge:border-orange-500/40 group-hover/badge:bg-orange-500/10 group-hover/badge:scale-110 transition-all duration-500 shadow-2xl">
               <Crown size={28} className="text-orange-500 group-hover/badge:text-orange-400" />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-300 group-hover/badge:text-white transition-colors">Curated</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600 mt-1">Perth's Top 1%</span>
             </div>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-smooth {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes ticker-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-20%); }
        }
        @keyframes float {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.2; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-marquee-smooth {
          animation: marquee-smooth 90s linear infinite;
        }
        .animate-ticker {
          animation: ticker-slide 25s linear infinite;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 10s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 6s ease-in-out infinite;
        }
        @media (max-width: 768px) {
          .animate-marquee-smooth { animation-duration: 40s; }
          .animate-ticker { animation-duration: 15s; }
        }
      `}} />
    </div>
  );
};

export default BannerCarousel;
