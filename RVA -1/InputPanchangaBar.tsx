import React, { useState } from 'react';
import { Calendar, Clock, Languages, Settings, Share2, Edit2, RotateCcw, X, MapPin } from 'lucide-react';
import { PANCHANGA_DATA } from '../data/astroData';

export const InputPanchangaBar: React.FC = () => {
  const [name, setName] = useState('test');
  const [date, setDate] = useState('04-08-2026');
  const [time, setTime] = useState('15:53:40');
  const [location, setLocation] = useState('Hyderabad, Telangana, India');

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-2.5">
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Name input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-2.5 py-1 text-xs border border-gray-300 rounded bg-white w-28 md:w-36 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
        />

        {/* Date Picker Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pl-2.5 pr-7 py-1 text-xs border border-gray-300 rounded bg-white w-28 md:w-32 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
          <Calendar className="w-3.5 h-3.5 text-gray-500 absolute right-2 pointer-events-none" />
        </div>

        {/* Time Picker Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="pl-2.5 pr-7 py-1 text-xs border border-gray-300 rounded bg-white w-24 md:w-28 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
          <Clock className="w-3.5 h-3.5 text-gray-500 absolute right-2 pointer-events-none" />
        </div>

        {/* Location Input with Indian Flag icon */}
        <div className="relative flex items-center flex-1 min-w-[200px] max-w-xs">
          <div className="absolute left-2.5 flex items-center space-x-1 pointer-events-none">
            <span className="text-xs">🇮🇳</span>
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-7 pr-6 py-1 text-xs border border-gray-300 rounded bg-white w-full focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-800"
          />
          {location && (
            <button
              onClick={() => setLocation('')}
              className="absolute right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Action Buttons Icon Group */}
        <div className="flex items-center space-x-1">
          <button title="Translate" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-gray-200">
            <Languages className="w-3.5 h-3.5" />
          </button>
          <button title="Settings" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-gray-200">
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button title="Share" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-gray-200">
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button title="Edit" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-gray-200">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button title="Reset" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-gray-200">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Submit Primary Button */}
        <button className="px-4 py-1 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded shadow-xs transition-colors">
          Submit
        </button>
      </div>

      {/* Panchanga Metadata Pills Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 overflow-x-auto text-[11px] text-gray-700">
        {PANCHANGA_DATA.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full whitespace-nowrap"
          >
            <span className="text-xs">{item.icon}</span>
            <span className="font-medium text-gray-800">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
