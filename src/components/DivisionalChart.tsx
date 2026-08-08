import React, { useState, useEffect } from 'react';
import { getPlanetAbbr, formatPlanetDisplay, getPlanetColor } from '../lib/planetAbbreviations';
import { groupPlanetsByHouse, sortPlanetsInHouse } from '../lib/chartLayoutUtils';
import { calculateActiveDasha } from '../lib/engines/DashaEngine';
import { getTransitPositions } from './StrategicReport';

export const SIGN_MAP: Record<string, { number: number; sanskrit: string }> = {
  "Aries": { number: 1, sanskrit: "Mesha" },
  "Taurus": { number: 2, sanskrit: "Vrishabha" },
  "Gemini": { number: 3, sanskrit: "Mithuna" },
  "Cancer": { number: 4, sanskrit: "Karka" },
  "Leo": { number: 5, sanskrit: "Simha" },
  "Virgo": { number: 6, sanskrit: "Kanya" },
  "Libra": { number: 7, sanskrit: "Tula" },
  "Scorpio": { number: 8, sanskrit: "Vrischika" },
  "Sagittarius": { number: 9, sanskrit: "Dhanus" },
  "Capricorn": { number: 10, sanskrit: "Makara" },
  "Aquarius": { number: 11, sanskrit: "Kumbha" },
  "Pisces": { number: 12, sanskrit: "Meena" }
};

export const PLANETS_SHORT: Record<string, string> = {
  "Ascendant": "L",
  "Lagna": "L",
  "Sun": "Su",
  "Moon": "Mo",
  "Mars": "Ma",
  "Mercury": "Me",
  "Jupiter": "Ju",
  "Venus": "Ve",
  "Saturn": "Sa",
  "Rahu": "Ra",
  "Ketu": "Ke"
};

export const getUnrecognizedSignError = (chartData: any): string | null => {
  if (!chartData) return null;
  const ascSignName = chartData.Ascendant?.sign || chartData.Lagna?.sign;
  if (ascSignName && !SIGN_MAP[ascSignName]) {
    console.error(`[DivisionalChart] Unrecognized Ascendant sign name: "${ascSignName}"`);
    return `Unrecognized Ascendant sign name: "${ascSignName}"`;
  }
  const grahas = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  for (const g of grahas) {
    const gData = chartData[g];
    if (gData?.sign && !SIGN_MAP[gData.sign]) {
      console.error(`[DivisionalChart] Unrecognized sign name for planet ${g}: "${gData.sign}"`);
      return `Unrecognized sign name for planet ${g}: "${gData.sign}"`;
    }
  }
  return null;
};

const NORTH_INDIAN_LAYOUTS: Record<number, {
  points: string;
  rashi: { x: number; y: number };
  label: { x: number; y: number };
  center: { x: number; y: number };
}> = {
  1: {
    points: "200,0 100,100 200,200 300,100",
    rashi: { x: 200, y: 55 },
    label: { x: 200, y: 22 },
    center: { x: 200, y: 110 }
  },
  2: {
    points: "0,0 200,0 100,100",
    rashi: { x: 135, y: 40 },
    label: { x: 65, y: 22 },
    center: { x: 100, y: 55 }
  },
  3: {
    points: "0,0 0,200 100,100",
    rashi: { x: 40, y: 135 },
    label: { x: 22, y: 65 },
    center: { x: 55, y: 100 }
  },
  4: {
    points: "0,200 100,100 200,200 100,300",
    rashi: { x: 55, y: 200 },
    label: { x: 22, y: 200 },
    center: { x: 110, y: 200 }
  },
  5: {
    points: "0,400 0,200 100,300",
    rashi: { x: 40, y: 265 },
    label: { x: 22, y: 335 },
    center: { x: 55, y: 300 }
  },
  6: {
    points: "0,400 200,400 100,300",
    rashi: { x: 135, y: 360 },
    label: { x: 65, y: 378 },
    center: { x: 100, y: 345 }
  },
  7: {
    points: "200,400 100,300 200,200 300,300",
    rashi: { x: 200, y: 345 },
    label: { x: 200, y: 378 },
    center: { x: 200, y: 290 }
  },
  8: {
    points: "200,400 400,400 300,300",
    rashi: { x: 265, y: 360 },
    label: { x: 335, y: 378 },
    center: { x: 300, y: 345 }
  },
  9: {
    points: "400,200 400,400 300,300",
    rashi: { x: 360, y: 265 },
    label: { x: 378, y: 335 },
    center: { x: 345, y: 300 }
  },
  10: {
    points: "400,200 300,300 200,200 300,100",
    rashi: { x: 345, y: 200 },
    label: { x: 378, y: 200 },
    center: { x: 290, y: 200 }
  },
  11: {
    points: "400,0 400,200 300,100",
    rashi: { x: 360, y: 135 },
    label: { x: 378, y: 65 },
    center: { x: 345, y: 100 }
  },
  12: {
    points: "400,0 200,0 300,100",
    rashi: { x: 265, y: 40 },
    label: { x: 335, y: 22 },
    center: { x: 300, y: 55 }
  }
};

const SOUTH_INDIAN_LAYOUTS: Record<number, {
  col: number;
  row: number;
  name: string;
  sanskrit: string;
  rashiLabel: { x: number; y: number };
  center: { x: number; y: number };
}> = {
  1: { col: 1, row: 0, name: "Aries", sanskrit: "Mesha", rashiLabel: { x: 110, y: 22 }, center: { x: 150, y: 60 } },
  2: { col: 2, row: 0, name: "Taurus", sanskrit: "Vrishabha", rashiLabel: { x: 210, y: 22 }, center: { x: 250, y: 60 } },
  3: { col: 3, row: 0, name: "Gemini", sanskrit: "Mithuna", rashiLabel: { x: 310, y: 22 }, center: { x: 350, y: 60 } },
  4: { col: 3, row: 1, name: "Cancer", sanskrit: "Karka", rashiLabel: { x: 310, y: 122 }, center: { x: 350, y: 160 } },
  5: { col: 3, row: 2, name: "Leo", sanskrit: "Simha", rashiLabel: { x: 310, y: 222 }, center: { x: 350, y: 260 } },
  6: { col: 3, row: 3, name: "Virgo", sanskrit: "Kanya", rashiLabel: { x: 310, y: 322 }, center: { x: 350, y: 360 } },
  7: { col: 2, row: 3, name: "Libra", sanskrit: "Tula", rashiLabel: { x: 210, y: 322 }, center: { x: 250, y: 360 } },
  8: { col: 1, row: 3, name: "Scorpio", sanskrit: "Vrischika", rashiLabel: { x: 110, y: 322 }, center: { x: 150, y: 360 } },
  9: { col: 0, row: 3, name: "Sagittarius", sanskrit: "Dhanus", rashiLabel: { x: 10, y: 322 }, center: { x: 50, y: 360 } },
  10: { col: 0, row: 2, name: "Capricorn", sanskrit: "Makara", rashiLabel: { x: 10, y: 222 }, center: { x: 50, y: 260 } },
  11: { col: 0, row: 1, name: "Aquarius", sanskrit: "Kumbha", rashiLabel: { x: 10, y: 122 }, center: { x: 50, y: 160 } },
  12: { col: 0, row: 0, name: "Pisces", sanskrit: "Meena", rashiLabel: { x: 10, y: 22 }, center: { x: 50, y: 60 } }
};

const EAST_INDIAN_LAYOUTS: Record<number, {
  type: 'triangle' | 'rect';
  points?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name: string;
  sanskrit: string;
  label: { x: number; y: number };
  center: { x: number; y: number };
}> = {
  1: { // Aries - Row 0, Col 1
    type: 'rect',
    x: 133.33,
    y: 0,
    width: 133.34,
    height: 133.33,
    name: "Aries",
    sanskrit: "Mesha",
    label: { x: 200, y: 22 },
    center: { x: 200, y: 70 }
  },
  2: { // Taurus - Row 0, Col 0 (Top Triangle)
    type: 'triangle',
    points: "0,0 133.33,0 133.33,133.33",
    name: "Taurus",
    sanskrit: "Vrishabha",
    label: { x: 88, y: 22 },
    center: { x: 88, y: 65 }
  },
  3: { // Gemini - Row 0, Col 0 (Left Triangle)
    type: 'triangle',
    points: "0,0 0,133.33 133.33,133.33",
    name: "Gemini",
    sanskrit: "Mithuna",
    label: { x: 35, y: 115 },
    center: { x: 65, y: 88 }
  },
  4: { // Cancer - Row 1, Col 0
    type: 'rect',
    x: 0,
    y: 133.33,
    width: 133.33,
    height: 133.34,
    name: "Cancer",
    sanskrit: "Karka",
    label: { x: 66.66, y: 155 },
    center: { x: 66.66, y: 205 }
  },
  5: { // Leo - Row 2, Col 0 (Left Triangle)
    type: 'triangle',
    points: "0,266.67 0,400 133.33,266.67",
    name: "Leo",
    sanskrit: "Simha",
    label: { x: 35, y: 285 },
    center: { x: 65, y: 311 }
  },
  6: { // Virgo - Row 2, Col 0 (Bottom Triangle)
    type: 'triangle',
    points: "0,400 133.33,400 133.33,266.67",
    name: "Virgo",
    sanskrit: "Kanya",
    label: { x: 88, y: 378 },
    center: { x: 88, y: 335 }
  },
  7: { // Libra - Row 2, Col 1
    type: 'rect',
    x: 133.33,
    y: 266.67,
    width: 133.34,
    height: 133.33,
    name: "Libra",
    sanskrit: "Tula",
    label: { x: 200, y: 378 },
    center: { x: 200, y: 320 }
  },
  8: { // Scorpio - Row 2, Col 2 (Bottom Triangle)
    type: 'triangle',
    points: "266.67,266.67 266.67,400 400,400",
    name: "Scorpio",
    sanskrit: "Vrischika",
    label: { x: 312, y: 378 },
    center: { x: 312, y: 335 }
  },
  9: { // Sagittarius - Row 2, Col 2 (Right Triangle)
    type: 'triangle',
    points: "266.67,266.67 400,266.67 400,400",
    name: "Sagittarius",
    sanskrit: "Dhanus",
    label: { x: 365, y: 285 },
    center: { x: 335, y: 311 }
  },
  10: { // Capricorn - Row 1, Col 2
    type: 'rect',
    x: 266.67,
    y: 133.33,
    width: 133.33,
    height: 133.34,
    name: "Capricorn",
    sanskrit: "Makara",
    label: { x: 333.33, y: 155 },
    center: { x: 333.33, y: 205 }
  },
  11: { // Aquarius - Row 0, Col 2 (Right Triangle)
    type: 'triangle',
    points: "266.67,133.33 400,0 400,133.33",
    name: "Aquarius",
    sanskrit: "Kumbha",
    label: { x: 365, y: 115 },
    center: { x: 335, y: 88 }
  },
  12: { // Pisces - Row 0, Col 2 (Top Triangle)
    type: 'triangle',
    points: "266.67,0 266.67,133.33 400,0",
    name: "Pisces",
    sanskrit: "Meena",
    label: { x: 312, y: 22 },
    center: { x: 312, y: 65 }
  }
};

const getSignAbbreviation = (signIndex: number, lang: 'en' | 'hi' | 'te') => {
  const abbreviations: Record<number, { en: string; sanskrit: string; hi: string; te: string }> = {
    1: { en: "Ari", sanskrit: "Mes", hi: "मेष", te: "మేష" },
    2: { en: "Tau", sanskrit: "Vri", hi: "वृष", te: "వృష" },
    3: { en: "Gem", sanskrit: "Mit", hi: "मिथु", te: "మిథు" },
    4: { en: "Can", sanskrit: "Kar", hi: "कर्क", te: "కర్క" },
    5: { en: "Leo", sanskrit: "Sim", hi: "सिंह", te: "సింహ" },
    6: { en: "Vir", sanskrit: "Kan", hi: "कन्या", te: "కన్య" },
    7: { en: "Lib", sanskrit: "Tul", hi: "तुला", te: "తుల" },
    8: { en: "Sco", sanskrit: "Vri", hi: "वृश्चि", te: "వృశ్చి" },
    9: { en: "Sag", sanskrit: "Dha", hi: "धनु", te: "ధను" },
    10: { en: "Cap", sanskrit: "Mak", hi: "मकर", te: "మకర" },
    11: { en: "Aqu", sanskrit: "Kum", hi: "कुंभ", te: "కుంభ" },
    12: { en: "Pis", sanskrit: "Mee", hi: "मीन", te: "మీన" }
  };
  const entry = abbreviations[signIndex];
  if (!entry) return "";
  if (lang === 'te') return entry.te;
  if (lang === 'hi') return entry.hi;
  return entry.en;
};

interface DivisionalChartProps {
  horoscopeData: any;
  language?: 'en' | 'hi' | 'te';
}

export const DivisionalChart: React.FC<DivisionalChartProps> = ({ horoscopeData, language = 'en' }) => {
  const [activeTab, setActiveTab] = useState<'D1' | 'D9'>('D1');
  const [todayChartStyle, setTodayChartStyle] = useState<'South' | 'East'>('East');
  const [birthChartStyle, setBirthChartStyle] = useState<'South' | 'East'>('East');
  const [todayHoroscope, setTodayHoroscope] = useState<any | null>(null);
  const [loadingToday, setLoadingToday] = useState<boolean>(false);

  const divisionalCharts = horoscopeData?.horoscope?.divisional_charts || {};
  
  const getTabKey = (tab: 'D1' | 'D9') => {
    if (tab === 'D1') return 'D-1_rasi';
    return 'D-9_navamsa';
  };

  const currentChartKey = getTabKey(activeTab);
  const currentChart = divisionalCharts[currentChartKey];
  const chartAvailable = !!currentChart;
  const validationError = currentChart ? getUnrecognizedSignError(currentChart) : null;

  const retrogradePlanets = horoscopeData?.horoscope?.planetary_states?.retrograde_planets || [];

  // Today's horoscope fetch logic
  useEffect(() => {
    const fetchTodayHoroscope = async () => {
      setLoadingToday(true);
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        const timeStr = `${hrs}:${mins}:${secs}`;

        const lat = horoscopeData?.birth_details?.latitude || 17.3850;
        const lon = horoscopeData?.birth_details?.longitude || 78.4867;
        const tz = horoscopeData?.birth_details?.timezone || 5.5;
        const place = horoscopeData?.birth_details?.place || "Hyderabad";

        const makeCall = async (latitude: number, longitude: number, timezone: number, placeName: string) => {
          const response = await fetch('/api/jhora-proxy/horoscope', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: todayStr,
              time: timeStr,
              latitude,
              longitude,
              timezone,
              place: placeName
            })
          });
          if (!response.ok) throw new Error('API failed');
          const data = await response.json();
          setTodayHoroscope(data);
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              await makeCall(pos.coords.latitude, pos.coords.longitude, tz, "Current Location");
            },
            async () => {
              await makeCall(lat, lon, tz, place);
            },
            { timeout: 4000 }
          );
        } else {
          await makeCall(lat, lon, tz, place);
        }
      } catch (err) {
        console.error('Error fetching today horoscope in DivisionalChart:', err);
      } finally {
        setLoadingToday(false);
      }
    };

    if (horoscopeData) {
      fetchTodayHoroscope();
    }
  }, [horoscopeData]);

  // Extract Lagna Sign Details (Birth)
  const lagnaInfo = currentChart?.Ascendant;
  const lagnaSign = lagnaInfo?.sign || "Unknown";
  const lagnaSanskrit = SIGN_MAP[lagnaSign]?.sanskrit || "Unknown";

  // Extract Lagna Sign Details (Today)
  const todayDivCharts = todayHoroscope?.horoscope?.divisional_charts || {};
  const currentTodayChart = todayDivCharts[currentChartKey];
  const todayChartAvailable = !!currentTodayChart;
  const todayLagnaInfo = currentTodayChart?.Ascendant;
  const todayLagnaSign = todayLagnaInfo?.sign || "Unknown";
  const todayLagnaSanskrit = SIGN_MAP[todayLagnaSign]?.sanskrit || "Unknown";

  const getPlanetOffsets = (count: number) => {
    if (count === 1) return [{ dx: 0, dy: 5 }];
    if (count === 2) return [{ dx: -18, dy: 5 }, { dx: 18, dy: 5 }];
    if (count === 3) return [{ dx: -20, dy: -5 }, { dx: 20, dy: -5 }, { dx: 0, dy: 16 }];
    if (count === 4) return [{ dx: -20, dy: -10 }, { dx: 20, dy: -10 }, { dx: -20, dy: 14 }, { dx: 20, dy: 14 }];
    if (count === 5) return [{ dx: -22, dy: -12 }, { dx: 22, dy: -12 }, { dx: 0, dy: 2 }, { dx: -22, dy: 18 }, { dx: 22, dy: 18 }];
    return [
      { dx: -22, dy: -16 }, { dx: 22, dy: -16 },
      { dx: -22, dy: 2 }, { dx: 22, dy: 2 },
      { dx: -22, dy: 20 }, { dx: 22, dy: 20 },
      { dx: 0, dy: -30 }
    ];
  };

  const renderPlanetChips = (planets: string[], cx: number, cy: number) => {
    const offsets = getPlanetOffsets(planets.length);
    return planets.map((p, idx) => {
      const isLagna = p === 'L' || p === 'Asc' || p === 'Lg';
      const isRetro = !isLagna && retrogradePlanets.includes(
        p === 'Su' ? 'Sun' : p === 'Mo' ? 'Moon' : p === 'Ma' ? 'Mars' : p === 'Me' ? 'Mercury' : p === 'Ju' ? 'Jupiter' : p === 'Ve' ? 'Venus' : p === 'Sa' ? 'Saturn' : p === 'Ra' ? 'Rahu' : p === 'Ke' ? 'Ketu' : ''
      );
      const offset = offsets[idx] || { dx: 0, dy: 0 };
      const px = cx + offset.dx;
      const py = cy + offset.dy;
      const planetColor = getPlanetColor(p);
      const displayText = formatPlanetDisplay(p, isRetro);
      const chipWidth = isRetro ? 32 : 28;

      return (
        <g key={p + idx} transform={`translate(${px - (chipWidth / 2)}, ${py - 9})`}>
          <rect
            width={chipWidth}
            height="18"
            rx="4"
            ry="4"
            fill={isLagna ? "#E67E22" : "#2C3E50"}
            stroke={isRetro ? "#C0392B" : isLagna ? "#E67E22" : planetColor}
            strokeWidth={isLagna || isRetro ? "2" : "1.5"}
          />
          <text
            x={chipWidth / 2}
            y="13"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {displayText}
          </text>
        </g>
      );
    });
  };

  // Helper to map signs & planets to houses (North style)
  const renderNorthIndianChart = (chartData: any) => {
    if (!chartData) return null;
    const ascSignName = chartData.Ascendant?.sign;
    const ascSignIndex = SIGN_MAP[ascSignName]?.number || 1;

    // Collect planets by house
    const planetsInHouses: Record<number, string[]> = {};
    for (let h = 1; h <= 12; h++) {
      planetsInHouses[h] = [];
    }
    // Add Lagna (L) to House 1
    planetsInHouses[1].push("L");

    const grahas = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    grahas.forEach(g => {
      const gData = chartData[g];
      if (gData) {
        const signNum = SIGN_MAP[gData.sign]?.number || 1;
        const houseNum = ((signNum - ascSignIndex + 12) % 12) + 1;
        planetsInHouses[houseNum].push(PLANETS_SHORT[g] || g.substring(0, 2));
      }
    });

    return (
      <svg viewBox="0 0 400 400" className="w-full h-auto max-w-[380px] mx-auto border border-ds-secondary/20 rounded-ds-lg bg-ds-surface">
        {/* Draw Polygons for houses */}
        {Object.entries(NORTH_INDIAN_LAYOUTS).map(([houseStr, layout]) => {
          const houseNum = parseInt(houseStr);
          const rashiNum = ((ascSignIndex - 1 + (houseNum - 1)) % 12) + 1;
          const planets = planetsInHouses[houseNum] || [];

          return (
            <g key={houseNum} className="group">
              <polygon
                points={layout.points}
                fill="var(--ds-surface)"
                stroke="var(--ds-outline)"
                strokeWidth="1.5"
                className="hover:fill-ds-surface-container transition-colors"
              />
              
              {/* House index in small muted text */}
              <text
                x={layout.label.x}
                y={layout.label.y}
                textAnchor="middle"
                fill="var(--ds-on-surface-variant)"
                fontSize="9"
                fontWeight="500"
                fontFamily='"Noto Sans Telugu", sans-serif'
              >
                H{houseNum}
              </text>

              {/* Rashi number in small gold/saffron text */}
              <text
                x={layout.rashi.x}
                y={layout.rashi.y}
                textAnchor="middle"
                fill="var(--ds-primary)"
                fontSize="11"
                fontWeight="bold"
                fontFamily='"Noto Sans Telugu", sans-serif'
              >
                {rashiNum}
              </text>

              {/* Planet chips */}
              {renderPlanetChips(planets, layout.center.x, layout.center.y)}
            </g>
          );
        })}

        {/* Diagonals to anchor overlay */}
        <line x1="0" y1="0" x2="400" y2="400" stroke="var(--ds-outline)" strokeWidth="1.5" pointerEvents="none" />
        <line x1="400" y1="0" x2="0" y2="400" stroke="var(--ds-outline)" strokeWidth="1.5" pointerEvents="none" />

        {/* Inner Diamond edges explicitly reinforced */}
        <line x1="200" y1="0" x2="0" y2="200" stroke="var(--ds-outline)" strokeWidth="1.5" pointerEvents="none" />
        <line x1="0" y1="200" x2="200" y2="400" stroke="var(--ds-outline)" strokeWidth="1.5" pointerEvents="none" />
        <line x1="200" y1="400" x2="400" y2="200" stroke="var(--ds-outline)" strokeWidth="1.5" pointerEvents="none" />
        <line x1="400" y1="200" x2="200" y2="0" stroke="var(--ds-outline)" strokeWidth="1.5" pointerEvents="none" />
      </svg>
    );
  };

  // Helper to map signs & planets to grid cells (South style)
  const renderSouthIndianChart = (chartData: any, titleSuffix: string) => {
    if (!chartData) return null;
    const ascSignName = chartData.Ascendant?.sign;
    const ascSignIndex = SIGN_MAP[ascSignName]?.number || 1;

    // Collect planets by sign index 1 to 12
    const planetsInSigns: Record<number, string[]> = {};
    for (let s = 1; s <= 12; s++) {
      planetsInSigns[s] = [];
    }
    // Add Lagna (L)
    if (ascSignIndex >= 1 && ascSignIndex <= 12) {
      planetsInSigns[ascSignIndex].push("L");
    }

    const grahas = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    grahas.forEach(g => {
      const gData = chartData[g];
      if (gData) {
        const signNum = SIGN_MAP[gData.sign]?.number || 1;
        planetsInSigns[signNum].push(PLANETS_SHORT[g] || g.substring(0, 2));
      }
    });

    return (
      <svg viewBox="0 0 400 400" className="w-full h-auto max-w-[380px] mx-auto border border-ds-secondary/20 rounded-ds-lg bg-ds-surface">
        {/* Draw 12 outer boxes and 1 inner center area */}
        {/* Row 0, 1, 2, 3 and Col 0, 1, 2, 3 */}
        {/* First draw empty center space */}
        <rect x="100" y="100" width="200" height="200" fill="var(--ds-surface-container)" stroke="var(--ds-outline)" strokeWidth="1.5" />
        
        {/* Render text inside center space */}
        <text x="200" y="180" textAnchor="middle" fill="var(--ds-on-surface-variant)" fontSize="11" fontWeight="bold" fontFamily='"Noto Sans Telugu", sans-serif'>
          {titleSuffix}
        </text>
        <text x="200" y="210" textAnchor="middle" fill="var(--ds-primary)" fontSize="15" fontWeight="bold" fontFamily="serif">
          {activeTab}
        </text>
        <text x="200" y="235" textAnchor="middle" fill="var(--ds-on-surface)" fontSize="10" fontFamily='"Noto Sans Telugu", sans-serif'>
          Lagna: {ascSignName}
        </text>

        {/* Draw Sign Boxes */}
        {Object.entries(SOUTH_INDIAN_LAYOUTS).map(([signStr, layout]) => {
          const signIndex = parseInt(signStr);
          const planets = planetsInSigns[signIndex] || [];
          const isLagnaSign = ascSignIndex === signIndex;
          const x = layout.col * 100;
          const y = layout.row * 100;

          return (
            <g key={signIndex} className="group">
              <rect
                x={x}
                y={y}
                width="100"
                height="100"
                fill={isLagnaSign ? "var(--ds-surface-container)" : "var(--ds-surface)"}
                stroke="var(--ds-outline)"
                strokeWidth="1.5"
                className="hover:fill-ds-surface-container transition-colors"
              />

              {/* Diagonal line across the Ascendant cell corner */}
              {isLagnaSign && (
                <line x1={x} y1={y} x2={x + 35} y2={y + 35} stroke="var(--ds-primary)" strokeWidth="1.5" />
              )}

              {/* Rashi Sign Short Label & Index number */}
              <text
                x={layout.rashiLabel.x}
                y={layout.rashiLabel.y}
                fill="var(--ds-primary)"
                fontSize="10"
                fontWeight="bold"
                fontFamily='"Noto Sans Telugu", sans-serif'
              >
                {layout.sanskrit.substring(0, 3)} ({signIndex})
              </text>

              {/* Planet chips */}
              {renderPlanetChips(planets, layout.center.x, layout.center.y)}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderEastIndianChart = (chartData: any, titleSuffix: string) => {
    if (!chartData) return null;
    const ascSignName = chartData.Ascendant?.sign;
    const ascSignIndex = SIGN_MAP[ascSignName]?.number || 1;

    // Collect planets by sign index 1 to 12
    const planetsInSigns: Record<number, string[]> = {};
    for (let s = 1; s <= 12; s++) {
      planetsInSigns[s] = [];
    }
    // Add Lagna (L)
    if (ascSignIndex >= 1 && ascSignIndex <= 12) {
      planetsInSigns[ascSignIndex].push("L");
    }

    const grahas = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    grahas.forEach(g => {
      const gData = chartData[g];
      if (gData) {
        const signNum = SIGN_MAP[gData.sign]?.number || 1;
        planetsInSigns[signNum].push(PLANETS_SHORT[g] || g.substring(0, 2));
      }
    });

    return (
      <svg viewBox="0 0 400 400" className="w-full h-auto max-w-[500px] mx-auto border border-ds-secondary/20 rounded-ds-lg bg-ds-surface">
        {/* Draw 12 signs/houses in fixed layout */}
        {Object.entries(EAST_INDIAN_LAYOUTS).map(([signStr, layout]) => {
          const signIndex = parseInt(signStr);
          const planets = planetsInSigns[signIndex] || [];
          const isLagnaSign = ascSignIndex === signIndex;
          const houseNum = ((signIndex - ascSignIndex + 12) % 12) + 1;

          if (layout.type === 'rect') {
            return (
              <g key={signIndex} className="group">
                <rect
                  x={layout.x}
                  y={layout.y}
                  width={layout.width}
                  height={layout.height}
                  fill={isLagnaSign ? "rgba(232, 158, 67, 0.15)" : "var(--ds-surface)"}
                  stroke={isLagnaSign ? "var(--ds-primary)" : "var(--ds-outline)"}
                  strokeWidth={isLagnaSign ? "2" : "1.5"}
                  className="hover:fill-ds-surface-container transition-colors"
                />
                
                {/* Rashi abbreviation & House */}
                <text
                  x={layout.label.x}
                  y={layout.label.y}
                  textAnchor="middle"
                  fill={isLagnaSign ? "var(--ds-primary)" : "var(--ds-on-surface-variant)"}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily='"Noto Sans Telugu", sans-serif'
                >
                  {getSignAbbreviation(signIndex, language as 'en' | 'hi' | 'te')} (H{houseNum})
                </text>

                {/* Planet chips */}
                {renderPlanetChips(planets, layout.center.x, layout.center.y)}
              </g>
            );
          } else {
            return (
              <g key={signIndex} className="group">
                <polygon
                  points={layout.points}
                  fill={isLagnaSign ? "rgba(232, 158, 67, 0.15)" : "var(--ds-surface)"}
                  stroke={isLagnaSign ? "var(--ds-primary)" : "var(--ds-outline)"}
                  strokeWidth={isLagnaSign ? "2" : "1.5"}
                  className="hover:fill-ds-surface-container transition-colors"
                />

                {/* Rashi abbreviation & House */}
                <text
                  x={layout.label.x}
                  y={layout.label.y}
                  textAnchor="middle"
                  fill={isLagnaSign ? "var(--ds-primary)" : "var(--ds-on-surface-variant)"}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily='"Noto Sans Telugu", sans-serif'
                >
                  {getSignAbbreviation(signIndex, language as 'en' | 'hi' | 'te')} (H{houseNum})
                </text>

                {/* Planet chips */}
                {renderPlanetChips(planets, layout.center.x, layout.center.y)}
              </g>
            );
          }
        })}

        {/* Center rectangle */}
        <rect x="133.33" y="133.33" width="133.34" height="133.34" fill="var(--ds-surface-container)" stroke="var(--ds-outline)" strokeWidth="1.5" />
        
        {/* Render text inside center space */}
        <text x="200" y="180" textAnchor="middle" fill="var(--ds-on-surface-variant)" fontSize="11" fontWeight="bold" fontFamily='"Noto Sans Telugu", sans-serif'>
          {titleSuffix}
        </text>
        <text x="200" y="210" textAnchor="middle" fill="var(--ds-primary)" fontSize="15" fontWeight="bold" fontFamily="serif">
          {activeTab}
        </text>
        <text x="200" y="235" textAnchor="middle" fill="var(--ds-on-surface)" fontSize="10" fontFamily='"Noto Sans Telugu", sans-serif'>
          Lagna: {ascSignName}
        </text>
      </svg>
    );
  };

  const l = chartLabels[language] || chartLabels.en;

  const todayDate = new Date().toLocaleDateString(language, { day: 'numeric', month: 'short', year: 'numeric' });
  const todayTime = new Date().toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const todayLocationName = todayHoroscope?.birth_details?.place || horoscopeData?.birth_details?.place || "Hyderabad";

  const birthDetails = horoscopeData?.birth_details || {};
  const transitPositions = getTransitPositions(2026);
  const now = new Date();
  const dashaData = calculateActiveDasha(horoscopeData, birthDetails.date, now);
  const activeMdLord = dashaData?.mahadasha?.lord || "Venus";
  const activeAdLord = dashaData?.antardasha?.lord || "Sun";
  const activeMd = { start: dashaData?.mahadasha?.startDate || now, end: dashaData?.mahadasha?.endDate || now };
  const activeAd = { start: dashaData?.antardasha?.startDate || now, end: dashaData?.antardasha?.endDate || now };
  
  const moonSign = divisionalCharts["D-1_rasi"]?.Moon?.sign || "Aries";
  const moonSignNum = SIGN_MAP[moonSign]?.number || 1;
  const saturnSignNum = SIGN_MAP[transitPositions.Saturn]?.number || 1;
  const saturnHouseFromMoon = ((saturnSignNum - moonSignNum + 12) % 12) + 1;
  const jupiterSignNum = SIGN_MAP[transitPositions.Jupiter]?.number || 1;
  const jupiterHouseFromMoon = ((jupiterSignNum - moonSignNum + 12) % 12) + 1;

  return (
    <div className="space-y-8 w-full">
      <div className="grid grid-cols-1 gap-6 items-stretch w-full">
      
      {/* COLUMN 2: Birth Natal Chart */}
      <div className="rounded-2xl border border-ds-secondary/15 bg-ds-surface overflow-hidden shadow-ds-sm flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-ds-surface-container px-6 py-4 border-b border-ds-secondary/15">
            <div>
              <h3 className="text-sm font-serif font-bold tracking-tight text-ds-secondary flex items-center gap-1">
                {l.birthNatalChart} ({activeTab})
              </h3>
              <p className="text-[11px] text-ds-on-surface-variant mt-0.5">
                {horoscopeData?.birth_details?.date || "N/A"} • {horoscopeData?.birth_details?.time || "N/A"} • {horoscopeData?.birth_details?.place || "N/A"}
              </p>
            </div>

            {/* North/South/East toggler */}
            <div className="flex bg-ds-surface-container rounded-md p-0.5 border border-ds-secondary/15 self-start sm:self-auto shrink-0">
              <button
                onClick={() => setBirthChartStyle('South')}
                className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${
                  birthChartStyle === 'South'
                    ? 'bg-ds-primary text-white shadow-sm'
                    : 'text-ds-on-surface-variant hover:text-ds-secondary'
                }`}
              >
                {l.southIndian}
              </button>
              <button
                onClick={() => setBirthChartStyle('East')}
                className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${
                  birthChartStyle === 'East'
                    ? 'bg-ds-primary text-white shadow-sm'
                    : 'text-ds-on-surface-variant hover:text-ds-secondary'
                }`}
              >
                {l.eastIndian}
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Lagna Sign Display */}
            <div className="mb-4 px-4 py-2 bg-ds-surface-container rounded-xl border border-ds-secondary/15 flex items-center justify-between">
              <span className="text-xs text-ds-on-surface-variant">{l.selectedLagna}:</span>
              <span className="text-xs font-semibold text-ds-primary font-serif">
                {lagnaSign} ({lagnaSanskrit})
              </span>
            </div>

            {/* Tab Selection Bar */}
            <div className="grid grid-cols-2 gap-2 mb-5 bg-ds-surface-container p-1 rounded-xl border border-ds-secondary/15">
              {(['D1', 'D9'] as const).map((tab) => {
                const label = tab === 'D1' ? l.d1 : l.d9;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-1.5 px-1 text-center rounded text-[10px] font-bold transition-all ${
                      activeTab === tab
                        ? 'bg-ds-primary text-white shadow-sm shadow-ds-primary/20'
                        : 'bg-ds-surface text-ds-on-surface-variant hover:text-ds-secondary border border-ds-secondary/15'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Stage */}
            <div className="flex justify-center items-center py-4 bg-ds-surface rounded-2xl border border-ds-secondary/15 relative min-h-[350px]">
              {!chartAvailable ? (
                <div className="text-center text-ds-on-surface-variant p-6">
                  <p className="text-base font-serif text-ds-primary mb-2">{l.missingChart}</p>
                  <p className="text-xs">{l.missingChartDesc}</p>
                </div>
              ) : validationError ? (
                <div className="text-center text-ds-error-crimson p-6">
                  <p className="text-base font-serif font-bold mb-2 text-red-500">Chart Construction Error</p>
                  <p className="text-xs font-mono bg-ds-surface-container p-3 rounded-lg border border-red-500/20">{validationError}</p>
                </div>
              ) : birthChartStyle === 'South' ? (
                renderSouthIndianChart(currentChart, activeTab === 'D1' ? 'RASI CHART' : 'NAVAMSA')
              ) : (
                renderEastIndianChart(currentChart, activeTab === 'D1' ? 'RASI CHART' : 'NAVAMSA')
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mx-6 mb-5 border-t border-ds-secondary/15 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-ds-on-surface-variant">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-ds-secondary font-mono">{l.legendTitle}</span>
            <span>{l.legendDesc}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-ds-primary"></span>
              <span>{l.lagnaLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full border border-ds-error-crimson"></span>
              <span>{l.retroLabel}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
    </div>
  );
};

export const RASI_TRANSLATIONS: Record<string, { en: string; sanskrit: string; hi: string; te: string }> = {
  "Aries": { en: "Aries", sanskrit: "Mesha", hi: "मेष", te: "మేషం" },
  "Taurus": { en: "Taurus", sanskrit: "Vrishabha", hi: "वृषभ", te: "వృషభం" },
  "Gemini": { en: "Gemini", sanskrit: "Mithuna", hi: "मिथुन", te: "మిథునం" },
  "Cancer": { en: "Cancer", sanskrit: "Karka", hi: "कर्क", te: "కర్కాటకం" },
  "Leo": { en: "Leo", sanskrit: "Simha", hi: "सिंह", te: "సింహం" },
  "Virgo": { en: "Virgo", sanskrit: "Kanya", hi: "कन्या", te: "కన్య" },
  "Libra": { en: "Libra", sanskrit: "Tula", hi: "तुला", te: "తుల" },
  "Scorpio": { en: "Scorpio", sanskrit: "Vrischika", hi: "वृश्चिक", te: "వృశ్చికం" },
  "Sagittarius": { en: "Sagittarius", sanskrit: "Dhanus", hi: "धनु", te: "ధనస్సు" },
  "Capricorn": { en: "Capricorn", sanskrit: "Makara", hi: "मकर", te: "మకరం" },
  "Aquarius": { en: "Aquarius", sanskrit: "Kumbha", hi: "कुंभ", te: "కుంభం" },
  "Pisces": { en: "Pisces", sanskrit: "Meena", hi: "मीन", te: "మీనం" }
};

export const NAKSHATRA_TRANSLATIONS: Record<string, { hi: string; te: string }> = {
  "Ashwini": { hi: "अश्विनी", te: "అశ్విని" },
  "Bharani": { hi: "भरणी", te: "భరణి" },
  "Krittika": { hi: "कृत्तिका", te: "కృత్తిక" },
  "Rohini": { hi: "రోहिणी", te: "రోహిణి" },
  "Mrigashira": { hi: "मृगशिरा", te: "మృగశిర" },
  "Ardra": { hi: "आर्द्रा", te: "ఆరుద్ర" },
  "Punarvasu": { hi: "पुनर्वसु", te: "పునర్వసు" },
  "Pushya": { hi: "पुष्य", te: "పుష్యమి" },
  "Ashlesha": { hi: "अश्लेषा", te: "ఆశ్లేష" },
  "Magha": { hi: "मघा", te: "మఖ" },
  "Purva Phalguni": { hi: "पूर्वाफाल्गुनी", te: "పుబ్బ" },
  "Uttara Phalguni": { hi: "उत्तराफाल्गुनी", te: "ఉత్తర" },
  "Hasta": { hi: "हस्त", te: "హస్త" },
  "Chitra": { hi: "चित्रा", te: "చిత్త" },
  "Swati": { hi: "स्वाती", te: "స్వాతి" },
  "Vishakha": { hi: "विशाखा", te: "విశాఖ" },
  "Anuradha": { hi: "अनुराधा", te: "అనూరాధ" },
  "Jyeshtha": { hi: "ज्येष्ठा", te: "జ్యేష్ఠ" },
  "Mula": { hi: "मूल", te: "మూల" },
  "Purva Ashadha": { hi: "पूर्वाषाढ़ा", te: "పూర్వాషాఢ" },
  "Uttara Ashadha": { hi: "उत्तराषाढ़ा", te: "ఉత్తరాషాఢ" },
  "Shravana": { hi: "श्रवण", te: "శ్రవణం" },
  "Dhanishta": { hi: "धनिष्ठा", te: "ధనిష్ఠ" },
  "Shatabhisha": { hi: "शतभिषा", te: "శతభిషం" },
  "Purva Bhadrapada": { hi: "पूर्वाभाद्रपद", te: "పూర్వాభాద్ర" },
  "Uttara Bhadrapada": { hi: "उत्तराभाद्रपद", te: "ఉత్తరాభాద్ర" },
  "Revati": { hi: "रेवती", te: "రేవతి" }
};

export function getNakshatraTranslation(name: string, lang: 'en' | 'hi' | 'te') {
  if (!name) return { en: '', hi: '', te: '' };
  const clean = name.trim().replace(/m$/, '');
  const match = NAKSHATRA_TRANSLATIONS[clean] || NAKSHATRA_TRANSLATIONS[name.trim()] || Object.entries(NAKSHATRA_TRANSLATIONS).find(([k]) => k.toLowerCase() === clean.toLowerCase() || k.toLowerCase() === name.trim().toLowerCase())?.[1];
  return {
    en: name,
    hi: match?.hi || name,
    te: match?.te || name
  };
}

const chartLabels = {
  en: {
    todaysChart: "TODAY'S CHART",
    birthNatalChart: "BIRTH NATAL CHART",
    date: "Date",
    time: "Time",
    location: "Location",
    selectedLagna: "Selected Lagna Sign",
    legendTitle: "Numbers (1–12):",
    legendDesc: "Zodiac signs (1=Aries ... 12=Meena)",
    lagnaLabel: "Lagna (L)",
    retroLabel: "Retrograde (RX)",
    missingChart: "Divisional Chart Missing",
    missingChartDesc: "The requested varga chart is not present in the API response data.",
    loadingTransit: "Calculating Today's Astrological Transit...",
    northIndian: "NORTH INDIAN",
    southIndian: "SOUTH INDIAN",
    eastIndian: "EAST INDIAN",
    d1: "D-1 RASI",
    d9: "D-9 NAVAMSA",
    d10: "D-10 DASHAMSHA",
    unknown: "Unknown"
  },
  hi: {
    todaysChart: "आज की कुंडली",
    birthNatalChart: "जन्म कुंडली",
    date: "दिनांक",
    time: "समय",
    location: "स्थान",
    selectedLagna: "चयनित लग्न राशि",
    legendTitle: "संख्याएँ (1–12):",
    legendDesc: "राशि चक्र (1=मेष ... 12=मीन)",
    lagnaLabel: "लग्न (L)",
    retroLabel: "वक्र ग्रह (RX)",
    missingChart: "विभागीय कुंडली अनुपलब्ध",
    missingChartDesc: "अनुरोधित वर्ग कुंडली एपीआई प्रतिक्रिया में मौजूद नहीं है।",
    loadingTransit: "आज के ज्योतिषीय पारगमन की गणना हो रही है...",
    northIndian: "उत्तर भारतीय",
    southIndian: "दक्षिण भारतीय",
    eastIndian: "पूर्वी भारतीय",
    d1: "D-1 राशि",
    d9: "D-9 नवांश",
    d10: "D-10 दशांश",
    unknown: "अज्ञात"
  },
  te: {
    todaysChart: "నేటి కుండలి",
    birthNatalChart: "జన్మ కుండలి",
    date: "తేదీ",
    time: "సమయం",
    location: "స్థానము",
    selectedLagna: "ఎంచుకున్న లగ్న రాశి",
    legendTitle: "సంఖ్యలు (1–12):",
    legendDesc: "రాశులు (1=మేషం ... 12=మీనం)",
    lagnaLabel: "లగ్నం (L)",
    retroLabel: "వక్ర గ్రహం (RX)",
    missingChart: "వర్గ కుండలి లేదు",
    missingChartDesc: "అడిగిన వర్గ కుండలి వివరాలు లభించలేదు.",
    loadingTransit: "నేటి గ్రహాల సంచారాన్ని లెక్కిస్తోంది...",
    northIndian: "ఉత్తర భారత పద్ధతి",
    southIndian: "దక్షిణ భారత పద్ధతి",
    eastIndian: "తూర్పు భారత పద్ధతి",
    d1: "D-1 రాశి",
    d9: "D-9 నవాంశ",
    d10: "D-10 దశాంస",
    unknown: "తెలియదు"
  }
};
