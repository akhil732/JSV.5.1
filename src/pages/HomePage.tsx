import React, { useState } from 'react';
import { 
  FileText, Heart, Bot, ArrowRight, Plus, Sparkles, Calendar, Clock, MapPin, 
  ChevronRight, RefreshCw, Star, Compass, UserCheck
} from 'lucide-react';
import { SavedPerson } from '../types/marriageMatch';
import { TodayPanchangamWidget } from '../components/TodayPanchangamWidget';
import { Button } from '../components/design-system/Button';
import { Card } from '../components/design-system/Card';

interface HomePageProps {
  activeProfile?: SavedPerson | null;
  savedProfiles: SavedPerson[];
  language: 'en' | 'hi' | 'te';
  onNavigatePage: (page: 'home' | 'birth-chart' | 'marriage-match' | 'ai-consultation' | 'profile') => void;
  onCreateNewProfile: () => void;
  onSelectActiveProfile: (profile: SavedPerson) => void;
  todayPanchangam?: any | null;
  todayPanchangamLoading?: boolean;
  todayPanchangamError?: string | null;
}

export const HomePage: React.FC<HomePageProps> = ({
  savedProfiles,
  language,
  onNavigatePage,
  onCreateNewProfile,
  onSelectActiveProfile,
  todayPanchangam = null,
  todayPanchangamLoading = false,
  todayPanchangamError = null,
}) => {

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto px-3 sm:px-4 pt-3">
      {/* TOP: SEARCH-GROUNDED AI ENGINE BOX */}
      <div
        onClick={() => onNavigatePage('ai-consultation')}
        className="bg-ds-surface-container rounded-ds-xl p-5 sm:p-6 text-ds-on-surface shadow-ds-md hover:shadow-ds-lg transition-all cursor-pointer group relative overflow-hidden border border-ds-primary/30"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-ds-primary/20 to-transparent rounded-bl-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-ds-lg bg-ds-primary text-white">
                <Bot className="w-5 h-5" />
              </div>
              <h1 className="font-playfair font-bold text-title-lg text-ds-secondary group-hover:text-ds-primary transition-colors">
                Advanced AI Consultation Workspace
              </h1>
            </div>

            <p className="text-body-sm text-ds-on-surface-variant leading-relaxed pl-9">
              Ask precise questions about career, health, timing, or relationships. Powered by KP gatekeeper ground-truth and Google Search Grounding.
            </p>
          </div>

          <Button 
            variant="primary" 
            className="shrink-0 self-end sm:self-center !text-white dark:!text-black"
            onClick={(e) => { e.stopPropagation(); onNavigatePage('ai-consultation'); }}
          >
            Start AI Query
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* CORE SERVICES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-label-caps text-ds-secondary flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-ds-primary" />
            <span>Core Services</span>
          </h3>


        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Birth Chart Report */}
          <Card
            hoverable
            onClick={onCreateNewProfile}
            className="flex flex-col justify-between h-full cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-ds-lg bg-ds-primary/10 text-ds-primary group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h4 className="font-playfair font-bold text-title-lg text-ds-secondary group-hover:text-ds-primary transition-colors">
                  Birth Chart Report
                </h4>
                <p className="text-body-sm text-ds-on-surface-variant mt-1 leading-relaxed">
                  Deep planetary positions, Avakhada, Shadbala, KP house cusps, and Vimshottari timeline.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-ds-secondary/10 flex items-center justify-between text-body-sm font-semibold text-ds-primary">
              <span>View Report</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Card 2: Marriage Compatibility */}
          <Card
            hoverable
            onClick={() => onNavigatePage('marriage-match')}
            className="flex flex-col justify-between h-full cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-ds-lg bg-pink-500/10 text-pink-500 group-hover:scale-105 transition-transform">
                  <Heart className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h4 className="font-playfair font-bold text-title-lg text-ds-secondary group-hover:text-pink-500 transition-colors">
                  Marriage Compatibility
                </h4>
                <p className="text-body-sm text-ds-on-surface-variant mt-1 leading-relaxed">
                  Precision Ashta Kuta scoring (36 points), Manglik Dosha analysis, and sticky verdict banner.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-ds-secondary/10 flex items-center justify-between text-body-sm font-semibold text-pink-500">
              <span>Check Match</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </div>
      </div>

      {/* SECTION 4: RECENT CHARTS */}
      {savedProfiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-label-caps text-ds-secondary flex items-center gap-1.5">
              <Star className="w-4 h-4 text-ds-tertiary" />
              <span>Recent Saved Charts ({savedProfiles.length})</span>
            </h3>

            <Button
              variant="tertiary"
              size="sm"
              onClick={() => onNavigatePage('profile')}
              className="text-ds-primary"
            >
              See all
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {/* Horizontal Scroll Cards List */}
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {savedProfiles.slice(0, 5).map((p) => {
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectActiveProfile(p);
                    onNavigatePage('birth-chart');
                  }}
                  className="min-w-[180px] max-w-[200px] p-3 rounded-ds-xl border transition-all cursor-pointer shrink-0 bg-ds-surface border-ds-secondary/15 hover:border-ds-primary/40 hover:shadow-ds-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-ds-lg flex items-center justify-center font-bold text-title-lg shrink-0 bg-ds-secondary/10 text-ds-secondary">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-body-sm font-bold text-ds-secondary truncate">{p.name}</p>
                      <p className="text-body-sm text-ds-on-surface-variant truncate">{p.date}</p>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-ds-secondary/10 flex items-center justify-between text-body-sm text-ds-on-surface-variant">
                    <span className="truncate">{p.place}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: TODAY'S PANCHANGAM */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-label-caps text-ds-secondary flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-ds-primary" />
            <span>Today's Panchangam</span>
          </h3>
        </div>

        {/* Panchangam Widget */}
        <TodayPanchangamWidget
          loading={todayPanchangamLoading}
          error={todayPanchangamError}
          data={todayPanchangam}
          language={language}
        />
      </div>
    </div>
  );
};
