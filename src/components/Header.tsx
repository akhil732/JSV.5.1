import React from 'react';
import { Heart, Sparkles, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { GoogleSignInButton } from './GoogleSignInButton';
import { DarkModeToggle } from './DarkModeToggle';

interface HeaderProps {
  logo: string;
  onNavigateHome: () => void;
  onSetView: (view: 'home' | 'report' | 'marriage-match' | 'kp-analysis' | 'advanced-ai') => void;
  currentView: 'home' | 'report' | 'marriage-match' | 'kp-analysis' | 'advanced-ai';
}

export const Header: React.FC<HeaderProps> = ({ logo, onNavigateHome, onSetView, currentView }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="border-b border-ds-outline bg-ds-surface sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <button 
          className="flex items-center gap-2.5 cursor-pointer min-w-0 bg-transparent border-none p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-primary rounded-md" 
          onClick={onNavigateHome}
          aria-label="Go to Home"
        >
          <img 
            src={logo} 
            alt="" 
            role="presentation"
            className="w-9 h-9 object-cover rounded-ds-lg border border-ds-tertiary/35 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="truncate text-left">
            <span className="text-sm sm:text-base md:text-lg font-serif font-bold tracking-wider text-ds-secondary transition-colors whitespace-nowrap block">
              JYOTHISHYA SANATHANAM
            </span>
          </div>
        </button>

        <nav aria-label="Main Navigation" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <DarkModeToggle />
          <button
            onClick={() => onSetView('advanced-ai')}
            aria-current={currentView === 'advanced-ai' ? 'page' : undefined}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-ds-md border transition-all text-xs font-semibold cursor-pointer focus-ring ${
              currentView === 'advanced-ai'
                ? "bg-ds-tertiary/15 border-ds-tertiary/40 text-ds-primary"
                : "border-ds-outline-variant bg-ds-surface-container text-ds-on-surface hover:text-ds-primary"
            }`}
          >
            <Bot className={`w-3.5 h-3.5 ${currentView === 'advanced-ai' ? 'text-ds-primary' : ''}`} aria-hidden="true" />
            <span className="inline">Advanced AI</span>
          </button>

          <button
            onClick={() => onSetView('kp-analysis')}
            aria-current={currentView === 'kp-analysis' ? 'page' : undefined}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-ds-md border transition-all text-xs font-semibold cursor-pointer focus-ring ${
              currentView === 'kp-analysis'
                ? "bg-ds-primary/10 border-ds-primary/30 text-ds-primary"
                : "border-ds-outline-variant bg-ds-surface-container text-ds-on-surface hover:text-ds-primary"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${currentView === 'kp-analysis' ? 'text-ds-primary' : ''}`} aria-hidden="true" />
            <span className="hidden sm:inline">KP Analysis</span>
          </button>

          <button
            onClick={() => onSetView('marriage-match')}
            aria-current={currentView === 'marriage-match' ? 'page' : undefined}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-ds-md border transition-all text-xs font-semibold cursor-pointer focus-ring ${
              currentView === 'marriage-match'
                ? "bg-ds-error-crimson/10 border-ds-error-crimson/30 text-ds-error-crimson"
                : "border-ds-outline-variant bg-ds-surface-container text-ds-on-surface hover:text-ds-error-crimson"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${currentView === 'marriage-match' ? 'text-ds-error-crimson' : ''}`} aria-hidden="true" />
            <span className="hidden sm:inline">Marriage Match</span>
          </button>

          {isAuthenticated ? (
            <UserAvatar photoUrl={user?.photoURL} displayName={user?.displayName || user?.email} />
          ) : (
             <div className="w-32"><GoogleSignInButton /></div>
          )}
        </nav>
      </div>
    </header>
  );
};
