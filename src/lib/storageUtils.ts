import { PastReport } from '../types';

/**
 * Checks whether an error is a browser LocalStorage QuotaExceededError.
 */
export function isQuotaExceededError(err: any): boolean {
  if (!err) return false;
  return (
    (typeof DOMException !== 'undefined' &&
      err instanceof DOMException &&
      (err.code === 22 ||
        err.code === 1014 ||
        err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) ||
    (typeof err.message === 'string' &&
      (err.message.toLowerCase().includes('quota') ||
        err.message.toLowerCase().includes('exceeded')))
  );
}

/**
 * Safely sets an item in localStorage, catching QuotaExceededError gracefully.
 */
export function safeSetLocalStorageItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    if (isQuotaExceededError(err)) {
      console.warn(`[StorageUtils] Storage quota exceeded when writing key '${key}'.`);
    } else {
      console.warn(`[StorageUtils] Failed to set localStorage key '${key}':`, err);
    }
    return false;
  }
}

/**
 * Safely gets an item from localStorage, catching access or closed storage errors gracefully.
 */
export function safeGetLocalStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[StorageUtils] Failed to get localStorage key '${key}':`, err);
    return null;
  }
}

/**
 * Safely removes an item from localStorage.
 */
export function safeRemoveLocalStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.warn(`[StorageUtils] Failed to remove localStorage key '${key}':`, err);
    return false;
  }
}

/**
 * Strips non-essential or large subfields from a PastReport's horoscopeData
 * to drastically reduce its size in localStorage cache.
 */
export function trimReportForCache(report: PastReport, minimalOnly: boolean = false): PastReport {
  if (!report.horoscopeData) {
    return report;
  }

  if (minimalOnly) {
    return {
      ...report,
      horoscopeData: report.horoscopeData?.horoscope?.calendar_info
        ? { horoscope: { calendar_info: report.horoscopeData.horoscope.calendar_info } }
        : null
    };
  }

  const h = report.horoscopeData.horoscope;
  if (!h) return report;

  // Preserve essential fields for quick rendering: D-1 rasi chart, calendar_info, nakshatra_pada, and live API dashas
  const trimmedHoroscope: any = {
    calendar_info: h.calendar_info,
    nakshatra_pada: h.nakshatra_pada,
    ayanamsa_value: h.ayanamsa_value,
    julian_day: h.julian_day,
    graha_dashas: h.graha_dashas,
    rasi_dashas: h.rasi_dashas
  };

  if (h.divisional_charts) {
    trimmedHoroscope.divisional_charts = h.divisional_charts;
  }

  if (h.planetary_states?.retrograde_planets) {
    trimmedHoroscope.planetary_states = {
      retrograde_planets: h.planetary_states.retrograde_planets
    };
  }

  return {
    ...report,
    horoscopeData: {
      horoscope: trimmedHoroscope,
      _isTrimmedCache: true
    }
  };
}

/**
 * Safely saves past reports to localStorage without exceeding storage quota.
 * Applies progressive fallback strategies if storage quota is exceeded.
 */
export function safeSaveReportsToLocalStorage(
  reports: PastReport[],
  key: string = 'sanathanam_reports'
): boolean {
  if (!reports || !Array.isArray(reports)) return false;

  const jsonStr = JSON.stringify(reports);

  // Strategy 1: Save full reports list
  try {
    localStorage.setItem(key, jsonStr);
    return true;
  } catch (err) {
    if (!isQuotaExceededError(err)) {
      console.warn(`[StorageUtils] Error writing to '${key}':`, err);
      return false;
    }
    console.warn(
      `[StorageUtils] localStorage quota exceeded while caching ${reports.length} reports (~${Math.round(jsonStr.length / 1024)} KB). Executing cache optimization strategies...`
    );
  }

  // Strategy 2: Keep top 5 full reports, trim older ones up to top 20
  try {
    const cappedList = reports.slice(0, 20).map((rep, idx) => {
      if (idx < 5) return rep; // Keep full report data for 5 most recent
      return trimReportForCache(rep, false);
    });
    localStorage.setItem(key, JSON.stringify(cappedList));
    console.log(`[StorageUtils] Saved ${cappedList.length} reports with trimmed older items to '${key}'.`);
    return true;
  } catch (err) {
    console.warn(`[StorageUtils] Strategy 2 failed (quota exceeded). Trying Strategy 3...`);
  }

  // Strategy 3: Keep top 3 full reports, trim older ones up to top 10
  try {
    const cappedList = reports.slice(0, 10).map((rep, idx) => {
      if (idx < 3) return rep;
      return trimReportForCache(rep, false);
    });
    localStorage.setItem(key, JSON.stringify(cappedList));
    console.log(`[StorageUtils] Saved top 10 reports to '${key}'.`);
    return true;
  } catch (err) {
    console.warn(`[StorageUtils] Strategy 3 failed (quota exceeded). Trying Strategy 4...`);
  }

  // Strategy 4: Save minimal metadata for top 10 reports
  try {
    const minimalList = reports.slice(0, 10).map((rep) => trimReportForCache(rep, true));
    localStorage.setItem(key, JSON.stringify(minimalList));
    console.log(`[StorageUtils] Saved minimal metadata for top 10 reports to '${key}'.`);
    return true;
  } catch (err) {
    console.warn(`[StorageUtils] Could not save reports cache to localStorage. Storage is completely full.`);
    return false;
  }
}
