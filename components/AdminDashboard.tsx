
import React, { useMemo, useState } from 'react';
import { Booking, Performer, BookingStatus, DoNotServeEntry, DoNotServeStatus, Communication, Service, PerformerStatus } from '../types';
import { ShieldCheck, Check, X, MessageSquare, Filter, FileText, DollarSign, Users, UserCog, RefreshCcw, ChevronDown, Clock, LoaderCircle, Zap, Calendar, MapPin, Edit, Trash2, Plus, Sparkles, TrendingUp, Send, CheckCircle } from 'lucide-react';
import { calculateBookingCost } from '../utils/bookingUtils';
import { allServices } from '../data/mockData';

interface AdminDashboardProps {
  bookings: Booking[];
  performers: Performer[];
  doNotServeList: DoNotServeEntry[];
  communications: Communication[];
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  onUpdateDoNotServeStatus: (entryId: string, status: DoNotServeStatus) => Promise<void>;
  onViewDoNotServe: () => void;
  onAdminDecisionForPerformer: (bookingId: string, decision: 'accepted' | 'declined') => Promise<void>;
  onAdminChangePerformer: (bookingId: string, newPerformerId: number) => Promise<void>;
  onViewPerformer: (performer: Performer) => void;
  isAutoVetEnabled: boolean;
  onToggleAutoVet: (enabled: boolean) => void;
  onAddPerformer: (data: Omit<Performer, 'id' | 'created_at'>) => Promise<void>;
  onUpdatePerformer: (id: number, updates: Partial<Performer>) => Promise<void>;
  onDeletePerformer: (id: number) => Promise<void>;
}

const statusClasses: Record<BookingStatus, string> = {
    pending_performer_acceptance: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
    pending_vetting: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
    deposit_pending: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
    pending_deposit_confirmation: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    confirmed: 'border-green-500/20 bg-green-500/10 text-green-400',
    rejected: 'border-red-500/20 bg-red-500/10 text-red-400',
};

const vettingStatusConfig: Record<PerformerStatus, { label: string; classes: string }> = {
    pending: { label: 'Needs Approval', classes: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400' },
    available: { label: 'Approved', classes: 'border-green-500/20 bg-green-500/5 text-green-400' },
    unavailable: { label: 'Approved', classes: 'border-green-500/20 bg-green-500/5 text-green-400' },
    rejected: { label: 'Flagged', classes: 'border-red-500/20 bg-red-500/5 text-red-400' },
};

type AdminTab = 'bookings' | 'performers' | 'analytics' | 'messages';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ bookings, performers, onAdminDecisionForPerformer, onUpdatePerformer, onDeletePerformer, onAddPerformer }) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'performers' | 'analytics'>('bookings');

  const newBookings = bookings.filter(b => b.status === 'pending_performer_acceptance' || b.status === 'pending_vetting');
  const pendingTalent = performers.filter(p => p.status === 'pending');

  const totalRevenueToday = useMemo(() => {
    return bookings
      .filter(b => b.status === 'confirmed' && b.event_date === new Date().toISOString().split('T')[0])
      .reduce((sum, b) => sum + calculateBookingCost(b.duration_hours, b.services_requested, 1).totalCost, 0);
  }, [bookings]);

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto pb-20">
      {/* Dynamic Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-950/60 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Revenue (Today)</p>
                <DollarSign size={16} className="text-emerald-500" />
             </div>
             <p className="text-3xl font-black text-white">${totalRevenueToday.toFixed(0)}</p>
          </div>
          <div className="bg-zinc-950/60 border border-white/5 p-6 rounded-3xl backdrop-blur-xl relative group">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">New Requests</p>
                <Zap size={16} className="text-orange-500" />
             </div>
             <p className="text-3xl font-black text-white">{newBookings.length}</p>
             {newBookings.length > 0 && <span className="absolute top-4 right-4 w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>}
          </div>
          <div className="bg-zinc-950/60 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Pending Talent</p>
                <UserCog size={16} className="text-purple-500" />
             </div>
             <p className="text-3xl font-black text-white">{pendingTalent.length}</p>
          </div>
          <div className="bg-zinc-950/60 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
             <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Roster</p>
                <Users size={16} className="text-sky-500" />
             </div>
             <p className="text-3xl font-black text-white">{performers.filter(p => p.status === 'available').length}</p>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 p-1.5 bg-zinc-900/80 rounded-2xl border border-white/10 w-fit">
          <button onClick={() => setActiveTab('bookings')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'bookings' ? 'bg-orange-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
             Bookings
             {newBookings.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-600 border-2 border-zinc-900 text-[8px] flex items-center justify-center font-black">{newBookings.length}</span>}
          </button>
          <button onClick={() => setActiveTab('performers')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'performers' ? 'bg-orange-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
             Talent
             {pendingTalent.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-600 border-2 border-zinc-900 text-[8px] flex items-center justify-center font-black">{pendingTalent.length}</span>}
          </button>
      </div>

      {activeTab === 'bookings' && (
          <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3"><Clock size={18}/> Active Requests</h2>
                      <button className="text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white">View All History</button>
                  </div>
                  <div className="space-y-4">
                      {bookings.slice(0, 8).map(booking => (
                          <div key={booking.id} className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-6 hover:border-white/10 transition-all group">
                              <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                      <h3 className="font-black text-white uppercase tracking-tight text-lg">{booking.client_name}</h3>
                                      <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${statusClasses[booking.status]}`}>
                                          {booking.status.replace(/_/g, ' ')}
                                      </span>
                                  </div>
                                  <div className="flex flex-wrap gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                      <span className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(booking.event_date).toLocaleDateString()}</span>
                                      <span className="flex items-center gap-1.5"><MapPin size={12}/> {booking.event_address.split(',')[0]}</span>
                                      <span className="flex items-center gap-1.5 text-orange-500"><Zap size={12}/> {booking.performer?.name}</span>
                                  </div>
                              </div>
                              <div className="flex gap-2">
                                  {booking.status === 'pending_vetting' && (
                                      <button 
                                          onClick={() => onAdminDecisionForPerformer(booking.id, 'accepted')}
                                          className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                                          title="Quick Approve"
                                      ><Check size={18}/></button>
                                  )}
                                  <button className="p-3 bg-zinc-800 text-zinc-400 rounded-xl hover:text-white transition-all"><MessageSquare size={18}/></button>
                                  <button className="p-3 bg-zinc-800 text-zinc-400 rounded-xl hover:text-white transition-all"><Edit size={18}/></button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="lg:col-span-1 space-y-8">
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3"><Users size={18}/> Approval Queue</h2>
                    <div className="space-y-3">
                        {pendingTalent.length > 0 ? pendingTalent.map(p => (
                            <div key={p.id} className="bg-zinc-950/60 border border-white/5 p-4 rounded-2xl flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <img src={p.photo_url} className="w-10 h-10 rounded-xl object-cover border border-white/5" alt="" />
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{p.name}</p>
                                        <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{p.service_areas[0]?.split(' ')[0]}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onUpdatePerformer(p.id, { status: 'available' })}
                                    className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl hover:bg-purple-500 hover:text-white transition-all"
                                >
                                    <CheckCircle size={18}/>
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-10 bg-white/5 rounded-3xl border border-dashed border-white/5">
                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">No pending profiles</p>
                            </div>
                        )}
                    </div>
                  </div>

                  <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-3xl">
                      <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Send size={12}/> SMS Templates</h3>
                      <div className="space-y-2">
                          <button className="w-full text-left p-3 rounded-xl bg-zinc-900 border border-white/5 text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-white hover:border-orange-500/30 transition-all">"Talent is 5 mins late"</button>
                          <button className="w-full text-left p-3 rounded-xl bg-zinc-900 border border-white/5 text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-white hover:border-orange-500/30 transition-all">"ID Photo needed"</button>
                          <button className="w-full text-left p-3 rounded-xl bg-zinc-900 border border-white/5 text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-white hover:border-orange-500/30 transition-all">"Send receipt screen"</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'performers' && (
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Talent Roster</h2>
                  <button onClick={() => onAddPerformer({} as any)} className="btn-primary !py-2.5 !px-6 !text-[10px] flex items-center gap-2"><Plus size={16}/> New Talent</button>
              </div>
              <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] overflow-hidden">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-950/50 border-b border-white/5">
                          <tr>
                              <th className="px-6 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Performer</th>
                              <th className="px-6 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Primary Specialty</th>
                              <th className="px-6 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Status</th>
                              <th className="px-6 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest text-right">Manage</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {performers.map(p => (
                              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="px-6 py-4 flex items-center gap-4">
                                      <img src={p.photo_url} className="w-10 h-10 rounded-xl object-cover border border-white/5" alt="" />
                                      <span className="font-black text-white text-xs uppercase tracking-widest">{p.name}</span>
                                  </td>
                                  <td className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                      {allServices.find(s => p.service_ids.includes(s.id))?.name || 'Vetted Professional'}
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${p.status === 'available' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-zinc-800/20 border-zinc-700 text-zinc-500'}`}>
                                          {p.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-right space-x-3">
                                      <button className="text-zinc-500 hover:text-white transition-colors"><Edit size={14}/></button>
                                      <button onClick={() => onDeletePerformer(p.id)} className="text-zinc-500 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
