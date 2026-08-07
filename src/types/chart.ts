/**
 * Planet information with house placement
 */
export interface PlanetInfo {
  name: string;              // Full name: "Sun", "Moon", etc.
  abbr: string;              // 2-letter abbr: "Su", "Mo", etc.
  house: number;             // 1-12
  sign: string;              // Zodiac sign: "Aries", "Taurus", etc.
  longitude?: number;        // 0-360 degrees
  degreeInSign?: number;     // 0-30 within sign
  minuteInSign?: number;     // 0-60 minutes
  secondInSign?: number;     // 0-60 seconds
  speed?: number;            // Movement speed (positive = direct, negative = retrograde)
  isRetrograde?: boolean;    // Derived from speed < 0
  isExalted?: boolean;       // Checked against exaltation rules
  isDebilitated?: boolean;   // Checked against debilitation rules
  nakshatra?: string;        // Moon's star
  pad?: number;              // Padamsha (1/4 division)
  aspectingHouses?: number[];// Which houses it aspects
}

/**
 * House information
 */
export interface HouseData {
  house: number;             // 1-12
  sign: string;              // Zodiac sign ruling the house
  lord: string;              // Ruling planet abbreviation
  longitude?: number;        // Exact degree of cusp
  plantedPlanets?: PlanetInfo[]; // Planets in this house
  signification?: string;    // Life area governed
}

/**
 * Complete chart data structure
 */
export interface ChartData {
  // Basic info
  chartType: 'D1' | 'D10' | 'D9' | 'D12' | 'D16' | 'D20' | 'D24' | 'D27' | 'D30' | 'D40' | 'D45' | 'D60' | string;
  lagna: string;             // Rising sign (Aries, Taurus, etc.)
  lagnaLord?: string;        // Planet ruling the lagna
  
  // Planet data
  planets: PlanetInfo[];
  
  // House data
  houses: HouseData[];
  
  // Additional info
  totalAyanamsha?: number;   // Precession adjustment
  latitude?: number;
  longitude?: number;
  timezone?: number;
  
  // Metadata
  generatedAt?: Date;
  source?: 'JHora' | 'Manual' | 'Import';
}

/**
 * Serializable chart state (for storage)
 */
export interface SerializedChartData {
  chartType: string;
  lagna: string;
  lagnaLord?: string;
  planets: Array<{
    abbr: string;
    house: number;
    sign: string;
    isRetrograde?: boolean;
    longitude?: number;
  }>;
  houses: Array<{
    house: number;
    sign: string;
    lord: string;
  }>;
}

/**
 * Component props
 */
export interface DivisionalChartProps {
  horoscopeData?: any;
  chartData?: ChartData;
  divisionalType?: 'D1' | 'D10' | 'D9' | 'D12' | string;
  layout?: 'EAST_INDIAN' | 'NORTH_INDIAN' | 'SOUTH_INDIAN' | 'WESTERN';
  language?: 'en' | 'hi' | 'te';
  showHouseNumbers?: boolean;
  showDegrees?: boolean;
  showSignifications?: boolean;
  onHouseClick?: (house: number) => void;
  highlightedHouse?: number;
  compact?: boolean;        // For mobile view
}
