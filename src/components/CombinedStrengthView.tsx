import React from 'react';
import { PlanetaryStrengthView } from './PlanetaryStrengthView';

interface CombinedStrengthViewProps {
  horoscopeData: any;
  language?: 'en' | 'hi' | 'te';
}

export const CombinedStrengthView: React.FC<CombinedStrengthViewProps> = ({
  horoscopeData,
  language = 'en'
}) => {
  return (
    <div className="w-full animate-fade-in">
      {/* Planetary Strength Profile */}
      <PlanetaryStrengthView horoscopeData={horoscopeData} language={language} />
    </div>
  );
};
