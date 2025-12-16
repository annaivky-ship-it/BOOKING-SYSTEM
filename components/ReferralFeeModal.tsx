
import React, { useState } from 'react';
import { Booking } from '../types';
import { LoaderCircle, CheckCircle, Copy, X, UploadCloud, Building2, DollarSign } from 'lucide-react';
import { AGENCY_PAY_ID_NAME, AGENCY_PAY_ID_EMAIL } from '../constants';
import { calculateBookingCost } from '../utils/bookingUtils';
import PayIDSimulationModal from './PayIDSimulationModal';

interface ReferralFeeModalProps {
  booking: Booking;
  onClose: () => void;
  onSubmit: (bookingId: string, feeAmount: number, receiptFile: File) => Promise<void>;
}

const FileUploadField: React.FC<{ file: File | null; setFile: (f: File | null) => void; error: string; setError: (e: string) => void }> = ({ file, setFile, error, setError }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size must be under 5MB.');
                setFile(null);
            } else {
                setError('');
                setFile(selectedFile);
            }
        }
    };
    return (
        <div>
            <label htmlFor="receiptUpload" className="block text-sm font-medium text-zinc-300 mb-2">Upload Payment Receipt</label>
            <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-zinc-700 px-6 py-8 bg-zinc-900/50 hover:border-orange-500 transition-colors">
                <div className="text-center">
                    <UploadCloud className="mx-auto h-10 w-10 text-zinc-500" />
                    <div className="mt-4 flex text-sm leading-6 text-zinc-400">
                        <label htmlFor="receiptUpload" className="relative cursor-pointer rounded-md font-semibold text-orange-500 hover:text-orange-400">
                            <span>Upload a file</span>
                            <input id="receiptUpload" name="receiptUpload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, application/pdf" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-zinc-500">PNG, JPG, PDF up to 5MB</p>
                    {file && <p className="text-sm mt-2 text-green-400 font-semibold">{file.name}</p>}
                    {error && <p className="text-sm mt-2 text-red-400">{error}</p>}
                </div>
            </div>
        </div>
    );
};


const ReferralFeeModal: React.FC<ReferralFeeModalProps> = ({ booking, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [isPayIdModalOpen, setIsPayIdModalOpen] = useState(false);

  const { referralFee } = calculateBookingCost(booking.duration_hours, booking.services_requested, 1);

  const handleSubmit = async () => {
    if (!receiptFile) {
      setFileError('Please upload a receipt to submit.');
      return;
    }
    setIsSubmitting(true);
    await onSubmit(booking.id, referralFee, receiptFile);
    setIsSubmitting(false);
  };
  
  const handleSimulatedPaymentSuccess = async () => {
    setIsPayIdModalOpen(false);
    setIsSubmitting(true);
    // Create a simulated receipt file
    const dummyFile = new File(["simulated_payid_receipt_content"], "auto_generated_payid_receipt.txt", { type: "text/plain" });
    await onSubmit(booking.id, referralFee, dummyFile);
    setIsSubmitting(false);
  };

  const copyToClipboard = (text: string, key: string) => {
      navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
          setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="card-base !p-8 !bg-zinc-900 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
            <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3"><DollarSign/> Pay Referral Fee</h2>
        <p className="text-zinc-400 mb-6">For booking with <span className="font-semibold text-white">{booking.client_name}</span> on {new Date(booking.event_date).toLocaleDateString()}.</p>
        
        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-700 space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-zinc-400">Pay To:</p>
                <p className="font-semibold text-white flex items-center gap-2"><Building2 size={16}/> {AGENCY_PAY_ID_NAME}</p>
              </div>
            </div>
             <div className="flex justify-between items-center">
                <p className="text-sm text-zinc-400">PayID Email:</p>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-zinc-200">{AGENCY_PAY_ID_EMAIL}</span>
                    <button onClick={() => copyToClipboard(AGENCY_PAY_ID_EMAIL, 'email')} className="text-orange-400 hover:text-orange-300 transition-colors">
                        {copiedStates['email'] ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4"/>}
                    </button>
                </div>
            </div>
            <div className="flex justify-between items-center text-orange-400 font-bold text-lg pt-3 border-t border-zinc-800">
                <span>Amount Due:</span>
                <div className="flex items-center gap-2">
                    <span className="font-mono">${referralFee.toFixed(2)}</span>
                    <button onClick={() => copyToClipboard(referralFee.toFixed(2), 'amount')} className="text-orange-400 hover:text-orange-300 transition-colors">
                        {copiedStates['amount'] ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4"/>}
                    </button>
                </div>
            </div>
        </div>
        
        <button 
            onClick={() => setIsPayIdModalOpen(true)}
            className="w-full py-3 text-lg flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:-translate-y-0.5 mb-6"
            disabled={isSubmitting}
        >
            🚀 Pay now with PayID
        </button>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-zinc-700" /></div>
            <div className="relative flex justify-center"><span className="bg-zinc-900 px-2 text-zinc-500 text-sm">Or Manually Upload Receipt</span></div>
        </div>
        
        <FileUploadField file={receiptFile} setFile={setReceiptFile} error={fileError} setError={setFileError} />

        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !receiptFile}
          className="btn-primary w-full mt-6 text-lg flex items-center justify-center gap-2"
        >
          {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : 'Submit Receipt'}
        </button>
      </div>

      {isPayIdModalOpen && (
        <PayIDSimulationModal
            amount={referralFee}
            onPaymentSuccess={handleSimulatedPaymentSuccess}
            onClose={() => setIsPayIdModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ReferralFeeModal;
