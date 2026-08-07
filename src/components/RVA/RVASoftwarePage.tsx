import React, { useState, useEffect } from 'react';
import { BirthForm } from '../BirthForm';
import { PanchangamView } from '../PanchangamView';
import { RVAHeader } from './RVAHeader';
import { RVAChartsSection } from './RVAChartsSection';
import { RVADashaStrengthBar } from './RVADashaStrengthBar';
import { RVAPlanetsHouseAnalysis } from './RVAPlanetsHouseAnalysis';
import { RVAAshtakavargaChart } from './RVAAshtakavargaChart';
import { RVAPositionsAndCusps } from './RVAPositionsAndCusps';
import { RVASignificators } from './RVASignificators';
import { RVAVimshottariAccordion } from './RVAVimshottariAccordion';
import { RVAAspectsMatrix } from './RVAAspectsMatrix';
import { RVAFloatingTools } from './RVAFloatingTools';
import { SavedPerson } from '../../types/marriageMatch';
import { getSavedPersons } from '../../lib/savedPersons';

interface RVASoftwarePageProps {
  activeProfile?: SavedPerson | null;
  horoscopeReport?: any;
  savedProfiles?: SavedPerson[];
  onSelectProfile?: (profile: SavedPerson) => void;
  onOpenBirthForm?: () => void;
}

export const RVASoftwarePage: React.FC<RVASoftwarePageProps> = ({
  activeProfile,
  horoscopeReport,
  savedProfiles,
  onSelectProfile,
  onOpenBirthForm,
}) => {
  const [profiles, setProfiles] = useState<SavedPerson[]>([]);

  useEffect(() => {
    setProfiles(getSavedPersons());
  }, []);

  const [chartDetails, setChartDetails] = useState({
    name: activeProfile?.name || 'Test Subject',
    gender: activeProfile?.gender || 'Male',
    date: activeProfile?.date || '2026-08-04',
    time: activeProfile?.time || '15:53:40',
    location: activeProfile?.place || 'Rajamahendravaram, Andhra Pradesh, India',
    lat: activeProfile?.latitude ? String(activeProfile.latitude) : '17.0044',
    long: activeProfile?.longitude ? String(activeProfile.longitude) : '81.7833',
    tz: activeProfile?.timezone ? String(activeProfile.timezone) : '5.5',
  });

  useEffect(() => {
    if (activeProfile) {
      setChartDetails({
        name: activeProfile.name,
        gender: activeProfile.gender,
        date: activeProfile.date,
        time: activeProfile.time,
        location: activeProfile.place,
        lat: String(activeProfile.latitude),
        long: String(activeProfile.longitude),
        tz: String(activeProfile.timezone),
      });
    }
  }, [activeProfile]);

  // Today's Transit Report (calculated dynamically for active profile's location or Rajamahendravaram)
  const [transitReport, setTransitReport] = useState<any | null>(null);
  const [transitLoading, setTransitLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTransitChart = async () => {
      setTransitLoading(true);
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const res = await fetch('/api/jhora-proxy/horoscope', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: todayStr,
            time: '12:00:00', // standard Noon transit
            place: activeProfile?.place || 'Rajamahendravaram, Andhra Pradesh, India',
            latitude: activeProfile?.latitude || 17.0044,
            longitude: activeProfile?.longitude || 81.7833,
            timezone: activeProfile?.timezone || 5.5
          })
        });
        if (res.ok) {
          const data = await res.json();
          setTransitReport(data);
        }
      } catch (err) {
        console.warn('Error fetching transit report:', err);
      } finally {
        setTransitLoading(false);
      }
    };

    fetchTransitChart();
  }, [activeProfile]);

  const [showForm, setShowForm] = useState(false);

  const handleUpdateDetails = React.useCallback((updated: any) => {
    setChartDetails({
      name: updated.name,
      gender: updated.gender,
      date: updated.date,
      time: updated.time,
      location: updated.place,
      lat: String(updated.latitude),
      long: String(updated.longitude),
      tz: String(updated.timezone),
    });
    setShowForm(false);
  }, []);

  const handleBirthFormSubmit = async (details: any) => {
    if (onSelectProfile) {
      onSelectProfile({
        id: activeProfile?.id || `person_${Date.now()}`,
        ...details
      });
    } else {
      handleUpdateDetails(details);
    }
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-ds-surface text-ds-on-surface font-sans antialiased pb-20">
      <div className="max-w-7xl mx-auto bg-ds-surface border-x border-ds-secondary/15 shadow-md min-h-screen space-y-4 p-4">
        
        <RVAHeader 
          activeProfile={activeProfile || null} 
          chartDetails={chartDetails} 
          onEnterDetails={onOpenBirthForm || (() => setShowForm(!showForm))}
          showBirthForm={showForm}
          profiles={savedProfiles && savedProfiles.length > 0 ? savedProfiles : profiles}
          onProfileSelect={(p) => {
            if (onSelectProfile) {
              onSelectProfile(p);
            } else {
              handleUpdateDetails(p);
            }
          }}
        />
        
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-ds-surface rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
              <div className="flex justify-between items-center mb-4 border-b border-ds-secondary/10 pb-2">
                <h2 className="text-lg font-serif font-bold text-ds-secondary">Birth Specifications Form</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 font-bold cursor-pointer">Close</button>
              </div>
              <BirthForm
                onSubmit={handleBirthFormSubmit}
                loading={false}
                error={null}
              />
            </div>
          </div>
        )}

        {/* Triple Chart Suite */}
        <RVAChartsSection 
          chartData={chartDetails} 
          horoscopeData={horoscopeReport} 
          transitReport={transitReport}
        />

        {/* Today's Transit Panchangam Widget */}
        {transitReport && (
          <div className="bg-ds-surface border-b border-ds-secondary/15 p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ds-secondary/10">
              <h3 className="font-serif font-bold text-ds-secondary text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-ds-primary animate-pulse" />
                <span>Today's Gochara Transit Panchangam ({chartDetails.location.split(',')[0]})</span>
              </h3>
              <span className="text-[10px] font-mono font-bold bg-ds-primary/10 text-ds-primary px-2 py-0.5 rounded-full">
                Live Transits
              </span>
            </div>
            <PanchangamView calendarInfo={transitReport?.horoscope?.calendar_info || transitReport?.calendar_info} />
          </div>
        )}

        {/* Vimshottari Dasha Strength Banner & Timeline */}
        <RVADashaStrengthBar 
          horoscopeReport={horoscopeReport}
          birthDateStr={activeProfile?.date}
        />

        {/* Planets & House Strength Analysis */}
        <RVAPlanetsHouseAnalysis horoscopeReport={horoscopeReport} />

        {/* Ashtakavarga Transit Graph */}
        <RVAAshtakavargaChart />

        {/* Planetary Positions & Cusps */}
        <RVAPositionsAndCusps 
          horoscopeReport={horoscopeReport}
          activeProfile={activeProfile}
        />

        {/* Significators Matrix */}
        <RVASignificators />

        {/* Vimshottari Accordion */}
        <RVAVimshottariAccordion 
          horoscopeReport={horoscopeReport}
          birthDateStr={activeProfile?.date}
        />

        {/* Aspects Grid */}
        <RVAAspectsMatrix />
      </div>

      {/* Floating Action Tools */}
      <RVAFloatingTools />
    </div>
  );
};

export default RVASoftwarePage;
