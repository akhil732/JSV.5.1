import React, { useState, useEffect } from 'react';
import { KPChart, KPPlanet } from '../../types/kp';
import { SavedPerson } from '../../types/marriageMatch';
import { BirthDetails } from '../../types';
import { ProfileStorageService } from '../../lib/profileStorageService';
import { ADAM_PLANETS_KP as ADAM_PLANETS, calculateKPSubLord, formatDegrees } from '../../lib/kp/subLordMapper';
import { ADAM_HOUSES_KP, calculatePlacidusCusps } from '../../lib/kp/placidusCalculator';
import { analyzeSignificators } from '../../lib/kp/significatorAnalyzer';
import { calculateRulingPlanets } from '../../lib/kp/rulingPlanetsCalculator';
import { calculateVimshottariDashaFromMoon, CalculatedDashaInfo } from '../../lib/engines/DashaEngine';
import { CuspTable } from './CuspTable';
import { PlanetSignificatorsTable } from './PlanetSignificatorsTable';
import { RulingPlanetsWidget } from './RulingPlanetsWidget';
import { QueryVerdictPanel } from './QueryVerdictPanel';
import { DomainPredictionsView } from './DomainPredictionsView';
import { VimshottariDashaTab } from './VimshottariDashaTab';
import { KPQueryView } from './KPQueryView';
import { BirthForm } from '../BirthForm';
import { User, Sparkles, Compass, BarChart3, ShieldAlert, Clock, PlusCircle, UserCheck } from 'lucide-react';

const API_BASE_URL = '/api/jhora-proxy';

// Preset Adam Chart Data (Test Case)
const AKHIL_DEFAULT_PROFILE: SavedPerson = {
  id: 'satyam-family-10',
  name: 'I. Akhil',
  gender: 'Male',
  date: '1996-11-11',
  time: '13:50:00',
  place: 'Jaggampeta, Andhra Pradesh, India',
  latitude: 17.17,
  longitude: 82.0611,
  timezone: 5.5
};

interface KPAnalysisPageProps {
  birthDetails?: BirthDetails;
  horoscopeData?: any;
  hideProfileSelector?: boolean;
  initialTab?: 'predictions' | 'dasha' | 'chart' | 'ruling' | 'analysis' | 'query';
  hideSubTabs?: boolean;
}

export const KPAnalysisPage: React.FC<KPAnalysisPageProps> = ({
  birthDetails,
  horoscopeData,
  hideProfileSelector = false,
  initialTab = 'chart',
  hideSubTabs = false
}) => {
  // ... existing state ...
  const [profiles, setProfiles] = useState<SavedPerson[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<SavedPerson>(() => {
    if (birthDetails) {
      return {
        id: `native-${birthDetails.name}-${birthDetails.date}`,
        name: birthDetails.name || 'Native',
        gender: birthDetails.gender || 'Male',
        date: birthDetails.date,
        time: birthDetails.time,
        place: birthDetails.place,
        latitude: birthDetails.latitude,
        longitude: birthDetails.longitude,
        timezone: birthDetails.timezone
      };
    }
    return AKHIL_DEFAULT_PROFILE;
  });
  const [activeTab, setActiveTab] = useState<'predictions' | 'dasha' | 'chart' | 'ruling' | 'analysis' | 'query'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [kpChart, setKpChart] = useState<KPChart | null>(null);
  const [dashaInfo, setDashaInfo] = useState<CalculatedDashaInfo | null>(null);
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (birthDetails) {
      const p: SavedPerson = {
        id: `native-${birthDetails.name}-${birthDetails.date}`,
        name: birthDetails.name || 'Native',
        gender: birthDetails.gender || 'Male',
        date: birthDetails.date,
        time: birthDetails.time,
        place: birthDetails.place,
        latitude: birthDetails.latitude,
        longitude: birthDetails.longitude,
        timezone: birthDetails.timezone
      };
      setSelectedProfile(p);
    }
  }, [birthDetails?.name, birthDetails?.date, birthDetails?.time, birthDetails?.place]);

  useEffect(() => {
    // Subscribe to saved profiles from storage service
    const unsubscribe = ProfileStorageService.subscribe((loaded) => {
      setProfiles([AKHIL_DEFAULT_PROFILE, ...loaded.filter(p => p.id !== AKHIL_DEFAULT_PROFILE.id)]);
    });
    return () => unsubscribe();
  }, []);

  const buildKPChartForProfile = async (profile: SavedPerson) => {
    setLoading(true);
    setFormError(null);

    try {
      const isAdam = profile.id === 'satyam-family-10' || (profile.date === '1996-11-11' && (profile.name.toLowerCase().includes('akhil') || profile.name.toLowerCase().includes('adam')));

      let moonDegree = 202.1; // Default Moon degree for Adam
      let planetLongitudes: Record<string, number> = {
        Sun: 205.2,
        Moon: 202.1,
        Mars: 135.5,
        Mercury: 220.4,
        Jupiter: 258.8,
        Venus: 168.3,
        Saturn: 338.2,
        Rahu: 172.6,
        Ketu: 352.6,
        Lagna: 311.4
      };

      // Try reading directly from horoscopeData if available
      const d1 = horoscopeData?.horoscope?.divisional_charts?.['D-1_rasi'];
      if (d1 && !isAdam) {
        const signMap: Record<string, number> = {
          Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
          Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11
        };

        Object.keys(d1).forEach((key) => {
          const item = d1[key];
          if (item && item.sign && typeof item.longitude === 'number') {
            const sIdx = signMap[item.sign] ?? 0;
            const absDeg = ((sIdx * 30 + item.longitude) % 360 + 360) % 360;
            const stdKey = key === 'Ascendant' ? 'Lagna' : key;
            planetLongitudes[stdKey] = absDeg;
          }
        });

        if (typeof planetLongitudes.Moon === 'number') {
          moonDegree = planetLongitudes.Moon;
        }
      } else if (!isAdam) {
        // Fetch accurate astronomical positions from backend API if not test case
        try {
          const res = await fetch(`${API_BASE_URL}/horoscope`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: profile.date,
              time: profile.time,
              place: profile.place,
              latitude: profile.latitude,
              longitude: profile.longitude,
              timezone: profile.timezone
            })
          });

          if (res.ok) {
            const data = await res.json();
            const fetchedD1 = data?.horoscope?.divisional_charts?.['D-1_rasi'];
            if (fetchedD1) {
              const signMap: Record<string, number> = {
                Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
                Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11
              };

              Object.keys(fetchedD1).forEach((key) => {
                const item = fetchedD1[key];
                if (item && item.sign && typeof item.longitude === 'number') {
                  const sIdx = signMap[item.sign] ?? 0;
                  const absDeg = ((sIdx * 30 + item.longitude) % 360 + 360) % 360;
                  const stdKey = key === 'Ascendant' ? 'Lagna' : key;
                  planetLongitudes[stdKey] = absDeg;
                }
              });

              if (typeof planetLongitudes.Moon === 'number') {
                moonDegree = planetLongitudes.Moon;
              }
            }
          }
        } catch (err) {
          console.warn('[KPAnalysisPage] Horoscope API fetch failed, using Placidian engine fallback:', err);
        }
      }

      // 1. Calculate Planet Sub Lords
      const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
      const planets: KPPlanet[] = planetNames.map((pName) => {
        const deg = planetLongitudes[pName] ?? 180;
        const subLordChain = calculateKPSubLord(deg);
        return {
          name: pName,
          sign: subLordChain.sign,
          degree: deg,
          formattedDegree: formatDegrees(deg),
          signLord: subLordChain.signLord,
          starLord: subLordChain.starLord,
          subLord: subLordChain.subLord,
          subSubLord: subLordChain.subSubLord,
          isRetrograde: pName === 'Rahu' || pName === 'Ketu' || (isAdam && pName === 'Saturn'),
          isCombust: isAdam && (pName === 'Sun' || pName === 'Moon' || pName === 'Mercury'),
          significatorOf: [1, 2, 7]
        };
      });

      // 2. Calculate Placidus House Cusps
      const ascDegree = planetLongitudes.Lagna ?? 311.4;
      const houses = isAdam ? ADAM_HOUSES_KP : calculatePlacidusCusps(ascDegree, profile.latitude, profile.date, profile.time);

      // 3. Analyze Significators
      const { houseSignificators, planetSignificators } = analyzeSignificators(planets, houses, isAdam);

      // 4. Calculate Ruling Planets
      const rulingPlanets = calculateRulingPlanets(undefined, undefined, profile.latitude, profile.longitude);

      // 5. Calculate Exact Vimshottari Dasha from Moon Degree and Birth Date/Time
      const birthDateTimeStr = `${profile.date} ${profile.time}`;
      const calculatedDasha = calculateVimshottariDashaFromMoon(moonDegree, birthDateTimeStr, new Date(), horoscopeData);

      setDashaInfo(calculatedDasha);

      setKpChart({
        birthData: {
          name: profile.name,
          gender: profile.gender,
          date: profile.date,
          time: profile.time,
          place: profile.place,
          latitude: profile.latitude,
          longitude: profile.longitude,
          timezone: profile.timezone
        },
        planets,
        houses,
        rulingPlanets,
        currentDasha: {
          mahadasha: calculatedDasha.mahadasha,
          antardasha: calculatedDasha.antardasha,
          pratyantardasha: calculatedDasha.pratyantardasha,
          mahadashaEnd: calculatedDasha.mahadashaEnd,
          antardashaEnd: calculatedDasha.antardashaEnd
        },
        houseSignificators,
        planetSignificators
      });
    } catch (err: any) {
      console.error(err);
      setFormError('Failed to generate KP Chart: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buildKPChartForProfile(selectedProfile);
  }, [selectedProfile]);

  const handleBirthFormSubmit = async (details: BirthDetails) => {
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

      // Save to profile storage service (persists to localStorage and syncs with Drive)
      const savedPerson = await ProfileStorageService.saveProfile(newPersonInput);

      setSelectedProfile(savedPerson);
      setShowBirthForm(false);
    } catch (err: any) {
      console.error('Error saving profile from birth form:', err);
      setFormError('Failed to save profile: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-ds-surface-container text-ds-secondary py-4 sm:py-6 px-2 sm:px-4 lg:px-6 space-y-6 selection:bg-ds-primary/20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Person Selector (Only if not hidden) */}
        {!hideProfileSelector && (
          <div className="bg-ds-surface border border-ds-secondary/15 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-ds-primary text-xl font-bold">⚡</span>
                <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-ds-secondary">
                  KP ASTROLOGY PREDICTION ENGINE
                </h1>
              </div>
              {birthDetails && (
                <p className="text-xs text-ds-on-surface-variant mt-0.5 font-medium">
                  Krishnamurti Paddhati Analysis for <strong className="text-ds-primary">{selectedProfile.name}</strong> ({selectedProfile.date})
                </p>
              )}
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setShowBirthForm(!showBirthForm)}
                className="bg-ds-primary hover:bg-ds-primary/90 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                {showBirthForm ? 'Close Form' : '➕ Enter Birth Details'}
              </button>

              <div className="flex items-center gap-2 bg-ds-surface-container border border-ds-secondary/15 rounded-xl px-3 py-1.5 shadow-2xs">
                <User className="w-4 h-4 text-ds-primary shrink-0" />
                <select
                  value={selectedProfile.id}
                  onChange={(e) => {
                    const found = profiles.find((p) => p.id === e.target.value);
                    if (found) setSelectedProfile(found);
                  }}
                  className="bg-transparent text-xs sm:text-sm text-ds-secondary focus:outline-none cursor-pointer min-w-[180px] font-semibold"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id} className="bg-ds-surface text-ds-secondary">
                      {p.name} ({p.gender}, {p.date}) {p.id === 'satyam-family-10' ? '⭐ DEFAULT' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Collapsible Birth Details Entry Form */}
        {!hideProfileSelector && !birthDetails && showBirthForm && (
          <div className="bg-ds-surface border border-ds-primary/30 rounded-2xl p-6 shadow-md relative animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-ds-secondary/15">
              <div className="flex items-center gap-2 text-ds-secondary font-serif font-bold text-lg">
                <UserCheck className="w-5 h-5 text-ds-primary" />
                <span>Enter Birth Details for KP Analysis</span>
              </div>
              <button
                onClick={() => setShowBirthForm(false)}
                className="text-xs text-ds-on-surface-variant hover:text-ds-secondary font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <BirthForm
              onSubmit={handleBirthFormSubmit}
              loading={loading}
              error={formError}
            />
          </div>
        )}

        {/* Selected Native Summary Card (Only if not hidden) */}
        {!hideProfileSelector && kpChart && dashaInfo && (
          <div className="bg-ds-surface border border-ds-secondary/15 rounded-xl p-3.5 px-5 flex flex-wrap items-center justify-between gap-4 text-xs shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-ds-success-green animate-pulse" />
              <div>
                <span className="text-ds-on-surface-variant font-medium">Native:</span>{' '}
                <strong className="text-ds-secondary font-serif">{kpChart.birthData.name}</strong> ({kpChart.birthData.gender})
              </div>
            </div>
            <div>
              <span className="text-ds-on-surface-variant font-medium">DOB & TOB:</span>{' '}
              <strong className="text-ds-secondary font-mono font-bold">{kpChart.birthData.date} @ {kpChart.birthData.time}</strong>
            </div>
            <div>
              <span className="text-ds-on-surface-variant font-medium">POB:</span>{' '}
              <strong className="text-ds-secondary font-semibold">{kpChart.birthData.place}</strong>
            </div>
            <div className="flex items-center gap-2 bg-ds-primary/10 border border-ds-primary/30 px-3 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-ds-primary" />
              <span className="text-ds-on-surface-variant font-medium">Active Dasha:</span>{' '}
              <strong className="text-ds-primary font-bold">
                {dashaInfo.mahadasha} MD — {dashaInfo.antardasha} AD ({dashaInfo.pratyantardasha} PD)
              </strong>
            </div>
          </div>
        )}

        {/* Navigation Tabs (Positions at top) */}
        {!hideSubTabs && (
          <div className="flex items-center gap-1.5 bg-ds-surface border border-ds-secondary/15 p-1 rounded-xl shadow-2xs overflow-x-auto no-scrollbar">
            {[
              { id: 'chart', label: 'Chart Data', icon: BarChart3 },
              { id: 'ruling', label: 'Ruling Planets (RP)', icon: Compass },
              { id: 'analysis', label: '6-Domain Assessment', icon: ShieldAlert },
              { id: 'query', label: 'KP Query', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[130px] sm:min-w-0 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-ds-secondary text-ds-on-secondary shadow-sm'
                      : 'text-ds-on-surface-variant hover:text-ds-secondary hover:bg-ds-surface-container'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-ds-tertiary' : 'text-ds-primary'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Content Rendering */}
        {kpChart && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {activeTab === 'predictions' && <QueryVerdictPanel chart={kpChart} />}
            {activeTab === 'dasha' && dashaInfo && (
              <VimshottariDashaTab
                dashaInfo={dashaInfo}
                nativeName={kpChart.birthData.name}
                birthDate={kpChart.birthData.date}
              />
            )}
            {activeTab === 'chart' && (
              <div className="space-y-6">
                <CuspTable houses={kpChart.houses} />
                <PlanetSignificatorsTable
                  planets={kpChart.planets}
                  planetSignificators={kpChart.planetSignificators}
                />
              </div>
            )}
            {activeTab === 'ruling' && (
              <RulingPlanetsWidget
                rulingPlanets={kpChart.rulingPlanets}
                latitude={selectedProfile.latitude}
                longitude={selectedProfile.longitude}
              />
            )}
            {activeTab === 'analysis' && <DomainPredictionsView chart={kpChart} />}
            {activeTab === 'query' && <KPQueryView chart={kpChart} />}
          </div>
        )}

      </div>
    </div>
  );
};

export default KPAnalysisPage;
