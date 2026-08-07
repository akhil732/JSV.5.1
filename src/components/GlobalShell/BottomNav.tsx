import React from 'react';
import { Home, FileText, Heart, Bot, User, Sparkles } from 'lucide-react';

export type ActivePage = 'home' | 'birth-chart' | 'marriage-match' | 'ai-consultation' | 'profile';

interface BottomNavProps {
  activePage: ActivePage;
  onNavigatePage: (page: ActivePage) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activePage, onNavigatePage }) => {
  const navItems: Array<{
    id: ActivePage;
    label: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'birth-chart', label: 'Birth Chart', icon: FileText },
    { id: 'marriage-match', label: 'Match', icon: Heart },
    { id: 'ai-consultation', label: 'AI', icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-ds-surface/95 backdrop-blur-md border-t border-ds-secondary/15 flex justify-around items-center px-2 z-40 shadow-ds-sm select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNavigatePage(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-ds-lg transition-all duration-150 cursor-pointer relative focus-ring ${
              isActive
                ? 'text-ds-primary font-bold'
                : 'text-ds-on-surface-variant hover:text-ds-secondary hover:bg-ds-surface-container'
            }`}
          >
            {/* Icon */}
            <div className={`p-1 rounded-ds-md transition-transform ${isActive ? 'scale-110 bg-ds-primary/10' : ''}`}>
              <Icon className={`w-5 h-5 ${isActive ? 'text-ds-primary' : 'text-ds-on-surface-variant'}`} />
            </div>

            {/* Label */}
            <span className={`text-[11px] leading-none mt-0.5 tracking-tight ${isActive ? 'font-bold text-ds-primary' : 'font-medium'}`}>
              {item.label}
            </span>

            {/* Active Indicator Bar */}
            {isActive && (
              <div className="absolute -top-[1px] w-6 h-[3px] bg-ds-primary rounded-full shadow-sm animate-in fade-in zoom-in duration-150" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
