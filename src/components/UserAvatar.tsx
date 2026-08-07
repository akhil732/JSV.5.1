import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface UserAvatarProps {
  photoUrl?: string | null;
  displayName?: string | null;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ photoUrl, displayName }) => {
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-[#F5A623] text-[#0A0E17] flex items-center justify-center font-bold text-sm cursor-pointer hover:opacity-90 border border-[#F5A623]"
      >
        {photoUrl ? <img src={photoUrl} alt="Avatar" className="rounded-full w-full h-full" /> : displayName?.charAt(0).toUpperCase() || 'U'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#10141F] rounded-xl shadow-lg border border-[#1E2433] py-2 z-50">
          <div className="px-4 py-2 text-sm text-[#F5F5F7] font-semibold">{displayName || 'User'}</div>
          <hr className="border-[#1E2433] my-1" />
          <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
