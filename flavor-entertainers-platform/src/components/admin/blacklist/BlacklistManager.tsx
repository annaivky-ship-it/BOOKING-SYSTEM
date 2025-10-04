'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Plus, Search, Shield, UserX, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Database } from '@/lib/types/database';

interface BlacklistEntry {
  id: string;
  user_id?: string;
  email?: string;
  phone?: string;
  reason: string;
  severity_level: number;
  notes?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  profiles?: {
    display_name: string;
    email: string;
  };
  created_by_profile?: {
    display_name: string;
  };
}

const SEVERITY_LEVELS = {
  1: { label: 'Low', color: 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50', description: 'Minor issues or warnings' },
  2: { label: 'Medium', color: 'bg-orange-900/30 text-orange-300 border-orange-700/50', description: 'Moderate violations or concerns' },
  3: { label: 'High', color: 'bg-red-900/30 text-red-300 border-red-700/50', description: 'Serious violations requiring immediate action' },
  4: { label: 'Critical', color: 'bg-red-900/50 text-red-200 border-red-600/70', description: 'Permanent ban - severe violations' }
};

export function BlacklistManager() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<BlacklistEntry | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const supabase = createClientComponentClient<Database>();

  // Form state for adding new entries
  const [newEntry, setNewEntry] = useState({
    identifier: '',
    identifierType: 'email' as 'email' | 'phone' | 'user_id',
    reason: '',
    notes: '',
    severity_level: 2,
    expires_at: ''
  });

  const fetchEntries = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('blacklist')
        .select(`
          *,
          profiles!blacklist_user_id_fkey(display_name, email),
          created_by_profile:profiles!blacklist_created_by_fkey(display_name)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter === 'active') {
        query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());
      } else if (filter === 'expired') {
        query = query.not('expires_at', 'is', null).lt('expires_at', new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by search term
      let filteredData = data || [];
      if (searchTerm) {
        filteredData = filteredData.filter(entry =>
          entry.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.phone?.includes(searchTerm) ||
          entry.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setEntries(filteredData);
    } catch (error) {
      console.error('Error fetching blacklist entries:', error);
      toast.error('Failed to load blacklist entries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filter, searchTerm]);

  const addToBlacklist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const entryData: any = {
        reason: newEntry.reason,
        notes: newEntry.notes,
        severity_level: newEntry.severity_level,
        created_by: user.id
      };

      // Set identifier based on type
      if (newEntry.identifierType === 'email') {
        entryData.email = newEntry.identifier;
      } else if (newEntry.identifierType === 'phone') {
        entryData.phone = newEntry.identifier;
      } else if (newEntry.identifierType === 'user_id') {
        entryData.user_id = newEntry.identifier;
      }

      // Set expiration if provided
      if (newEntry.expires_at) {
        entryData.expires_at = new Date(newEntry.expires_at).toISOString();
      }

      const { error } = await supabase
        .from('blacklist')
        .insert(entryData);

      if (error) throw error;

      toast.success('Entry added to blacklist');
      setIsAddDialogOpen(false);
      setNewEntry({
        identifier: '',
        identifierType: 'email',
        reason: '',
        notes: '',
        severity_level: 2,
        expires_at: ''
      });
      fetchEntries();

    } catch (error: any) {
      console.error('Error adding to blacklist:', error);
      toast.error(error.message || 'Failed to add entry to blacklist');
    }
  };

  const updateEntry = async (entryId: string, updates: Partial<BlacklistEntry>) => {
    try {
      const { error } = await supabase
        .from('blacklist')
        .update(updates)
        .eq('id', entryId);

      if (error) throw error;

      toast.success('Blacklist entry updated');
      fetchEntries();
    } catch (error: any) {
      console.error('Error updating blacklist entry:', error);
      toast.error(error.message || 'Failed to update entry');
    }
  };

  const removeFromBlacklist = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('blacklist')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      toast.success('Entry removed from blacklist');
      fetchEntries();
    } catch (error: any) {
      console.error('Error removing from blacklist:', error);
      toast.error(error.message || 'Failed to remove entry');
    }
  };

  const getSeverityBadge = (level: number) => {
    const config = SEVERITY_LEVELS[level as keyof typeof SEVERITY_LEVELS] || SEVERITY_LEVELS[2];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <Card className="card-premium">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-zinc-800 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-400" />
            Blacklist Management
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Manage blocked users and security restrictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <Input
                  placeholder="Search by email, phone, reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">All Entries</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Add to Blacklist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Select
                      value={newEntry.identifierType}
                      onValueChange={(value: any) => setNewEntry(prev => ({ ...prev, identifierType: value }))}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="user_id">User ID</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="col-span-2">
                      <Input
                        placeholder={`Enter ${newEntry.identifierType}`}
                        value={newEntry.identifier}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, identifier: e.target.value }))}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      placeholder="Reason for blacklisting"
                      value={newEntry.reason}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, reason: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <Textarea
                      placeholder="Additional notes (optional)"
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">Severity Level</label>
                      <Select
                        value={newEntry.severity_level.toString()}
                        onValueChange={(value) => setNewEntry(prev => ({ ...prev, severity_level: parseInt(value) }))}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {Object.entries(SEVERITY_LEVELS).map(([level, config]) => (
                            <SelectItem key={level} value={level}>
                              {config.label} - {config.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">Expiry Date (optional)</label>
                      <Input
                        type="datetime-local"
                        value={newEntry.expires_at}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, expires_at: e.target.value }))}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={addToBlacklist} className="btn-premium">
                      Add to Blacklist
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Entries Table */}
          <div className="border border-zinc-700 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-700 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-300">Identifier</TableHead>
                  <TableHead className="text-zinc-300">Reason</TableHead>
                  <TableHead className="text-zinc-300">Severity</TableHead>
                  <TableHead className="text-zinc-300">Status</TableHead>
                  <TableHead className="text-zinc-300">Created</TableHead>
                  <TableHead className="text-zinc-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <TableRow key={entry.id} className="border-zinc-700 hover:bg-zinc-800/30">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-white">
                            {entry.profiles?.email || entry.email || entry.phone || 'Unknown'}
                          </div>
                          {entry.profiles?.display_name && (
                            <div className="text-sm text-zinc-400">{entry.profiles.display_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white">{entry.reason}</div>
                        {entry.notes && (
                          <div className="text-sm text-zinc-400 mt-1">{entry.notes}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(entry.severity_level)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {isExpired(entry.expires_at) ? (
                            <Badge className="bg-gray-900/30 text-gray-300 border-gray-700/50">
                              Expired
                            </Badge>
                          ) : (
                            <Badge className="bg-red-900/30 text-red-300 border-red-700/50">
                              Active
                            </Badge>
                          )}
                          {entry.expires_at && (
                            <div className="text-xs text-zinc-500">
                              Expires: {format(new Date(entry.expires_at), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-zinc-400">
                          {format(new Date(entry.created_at), 'MMM d, yyyy')}
                        </div>
                        {entry.created_by_profile?.display_name && (
                          <div className="text-xs text-zinc-500">
                            by {entry.created_by_profile.display_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedEntry(entry)}
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700">
                              <DialogHeader>
                                <DialogTitle className="text-white">Blacklist Entry Details</DialogTitle>
                              </DialogHeader>
                              {selectedEntry && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-zinc-300">Identifier</label>
                                      <div className="text-white">
                                        {selectedEntry.profiles?.email || selectedEntry.email || selectedEntry.phone || 'Unknown'}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-zinc-300">Severity</label>
                                      <div>{getSeverityBadge(selectedEntry.severity_level)}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-zinc-300">Reason</label>
                                    <div className="text-white">{selectedEntry.reason}</div>
                                  </div>
                                  {selectedEntry.notes && (
                                    <div>
                                      <label className="text-sm font-medium text-zinc-300">Notes</label>
                                      <div className="text-white">{selectedEntry.notes}</div>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-zinc-300">Created</label>
                                      <div className="text-white">
                                        {format(new Date(selectedEntry.created_at), 'MMM d, yyyy HH:mm')}
                                      </div>
                                    </div>
                                    {selectedEntry.expires_at && (
                                      <div>
                                        <label className="text-sm font-medium text-zinc-300">Expires</label>
                                        <div className="text-white">
                                          {format(new Date(selectedEntry.expires_at), 'MMM d, yyyy HH:mm')}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2 pt-4 border-t border-zinc-700">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        removeFromBlacklist(selectedEntry.id);
                                        setSelectedEntry(null);
                                      }}
                                    >
                                      <UserX className="w-4 h-4 mr-2" />
                                      Remove from Blacklist
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Shield className="w-12 h-12 text-zinc-600" />
                        <p className="text-zinc-400">No blacklist entries found</p>
                        <p className="text-sm text-zinc-500">
                          {searchTerm ? 'Try adjusting your search criteria' : 'The blacklist is currently empty'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}