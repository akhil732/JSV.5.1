export interface MarriageMatchRequest {
  boy: {
    name: string;
    date: string;
    time: string;
    place: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
  girl: {
    name: string;
    date: string;
    time: string;
    place: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
}

export interface SavedPerson {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM:SS 24-hour
  place: string; // city name
  latitude: number;
  longitude: number;
  timezone: number;
  timestamp?: number; // ordering by recency
}

export interface PersonFormData {
  name: string;
  gender?: 'Male' | 'Female';
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  place: string;
  latitude: number;
  longitude: number;
  timezone: number;
}

export interface KutaResult {
  name: string; // e.g., "Varna", "Vasya", "Tara", etc.
  boyValue: number;
  girlValue: number;
  max: number;
  description?: string;
  details?: string;
  isUnfavourable?: boolean;
  compatibility?: string;
  cancellationReason?: string;
}

export interface ManaglikDosha {
  boy: { present: boolean; details?: string };
  girl: { present: boolean; details?: string };
}

export interface MarriageMatchResult {
  boyHoroscope: any; // contains divisional_charts, nakshatra_pada, doshas, etc.
  girlHoroscope: any; // same structure
  boyInfo?: { nakshatra: string; rasi: string; lagna: string; };
  girlInfo?: { nakshatra: string; rasi: string; lagna: string; };
  totalScore: number; // e.g., 11
  maxScore: number; // e.g., 36
  kutas: KutaResult[];
  manglik: ManaglikDosha;
  doshas?: any;
}

export type ChartStyle = 'south-indian' | 'east-indian';
