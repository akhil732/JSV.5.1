import React from 'react';
import { BirthDetails } from '../types';
import { RASI_TRANSLATIONS, getNakshatraTranslation } from './DivisionalChart';
import { SaveToDriveButton } from './SaveToDriveButton';
import { calculateActiveDasha } from '../lib/engines/DashaEngine';

interface ReportHeaderProps {
  birthDetails: BirthDetails;
  onBack: () => void;
  onAdjust: () => void;
  language: 'en' | 'hi' | 'te';
  horoscopeData?: any;
  onReportSaved?: () => void;
}

const headerLabels = {
  en: {
    back: "← Back",
    adjust: "Adjust Birth Details",
    live: "LIVE",
    janmaRasi: "Janma Rasi",
    nakshatra: "Nakshatram",
    pada: "Pada",
    ascendant: "Ascendant",
    activeDasha: "Active Dasha"
  },
  hi: {
    back: "← पीछे जाएं",
    adjust: "जन्म विवरण समायोजित करें",
    live: "सक्रिय",
    janmaRasi: "जन्म राशि",
    nakshatra: "नक्षत्र",
    pada: "चरण",
    ascendant: "लग्न",
    activeDasha: "सक्रिय दशा"
  },
  te: {
    back: "← వెనుకకు",
    adjust: "జనన వివరాలను మార్చండి",
    live: "ప్రత్యక్ష ప్రసారం",
    janmaRasi: "జన్మ రాశి",
    nakshatra: "నక్షత్రం",
    pada: "పాదం",
    ascendant: "లగ్నం",
    activeDasha: "ప్రస్తుత దశ"
  }
};

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  birthDetails,
  onBack,
  onAdjust,
  language,
  horoscopeData,
  onReportSaved
}) => {
  const l = headerLabels[language] || headerLabels.en;

  // Astrological computations for Row 2
  const raasiEnglish = horoscopeData?.horoscope?.divisional_charts?.['D-1_rasi']?.Moon?.sign || "";
  const raasiDetails = RASI_TRANSLATIONS[raasiEnglish];
  const rasiLabelValue = raasiDetails
    ? `${language === 'te' ? raasiDetails.te : language === 'hi' ? raasiDetails.hi : raasiDetails.en} (${raasiDetails.sanskrit})`
    : raasiEnglish || "N/A";

  const moonPadaObj = horoscopeData?.horoscope?.nakshatra_pada?.Moon;
  const nakName = moonPadaObj?.nakshatra || "";
  const pada = moonPadaObj?.pada || "";
  const nakTranslations = getNakshatraTranslation(nakName, language);
  const nakTranslatedName = language === 'te' ? nakTranslations.te : language === 'hi' ? nakTranslations.hi : nakTranslations.en;
  const nakshatramLabelValue = nakTranslatedName
    ? `${nakTranslatedName}${pada ? ` - ${l.pada} ${pada}` : ""}`
    : "N/A";

  const ascRaw = horoscopeData?.horoscope?.divisional_charts?.['D-1_rasi']?.Ascendant?.sign || "";
  const ascDetails = RASI_TRANSLATIONS[ascRaw];
  const ascLabelValue = ascDetails
    ? `${language === 'te' ? ascDetails.te : language === 'hi' ? ascDetails.hi : ascDetails.en} (${ascDetails.sanskrit})`
    : ascRaw || "N/A";

  const activeDashaObj = horoscopeData ? calculateActiveDasha(horoscopeData, birthDetails.date) : null;
  const activeDashaText = activeDashaObj
    ? `${activeDashaObj.mahadasha.lord} - ${activeDashaObj.antardasha.lord}${
        activeDashaObj.pratyantardasha ? ` - ${activeDashaObj.pratyantardasha.lord}` : ''
      }`
    : "N/A";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
      <div className="flex items-center gap-5 w-full md:w-auto">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F5A623] to-[#8FA8FF] flex items-center justify-center text-2xl shadow-lg shadow-[#F5A623]/20 shrink-0 animate-pulse">
          <span className="text-white opacity-90">🕉</span>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-serif tracking-tight text-[#F5F5F7] font-bold">
              {birthDetails.name}
            </h1>
            <span className="bg-[#34D399]/10 text-[#34D399] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#34D399]/30 tracking-wider uppercase">
              {birthDetails.gender} • {l.live}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 mt-1 text-[#9CA3AF] text-xs">
            <span className="flex items-center gap-1">📅 {birthDetails.date}</span>
            <span className="flex items-center gap-1">🕐 {birthDetails.time} {birthDetails.approximateTime ? '(Approx)' : ''}</span>
            <span className="flex items-center gap-1">📍 {birthDetails.place}</span>
          </div>
          <div className="text-[10px] text-[#8FA8FF] font-mono mt-1">
            Lat: {birthDetails.latitude.toFixed(4)}°N, Lon: {birthDetails.longitude.toFixed(4)}°E | Timezone: UTC+{birthDetails.timezone}
          </div>

          {/* Row 2: Astrological Summary Details */}
          {horoscopeData && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-[#1E2433] text-xs">
              <div className="flex items-center gap-1.5 bg-[#0A0E17]/40 px-3 py-1.5 rounded-xl border border-[#1E2433]">
                <span className="text-[#9CA3AF]">{l.ascendant}:</span>
                <span className="text-[#F5A623] font-semibold">{ascLabelValue}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#0A0E17]/40 px-3 py-1.5 rounded-xl border border-[#1E2433]">
                <span className="text-[#9CA3AF]">{l.janmaRasi}:</span>
                <span className="text-[#F5A623] font-semibold">{rasiLabelValue}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#0A0E17]/40 px-3 py-1.5 rounded-xl border border-[#1E2433]">
                <span className="text-[#9CA3AF]">{l.nakshatra}:</span>
                <span className="text-[#F5A623] font-semibold">{nakshatramLabelValue}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#0A0E17]/40 px-3 py-1.5 rounded-xl border border-[#1E2433]">
                <span className="text-[#9CA3AF]">{l.activeDasha}:</span>
                <span className="text-[#F5A623] font-semibold">{activeDashaText}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Interactive Navigation Control Group */}
      <div className="flex flex-wrap items-center gap-3 self-start md:self-auto shrink-0 w-full md:w-auto justify-end">
        <button
          onClick={onBack}
          className="flex-1 md:flex-none text-center bg-[#10141F] hover:bg-[#1A2234] border border-[#1E2433] hover:border-[#9CA3AF]/30 text-[#9CA3AF] hover:text-[#F5F5F7] text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer font-mono"
        >
          {l.back}
        </button>
        <button
          onClick={onAdjust}
          className="flex-1 md:flex-none text-center bg-[#1E2433] hover:bg-[#252E42] border border-[#1E2433] hover:border-[#F5A623]/50 text-[#F5A623] text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          ↻ {l.adjust}
        </button>
        {horoscopeData && (
          <SaveToDriveButton
            birthDetails={birthDetails}
            horoscopeData={horoscopeData}
            language={language}
            onReportSaved={onReportSaved}
          />
        )}
      </div>
    </div>
  );
};
