'use client';

import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Card } from '@/components/ui/card';

interface PayIDQRCodeProps {
  payid: string;
  amount: number;
  description?: string;
  size?: number;
}

export function PayIDQRCode({
  payid,
  amount,
  description = '',
  size = 200
}: PayIDQRCodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    // Create PayID payment URL format
    // This follows the NPP PayID standard for QR codes
    const paymentData = {
      payid: payid,
      amount: amount.toFixed(2),
      description: description,
      currency: 'AUD'
    };

    // Create the payment URL - this is a simplified format
    // In production, you'd use the official PayID QR code standard
    const paymentUrl = `payid://${payid}?amount=${amount.toFixed(2)}&description=${encodeURIComponent(description)}`;

    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: size,
        height: size,
        type: 'svg',
        data: paymentUrl,
        dotsOptions: {
          color: '#1f2937',
          type: 'rounded'
        },
        backgroundOptions: {
          color: '#ffffff'
        },
        cornersSquareOptions: {
          color: '#3b82f6',
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          color: '#1d4ed8',
          type: 'dot'
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 10
        }
      });
    } else {
      qrCode.current.update({
        data: paymentUrl
      });
    }

    if (ref.current) {
      ref.current.innerHTML = '';
      qrCode.current.append(ref.current);
    }
  }, [payid, amount, description, size]);

  return (
    <Card className="p-4 inline-block">
      <div ref={ref} className="flex justify-center" />
      <div className="text-center mt-2 space-y-1">
        <div className="font-medium text-sm">PayID Payment</div>
        <div className="text-xs text-muted-foreground">{payid}</div>
        <div className="font-bold text-sm text-blue-600">
          ${amount.toFixed(2)} AUD
        </div>
      </div>
    </Card>
  );
}