import { RulingPlanets } from '../../types/kp';
import { calculateKPSubLord } from './subLordMapper';
import { julian, sidereal, moonposition } from 'astronomia';
import { lahiriAyanamsa, toSidereal } from '../engines/LiveTransitEngine';

const DAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/**
 * Mean obliquity of the ecliptic (IAU 1980 formula, arcsecond precision is
 * more than sufficient here — this drifts by under 1 arcsecond/century).
 */
function meanObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const eps0 = 23 + 26 / 60 + 21.448 / 3600
    - (46.8150 / 3600) * T
    - (0.00059 / 3600) * T * T
    + (0.001813 / 3600) * T * T * T;
  return eps0 * (Math.PI / 180);
}

/**
 * Real tropical Ascendant (Lagna) degree for a given moment and location,
 * using the standard astronomical formula:
 *   tan(Asc) = -cos(RAMC) / (sin(RAMC)*cos(ε) + tan(φ)*sin(ε))
 * where RAMC is the local sidereal time expressed as an angle, ε is the
 * obliquity of the ecliptic, and φ is geographic latitude.
 */
function computeTropicalAscendant(jd: number, latitudeDeg: number, longitudeDeg: number): number {
  const gmstHours = sidereal.mean(jd) * (12 / Math.PI); // astronomia returns radians; convert to hours
  const lstHours = (gmstHours + longitudeDeg / 15 + 24) % 24;
  const ramcRad = (lstHours * 15) * (Math.PI / 180);
  const eps = meanObliquity(jd);
  const phi = latitudeDeg * (Math.PI / 180);

  const y = -Math.cos(ramcRad);
  const x = Math.sin(ramcRad) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps);
  let asc = Math.atan2(y, x) * (180 / Math.PI);
  asc = ((asc % 360) + 360) % 360;
  return asc;
}

/**
 * Calculates current Ruling Planets for a given date/time and location.
 *
 * PREVIOUSLY: both Moon and Lagna positions were derived from a crude
 * linear extrapolation off a single hardcoded reference epoch ("July 20,
 * 2026 @ 12:00 PM"), using the Moon's *average* daily motion
 * (13.17639°/day) and a flat 15°/hour rotation for Lagna. Real lunar
 * motion is non-linear (11.8°–15.4°/day depending on orbital position),
 * so this approximation could drift by hours' worth of nakshatra/sub-lord
 * placement error the further a query's date sits from the reference
 * epoch — a meaningful problem for Ruling Planets, whose entire purpose is
 * precise moment-to-moment star/sub lord identification. It also ignored
 * the latitude/longitude parameters for Lagna entirely (any location
 * produced the same Lagna degree).
 *
 * NOW: reuses the same real VSOP87/ELP2000 ephemeris and Lahiri ayanamsha
 * already proven accurate for Step 8 Transit Confirmation
 * (LiveTransitEngine.ts) for the Moon's true position, and computes a real
 * tropical Ascendant from local sidereal time (via astronomia's sidereal
 * module) + the obliquity of the ecliptic + the actual latitude supplied,
 * converted to sidereal via the same Lahiri ayanamsha.
 */
export function calculateRulingPlanets(
  dateStr?: string,
  timeStr?: string,
  latitude: number = 16.96036,
  longitude: number = 82.23809
): RulingPlanets {
  const targetDate = dateStr ? new Date(`${dateStr}T${timeStr || '12:00:00'}`) : new Date();

  // Day Lord based on day of week (0 = Sunday = Sun, 1 = Monday = Moon, etc.)
  const dayIndex = targetDate.getDay();
  const dayLord = DAY_LORDS[dayIndex];

  const jd = julian.CalendarGregorianToJD(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth() + 1,
    targetDate.getUTCDate() + targetDate.getUTCHours() / 24 + targetDate.getUTCMinutes() / 1440
  );
  const ayanamsa = lahiriAyanamsa(jd);

  // Real Moon position (ELP2000-based via astronomia), not a linear guess.
  const moonTropical = ((moonposition.position(jd).lon * 180) / Math.PI + 360) % 360;
  const currentMoonDegree = toSidereal(moonTropical, ayanamsa);

  // Real Ascendant from local sidereal time + actual latitude/longitude,
  // not a fixed 15°/hour approximation that ignored location entirely.
  const lagnaTropical = computeTropicalAscendant(jd, latitude, longitude);
  const currentLagnaDegree = toSidereal(lagnaTropical, ayanamsa);

  const lagnaKP = calculateKPSubLord(currentLagnaDegree);
  const moonKP = calculateKPSubLord(currentMoonDegree);

  return {
    lagnaSign: lagnaKP.sign,
    lagnaSignLord: lagnaKP.signLord,
    lagnaStarLord: lagnaKP.starLord,
    lagnaSubLord: lagnaKP.subLord,
    lagnaSubSubLord: lagnaKP.subSubLord,
    moonSign: moonKP.sign,
    moonSignLord: moonKP.signLord,
    moonStarLord: moonKP.starLord,
    moonSubLord: moonKP.subLord,
    moonSubSubLord: moonKP.subSubLord,
    dayLord,
    timestamp: targetDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  };
}