
import React, { useMemo, useState } from 'react';
import { Booking, Performer, BookingStatus, DoNotServeEntry, DoNotServeStatus, Communication } from '../types';
import { ShieldCheck, ShieldAlert, Check, X, MessageSquare, Download, Filter, FileText, DollarSign, CreditCard, BarChart, Inbox, Users as UsersIcon, UserCog, RefreshCcw, ChevronDown, Clock, LoaderCircle, Bell, Eye } from 'lucide-react';
import { calculateBookingCost } from '../utils/bookingUtils';

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
}

const statusClasses: Record<BookingStatus, string> = {
    pending_performer_acceptance: 'border-purple-500/50 bg-purple-900/30 text-purple-300',
    pending_vetting: 'border-yellow-500/50 bg-yellow-900/30 text-yellow-300',
    deposit_pending: 'border-orange-500/50 bg-orange-900/30 text-orange-300',
    pending_deposit_confirmation: 'border-blue-500/50 bg-blue-900/30 text-blue-300',
    confirmed: 'border-green-500/50 bg-green-900/30 text-green-300',
    rejected: 'border-red-500/50 bg-red-900/30 text-red-300',
};

const bookingStatusOptions: { value: BookingStatus; label: string }[] = [
    { value: 'pending_performer_acceptance', label: 'Pending Performer Acceptance' },
    { value: 'pending_vetting', label: 'Pending Vetting' },
    { value: 'deposit_pending', label: 'Deposit Pending' },
    { value: 'pending_deposit_confirmation', label: 'Pending Deposit Confirmation' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'rejected', label: 'Rejected' },
];

type AdminTab = 'management' | 'payments' | 'communications';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ bookings, performers, doNotServeList, communications, onUpdateBookingStatus, onUpdateDoNotServeStatus, onViewDoNotServe, onAdminDecisionForPerformer, onAdminChangePerformer, onViewPerformer }) => {
  
  const [activeTab, setActiveTab] = useState<AdminTab>('management');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [loadingState, setLoadingState] = useState<{ type: string, id: string } | null>(null);
  const [confirmationState, setConfirmationState] = useState<{ entry: DoNotServeEntry, action: 'approved' | 'rejected' } | null>(null);

  const handleAction = async (type: string, id: string, action: () => Promise<void>) => {
    setLoadingState({ type, id });
    try {
      await action();
    } catch (error) {
      console.error(`Action ${type} for id ${id} failed:`, error);
    } finally {
      setLoadingState(null);
    }
  };


  const filteredBookings = useMemo(() => {
    if (!statusFilter) return bookings;
    return bookings.filter(b => b.status === statusFilter);
  }, [bookings, statusFilter]);
  
  const paymentRelatedBookings = useMemo(() => {
    return bookings.filter(b => ['deposit_pending', 'pending_deposit_confirmation', 'confirmed'].includes(b.status));
  }, [bookings]);

  const pendingDnsEntries = doNotServeList.filter(entry => entry.status === 'pending');
  const adminComms = communications.filter(c => c.recipient === 'admin');
  const unreadAlerts = communications.filter(c => c.type === 'system_alert' && !c.read);
  
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = totalBookings - confirmedBookings - bookings.filter(b => b.status === 'rejected').length;


  return (
    <div className="animate-fade-in space-y-8">
      {unreadAlerts.length > 0 && (
        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <Bell className="h-6 w-6 text-red-400 mt-0.5 animate-pulse" />
            <div>
                <h3 className="text-red-400 font-bold">System Alerts ({unreadAlerts.length})</h3>
                <p className="text-red-200/80 text-sm mt-1">You have unread system alerts. Please check the Communications Log.</p>
            </div>
            <button 
                onClick={() => setActiveTab('communications')}
                className="ml-auto text-sm bg-red-900/40 hover:bg-red-900/60 text-red-200 px-3 py-1.5 rounded transition-colors"
            >
                View Log
            </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-xl text-zinc-400 mt-1">Manage bookings and monitor performers.</p>
        </div>
        <button 
          onClick={onViewDoNotServe}
          className="bg-red-600/90 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
        >
          <ShieldAlert className="h-5 w-5" />
          Manage 'Do Not Serve' List
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-base !p-6 flex items-center gap-4"><BarChart className="w-10 h-10 text-orange-500" /><div><p className="text-zinc-400 text-sm">Total Bookings</p><p className="text-3xl font-bold text-white">{totalBookings}</p></div></div>
        <div className="card-base !p-6 flex items-center gap-4"><ShieldCheck className="w-10 h-10 text-green-500" /><div><p className="text-zinc-400 text-sm">Confirmed</p><p className="text-3xl font-bold text-white">{confirmedBookings}</p></div></div>
        <div className="card-base !p-6 flex items-center gap-4"><ShieldAlert className="w-10 h-10 text-yellow-500" /><div><p className="text-zinc-400 text-sm">Pending Actions</p><p className="text-3xl font-bold text-white">{pendingDnsEntries.length + pendingBookings}</p></div></div>
      </div>


      {pendingDnsEntries.length > 0 && (
         <div className="card-base !p-6 !border-yellow-500/50 !bg-yellow-900/20">
           <h2 className="text-2xl font-semibold text-white mb-4">Pending 'Do Not Serve' Submissions</h2>
           <div className="space-y-4">
              {pendingDnsEntries.map(entry => (
                <div key={entry.id} className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <p className="font-bold text-lg text-white">{entry.client_name}</p>
                        <p className="text-sm text-zinc-400">Submitted by: <span className="font-semibold text-orange-400">{entry.performer?.name || 'N/A'}</span></p>
                        <p className="text-sm text-zinc-300 mt-1 italic">Reason: "{entry.reason}"</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <button onClick={() => setConfirmationState({ entry, action: 'approved' })} disabled={loadingState?.id === entry.id} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded flex items-center gap-1 text-xs w-24 justify-center">
                          {loadingState?.type === 'dns-approve' && loadingState.id === entry.id ? <LoaderCircle size={14} className="animate-spin" /> : <><Check size={14}/> Approve</>}
                        </button>
                        <button onClick={() => setConfirmationState({ entry, action: 'rejected' })} disabled={loadingState?.id === entry.id} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded flex items-center gap-1 text-xs w-24 justify-center">
                          {loadingState?.type === 'dns-reject' && loadingState.id === entry.id ? <LoaderCircle size={14} className="animate-spin" /> : <><X size={14}/> Reject</>}
                        </button>
                    </div>
                </div>
              ))}
           </div>
         </div>
      )}

      {confirmationState && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card-base !p-6 max-w-md w-full bg-zinc-900 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Confirm Action</h3>
            <p className="mt-2 text-zinc-300">
              Are you sure you want to <strong className={confirmationState.action === 'approved' ? 'text-green-400' : 'text-red-400'}>{confirmationState.action}</strong> the 'Do Not Serve' entry for <strong>{confirmationState.entry.client_name}</strong>?
            </p>
             <p className="mt-4 text-sm text-zinc-400 border-l-4 border-zinc-600 pl-4 italic">Reason: "{confirmationState.entry.reason}"</p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setConfirmationState(null)}
                className="bg-zinc-600 hover:bg-zinc-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAction(
                    `dns-${confirmationState.action}`,
                    confirmationState.entry.id,
                    () => onUpdateDoNotServeStatus(confirmationState.entry.id, confirmationState.action)
                  );
                  setConfirmationState(null);
                }}
                className={`font-semibold px-4 py-2 rounded-lg transition-colors ${
                  confirmationState.action === 'approved'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Confirm {confirmationState.action.charAt(0).toUpperCase() + confirmationState.action.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Tab Navigation */}
      <div className="border-b border-zinc-800">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('management')}
            className={`${activeTab === 'management' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2`}
          >
            <CreditCard size={16}/> Booking Management
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`${activeTab === 'payments' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2`}
          >
            <DollarSign size={16}/> Payment Tracking
          </button>
           <button
            onClick={() => setActiveTab('communications')}
            className={`${activeTab === 'communications' ? 'border-orange-500 text-orange-400' : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2`}
          >
            <Inbox size={16}/> Communications Log
          </button>
        </nav>
      </div>

      {activeTab === 'management' && (
      <div className="card-base !p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-white">All Booking Applications</h2>
          <div className="flex items-center gap-2">
              <div className="relative">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                 <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
                    className="input-base !py-2 !pl-9 !pr-4 !text-sm !w-auto"
                 >
                    <option value="">All Statuses</option>
                    {bookingStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                 </select>
              </div>
              <button onClick={() => alert('CSV export functionality would be implemented here.')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded-md transition-colors duration-300 flex items-center gap-2 text-sm">
                  <Download size={16}/> Export CSV
              </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredBookings.length > 0 ? filteredBookings.map(booking => {
            const isLoading = loadingState?.id === booking.id;
            return (
            <div key={booking.id} className={`p-4 rounded-lg border ${statusClasses[booking.status]}`}>
              <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div>
                  <p className="font-bold text-lg text-white">{booking.event_type} for {booking.client_name}</p>
                  <div className="text-sm text-zinc-400 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span>Assigned to: <span className="font-semibold text-orange-400">{booking.performer?.name || 'N/A'}</span></span>
                    <span className="flex items-center gap-1.5"><UsersIcon size={14}/> Guests: <span className="font-semibold text-white">{booking.number_of_guests}</span></span>
                    {booking.performer_eta_minutes && booking.performer_eta_minutes > 0 && (
                        <span className="flex items-center gap-1.5"><Clock size={14}/> ETA: <span className="font-semibold text-white">{booking.performer_eta_minutes} mins</span></span>
                    )}
                    {booking.id_document_path && (
                        <button 
                            onClick={() => alert(`This would open the secure document viewer for ID: ${booking.id_document_path}`)}
                            className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1 px-2 rounded flex items-center gap-1.5 transition-colors"
                            title="View Client ID"
                        >
                            <FileText size={12}/> View ID
                        </button>
                    )}
                  </div>
                  {booking.client_message && (
                    <p className="text-sm text-zinc-300 mt-1 italic">Note: "{booking.client_message}"</p>
                  )}
                  <p className={`font-semibold capitalize text-sm`}>{booking.status.replace(/_/g, ' ')}</p>
                </div>
                <div className="text-sm text-zinc-300 mt-2 md:mt-0 md:text-right">
                    <p>Date: {new Date(booking.event_date).toLocaleDateString()} at {booking.event_time}</p>
                    <p>Contact: {booking.client_email}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-600/50 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                    {booking.status === 'pending_vetting' && (
                        <button onClick={() => handleAction('approve-vetting', booking.id, () => onUpdateBookingStatus(booking.id, 'deposit_pending'))} disabled={isLoading} className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 w-32">
                           {isLoading && loadingState?.type === 'approve-vetting' ? <LoaderCircle size={14} className="animate-spin"/> : <><Check size={14}/> Approve Vetting</>}
                        </button>
                    )}
                    {booking.status === 'pending_deposit_confirmation' && (
                        <button onClick={() => handleAction('confirm-deposit', booking.id, () => onUpdateBookingStatus(booking.id, 'confirmed'))} disabled={isLoading} className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 w-32">
                          {isLoading && loadingState?.type === 'confirm-deposit' ? <LoaderCircle size={14} className="animate-spin"/> : <><Check size={14}/> Confirm Deposit</>}
                        </button>
                    )}
                     {(booking.status === 'pending_vetting' || booking.status === 'deposit_pending' || booking.status === 'pending_performer_acceptance') && (
                        <button onClick={() => handleAction('reject', booking.id, () => onUpdateBookingStatus(booking.id, 'rejected'))} disabled={isLoading} className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 w-20">
                           {isLoading && loadingState?.type === 'reject' ? <LoaderCircle size={14} className="animate-spin"/> : <><X size={14}/> Reject</>}
                        </button>
                     )}
                     {booking.status === 'pending_performer_acceptance' && (
                        <div className="flex items-center gap-2 pl-2 border-l border-zinc-600">
                           <p className="text-xs font-semibold text-zinc-300">Admin Override:</p>
                           <button onClick={() => handleAction('override-accept', booking.id, () => onAdminDecisionForPerformer(booking.id, 'accepted'))} disabled={isLoading} className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 w-36">
                             {isLoading && loadingState?.type === 'override-accept' ? <LoaderCircle size={14} className="animate-spin"/> : <><Check size={14}/> Accept for Performer</>}
                           </button>
                           <button onClick={() => handleAction('override-decline', booking.id, () => onAdminDecisionForPerformer(booking.id, 'declined'))} disabled={isLoading} className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 w-36">
                             {isLoading && loadingState?.type === 'override-decline' ? <LoaderCircle size={14} className="animate-spin"/> : <><X size={14}/> Decline for Performer</>}
                           </button>
                        </div>
                     )}
                </div>
                 <div className="flex flex-wrap gap-2 items-center">
                    {booking.status !== 'confirmed' && booking.status !== 'rejected' && (
                       <div className="relative group">
                          <RefreshCcw className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <select 
                            value={booking.performer_id}
                            onChange={(e) => onAdminChangePerformer(booking.id, Number(e.target.value))}
                            className="input-base !py-1.5 !pl-9 !pr-8 !text-xs !w-auto appearance-none bg-zinc-700 hover:bg-zinc-600"
                            title="Reassign Performer"
                           >
                            <option value={booking.performer_id} disabled>Reassign</option>
                            {performers.filter(p => p.id !== booking.performer_id).map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                       </div>
                    )}
                    {booking.status === 'confirmed' && booking.verified_at && (
                        <div className="text-xs text-green-300/80">
                            Verified by <strong>{booking.verified_by_admin_name}</strong> on {new Date(booking.verified_at).toLocaleDateString()}
                        </div>
                    )}
                 </div>
              </div>
            </div>
          )}) : <p className="text-zinc-400 text-center py-4">No bookings match the current filter.</p>}
        </div>
      </div>
      )}

      {activeTab === 'payments' && (
        <div className="card-base !p-0">
            <h2 className="text-2xl font-semibold text-white mb-4 p-6">PayID Deposit Tracking</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-zinc-400">
                    <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Client</th>
                            <th scope="col" className="px-6 py-3">Performer</th>
                            <th scope="col" className="px-6 py-3">Total Cost</th>
                            <th scope="col" className="px-6 py-3">Deposit Due</th>
                            <th scope="col" className="px-6 py-3">Payment Status</th>
                            <th scope="col" className="px-6 py-3">Action / Verified By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentRelatedBookings.length > 0 ? paymentRelatedBookings.map(booking => {
                            const { totalCost, depositAmount } = calculateBookingCost(booking.duration_hours, booking.services_requested, 1);
                            
                            let paymentStatusText = 'Unknown';
                            if (booking.status === 'deposit_pending') paymentStatusText = 'Awaiting Receipt';
                            if (booking.status === 'pending_deposit_confirmation') paymentStatusText = 'Verification Needed';
                            if (booking.status === 'confirmed') paymentStatusText = 'Verified';

                            return (
                                <tr key={booking.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{booking.client_name}</td>
                                    <td className="px-6 py-4">{booking.performer?.name}</td>
                                    <td className="px-6 py-4">${totalCost.toFixed(2)}</td>
                                    <td className="px-6 py-4 font-bold text-orange-400">${depositAmount.toFixed(2)}</td>
                                    <td className={`px-6 py-4 font-semibold ${statusClasses[booking.status]}`}>{paymentStatusText}</td>
                                    <td className="px-6 py-4">
                                        {booking.status === 'pending_deposit_confirmation' && (
                                            <button onClick={() => {
                                                if (booking.deposit_receipt_path?.startsWith('simulated/')) {
                                                    alert(`This is a simulated receipt for a successful payment.\n\nFile: ${booking.deposit_receipt_path}\nBooking ID: ${booking.id}`);
                                                } else if (booking.deposit_receipt_path) {
                                                    alert(`This would open the uploaded file: ${booking.deposit_receipt_path}`);
                                                } else {
                                                    alert('No receipt was uploaded for this booking.');
                                                }
                                            }} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded flex items-center gap-1">
                                                <FileText size={14}/> View Receipt
                                            </button>
                                        )}
                                        {booking.status === 'confirmed' && booking.verified_at && (
                                            <div className="text-xs text-green-300/80">
                                                <p><strong>{booking.verified_by_admin_name}</strong></p>
                                                <p className="text-zinc-500">{new Date(booking.verified_at).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        }) : (
                             <tr>
                                <td colSpan={6} className="text-center py-8 text-zinc-500">No bookings are currently in a payment stage.</td>
                             </tr>
                        )}
                    </tbody>
                </table>
             </div>
        </div>
      )}
       
      {activeTab === 'communications' && (
         <div className="card-base !p-6">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3"><MessageSquare /> Admin Communications Log</h2>
             {adminComms.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 -mr-2">
                  {adminComms.map(comm => (
                    <div key={comm.id} className={`p-3 rounded-md text-sm border ${comm.type === 'system_alert' ? 'bg-red-900/10 border-red-500/30' : 'bg-zinc-900/70 border-zinc-700/50'}`}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className={comm.type === 'system_alert' ? 'text-red-200' : 'text-zinc-200'}>{comm.message}</p>
                                <div className="text-xs text-zinc-500 mt-2 flex gap-3">
                                    <span>From: <span className="text-orange-400 font-semibold">{comm.sender}</span></span>
                                    {comm.type === 'system_alert' && <span className="text-red-400 font-bold uppercase text-[10px] border border-red-500/50 px-1 rounded">System Alert</span>}
                                </div>
                            </div>
                            <span className="text-xs text-zinc-500 whitespace-nowrap">{new Date(comm.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="text-center py-12 text-zinc-500">
                  <Inbox className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
                  <p className="font-semibold">No system messages for admin.</p>
                  <p className="text-xs">Alerts and important notifications will appear here.</p>
                </div>
             )}
        </div>
      )}
      
       <div className="card-base !p-6">
         <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3"><UserCog />Performer Profiles</h2>
         <ul className="space-y-2 max-h-60 overflow-y-auto">
            {performers.map(p => (
                <li key={p.id} className="flex justify-between items-center bg-zinc-900/70 p-3 rounded-md border border-zinc-700/50 hover:bg-zinc-800/80 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${p.status === 'available' ? 'bg-green-500' : p.status === 'busy' ? 'bg-yellow-500' : 'bg-zinc-500'}`}></div>
                        <span className="text-white font-medium">{p.name}</span>
                        <span className="text-xs text-zinc-500 hidden sm:inline-block">({p.status})</span>
                    </div>
                    <button 
                        onClick={() => onViewPerformer(p)}
                        className="text-xs bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-1.5 px-3 rounded flex items-center gap-2 transition-colors"
                    >
                        <Eye size={14} /> View Profile
                    </button>
                </li>
            ))}
         </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
