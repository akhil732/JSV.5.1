import React, { useState } from 'react';
import { RulingPlanets } from '../../types/kp';
import { calculateRulingPlanets } from '../../lib/kp/rulingPlanetsCalculator';
import { RefreshCw, Clock, Compass, Calendar, Sparkles } from 'lucide-react';

interface RulingPlanetsWidgetProps {
  rulingPlanets: RulingPlanets;
  latitude?: number;
  longitude?: number;
}

export const RulingPlanetsWidget: React.FC<RulingPlanetsWidgetProps> = ({
  rulingPlanets: initialRP,
  latitude,
  longitude
}) => {
  const [rp, setRp] = useState<RulingPlanets>(initialRP);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [queryDate, setQueryDate] = useState<string>('');
  const [queryTime, setQueryTime] = useState<string>('');
  const [useCustomMoment, setUseCustomMoment] = useState(false);

  const handleRefresh = (overrideDateStr?: string, overrideTimeStr?: string) => {
    setIsRefreshing(true);
    setTimeout(() => {
      const dStr = overrideDateStr !== undefined ? overrideDateStr : queryDate;
      const tStr = overrideTimeStr !== undefined ? overrideTimeStr : queryTime;
      const updated = calculateRulingPlanets(dStr || undefined, tStr || undefined, latitude, longitude);
      setRp(updated);
      setIsRefreshing(false);
    }, 400);
  };

  const handleApplyCustomMoment = () => {
    if (queryDate && queryTime) {
      handleRefresh(queryDate, queryTime);
      setUseCustomMoment(true);
    }
  };

  const handleResetToNow = () => {
    setQueryDate('');
    setQueryTime('');
    setUseCustomMoment(false);
    handleRefresh('', '');
  };

  return (
    <div className="bg-ds-surface border border-ds-secondary/15 rounded-2xl p-4 sm:p-6 shadow-ds-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ds-secondary/15 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-ds-secondary flex items-center gap-2">
            <span className="text-ds-primary">⚡</span> Real-Time Ruling Planets (RP) & Query Moment Calculator
          </h3>
          <p className="text-xs text-ds-on-surface-variant mt-0.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-ds-primary" />
            {useCustomMoment ? `Custom Query Moment RP (${rp.timestamp})` : `Live Query Moment RP (Refreshed at: ${rp.timestamp})`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {useCustomMoment && (
            <button
              onClick={handleResetToNow}
              className="px-3 py-1.5 rounded-xl bg-ds-surface-container text-ds-on-surface-variant hover:text-ds-secondary text-xs font-semibold transition-all cursor-pointer"
            >
              Reset to Now
            </button>
          )}
          <button
            onClick={() => handleRefresh()}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ds-primary/10 hover:bg-ds-primary/20 border border-ds-primary/30 text-ds-primary text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh RP
          </button>
        </div>
      </div>

      {/* Moment Selector */}
      <div className="bg-ds-surface-container border border-ds-secondary/15 rounded-xl p-3.5 space-y-2">
        <span className="text-xs font-bold text-ds-primary uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Test Historical or Future Query Moment
        </span>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <input
            type="date"
            value={queryDate}
            onChange={(e) => setQueryDate(e.target.value)}
            className="bg-ds-surface border border-ds-secondary/15 rounded-lg px-3 py-1.5 text-xs text-ds-secondary focus:border-ds-primary focus:outline-none"
          />
          <input
            type="time"
            value={queryTime}
            onChange={(e) => setQueryTime(e.target.value)}
            className="bg-ds-surface border border-ds-secondary/15 rounded-lg px-3 py-1.5 text-xs text-ds-secondary focus:border-ds-primary focus:outline-none"
          />
          <button
            onClick={handleApplyCustomMoment}
            disabled={!queryDate || !queryTime}
            className="px-4 py-1.5 rounded-lg bg-ds-primary/20 hover:bg-ds-primary/30 text-ds-primary text-xs font-bold border border-ds-primary/40 disabled:opacity-50 transition-all cursor-pointer"
          >
            Evaluate Custom Moment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lagna RP Card */}
        <div className="bg-ds-surface-container border border-ds-secondary/15 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-ds-secondary/15 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ds-primary flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> RP Lagna ({rp.lagnaSign})
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-ds-on-surface-variant">
              <span>Sign Lord:</span>
              <span className="font-semibold text-ds-secondary">{rp.lagnaSignLord}</span>
            </div>
            <div className="flex justify-between text-ds-on-surface-variant">
              <span>Star Lord:</span>
              <span className="font-semibold text-ds-secondary">{rp.lagnaStarLord}</span>
            </div>
            <div className="flex justify-between text-ds-on-surface-variant">
              <span>Sub Lord:</span>
              <span className="font-bold text-ds-primary">{rp.lagnaSubLord}</span>
            </div>
            <div className="flex justify-between text-ds-on-surface-variant">
              <span>Sub-Sub Lord:</span>
              <span className="font-semibold text-ds-secondary">{rp.lagnaSubSubLord}</span>
            </div>
          </div>
        </div>

        {/* Moon RP Card */}
        <div className="bg-ds-surface-container border border-ds-secondary/15 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-ds-secondary/15 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-500 dark:text-sky-400 flex items-center gap-1.5">
              🌙 RP Moon ({rp.moonSign})
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-ds-on-surface-variant">
              <span>Sign Lord:</span>
              <span className="font-semibold text-ds-secondary">{rp.moonSignLord}</span>
            </div>
            <div className="flex justify-between text-ds-on-surface-variant">
              <span>Star Lord:</span>
              <span className="font-semibold text-ds-secondary">{rp.moonStarLord}</span>
            </div>
            <div className="flex justify-between text-ds-on-surface-variant">
              <span>Sub Lord:</span>
              <span className="font-bold text-ds-primary">{rp.moonSubLord}</span>
            </div>
            <div className="flex justify-between text-ds-on-surface-variant">
              <span>Sub-Sub Lord:</span>
              <span className="font-semibold text-ds-secondary">{rp.moonSubSubLord}</span>
            </div>
          </div>
        </div>

        {/* Day Lord Card */}
        <div className="bg-ds-surface-container border border-ds-secondary/15 rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-ds-secondary/15 pb-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
                ☀️ Day Lord
              </span>
            </div>
            <div className="text-2xl font-serif font-bold text-ds-primary pt-1">
              {rp.dayLord}
            </div>
          </div>
          <p className="text-[11px] text-ds-on-surface-variant">
            Day lord reinforces timing confirmation when ruling planet matches active sub lord.
          </p>
        </div>
      </div>

      {/* Ruling Planet Analysis Note */}
      <div className="bg-ds-surface-container border border-ds-secondary/15 rounded-xl p-3.5 text-xs space-y-1 text-ds-on-surface-variant">
        <span className="font-bold text-ds-primary flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> RP Alignment Commentary
        </span>
        <p>
          Current query moment is strongly ruled by <strong>{rp.lagnaSubLord}</strong> (Lagna Sub) and <strong>{rp.moonStarLord}</strong> (Moon Star). When these planets match the active Dasha Bhukti lord, timing confirmation reaches maximum reliability per KP Reader V.
        </p>
      </div>
    </div>
  );
};
