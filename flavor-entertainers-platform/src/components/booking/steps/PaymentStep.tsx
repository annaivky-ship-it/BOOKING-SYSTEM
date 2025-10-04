'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ReceiptUpload } from '@/components/payments/ReceiptUpload';
import { PayIDQRCode } from '@/components/payments/PayIDQRCode';
import {
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  Info,
  AlertTriangle,
  Smartphone,
  Copy,
  ExternalLink
} from 'lucide-react';
import { BookingData, BookingQuote, PaymentSubmissionData } from '@/hooks/useBooking';
import { toast } from 'sonner';

interface PaymentStepProps {
  performer: any;
  bookingData: Partial<BookingData>;
  quote: BookingQuote | null;
  onSubmit: (paymentData: PaymentSubmissionData) => Promise<boolean>;
  isLoading: boolean;
}

export function PaymentStep({
  performer,
  bookingData,
  quote,
  onSubmit,
  isLoading
}: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<'payid' | 'bank_transfer'>('payid');
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [uploadedReceipt, setUploadedReceipt] = useState<File | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>();

  const payidDetails = {
    payid: 'bookings@lustandlace.com.au',
    name: 'Lust and Lace Entertainment',
    bsb: '062-001',
    account: '1234567890'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleReceiptUpload = async (file: File) => {
    setUploadedReceipt(file);

    // In a real implementation, you would upload the file to storage
    // For now, we'll create a mock URL
    const mockUrl = `https://storage.example.com/receipts/${Date.now()}_${file.name}`;
    setReceiptUrl(mockUrl);
    setReceiptUploaded(true);
    toast.success('Receipt uploaded successfully');
  };

  const handleSubmitPayment = async () => {
    if (!receiptUploaded) {
      toast.error('Please upload your payment receipt');
      return;
    }

    if (!quote || !bookingData.contactName || !bookingData.contactPhone) {
      toast.error('Missing required booking information');
      return;
    }

    const paymentData: PaymentSubmissionData = {
      bookingId: bookingData.bookingId || '', // This would be set after booking creation
      paymentAmount: quote.depositAmount,
      paymentReference: `${performer.stage_name} - ${bookingData.contactName}`,
      receiptUrl: receiptUrl,
      paymentMethod: paymentMethod,
      transactionId: undefined, // User would provide this
      payerName: bookingData.contactName,
      payerContact: bookingData.contactPhone
    };

    setPaymentConfirmed(true);
    const success = await onSubmit(paymentData);

    if (!success) {
      setPaymentConfirmed(false);
    }
  };

  if (!quote) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Quote not available. Please go back to review your booking details.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-blue-900">Deposit Required</span>
              <span className="text-2xl font-bold text-blue-900">
                {formatCurrency(quote.depositAmount)}
              </span>
            </div>
            <div className="text-sm text-blue-700">
              {quote.depositPercent}% of total booking ({formatCurrency(quote.totalAmount)})
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span>{bookingData.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Performer</span>
              <span>{performer.stage_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span>{bookingData.duration} hours</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Remaining Balance</span>
              <span>{formatCurrency(quote.totalAmount - quote.depositAmount)}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Due upon completion of service
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={`cursor-pointer transition-all ${
                paymentMethod === 'payid'
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setPaymentMethod('payid')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">PayID (Recommended)</div>
                    <div className="text-sm text-muted-foreground">Instant, secure</div>
                  </div>
                  {paymentMethod === 'payid' && (
                    <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                paymentMethod === 'bank'
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setPaymentMethod('bank')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-sm text-muted-foreground">Traditional</div>
                  </div>
                  {paymentMethod === 'bank' && (
                    <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      {paymentMethod === 'payid' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              PayID Payment Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code */}
            <div className="text-center">
              <PayIDQRCode
                payid={payidDetails.payid}
                amount={quote.depositAmount}
                description={`Booking deposit - ${performer.stage_name} - ${bookingData.service}`}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Scan with your banking app to pay instantly
              </p>
            </div>

            <Separator />

            {/* Manual Details */}
            <div className="space-y-3">
              <h4 className="font-medium">Or enter details manually:</h4>

              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm text-muted-foreground">PayID</span>
                    <div className="font-mono font-medium">{payidDetails.payid}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(payidDetails.payid, 'PayID')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <div className="font-mono font-medium">{formatCurrency(quote.depositAmount)}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(quote.depositAmount.toString(), 'Amount')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm text-muted-foreground">Reference</span>
                    <div className="font-mono font-medium">
                      {performer.stage_name} - {bookingData.contactName}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${performer.stage_name} - ${bookingData.contactName}`, 'Reference')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-600" />
              Bank Transfer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="text-sm text-muted-foreground">Account Name</span>
                  <div className="font-medium">{payidDetails.name}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(payidDetails.name, 'Account Name')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="text-sm text-muted-foreground">BSB</span>
                  <div className="font-mono font-medium">{payidDetails.bsb}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(payidDetails.bsb, 'BSB')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="text-sm text-muted-foreground">Account Number</span>
                  <div className="font-mono font-medium">{payidDetails.account}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(payidDetails.account, 'Account Number')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <div className="font-mono font-medium">{formatCurrency(quote.depositAmount)}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(quote.depositAmount.toString(), 'Amount')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="text-sm text-muted-foreground">Reference</span>
                  <div className="font-mono font-medium">
                    {performer.stage_name} - {bookingData.contactName}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${performer.stage_name} - ${bookingData.contactName}`, 'Reference')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Bank transfers may take 1-2 business days to process.
                PayID payments are instant and processed immediately.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Receipt Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Upload Payment Receipt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReceiptUpload
            onUpload={handleReceiptUpload}
            maxSize={5 * 1024 * 1024} // 5MB
            acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'application/pdf']}
          />

          {receiptUploaded && uploadedReceipt && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Receipt uploaded: {uploadedReceipt.name}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Payment & Booking Information:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Your booking will be confirmed once payment is verified (usually within 15 minutes for PayID)</li>
              <li>You will receive WhatsApp confirmation with performer contact details</li>
              <li>Remaining balance ({formatCurrency(quote.totalAmount - quote.depositAmount)}) is due upon completion</li>
              <li>Deposits are non-refundable unless cancelled by the performer</li>
              <li>24-hour cancellation policy applies</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          onClick={handleSubmitPayment}
          disabled={!receiptUploaded || isLoading || paymentConfirmed}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          size="lg"
        >
          {isLoading ? (
            <>Processing...</>
          ) : paymentConfirmed ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Payment Submitted
            </>
          ) : (
            <>
              <Shield className="mr-2 h-5 w-5" />
              Submit Payment & Complete Booking
            </>
          )}
        </Button>

        {!receiptUploaded && (
          <p className="text-sm text-center text-muted-foreground mt-2">
            Please upload your payment receipt to continue
          </p>
        )}
      </div>

      {/* Security Information */}
      <div className="text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-green-600" />
          <span>Secure & Encrypted Payment Processing</span>
        </div>
        <p>
          Your payment information is protected with bank-level security.
          We never store your banking details.
        </p>
      </div>
    </div>
  );
}