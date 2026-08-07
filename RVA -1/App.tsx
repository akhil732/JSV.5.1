import React from 'react';
import { Header } from './components/Header';
import { InputPanchangaBar } from './components/InputPanchangaBar';
import { ChartsSection } from './components/ChartsSection';
import { DashaStrengthBar } from './components/DashaStrengthBar';
import { PlanetsHouseAnalysis } from './components/PlanetsHouseAnalysis';
import { AshtakavargaChart } from './components/AshtakavargaChart';
import { PositionsAndCuspsTables } from './components/PositionsAndCuspsTables';
import { SignificatorsView } from './components/SignificatorsView';
import { VimshottariDashaAccordion } from './components/VimshottariDashaAccordion';
import { AspectsMatrix } from './components/AspectsMatrix';
import { FloatingTools } from './components/FloatingTools';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans antialiased pb-12">
      {/* Container wrapper for max-width desktop layout */}
      <div className="max-w-7xl mx-auto bg-white shadow-xl min-h-screen border-x border-gray-200">
        <Header />
        <InputPanchangaBar />
        <ChartsSection />
        <DashaStrengthBar />
        <PlanetsHouseAnalysis />
        <AshtakavargaChart />
        <PositionsAndCuspsTables />
        <SignificatorsView />
        <VimshottariDashaAccordion />
        <AspectsMatrix />
      </div>

      <FloatingTools />
    </div>
  );
}

