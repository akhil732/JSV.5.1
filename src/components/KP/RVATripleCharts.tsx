import React, { useState, useEffect } from 'react';
import { KPChart } from '../../types/kp';
import { DivisionalChart } from '../DivisionalChart';
import { Sparkles, Compass, Shield, Clock, Eye, Layers } from 'lucide-react';

interface RVATripleChartsProps {
  kpChart: KPChart;
  horoscopeData?: any;
}

export const RVATripleCharts: React.FC<RVATripleChartsProps> = ({ kpChart, horoscopeData }) => {
  const [chartStyle, setChartStyle] = useState<'south-indian' | 'north-indian'>('south-indian');
  const [activeChartFocus, setActiveChartFocus] = useState<'all' | 'natal' | 'transit'>('all');
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
            place: kpChart.birthData.place || 'Hyderabad, India',
            latitude: kpChart.birthData.latitude || 17.3850,
            longitude: kpChart.birthData.longitude || 78.4867,
            timezone: kpChart.birthData.timezone || 5.5
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

    if (kpChart?.birthData) {
      fetchTransitChart();
    }
  }, [
    kpChart?.birthData?.place,
    kpChart?.birthData?.latitude,
    kpChart?.birthData?.longitude,
    kpChart?.birthData?.timezone
  ]);

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className={`grid gap-4 sm:gap-6 ${
        activeChartFocus === 'all'
          ? 'grid-cols-1 md:grid-cols-2'
          : 'grid-cols-1 max-w-2xl mx-auto'
      }`}>
        {/* 1. Natal Chart */}
        {(activeChartFocus === 'all' || activeChartFocus === 'natal') && (
          <div className="bg-ds-surface border border-ds-secondary/15 rounded-2xl p-4 shadow-sm space-y-3 relative group hover:border-ds-primary/40 transition-all">
            <div className="flex items-center justify-between border-b border-ds-secondary/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-ds-primary" />
                <h4 className="font-serif font-bold text-sm text-ds-secondary">Natal Chart (D-1 Rasi)</h4>
              </div>
              <span className="text-[10px] font-mono font-bold bg-ds-primary/10 text-ds-primary px-2 py-0.5 rounded-full">
                Birth Root
              </span>
            </div>

            <div className="flex justify-center items-center py-2 min-h-[300px]">
              <DivisionalChart horoscopeData={horoscopeData} />
            </div>

            <div className="bg-ds-surface-container rounded-xl p-2.5 text-[11px] text-ds-on-surface-variant space-y-1">
              <div className="flex justify-between font-medium">
                <span>Native:</span>
                <strong className="text-ds-secondary font-bold">{kpChart.birthData.name}</strong>
              </div>
              <div className="flex justify-between font-mono">
                <span>DOB:</span>
                <span className="text-ds-secondary font-semibold">{kpChart.birthData.date} {kpChart.birthData.time}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Transit Chart (Gochara) */}
        {(activeChartFocus === 'all' || activeChartFocus === 'transit') && (
          <div className="bg-ds-surface border border-ds-secondary/15 rounded-2xl p-4 shadow-sm space-y-3 relative group hover:border-ds-success-green/40 transition-all">
            <div className="flex items-center justify-between border-b border-ds-secondary/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-ds-success-green" />
                <h4 className="font-serif font-bold text-sm text-ds-secondary">Gochara Transit Chart</h4>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                transitLoading 
                  ? 'bg-ds-primary/10 text-ds-primary animate-pulse' 
                  : 'bg-ds-success-green/10 text-ds-success-green'
              }`}>
                {transitLoading ? 'Calculating...' : 'Live Positions'}
              </span>
            </div>

            <div className="flex justify-center items-center py-2 min-h-[300px]">
              {transitLoading && !transitReport ? (
                <div className="text-center text-xs text-ds-on-surface-variant">
                  Calculating Today's Astrological Transit...
                </div>
              ) : (
                <DivisionalChart horoscopeData={transitReport || horoscopeData} />
              )}
            </div>

            <div className="bg-ds-surface-container rounded-xl p-2.5 text-[11px] text-ds-on-surface-variant space-y-1">
              <div className="flex justify-between font-medium">
                <span>Transit Date:</span>
                <strong className="text-ds-secondary font-bold">
                  {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </strong>
              </div>
              <div className="flex justify-between font-mono">
                <span>Transit Location:</span>
                <span className="text-ds-success-green font-semibold">
                  {kpChart.birthData.place || 'Hyderabad'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
