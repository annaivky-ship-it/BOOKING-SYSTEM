'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Eye, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  payment_reference: string;
  transaction_id?: string;
  receipt_url?: string;
  status: string;
  payer_name: string;
  payer_contact: string;
  payment_date: string;
  verified_at?: string;
  verification_notes?: string;
  bookings: {
    booking_reference: string;
    client_name: string;
    performers: { stage_name: string };
  };
}

export function PaymentQueue() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const supabase = createClientComponentClient();

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings(
            booking_reference,
            client_name,
            performers(stage_name)
          )
        `)
        .eq('status', 'pending_verification')
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const verifyPayment = async (paymentId: string, status: 'verified' | 'rejected', notes?: string) => {
    try {
      const response = await fetch('/api/payments/payid', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status, notes })
      });

      if (!response.ok) throw new Error('Failed to verify payment');

      toast.success(`Payment ${status}`);
      setSelectedPayment(null);
      fetchPayments();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payment Verification</CardTitle>
          <CardDescription>
            Review and verify payment receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Ref</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Performer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">
                    {payment.bookings.booking_reference}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{payment.bookings.client_name}</div>
                    <div className="text-sm text-muted-foreground">{payment.payer_name}</div>
                  </TableCell>
                  <TableCell>{payment.bookings.performers?.stage_name}</TableCell>
                  <TableCell>
                    <div className="font-medium">${payment.amount}</div>
                    <div className="text-sm text-muted-foreground">{payment.payment_type}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {payment.payment_method.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(payment.payment_date), 'MMM d, h:mm a')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Pending Verification</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Payment Verification</DialogTitle>
                          </DialogHeader>
                          {selectedPayment && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium">Payment Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>Amount: ${selectedPayment.amount}</div>
                                    <div>Method: {selectedPayment.payment_method}</div>
                                    <div>Reference: {selectedPayment.payment_reference}</div>
                                    <div>Payer: {selectedPayment.payer_name}</div>
                                    <div>Contact: {selectedPayment.payer_contact}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium">Booking Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>Ref: {selectedPayment.bookings.booking_reference}</div>
                                    <div>Client: {selectedPayment.bookings.client_name}</div>
                                    <div>Performer: {selectedPayment.bookings.performers?.stage_name}</div>
                                  </div>
                                </div>
                              </div>

                              {selectedPayment.receipt_url && (
                                <div>
                                  <h4 className="font-medium mb-2">Receipt</h4>
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={selectedPayment.receipt_url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      View Receipt
                                    </a>
                                  </Button>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => verifyPayment(selectedPayment.id, 'verified')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Verify Payment
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => verifyPayment(selectedPayment.id, 'rejected', 'Payment could not be verified')}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject Payment
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}