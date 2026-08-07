import React from 'react';
import { User, PlusCircle } from 'lucide-react';
import { SavedPerson } from '../../types/marriageMatch';

interface RVAHeaderProps {
  activeProfile: SavedPerson | null;
  chartDetails: {
    name: string;
    gender: string;
    date: string;
  };
  onEnterDetails: () => void;
  showBirthForm: boolean;
  profiles: SavedPerson[];
  onProfileSelect: (profile: SavedPerson) => void;
}

export const RVAHeader: React.FC<RVAHeaderProps> = ({ 
    activeProfile, 
    chartDetails, 
    onEnterDetails, 
    showBirthForm,
    profiles,
    onProfileSelect
}) => {
  return (
    <div className="bg-white border border-[#2C3E50]/10 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[#E67E22] text-xl font-bold">⚡</span>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-[#2C3E50]">
            KP ASTROLOGY PREDICTION ENGINE
          </h1>
        </div>
        {(activeProfile || chartDetails) && (
          <p className="text-xs text-[#564337] mt-1 font-medium">
            Krishnamurti Paddhati Analysis for <strong className="text-[#E67E22]">{activeProfile?.name || chartDetails?.name}</strong> ({activeProfile?.date || chartDetails?.date})
          </p>
        )}
      </div>

      <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Enter Birth Details Button */}
        <button
          onClick={onEnterDetails}
          className="bg-[#E67E22] hover:bg-[#d67118] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          {showBirthForm ? 'Close Form' : '➕ Enter Birth Details'}
        </button>

        {/* Saved Profiles Dropdown */}
        <div className="flex items-center gap-2 bg-[#FDFBF7] border border-[#2C3E50]/15 rounded-xl px-3 py-1.5 shadow-2xs">
          <User className="w-4 h-4 text-[#E67E22] shrink-0" />
          <select
            value={activeProfile?.id || ''}
            onChange={(e) => {
              const found = profiles.find((p) => p.id === e.target.value);
              if (found) onProfileSelect(found);
            }}
            className="bg-transparent text-xs sm:text-sm text-[#2C3E50] focus:outline-none cursor-pointer min-w-[180px] font-semibold"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id} className="bg-white">
                {p.name} ({p.gender}, {p.date}) {p.id === 'satyam-family-10' ? '⭐ DEFAULT' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
