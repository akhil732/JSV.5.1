import React from 'react';
import { ChartInfo } from '../types';

interface Props {
  info: ChartInfo;
  type: 'natal' | 'progression' | 'transit';
}

export const NorthIndianChart: React.FC<Props> = ({ info, type }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-md p-2 flex flex-col h-full shadow-xs">
      {/* Header Selector & Controls */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-2 px-1 text-xs font-semibold text-gray-800">
        {type === 'natal' && (
          <div className="flex items-center space-x-1">
            <select className="border border-gray-300 rounded px-2 py-0.5 text-xs font-semibold bg-white text-gray-800 focus:outline-hidden">
              <option>D1 - Natal Chart</option>
              <option>D9 - Navamsha Chart</option>
              <option>D10 - Dasamsha Chart</option>
            </select>
          </div>
        )}

        {type === 'progression' && (
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-gray-900 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Progression Chart
              </span>
              <div className="flex items-center space-x-1">
                <button className="w-4 h-4 border rounded text-center leading-none text-gray-600 hover:bg-gray-100">
                  -
                </button>
                <span className="font-mono text-gray-700 px-1">2013</span>
                <button className="w-4 h-4 border rounded text-center leading-none text-gray-600 hover:bg-gray-100">
                  +
                </button>
              </div>
            </div>
            <div className="text-[9px] text-gray-500 flex justify-between mt-0.5">
              <span>DATE - 04-08-2026</span>
              <span>AGE: 0</span>
            </div>
          </div>
        )}

        {type === 'transit' && (
          <div className="flex items-center space-x-1">
            <select className="border border-gray-300 rounded px-2 py-0.5 text-xs font-semibold bg-white text-gray-800 focus:outline-hidden">
              <option>Transit Chart</option>
              <option>Progression</option>
            </select>
          </div>
        )}
      </div>

      {/* SVG North Indian Diamond Chart Container */}
      <div className="relative w-full aspect-square bg-[#FFFDF7] border border-amber-800/40 rounded overflow-hidden select-none">
        <svg viewBox="0 0 300 300" className="w-full h-full text-amber-800">
          {/* Outer Border Box */}
          <rect x="0" y="0" width="300" height="300" fill="none" stroke="#854D0E" strokeWidth="1.5" />

          {/* Diagonals */}
          <line x1="0" y1="0" x2="300" y2="300" stroke="#854D0E" strokeWidth="1" />
          <line x1="300" y1="0" x2="0" y2="300" stroke="#854D0E" strokeWidth="1" />

          {/* Inner Diamond connecting midpoints */}
          <polygon points="150,0 0,150 150,300 300,150" fill="none" stroke="#854D0E" strokeWidth="1" />

          {/* House Text Content Overlays */}
          {/* Top Triangles (House 12 / 2) */}
          <g className="text-[8.5px] font-medium fill-amber-700">
            {/* Top Left House 2 */}
            <text x="10" y="22" fill="#B45309" className="font-semibold">Ve 03:27:25</text>
            <text x="10" y="34" fill="#B45309">IX 10:21:55</text>

            <text x="80" y="22" fill="#B45309" className="font-semibold">Ke 06:37:32</text>
            <text x="80" y="34" fill="#B45309">IX 10:21:55</text>

            {/* Top Center Diamond House 1 */}
            <text x="108" y="22" fill="#B45309" className="font-semibold">VIII 06:42:00</text>
            <text x="108" y="34" fill="#B45309">Ju 13:34:59</text>
            <text x="108" y="46" fill="#B45309">Su 17:56:08</text>

            <text x="215" y="22" fill="#B45309" className="font-semibold">Ju 13:34:59</text>
            <text x="215" y="34" fill="#B45309">Su 17:56:08</text>
            <text x="215" y="46" fill="#B45309">Me 28:42:33</text>

            {/* Left Top Triangle */}
            <text x="10" y="82" fill="#B45309">XI 14:07:14</text>

            {/* Left Center Diamond House 12 */}
            <text x="10" y="125" fill="#B45309" className="font-bold">XII 10:36:11</text>

            {/* Right Top Triangle */}
            <text x="215" y="82" fill="#B45309">Ma 01:14:35</text>
            <text x="215" y="94" fill="#B45309">VII 05:30:04</text>
            <text x="215" y="106" fill="#B45309">Me 28:42:33</text>

            {/* Right Center House 10 */}
            <text x="250" y="125" fill="#B45309">Ur 10:58:45</text>

            {/* Bottom Left House 3 */}
            <text x="10" y="165" fill="#B45309" className="font-bold">I 05:30:04</text>
            <text x="25" y="210" fill="#B45309">Pl [R] 09:57:26</text>
            <text x="25" y="222" fill="#B45309">II 06:42:00</text>

            {/* Bottom Center Diamond House 4 */}
            <text x="80" y="280" fill="#B45309">III 10:21:55</text>
            <text x="80" y="292" fill="#B45309">Ra 06:37:32</text>

            <text x="160" y="280" fill="#B45309">Mo 26:42:48</text>
            <text x="160" y="292" fill="#B45309">Sa [R] 20:32:55</text>

            {/* Right Bottom House 8 */}
            <text x="250" y="165" fill="#B45309" className="font-bold">VI 10:36:11</text>
            <text x="250" y="177" fill="#B45309">Ur 10:58:45</text>

            <text x="250" y="220" fill="#B45309">V 14:07:14</text>
            <text x="215" y="280" fill="#B45309">VI 10:36:11</text>
            <text x="215" y="292" fill="#B45309">Ur 10:58:45</text>
          </g>
        </svg>

        {/* Center Yellowish Details Box */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-[#FEF08A]/70 backdrop-blur-xs border border-amber-300 rounded p-1.5 flex flex-col justify-center text-[9.5px] leading-snug font-sans text-amber-950 shadow-xs">
          <div className="truncate">
            <span className="font-semibold">Name :</span> {info.name}
          </div>
          <div className="truncate">
            <span className="font-semibold">Date :</span> {info.date}
          </div>
          <div className="truncate">
            <span className="font-semibold">Time :</span> {info.time}
          </div>
          <div className="truncate">
            <span className="font-semibold">Lat :</span> {info.lat}
          </div>
          <div className="truncate">
            <span className="font-semibold">Long :</span> {info.long}
          </div>
          <div className="truncate">
            <span className="font-semibold">TZ :</span> {info.tz}
          </div>
        </div>
      </div>
    </div>
  );
};
