import React from 'react';
import { ChevronDown } from 'lucide-react';
import { getPlanetAbbr, formatPlanetDisplay, getPlanetColor } from '../lib/planetAbbreviations';

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

const SOUTH_INDIAN_LAYOUTS: Record<number, { col: number; row: number; name: string; sanskrit: string; rashiLabel: { x: number; y: number }; center: { x: number; y: number } }> = {
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

const EAST_INDIAN_LAYOUTS: Record<number, { type: 'triangle' | 'rect'; points?: string; x?: number; y?: number; width?: number; height?: number; name: string; sanskrit: string; label: { x: number; y: number }; center: { x: number; y: number }; }> = {
  1: { type: 'rect', x: 133.33, y: 0, width: 133.34, height: 133.33, name: "Aries", sanskrit: "Mesha", label: { x: 200, y: 22 }, center: { x: 200, y: 70 } },
  2: { type: 'triangle', points: "0,0 133.33,0 133.33,133.33", name: "Taurus", sanskrit: "Vrishabha", label: { x: 88, y: 22 }, center: { x: 88, y: 65 } },
  3: { type: 'triangle', points: "0,0 0,133.33 133.33,133.33", name: "Gemini", sanskrit: "Mithuna", label: { x: 35, y: 115 }, center: { x: 65, y: 88 } },
  4: { type: 'rect', x: 0, y: 133.33, width: 133.33, height: 133.34, name: "Cancer", sanskrit: "Karka", label: { x: 66.66, y: 155 }, center: { x: 66.66, y: 205 } },
  5: { type: 'triangle', points: "0,266.67 0,400 133.33,266.67", name: "Leo", sanskrit: "Simha", label: { x: 35, y: 285 }, center: { x: 65, y: 311 } },
  6: { type: 'triangle', points: "0,400 133.33,400 133.33,266.67", name: "Virgo", sanskrit: "Kanya", label: { x: 88, y: 378 }, center: { x: 88, y: 335 } },
  7: { type: 'rect', x: 133.33, y: 266.67, width: 133.34, height: 133.33, name: "Libra", sanskrit: "Tula", label: { x: 200, y: 378 }, center: { x: 200, y: 320 } },
  8: { type: 'triangle', points: "266.67,266.67 266.67,400 400,400", name: "Scorpio", sanskrit: "Vrischika", label: { x: 312, y: 378 }, center: { x: 312, y: 335 } },
  9: { type: 'triangle', points: "266.67,266.67 400,266.67 400,400", name: "Sagittarius", sanskrit: "Dhanus", label: { x: 365, y: 285 }, center: { x: 335, y: 311 } },
  10: { type: 'rect', x: 266.67, y: 133.33, width: 133.33, height: 133.34, name: "Capricorn", sanskrit: "Makara", label: { x: 333.33, y: 155 }, center: { x: 333.33, y: 205 } },
  11: { type: 'triangle', points: "266.67,133.33 400,0 400,133.33", name: "Aquarius", sanskrit: "Kumbha", label: { x: 365, y: 115 }, center: { x: 335, y: 88 } },
  12: { type: 'triangle', points: "266.67,0 266.67,133.33 400,0", name: "Pisces", sanskrit: "Meena", label: { x: 312, y: 22 }, center: { x: 312, y: 65 } }
};

const getSignAbbreviation = (signIndex: number) => {
  const abbreviations: Record<number, string> = {
    1: "Ari", 2: "Tau", 3: "Gem", 4: "Can", 5: "Leo", 6: "Vir",
    7: "Lib", 8: "Sco", 9: "Sag", 10: "Cap", 11: "Aqu", 12: "Pis"
  };
  return abbreviations[signIndex] || "";
};

const getPlanetOffsets = (count: number) => {
  if (count === 1) return [{ dx: 0, dy: 0 }];
  if (count === 2) return [{ dx: -15, dy: 0 }, { dx: 15, dy: 0 }];
  if (count === 3) return [{ dx: 0, dy: -12 }, { dx: -16, dy: 10 }, { dx: 16, dy: 10 }];
  if (count === 4) return [{ dx: -20, dy: -10 }, { dx: 20, dy: -10 }, { dx: -20, dy: 14 }, { dx: 20, dy: 14 }];
  if (count === 5) return [{ dx: -22, dy: -12 }, { dx: 22, dy: -12 }, { dx: 0, dy: 2 }, { dx: -22, dy: 18 }, { dx: 22, dy: 18 }];
  return [
    { dx: -22, dy: -16 }, { dx: 22, dy: -16 },
    { dx: -22, dy: 2 }, { dx: 22, dy: 2 },
    { dx: -22, dy: 20 }, { dx: 22, dy: 20 },
    { dx: 0, dy: -30 }
  ];
};

interface LagnaChartCardProps {
  horoscope: any;
  cardTitle: string;
  borderColor: 'blue' | 'purple';
  chartStyle: 'south-indian' | 'east-indian';
  onChartStyleChange: (style: 'south-indian' | 'east-indian') => void;
}

const LagnaChartCard: React.FC<LagnaChartCardProps> = ({
  horoscope,
  cardTitle,
  borderColor,
  chartStyle,
  onChartStyleChange,
}) => {
  const borderClasses = borderColor === 'blue' ? 'border-blue-500/50' : 'border-purple-500/50';

  const chartData = horoscope?.divisional_charts?.['D-1_rasi'] || null;
  const retrogradePlanets: string[] = horoscope?.retrograde_planets || [];

  const ascSignName = chartData?.Ascendant?.sign;
  const ascSignIndex = SIGN_MAP[ascSignName]?.number || 1;

  // Process planets
  const planetsInSigns: Record<number, string[]> = {};
  for (let s = 1; s <= 12; s++) planetsInSigns[s] = [];

  if (ascSignIndex >= 1 && ascSignIndex <= 12) {
    planetsInSigns[ascSignIndex].push("L");
  }

  const grahas = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  if (chartData) {
    grahas.forEach(g => {
      const gData = chartData[g];
      if (gData) {
        const signNum = SIGN_MAP[gData.sign]?.number || 1;
        planetsInSigns[signNum].push(PLANETS_SHORT[g] || g.substring(0, 2));
      }
    });
  }

  const renderPlanetChips = (planets: string[], cx: number, cy: number) => {
    const offsets = getPlanetOffsets(planets.length);
    return planets.map((p, idx) => {
      const isLagna = p === 'L' || p === 'Asc' || p === 'Lg';
      const isMercury = p === 'Me' || p === 'Mercury';
      const isRetro = !isLagna && !isMercury && retrogradePlanets.includes(
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
            fill={isLagna ? "#F5A623" : "#131A2B"}
            stroke={isRetro ? "#FF4444" : isLagna ? "#FFD700" : planetColor}
            strokeWidth={isLagna || isRetro ? "2" : "1.5"}
          />
          <text
            x={chipWidth / 2}
            y="13"
            textAnchor="middle"
            fill={isLagna ? "#0A0E17" : isRetro ? "#FF8F8F" : planetColor}
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

  const renderSouthIndianChart = () => (
    <svg viewBox="0 0 400 400" className="w-full h-auto mx-auto border border-[#1E2433] rounded-lg bg-[#0F1322]">
      <rect x="100" y="100" width="200" height="200" fill="#10141F" stroke="#1E2433" strokeWidth="1.5" />
      <text x="200" y="190" textAnchor="middle" fill="#F5A623" fontSize="16" fontWeight="bold" fontFamily="serif">D-1</text>
      <text x="200" y="215" textAnchor="middle" fill="#8FA8FF" fontSize="12" fontFamily='"Noto Sans Telugu", sans-serif'>Lagna: {ascSignName}</text>
      
      {Object.entries(SOUTH_INDIAN_LAYOUTS).map(([signStr, layout]) => {
        const signIndex = parseInt(signStr);
        const planets = planetsInSigns[signIndex] || [];
        const isLagnaSign = ascSignIndex === signIndex;
        const x = layout.col * 100;
        const y = layout.row * 100;

        return (
          <g key={signIndex} className="group">
            <rect x={x} y={y} width="100" height="100" fill={isLagnaSign ? "rgba(245, 166, 35, 0.12)" : "#10141F"} stroke={isLagnaSign ? "#F5A623" : "#1E2433"} strokeWidth={isLagnaSign ? "2" : "1.5"} className="hover:fill-[#141A2B] transition-colors" />
            {isLagnaSign && <line x1={x} y1={y} x2={x + 35} y2={y + 35} stroke="#F5A623" strokeWidth="1.5" />}
            <text x={layout.rashiLabel.x} y={layout.rashiLabel.y} fill={isLagnaSign ? "#F5A623" : "#D1D5DB"} fontSize="10" fontWeight="bold" fontFamily='"Noto Sans Telugu", sans-serif'>{layout.sanskrit.substring(0, 3)} ({signIndex})</text>
            {renderPlanetChips(planets, layout.center.x, layout.center.y)}
          </g>
        );
      })}
    </svg>
  );

  const renderEastIndianChart = () => (
    <svg viewBox="0 0 400 400" className="w-full h-auto mx-auto border border-[#1E2433] rounded-lg bg-[#0F1322]">
      {Object.entries(EAST_INDIAN_LAYOUTS).map(([signStr, layout]) => {
        const signIndex = parseInt(signStr);
        const planets = planetsInSigns[signIndex] || [];
        const isLagnaSign = ascSignIndex === signIndex;
        const houseNum = ((signIndex - ascSignIndex + 12) % 12) + 1;

        return (
          <g key={signIndex} className="group">
            {layout.type === 'rect' ? (
              <rect x={layout.x} y={layout.y} width={layout.width} height={layout.height} fill={isLagnaSign ? "rgba(245, 166, 35, 0.12)" : "#10141F"} stroke={isLagnaSign ? "#F5A623" : "#1E2433"} strokeWidth={isLagnaSign ? "2" : "1.5"} className="hover:fill-[#141A2B] transition-colors" />
            ) : (
              <polygon points={layout.points} fill={isLagnaSign ? "rgba(245, 166, 35, 0.12)" : "#10141F"} stroke={isLagnaSign ? "#F5A623" : "#1E2433"} strokeWidth={isLagnaSign ? "2" : "1.5"} className="hover:fill-[#141A2B] transition-colors" />
            )}
            <text x={layout.label.x} y={layout.label.y} textAnchor="middle" fill={isLagnaSign ? "#F5A623" : "#D1D5DB"} fontSize="10" fontWeight="bold" fontFamily='"Noto Sans Telugu", sans-serif'>{getSignAbbreviation(signIndex)} (H{houseNum})</text>
            {renderPlanetChips(planets, layout.center.x, layout.center.y)}
          </g>
        );
      })}
      <rect x="133.33" y="133.33" width="133.34" height="133.34" fill="#10141F" stroke="#1E2433" strokeWidth="1.5" />
      <text x="200" y="190" textAnchor="middle" fill="#F5A623" fontSize="16" fontWeight="bold" fontFamily="serif">D-1</text>
      <text x="200" y="215" textAnchor="middle" fill="#8FA8FF" fontSize="12" fontFamily='"Noto Sans Telugu", sans-serif'>Lagna: {ascSignName}</text>
    </svg>
  );

  return (
    <div className={`bg-[#10141F] rounded-2xl border-2 ${borderClasses} p-5 sm:p-6 shadow-sm overflow-hidden flex flex-col`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#1E2433] pb-4">
        <h3 className="text-lg font-serif text-[#F5F5F7] font-semibold tracking-wide uppercase">
          {cardTitle}
        </h3>
        
        <div className="flex bg-[#0A0E17] rounded-full p-1 border border-[#1E2433] shrink-0 self-start sm:self-auto">
          <button
            onClick={() => onChartStyleChange('south-indian')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              chartStyle === 'south-indian'
                ? 'bg-[#F5A623] text-white shadow-sm'
                : 'text-[#B0B8C6] hover:text-white'
            }`}
          >
            South Indian
          </button>
          <button
            onClick={() => onChartStyleChange('east-indian')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              chartStyle === 'east-indian'
                ? 'bg-[#F5A623] text-white shadow-sm'
                : 'text-[#B0B8C6] hover:text-white'
            }`}
          >
            East Indian
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-2">
        {chartData ? (
          chartStyle === 'south-indian' ? renderSouthIndianChart() : renderEastIndianChart()
        ) : (
          <div className="text-[#9CA3AF] text-sm">Chart data unavailable</div>
        )}
      </div>
    </div>
  );
};

export default LagnaChartCard;
