import React, { useState } from 'react';
import { ArrowLeft, Search, Info, Heart, User, History, Plus, Trash2, ChevronDown, Check } from 'lucide-react';
import { SystemSelector, SystemId } from './SystemSelector';
import { BirthDetails } from '../../../types';

interface MobileHeaderProps {
  currentSystem: SystemId;
  onChangeSystem: (system: SystemId) => void;
  onBackClick?: () => void;
  onInspectClick: () => void;
  onContextClick: () => void;
  onOpenHistory: () => void;
  birthDetails: BirthDetails;
  profiles?: any[];
  onSelectProfile?: (profile: any) => void;
  onNewChat?: () => void;
  historyCount?: number;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentSystem,
  onChangeSystem,
  onBackClick,
  onInspectClick,
  onContextClick,
  onOpenHistory,
  birthDetails,
  profiles = [],
  onSelectProfile,
  onNewChat,
  historyCount = 0
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const toggleFavorite = () => {
    try {
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(10);
      }
    } catch (e) {}

    setIsSaved(!isSaved);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  return (
    <header className="mobile-header relative flex items-center justify-between px-2.5 sm:px-4 py-2 bg-ds-surface border-b border-ds-secondary/15 z-30 select-none h-12 sm:h-14 text-ds-on-surface">
      {/* Toast alert for favorite */}
      {showSavedToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-ds-primary text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-lg z-50 animate-in fade-in duration-150">
          {isSaved ? '❤️ Conversation favorited' : 'Removed from favorites'}
        </div>
      )}

      {/* Left section: System Selector */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <SystemSelector
          currentSystem={currentSystem}
          onChangeSystem={onChangeSystem}
        />
      </div>

      {/* Right section: Quick actions */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* New Chat Icon Button */}
        {onNewChat && (
          <button
            type="button"
            onClick={onNewChat}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl hover:bg-ds-surface-container text-ds-secondary hover:text-ds-primary transition-colors cursor-pointer"
            aria-label="New Conversation"
            title="New Conversation"
          >
            <Plus className="w-4 h-4 sm:w-4 sm:h-4" />
          </button>
        )}

        {/* Search / Inspector Quick Analysis */}
        <button
          type="button"
          onClick={onInspectClick}
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl hover:bg-ds-surface-container text-ds-secondary hover:text-ds-primary transition-colors cursor-pointer relative"
          aria-label="View Chart Analysis"
          title="View Quick Chart Analysis"
        >
          <Search className="w-4 h-4 sm:w-4 sm:h-4" />
        </button>

        {/* Birth Details & Active Dasha Context Drawer Trigger */}
        <button
          type="button"
          onClick={onContextClick}
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl hover:bg-ds-surface-container text-ds-secondary hover:text-ds-primary transition-colors cursor-pointer"
          aria-label="View Birth Context"
          title="View Birth Details & Active Dasha"
        >
          <Info className="w-4 h-4 sm:w-4 sm:h-4" />
        </button>

        {/* Favorite / Save Conversation */}
        <button
          type="button"
          onClick={toggleFavorite}
          className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
            isSaved
              ? 'bg-ds-error-crimson/10 text-ds-error-crimson'
              : 'hover:bg-ds-surface-container text-ds-secondary hover:text-ds-error-crimson'
          }`}
          aria-label="Favorite Conversation"
          title="Favorite Conversation"
        >
          <Heart className={`w-4 h-4 sm:w-4 sm:h-4 ${isSaved ? 'fill-ds-error-crimson text-ds-error-crimson' : ''}`} />
        </button>

        {/* Profile / Menu Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-ds-primary/10 border border-ds-primary/20 text-ds-primary font-bold text-xs flex items-center justify-center hover:bg-ds-primary/20 transition-colors cursor-pointer"
            aria-label="User Profile & History"
            title="User Profile & History"
          >
            {birthDetails.name ? birthDetails.name[0].toUpperCase() : 'U'}
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-64 bg-ds-surface border border-ds-secondary/15 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in duration-150 text-ds-on-surface"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Profile Header */}
              <div className="border-b border-ds-secondary/15 pb-2 mb-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-ds-on-surface truncate">
                    {birthDetails.name || 'Native'}
                  </p>
                  <span className="text-[10px] font-mono text-ds-primary bg-ds-primary/10 px-1.5 py-0.5 rounded font-bold">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-ds-on-surface-variant font-mono mt-0.5">
                  {birthDetails.date} ({birthDetails.place || 'Unknown'})
                </p>
              </div>

              {/* Menu items */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenHistory();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-ds-surface-container text-ds-secondary transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-ds-primary" />
                    <span>Query History</span>
                  </div>
                  {historyCount > 0 && (
                    <span className="text-[10px] font-mono font-bold bg-ds-primary/10 text-ds-primary px-1.5 py-0.2 rounded-full">
                      {historyCount}
                    </span>
                  )}
                </button>

                {profiles.length > 0 && (
                  <div className="pt-2 border-t border-ds-secondary/15 mt-2 space-y-1">
                    <p className="text-[10px] font-mono uppercase text-ds-on-surface-variant font-semibold px-1">
                      Switch Active Profile
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {profiles.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            if (onSelectProfile) onSelectProfile(p);
                            setShowProfileMenu(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-ds-surface-container ${
                            p.name === birthDetails.name ? 'text-ds-primary font-bold bg-ds-primary/10' : 'text-ds-secondary'
                          }`}
                        >
                          <span className="truncate">{p.name}</span>
                          {p.name === birthDetails.name && <Check className="w-3 h-3 text-ds-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowProfileMenu(false)}
                className="w-full mt-2 pt-2 border-t border-ds-secondary/15 text-center text-xs text-ds-on-surface-variant hover:text-ds-on-surface font-bold cursor-pointer"
              >
                Close Menu
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
