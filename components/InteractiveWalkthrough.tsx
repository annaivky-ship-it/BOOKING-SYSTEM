
import React, { useEffect, useState, useRef } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import type { WalkthroughStep } from '../types';

interface InteractiveWalkthroughProps {
  steps: WalkthroughStep[];
  currentStepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onEnd: () => void;
  isActive: boolean;
}

const calculatePopoverPosition = (
  targetRect: DOMRect,
  popoverRect: DOMRect,
  preferredPosition: WalkthroughStep['position']
) => {
  const GAP = 20; // Increased gap for better visual separation
  let top, left, position;

  // Horizontal centering
  left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
  // Clamp to viewport
  if (left < 10) left = 10;
  if (left + popoverRect.width > window.innerWidth) left = window.innerWidth - popoverRect.width - 10;

  // Vertical positioning
  const spaceBelow = window.innerHeight - targetRect.bottom;
  const spaceAbove = targetRect.top;

  if (preferredPosition === 'top' && spaceAbove > popoverRect.height + GAP) {
    top = targetRect.top - popoverRect.height - GAP;
    position = 'top';
  } else if (preferredPosition === 'bottom' && spaceBelow > popoverRect.height + GAP) {
    top = targetRect.bottom + GAP;
    position = 'bottom';
  } else {
    // Auto-detect best fit if preferred doesn't work
    if (spaceBelow > popoverRect.height + GAP) {
      top = targetRect.bottom + GAP;
      position = 'bottom';
    } else {
      top = targetRect.top - popoverRect.height - GAP;
      position = 'top';
    }
  }
  
  return { top, left, position };
};

const InteractiveWalkthrough: React.FC<InteractiveWalkthroughProps> = ({ steps, currentStepIndex, onNext, onPrev, onEnd, isActive }) => {
  const [highlightStyle, setHighlightStyle] = useState({});
  const [popoverStyle, setPopoverStyle] = useState({});
  const [popoverPosition, setPopoverPosition] = useState('bottom');
  const popoverRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (!isActive || !currentStep?.elementSelector) {
      setHighlightStyle({ opacity: 0, pointerEvents: 'none' });
      setPopoverStyle({ opacity: 0, pointerEvents: 'none' });
      return;
    }

    const updatePosition = () => {
        const currentTarget = document.querySelector(currentStep.elementSelector) as HTMLElement;
        
        if (!popoverRef.current || !currentTarget || !document.body.contains(currentTarget)) {
            setHighlightStyle(prev => ({ ...prev, opacity: 0, pointerEvents: 'none' }));
            setPopoverStyle(prev => ({ ...prev, opacity: 0, pointerEvents: 'none' }));
            return;
        }

        const targetRect = currentTarget.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        
        setHighlightStyle({
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            top: `${targetRect.top - 6 + scrollY}px`,
            left: `${targetRect.left - 6 + scrollX}px`,
            opacity: 1,
        });
        
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const pos = calculatePopoverPosition(targetRect, popoverRect, currentStep.position);

        setPopoverStyle({
            top: `${pos.top + scrollY}px`,
            left: `${pos.left + scrollX}px`,
            opacity: 1,
        });
        setPopoverPosition(pos.position as string);
    };

    const throttledUpdate = () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        animationFrameId.current = requestAnimationFrame(updatePosition);
    };

    const POLLING_INTERVAL = 100;
    const MAX_ATTEMPTS = 50; // 5 seconds
    let attempts = 0;

    const pollForElement = () => {
      const element = document.querySelector(currentStep.elementSelector) as HTMLElement;
      
      if (element) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

        // Update position immediately and add listeners to track during scroll/resize.
        // This is more robust than waiting for a fixed timeout.
        throttledUpdate();
        window.addEventListener('resize', throttledUpdate);
        window.addEventListener('scroll', throttledUpdate, true);

      } else {
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          console.warn(`Walkthrough element not found: ${currentStep.elementSelector}`);
          setHighlightStyle({ opacity: 0, pointerEvents: 'none' });
          setPopoverStyle({ opacity: 0, pointerEvents: 'none' });
        }
      }
    };

    // Hide elements and start polling for the new target
    setHighlightStyle({ opacity: 0 });
    setPopoverStyle({ opacity: 0 });
    
    pollIntervalRef.current = window.setInterval(pollForElement, POLLING_INTERVAL);

    // Comprehensive cleanup function
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', throttledUpdate);
      window.removeEventListener('scroll', throttledUpdate, true);
    };

  }, [currentStep, isActive]);


  if (!isActive) return null;

  return (
    <>
      <div className="walkthrough-overlay animate-fade-in" onClick={onEnd}></div>
      <div className="walkthrough-highlight" style={highlightStyle}></div>
      <div 
        className={`walkthrough-popover animate-fade-in-down pos-${popoverPosition}`}
        style={popoverStyle} 
        ref={popoverRef}
      >
        <h3 className="text-lg font-bold text-orange-400 mb-2">{currentStep.title}</h3>
        <p className="text-sm mb-4">{currentStep.content}</p>

        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-zinc-500">
            {currentStepIndex + 1} / {steps.length}
          </span>
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button onClick={onPrev} className="text-zinc-300 hover:text-white transition-colors p-2 rounded-md bg-zinc-700 hover:bg-zinc-600">
                <ArrowLeft size={16}/>
              </button>
            )}
            <button onClick={onNext} className="text-white font-semibold px-4 py-2 text-sm rounded-md bg-orange-500 hover:bg-orange-600 transition-colors flex items-center gap-2">
              {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
              {currentStepIndex < steps.length - 1 && <ArrowRight size={16}/>}
            </button>
          </div>
        </div>
         <button onClick={onEnd} className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors">
            <X size={20}/>
        </button>
      </div>
    </>
  );
};

export default InteractiveWalkthrough;
