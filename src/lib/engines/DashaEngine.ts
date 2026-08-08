export interface Dasha {
  lord: string;
  startDate: Date;
  endDate: Date;
  totalDuration: number;
  elapsedDuration: number;
  remainingDuration: number;
  percentComplete: number;
}

import { DashaInfo } from '../../types/kp';

export interface DashaData {
  mahadasha: Dasha;
  antardasha: Dasha;
  pratyantardasha?: Dasha;
  remainingBalance: number;
  timeline: Dasha[];
}

const DASHA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_DURATIONS: Record<string, number> = {
  "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17
};

function addYears(date: Date, years: number): Date {
  const safeD = parseSafeDate(date);
  const result = new Date(safeD);
  result.setFullYear(result.getFullYear() + Math.floor(years));
  const remainingDays = (years - Math.floor(years)) * 365.25;
  result.setDate(result.getDate() + Math.round(remainingDays));
  return result;
}

export function parseSafeDate(input: any, fallbackStr: string = "1996-11-01"): Date {
  if (!input) return new Date(fallbackStr);
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? new Date(fallbackStr) : input;
  }
  const str = String(input).trim();
  if (!str || str.includes('undefined') || str.includes('null')) {
    return new Date(fallbackStr);
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  
  const dateMatch = str.match(/\d{4}-\d{2}-\d{2}/);
  if (dateMatch) {
    const d2 = new Date(dateMatch[0]);
    if (!isNaN(d2.getTime())) return d2;
  }
  return new Date(fallbackStr);
}

function parseApiDate(dateStr?: string | null): Date {
  if (!dateStr || dateStr === 'undefined' || dateStr === 'null') return new Date();
  const str = String(dateStr).trim();
  const parts = str.split(/[- :T]/);
  if (parts.length >= 6) {
    const d = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10),
      parseInt(parts[3], 10),
      parseInt(parts[4], 10),
      parseInt(parts[5], 10)
    );
    if (!isNaN(d.getTime())) return d;
  } else if (parts.length >= 3) {
    const d = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
    if (!isNaN(d.getTime())) return d;
  }
  return parseSafeDate(str);
}

function normalizeLordName(name?: string | null): string {
  if (!name) return '';
  const n = String(name).trim();
  if (n === 'Raagu') return 'Rahu';
  if (n === 'Kethu') return 'Ketu';
  return n;
}

export interface ParsedApiMd {
  lord: string;
  startDate: Date;
  endDate: Date;
  antardashas: {
    lord: string;
    startDate: Date;
    endDate: Date;
    pratyantardashas: {
      lord: string;
      startDate: Date;
      endDate: Date;
    }[];
  }[];
}

export function extractApiVimsottari(horoscope: any): any[] | null {
  if (!horoscope) return null;
  const possiblePaths = [
    horoscope?.horoscope?.graha_dashas?.vimsottari,
    horoscope?.graha_dashas?.vimsottari,
    horoscope?.vimsottari,
    horoscope?.horoscope?.vimsottari,
    horoscope?.dasha,
    horoscope?.graha_dashas
  ];
  for (const path of possiblePaths) {
    if (Array.isArray(path) && path.length > 0) {
      return path;
    }
  }
  return null;
}

export function parseApiVimsottari(vimsottari: any[]): ParsedApiMd[] {
  if (!vimsottari || !Array.isArray(vimsottari) || vimsottari.length === 0) return [];
  
  const items = vimsottari.map((entry) => {
    let key = '';
    let dateStr = '';
    if (Array.isArray(entry)) {
      key = String(entry[0] || '');
      dateStr = String(entry[1] || '');
    } else if (entry && typeof entry === 'object') {
      key = String(entry.key || entry.dasha || entry.name || '');
      dateStr = String(entry.date || entry.start || entry.startDate || entry.time || '');
    }
    const parts = key.split('-').map(normalizeLordName);
    const md = parts[0] || '';
    const ad = parts[1] || md;
    const pd = parts[2] || ad;
    return {
      md,
      ad,
      pd,
      startDate: parseApiDate(dateStr)
    };
  }).filter(item => item.md);

  if (items.length === 0) return [];

  const rawItems = items.map((item, i) => {
    let endDate: Date;
    if (i < items.length - 1) {
      endDate = items[i + 1].startDate;
    } else {
      endDate = new Date(item.startDate);
      endDate.setMonth(endDate.getMonth() + 2);
    }
    return { ...item, endDate };
  });

  const mds: ParsedApiMd[] = [];
  let currentMd: ParsedApiMd | null = null;
  let currentAd: any = null;

  for (const item of rawItems) {
    if (!currentMd || currentMd.lord !== item.md) {
      currentMd = {
        lord: item.md,
        startDate: item.startDate,
        endDate: item.endDate,
        antardashas: []
      };
      mds.push(currentMd);
      currentAd = null;
    } else {
      currentMd.endDate = item.endDate;
    }

    if (!currentAd || currentAd.lord !== item.ad) {
      currentAd = {
        lord: item.ad,
        startDate: item.startDate,
        endDate: item.endDate,
        pratyantardashas: []
      };
      currentMd.antardashas.push(currentAd);
    } else {
      currentAd.endDate = item.endDate;
    }

    currentAd.pratyantardashas.push({
      lord: item.pd,
      startDate: item.startDate,
      endDate: item.endDate
    });
  }

  return mds;
}

export function extractNakshatraPada(horoscope: any) {
  const nakshatraPada = horoscope?.horoscope?.nakshatra_pada || horoscope?.nakshatra_pada || {};
  return nakshatraPada.Moon || { nakshatra_number: 1, degrees_in_nakshatra: 6.5 };
}

export function getFullDashaTimeline(horoscope: any, birthDateStr: string, years: number = 120): Dasha[] {
  const apiVims = horoscope?.horoscope?.graha_dashas?.vimsottari || horoscope?.graha_dashas?.vimsottari;
  const now = new Date(); // Anchored current local date consistent with dashboard
  
  if (apiVims && Array.isArray(apiVims)) {
    const parsedMds = parseApiVimsottari(apiVims);
    return parsedMds.map(md => {
      const startDate = md.startDate;
      const endDate = md.endDate;
      const totalDurMs = endDate.getTime() - startDate.getTime();
      const elapsedMs = Math.max(0, now.getTime() - startDate.getTime());
      const remMs = Math.max(0, endDate.getTime() - now.getTime());
      const pct = Math.max(0, Math.min(100, (elapsedMs / totalDurMs) * 100));
      const durYears = totalDurMs / (1000 * 60 * 60 * 24 * 365.25);

      return {
        lord: md.lord,
        startDate,
        endDate,
        totalDuration: durYears,
        elapsedDuration: elapsedMs / (1000 * 60 * 60 * 24 * 365.25),
        remainingDuration: remMs / (1000 * 60 * 60 * 24 * 365.25),
        percentComplete: pct
      };
    });
  }

  const moonPada = extractNakshatraPada(horoscope);
  const birthDate = parseSafeDate(birthDateStr, "1996-11-01");
  const startLordIdx = (moonPada.nakshatra_number - 1) % 9;
  const startLord = DASHA_LORDS[startLordIdx];
  const totalDuration = DASHA_DURATIONS[startLord];

  const elapsedFraction = (moonPada.degrees_in_nakshatra || 0) / 13.333333;
  const elapsedYears = elapsedFraction * totalDuration;
  const remainingYears = totalDuration - elapsedYears;

  const timeline: Dasha[] = [];
  let prevEnd = birthDate;

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_LORDS[(startLordIdx + i) % 9];
    const dur = i === 0 ? remainingYears : DASHA_DURATIONS[lord];
    const startDate = new Date(prevEnd);
    const endDate = addYears(startDate, dur);

    const totalDurMs = endDate.getTime() - startDate.getTime();
    const elapsedMs = Math.max(0, now.getTime() - startDate.getTime());
    const remMs = Math.max(0, endDate.getTime() - now.getTime());
    const pct = Math.max(0, Math.min(100, (elapsedMs / totalDurMs) * 100));

    timeline.push({
      lord,
      startDate,
      endDate,
      totalDuration: dur,
      elapsedDuration: elapsedMs / (1000 * 60 * 60 * 24 * 365.25),
      remainingDuration: remMs / (1000 * 60 * 60 * 24 * 365.25),
      percentComplete: pct
    });
    prevEnd = endDate;
  }
  return timeline;
}

export function getAntardashasForMd(horoscope: any, birthDateStr: string, mdLord: string): Dasha[] {
  const apiVims = horoscope?.horoscope?.graha_dashas?.vimsottari || horoscope?.graha_dashas?.vimsottari;
  const now = new Date(); // Anchored current local date
  
  if (apiVims && Array.isArray(apiVims)) {
    const parsedMds = parseApiVimsottari(apiVims);
    const targetMd = parsedMds.find(m => m.lord === mdLord);
    if (targetMd) {
      return targetMd.antardashas.map(ad => {
        const adStartDate = ad.startDate;
        const adEndDate = ad.endDate;
        const adTotalDurMs = adEndDate.getTime() - adStartDate.getTime();
        const adElapsedMs = Math.max(0, now.getTime() - adStartDate.getTime());
        const adRemMs = Math.max(0, adEndDate.getTime() - now.getTime());
        const adPct = Math.max(0, Math.min(100, (adElapsedMs / adTotalDurMs) * 100));
        const adDurYears = adTotalDurMs / (1000 * 60 * 60 * 24 * 365.25);

        return {
          lord: ad.lord,
          startDate: adStartDate,
          endDate: adEndDate,
          totalDuration: adDurYears,
          elapsedDuration: adElapsedMs / (1000 * 60 * 60 * 24 * 365.25),
          remainingDuration: adRemMs / (1000 * 60 * 60 * 24 * 365.25),
          percentComplete: adPct
        };
      });
    }
  }

  const timeline = getFullDashaTimeline(horoscope, birthDateStr);
  const activeMd = timeline.find(m => m.lord === mdLord) || timeline[0];

  const mdLordIdx = DASHA_LORDS.indexOf(activeMd.lord);
  const ads: Dasha[] = [];
  let prevAdEnd = activeMd.startDate;

  for (let j = 0; j < 9; j++) {
    const adLord = DASHA_LORDS[(mdLordIdx + j) % 9];
    const duration = (DASHA_DURATIONS[activeMd.lord] * DASHA_DURATIONS[adLord]) / 120;
    const startDate = new Date(prevAdEnd);
    const endDate = addYears(startDate, duration);

    const totalDurMs = endDate.getTime() - startDate.getTime();
    const elapsedMs = Math.max(0, now.getTime() - startDate.getTime());
    const remMs = Math.max(0, endDate.getTime() - now.getTime());
    const pct = Math.max(0, Math.min(100, (elapsedMs / totalDurMs) * 100));

    ads.push({
      lord: adLord,
      startDate,
      endDate,
      totalDuration: duration,
      elapsedDuration: elapsedMs / (1000 * 60 * 60 * 24 * 365.25),
      remainingDuration: remMs / (1000 * 60 * 60 * 24 * 365.25),
      percentComplete: pct
    });
    prevAdEnd = endDate;
  }
  return ads;
}

export function calculateActiveDasha(horoscope: any, birthDateStr: string, targetDate: Date = new Date()): DashaData {
  const apiVims = horoscope?.horoscope?.graha_dashas?.vimsottari || horoscope?.graha_dashas?.vimsottari;
  
  if (apiVims && Array.isArray(apiVims)) {
    const parsedMds = parseApiVimsottari(apiVims);
    const timeline = getFullDashaTimeline(horoscope, birthDateStr);
    
    const activeMd = parsedMds.find(m => targetDate >= m.startDate && targetDate <= m.endDate) || parsedMds[0];
    const timelineMd = timeline.find(m => m.lord === activeMd.lord) || timeline[0];

    const activeAd = activeMd.antardashas.find(a => targetDate >= a.startDate && targetDate <= a.endDate) || activeMd.antardashas[0];
    
    const adStartDate = activeAd.startDate;
    const adEndDate = activeAd.endDate;
    const adTotalDurMs = adEndDate.getTime() - adStartDate.getTime();
    const adElapsedMs = Math.max(0, targetDate.getTime() - adStartDate.getTime());
    const adRemMs = Math.max(0, adEndDate.getTime() - targetDate.getTime());
    const adPct = Math.max(0, Math.min(100, (adElapsedMs / adTotalDurMs) * 100));
    const adDurYears = adTotalDurMs / (1000 * 60 * 60 * 24 * 365.25);

    const dashaAd: Dasha = {
      lord: activeAd.lord,
      startDate: adStartDate,
      endDate: adEndDate,
      totalDuration: adDurYears,
      elapsedDuration: adElapsedMs / (1000 * 60 * 60 * 24 * 365.25),
      remainingDuration: adRemMs / (1000 * 60 * 60 * 24 * 365.25),
      percentComplete: adPct
    };

    const activePd = activeAd.pratyantardashas.find(p => targetDate >= p.startDate && targetDate <= p.endDate);
    let dashaPd: Dasha | undefined;
    if (activePd) {
      const pdStartDate = activePd.startDate;
      const pdEndDate = activePd.endDate;
      const pdTotalDurMs = pdEndDate.getTime() - pdStartDate.getTime();
      const pdElapsedMs = Math.max(0, targetDate.getTime() - pdStartDate.getTime());
      const pdRemMs = Math.max(0, pdEndDate.getTime() - targetDate.getTime());
      const pdPct = Math.max(0, Math.min(100, (pdElapsedMs / pdTotalDurMs) * 100));
      const pdDurYears = pdTotalDurMs / (1000 * 60 * 60 * 24 * 365.25);

      dashaPd = {
        lord: activePd.lord,
        startDate: pdStartDate,
        endDate: pdEndDate,
        totalDuration: pdDurYears,
        elapsedDuration: pdElapsedMs / (1000 * 60 * 60 * 24 * 365.25),
        remainingDuration: pdRemMs / (1000 * 60 * 60 * 24 * 365.25),
        percentComplete: pdPct
      };
    }

    return {
      mahadasha: timelineMd,
      antardasha: dashaAd,
      pratyantardasha: dashaPd,
      remainingBalance: timelineMd.remainingDuration,
      timeline
    };
  }

  const timeline = getFullDashaTimeline(horoscope, birthDateStr);
  const activeMd = timeline.find(m => targetDate >= m.startDate && targetDate <= m.endDate) || timeline[0];

  const mdLordIdx = DASHA_LORDS.indexOf(activeMd.lord);
  const ads: Dasha[] = [];
  let prevAdEnd = activeMd.startDate;

  for (let j = 0; j < 9; j++) {
    const adLord = DASHA_LORDS[(mdLordIdx + j) % 9];
    const duration = (DASHA_DURATIONS[activeMd.lord] * DASHA_DURATIONS[adLord]) / 120;
    const startDate = new Date(prevAdEnd);
    const endDate = addYears(startDate, duration);

    const totalDurMs = endDate.getTime() - startDate.getTime();
    const elapsedMs = Math.max(0, targetDate.getTime() - startDate.getTime());
    const remMs = Math.max(0, endDate.getTime() - targetDate.getTime());
    const pct = Math.max(0, Math.min(100, (elapsedMs / totalDurMs) * 100));

    ads.push({
      lord: adLord,
      startDate,
      endDate,
      totalDuration: duration,
      elapsedDuration: elapsedMs / (1000 * 60 * 60 * 24 * 365.25),
      remainingDuration: remMs / (1000 * 60 * 60 * 24 * 365.25),
      percentComplete: pct
    });
    prevAdEnd = endDate;
  }

  const activeAd = ads.find(a => targetDate >= a.startDate && targetDate <= a.endDate) || ads[0];

  return {
    mahadasha: activeMd,
    antardasha: activeAd,
    remainingBalance: activeMd.remainingDuration,
    timeline
  };
}

export interface CalculatedDashaInfo {
  mahadasha: string;
  antardasha: string;
  pratyantardasha: string;
  mahadashaStart: string;
  mahadashaEnd: string;
  antardashaStart: string;
  antardashaEnd: string;
  pratyantardashaStart?: string;
  pratyantardashaEnd?: string;
  remainingBalanceYears: number;
  timeline: {
    lord: string;
    startDate: Date;
    endDate: Date;
    totalDuration: number;
    antardashas: {
      lord: string;
      startDate: Date;
      endDate: Date;
      totalDuration: number;
      pratyantardashas: {
        lord: string;
        startDate: Date;
        endDate: Date;
        totalDuration: number;
      }[];
    }[];
  }[];
}

export function calculateVimshottariDashaFromMoon(
  moonDegreeInput: number | string,
  birthDateStr: string,
  targetDateOrHoroscope?: Date | any,
  horoscopeData?: any
): CalculatedDashaInfo {
  let targetDate = new Date();
  let horoscope = horoscopeData;

  if (targetDateOrHoroscope instanceof Date) {
    targetDate = targetDateOrHoroscope;
  } else if (targetDateOrHoroscope && typeof targetDateOrHoroscope === 'object') {
    horoscope = targetDateOrHoroscope;
  }

  // 1. Check if Vimsottari dasha table is directly available in horoscope data
  const apiVims = extractApiVimsottari(horoscope);
  if (apiVims) {
    const parsedMds = parseApiVimsottari(apiVims);
    if (parsedMds.length > 0) {
      const timeline: CalculatedDashaInfo['timeline'] = parsedMds.map(md => ({
        lord: md.lord,
        startDate: md.startDate,
        endDate: md.endDate,
        totalDuration: Math.round(((md.endDate.getTime() - md.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) * 10) / 10 || DASHA_DURATIONS[md.lord] || 10,
        antardashas: md.antardashas.map(ad => ({
          lord: ad.lord,
          startDate: ad.startDate,
          endDate: ad.endDate,
          totalDuration: (ad.endDate.getTime() - ad.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
          pratyantardashas: (ad.pratyantardashas || []).map(pd => ({
            lord: pd.lord,
            startDate: pd.startDate,
            endDate: pd.endDate,
            totalDuration: (pd.endDate.getTime() - pd.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
          }))
        }))
      }));

      let activeMd = timeline.find(m => targetDate >= m.startDate && targetDate <= m.endDate);
      if (!activeMd) {
        if (targetDate < timeline[0].startDate) activeMd = timeline[0];
        else activeMd = timeline[timeline.length - 1];
      }

      let activeAd = activeMd.antardashas.find(a => targetDate >= a.startDate && targetDate <= a.endDate);
      if (!activeAd) activeAd = activeMd.antardashas[0];

      let activePd = activeAd?.pratyantardashas?.find(p => targetDate >= p.startDate && targetDate <= p.endDate);
      if (!activePd) activePd = activeAd?.pratyantardashas?.[0];

      const formatDateStr = (d: Date) => {
        if (!d || isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
        return d.toISOString().split('T')[0];
      };

      const remainingYears = Math.max(0, (activeMd.endDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

      return {
        mahadasha: activeMd.lord,
        antardasha: activeAd?.lord || activeMd.lord,
        pratyantardasha: activePd?.lord || activeAd?.lord || activeMd.lord,
        mahadashaStart: formatDateStr(activeMd.startDate),
        mahadashaEnd: formatDateStr(activeMd.endDate),
        antardashaStart: activeAd ? formatDateStr(activeAd.startDate) : formatDateStr(activeMd.startDate),
        antardashaEnd: activeAd ? formatDateStr(activeAd.endDate) : formatDateStr(activeMd.endDate),
        pratyantardashaStart: activePd ? formatDateStr(activePd.startDate) : undefined,
        pratyantardashaEnd: activePd ? formatDateStr(activePd.endDate) : undefined,
        remainingBalanceYears: remainingYears,
        timeline
      };
    }
  }

  // 2. Fallback to manual calculation from Moon degree
  const nakshatraArc = 13 + 20 / 60; // 13.333333333333334 degrees
  
  let numericDeg = 0;
  if (typeof moonDegreeInput === 'number') {
    numericDeg = moonDegreeInput;
  } else if (typeof moonDegreeInput === 'string') {
    const parsed = parseFloat(moonDegreeInput);
    if (!isNaN(parsed) && String(parsed) === moonDegreeInput.trim()) {
      numericDeg = parsed;
    } else {
      const nakshatraNames = [
        "Ashwini", "Bharani", "Kritika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
        "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
        "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
      ];
      const matchIdx = nakshatraNames.findIndex(n => n.toLowerCase() === moonDegreeInput.trim().toLowerCase());
      if (matchIdx >= 0) {
        numericDeg = matchIdx * nakshatraArc + 1;
      } else {
        numericDeg = parsed || 0;
      }
    }
  }

  const normMoonDeg = ((numericDeg % 360) + 360) % 360;

  const nakshatraIndex = Math.floor(normMoonDeg / nakshatraArc);
  const startLordIndex = nakshatraIndex % 9;
  const startLord = DASHA_LORDS[startLordIndex];
  const startMdTotalYears = DASHA_DURATIONS[startLord];

  const degreesInNakshatra = normMoonDeg % nakshatraArc;
  const fractionTraversed = degreesInNakshatra / nakshatraArc;
  const elapsedYearsAtBirth = fractionTraversed * startMdTotalYears;

  const birthDate = parseSafeDate(birthDateStr, "1996-11-01");
  const initialMdStartDate = new Date(birthDate.getTime() - elapsedYearsAtBirth * 365.2425 * 86400 * 1000);

  const timeline: CalculatedDashaInfo['timeline'] = [];

  let currentMdStart = initialMdStartDate;

  for (let i = 0; i < 9; i++) {
    const mdLordIndex = (startLordIndex + i) % 9;
    const mdLord = DASHA_LORDS[mdLordIndex];
    const mdFullDuration = DASHA_DURATIONS[mdLord];
    
    const mdEnd = new Date(currentMdStart.getTime() + mdFullDuration * 365.2425 * 86400 * 1000);

    const antardashas: CalculatedDashaInfo['timeline'][0]['antardashas'] = [];
    let currentAdStart = new Date(currentMdStart);

    for (let j = 0; j < 9; j++) {
      const adLordIndex = (mdLordIndex + j) % 9;
      const adLord = DASHA_LORDS[adLordIndex];
      const adDurationYears = (mdFullDuration * DASHA_DURATIONS[adLord]) / 120;
      const adEnd = new Date(currentAdStart.getTime() + adDurationYears * 365.2425 * 86400 * 1000);

      const pratyantardashas: CalculatedDashaInfo['timeline'][0]['antardashas'][0]['pratyantardashas'] = [];
      let currentPdStart = new Date(currentAdStart);

      for (let k = 0; k < 9; k++) {
        const pdLordIndex = (adLordIndex + k) % 9;
        const pdLord = DASHA_LORDS[pdLordIndex];
        const pdDurationYears = (mdFullDuration * DASHA_DURATIONS[adLord] * DASHA_DURATIONS[pdLord]) / (120 * 120);
        const pdEnd = new Date(currentPdStart.getTime() + pdDurationYears * 365.2425 * 86400 * 1000);

        pratyantardashas.push({
          lord: pdLord,
          startDate: currentPdStart,
          endDate: pdEnd,
          totalDuration: pdDurationYears
        });
        currentPdStart = pdEnd;
      }

      antardashas.push({
        lord: adLord,
        startDate: currentAdStart,
        endDate: adEnd,
        totalDuration: adDurationYears,
        pratyantardashas
      });

      currentAdStart = adEnd;
    }

    timeline.push({
      lord: mdLord,
      startDate: currentMdStart,
      endDate: mdEnd,
      totalDuration: mdFullDuration,
      antardashas
    });

    currentMdStart = mdEnd;
  }

  let activeMd = timeline.find(m => targetDate >= m.startDate && targetDate <= m.endDate);
  if (!activeMd) {
    if (targetDate < timeline[0].startDate) activeMd = timeline[0];
    else activeMd = timeline[timeline.length - 1];
  }

  let activeAd = activeMd.antardashas.find(a => targetDate >= a.startDate && targetDate <= a.endDate);
  if (!activeAd) activeAd = activeMd.antardashas[0];

  let activePd = activeAd.pratyantardashas?.find((p: any) => targetDate >= p.startDate && targetDate <= p.endDate);
  if (!activePd) activePd = activeAd.pratyantardashas?.[0];

  const formatDateStr = (d: any) => {
    if (!d) return new Date().toISOString().split('T')[0];
    const dateObj = d instanceof Date ? d : new Date(d);
    if (isNaN(dateObj.getTime())) return new Date().toISOString().split('T')[0];
    return dateObj.toISOString().split('T')[0];
  };

  const remainingYears = Math.max(0, (activeMd.endDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24 * 365.2425));

  return {
    mahadasha: activeMd.lord,
    antardasha: activeAd.lord,
    pratyantardasha: activePd?.lord || activeAd.lord,
    mahadashaStart: formatDateStr(activeMd.startDate),
    mahadashaEnd: formatDateStr(activeMd.endDate),
    antardashaStart: formatDateStr(activeAd.startDate),
    antardashaEnd: formatDateStr(activeAd.endDate),
    pratyantardashaStart: activePd ? formatDateStr(activePd.startDate) : undefined,
    pratyantardashaEnd: activePd ? formatDateStr(activePd.endDate) : undefined,
    remainingBalanceYears: remainingYears,
    timeline
  };
}

export function toKPChartDashaInfo(dasha: CalculatedDashaInfo): DashaInfo {
  return {
    mahadasha: dasha.mahadasha,
    antardasha: dasha.antardasha,
    pratyantardasha: dasha.pratyantardasha,
    mahadashaEnd: dasha.mahadashaEnd,
    antardashaEnd: dasha.antardashaEnd,
    pratyantardashaStart: dasha.pratyantardashaStart,
    pratyantardashaEnd: dasha.pratyantardashaEnd,
    fullTimeline: dasha.timeline.map(md => ({
      lord: md.lord,
      startDate: md.startDate,
      endDate: md.endDate,
      antardashas: md.antardashas.map(ad => ({
        lord: ad.lord,
        startDate: ad.startDate,
        endDate: ad.endDate,
        pratyantardashas: ad.pratyantardashas.map(pd => ({
          lord: pd.lord,
          startDate: pd.startDate,
          endDate: pd.endDate
        }))
      }))
    }))
  };
}

