'use client';

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, X, LoaderCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardPaymentModalProps {
    amount: number;
    performerName: string;
    eventDate: string;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

export default function CardPaymentModal({ amount, performerName, eventDate, onClose, onPaymentSuccess }: CardPaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');

    const handlePay = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate API delay
        setTimeout(() => {
            setIsProcessing(false);
            setStep('success');
            setTimeout(() => {
                onPaymentSuccess();
            }, 1500);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <CreditCard className="text-orange-500 w-5 h-5" />
                        <h3 className="font-bold text-lg text-white">Secure Deposit Payment</h3>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 'form' ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handlePay}
                                className="space-y-6"
                            >
                                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-6">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-zinc-400">Booking Deposit for:</span>
                                        <span className="text-white font-medium">{performerName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-3">
                                        <span className="text-zinc-400">Event Date:</span>
                                        <span className="text-white font-medium">{eventDate}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                                        <span className="text-zinc-200 font-bold">Total Deposit:</span>
                                        <span className="text-2xl font-black text-orange-500">${amount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Card Information</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type="text"
                                                placeholder="0000 0000 0000 0000"
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white placeholder-zinc-700 outline-none focus:border-orange-500/50 transition-colors"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                                                <div className="w-8 h-5 bg-zinc-800 rounded" />
                                                <div className="w-8 h-5 bg-zinc-800 rounded" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            required
                                            type="text"
                                            placeholder="MM/YY"
                                            className="bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white placeholder-zinc-700 outline-none focus:border-orange-500/50"
                                        />
                                        <input
                                            required
                                            type="text"
                                            placeholder="CVC"
                                            className="bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white placeholder-zinc-700 outline-none focus:border-orange-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-orange-500/5 border border-orange-500/10 rounded-lg text-xs text-orange-200/70">
                                    <ShieldCheck size={16} className="text-orange-500 flex-shrink-0" />
                                    <p>Your payment information is encrypted and processed securely by our PCI-compliant provider.</p>
                                </div>

                                <button
                                    disabled={isProcessing}
                                    type="submit"
                                    className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg"
                                >
                                    {isProcessing ? (
                                        <>
                                            <LoaderCircle className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Pay $${amount.toFixed(2)} Deposit`
                                    )}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-12"
                            >
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="text-green-500 w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Payment Successful</h3>
                                <p className="text-zinc-400">Your deposit has been secured.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
