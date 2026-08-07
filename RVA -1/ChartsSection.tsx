import React from 'react';
import { NorthIndianChart } from './NorthIndianChart';

export const ChartsSection: React.FC = () => {
  const natalInfo = {
    title: 'D1 - Natal Chart',
    name: 'test',
    date: '2026/08/4',
    time: '15:53:40',
    lat: '17:23',
    long: '78:29',
    tz: '5.5',
  };

  const progressionInfo = {
    title: 'Progression Chart',
    name: 'Progression',
    date: '2026/08/4',
    time: '15:53:40',
    lat: '17:23',
    long: '78:29',
    tz: '5.5',
  };

  const transitInfo = {
    title: 'Transit Chart',
    name: 'Transit',
    date: '2026/08/4',
    time: '15:53:40',
    lat: '17:23',
    long: '78:29',
    tz: '5.5',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50/50 border-b border-gray-200">
      <NorthIndianChart info={natalInfo} type="natal" />
      <NorthIndianChart info={progressionInfo} type="progression" />
      <NorthIndianChart info={transitInfo} type="transit" />
    </div>
  );
};
