import {
  PanchangaItem,
  PlanetStrength,
  PlanetAnalysisRow,
  HouseAnalysisRow,
  TransitDataPoint,
  PlanetaryPositionRow,
  CuspRow,
  PlanetSignificator,
  HouseSignificator,
  DashaPeriod,
  AspectCell,
} from '../../types/rva';

export const PANCHANGA_DATA: PanchangaItem[] = [
  { icon: '🌙', label: 'Pisces (Meena)', type: 'planet' },
  { icon: '🌌', label: 'Revati-4', type: 'nakshatra' },
  { icon: '☸', label: 'K.P - Shashthi', type: 'tithi' },
  { icon: '☯', label: 'Dhriti Yoga', type: 'yoga' },
  { icon: '⚖', label: 'Vanija Karana', type: 'yoga' },
  { icon: '🌅', label: 'Sunrise: 05:56:09', type: 'time' },
  { icon: '🌇', label: 'Sunset: 18:48:01', type: 'time' },
  { icon: '🌔', label: 'Moonrise: 22:26:32', type: 'time' },
  { icon: '🌘', label: 'Moonset: 10:42:05', type: 'time' },
];

export const PLANET_STRENGTHS: PlanetStrength[] = [
  { code: 'Me', name: 'Mercury', symbol: '☿', score: 94, textColor: 'text-emerald-600', borderColor: 'border-emerald-400' },
  { code: 'Su', name: 'Sun', symbol: '☉', score: 85, textColor: 'text-emerald-600', borderColor: 'border-emerald-400' },
  { code: 'Ve', name: 'Venus', symbol: '♀', score: 74, textColor: 'text-emerald-600', borderColor: 'border-emerald-400' },
  { code: 'Mo', name: 'Moon', symbol: '☽', score: 73, textColor: 'text-emerald-600', borderColor: 'border-emerald-400' },
  { code: 'Ma', name: 'Mars', symbol: '♂', score: 72, textColor: 'text-emerald-600', borderColor: 'border-emerald-400' },
  { code: 'Ju', name: 'Jupiter', symbol: '♃', score: 71, textColor: 'text-emerald-600', borderColor: 'border-emerald-400' },
  { code: 'Ke', name: 'Ketu', symbol: '☋', score: 69, textColor: 'text-amber-600', borderColor: 'border-amber-400' },
  { code: 'Ra', name: 'Rahu', symbol: '☊', score: 67, textColor: 'text-amber-600', borderColor: 'border-amber-400' },
  { code: 'Sa', name: 'Saturn', symbol: '♄', score: 36, textColor: 'text-rose-600', borderColor: 'border-rose-400' },
];

export const PLANETS_ANALYSIS_DATA: PlanetAnalysisRow[] = [
  { planet: 'Su', light: 100, perf: 89, resource: 77, capacity: 85, slInf: 'Me' },
  { planet: 'Mo', light: 100, perf: 69, resource: 83, capacity: 73, slInf: 'Me' },
  { planet: 'Ma', light: 80, perf: 80, resource: 91, capacity: 72, slInf: 'Me' },
  { planet: 'Me', light: 100, perf: 91, resource: 100, capacity: 94, slInf: 'Ju' },
  { planet: 'Ju', light: 60, perf: 92, resource: 81, capacity: 71, slInf: 'Sa Mo' },
  { planet: 'Ve', light: 100, perf: 89, resource: 65, capacity: 74, slInf: 'Su Ju' },
  { planet: 'Sa*', light: 30, perf: 79, resource: 64, capacity: '36/164', slInf: 'Me', isCustomCapacity: true },
  { planet: 'Ra*', light: 60, perf: 93, resource: 65, capacity: '67/133', slInf: 'Ma Me', isCustomCapacity: true },
  { planet: 'Ke', light: 100, perf: 71, resource: 86, capacity: 69, slInf: 'Su Ju' },
];

export const HOUSE_ANALYSIS_DATA: HouseAnalysisRow[] = [
  { houseNum: 1, occupant: '42 Ke*', lord: '14 Ju', karaka: '17 Su', total: '73' },
  { houseNum: 2, occupant: '52 Ju*', lord: '7.2/32.8 Sa*', karaka: '14 Ju', total: '73' },
  { houseNum: 3, occupant: '40.0/80.0 Ra*', lord: '7.2/32.8 Sa*', karaka: '14 Ma', total: '61.6/101.6' },
  { houseNum: 4, occupant: '44 Mo', lord: '14 Ju', karaka: '15 Mo', total: '73' },
  { houseNum: 5, occupant: '43 Ma*', lord: '14 Ma', karaka: '14 Ju', total: '72' },
  { houseNum: 6, occupant: '45 Ve*', lord: '15 Ve', karaka: '14 Me', total: '74' },
  { houseNum: 7, occupant: '56 Me', lord: '19 Me', karaka: '15 Ve', total: '90' },
  { houseNum: 8, occupant: '42 Ju', lord: '15 Mo', karaka: '7.2/32.8 Sa', total: '64' },
  { houseNum: 9, occupant: '42 Ke', lord: '17 Su', karaka: '17 Su', total: '76' },
  { houseNum: 10, occupant: '45 Ve', lord: '19 Me', karaka: '17 Su', total: '80' },
  { houseNum: 11, occupant: '45 Ve*', lord: '15 Ve', karaka: '14 Ma', total: '74' },
  { houseNum: 12, occupant: '43 Ma*', lord: '14 Ma', karaka: '14 Ju', total: '72' },
];

export const TRANSIT_GRAPH_DATA: TransitDataPoint[] = [
  { date: '2026-01-01', strength: 29.5 },
  { date: '2026-02-01', strength: 26.5 },
  { date: '2026-03-01', strength: 28.0 },
  { date: '2026-04-01', strength: 29.0 },
  { date: '2026-05-01', strength: 28.2 },
  { date: '2026-06-01', strength: 32.0 },
  { date: '2026-07-01', strength: 29.0 },
  { date: '2026-08-01', strength: 25.5 },
  { date: '2026-09-01', strength: 24.0 },
  { date: '2026-10-01', strength: 30.5 },
  { date: '2026-11-01', strength: 28.0 },
  { date: '2026-12-01', strength: 29.0 },
  { date: '2027-01-01', strength: 31.0 },
];

export const PLANETARY_POSITIONS: PlanetaryPositionRow[] = [
  { planet: 'Su (Sun)', sign: 'Cancer (Cn)', longitude: '17:56:08', house: 8, nakshatra: 'Ashlesha (1)', sl: 'Mo', nl: 'Me', sub: 'Me', ss: 'Ra', sss: 'Ve' },
  { planet: 'Mo (Moon)', sign: 'Pisces (Pi)', longitude: '26:42:48', house: 4, nakshatra: 'Revati (4)', sl: 'Ju', nl: 'Me', sub: 'Ju', ss: 'Me', sss: 'Ve' },
  { planet: 'Ma (Mars)', sign: 'Gemini (Ge)', longitude: '01:14:35', house: 6, nakshatra: 'Mrigasira (3)', sl: 'Me', nl: 'Ma', sub: 'Me', ss: 'Ra', sss: 'Ve' },
  { planet: 'Me (Mercury)', sign: 'Gemini (Ge)', longitude: '28:42:33', house: 7, nakshatra: 'Punarvasu (3)', sl: 'Me', nl: 'Ju', sub: 'Ve', ss: 'Ke', sss: 'Ra' },
  { planet: 'Ju (Jupiter)', sign: 'Cancer (Cn)', longitude: '13:34:59', house: 8, nakshatra: 'Pushyami (4)', sl: 'Mo', nl: 'Sa', sub: 'Ra', ss: 'Sa', sss: 'Ve' },
  { planet: 'Ve (Venus)', sign: 'Virgo (Vi)', longitude: '03:27:26', house: 9, nakshatra: 'U. Phalguni (3)', sl: 'Me', nl: 'Su', sub: 'Sa', ss: 'Me', sss: 'Su' },
  { planet: 'Sa [R]', sign: 'Pisces (Pi)', longitude: '20:32:55', house: 4, nakshatra: 'Revati (2)', sl: 'Ju', nl: 'Me', sub: 'Ve', ss: 'Ju', sss: 'Sa' },
  { planet: 'Ra (Rahu)', sign: 'Aquarius (Aq)', longitude: '06:37:32', house: 2, nakshatra: 'Dhanishtha (4)', sl: 'Sa', nl: 'Ma', sub: 'Mo', ss: 'Su', sss: 'Ra' },
  { planet: 'Ke (Ketu)', sign: 'Leo (Le)', longitude: '06:37:32', house: 8, nakshatra: 'Magha (2)', sl: 'Su', nl: 'Ke', sub: 'Ra', ss: 'Me', sss: 'Ra' },
];

export const CUSPS_DATA: CuspRow[] = [
  { house: 'Cusp I (Lagna)', sign: 'Sagittarius', longitude: '05:30:04', nakshatra: 'Mula (2)', sl: 'Ju', nl: 'Ke', sub: 'Ma', ss: 'Mo', sss: 'Ra' },
  { house: 'Cusp II', sign: 'Capricorn', longitude: '06:42:00', nakshatra: 'U. Ashadha (4)', sl: 'Sa', nl: 'Su', sub: 'Me', ss: 'Ju', sss: 'Ra' },
  { house: 'Cusp III', sign: 'Aquarius', longitude: '10:21:55', nakshatra: 'Satabhisha (2)', sl: 'Sa', nl: 'Ra', sub: 'Ju', ss: 'Ra', sss: 'Ve' },
  { house: 'Cusp IV', sign: 'Pisces', longitude: '13:55:38', nakshatra: 'U. Bhadrapada (4)', sl: 'Ju', nl: 'Sa', sub: 'Ra', ss: 'Me', sss: 'Ma' },
  { house: 'Cusp V', sign: 'Aries', longitude: '14:07:14', nakshatra: 'Bharani (1)', sl: 'Ma', nl: 'Ve', sub: 'Ve', ss: 'Ma', sss: 'Mo' },
  { house: 'Cusp VI', sign: 'Taurus', longitude: '10:36:11', nakshatra: 'Rohini (1)', sl: 'Ve', nl: 'Mo', sub: 'Mo', ss: 'Sa', sss: 'Ra' },
  { house: 'Cusp VII', sign: 'Gemini', longitude: '05:30:04', nakshatra: 'Mrigasira (4)', sl: 'Me', nl: 'Ma', sub: 'Su', ss: 'Ve', sss: 'Ju' },
  { house: 'Cusp VIII', sign: 'Cancer', longitude: '06:42:00', nakshatra: 'Pushyami (2)', sl: 'Mo', nl: 'Sa', sub: 'Me', ss: 'Ra', sss: 'Ve' },
  { house: 'Cusp IX', sign: 'Leo', longitude: '10:21:55', nakshatra: 'Magha (4)', sl: 'Su', nl: 'Ke', sub: 'Sa', ss: 'Ve', sss: 'Sa' },
  { house: 'Cusp X', sign: 'Virgo', longitude: '13:55:38', nakshatra: 'Hasta (2)', sl: 'Me', nl: 'Mo', sub: 'Ju', ss: 'Ju', sss: 'Sa' },
  { house: 'Cusp XI', sign: 'Libra', longitude: '14:07:14', nakshatra: 'Swati (3)', sl: 'Ve', nl: 'Ra', sub: 'Me', ss: 'Ju', sss: 'Ra' },
  { house: 'Cusp XII', sign: 'Scorpio', longitude: '10:36:11', nakshatra: 'Anuradha (3)', sl: 'Ma', nl: 'Sa', sub: 'Su', ss: 'Ju', sss: 'Ke' },
];

export const PLANET_SIGNIFICATORS: PlanetSignificator[] = [
  { planet: 'Sun', a: '7', b: '8', c: '7, 10', d: '9' },
  { planet: 'Moon', a: '7', b: '4', c: '7, 10', d: '8' },
  { planet: 'Mars', a: '6', b: '6', c: '5, 12', d: '5, 12' },
  { planet: 'Mercury', a: '8', b: '7', c: '1, 4', d: '7, 10' },
  { planet: 'Jupiter', a: '4', b: '8', c: '2, 3', d: '1, 4' },
  { planet: 'Venus', a: '8', b: '9', c: '9', d: '6, 11' },
  { planet: 'Saturn', a: '7', b: '4', c: '7, 10', d: '2, 3' },
  { planet: 'Rahu', a: '6', b: '2', c: '5, 12', d: '—' },
  { planet: 'Ketu', a: '8', b: '8', c: '—', d: '—' },
];

export const HOUSE_SIGNIFICATORS: HouseSignificator[] = [
  { house: 'House I', planets1: '—', planets2: 'Mercury, Jupiter' },
  { house: 'House II', planets1: 'Rahu', planets2: 'Jupiter, Saturn' },
  { house: 'House III', planets1: '—', planets2: 'Jupiter, Saturn' },
  { house: 'House IV', planets1: 'Jupiter', planets2: 'Moon, Saturn, Mercury, Jupiter' },
  { house: 'House V', planets1: '—', planets2: 'Mars, Rahu' },
  { house: 'House VI', planets1: 'Mars, Rahu', planets2: 'Mars, Venus' },
  { house: 'House VII', planets1: 'Sun, Moon, Saturn', planets2: 'Mercury, Sun, Moon, Saturn' },
  { house: 'House VIII', planets1: 'Mercury, Venus, Ketu', planets2: 'Sun, Jupiter, Ketu, Moon' },
  { house: 'House IX', planets1: '—', planets2: 'Venus, Sun' },
  { house: 'House X', planets1: '—', planets2: 'Sun, Moon, Saturn, Mercury' },
  { house: 'House XI', planets1: 'Venus', planets2: 'Venus' },
  { house: 'House XII', planets1: '—', planets2: 'Mars, Rahu' },
];

export const VIMSHOTTARI_DASHA_PERIODS: DashaPeriod[] = [
  { planet: 'Mercury', startDate: '13-10-2013', endDate: '13-10-2030' },
  { planet: 'Ketu', startDate: '13-10-2030', endDate: '13-10-2037' },
  { planet: 'Venus', startDate: '13-10-2037', endDate: '13-10-2057' },
  { planet: 'Sun', startDate: '13-10-2057', endDate: '13-10-2063' },
  { planet: 'Moon', startDate: '13-10-2063', endDate: '13-10-2073' },
  { planet: 'Mars', startDate: '13-10-2073', endDate: '11-10-2080' },
  { planet: 'Rahu', startDate: '11-10-2080', endDate: '13-10-2098' },
  { planet: 'Jupiter', startDate: '13-10-2098', endDate: '14-10-2114' },
  { planet: 'Saturn', startDate: '14-10-2114', endDate: '14-10-2133' },
];

export const ASPECT_CELLS_DATA: AspectCell[] = [
  { rowPlanet: 'Su', colPlanet: 'Mo', label: 'SSqu (S)', angle: "1° 42'", type: 'hard' },
  { rowPlanet: 'Su', colPlanet: 'Ma', label: 'SSqu (S)', angle: "1° 14'", type: 'hard' },
  { rowPlanet: 'Su', colPlanet: 'Me', label: 'Vigi (S)', angle: "1° 14'", type: 'soft' },
  { rowPlanet: 'Su', colPlanet: 'Ju', label: 'Conj (S)', angle: "4° 21'", type: 'hard' },
  { rowPlanet: 'Su', colPlanet: 'Ve', label: 'SSqu (E)', angle: "0° 31'", type: 'hard' },
  { rowPlanet: 'Su', colPlanet: 'Sa', label: 'Trin (A)', angle: "0° 31'", type: 'soft' },
  { rowPlanet: 'Su', colPlanet: 'Ra', label: 'Vigi (E)', angle: "0° 41'", type: 'soft' },
  
  { rowPlanet: 'Mo', colPlanet: 'Ma', label: 'Sext (S)', angle: "4° 32'", type: 'soft' },
  { rowPlanet: 'Mo', colPlanet: 'Me', label: 'Squ (S)', angle: "1° 50'", type: 'soft' },
  { rowPlanet: 'Mo', colPlanet: 'Ju', label: 'Trid (S)', angle: "1° 08'", type: 'soft' },
  { rowPlanet: 'Mo', colPlanet: 'Ve', label: 'Conj (S)', angle: "6° 10'", type: 'hard' },
  { rowPlanet: 'Mo', colPlanet: 'Sa', label: 'SSqu (E)', angle: "0° 44'", type: 'hard' },

  { rowPlanet: 'Ma', colPlanet: 'Me', label: 'Squ (A)', angle: "2° 13'", type: 'hard' },
  { rowPlanet: 'Ma', colPlanet: 'Ju', label: 'Deg5 (A)', angle: "1° 18'", type: 'soft' },
  { rowPlanet: 'Ma', colPlanet: 'Ve', label: 'Trin (A)', angle: "5° 23'", type: 'soft' },
  { rowPlanet: 'Ma', colPlanet: 'Sa', label: 'Sext (A)', angle: "1° 55'", type: 'soft' },

  { rowPlanet: 'Me', colPlanet: 'Ju', label: 'Sext (A)', angle: "4° 45'", type: 'soft' },
  { rowPlanet: 'Me', colPlanet: 'Ve', label: 'Biqu (A)', angle: "1° 55'", type: 'soft' },

  { rowPlanet: 'Ju', colPlanet: 'Ve', label: 'Trin (A)', angle: "6° 58'", type: 'soft' },
  { rowPlanet: 'Ju', colPlanet: 'Sa', label: 'Biqu (A)', angle: "1° 55'", type: 'soft' },
  { rowPlanet: 'Ju', colPlanet: 'Ra', label: 'Deci (A)', angle: "1° 55'", type: 'soft' },

  { rowPlanet: 'Ve', colPlanet: 'Sa', label: 'Trin (A)', angle: "6° 38'", type: 'soft' },
  { rowPlanet: 'Ve', colPlanet: 'Ra', label: 'SSqu (S)', angle: "1° 05'", type: 'hard' },
  { rowPlanet: 'Ve', colPlanet: 'Ke', label: 'Sessq (S)', angle: "1° 05'", type: 'hard' },

  { rowPlanet: 'Sa', colPlanet: 'Ra', label: 'SSqu (S)', angle: "1° 05'", type: 'hard' },
  { rowPlanet: 'Sa', colPlanet: 'Ke', label: 'Sessq (S)', angle: "1° 05'", type: 'hard' },
  { rowPlanet: 'Sa', colPlanet: 'Ur', label: 'Sext (S)', angle: "2° 36'", type: 'soft' },
  { rowPlanet: 'Sa', colPlanet: 'Ne', label: 'Trin (S)', angle: "7° 31'", type: 'soft' },

  { rowPlanet: 'Ra', colPlanet: 'Ke', label: 'Oppo (E)', angle: "0° 00'", type: 'hard' },
  { rowPlanet: 'Ra', colPlanet: 'Ur', label: 'Squ (S)', angle: "0° 00'", type: 'hard' },

  { rowPlanet: 'Ke', colPlanet: 'Ur', label: 'Squ (S)', angle: "4° 21'", type: 'hard' },
  { rowPlanet: 'Ke', colPlanet: 'Ne', label: 'Sext (S)', angle: "2° 36'", type: 'soft' },
  { rowPlanet: 'Ke', colPlanet: 'Pl', label: 'Trin (S)', angle: "7° 31'", type: 'soft' },
];
