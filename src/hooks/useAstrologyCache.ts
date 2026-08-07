import { useMemo } from 'react';
import { calculateActiveDasha, DashaData } from '../lib/engines/DashaEngine';
import { calculateTransits, TransitData } from '../lib/engines/TransitEngine';

export function useAstrologyCache(
  horoscope: any,
  birthDate: string,
  moonSign: string
): { dashaData: DashaData; transitData: TransitData } {
  return useMemo(() => {
    return {
      dashaData: calculateActiveDasha(horoscope, birthDate),
      transitData: calculateTransits(moonSign),
    };
  }, [horoscope, birthDate, moonSign]);
}
