import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Languages,
  Settings,
  Share2,
  Edit2,
  RotateCcw,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { PANCHANGA_DATA } from './rvaData';
import { SavedPerson } from '../../types/marriageMatch';

interface RVAInputPanchangaBarProps {
  activeProfile?: SavedPerson | null;
  onUpdateDetails?: (data: { name: string; date: string; time: string; location: string; lat: string; long: string; tz: string; }) => void;
  isTransitLoading?: boolean;
  onFetchTransit?: (targetDate: Date) => void;
}

export const RVAInputPanchangaBar: React.FC<RVAInputPanchangaBarProps> = ({
  activeProfile,
  onUpdateDetails,
  isTransitLoading,
  onFetchTransit,
}) => {
  const [name, setName] = useState('Test Chart');
  const [date, setDate] = useState('04-08-2026');
  const [time, setTime] = useState('15:53:40');
  const [location, setLocation] = useState('Hyderabad, Telangana, India');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (activeProfile) {
      setName(activeProfile.name || 'Test Chart');
      if (activeProfile.date) setDate(activeProfile.date);
      if (activeProfile.time) setTime(activeProfile.time);
      if (activeProfile.place) setLocation(activeProfile.place);
    }
  }, [activeProfile]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitted(true);
    if (onUpdateDetails) {
      onUpdateDetails({
        name,
        date,
        time,
        location,
        lat: activeProfile?.latitude ? String(activeProfile.latitude) : '17.385',
        long: activeProfile?.longitude ? String(activeProfile.longitude) : '78.4867',
        tz: activeProfile?.timezone ? String(activeProfile.timezone) : '5.5',
      });
    }
    setTimeout(() => setIsSubmitted(false), 2000);
  };

  const handleReset = () => {
    if (activeProfile) {
      setName(activeProfile.name);
      setDate(activeProfile.date);
      setTime(activeProfile.time);
      setLocation(activeProfile.place);
    } else {
      setName('Test Chart');
      setDate('04-08-2026');
      setTime('15:53:40');
      setLocation('Hyderabad, Telangana, India');
    }
  };

  return (
    <div className="bg-ds-surface border-b border-ds-secondary/15 px-4 sm:px-6 py-3 space-y-3 shadow-2xs">
      {/* Top Input Form Controls */}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2.5">
        {/* Name Input */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-ds-on-surface-variant uppercase tracking-wider mb-0.5">
            Subject Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name..."
            className="px-3 py-1.5 text-xs font-serif font-bold text-ds-secondary border border-ds-secondary/20 rounded-xl bg-ds-surface-container/70 focus:outline-none focus:ring-2 focus:ring-ds-primary/40 w-32 md:w-40 transition-all"
          />
        </div>

        {/* Date Input */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-ds-on-surface-variant uppercase tracking-wider mb-0.5">
            Date (DD-MM-YYYY)
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-xs font-mono font-medium text-ds-on-surface border border-ds-secondary/20 rounded-xl bg-ds-surface-container/70 focus:outline-none focus:ring-2 focus:ring-ds-primary/40 w-32 md:w-36 transition-all"
            />
            <Calendar className="w-3.5 h-3.5 text-ds-primary absolute right-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Time Input */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-ds-on-surface-variant uppercase tracking-wider mb-0.5">
            Time (HH:MM:SS)
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-xs font-mono font-medium text-ds-on-surface border border-ds-secondary/20 rounded-xl bg-ds-surface-container/70 focus:outline-none focus:ring-2 focus:ring-ds-primary/40 w-28 md:w-32 transition-all"
            />
            <Clock className="w-3.5 h-3.5 text-ds-primary absolute right-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Location Input */}
        <div className="flex flex-col flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-ds-on-surface-variant uppercase tracking-wider mb-0.5">
            Location / Coordinates
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-xs pointer-events-none">🇮🇳</span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-8 pr-7 py-1.5 text-xs font-medium text-ds-on-surface border border-ds-secondary/20 rounded-xl bg-ds-surface-container/70 focus:outline-none focus:ring-2 focus:ring-ds-primary/40 w-full transition-all"
            />
            {location && (
              <button
                type="button"
                onClick={() => setLocation('')}
                className="absolute right-2 text-ds-on-surface-variant hover:text-ds-primary transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Icon Buttons */}
        <div className="flex items-center gap-1 self-end pb-0.5">
          <button
            type="button"
            title="Reset to default"
            onClick={handleReset}
            className="p-2 text-ds-on-surface-variant hover:text-ds-secondary hover:bg-ds-surface-container border border-ds-secondary/15 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Submit Primary Button */}
        <button
          type="submit"
          className={`self-end px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
            isSubmitted
              ? 'bg-ds-success-green text-white'
              : 'sacred-gradient text-white hover:opacity-95'
          }`}
        >
          {isSubmitted ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Calculated!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recalculate RVA</span>
            </>
          )}
        </button>
      </form>

      {/* Panchanga Metadata Pills Row */}
      <div className="flex items-center gap-2 pt-2 border-t border-ds-secondary/10 overflow-x-auto no-scrollbar text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ds-primary shrink-0 mr-1">
          Panchangam:
        </span>
        {PANCHANGA_DATA.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center space-x-1.5 px-3 py-1 bg-ds-surface-container/80 border border-ds-secondary/15 rounded-full whitespace-nowrap text-ds-secondary font-medium hover:bg-ds-surface-container transition-all"
          >
            <span className="text-xs">{item.icon}</span>
            <span className="text-[11px]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
