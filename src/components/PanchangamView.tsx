import React from 'react';

interface PanchangamViewProps {
  calendarInfo: any;
}

export const PanchangamView: React.FC<PanchangamViewProps> = ({ calendarInfo }) => {
  if (!calendarInfo) return null;

  const items = [
    {
      label: 'Tithi',
      value: calendarInfo.Tithi || 'Not Found',
      icon: '🌙'
    },
    {
      label: 'Janma Rasi',
      value: calendarInfo.Raasi || 'Not Found',
      icon: '🦁'
    },
    {
      label: 'Nakshatram',
      value: calendarInfo.Nakshatram || 'Not Found',
      icon: '✨'
    },
    {
      label: 'Nitya Yoga',
      value: calendarInfo.Yoga || 'Not Found',
      icon: '🧘'
    },
    {
      label: 'Karana',
      value: calendarInfo.Karana || 'Not Found',
      icon: '🐚'
    },
    {
      label: 'Sun Rise',
      value: calendarInfo['Sun Rise'] || 'Not Found',
      icon: '🌅'
    },
    {
      label: 'Sun Set',
      value: calendarInfo['Sun Set'] || 'Not Found',
      icon: '🌇'
    }
  ];

  return (
    <div className="rounded-ds-xl border border-ds-secondary/15 bg-ds-surface p-5 lg:p-6 space-y-4 shadow-ds-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm">📅</span>
        <h3 className="text-xs uppercase tracking-[0.2em] text-ds-secondary font-bold">Panchangam (Vedic Calendar Details)</h3>
      </div>

      {/* Grid of 5-7 equal-width columns, wrapping on smaller viewports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-ds-lg border border-ds-secondary/10 bg-ds-surface-container p-3 flex flex-col justify-between hover:border-ds-primary/25 transition-all group shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-ds-on-surface-variant group-hover:text-ds-primary transition-colors">
                  {item.label}
                </span>
                <span className="text-xs">{item.icon}</span>
              </div>
              <p className="text-xs font-bold text-ds-primary leading-relaxed break-words font-sans">
                {item.value}
              </p>
            </div>
            <div className="mt-2 text-[9px] text-ds-on-surface-variant/60 font-mono font-bold">
              Local Astro Details
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
