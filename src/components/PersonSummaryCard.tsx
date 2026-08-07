import React from 'react';
import { Calendar, Clock, MapPin, User, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PersonSummaryCardProps {
  person: {
    name: string;
    date: string;
    time: string;
    place: string;
    rasi: string;
    nakshatra: string;
    lagna: string;
  };
  manglikDoshaPresent: boolean | any;
  cardTitle: string;
  borderColor: 'blue' | 'purple';
}

const PersonSummaryCard: React.FC<PersonSummaryCardProps> = ({
  person,
  manglikDoshaPresent,
  cardTitle,
  borderColor,
}) => {
  const isMale = borderColor === 'blue';

  const themeClasses = isMale
    ? {
        border: 'border-blue-500/30 hover:border-blue-500/50',
        titleBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        accentText: 'text-blue-400',
        iconBg: 'bg-blue-500/10 text-blue-400'
      }
    : {
        border: 'border-pink-500/30 hover:border-pink-500/50',
        titleBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        badgeBg: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
        accentText: 'text-pink-400',
        iconBg: 'bg-pink-500/10 text-pink-400'
      };

  // Format date DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  // Parse Manglik status
  let manglikStatus = 'NOT PRESENT';
  let manglikBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (typeof manglikDoshaPresent === 'object' && manglikDoshaPresent !== null) {
    const statusStr = (manglikDoshaPresent.status || '').toUpperCase();
    if (statusStr === 'PRESENT' || manglikDoshaPresent.present) {
      manglikStatus = 'PRESENT';
      manglikBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    } else if (statusStr === 'CANCELLED' || manglikDoshaPresent.cancelled) {
      manglikStatus = 'CANCELLED (SAFE)';
      manglikBadgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  } else if (manglikDoshaPresent) {
    manglikStatus = 'PRESENT';
    manglikBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  }

  return (
    <div className={`bg-ds-surface rounded-ds-xl border ${themeClasses.border} p-5 sm:p-6 shadow-ds-lg transition-all flex flex-col justify-between`}>
      <div>
        {/* Header Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-ds-outline mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-ds-xl ${themeClasses.iconBg}`}>
              <User className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${themeClasses.titleBg}`}>
                {cardTitle}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold text-ds-on-surface mt-1">
                {person.name || 'Name Unspecified'}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-ds-on-surface-variant uppercase font-mono block">Manglik Status</span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border mt-0.5 ${manglikBadgeClass}`}>
              {manglikStatus === 'PRESENT' ? (
                <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
              )}
              {manglikStatus}
            </span>
          </div>
        </div>

        {/* Key Astrological Placements Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4 bg-ds-surface-variant/40 p-3 rounded-ds-xl border border-ds-outline">
          <div className="text-center">
            <div className="text-[10px] text-ds-on-surface-variant uppercase font-mono flex items-center justify-center gap-0.5">
              <span>Rasi</span>
            </div>
            <span className="text-xs font-bold text-ds-on-surface block truncate mt-0.5" title={person.rasi}>
              {person.rasi || 'N/A'}
            </span>
          </div>

          <div className="text-center border-x border-ds-outline px-1">
            <div className="text-[10px] text-ds-on-surface-variant uppercase font-mono flex items-center justify-center gap-0.5">
              <span>Nakshatra</span>
            </div>
            <span className="text-xs font-bold text-ds-primary block truncate mt-0.5" title={person.nakshatra}>
              {person.nakshatra || 'N/A'}
            </span>
          </div>

          <div className="text-center">
            <div className="text-[10px] text-ds-on-surface-variant uppercase font-mono flex items-center justify-center gap-0.5">
              <span>Lagna</span>
            </div>
            <span className="text-xs font-bold text-ds-on-surface block truncate mt-0.5" title={person.lagna}>
              {person.lagna || 'N/A'}
            </span>
          </div>
        </div>

        {/* Birth Specifications List */}
        <dl className="space-y-2 text-xs font-sans text-ds-on-surface">
          <div className="flex items-center justify-between py-1 border-b border-ds-outline">
            <dt className="text-ds-on-surface-variant flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-ds-primary/80" aria-hidden="true" /> Birth Date:
            </dt>
            <dd className="font-mono text-ds-on-surface font-semibold">{formatDate(person.date)}</dd>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-ds-outline">
            <dt className="text-ds-on-surface-variant flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-ds-primary/80" aria-hidden="true" /> Birth Time:
            </dt>
            <dd className="font-mono text-ds-on-surface font-semibold">{person.time}</dd>
          </div>

          <div className="flex items-center justify-between py-1">
            <dt className="text-ds-on-surface-variant flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-ds-primary/80" aria-hidden="true" /> Birth Place:
            </dt>
            <dd className="text-ds-on-surface font-medium text-right truncate max-w-[160px]" title={person.place}>
              {person.place}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default PersonSummaryCard;
