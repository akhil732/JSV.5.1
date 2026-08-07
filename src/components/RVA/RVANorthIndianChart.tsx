import React, { useState } from 'react';
import { ChartInfo } from '../../types/rva';

interface Props {
  info: ChartInfo;
  type: 'natal' | 'progression' | 'transit';
}

export const RVANorthIndianChart: React.FC<Props> = ({ info, type }) => {
  const [selectedDivision, setSelectedDivision] = useState('D1 - Natal Chart');
  const [progressionYear, setProgressionYear] = useState(2026);

  return (
    <div className="bg-ds-surface border border-ds-secondary/15 rounded-2xl p-3 sm:p-4 flex flex-col h-full shadow-sm hover:shadow-md transition-all">
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-ds-secondary/10 pb-2 mb-2 px-1 text-xs font-semibold">
        {type === 'natal' && (
          <div className="flex items-center justify-between w-full">
            <span className="font-serif font-bold text-ds-secondary text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-ds-primary" />
              Natal Root Chart
            </span>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="border border-ds-secondary/20 rounded-lg px-2 py-1 text-xs font-medium bg-ds-surface-container text-ds-secondary focus:outline-none focus:ring-1 focus:ring-ds-primary"
            >
              <option>D1 - Natal Chart</option>
              <option>D9 - Navamsha Chart</option>
              <option>D10 - Dasamsha Chart</option>
              <option>D60 - Shashtiamsha Chart</option>
            </select>
          </div>
        )}

        {type === 'progression' && (
          <div className="flex flex-col w-full space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-ds-secondary text-sm flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-ds-tertiary" />
                Secondary Progression
              </span>
              <div className="flex items-center space-x-1.5 bg-ds-surface-container border border-ds-secondary/15 rounded-lg px-2 py-0.5">
                <button
                  onClick={() => setProgressionYear((y) => y - 1)}
                  className="w-5 h-5 border border-ds-secondary/20 rounded flex items-center justify-center font-bold text-ds-secondary hover:bg-ds-primary/10 transition-colors"
                >
                  -
                </button>
                <span className="font-mono text-xs font-bold text-ds-primary px-1">
                  {progressionYear}
                </span>
                <button
                  onClick={() => setProgressionYear((y) => y + 1)}
                  className="w-5 h-5 border border-ds-secondary/20 rounded flex items-center justify-center font-bold text-ds-secondary hover:bg-ds-primary/10 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-[10px] text-ds-on-surface-variant flex justify-between font-mono">
              <span>Date: 04-08-{progressionYear}</span>
              <span>1 Day = 1 Year Rate</span>
            </div>
          </div>
        )}

        {type === 'transit' && (
          <div className="flex items-center justify-between w-full">
            <span className="font-serif font-bold text-ds-secondary text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-ds-success-green" />
              Gochara Transit Chart
            </span>
            <span className="text-[10px] font-mono font-bold bg-ds-success-green/10 text-ds-success-green px-2 py-0.5 rounded-full">
              Live Positions
            </span>
          </div>
        )}
      </div>

      {/* SVG North Indian Diamond Chart Canvas */}
      <div className="relative w-full aspect-square bg-[#FDFBF5] dark:bg-[#121824] border border-ds-tertiary/40 rounded-xl overflow-hidden select-none p-1">
        <svg viewBox="0 0 300 300" className="w-full h-full">
          {/* Outer Border Box */}
          <rect x="0" y="0" width="300" height="300" fill="none" stroke="var(--ds-tertiary, #D4AF37)" strokeWidth="1.5" />

          {/* Diagonals */}
          <line x1="0" y1="0" x2="300" y2="300" stroke="var(--ds-tertiary, #D4AF37)" strokeWidth="1" strokeOpacity="0.7" />
          <line x1="300" y1="0" x2="0" y2="300" stroke="var(--ds-tertiary, #D4AF37)" strokeWidth="1" strokeOpacity="0.7" />

          {/* Inner Diamond connecting midpoints */}
          <polygon points="150,0 0,150 150,300 300,150" fill="none" stroke="var(--ds-tertiary, #D4AF37)" strokeWidth="1" strokeOpacity="0.8" />

          {/* House Text Overlay Content */}
          <g className="text-[8.5px] font-medium fill-ds-secondary dark:fill-ds-on-surface">
            {/* House 2 (Top Left) */}
            <text x="10" y="22" fill="#C0392B" className="font-bold">Ve 03:27:25</text>
            <text x="10" y="34" fill="#E67E22">IX 10:21:55</text>

            <text x="80" y="22" fill="#27AE60" className="font-bold">Ke 06:37:32</text>
            <text x="80" y="34" fill="#2C3E50">IX 10:21:55</text>

            {/* House 1 (Lagna Center Top) */}
            <text x="108" y="22" fill="#2C3E50" className="font-bold">VIII 06:42:00</text>
            <text x="108" y="34" fill="#D4AF37" className="font-bold">Ju 13:34:59</text>
            <text x="108" y="46" fill="#E67E22" className="font-bold">Su 17:56:08</text>

            <text x="215" y="22" fill="#D4AF37" className="font-bold">Ju 13:34:59</text>
            <text x="215" y="34" fill="#E67E22" className="font-bold">Su 17:56:08</text>
            <text x="215" y="46" fill="#2980B9" className="font-bold">Me 28:42:33</text>

            {/* Left Top Triangle (House 11) */}
            <text x="10" y="82" fill="#564337">XI 14:07:14</text>

            {/* House 12 */}
            <text x="10" y="125" fill="#C0392B" className="font-extrabold">XII 10:36:11</text>

            {/* Right Top Triangle (House 7) */}
            <text x="215" y="82" fill="#C0392B">Ma 01:14:35</text>
            <text x="215" y="94" fill="#2C3E50">VII 05:30:04</text>
            <text x="215" y="106" fill="#2980B9">Me 28:42:33</text>

            {/* House 10 */}
            <text x="250" y="125" fill="#8E44AD">Ur 10:58:45</text>

            {/* House 3 & Lagna Bottom Left */}
            <text x="10" y="165" fill="#E67E22" className="font-extrabold">I 05:30:04</text>
            <text x="25" y="210" fill="#2C3E50">Pl [R] 09:57:26</text>
            <text x="25" y="222" fill="#2C3E50">II 06:42:00</text>

            {/* House 4 Bottom Center */}
            <text x="80" y="280" fill="#2C3E50">III 10:21:55</text>
            <text x="80" y="292" fill="#27AE60">Ra 06:37:32</text>

            <text x="160" y="280" fill="#2980B9">Mo 26:42:48</text>
            <text x="160" y="292" fill="#8E44AD" className="font-bold">Sa [R] 20:32:55</text>

            {/* House 6 & 8 Right Bottom */}
            <text x="250" y="165" fill="#C0392B" className="font-extrabold">VI 10:36:11</text>
            <text x="250" y="177" fill="#8E44AD">Ur 10:58:45</text>

            <text x="250" y="220" fill="#564337">V 14:07:14</text>
            <text x="215" y="280" fill="#2C3E50">VI 10:36:11</text>
            <text x="215" y="292" fill="#8E44AD">Ur 10:58:45</text>
          </g>
        </svg>

        {/* Center Details Overlay Badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 bg-ds-surface-variant/90 dark:bg-ds-surface-container/95 backdrop-blur-xs border border-ds-tertiary/40 rounded-xl p-2 flex flex-col justify-center text-[10px] leading-relaxed font-sans text-ds-secondary dark:text-ds-on-surface shadow-xs text-center">
          <div className="font-serif font-bold text-ds-primary truncate border-b border-ds-secondary/10 pb-0.5 mb-0.5">
            {info.name}
          </div>
          <div className="truncate font-mono text-[9px] text-ds-on-surface-variant">
            {info.date}
          </div>
          <div className="truncate font-mono text-[9px] text-ds-on-surface-variant">
            {info.time}
          </div>
          <div className="truncate font-mono text-[9px] text-ds-on-surface-variant">
            Lat: {info.lat} | Long: {info.long}
          </div>
        </div>
      </div>
    </div>
  );
};
