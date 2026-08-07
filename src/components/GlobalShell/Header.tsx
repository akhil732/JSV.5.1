import React, { useState } from 'react';
import { User, Settings, Search, Check, Sparkles, X } from 'lucide-react';
import { SavedPerson } from '../../types/marriageMatch';
import { UserAvatar } from '../UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../design-system/Button';
import DarkModeToggle from '../DarkModeToggle';

interface GlobalHeaderProps {
  logo?: string;
  activeProfile: SavedPerson | null;
  savedProfiles: SavedPerson[];
  onSelectActiveProfile: (profile: SavedPerson) => void;
  onCreateNewProfile: () => void;
  onNavigatePage: (page: 'home' | 'birth-chart' | 'marriage-match' | 'ai-consultation' | 'profile') => void;
  language?: 'en' | 'hi' | 'te';
  onLanguageChange?: (lang: 'en' | 'hi' | 'te') => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  logo,
  activeProfile,
  savedProfiles,
  onSelectActiveProfile,
  onCreateNewProfile,
  onNavigatePage,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProfiles = savedProfiles.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.place.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="h-[56px] sticky top-0 z-40 bg-ds-surface/95 backdrop-blur-md border-b border-ds-secondary/15 px-3 sm:px-4 flex items-center justify-between gap-2 shadow-sm transition-all">
        {/* Brand Logo & Name */}
        <button 
          onClick={() => onNavigatePage('home')}
          className="flex items-center gap-2 cursor-pointer group shrink-0 select-none bg-transparent border-none p-0 focus-ring rounded-md"
          aria-label="Go to Home"
        >
          {logo ? (
            <img 
              src={logo} 
              alt=""
              role="presentation"
              className="w-8 h-8 object-cover rounded-ds-md border border-ds-primary/30 shadow-sm group-hover:scale-105 transition-transform"
            />
          ) : (
            <div aria-hidden="true" className="w-8 h-8 rounded-ds-md bg-gradient-to-br from-ds-tertiary to-ds-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
              🕉
            </div>
          )}
          <div className="flex flex-col text-left">
            <span className="font-playfair font-bold text-sm sm:text-base tracking-tight text-ds-secondary group-hover:text-ds-primary transition-colors leading-tight">
              Jyothishya Sanathanam
            </span>
            <span className="text-[10px] text-ds-on-surface-variant font-inter font-medium leading-none hidden xs:inline">
              Eternal Vedic Astrology
            </span>
          </div>
        </button>

        {/* Right Controls: Dark Mode Toggle & Profile Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* Profile Button */}
          <button
            onClick={() => onNavigatePage('profile')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-ds-full border border-ds-secondary/20 bg-ds-surface-container hover:bg-ds-surface-variant hover:border-ds-primary/50 text-ds-secondary text-xs font-medium transition-all shadow-sm cursor-pointer focus-ring"
            title="Go to Profile"
          >
            <User className="w-4 h-4" aria-hidden="true" />
            <span>Profile</span>
          </button>
        </div>
      </header>

    </>
  );
};
