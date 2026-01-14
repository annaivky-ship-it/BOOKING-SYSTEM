
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Role, Communication, Profile, Performer } from '../types';
import { Bell, Inbox, CheckCheck, Settings, Search, LogIn, LogOut, LayoutDashboard, Users, UserCog, Shield, ChevronDown, Menu, X as CloseIcon } from 'lucide-react';
import type { Session } from 'https://esm.sh/@supabase/supabase-js@^2.44.4';

interface HeaderProps {
  children?: React.ReactNode;
  view: string;
  onNavigate: (targetView: 'admin_dashboard' | 'performer_dashboard' | 'available_now') => void;
  userProfile: Profile | null;
  communications: Communication[];
  onMarkRead: () => void;
  onViewUserSettings?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  session: Session | null;
  onSignOut: () => void;
  onSignInClick: () => void;
  performers: Performer[];
  currentPerformerIdForAdmin: number | null;
  onPerformerChangeForAdmin: (id: number | null) => void;
}

const Header: React.FC<HeaderProps> = ({ children, view, onNavigate, userProfile, communications, onMarkRead, onViewUserSettings, searchQuery, onSearchChange, session, onSignOut, onSignInClick, performers, currentPerformerIdForAdmin, onPerformerChangeForAdmin }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentPerformerId = userProfile?.role === 'performer' ? userProfile.performer_id : (userProfile?.role === 'admin' ? currentPerformerIdForAdmin : null);
  const viewRole = userProfile?.role === 'admin' && view.startsWith('performer') ? 'performer' : (userProfile?.role || 'user');

  const relevantCommunications = useMemo(() => {
    let filtered: Communication[] = [];
    if (viewRole === 'admin') {
      filtered = communications.filter(c => c.recipient === 'admin');
    } else if (viewRole === 'performer') {
      filtered = communications.filter(c => c.recipient === currentPerformerId);
    } else {
      filtered = communications.filter(c => c.recipient === 'user');
    }
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [communications, viewRole, currentPerformerId]);

  const unreadCount = useMemo(() => {
    return relevantCommunications.filter(c => !c.read).length;
  }, [relevantCommunications]);
  
  const handleToggleNotif = () => {
    if (!isNotifOpen && unreadCount > 0) onMarkRead();
    setIsNotifOpen(prev => !prev);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="glass sticky top-0 z-[60] border-b border-white/5 h-20 flex items-center">
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          
          <a href="/" className="flex flex-col items-start cursor-pointer no-underline group transition-transform hover:scale-[1.02] flex-shrink-0">
            <div className="flex items-center">
                <span className="font-logo-main text-2xl md:text-3xl tracking-wider text-white">FLAVOR</span>
            </div>
          </a>

          <div className="flex items-center gap-3">
            {userProfile?.role === 'admin' && (
                <button onClick={() => onNavigate('admin_dashboard')} className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                    <Shield size={14}/> AGENCY HUB
                </button>
            )}
            
             <div className="relative" ref={dropdownRef}>
                <button onClick={handleToggleNotif} className="relative text-zinc-400 hover:text-white p-2.5 rounded-xl hover:bg-white/5 transition-all">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-50 text-[10px] font-black text-orange-600 shadow-lg ring-2 ring-zinc-900">{unreadCount}</span>
                    )}
                </button>
                {isNotifOpen && (
                    <div className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 animate-fade-in overflow-hidden">
                       <div className="p-4 border-b border-white/5 bg-zinc-950/50 flex justify-between items-center">
                         <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Notifications</h3>
                         {unreadCount === 0 && <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">All caught up</span>}
                       </div>
                       <div className="max-h-96 overflow-y-auto custom-scrollbar">
                         {relevantCommunications.length > 0 ? (
                            relevantCommunications.map(comm => (
                                <div key={comm.id} className={`p-4 border-b border-white/5 ${comm.read ? 'opacity-40' : 'bg-orange-500/5'}`}>
                                    <p className="text-xs text-zinc-300 font-medium">{comm.message}</p>
                                    <p className="text-[9px] text-zinc-600 mt-2 font-black uppercase tracking-widest">{new Date(comm.created_at).toLocaleTimeString('en-AU')}</p>
                                </div>
                            ))
                         ) : (
                            <div className="p-12 text-center text-zinc-700 uppercase font-black text-[10px] tracking-widest">Empty</div>
                         )}
                       </div>
                    </div>
                )}
            </div>

            {children}

             {session ? (
              <button
                onClick={onSignOut}
                className="text-zinc-500 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            ) : (
              <button
                onClick={onSignInClick}
                className="bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
              >
                PRO PORTAL
              </button>
            )}
          </div>
      </div>
    </header>
  );
};

export default Header;
