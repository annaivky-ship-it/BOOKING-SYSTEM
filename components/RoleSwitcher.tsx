import React from 'react';
import type { Role, Performer, Profile } from '../types';
import { Users, UserCog, Shield, ChevronDown } from 'lucide-react';

interface RoleSwitcherProps {
  currentViewRole: Role;
  userProfile: Profile | null;
  onViewRoleChange: (role: Role) => void;
  performers: Performer[];
  currentPerformerIdForAdmin: number | null;
  onPerformerChangeForAdmin: (id: number | null) => void;
}

const SelectWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="relative">
        {children}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
          <ChevronDown className="h-4 w-4" />
        </div>
    </div>
);


const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentViewRole, userProfile, onViewRoleChange, performers, currentPerformerIdForAdmin, onPerformerChangeForAdmin }) => {
  const userActualRole = userProfile?.role || 'user';
  
  const allRoles: { id: Role, name: string, icon: React.ReactNode }[] = [
    { id: 'user', name: 'Client View', icon: <Users className="h-4 w-4 mr-2" /> },
    { id: 'performer', name: 'Performer View', icon: <UserCog className="h-4 w-4 mr-2" /> },
    { id: 'admin', name: 'Admin View', icon: <Shield className="h-4 w-4 mr-2" /> },
  ];

  const availableRoles = allRoles.filter(role => {
    if (userActualRole === 'admin') return true;
    if (userActualRole === 'performer') return role.id === 'user' || role.id === 'performer';
    return role.id === 'user';
  });

  if (availableRoles.length <= 1) {
    return null; // Don't show the switcher if there's no choice
  }
  
  const selectClass = "bg-zinc-800 border border-zinc-700 text-white text-sm rounded-md focus:ring-orange-500 focus:border-orange-500 block w-full pl-3 pr-10 py-2 appearance-none transition-colors hover:bg-zinc-700";

  return (
    <div className="flex items-center gap-2">
      <SelectWrapper>
        <select 
          value={currentViewRole}
          onChange={(e) => onViewRoleChange(e.target.value as Role)}
          className={selectClass}
        >
          {availableRoles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </SelectWrapper>
      
      {userActualRole === 'admin' && currentViewRole === 'performer' && (
        <SelectWrapper>
            <select 
              value={currentPerformerIdForAdmin ?? ''}
              onChange={(e) => onPerformerChangeForAdmin(Number(e.target.value))}
              className={selectClass}
            >
              <option value="" disabled>Select Performer</option>
              {performers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
        </SelectWrapper>
      )}
    </div>
  );
};

export default RoleSwitcher;
