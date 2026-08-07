export interface PanchangaItem {
  icon: string;
  label: string;
  type?: 'planet' | 'time' | 'yoga' | 'tithi' | 'nakshatra';
}

export interface ChartPlanetPosition {
  house: number; // 1 to 12
  text: string; // e.g. "Ve 03:27:25", "IX 10:21:55"
  isRetrograde?: boolean;
}

export interface ChartInfo {
  title: string;
  name: string;
  date: string;
  time: string;
  lat: string;
  long: string;
  tz: string;
  subtitle?: string;
  yearControl?: boolean;
  age?: number;
}

export interface PlanetStrength {
  code: string; // e.g. "Me", "Ke", "Su"
  name: string;
  symbol: string;
  score: number;
  textColor?: string;
  borderColor?: string;
}

export interface PlanetAnalysisRow {
  planet: string;
  light: number;
  perf: number;
  resource: number;
  capacity: number | string; // e.g. 85 or "36/164"
  slInf: string;
  isCustomCapacity?: boolean;
}

export interface HouseAnalysisRow {
  houseNum: number;
  occupant: string;
  lord: string;
  karaka: string;
  total: string | number;
}

export interface TransitDataPoint {
  date: string;
  strength: number;
}

export interface PlanetaryPositionRow {
  planet: string;
  sign: string;
  longitude: string;
  house: number;
  nakshatra: string;
  sl: string;
  nl: string;
  sub: string;
  ss: string;
  sss: string;
}

export interface CuspRow {
  house: string;
  sign: string;
  longitude: string;
  nakshatra: string;
  sl: string;
  nl: string;
  sub: string;
  ss: string;
  sss: string;
}

export interface PlanetSignificator {
  planet: string;
  a: string;
  b: string;
  c: string;
  d: string;
}

export interface HouseSignificator {
  house: string;
  planets1: string;
  planets2: string;
}

export interface DashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  subPeriods?: {
    planet: string;
    startDate: string;
    endDate: string;
  }[];
}

export interface AspectCell {
  rowPlanet: string;
  colPlanet: string;
  label: string; // e.g. "SSqu (S)"
  angle: string; // e.g. "1° 14'"
  type: 'hard' | 'soft' | 'neutral'; // hard = red, soft = green
}
