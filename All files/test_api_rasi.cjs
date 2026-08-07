const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

function getHouseRelationship(idx1, idx2) {
  if (idx1 === idx2) return 'same sign';
  if (idx1 === -1 || idx2 === -1) return 'Unknown';
  // 1-indexed, meaning Aries=1...Pisces=12. Or just use 0-indexed if we map before.
  // let's assume idx1 and idx2 are 1 to 12.
  const dist1 = ((idx2 - idx1 + 12) % 12) + 1;
  const dist2 = ((idx1 - idx2 + 12) % 12) + 1;
  const min = Math.min(dist1, dist2);
  const max = Math.max(dist1, dist2);
  
  const getOrdinal = (n) => {
    if (n === 1) return '1st';
    if (n === 2) return '2nd';
    if (n === 3) return '3rd';
    return `${n}th`;
  };
  return `${getOrdinal(min)}/${getOrdinal(max)} houses from each other`;
}

console.log(getHouseRelationship(11, 8)); // Aquarius=11, Scorpio=8 => 4th/10th
console.log(getHouseRelationship(7, 6)); // Libra=7, Virgo=6 => 2nd/12th
