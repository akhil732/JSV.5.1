import React, { useState, useEffect } from 'react';
import { KPChart } from '../../types/kp';
import LagnaChartCard from '../LagnaChartCard';

interface RVATripleChartsProps {
  kpChart: KPChart;
  horoscopeData?: any;
}

export const RVATripleCharts: React.FC<RVATripleChartsProps> = ({ kpChart, horoscopeData }) => {
  const [chartStyle, setChartStyle] = useState<'south-indian' | 'east-indian'>('south-indian');
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
          <div className="space-y-3">
            <LagnaChartCard
              horoscope={horoscopeData?.horoscope || horoscopeData}
              cardTitle="Natal Chart (D-1 Rasi)"
              borderColor="blue"
              chartStyle={chartStyle}
              onChartStyleChange={setChartStyle}
            />

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

        {/* 2. Transit Chart (Gochara) */}
        {(activeChartFocus === 'all' || activeChartFocus === 'transit') && (
          <div className="space-y-3">
            {transitLoading && !transitReport ? (
              <div className="bg-ds-surface border border-ds-secondary/15 rounded-2xl p-4 shadow-sm min-h-[300px] flex items-center justify-center">
                <div className="text-center text-xs text-ds-on-surface-variant">
                  Calculating Today's Astrological Transit...
                </div>
              </div>
            ) : (
              <LagnaChartCard
                horoscope={(transitReport?.horoscope || transitReport) || (horoscopeData?.horoscope || horoscopeData)}
                cardTitle="Gochara Transit Chart"
                borderColor="purple"
                chartStyle={chartStyle}
                onChartStyleChange={setChartStyle}
              />
            )}

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
