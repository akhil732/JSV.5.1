export interface BirthDetails {
  name: string;
  gender: 'Male' | 'Female';
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  approximateTime: boolean;
  place: string;
  latitude: number;
  longitude: number;
  timezone: number;
  /**
   * Explicit opt-in to render the built-in "Adam" demo profile (hardcoded
   * houses/planets/significators) instead of computing a real chart from
   * birth data. Previously this was inferred by matching the person's NAME
   * against the substring "akhil"/"adam" — which meant any real user
   * literally named Akhil (or Adam) had their actual chart silently
   * discarded and replaced with fabricated demo data on every query,
   * regardless of what real horoscope data had been fetched. Default false.
   */
  useDemoData?: boolean;
}

export interface PastReport {
  id: string;
  timestamp: number;
  birthDetails: BirthDetails;
  horoscopeData: any; // Stored API response
  driveFileId?: string;
  driveFileName?: string;
}

export interface LocationSuggestion {
  place: string;
  country: string;
  displayName: string;
  latitude: number;
  longitude: number;
  timezone: number;
  elevation?: number;
  state?: string;
}
