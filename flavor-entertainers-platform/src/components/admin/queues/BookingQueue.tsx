'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, MapPin, User, Clock, DollarSign, Eye, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Booking {
  id: string;
  booking_reference: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  performer_id: string;
  service: string;
  event_date: string;
  event_address: string;
  duration: number;
  guest_count?: number;
  total_amount: number;
  deposit_amount?: number;
  status: string;
  created_at: string;
  performers: {
    stage_name: string;
  };
}

export function BookingQueue() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'quote_requested' | 'quote_sent'>('all');
  const supabase = createClientComponentClient();

  const fetchBookings = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          performers(stage_name)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success(`Booking ${status.replace('_', ' ')}`);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      quote_requested: { variant: 'destructive' as const, label: 'Quote Requested' },
      quote_sent: { variant: 'default' as const, label: 'Quote Sent' },
      confirmed: { variant: 'default' as const, label: 'Confirmed' },
      completed: { variant: 'default' as const, label: 'Completed' },
      cancelled: { variant: 'outline' as const, label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
    <Card>
      <CardHeader>
        <CardTitle>Booking Management</CardTitle>
        <CardDescription>
          Review and manage booking requests
        </CardDescription>
        <div className="flex gap-2">
          {['all', 'pending', 'quote_requested', 'quote_sent'].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterOption as any)}
            >
              {filterOption.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Performer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-mono text-sm">
                  {booking.booking_reference}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.client_name}</div>
                    <div className="text-sm text-muted-foreground">{booking.client_email}</div>
                  </div>
                </TableCell>
                <TableCell>{booking.performers?.stage_name}</TableCell>
                <TableCell>{booking.service}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(booking.event_date), 'MMM d, yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">${booking.total_amount}</div>
                  {booking.deposit_amount && (
                    <div className="text-sm text-muted-foreground">
                      ${booking.deposit_amount} deposit
                    </div>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'quote_sent')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}