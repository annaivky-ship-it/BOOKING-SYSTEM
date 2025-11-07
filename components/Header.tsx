import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Role, Communication, Profile, Performer } from '../types';
import { Bell, Inbox, CheckCheck, Video, Settings, Search, LogIn, LogOut, LayoutDashboard, Users, UserCog, Shield, ChevronDown, PlayCircle } from 'lucide-react';
import type { Session } from 'https://esm.sh/@supabase/supabase-js@^2.44.4';

interface HeaderProps {
  children?: React.ReactNode;
  view: string;
  onNavigate: (targetView: 'admin_dashboard' | 'performer_dashboard' | 'available_now') => void;
  userProfile: Profile | null;
  communications: Communication[];
  onMarkRead: () => void;
  onShowPresentation: () => void;
  onStartWalkthrough: () => void;
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

const NavButton: React.FC<{onClick: () => void, isActive: boolean, children: React.ReactNode, className?: string, tourId?: string}> = ({ onClick, isActive, children, className = '', tourId }) => (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-md transition-colors ${isActive ? 'bg-orange-500/20 text-orange-300' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'} ${className}`}
      data-tour-id={tourId}
    >
      {children}
    </button>
);


const Header: React.FC<HeaderProps> = ({ children, view, onNavigate, userProfile, communications, onMarkRead, onShowPresentation, onStartWalkthrough, onViewUserSettings, searchQuery, onSearchChange, session, onSignOut, onSignInClick, performers, currentPerformerIdForAdmin, onPerformerChangeForAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentPerformerId = userProfile?.role === 'performer' ? userProfile.performer_id : (userProfile?.role === 'admin' ? currentPerformerIdForAdmin : null);
  const viewRole = userProfile?.role === 'admin' && view.startsWith('performer') ? 'performer' : (userProfile?.role || 'user');


  const relevantCommunications = useMemo(() => {
    let filtered: Communication[] = [];
    if (viewRole === 'admin' && (view.startsWith('admin') || view.startsWith('do_not_serve'))) {
      filtered = communications.filter(c => c.recipient === 'admin');
    } else if (viewRole === 'performer' && view.startsWith('performer')) {
      filtered = communications.filter(c => c.recipient === currentPerformerId);
    } else { // user
      filtered = communications.filter(c => c.recipient === 'user');
    }
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [communications, view, viewRole, currentPerformerId]);

  const unreadCount = useMemo(() => {
    return relevantCommunications.filter(c => !c.read).length;
  }, [relevantCommunications]);
  
  const handleToggle = () => {
    if (!isOpen && unreadCount > 0) {
      onMarkRead();
    }
    setIsOpen(prev => !prev);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDashboardView = view.includes('dashboard') || view.includes('do_not_serve');

  const renderNavLinks = () => {
    if (!userProfile) return null;

    const role = userProfile.role;
    
    if (role === 'performer') {
      return (
        <div className="flex items-center p-1 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
          <NavButton onClick={() => onNavigate('available_now')} isActive={!isDashboardView}><Users size={16}/> Client View</NavButton>
          <NavButton onClick={() => onNavigate('performer_dashboard')} isActive={isDashboardView}><LayoutDashboard size={16}/> My Dashboard</NavButton>
        </div>
      );
    }
    
    if (role === 'admin') {
      return (
        <div className="flex items-center p-1 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
           <NavButton onClick={() => onNavigate('available_now')} isActive={view.startsWith('available') || view.startsWith('future')}><Users size={16}/> Client View</NavButton>
           <NavButton onClick={() => onNavigate('admin_dashboard')} isActive={view === 'admin_dashboard'} tourId="nav-admin-dashboard"><Shield size={16}/> Admin Dashboard</NavButton>
           <div className="flex items-center">
              <NavButton onClick={() => onNavigate('performer_dashboard')} isActive={view === 'performer_dashboard'} className="!rounded-r-none !border-r-0" tourId="nav-performer-view">
                <UserCog size={16}/> Performer View
              </NavButton>
              <div className="relative">
                <select 
                  value={currentPerformerIdForAdmin ?? ''}
                  onChange={(e) => onPerformerChangeForAdmin(Number(e.target.value) || null)}
                  className="bg-zinc-700/80 border border-zinc-600 h-[36px] text-white text-sm rounded-r-md focus:ring-orange-500 focus:border-orange-500 block w-full pl-3 pr-8 appearance-none transition-colors hover:bg-zinc-700"
                  onClick={() => { if(view !== 'performer_dashboard') onNavigate('performer_dashboard')}}
                >
                  {performers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
           </div>
        </div>
      )
    }

    return null;
  }

  return (
    <header className="bg-black/30 backdrop-blur-lg sticky top-0 z-50 border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex flex-col items-start cursor-pointer no-underline group" data-tour-id="header-logo">
            <div className="flex items-center">
                <span className="font-logo-main text-3xl tracking-wider text-white group-hover:text-orange-400 transition-colors duration-300">FLAV</span>
                <span className="text-3xl mx-[-0.15em] relative transform group-hover:scale-110 transition-transform duration-300" style={{top: "-0.05em"}}>🍑</span>
                <span className="font-logo-main text-3xl tracking-wider text-white group-hover:text-orange-400 transition-colors duration-300">R</span>
            </div>
            <span className="font-logo-sub text-base text-zinc-500 -mt-1 ml-1 tracking-wide group-hover:text-zinc-300 transition-colors duration-300">entertainers</span>
          </Link>
          <nav className="flex items-center gap-2">
             <div className="relative hidden md:block mr-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search performers..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="input-base !w-52 !pl-10 !py-2 !bg-zinc-800/80 focus:!bg-zinc-800 transition-all duration-300 focus:!w-72"
                    aria-label="Search for performers by name, tagline, or service"
                />
            </div>

            {session && <div className="hidden lg:flex items-center gap-4 mr-2">{renderNavLinks()}</div>}
            
             <button
                onClick={onStartWalkthrough}
                className="text-zinc-400 hover:text-white p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                title="Start Interactive Tour"
              >
                <PlayCircle className="h-6 w-6" />
              </button>
             <button 
                onClick={onShowPresentation} 
                className="text-zinc-400 hover:text-white p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                title="Watch Platform Presentation"
              >
                <Video className="h-6 w-6" />
              </button>
             <div className="relative" ref={dropdownRef}>
                <button onClick={handleToggle} className="relative text-zinc-400 hover:text-white p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow-lg">{unreadCount}</span>
                    )}
                </button>
                {isOpen && (
                    <div className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-10 animate-fade-in-down overflow-hidden">
                       <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/70">
                         <h3 className="font-semibold text-white">Notifications</h3>
                         {unreadCount === 0 && relevantCommunications.length > 0 && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCheck size={14}/>All caught up!</span>}
                       </div>
                       <div className="max-h-96 overflow-y-auto">
                         {relevantCommunications.length > 0 ? (
                            relevantCommunications.map(comm => (
                                <div key={comm.id} className={`p-4 border-b border-zinc-800/50 transition-colors ${comm.read ? 'opacity-60 hover:opacity-100' : 'bg-orange-500/10 hover:bg-orange-500/20'}`}>
                                    <p className="text-sm text-zinc-200">{comm.message}</p>
                                    <div className="text-xs text-zinc-400 mt-2 flex justify-between">
                                        <span>From: <span className="font-semibold text-orange-400">{comm.sender}</span></span>
                                        <span className="text-zinc-500">{new Date(comm.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                         ) : (
                            <div className="text-center p-8 text-zinc-500">
                               <Inbox className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
                               <p className="font-semibold">No notifications yet.</p>
                               <p className="text-xs">Updates will appear here.</p>
                            </div>
                         )}
                       </div>
                    </div>
                )}
            </div>
            {!isDashboardView && onViewUserSettings && (
              <button 
                onClick={onViewUserSettings} 
                className="text-zinc-400 hover:text-white p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                title="Notification Settings"
              >
                <Settings className="h-6 w-6" />
              </button>
            )}
            {children}
             {session ? (
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="text-zinc-400 hover:text-white p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                <LogOut className="h-6 w-6" />
              </button>
            ) : (
              <button
                onClick={onSignInClick}
                className="btn-primary flex items-center gap-2 !text-sm !px-4 !py-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;