import React, { useState, useEffect } from 'react';
import { 
  FileText, Edit3, Compass, LayoutGrid, Shield, Sparkles, Clock, Calendar, 
  ChevronDown, ChevronUp, Layers, CheckCircle2, AlertTriangle, ArrowRight, Printer, PlusCircle, User, UserCheck
} from 'lucide-react';
// Horoscope type passed as generic object
import { SavedPerson } from '../types/marriageMatch';
import { ChartStyle } from '../types/marriageMatch';
import { DivisionalChart } from '../components/DivisionalChart';
import { PlanetTable } from '../components/PlanetTable';
import { CombinedStrengthView } from '../components/CombinedStrengthView';
import { YogasView } from '../components/YogasView';
import { DoshasView } from '../components/DoshasView';
import { PlanetSignificatorsTable } from '../components/KP/PlanetSignificatorsTable';
import { VimshottariDashaView } from '../components/VimshottariDashaView';
import { PanchangamView } from '../components/PanchangamView';
import { calculateActiveDasha } from '../lib/engines/DashaEngine';
import { useKPChart } from '../hooks/useKPChart';
import { DomainPredictionsView } from '../components/KP/DomainPredictionsView';
import { KPAnalysisPage } from '../components/KP/KPAnalysisPage';
import { RVATripleCharts } from '../components/KP/RVATripleCharts';
import { Button } from '../components/design-system/Button';
import { Card } from '../components/design-system/Card';
import { SaveToDriveButton } from '../components/SaveToDriveButton';
import { addSavedPerson } from '../lib/savedPersons';
import { BirthDetails } from '../types';
import { ProfileStorageService } from '../lib/profileStorageService';
import { BirthForm } from '../components/BirthForm';

interface BirthChartPageProps {
  horoscopeReport: any | null;
  activeProfile: SavedPerson | null;
  onEditProfile: () => void;
  language: 'en' | 'hi' | 'te';
  reportLoading?: boolean;
  onSelectProfile: (profile: SavedPerson) => void;
}

// ============================================================================
// SIGN LORDS MAPPING (which planet rules which zodiac sign)
// ============================================================================
export const SIGN_LORDS: Record<string, string> = {
  Aries: 'Mars', 
  Taurus: 'Venus', 
  Gemini: 'Mercury', 
  Cancer: 'Moon',
  Leo: 'Sun', 
  Virgo: 'Mercury', 
  Libra: 'Venus', 
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter', 
  Capricorn: 'Saturn', 
  Aquarius: 'Saturn', 
  Pisces: 'Jupiter'
};

// ============================================================================
// ZODIAC SIGNS ARRAY (indexed 0-11)
// Used to convert numeric indices to sign names
// ============================================================================
export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// ============================================================================
// HELPER: Format Remaining Time in Dasha Period
// ============================================================================
export const formatRemainingTime = (endDate: Date): string => {
  try {
    // Reference date (update to new Date() for real-time)
    const now = new Date();
    
    if (now >= endDate) {
      return 'Completed';
    }
    
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const remainingDaysAfterYears = diffDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30.4375);
    const days = Math.round(remainingDaysAfterYears % 30.4375);

    let text = "";
    if (years > 0) text += `${years}y `;
    if (months > 0) text += `${months}m `;
    if (days > 0 || text === "") text += `${days}d `;
    
    return `${text} remaining`;
  } catch (e) {
    return '—';
  }
};

// ============================================================================
// HELPER: Extract sign from horoscope data object
// ============================================================================
export const extractSignFromData = (obj: any, defaultIndex: number = 0): string => {
  if (!obj) return ZODIAC_SIGNS[defaultIndex % 12];
  
  if (obj.sign && typeof obj.sign === 'string') {
    return obj.sign;
  }
  
  if (typeof obj.sign === 'number') {
    return ZODIAC_SIGNS[obj.sign % 12];
  }
  
  if (typeof obj.longitude === 'number') {
    const signIndex = Math.floor(obj.longitude / 30) % 12;
    return ZODIAC_SIGNS[signIndex];
  }
  
  return ZODIAC_SIGNS[defaultIndex % 12];
};

export const BirthChartPage: React.FC<BirthChartPageProps> = ({
  horoscopeReport,
  activeProfile,
  onEditProfile,
  language,
  reportLoading,
  onSelectProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'kp-technical'>('overview');

  const [chartStyle, setChartStyle] = useState<'south-indian' | 'north-indian'>('south-indian');
  const [isSignificatorsOpen, setIsSignificatorsOpen] = useState<boolean>(false);
  const [isHouseMatrixOpen, setIsHouseMatrixOpen] = useState<boolean>(false);
  const [profiles, setProfiles] = useState<SavedPerson[]>([]);
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = ProfileStorageService.subscribe((loaded) => {
      setProfiles(loaded);
    });
    return () => unsubscribe();
  }, []);

  const handleBirthFormSubmit = async (details: BirthDetails) => {
    setLoading(true);
    setFormError(null);
    try {
      const newPersonInput = {
        name: details.name,
        gender: details.gender,
        date: details.date,
        time: details.time,
        place: details.place,
        latitude: details.latitude,
        longitude: details.longitude,
        timezone: details.timezone
      };

      const savedPerson = await ProfileStorageService.saveProfile(newPersonInput);
      onSelectProfile(savedPerson);
      setShowBirthForm(false);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setFormError('Failed to save profile: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Safe fallback values from report or profile
  const name = activeProfile?.name || horoscopeReport?.birthData?.name || 'Native';
  const date = activeProfile?.date || horoscopeReport?.birthData?.date || '1996-11-11';
  const time = activeProfile?.time || horoscopeReport?.birthData?.time || '13:50:00';
  const place = activeProfile?.place || horoscopeReport?.birthData?.place || 'Jaggampeta';

  const birthDetails = activeProfile ? {
    name: activeProfile.name,
    gender: (activeProfile.gender === 'Female' ? 'Female' : 'Male') as ('Male' | 'Female'),
    date: activeProfile.date,
    time: activeProfile.time,
    approximateTime: false,
    place: activeProfile.place,
    latitude: activeProfile.latitude,
    longitude: activeProfile.longitude,
    timezone: activeProfile.timezone
  } : horoscopeReport?.birthData ? {
    name: horoscopeReport.birthData.name || 'Native',
    gender: (horoscopeReport.birthData.gender === 'Female' ? 'Female' : 'Male') as ('Male' | 'Female'),
    date: horoscopeReport.birthData.date || '1996-11-11',
    time: horoscopeReport.birthData.time || '13:50:00',
    approximateTime: false,
    place: horoscopeReport.birthData.place || 'Jaggampeta',
    latitude: horoscopeReport.birthData.latitude || 17.17,
    longitude: horoscopeReport.birthData.longitude || 82.06,
    timezone: horoscopeReport.birthData.timezone || 5.5
  } : undefined;

  const personObj = birthDetails || {
    name,
    gender: 'Male',
    date,
    time,
    place,
    latitude: 17.17,
    longitude: 82.06,
    timezone: 5.5,
    approximateTime: false
  };
  const kpChart = useKPChart(personObj, horoscopeReport);

  if (reportLoading) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <div className="animate-spin w-16 h-16 rounded-2xl bg-deep-saffron/10 text-deep-saffron flex items-center justify-center mx-auto text-2xl font-bold">
          🕉
        </div>
        <h2 className="font-playfair font-bold text-xl text-royal-navy">Generating Birth Chart...</h2>
        <p className="text-body-sm text-on-surface-variant">
          Please wait while we prepare the astrological data.
        </p>
      </div>
    );
  }

  if (!horoscopeReport && !activeProfile) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-deep-saffron/10 text-deep-saffron flex items-center justify-center mx-auto text-2xl font-bold">
          🕉
        </div>
        <h2 className="font-playfair font-bold text-xl text-royal-navy">No Active Chart Selected</h2>
        <p className="text-body-sm text-on-surface-variant">
          Please select or create a profile on the Home or Profile page to generate the Birth Chart Report.
        </p>
      </div>
    );
  }

  // Avakhada values
  const avakhada = horoscopeReport?.avakhadaChakra || {
    Varna: 'Kshatriya',
    Yoni: 'Gaja (Elephant)',
    Gana: 'Deva',
    Nadi: 'Madhya',
    SignLord: 'Jupiter',
    Charan: '2',
    Lagna: 'Mesha (Aries)',
    Rasi: 'Karka (Cancer)',
    Nakshatra: 'Punarvasu'
  };

  const currentDasha = horoscopeReport?.currentDasha || {
    mahadasha: 'Venus',
    antardasha: 'Sun',
    pratyantardasha: 'Venus',
    endDate: '2027-04-12'
  };

  const activeDasha = calculateActiveDasha(horoscopeReport, date, new Date());

  // ============================================================================
  // EXTRACT DIVISIONAL CHARTS AND CALENDAR INFO
  // ============================================================================
  const divCharts = horoscopeReport?.horoscope?.divisional_charts || 
                    horoscopeReport?.divisional_charts || 
                    {};
  const d1 = divCharts['D-1_rasi'] || 
             horoscopeReport?.rasi || 
             horoscopeReport?.horoscope?.d1 ||
             {};

  const cal = horoscopeReport?.horoscope?.calendar_info || 
              horoscopeReport?.calendar_info || 
              horoscopeReport?.panchangam ||
              {};

  // ============================================================================
  // EXTRACT LAGNA (ASCENDANT) SIGN AND ITS RULING PLANET
  // ============================================================================
  const lagnaObj = d1?.Ascendant || d1?.Lagna || {};
  const lagnaSign = lagnaObj.sign || 
                    extractSignFromData(lagnaObj) ||
                    'Unknown';
  const lagnaLord = lagnaSign !== 'Unknown' 
    ? (SIGN_LORDS[lagnaSign] || 'Unknown') 
    : 'Unknown';

  // ============================================================================
  // EXTRACT MOON SIGN (EMOTIONAL MIND & INNER NATURE)
  // ============================================================================
  const moonObj = d1?.Moon || {};
  const moonSign = moonObj.sign || 
                   extractSignFromData(moonObj) ||
                   (cal.Raasi ? cal.Raasi.split(' ')[0] : 'Unknown');

  // ============================================================================
  // EXTRACT SUN SIGN (SOUL PURPOSE & CORE IDENTITY)
  // ============================================================================
  const sunObj = d1?.Sun || {};
  const sunSign = sunObj.sign || 
                  extractSignFromData(sunObj) ||
                  'Unknown';

  // ============================================================================
  // EXTRACT MOON'S NAKSHATRA (CONSTELLATION/STAR)
  // ============================================================================
  const moonNakObj = horoscopeReport?.horoscope?.nakshatra_pada?.Moon || 
                     horoscopeReport?.nakshatra_pada?.Moon || 
                     {};
  const rawNakName = moonNakObj.nakshatra || 
                     moonNakObj.nakshatra_name || 
                     '';
  const pada = moonNakObj.pada;
  const nakshatraText = rawNakName
    ? `${rawNakName}${pada ? ` - Pada ${pada}` : ''}`
    : (cal.Nakshatram ? cal.Nakshatram.split('  ')[0].split(' ')[0] : 'Unknown');

  // ============================================================================
  // EXTRACT ACTIVE DASHA LORDS (CURRENT TIMING PERIOD)
  // ============================================================================
  const activeMd = activeDasha?.mahadasha?.lord || 'Unknown';
  const activeAd = activeDasha?.antardasha?.lord || 'Unknown';
  const activePd = activeDasha?.pratyantardasha?.lord || 'Unknown';

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-ds-background text-ds-on-background pb-20">
      {/* 1. STICKY APP CHROME TOOLBAR */}
      <div className="sticky top-0 z-30 bg-ds-surface-container/95 backdrop-blur-md border-b border-ds-secondary/15 py-2.5 px-4 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBirthForm(!showBirthForm)}
              className="bg-ds-primary hover:bg-ds-primary/90 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap min-h-[40px]"
            >
              <PlusCircle className="w-4 h-4" />
              {showBirthForm ? 'Close Form' : 'Enter Birth Details'}
            </button>

            <div className="flex items-center gap-2 bg-ds-surface border border-ds-secondary/15 rounded-xl px-3 py-1.5 shadow-2xs">
              <User className="w-4 h-4 text-ds-primary shrink-0" />
              <select
                value={activeProfile?.id || ''}
                onChange={(e) => {
                  const found = profiles.find((p) => p.id === e.target.value);
                  if (found) onSelectProfile(found);
                }}
                className="bg-transparent text-xs sm:text-sm text-ds-secondary focus:outline-none cursor-pointer min-w-[160px] font-semibold"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id} className="bg-ds-surface text-ds-secondary">
                    {p.name} ({p.gender}, {p.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => window.print()}
              title="Print Report"
            />
            <SaveToDriveButton
              birthDetails={personObj as BirthDetails}
              horoscopeData={horoscopeReport}
              language={language}
              onSaveLocally={() => {
                addSavedPerson({
                  name: name,
                  date: date,
                  time: time,
                  place: place,
                  latitude: personObj.latitude,
                  longitude: personObj.longitude,
                  timezone: personObj.timezone,
                  gender: (personObj.gender === 'Male' || personObj.gender === 'Female') ? personObj.gender : 'Male'
                });
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={onEditProfile}
              title="Edit Details"
            />
          </div>
        </div>
      </div>

      {/* 2. STICKY TOC CHIPS NAV */}
      <div className="sticky top-[53px] z-20 bg-ds-surface/95 backdrop-blur-md border-b border-ds-secondary/10 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs font-bold text-ds-secondary scrollbar-none shadow-2xs">
        <span className="text-ds-on-surface-variant font-mono text-[10px] uppercase tracking-wider shrink-0 pr-1">Jump to:</span>
        <button onClick={() => { setActiveTab('overview'); scrollToSection('overview-section'); }} className="px-3 py-1 bg-ds-surface-container hover:bg-ds-primary/10 rounded-full border border-ds-secondary/15 transition-all cursor-pointer whitespace-nowrap">
          🧭 Overview
        </button>
        <button onClick={() => { setActiveTab('overview'); scrollToSection('charts-section'); }} className="px-3 py-1 bg-ds-surface-container hover:bg-ds-primary/10 rounded-full border border-ds-secondary/15 transition-all cursor-pointer whitespace-nowrap">
          📐 Charts
        </button>
        <button onClick={() => { setActiveTab('analysis'); scrollToSection('strength-section'); }} className="px-3 py-1 bg-ds-surface-container hover:bg-ds-primary/10 rounded-full border border-ds-secondary/15 transition-all cursor-pointer whitespace-nowrap">
          ⭐ Planetary Strength
        </button>
        <button onClick={() => { setActiveTab('analysis'); scrollToSection('yogas-doshas'); }} className="px-3 py-1 bg-ds-surface-container hover:bg-ds-primary/10 rounded-full border border-ds-secondary/15 transition-all cursor-pointer whitespace-nowrap">
          ⚡ Yogas & Doshas
        </button>
        <button onClick={() => { setActiveTab('analysis'); scrollToSection('dasha-section'); }} className="px-3 py-1 bg-ds-surface-container hover:bg-ds-primary/10 rounded-full border border-ds-secondary/15 transition-all cursor-pointer whitespace-nowrap">
          ⏳ Dasha Timeline
        </button>
        <button onClick={() => { setActiveTab('kp-technical'); scrollToSection('kp-section'); }} className="px-3 py-1 bg-ds-surface-container hover:bg-ds-primary/10 rounded-full border border-ds-secondary/15 transition-all cursor-pointer whitespace-nowrap">
          🔮 KP Technical Engine
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-4 space-y-6">
        {/* Selected Native Summary Card */}
        <div className="bg-ds-surface border border-ds-secondary/15 rounded-xl p-3.5 px-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-ds-success-green animate-pulse" />
              <div>
                <span className="text-ds-on-surface-variant font-medium">Native:</span>{' '}
                <strong className="text-ds-secondary font-serif">{name}</strong>
              </div>
            </div>
            <div>
              <span className="text-ds-on-surface-variant font-medium">DOB & TOB:</span>{' '}
              <strong className="text-ds-secondary font-mono font-bold">{date} @ {time}</strong>
            </div>
            <div>
              <span className="text-ds-on-surface-variant font-medium">POB:</span>{' '}
              <strong className="text-ds-secondary font-semibold">{place}</strong>
            </div>
            <div className="flex items-center gap-2 bg-ds-primary/10 border border-ds-primary/30 px-3 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-ds-primary" />
              <span className="text-ds-on-surface-variant font-medium">Active Dasha:</span>{' '}
              <strong className="text-ds-primary font-bold">
                {activeMd} MD — {activeAd} AD ({activePd} PD)
              </strong>
            </div>
          </div>
        </div>

        {/* Birth Details Entry Modal */}
        {showBirthForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ds-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-ds-surface border border-ds-primary/30 rounded-2xl p-6 shadow-xl relative max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowBirthForm(false)}
                className="absolute top-4 right-4 text-ds-secondary hover:text-ds-primary"
              >
                Close
              </button>
              <h2 className="text-lg font-bold text-ds-secondary mb-4">Enter Birth Details</h2>
              <BirthForm
                onSubmit={handleBirthFormSubmit}
                loading={loading}
                error={formError}
              />
            </div>
          </div>
        )}

        {/* 3. TIERED TABS NAVIGATION */}
        <div className="flex border-b border-ds-secondary/15 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-ds-primary text-ds-primary bg-ds-primary/5 rounded-t-xl'
                : 'border-transparent text-ds-on-surface-variant hover:text-ds-secondary'
            }`}
          >
            🧭 1. Overview & Reading
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'analysis'
                ? 'border-ds-primary text-ds-primary bg-ds-primary/5 rounded-t-xl'
                : 'border-transparent text-ds-on-surface-variant hover:text-ds-secondary'
            }`}
          >
            ⭐ 2. Analysis & Timelines
          </button>
          <button
            onClick={() => setActiveTab('kp-technical')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'kp-technical'
                ? 'border-ds-primary text-ds-primary bg-ds-primary/5 rounded-t-xl'
                : 'border-transparent text-ds-on-surface-variant hover:text-ds-secondary'
            }`}
          >
            🔮 3. KP Technical Engine
          </button>
        </div>

        {/* 4. TAB CONTENT CONTAINER */}
        <div className="space-y-12 pb-16">
          {/* TAB 1: OVERVIEW & READING (Tier 1) */}
          {activeTab === 'overview' && (
            <div id="overview-section" className="space-y-6">
              <div className="border-b border-ds-secondary/20 pb-2">
                <h2 className="text-xl font-bold text-ds-secondary flex items-center gap-2">
                  <Compass className="w-5 h-5 text-ds-primary" />
                  <span>Overview & Natal Coordinates</span>
                </h2>
              </div>

              <div className="space-y-4">
                {/* Executive Vector Summary Card */}
                <Card className="space-y-3">
                  <h3 className="text-label-caps text-ds-secondary flex items-center gap-1.5 border-b border-ds-secondary/10 pb-2">
                    <Compass className="w-4 h-4 text-ds-primary" />
                    <span>Executive Vector Summary</span>
                  </h3>

                  <div className="text-body-sm leading-relaxed text-ds-on-surface-variant space-y-2">
                    <p>
                      You are born with a <strong className="text-ds-primary">{lagnaSign} Ascendant</strong> ruled by <strong className="text-ds-primary">{lagnaLord}</strong>, giving a resilient, structured life path. Your emotional mind is centered in <strong className="text-ds-primary">Moon in {moonSign}</strong> ({nakshatraText}), while your core identity and soul purpose align with <strong className="text-ds-primary">Sun in {sunSign}</strong>.
                    </p>
                    <p>
                      You are currently navigating the active period of <strong className="text-ds-primary">{activeMd} Mahadasha</strong> — specifically the <strong className="text-ds-primary">{activeAd} Antardasha</strong> and <strong className="text-ds-primary">{activePd} Pratyantardasha</strong>.
                    </p>
                  </div>
                </Card>

                {/* Current Dasha Progress Card */}
                <Card className="space-y-3">
                  <h3 className="text-label-caps text-ds-secondary flex items-center gap-1.5 border-b border-ds-secondary/10 pb-2">
                    <Clock className="w-4 h-4 text-ds-primary" />
                    <span>Current Vimshottari Life Phase</span>
                  </h3>

                  <div className="p-3 bg-ds-surface-container rounded-ds-xl border border-ds-primary/30 space-y-2">
                    <div className="flex items-center justify-between text-body-sm font-semibold">
                      <span className="text-ds-secondary">
                        {activeMd} Mahadasha → {activeAd} Antardasha {activePd !== 'Unknown' ? `→ ${activePd}` : ''}
                      </span>
                      <span className="text-ds-primary text-data-mono flex items-center gap-1.5">
                        <span className="bg-ds-primary/10 px-1.5 py-0.5 rounded font-bold">
                          {activeDasha?.antardasha?.endDate ? formatRemainingTime(new Date(activeDasha.antardasha.endDate)) : '—'}
                        </span>
                        <span>
                          (Ends {activeDasha?.antardasha?.endDate ? new Date(activeDasha.antardasha.endDate).toLocaleDateString() : '—'})
                        </span>
                      </span>
                    </div>

                    <div className="w-full bg-ds-surface-variant h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-ds-tertiary to-ds-primary h-full rounded-full transition-all" 
                        style={{ width: `${activeDasha?.antardasha?.percentComplete ?? 0}%` }}
                      />
                    </div>
                  </div>
                </Card>

                {/* Birth Panchangam View */}
                <PanchangamView
                  calendarInfo={horoscopeReport?.panchangam || horoscopeReport?.calendar_info}
                />

                {/* RVA Triple Charts */}
                <div id="charts-section" className="space-y-4 pt-4 border-t border-ds-secondary/10">
                  {kpChart ? (
                    <RVATripleCharts
                      kpChart={kpChart}
                      horoscopeData={horoscopeReport}
                    />
                  ) : (
                    <div className="p-6 text-center text-body-sm text-on-surface-variant">Loading RVA Triple Charts...</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANALYSIS & TIMELINE (Tier 2) */}
          {activeTab === 'analysis' && (
            <div id="analysis-section" className="space-y-6">
              <div className="border-b border-ds-secondary/20 pb-2">
                <h2 className="text-xl font-bold text-ds-secondary flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-ds-primary" />
                  <span>Planetary Strength, Yogas & Dasha Timelines</span>
                </h2>
              </div>

              <div className="space-y-6">
                <div id="strength-section">
                  <CombinedStrengthView
                    horoscopeData={horoscopeReport}
                    language={language}
                  />
                </div>

                <div id="yogas-doshas">
                  <YogasView
                    yogas={horoscopeReport?.yogas || horoscopeReport?.horoscope?.yogas}
                  />
                </div>

                <DoshasView
                  doshas={horoscopeReport?.doshas || horoscopeReport?.doshas || horoscopeReport?.horoscope?.doshas}
                  horoscopeData={horoscopeReport}
                />

                <div id="dasha-section" className="pt-4">
                  <VimshottariDashaView
                    horoscopeData={horoscopeReport}
                    birthDateStr={activeProfile?.date || '1995-01-01'}
                    language={language}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KP TECHNICAL ENGINE (Tier 3) */}
          {activeTab === 'kp-technical' && (
            <div id="kp-section" className="space-y-6">
              <div className="border-b border-ds-secondary/20 pb-2">
                <h2 className="text-xl font-bold text-ds-secondary flex items-center gap-2">
                  <Layers className="w-5 h-5 text-ds-primary" />
                  <span>KP Astrology Technical Engine & House Cusps</span>
                </h2>
              </div>

              <div>
                <KPAnalysisPage
                  birthDetails={personObj as BirthDetails}
                  horoscopeData={horoscopeReport}
                  hideProfileSelector={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
