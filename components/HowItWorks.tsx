
import React from 'react';
import { Search, ShieldCheck, CreditCard, Zap, ArrowRight, Lock } from 'lucide-react';

const steps = [
  {
    id: '01',
    title: 'Discovery',
    description: 'Elite Asset Portfolio.',
    icon: Search,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  {
    id: '02',
    title: 'Inquiry',
    description: 'Dispatch Lead Sent.',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10'
  },
  {
    id: '03',
    title: 'Security',
    description: 'Discretion Review.',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10'
  },
  {
    id: '04',
    title: 'Lock',
    description: 'Confirmed Secure.',
    icon: CreditCard,
    color: 'text-sky-400',
    bgColor: 'bg-sky-400/10'
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="w-full max-w-7xl mx-auto mb-16 px-4">
      <div className="relative group">
        {/* Subtle Background Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/10 to-transparent blur-3xl opacity-20 -z-10"></div>
        
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6 md:p-8 backdrop-blur-xl">
          
          <div className="flex flex-row items-center justify-between gap-4 mb-8">
            <div className="flex flex-col">
              <h2 className="font-logo-main text-2xl md:text-4xl text-white tracking-tight uppercase leading-none">
                Discreet <span className="text-orange-500">Dispatch</span>
              </h2>
              <p className="text-zinc-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                Elite Professional Flow
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-orange-500/5 border border-orange-500/10 rounded-full w-fit">
               <Lock size={10} className="text-orange-500" />
               <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest">Confidential Process</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 md:gap-8 relative">
            {steps.map((step, index) => (
              <div key={step.id} className="relative group/card">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 md:gap-3 mb-3">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl ${step.bgColor} flex items-center justify-center border border-white/5 group-hover/card:border-orange-500/30 transition-all duration-500 shadow-lg`}>
                      <step.icon className={`w-4 h-4 md:w-5 md:h-5 ${step.color}`} />
                    </div>
                    <span className="hidden md:block font-logo-main text-lg text-zinc-700 leading-none tracking-wider">{step.id}</span>
                  </div>

                  <h3 className="text-[10px] md:text-xs font-black text-white uppercase tracking-wider mb-1 group-hover/card:text-orange-400 transition-colors truncate">
                    {step.title}
                  </h3>
                  <p className="text-[8px] md:text-[10px] text-zinc-500 leading-tight font-bold uppercase tracking-tight group-hover/card:text-zinc-400 transition-colors line-clamp-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
