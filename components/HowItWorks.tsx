
import React from 'react';
import { Search, FileText, ShieldCheck, CreditCard, PartyPopper, ChevronRight } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Select Talent',
    description: 'Browse our gallery and choose the perfect entertainer.',
    icon: Search,
  },
  {
    id: 2,
    title: 'Submit Request',
    description: 'Fill in your event details and upload ID for verification.',
    icon: FileText,
  },
  {
    id: 3,
    title: 'Instant Vetting',
    description: 'Our system automatically vets requests for safety.',
    icon: ShieldCheck,
  },
  {
    id: 4,
    title: 'Secure Deposit',
    description: 'Pay the 15% deposit via PayID to lock in your date.',
    icon: CreditCard,
  },
  {
    id: 5,
    title: 'Confirmation',
    description: 'Receive final details. Balance is due cash on arrival.',
    icon: PartyPopper,
  },
];

const HowItWorks: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto mb-12 px-4">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">How to Book</h2>
          <p className="text-zinc-400 text-sm">A simple, secure, and professional process.</p>
        </div>
        
        <div className="relative">
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-zinc-800 -z-10 transform translate-y-1"></div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center text-center group relative">
                
                {/* Icon Circle */}
                <div className="w-14 h-14 rounded-full bg-zinc-900 border-2 border-zinc-700 group-hover:border-orange-500 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all duration-300 flex items-center justify-center mb-4 z-10 relative">
                  <step.icon className="w-6 h-6 text-zinc-400 group-hover:text-orange-400 transition-colors" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-xs font-bold text-white">
                    {step.id}
                  </div>
                </div>

                {/* Mobile Connector (Arrow Down) */}
                {index < steps.length - 1 && (
                  <div className="md:hidden mb-4 text-zinc-600">
                    <ChevronRight className="transform rotate-90" />
                  </div>
                )}

                <h3 className="text-white font-semibold mb-2 group-hover:text-orange-400 transition-colors">{step.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed px-2">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
