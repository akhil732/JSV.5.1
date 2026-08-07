import React, { useRef, useEffect, useState, useCallback } from 'react';

// Options arrays
export const HOURS_12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
export const MINUTES_60 = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
export const PERIODS = ['AM', 'PM'] as const;

export type PeriodType = 'AM' | 'PM';

export function parse24To12(time24: string): { hour12: string; min: string; period: PeriodType } {
  if (!time24) return { hour12: '12', min: '00', period: 'AM' };
  const parts = time24.split(':');
  let h = parseInt(parts[0], 10);
  if (isNaN(h)) h = 12;
  let m = parseInt(parts[1], 10);
  if (isNaN(m)) m = 0;

  const period: PeriodType = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;

  return {
    hour12: h12.toString().padStart(2, '0'),
    min: m.toString().padStart(2, '0'),
    period,
  };
}

export function format12To24(hour12: string, min: string, period: PeriodType): string {
  let h = parseInt(hour12, 10);
  if (isNaN(h)) h = 12;
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;

  const h24 = h.toString().padStart(2, '0');
  const m24 = min.padStart(2, '0');
  return `${h24}:${m24}:00`;
}

interface WheelColumnProps<T extends string> {
  options: readonly T[] | T[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  itemHeight?: number;
  visibleCount?: number;
}

export function WheelColumn<T extends string>({
  options,
  value,
  onChange,
  label,
  itemHeight = 38,
  visibleCount = 5,
}: WheelColumnProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<any>(null);
  const isProgrammaticScroll = useRef(false);

  const paddingCount = Math.floor(visibleCount / 2);
  const containerHeight = itemHeight * visibleCount;

  const selectedIndex = options.indexOf(value);
  const safeIndex = selectedIndex >= 0 ? selectedIndex : 0;

  // Smoothly scroll to target index
  const scrollTo = useCallback((index: number, smooth = true) => {
    if (!containerRef.current) return;
    isProgrammaticScroll.current = true;
    containerRef.current.scrollTo({
      top: index * itemHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, smooth ? 250 : 50);
  }, [itemHeight]);

  // Keep scroll position aligned when value changes externally
  useEffect(() => {
    if (!containerRef.current) return;
    const currentScrollTop = containerRef.current.scrollTop;
    const targetScrollTop = safeIndex * itemHeight;

    if (Math.abs(currentScrollTop - targetScrollTop) > 2) {
      scrollTo(safeIndex, true);
    }
  }, [safeIndex, itemHeight, scrollTo]);

  const handleScroll = () => {
    if (!containerRef.current || isProgrammaticScroll.current) return;

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    const scrollTop = containerRef.current.scrollTop;
    const newIndex = Math.min(
      options.length - 1,
      Math.max(0, Math.round(scrollTop / itemHeight))
    );

    if (newIndex !== safeIndex && options[newIndex] !== undefined) {
      onChange(options[newIndex]);
    }

    // Snap cleanly on scroll end
    scrollTimeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const finalTop = containerRef.current.scrollTop;
        const snapIndex = Math.min(
          options.length - 1,
          Math.max(0, Math.round(finalTop / itemHeight))
        );
        scrollTo(snapIndex, true);
      }
    }, 150);
  };

  const handleItemClick = (index: number) => {
    scrollTo(index, true);
    onChange(options[index]);
  };

  return (
    <div className="flex flex-col items-center flex-1 select-none min-w-[60px]">
      {label && (
        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 block">
          {label}
        </span>
      )}
      <div
        className="relative w-full overflow-hidden rounded-xl bg-[#0A0E17]/90 border border-[#1E2433] shadow-inner"
        style={{ height: containerHeight }}
      >
        {/* Selection Lens Overlay */}
        <div
          className="absolute left-1 right-1 pointer-events-none rounded-lg bg-amber-500/15 border border-amber-500/40 shadow-[0_0_12px_rgba(245,166,35,0.15)] z-10 transition-all"
          style={{
            height: itemHeight,
            top: paddingCount * itemHeight,
          }}
        />

        {/* Scrollable Column */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto snap-y snap-mandatory relative z-20"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* Top Padding */}
          <div style={{ height: paddingCount * itemHeight }} />

          {/* Wheel Options */}
          {options.map((opt, idx) => {
            const isSelected = idx === safeIndex;
            const distance = Math.abs(idx - safeIndex);

            return (
              <div
                key={`${opt}-${idx}`}
                onClick={() => handleItemClick(idx)}
                className={`snap-center flex items-center justify-center cursor-pointer transition-all duration-150 font-mono ${
                  isSelected
                    ? 'font-bold text-amber-400 text-base scale-105'
                    : distance === 1
                    ? 'text-[#94A3B8] text-sm opacity-60'
                    : 'text-[#475569] text-xs opacity-30'
                }`}
                style={{
                  height: itemHeight,
                }}
              >
                {opt}
              </div>
            );
          })}

          {/* Bottom Padding */}
          <div style={{ height: paddingCount * itemHeight }} />
        </div>
      </div>
    </div>
  );
}

interface TimeWheelPickerProps {
  value: string; // "HH:MM:SS" or "HH:MM"
  onChange: (time24h: string) => void;
  onClose?: () => void;
}

export const TimeWheelPicker: React.FC<TimeWheelPickerProps> = ({
  value,
  onChange,
  onClose,
}) => {
  const { hour12, min, period } = parse24To12(value);

  const handleHourChange = (newHour: string) => {
    const updated24 = format12To24(newHour, min, period);
    onChange(updated24);
  };

  const handleMinChange = (newMin: string) => {
    const updated24 = format12To24(hour12, newMin, period);
    onChange(updated24);
  };

  const handlePeriodChange = (newPeriod: PeriodType) => {
    const updated24 = format12To24(hour12, min, newPeriod);
    onChange(updated24);
  };

  const formattedDisplay = `${hour12}:${min} ${period}`;
  const formatted24Display = `${parse24To12(value).hour12 === '12' && period === 'AM' ? '00' : format12To24(hour12, min, period).slice(0, 5)}`;

  return (
    <div className="w-full bg-[#141A2B] border border-[#232B3F] rounded-2xl p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="text-[11px] font-bold text-[#A0AEC0] mb-3 pb-2 border-b border-[#1E2433] flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 font-mono font-bold text-xs">{formattedDisplay}</span>
          <span className="text-[#64748B] font-mono text-[10px]">({formatted24Display})</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-colors cursor-pointer"
          >
            Done
          </button>
        )}
      </div>

      {/* Wheel Columns (Hour, Minute, AM/PM) */}
      <div className="flex items-center justify-between gap-2 px-1">
        <WheelColumn
          label="Hour"
          options={HOURS_12}
          value={hour12}
          onChange={handleHourChange}
        />
        <div className="text-amber-400/50 font-bold text-lg pt-4 font-mono">:</div>
        <WheelColumn
          label="Minute"
          options={MINUTES_60}
          value={min}
          onChange={handleMinChange}
        />
        <WheelColumn
          label="AM / PM"
          options={PERIODS}
          value={period}
          onChange={handlePeriodChange}
        />
      </div>
    </div>
  );
};

export default TimeWheelPicker;
