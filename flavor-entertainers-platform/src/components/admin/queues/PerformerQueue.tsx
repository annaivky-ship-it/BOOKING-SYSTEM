'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { UserCheck, Eye, Star, Clock, DollarSign, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Performer {
  id: string;
  user_id: string;
  stage_name: string;
  bio?: string;
  location?: string;
  hero_image?: string;
  gallery_images?: string[];
  is_available: boolean;
  verification_status: string;
  rating?: number;
  total_reviews: number;
  created_at: string;
  profiles: {
    display_name: string;
    email: string;
    phone?: string;
  };
  performer_services: Array<{
    service_id: string;
    custom_rate?: number;
    is_available: boolean;
    services: {
      name: string;
      base_rate: number;
      rate_type: string;
    };
  }>;
}

export function PerformerQueue() {
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPerformer, setSelectedPerformer] = useState<Performer | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const supabase = createClientComponentClient();

  const fetchPerformers = async () => {
    try {
      let query = supabase
        .from('performers')
        .select(`
          *,
          profiles(display_name, email, phone),
          performer_services(
            service_id,
            custom_rate,
            is_available,
            services(name, base_rate, rate_type)
          )
        `)
        .order('created_at', { ascending: false });

      if (filter === 'active') {
        query = query.eq('is_available', true);
      } else if (filter === 'inactive') {
        query = query.eq('is_available', false);
      } else if (filter === 'pending') {
        query = query.eq('verification_status', 'pending');
      }

      const { data, error } = await query;

      if (error) throw error;
      setPerformers(data || []);
    } catch (error) {
      console.error('Error fetching performers:', error);
      toast.error('Failed to load performers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformers();
  }, [filter]);

  const togglePerformerStatus = async (performerId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('performers')
        .update({ is_available: isAvailable })
        .eq('id', performerId);

      if (error) throw error;

      toast.success(`Performer ${isAvailable ? 'activated' : 'deactivated'}`);
      fetchPerformers();
    } catch (error) {
      console.error('Error updating performer status:', error);
      toast.error('Failed to update performer status');
    }
  };

  const updateVerificationStatus = async (performerId: string, status: 'verified' | 'suspended') => {
    try {
      const { error } = await supabase
        .from('performers')
        .update({ verification_status: status })
        .eq('id', performerId);

      if (error) throw error;

      toast.success(`Performer ${status}`);
      setSelectedPerformer(null);
      fetchPerformers();
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast.error('Failed to update verification status');
    }
  };

  const getVerificationBadge = (status: string) => {
    const statusConfig = {
      verified: { variant: 'default' as const, label: 'Verified' },
      pending: { variant: 'secondary' as const, label: 'Pending' },
      suspended: { variant: 'destructive' as const, label: 'Suspended' }
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Performer Management</CardTitle>
          <CardDescription>
            Manage active performers and their availability
          </CardDescription>
          <div className="flex gap-2">
            {['all', 'active', 'inactive', 'pending'].map((filterOption) => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterOption as any)}
              >
                {filterOption}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performers.map((performer) => (
                <TableRow key={performer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{performer.stage_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {performer.profiles?.display_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{performer.profiles?.email}</div>
                    {performer.profiles?.phone && (
                      <div className="text-sm text-muted-foreground">{performer.profiles.phone}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{performer.rating?.toFixed(1) || 'New'}</span>
                      <span className="text-sm text-muted-foreground">
                        ({performer.total_reviews})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {performer.performer_services?.length || 0} services
                    </div>
                  </TableCell>
                  <TableCell>
                    {getVerificationBadge(performer.verification_status)}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={performer.is_available}
                      onCheckedChange={(checked) => togglePerformerStatus(performer.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPerformer(performer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Performer Details</DialogTitle>
                        </DialogHeader>
                        {selectedPerformer && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-3">Basic Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Stage Name:</strong> {selectedPerformer.stage_name}</div>
                                  <div><strong>Display Name:</strong> {selectedPerformer.profiles?.display_name}</div>
                                  <div><strong>Email:</strong> {selectedPerformer.profiles?.email}</div>
                                  {selectedPerformer.profiles?.phone && (
                                    <div><strong>Phone:</strong> {selectedPerformer.profiles.phone}</div>
                                  )}
                                  {selectedPerformer.location && (
                                    <div><strong>Location:</strong> {selectedPerformer.location}</div>
                                  )}
                                  <div><strong>Member Since:</strong> {format(new Date(selectedPerformer.created_at), 'MMM d, yyyy')}</div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3">Performance Stats</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span>{selectedPerformer.rating?.toFixed(1) || 'No rating'} ({selectedPerformer.total_reviews} reviews)</span>
                                  </div>
                                  <div><strong>Status:</strong> {getVerificationBadge(selectedPerformer.verification_status)}</div>
                                  <div><strong>Available:</strong> {selectedPerformer.is_available ? 'Yes' : 'No'}</div>
                                </div>
                              </div>
                            </div>

                            {selectedPerformer.bio && (
                              <div>
                                <h4 className="font-medium mb-3">Biography</h4>
                                <p className="text-sm p-3 bg-gray-50 rounded">
                                  {selectedPerformer.bio}
                                </p>
                              </div>
                            )}

                            <div>
                              <h4 className="font-medium mb-3">Services & Rates</h4>
                              <div className="space-y-2">
                                {selectedPerformer.performer_services?.map((service, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                                    <div>
                                      <div className="font-medium">{service.services.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        Base rate: ${service.services.base_rate}/{service.services.rate_type.replace('per_', '')}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">
                                        ${service.custom_rate || service.services.base_rate}
                                      </div>
                                      <Badge variant={service.is_available ? 'default' : 'secondary'}>
                                        {service.is_available ? 'Available' : 'Unavailable'}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                              <Button
                                onClick={() => updateVerificationStatus(selectedPerformer.id, 'verified')}
                                variant="outline"
                              >
                                Verify Performer
                              </Button>
                              <Button
                                onClick={() => updateVerificationStatus(selectedPerformer.id, 'suspended')}
                                variant="outline"
                              >
                                Suspend Performer
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
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