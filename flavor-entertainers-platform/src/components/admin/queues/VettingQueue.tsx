'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Eye, CheckCircle, XCircle, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface VettingApplication {
  id: string;
  user_id: string;
  stage_name: string;
  legal_name: string;
  date_of_birth: string;
  phone: string;
  email: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  experience_level: string;
  previous_work: string;
  availability: string;
  services_offered: string[];
  rates: Record<string, number>;
  references: string;
  additional_info: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
}

export function VettingQueue() {
  const [applications, setApplications] = useState<VettingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<VettingApplication | null>(null);
  const supabase = createClientComponentClient();

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('vetting_applications')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const reviewApplication = async (applicationId: string, status: 'approved' | 'rejected', notes: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { error } = await supabase
        .from('vetting_applications')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: session?.user.id,
          review_notes: notes
        })
        .eq('id', applicationId);

      if (error) throw error;

      if (status === 'approved') {
        // Create performer profile
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          const { error: performerError } = await supabase
            .from('performers')
            .insert({
              user_id: application.user_id,
              stage_name: application.stage_name,
              is_available: true,
              verification_status: 'verified',
              created_at: new Date().toISOString()
            });

          if (performerError) throw performerError;
        }
      }

      toast.success(`Application ${status}`);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Failed to review application');
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
          <CardTitle>Performer Vetting</CardTitle>
          <CardDescription>
            Review and approve performer applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stage Name</TableHead>
                <TableHead>Legal Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    {application.stage_name}
                  </TableCell>
                  <TableCell>{application.legal_name}</TableCell>
                  <TableCell>
                    <div>{application.email}</div>
                    <div className="text-sm text-muted-foreground">{application.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {application.experience_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {application.services_offered?.slice(0, 2).join(', ')}
                      {application.services_offered?.length > 2 && '...'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(application.submitted_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Application Review</DialogTitle>
                        </DialogHeader>
                        {selectedApplication && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-3">Personal Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Stage Name:</strong> {selectedApplication.stage_name}</div>
                                  <div><strong>Legal Name:</strong> {selectedApplication.legal_name}</div>
                                  <div><strong>Date of Birth:</strong> {format(new Date(selectedApplication.date_of_birth), 'MMM d, yyyy')}</div>
                                  <div><strong>Email:</strong> {selectedApplication.email}</div>
                                  <div><strong>Phone:</strong> {selectedApplication.phone}</div>
                                  <div><strong>Address:</strong> {selectedApplication.address}</div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-3">Emergency Contact</h4>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Name:</strong> {selectedApplication.emergency_contact_name}</div>
                                  <div><strong>Phone:</strong> {selectedApplication.emergency_contact_phone}</div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-3">Professional Information</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>Experience Level:</strong> {selectedApplication.experience_level}
                                </div>
                                <div>
                                  <strong>Availability:</strong> {selectedApplication.availability}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-3">Services & Rates</h4>
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <strong>Services:</strong> {selectedApplication.services_offered?.join(', ')}
                                </div>
                                <div className="text-sm">
                                  <strong>Rates:</strong>
                                  <ul className="mt-1 ml-4">
                                    {Object.entries(selectedApplication.rates || {}).map(([service, rate]) => (
                                      <li key={service}>{service}: ${rate}/hour</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-3">Experience & References</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <strong>Previous Work:</strong>
                                  <p className="mt-1 p-2 bg-gray-50 rounded text-xs">
                                    {selectedApplication.previous_work}
                                  </p>
                                </div>
                                <div>
                                  <strong>References:</strong>
                                  <p className="mt-1 p-2 bg-gray-50 rounded text-xs">
                                    {selectedApplication.references}
                                  </p>
                                </div>
                                {selectedApplication.additional_info && (
                                  <div>
                                    <strong>Additional Information:</strong>
                                    <p className="mt-1 p-2 bg-gray-50 rounded text-xs">
                                      {selectedApplication.additional_info}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                              <Button
                                onClick={() => reviewApplication(selectedApplication.id, 'approved', 'Application approved after review')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Application
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => reviewApplication(selectedApplication.id, 'rejected', 'Application rejected - insufficient information')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Application
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