import { RulingPlanets } from '../../types/kp';
import { calculateKPSubLord } from './subLordMapper';

const DAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/**
 * Calculates current Ruling Planets for a given date/time and location
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

  // Calculate Moon position for query timestamp
  // Approximate tropical/sidereal moon progression
  const nowMs = targetDate.getTime();
  const epochMs = new Date('2026-07-20T12:00:00').getTime();
  const diffDays = (nowMs - epochMs) / (1000 * 60 * 60 * 24);

  // Reference Moon degree on July 20, 2026 @ 12:00 PM: Virgo (~165° sidereal longitude)
  const refMoonDegree = 165;
  const currentMoonDegree = ((refMoonDegree + diffDays * 13.17639) % 360 + 360) % 360;

  // Reference Lagna degree on July 20, 2026 @ 12:00 PM in Kakinada: Virgo (~158° sidereal)
  const hoursSinceMidnight = targetDate.getHours() + targetDate.getMinutes() / 60;
  const currentLagnaDegree = ((158 + (hoursSinceMidnight - 12) * 15) % 360 + 360) % 360;

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
