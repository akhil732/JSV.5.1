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
