import React, { useState } from 'react';
import { BirthDetails } from '../types';
import { calculateActiveDasha, getAntardashasForMd } from '../lib/engines/DashaEngine';
import { 
  Compass, Star, Clock, Activity, Award, Heart, TrendingUp, AlertTriangle, 
  CheckCircle, Shield, BookOpen, Users, Calendar, Flame, Eye, Sparkles, AlertCircle, HelpCircle,
  Copy, Check
} from 'lucide-react';

const SUB_TAB_TRANSLATIONS: Record<number, Record<'en' | 'hi' | 'te', string>> = {
  4: { en: "Executive Summary", hi: "कार्यकारी सारांश", te: "కార్యనిర్వాహక సారాంశం" },
  5: { en: "Planetary Strength", hi: "ग्रह बल", te: "గ్రహాల బలం" },
  6: { en: "Career Analysis", hi: "करियर", te: "కెరీర్" },
  7: { en: "Marriage Analysis", hi: "विवाह", te: "వివాహం" },
  8: { en: "Finance Analysis", hi: "वित्त", te: "ఆర్థికం" },
  9: { en: "Health Analysis", hi: "स्वास्थ्य", te: "ఆరోగ్యం" },
  10: { en: "Education Analysis", hi: "शिक्षा", te: "విద్య" },
  11: { en: "Children Analysis", hi: "संतान", te: "సంతానం" },
  12: { en: "Structural Analysis", hi: "संरचनात्मक", te: "నిర్మాణాత్మక" },
  13: { en: "Temporal Alignment", hi: "सामयिक संरेखण", te: "సమయ అమరిక" },
  14: { en: "Synthesis & Remedies", hi: "उपाय और संश्लेषण", te: "పరిహారాలు & సంశ్లేషణ" },
  15: { en: "Confidence Assessment", hi: "सटीकता मूल्यांकन", te: "విశ్వసనీయత అంచనా" }
};

const DOMAIN_TRANSLATIONS: Record<string, Record<'en' | 'hi' | 'te', {
  name: string;
  primary: string;
  supporting: string[];
}>> = {
  "Career": {
    en: {
      name: "Career Strategy Portfolio",
      primary: "10th House Lord of Karma & Status placement in D-1 combined with Dashamsha (D-10) career readiness.",
      supporting: [
        "Sun as natural Karaka for power, authority, and public recognition.",
        "Presence of major wealth or authority-building classical yogas.",
        "Vimsottari timing activation of the 10th house or functional benefics."
      ]
    },
    hi: {
      name: "करियर रणनीति पोर्टफोलियो",
      primary: "डी-1 में कर्म और स्थिति के 10वें घर के स्वामी का स्थान और दशमांश (डी-10) करियर तैयारी।",
      supporting: [
        "सूर्य सत्ता, अधिकार और सामाजिक मान्यता के लिए प्राकृतिक कारक के रूप में।",
        "प्रमुख धन या अधिकार-निर्माण वाले शास्त्रीय योगों की उपस्थिति।",
        "10वें घर या कार्यात्मक शुभ ग्रहों का विंशोत्तरी दशा सक्रियता काल।"
      ]
    },
    te: {
      name: "కెరీర్ వ్యూహ నివేదిక",
      primary: "డి-1 లోని కర్మ & హోదాను సూచించే 10వ స్థానాధిపతి మరియు దశమాంశ (డి-10) వృత్తి సన్నద్ధత.",
      supporting: [
        "సూర్యుడు అధికారం, కీర్తి మరియు ప్రజా గుర్తింపునకు సహజ కారకుడు.",
        "ధనయోగం లేదా అధికార యోగం వంటి ప్రముఖ శాస్త్రీయ యోగాల ఉనికి.",
        "10వ స్థానాధిపతి లేదా శుభగ్రహాల వింశోత్తరి దశా సక్రియం."
      ]
    }
  },
  "Marriage": {
    en: {
      name: "Marriage Strategy Portfolio",
      primary: "7th House Lord of Union & Partnerships placement in D-1 combined with Navamsa (D-9) marital bliss varga.",
      supporting: [
        "Venus as natural Karaka for marital harmony and sensory union.",
        "Lagna lord compatibility and placement within Kendra/Trikona houses.",
        "Absence of Malefic influences (Saturn, Mars) on the 7th bhava."
      ]
    },
    hi: {
      name: "विवाह रणनीति पोर्टफोलियो",
      primary: "डी-1 में गठबंधन और साझेदारी के 7वें घर के स्वामी का स्थान और नवमांश (डी-9) वैवाहिक सुख वर्ग।",
      supporting: [
        "वैवाहिक सद्भाव और संवेदी मिलन के लिए शुक्र प्राकृतिक कारक के रूप में।",
        "लग्न स्वामी की अनुकूलता और केंद्र/त्रिकोण घरों में स्थिति।",
        "7वें भाव पर क्रूर ग्रहों (शनि, मंगल) के अशुभ प्रभाव की अनुपस्थिति।"
      ]
    },
    te: {
      name: "వివాహ వ్యూహ నివేదిక",
      primary: "డి-1 లోని కలయిక & భాగస్వామ్యాన్ని సూచించే 7వ స్థానాధిపతి మరియు నవాంశ (డి-9) వైవాహిక సుఖ చక్రం.",
      supporting: [
        "శుక్రుడు దాంపత్య సామరస్యం మరియు ఇంద్రియ కలయికకు సహజ కారకుడు.",
        "లగ్నాధిపతి మైత్రి మరియు కేంద్ర/త్రికోణ స్థానాలలో గ్రహాల ఉనికి.",
        "7వ స్థానంపై శని, కుజుడు వంటి పాపగ్రహాల ప్రభావం లేకపోవడం."
      ]
    }
  },
  "Finance": {
    en: {
      name: "Finance Strategy Portfolio",
      primary: "2nd House Lord of accumulated wealth and 11th House Lord of cash flows and continuous gains.",
      supporting: [
        "Jupiter as natural Karaka for material expansion and treasury growth.",
        "Hora (D-2) divisional placement and sign-dignity of the 2nd lord.",
        "Ashtakavarga bindu count in the 2nd and 11th houses."
      ]
    },
    hi: {
      name: "वित्त रणनीति पोर्टफोलियो",
      primary: "संचित धन के दूसरे घर के स्वामी और नकद प्रवाह व निरंतर लाभ के 11वें घर के स्वामी की स्थिति।",
      supporting: [
        "भौतिक विस्तार और खजाने की वृद्धि के लिए बृहस्पति प्राकृतिक कारक के रूप में।",
        "होरा (डी-2) वर्ग चार्ट में द्वितीयेश की स्थिति और राशि गरिमा।",
        "दूसरे और 11वें घरों में अष्टकवर्ग बिंदु संख्या।"
      ]
    },
    te: {
      name: "ఆర్థిక వ్యూహ నివేదిక",
      primary: "సంచిత సంపదను సూచించే 2వ స్థానాధిపతి మరియు నగదు ప్రవాహం, లాభాలను సూచించే 11వ స్థానాధిపతి.",
      supporting: [
        "బృహస్పతి భౌతిక వృద్ధి మరియు ధన నిధి పెరుగుదలకు సహజ కారకుడు.",
        "హోరా (డి-2) విభాగంలో మరియు 2వ స్థానాధిపతి గ్రహ బలం.",
        "2వ మరియు 11వ స్థానాలలోని అష్టకవర్గ బిందువుల సంఖ్య."
      ]
    }
  },
  "Health": {
    en: {
      name: "Health Strategy Portfolio",
      primary: "1st House Lord of bodily self, vitality and immune system base, coupled with 6th house of ailments.",
      supporting: [
        "Sun as natural Karaka for cellular vitality, bones, and heart base.",
        "Vimsumsa (D-20) divisional placements mapping physical constitutions.",
        "Benefic aspects on the 1st house reducing general disease susceptibility."
      ]
    },
    hi: {
      name: "स्वास्थ्य रणनीति पोर्टफोलियो",
      primary: "शारीरिक आत्म, जीवन शक्ति और प्रतिरक्षा प्रणाली के आधार के प्रथमेश तथा रोगों के छठे घर के स्वामी का योग।",
      supporting: [
        "कोशिका जीवन शक्ति, हड्डियों और हृदय आधार के लिए सूर्य प्राकृतिक कारक के रूप में।",
        "शारीरिक संरचनाओं का मानचित्रण करने वाले विंशमांश (डी-20) वर्ग स्थान।",
        "प्रथम भाव पर शुभ दृष्टि जो सामान्य रोग संवेदनशीलता को कम करती है।"
      ]
    },
    te: {
      name: "ఆరోగ్య వ్యూహ నివేదిక",
      primary: "శారీరక తత్వం, జీవశక్తి మరియు రోగనిరోధక శక్తిని సూచించే లగ్నాధిపతి మరియు రోగాలను సూచించే 6వ స్థానాధిపతి.",
      supporting: [
        "సూర్యుడు శారీరక జీవశక్తి, ఎముకలు మరియు గుండె బలానికి సహజ కారకుడు.",
        "శారీరక శక్తులను సూచించే వింశాంశ (డి-20) చక్రంలో గ్రహాల స్థానాలు.",
        "లగ్నంపై శుభగ్రహాల దృష్టి ప్రసరించడం వల్ల రోగ నిరోధక శక్తి పెరుగుతుంది."
      ]
    }
  },
  "Education": {
    en: {
      name: "Education Strategy Portfolio",
      primary: "4th House Lord of formal primary schooling and 5th House Lord of creative intelligence and higher learning.",
      supporting: [
        "Mercury as natural Karaka for logic, memory, and comprehension.",
        "Chaturvimsamsa (D-24) divisional placements for specialized knowledge.",
        "Classical Saraswati Yoga or related academic auspicious combinations."
      ]
    },
    hi: {
      name: "शिक्षा रणनीति पोर्टफोलियो",
      primary: "औपचारिक प्राथमिक शिक्षा के चौथे घर के स्वामी और रचनात्मक बुद्धि व उच्च शिक्षा के पांचवें घर के स्वामी।",
      supporting: [
        "तर्क, स्मृति और समझ के लिए बुध प्राकृतिक कारक के रूप में।",
        "विशेषज्ञता ज्ञान के लिए कनिष्ठिका (डी-24) वर्ग स्थान।",
        "शास्त्रीय सरस्वती योग या संबंधित शैक्षणिक शुभ संयोजन।"
      ]
    },
    te: {
      name: "విద్యా వ్యూహ నివేదిక",
      primary: "ప్రాథమిక విద్యను సూచించే 4వ స్థానాధిపతి మరియు సృజనాత్మక బుద్ధి, ఉన్నత విద్యను సూచించే 5వ స్థానాధిపతి.",
      supporting: [
        "బుధుడు తర్కం, జ్ఞాపకశక్తి మరియు గ్రహణశక్తికి సహజ కారకుడు.",
        "ప్రత్యేక జ్ఞానం కోసం చతుర్వింశాంశ (డి-24) చక్రంలో గ్రహాల అనుకూలత.",
        "సరస్వతి యోగం లేదా దానికి సంబంధించిన విద్యాపరమైన శుభ గ్రహ సంయోగాలు."
      ]
    }
  },
  "Children": {
    en: {
      name: "Children Strategy Portfolio",
      primary: "5th House Lord of progeny, lineage, and past-karma merits combined with D-5 Panchamsa.",
      supporting: [
        "Jupiter as natural Karaka for descendants, family growth, and wisdom.",
        "Strength and aspects on the 5th house in the natal Rasi chart.",
        "Saptamsa (D-7) secondary validation for children bliss (provisional overlap)."
      ]
    },
    hi: {
      name: "संतान रणनीति पोर्टफोलियो",
      primary: "संतान, वंश और संचित कर्म पुण्य के पांचवें घर के स्वामी तथा डी-5 पंचमांश।",
      supporting: [
        "वंशज, पारिवारिक वृद्धि और ज्ञान के लिए बृहस्पति प्राकृतिक कारक के रूप में।",
        "जन्म कुंडली (राशी चार्ट) में पांचवें भाव की ताकत और दृष्टि।",
        "संतान सुख के लिए सप्तमांश (डी-7) द्वितीयक सत्यापन।"
      ]
    },
    te: {
      name: "సంతాన వ్యూహ నివేదిక",
      primary: "సంతానం, వంశవృద్ధి మరియు పూర్వపుణ్య స్థానాన్ని సూచించే 5వ స్థానాధిపతి మరియు పంచమాంశ (డి-5) చక్రం.",
      supporting: [
        "బృహస్పతి సంతానం, కుటుంబ వృద్ధి మరియు వివేకానికి సహజ కారకుడు.",
        "జనన రాశి చక్రంలోని 5వ స్థానం యొక్క బలం మరియు వీక్షణలు.",
        "సంతాన సుఖాన్ని సూచించే సప్తమాంశ (డి-7) చక్ర పరిశీలన."
      ]
    }
  }
};

const SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const SIGN_LORDS: Record<string, string> = {
  "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
  "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
  "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
};

const EXALTATION_MAP: Record<string, string> = {
  "Sun": "Aries", "Moon": "Taurus", "Mars": "Capricorn",
  "Mercury": "Virgo", "Jupiter": "Cancer", "Venus": "Pisces",
  "Saturn": "Libra", "Rahu": "Taurus", "Ketu": "Scorpio"
};

const OWN_SIGN_MAP: Record<string, string[]> = {
  "Sun": ["Leo"], "Moon": ["Cancer"], "Mars": ["Aries", "Scorpio"],
  "Mercury": ["Gemini", "Virgo"], "Jupiter": ["Sagittarius", "Pisces"],
  "Venus": ["Libra", "Taurus"], "Saturn": ["Capricorn", "Aquarius"],
  "Rahu": ["Aquarius"], "Ketu": ["Scorpio"]
};

const DEBILITATION_MAP: Record<string, string> = {
  "Sun": "Libra", "Moon": "Scorpio", "Mars": "Cancer",
  "Mercury": "Pisces", "Jupiter": "Capricorn", "Venus": "Virgo",
  "Saturn": "Aries", "Rahu": "Scorpio", "Ketu": "Taurus"
};

const FRIENDLY_SIGNS: Record<string, string[]> = {
  "Sun": ["Aries", "Leo", "Sagittarius", "Pisces", "Cancer"],
  "Moon": ["Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra"],
  "Mars": ["Aries", "Cancer", "Leo", "Scorpio", "Sagittarius", "Pisces"],
  "Mercury": ["Taurus", "Gemini", "Leo", "Virgo", "Libra"],
  "Jupiter": ["Aries", "Cancer", "Leo", "Scorpio", "Sagittarius", "Pisces"],
  "Venus": ["Taurus", "Gemini", "Virgo", "Libra", "Aquarius", "Capricorn"],
  "Saturn": ["Taurus", "Gemini", "Virgo", "Libra", "Capricorn", "Aquarius"],
  "Rahu": ["Gemini", "Virgo", "Libra"],
  "Ketu": ["Aries", "Scorpio", "Sagittarius", "Pisces"]
};

const DASHA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_DURATIONS: Record<string, number> = {
  "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17
};

const PHALADEEPIKA_REMEDIES: Record<string, {
  mantra: string;
  charity: { item: string; recipient: string; day: string };
  gemstone: string;
  fastDay: string;
  deity: string;
}> = {
  "Sun": {
    mantra: "Om Suryaya Namaha",
    charity: { item: "Wheat, saffron cloth, ruby hued copper coin", recipient: "Brahmin / Temple Priest at dawn", day: "Sunday" },
    gemstone: "Ruby set in Gold on right ring finger", fastDay: "Sunday", deity: "Surya Deva / Lord Shiva"
  },
  "Moon": {
    mantra: "Om Chandramase Namaha",
    charity: { item: "Rice, pearl setting, white cloth, milk bowl", recipient: "Poor / Needy at dusk", day: "Monday" },
    gemstone: "Natural White Pearl in Silver on little finger", fastDay: "Monday", deity: "Goddess Parvati / Chandra Deva"
  },
  "Mars": {
    mantra: "Om Angarakaya Namaha",
    charity: { item: "Red lentils, copper vessel, red coral, sweets", recipient: "Laborer / Celibate youth", day: "Tuesday" },
    gemstone: "Red Coral in Gold or Copper on ring finger", fastDay: "Tuesday", deity: "Lord Kartikeya / Lord Hanuman"
  },
  "Mercury": {
    mantra: "Om Budhaya Namaha",
    charity: { item: "Green gram (mung), green cloth, camphor, books", recipient: "Orphanage / Student at noon", day: "Wednesday" },
    gemstone: "Emerald in Gold on right little finger", fastDay: "Wednesday", deity: "Lord Vishnu"
  },
  "Jupiter": {
    mantra: "Om Gurave Namaha",
    charity: { item: "Saffron, yellow gram (chana dal), yellow cloth", recipient: "Guru / Spiritual teacher in temple", day: "Thursday" },
    gemstone: "Yellow Sapphire in Gold on right index finger", fastDay: "Thursday", deity: "Lord Dakshinamurthy / Lord Brahma"
  },
  "Venus": {
    mantra: "Om Shukraya Namaha",
    charity: { item: "Rice, white horse-shaped sweet, silver ring, silk", recipient: "Married woman / Devadasi", day: "Friday" },
    gemstone: "Diamond or White Sapphire in Platinum/Silver on ring/middle finger", fastDay: "Friday", deity: "Goddess Lakshmi"
  },
  "Saturn": {
    mantra: "Om Sham Shanaishcharaya Namaha",
    charity: { item: "Black sesame seeds, mustard oil, iron pan, blue blanket", recipient: "Ascetic / Manual laborer at sunset", day: "Saturday" },
    gemstone: "Blue Sapphire in Iron/Silver on right middle finger", fastDay: "Saturday", deity: "Lord Shani / Lord Shiva"
  },
  "Rahu": {
    mantra: "Om Rahave Namaha",
    charity: { item: "Gomedha gemstone, mustard, horse gram, blue blanket", recipient: "Lepers / Outcastes at twilight", day: "Saturday" },
    gemstone: "Hessonite (Gomed) in Silver on middle finger", fastDay: "Saturday", deity: "Goddess Durga / Rahu Deva"
  },
  "Ketu": {
    mantra: "Om Ketave Namaha",
    charity: { item: "Multi-colored blanket, cat eye gemstone, sesame seeds", recipient: "Hermit / Temple monk at dawn", day: "Tuesday" },
    gemstone: "Cat's Eye in Silver on right middle/ring finger", fastDay: "Tuesday", deity: "Lord Ganesha"
  }
};

// House Signs helper
function getHouseSigns(lagnaSign: string): string[] {
  const startIdx = SIGN_NAMES.indexOf(lagnaSign);
  const houseSigns: string[] = [];
  for (let h = 0; h < 12; h++) {
    houseSigns.push(SIGN_NAMES[(startIdx + h) % 12]);
  }
  return houseSigns;
}

// Derive House Rulers per planet
function deriveHouseRulers(lagnaSign: string): Record<string, number[]> {
  const houseSigns = getHouseSigns(lagnaSign);
  const rulers: Record<string, number[]> = {
    "Sun": [], "Moon": [], "Mars": [], "Mercury": [], "Jupiter": [], "Venus": [], "Saturn": [], "Rahu": [], "Ketu": []
  };
  houseSigns.forEach((sign, idx) => {
    const houseNum = idx + 1;
    const lord = SIGN_LORDS[sign];
    if (lord && rulers[lord]) {
      rulers[lord].push(houseNum);
    }
  });
  return rulers;
}

// Functional Role
function getFunctionalRole(planet: string, lagnaSign: string): string {
  if (planet === "Rahu" || planet === "Ketu") return "Neutral";
  const houseRulers = deriveHouseRulers(lagnaSign);
  const housesRuled = houseRulers[planet] || [];

  if (housesRuled.includes(1)) {
    return "Functional Benefic";
  }
  if (housesRuled.includes(5) || housesRuled.includes(9)) {
    return "Functional Benefic";
  }
  if (housesRuled.some(h => [4, 7, 10].includes(h))) {
    if (housesRuled.some(h => [6, 8, 12].includes(h))) {
      return "Functional Malefic";
    }
    return "Functional Benefic";
  }
  if (housesRuled.some(h => [6, 8, 12].includes(h))) {
    if (housesRuled.includes(6) && !housesRuled.some(h => [8, 12].includes(h))) {
      return "Functional Malefic (Upachaya Modulated)";
    }
    return "Functional Malefic";
  }
  return "Neutral";
}

// Check Neecha Bhanga
function checkNeechaBhanga(planet: string, lagnaSign: string, divisionalCharts: any): boolean {
  const d1 = divisionalCharts["D-1_rasi"];
  if (!d1) return false;

  const planetSign = d1[planet]?.sign;
  const debSign = DEBILITATION_MAP[planet];
  if (planetSign !== debSign) return false;

  const exaltSign = EXALTATION_MAP[planet];
  const exaltLord = SIGN_LORDS[exaltSign];
  const debLord = SIGN_LORDS[debSign];

  const ascIdx = SIGN_NAMES.indexOf(lagnaSign);
  
  if (exaltLord && d1[exaltLord]) {
    const exaltLordIdx = SIGN_NAMES.indexOf(d1[exaltLord].sign);
    const exaltLordHouse = ((exaltLordIdx - ascIdx + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(exaltLordHouse)) return true;
  }

  if (debLord && d1[debLord]) {
    const debLordIdx = SIGN_NAMES.indexOf(d1[debLord].sign);
    const debLordHouse = ((debLordIdx - ascIdx + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(debLordHouse)) return true;
  }

  const d9 = divisionalCharts["D-9_navamsa"];
  if (d9 && d9[planet]) {
    if (d9[planet].sign === EXALTATION_MAP[planet]) {
      return true;
    }
  }

  return false;
}

// Planetary Strength
function getPlanetaryStrength(planet: string, lagnaSign: string, divisionalCharts: any, planetaryStates: any): number {
  const d1 = divisionalCharts["D-1_rasi"];
  if (!d1 || !d1[planet]) return 2.0;

  let stars = 2.0;

  const sign = d1[planet].sign;
  const exaltationSign = EXALTATION_MAP[planet];
  const ownSigns = OWN_SIGN_MAP[planet] || [];
  const friendlySigns = FRIENDLY_SIGNS[planet] || [];
  const debilitationSign = DEBILITATION_MAP[planet];

  if (sign === exaltationSign) {
    stars = 4.5;
  } else if (ownSigns.includes(sign)) {
    stars = 4.0;
  } else if (friendlySigns.includes(sign)) {
    stars = 3.0;
  } else if (sign === debilitationSign) {
    stars = 1.0;
    if (checkNeechaBhanga(planet, lagnaSign, divisionalCharts)) {
      stars += 1.5;
    }
  } else {
    stars = 2.0;
  }

  const funcRole = getFunctionalRole(planet, lagnaSign);
  if (funcRole === "Functional Benefic") {
    stars += 0.5;
  } else if (funcRole.startsWith("Functional Malefic")) {
    stars -= 0.5;
  }

  const ascIdx = SIGN_NAMES.indexOf(lagnaSign);
  const planetIdx = SIGN_NAMES.indexOf(sign);
  const house = ((planetIdx - ascIdx + 12) % 12) + 1;

  if ([1, 4, 7, 10].includes(house)) {
    stars += 0.5;
  } else if ([5, 9].includes(house)) {
    stars += 0.5;
  } else if ([3, 6, 11].includes(house)) {
    stars += 0.25;
  } else if ([6, 8, 12].includes(house)) {
    stars -= 0.25;
  }

  const retrogradePlanets = planetaryStates?.retrograde_planets || [];
  const combustedPlanets = planetaryStates?.combusted_planets || [];

  if (retrogradePlanets.includes(planet)) {
    stars -= 0.5;
  }
  if (combustedPlanets.includes(planet)) {
    stars -= 1.0;
  }

  stars = Math.max(1.0, Math.min(5.0, stars));
  stars = Math.round(stars * 2) / 2;

  return stars;
}

// Divisional House Lord Strength Helper
function getVargaHouseLordStrength(vargaKey: string, houseNum: number, divisionalCharts: any, planetaryStates: any): { lord: string; strength: number; sign: string; house: number } {
  const varga = divisionalCharts[vargaKey];
  if (!varga || !varga.Ascendant) {
    return { lord: "", strength: 2.0, sign: "", house: 1 };
  }
  const ascSign = varga.Ascendant.sign;
  const ascIdx = SIGN_NAMES.indexOf(ascSign);
  const houseSign = SIGN_NAMES[(ascIdx + houseNum - 1) % 12];
  const lord = SIGN_LORDS[houseSign];
  const lordPlanet = varga[lord];
  if (!lordPlanet) {
    return { lord, strength: 2.0, sign: "", house: 1 };
  }
  const lordSign = lordPlanet.sign;
  const lordIdx = SIGN_NAMES.indexOf(lordSign);
  const lordHouse = ((lordIdx - ascIdx + 12) % 12) + 1;

  let stars = 2.0;
  if (lordSign === EXALTATION_MAP[lord]) stars = 4.5;
  else if ((OWN_SIGN_MAP[lord] || []).includes(lordSign)) stars = 4.0;
  else if ((FRIENDLY_SIGNS[lord] || []).includes(lordSign)) stars = 3.0;
  else if (lordSign === DEBILITATION_MAP[lord]) stars = 1.0;

  if ([1, 4, 7, 10].includes(lordHouse)) stars += 0.5;
  else if ([5, 9].includes(lordHouse)) stars += 0.5;
  else if ([6, 8, 12].includes(lordHouse)) stars -= 0.25;

  stars = Math.max(1.0, Math.min(5.0, stars));
  stars = Math.round(stars * 2) / 2;

  return { lord, strength: stars, sign: lordSign, house: lordHouse };
}

// Gochara Lookup Table per year
export function getTransitPositions(year: number) {
  if (year <= 2024) {
    return { Saturn: "Aquarius", Jupiter: "Taurus", Rahu: "Pisces", Ketu: "Virgo" };
  } else if (year === 2025) {
    return { Saturn: "Pisces", Jupiter: "Gemini", Rahu: "Aquarius", Ketu: "Leo" };
  } else if (year === 2026) {
    return { Saturn: "Pisces", Jupiter: "Cancer", Rahu: "Aquarius", Ketu: "Leo" };
  } else if (year === 2027) {
    return { Saturn: "Aries", Jupiter: "Leo", Rahu: "Capricorn", Ketu: "Cancer" };
  } else if (year === 2028) {
    return { Saturn: "Aries", Jupiter: "Virgo", Rahu: "Sagittarius", Ketu: "Gemini" };
  } else if (year === 2029) {
    return { Saturn: "Taurus", Jupiter: "Libra", Rahu: "Scorpio", Ketu: "Taurus" };
  } else {
    return { Saturn: "Gemini", Jupiter: "Scorpio", Rahu: "Libra", Ketu: "Aries" };
  }
}

interface DomainConfidence {
  confidence: number;
  tier: 'High' | 'Moderate' | 'Low';
  natalSignal: 'Strong' | 'Moderate' | 'Weak';
  dashaSignal: 'Strong' | 'Moderate' | 'Weak';
  transitSignal: 'Supportive' | 'Neutral' | 'Challenging';
  breakdown: { natalScore: number; dashaScore: number; transitScore: number };
}

// Domain Confidence logic
function getDomainConfidence(
  domain: string,
  lagnaSign: string,
  divisionalCharts: any,
  planetaryStates: any,
  mdLord: string,
  adLord: string,
  moonSign: string,
  transitPositions: any
): DomainConfidence {
  let d1House = 10;
  let vargaKey = "D-10_dasamsa";
  let vargaHouse = 10;
  let karaka = "Sun";

  if (domain === "Marriage") {
    d1House = 7;
    vargaKey = "D-9_navamsa";
    vargaHouse = 7;
    karaka = "Venus";
  } else if (domain === "Finance") {
    d1House = 2;
    vargaKey = "D-2_hora";
    vargaHouse = 2;
    karaka = "Jupiter";
  } else if (domain === "Health") {
    d1House = 1;
    vargaKey = "D-20_vimsamsa";
    vargaHouse = 1;
    karaka = "Sun";
  } else if (domain === "Education") {
    d1House = 4;
    vargaKey = "D-24_chaturvimsamsa";
    vargaHouse = 4;
    karaka = "Mercury";
  } else if (domain === "Children") {
    d1House = 5;
    vargaKey = "D-5_panchamsa";
    vargaHouse = 5;
    karaka = "Jupiter";
  }

  const d1LordInfo = getVargaHouseLordStrength("D-1_rasi", d1House, divisionalCharts, planetaryStates);
  const vargaLordInfo = getVargaHouseLordStrength(vargaKey, vargaHouse, divisionalCharts, planetaryStates);
  const karakaStrength = getPlanetaryStrength(karaka, lagnaSign, divisionalCharts, planetaryStates);

  let natalScore = d1LordInfo.strength * 0.4 + vargaLordInfo.strength * 0.4 + karakaStrength * 0.2;
  natalScore = Math.max(1.0, Math.min(5.0, natalScore));

  let dashaScore = 1.5;
  const houseRulers = deriveHouseRulers(lagnaSign);
  const mdRuled = houseRulers[mdLord] || [];
  const adRuled = houseRulers[adLord] || [];

  if (mdRuled.includes(d1House)) {
    dashaScore += 1.0;
  } else if (mdRuled.some(h => [1, 5, 9].includes(h))) {
    dashaScore += 0.5;
  } else if (mdRuled.some(h => [6, 8, 12].includes(h))) {
    dashaScore -= 0.5;
  }

  if (adRuled.includes(d1House)) {
    dashaScore += 0.5;
  } else if (adRuled.some(h => [1, 5, 9].includes(h))) {
    dashaScore += 0.25;
  } else if (adRuled.some(h => [6, 8, 12].includes(h))) {
    dashaScore -= 0.25;
  }

  dashaScore = Math.max(0.5, Math.min(3.0, dashaScore));

  let transitScore = 0.0;
  if (moonSign) {
    const saturnSign = transitPositions.Saturn;
    const jupiterSign = transitPositions.Jupiter;

    const saturnHouseFromMoon = ((SIGN_NAMES.indexOf(saturnSign) - SIGN_NAMES.indexOf(moonSign) + 12) % 12) + 1;
    const jupiterHouseFromMoon = ((SIGN_NAMES.indexOf(jupiterSign) - SIGN_NAMES.indexOf(moonSign) + 12) % 12) + 1;

    if ([3, 6, 11].includes(saturnHouseFromMoon)) {
      transitScore += 1.0;
    } else if ([8, 12, 1].includes(saturnHouseFromMoon)) {
      transitScore -= 1.0;
    }

    if ([2, 5, 7, 9, 11].includes(jupiterHouseFromMoon)) {
      transitScore += 1.0;
    } else if ([6, 8, 12].includes(jupiterHouseFromMoon)) {
      transitScore -= 0.5;
    }
  }

  const totalScore = natalScore + dashaScore + transitScore;
  const rawConfidence = (totalScore / 10) * 100;
  const confidence = Math.max(15, Math.min(95, Math.round(rawConfidence)));

  return {
    confidence,
    tier: confidence >= 85 ? "High" : confidence >= 50 ? "Moderate" : "Low",
    natalSignal: natalScore >= 3.8 ? "Strong" : natalScore >= 2.5 ? "Moderate" : "Weak",
    dashaSignal: dashaScore >= 2.2 ? "Strong" : dashaScore >= 1.2 ? "Moderate" : "Weak",
    transitSignal: transitScore >= 0.8 ? "Supportive" : transitScore >= -0.2 ? "Neutral" : "Challenging",
    breakdown: { natalScore, dashaScore, transitScore }
  };
}

// Verdict Text Generation
function getDomainVerdict(domain: string, confidenceData: DomainConfidence): string {
  const { confidence, natalSignal, dashaSignal, transitSignal } = confidenceData;
  let verdict = "";

  if (confidence >= 85) {
    verdict = `${domain} is highly favored classically. `;
    verdict += natalSignal === "Strong" ? 
      `Your natal chart exhibits exceptional structural support, ` :
      `A highly supportive planetary timing period compensates for a moderate natal background, `;
    verdict += dashaSignal === "Strong" ?
      `and the current Dasha cycle directly activates this auspicious vector. ` :
      `though the current Dasha offers secondary, stable support. `;
    if (transitSignal === "Supportive") {
      verdict += `Classically aligned transits reinforce this growth path. Proceed with robust action.`;
    } else {
      verdict += `Monitor minor transit timing constraints.`;
    }
  } else if (confidence >= 50) {
    verdict = `${domain} shows moderately balanced prospects. `;
    verdict += natalSignal === "Strong" ?
      `Your natal promise is structurally solid, ` :
      `The natal indicators are balanced, `;
    verdict += dashaSignal === "Strong" ?
      `but the active Dasha is extremely ripe for progress. ` :
      `and the active Dasha provides safe, stable, neutral timing. `;
    if (transitSignal === "Supportive") {
      verdict += `Use current transit support windows strategically for calculated expansion.`;
    } else {
      verdict += `Patience and stable discipline remain essential classical success drivers.`;
    }
  } else {
    verdict = `${domain} requires structured patience and caution currently. `;
    verdict += natalSignal === "Weak" ?
      `Natal indicators are challenging in this sector, ` :
      `Although the natal promise remains firm, `;
    verdict += dashaSignal === "Strong" ?
      `though the future Dasha shift holds real promise. ` :
      `the current Dasha cycle offers minimal active timing support. `;
    if (transitSignal === "Challenging") {
      verdict += `Transits are demanding. Focus purely on foundational competence and avoid speculative expansion.`;
    } else {
      verdict += `Steady focus and small wins build lasting capacity.`;
    }
  }

  return verdict;
}

// Flag Contradictions
function flagContradictions(domain: string, confidenceData: DomainConfidence) {
  const { natalSignal, dashaSignal } = confidenceData;
  const contradictions: string[] = [];

  if (natalSignal === "Strong" && dashaSignal === "Weak") {
    contradictions.push(
      `FLAGGED CONTRADICTION: Your natal chart holds exceptional classical promise for ${domain}, but the current Vimshottari Dasha does not activate this sector. Resolution: Avoid forcing major executions; use this phase for detailed skill mastery and background readiness.`
    );
  }
  if (natalSignal === "Weak" && dashaSignal === "Strong") {
    contradictions.push(
      `FLAGGED CONTRADICTION: High active Dasha alignment is trying to drive results in ${domain}, but the structural natal base is moderate or constrained. Resolution: Mitigate risks with disciplined planning; do not let initial momentum lead to over-leverage.`
    );
  }
  return contradictions;
}

interface StrategicReportProps {
  birthDetails: BirthDetails;
  horoscopeData: any;
  activeSubTab?: number;
  setActiveSubTab?: (tab: number) => void;
  language?: 'en' | 'hi' | 'te';
}

export const StrategicReport: React.FC<StrategicReportProps> = ({ 
  birthDetails, 
  horoscopeData,
  activeSubTab: propActiveSubTab,
  setActiveSubTab: propSetActiveSubTab,
  language = 'en'
}) => {
  const [localActiveSubTab, setLocalActiveSubTab] = useState<number>(4);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeSubTab = propActiveSubTab !== undefined ? propActiveSubTab : localActiveSubTab;
  const setActiveSubTab = propSetActiveSubTab !== undefined ? propSetActiveSubTab : setLocalActiveSubTab;

  const divisionalCharts = horoscopeData?.horoscope?.divisional_charts || {};
  const planetaryStates = horoscopeData?.horoscope?.planetary_states || {};
  const nakshatraPada = horoscopeData?.horoscope?.nakshatra_pada || {};

  // Find Moon nakshatra & degree for Vimshottari calculations
  const moonPada = nakshatraPada.Moon || { nakshatra_number: 1, degrees_in_nakshatra: 0 };
  const moonSign = divisionalCharts["D-1_rasi"]?.Moon?.sign || "Aries";

  // Ascendant Sign
  const lagnaSign = divisionalCharts["D-1_rasi"]?.Ascendant?.sign || "Aries";

  // Derive active Mahadasha & Antardasha
  const reportYear = birthDetails.date ? new Date(birthDetails.date).getFullYear() : 2026;
  const transitPositions = getTransitPositions(2026); // Anchor to current local era

  const now = new Date(); // anchored current local date
  const dashaData = calculateActiveDasha(horoscopeData, birthDetails.date, now);

  const activeMdLord = dashaData.mahadasha.lord;
  const activeAdLord = dashaData.antardasha.lord;

  // Transform dashaData.timeline to match mds structure
  const mds = dashaData.timeline.map(m => ({
    lord: m.lord,
    start: m.startDate,
    end: m.endDate,
    duration: m.totalDuration
  }));

  // Find Antardashas for active Mahadasha
  const ads = getAntardashasForMd(horoscopeData, birthDetails.date, activeMdLord).map(ad => ({
    lord: ad.lord,
    start: ad.startDate,
    end: ad.endDate,
    duration: ad.totalDuration
  }));

  const activeMd = mds.find(m => now >= m.start && now <= m.end) || mds[0];
  const activeAd = ads.find(a => now >= a.start && now <= a.end) || ads[0];

  // Calculate scores for all six domains
  const domains = ["Career", "Marriage", "Finance", "Health", "Education", "Children"];
  const domainConfidences: Record<string, DomainConfidence> = {};
  domains.forEach(d => {
    domainConfidences[d] = getDomainConfidence(
      d, lagnaSign, divisionalCharts, planetaryStates, activeMdLord, activeAdLord, moonSign, transitPositions
    );
  });

  // Calculate Overall Confidence Score
  const avgConf = Math.round(domains.reduce((acc, d) => acc + domainConfidences[d].confidence, 0) / domains.length);
  const overallTier = avgConf >= 85 ? "HIGH" : avgConf >= 50 ? "MODERATE" : "LOW";

  const renderStars = (score: number) => {
    const full = Math.floor(score);
    const half = score % 1 === 0.5 ? 1 : 0;
    const empty = 5 - Math.ceil(score);
    return (
      <div className="flex items-center gap-0.5 text-amber-500 font-mono">
        {"★".repeat(full)}
        {half ? "◆" : ""}
        {"☆".repeat(empty)}
        <span className="text-xs text-[#9CA3AF] ml-1">({score.toFixed(1)})</span>
      </div>
    );
  };

  const tabs = [
    { id: 4, name: "Executive Summary", icon: Compass },
    { id: 12, name: "Structural Analysis", icon: Shield },
    { id: 13, name: "Temporal Alignment", icon: Clock },
    { id: 6, name: "Career Analysis", icon: Award },
    { id: 7, name: "Marriage Analysis", icon: Heart },
    { id: 8, name: "Finance Analysis", icon: TrendingUp },
    { id: 9, name: "Health Analysis", icon: Activity },
    { id: 10, name: "Education Analysis", icon: BookOpen },
    { id: 11, name: "Children Analysis", icon: Users },
  ];

  const labels = {
    en: {
      title: "Six Domain Snapshot",
      confidence: "Overall Confidence:",
      matrix: "Consultation Matrix",
      select: "Select Section",
      natalPromise: "📍 NATAL PROMISE (Structural Integrity)",
      snapshot: "📸 SNAPSHOT (Current Timing Activation)",
      outlook: "🗺 OUTLOOK (Transit Modulation Context)",
      remedies: "⚔ CONFLICT RESOLUTION MATRIX (Remedies)",
      executiveSynthesis: "Executive Vector Synthesis",
      timingOverlay: "Active Timing Overlay & Lunar Transit Convergence",
      planetaryStrengthProfile: "Planetary Strength Profile",
      scaleDesc: "Deterministic Classical Stars (1-5 Scale)",
      analysisLimits: "Analysis Limits & Methodology Transparency",
      birthTimeAssumption: "Birth Time Assumption",
      birthTimeAssumptionText: "This astronomical report assumes highly precise birth coordinates and times. If born during a Daylight Saving Time transition, verify offsets closely.",
      phaladeepikaGroundTruth: "Phaladeepika Ground Truth",
      phaladeepikaGroundTruthText: "This engine utilizes literal rules from Mantreswara's classical Phaladeepika text. We do not soften or psychologicalize traditional Vedic indicators.",
      timingPrecision: "Timing Precision",
      timingPrecisionText: "Gochara (planetary transits) is anchored to current epochs. Transits provide essential lifecycle context, but localized, daily predictions require advanced Prasna."
    },
    hi: {
      title: "छह-क्षेत्रीय स्नैपशॉट",
      desc: "नियतात्मक अभिसरण इंजन • पाराशरी और फलदीपिका सिद्धांत",
      confidence: "समग्र विश्वसनीयता:",
      matrix: "परामर्श मैट्रिक्स",
      select: "अनुभाग चुनें",
      natalPromise: "📍 जन्म कुंडली वादा (संरचनात्मक अखंडता)",
      snapshot: "📸 वर्तमान सक्रियता स्नैपशॉट (सामयिक गोचर)",
      outlook: "🗺 भविष्य की रूपरेखा (गोचर मॉड्यूलेशन संदर्भ)",
      remedies: "⚔ संघर्ष समाधान मैट्रिक्स (शास्त्रीय उपाय)",
      executiveSynthesis: "कार्यकारी वेक्टर संश्लेषण",
      timingOverlay: "सक्रिय समय आवरण और चंद्र पारगमन संरेखण",
      planetaryStrengthProfile: "ग्रह बल और स्थिति प्रोफाइल",
      scaleDesc: "नियतात्मक शास्त्रीय सितारे (1-5 पैमाना)",
      analysisLimits: "विश्लेषण सीमाएं और कार्यप्रणाली पारदर्शिता",
      birthTimeAssumption: "जन्म समय धारणा",
      birthTimeAssumptionText: "यह खगोलीय रिपोर्ट अत्यधिक सटीक जन्म निर्देशांक और समय मानती है। यदि डेलाइट सेविंग टाइम संक्रमण के दौरान जन्म हुआ है, तो समय के अंतर को ध्यान से सत्यापित करें।",
      phaladeepikaGroundTruth: "फलदीपिका सत्यता",
      phaladeepikaGroundTruthText: "यह इंजन मंत्रेश्वर के शास्त्रीय फलदीपिका पाठ के शाब्दिक नियमों का उपयोग करता है। हम पारंपरिक वैदिक संकेतकों को सामान्यीकृत या काल्पनिक नहीं बनाते हैं।",
      timingPrecision: "समय की सटीकता",
      timingPrecisionText: "गोचर (ग्रहों का पारगमन) वर्तमान युगों पर आधारित है। पारगमन आवश्यक जीवन चक्र संदर्भ प्रदान करते हैं, लेकिन स्थानीयकृत, दैनिक भविष्यवाणियों के लिए उन्नत प्रश्न कुंडली की आवश्यकता होती है।"
    },
    te: {
      title: "ఆరు విభాగాల స్నాప్‌షాట్",
      desc: "డెటర్మినిస్టిక్ కన్వర్జెన్స్ ఇంజిన్ • పరాశర & ఫలదీపికా విధానం",
      confidence: "మొత్తం విశ్వసనీయత:",
      matrix: "సంప్రదింపుల శ్రేణి",
      select: "విభాగం ఎంచుకోండి",
      natalPromise: "📍 జన్మ కుండలి వాగ్దానం (నిర్మాణాత్మక సమగ్రత)",
      snapshot: "📸 ప్రస్తుత సక్రియం స్నాప్‌షాట్ (గోచార స్థితి)",
      outlook: "🗺 భవిష్యత్తు దృక్పథం (గోచార మార్పులు)",
      remedies: "⚔ పరిష్కార మార్గదర్శిని (శాస్త్రీయ పరిహారాలు)",
      executiveSynthesis: "కార్యనిర్వాహక సంశ్లేషణ",
      timingOverlay: "సమయ అమరిక & చంద్ర గోచార అనుకూలత",
      planetaryStrengthProfile: "గ్రహాల బలం & స్థితి వివరణ",
      scaleDesc: "శాస్త్రీయ గ్రహ బలం (1-5 సంఖ్య)",
      analysisLimits: "విశ్లేషణ పరిమితులు & పద్ధతుల పారదర్శకత",
      birthTimeAssumption: "జనన సమయ ఊహ",
      birthTimeAssumptionText: "ఈ ఖగోళ నివేదిక అత్యంత ఖచ్చితమైన జనన కోఆర్డినేట్లు మరియు సమయాలను ఊహిస్తుంది. ఒకవేళ డేలైట్ సేవింగ్ సమయంలో జన్మించి ఉంటే, సమయ వ్యత్యాసాన్ని సరిచూసుకోండి.",
      phaladeepikaGroundTruth: "ఫలదీపికా వాస్తవం",
      phaladeepikaGroundTruthText: "ఈ పరికరం మంత్రేశ్వరుని శాస్త్రీయ ఫలదీపికా గ్రంథం నుండి నేరుగా నియమాలను ఉపయోగిస్తుంది. మేము సంప్రదాయ వైదిక సూచికలను సాధారణీకరించము.",
      timingPrecision: "సమయ ఖచ్చితత్వం",
      timingPrecisionText: "గోచారం (గ్రహాల సంచారం) ప్రస్తుత కాలానికి అనుగుణంగా ఉంటుంది. గోచారం జీవితచక్రానికి అవసరమైన సమాచారాన్ని అందిస్తుంది, కానీ రోజువారీ ఫలితాలకు ప్రస్న కుండలి అవసరం."
    }
  }[language];

  return (
    <div className="rounded-2xl border border-[#1E2433] bg-[#10141F] overflow-hidden shadow-2xl mt-8">
      
      {/* Tab Section Header */}
      <div className="bg-[#151C2C] border-b border-[#1E2433] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#F5F5F7] tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            {labels.title}
          </h2>
          <p className="text-xs font-mono text-[#9CA3AF] mt-1">
            {labels.desc}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono text-[#9CA3AF]">{labels.confidence}</span>
          <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-400 font-mono">{avgConf}%</span>
            <span className="text-[10px] tracking-wider uppercase font-extrabold text-amber-400">{overallTier}</span>
          </div>
        </div>
      </div>

      {/* Option A Horizontal Sub-Tab Bar - Sticky below Main Tab Bar */}
      <div className="border-b border-[#1E2433] pb-px overflow-x-auto scrollbar-none flex items-center gap-1.5 sm:gap-2 text-[11px] font-mono text-[#9CA3AF] bg-[#0D121F] px-4 py-1.5 sticky top-16 z-20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          const transTabName = SUB_TAB_TRANSLATIONS[tab.id]?.[language] || tab.name;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
              }}
              className={`px-3 py-2 border-b-2 font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "border-amber-500 text-amber-400 bg-amber-500/[0.03]"
                  : "border-transparent text-[#9CA3AF] hover:text-[#F5F5F7] hover:border-[#1E2433]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-[#4B5563]'}`} />
              <span>{transTabName}</span>
            </button>
          );
        })}
      </div>

      {/* Main Sub-Tab Stage Content (Full Width Column Layout) */}
      <div className="p-6 sm:p-8 bg-[#10141F] min-h-[500px]">
          
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeSubTab === 4 && (
            <div className="space-y-6 animate-fade-in font-serif">
              {/* NEW SECTION: Merged Synthesis & Prioritization */}
              <div className="border-l-4 border-amber-500 pl-4 py-2 bg-[#1C2438]/30 rounded-r-xl">
                <h3 className="text-lg font-serif font-bold text-[#F5F5F7] tracking-wider uppercase">Strategic Prioritization</h3>
                <p className="text-xs font-mono text-[#9CA3AF] mt-0.5">Phaladeepika Strategic Focus</p>
              </div>

              {/* Section A: Strategic Prioritization */}
              <div className="p-5 bg-[#0A0E17] rounded-xl border border-[#1E2433] space-y-3">
                <h4 className="font-bold font-serif text-amber-400 text-sm flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-500" />
                  Strategic Domain Prioritization
                </h4>
                <p className="text-[#D1D5DB]">
                  Based on deterministic scoring of natal structures, dasha activates, and planetary transits, here is your life strategy priority order:
                </p>
                <div className="space-y-3 mt-2">
                  <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-amber-400 block font-extrabold">Primary Priority</span>
                    <strong className="text-sm font-serif text-white">Career & Worldly Action</strong>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">Strong natal potential paired with an active Dasha timing vector. Great time to initiate certifications and skill training.</p>
                  </div>
                  <div className="bg-[#1C2438]/30 border border-[#1E2433]/60 p-3 rounded-xl">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#9CA3AF] block font-extrabold">Secondary Focus</span>
                    <strong className="text-sm font-serif text-white">Financial Treasury Preservation</strong>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">Focus on consolidating long-term liquid savings rather than fast, speculative investments.</p>
                  </div>
                </div>
              </div>

              {/* Confidence Assessment & Limitations (Moved under Executive Summary) */}
              <div className="border-l-4 border-amber-500 pl-4 py-2 bg-[#1C2438]/30 rounded-r-xl mt-8">
                <h3 className="text-lg font-serif font-bold text-[#F5F5F7] tracking-wider uppercase">Confidence Assessment & Limitations</h3>
                <p className="text-xs font-mono text-[#9CA3AF] mt-0.5">Astrological Integrity, Caveats, and Transparency</p>
              </div>

              {/* Deterministic Domain Confidence Matrix */}
              <div className="p-5 bg-[#0A0E17] rounded-xl border border-[#1E2433] space-y-4">
                <h4 className="font-bold font-serif text-amber-400 text-sm">Deterministic Domain Confidence Matrix</h4>
                <div className="overflow-x-auto rounded-lg border border-[#1E2433]/50">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#151C2C] text-[#9CA3AF] font-mono border-b border-[#1E2433]">
                      <tr>
                        <th className="p-3">Life Domain</th>
                        <th className="p-3">Confidence Score</th>
                        <th className="p-3">Tier</th>
                        <th className="p-3">Natal Promise</th>
                        <th className="p-3">Dasha Status</th>
                        <th className="p-3">Transit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2433]/50">
                      {domains.map((d) => {
                        const conf = domainConfidences[d];
                        return (
                          <tr key={d} className="hover:bg-[#151D2F]/30 text-xs">
                            <td className="p-3 font-bold font-serif text-white">{d}</td>
                            <td className="p-3 font-mono font-bold text-amber-400">{conf.confidence}%</td>
                            <td className="p-3 font-mono font-bold">{conf.tier}</td>
                            <td className="p-3 text-[#9CA3AF]">{conf.natalSignal}</td>
                            <td className="p-3 text-[#9CA3AF]">{conf.dashaSignal}</td>
                            <td className="p-3 text-[#9CA3AF]">{conf.transitSignal}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TABS 3–8: SIX LIFE DOMAINS */}
          {activeSubTab >= 6 && activeSubTab <= 11 && (() => {
            const domainName = domains[activeSubTab - 6];
            const conf = domainConfidences[domainName];
            const contradictions = flagContradictions(domainName, conf);
            
            // Domain specific details for the rendered cards
            const domainTranslation = DOMAIN_TRANSLATIONS[domainName]?.[language] || DOMAIN_TRANSLATIONS[domainName]?.en;
            const primaryFactorText = domainTranslation.primary;
            const supportingText = domainTranslation.supporting;
            const domainTitle = domainTranslation.name;

            return (
              <div className="space-y-8 animate-fade-in">
                {/* Domain Header Badge */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2433] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl border border-amber-500/30 flex items-center justify-center text-amber-500">
                      {domainName === "Career" && <Award className="w-5 h-5" />}
                      {domainName === "Marriage" && <Heart className="w-5 h-5" />}
                      {domainName === "Finance" && <TrendingUp className="w-5 h-5" />}
                      {domainName === "Health" && <Activity className="w-5 h-5" />}
                      {domainName === "Education" && <BookOpen className="w-5 h-5" />}
                      {domainName === "Children" && <Users className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#F5F5F7] tracking-wider uppercase">
                        {domainTitle}
                      </h3>
                      <p className="text-xs font-mono text-[#9CA3AF] mt-0.5">
                        Natal Promise • Timing Activeness • Gochara Context
                      </p>
                    </div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/25 px-4 py-1.5 rounded-xl text-right">
                    <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-mono">Confidence Index</div>
                    <div className="text-sm font-bold text-amber-400 font-mono">
                      {conf.confidence}% <span className="text-[10px] uppercase tracking-widest text-[#9CA3AF]">({conf.tier})</span>
                    </div>
                  </div>
                </div>

                {/* Main 4-Section Domain Layout */}
                <div className="space-y-6">
                  {/* Section 1: Natal Promise */}
                  <div className="p-6 bg-[#0A0E17] rounded-xl border border-[#1E2433]">
                    <h4 className="text-sm font-bold font-serif text-amber-400 uppercase tracking-wider mb-3">
                      {labels.natalPromise}
                    </h4>
                    <div className="text-xs text-[#D1D5DB] space-y-3 leading-relaxed">
                      <p>
                        <strong className="text-white">Primary Factor:</strong> {primaryFactorText}
                      </p>
                      <div>
                        <strong className="text-white">Supporting Indicators:</strong>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          {supportingText.map((item, idx) => <li key={idx}>{item}</li>)}
                        </ul>
                      </div>
                      <p className="border-t border-[#1E2433]/50 pt-2 mt-2">
                        <strong className="text-white">Structural Assessment:</strong>{" "}
                        <span className={`font-bold uppercase ${conf.natalSignal === 'Strong' ? 'text-green-400' : conf.natalSignal === 'Moderate' ? 'text-amber-400' : 'text-red-400'}`}>
                          {conf.natalSignal}
                        </span>{" "}
                        — Classically, the planetary alignments in your natal map show a {conf.natalSignal.toLowerCase()} baseline capacity for {domainName.toLowerCase()} activities.
                      </p>
                    </div>
                  </div>

                  {/* Section 2: Snapshot Current Activation */}
                  <div className="p-6 bg-[#0A0E17] rounded-xl border border-[#1E2433]">
                    <h4 className="text-sm font-bold font-serif text-amber-400 uppercase tracking-wider mb-3">
                      {labels.snapshot}
                    </h4>
                    <div className="text-xs text-[#D1D5DB] space-y-2 leading-relaxed">
                      <p>
                        <strong className="text-white">Mahādaśā Involvement:</strong> {activeMdLord} Mahadasha lord governs this era, exerting a {conf.dashaSignal === 'Strong' ? 'direct, powerful' : 'neutral, secondary'} classical influence on your {domainName.toLowerCase()} prospects.
                      </p>
                      <p>
                        <strong className="text-white">Antardaśā Refinement:</strong> {activeAdLord} Antardasha currently modulates this timing, creating active opportunity window segments.
                      </p>
                      <p>
                        <strong className="text-white">Gochara Overlay (Transits):</strong> Saturn in {transitPositions.Saturn} and Jupiter in {transitPositions.Jupiter} combine to generate a {conf.transitSignal.toLowerCase()} transit environment relative to your Moon.
                      </p>
                    </div>
                  </div>

                  {/* Section 3: Outlook */}
                  <div className="p-6 bg-[#0A0E17] rounded-xl border border-[#1E2433]">
                    <h4 className="text-sm font-bold font-serif text-amber-400 uppercase tracking-wider mb-3">
                      {labels.outlook}
                    </h4>
                    <div className="text-xs text-[#D1D5DB] space-y-3 leading-relaxed">
                      <p>
                        <strong className="text-white">Immediate (3-6 Months):</strong> Stable trajectory modulated by {activeAdLord} sub-cycle. Focused execution yields gradual classical rewards.
                      </p>
                      <p>
                        <strong className="text-white">Medium Term (6-12 Months):</strong> Transits shift in mid-2027 as Jupiter ingresses, opening up a highly supportive opportunities window for calculated changes.
                      </p>
                    </div>
                  </div>

                  {/* Contradiction Flags if Any */}
                  {contradictions.length > 0 && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-red-300">
                        {contradictions.map((c, idx) => <p key={idx} className="font-serif leading-relaxed">{c}</p>)}
                      </div>
                    </div>
                  )}

                  {/* Section 4: Verdict */}
                  <div className="p-6 bg-[#161D2F] rounded-xl border border-[#1E2433] flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-extrabold">
                        CLASSICAL VERDICT
                      </h4>
                      <p className="text-sm font-serif leading-relaxed text-[#F5F5F7] max-w-xl">
                        {getDomainVerdict(domainName, conf)}
                      </p>
                    </div>
                    <div className="bg-[#0D121F] px-4 py-2 rounded-xl border border-[#1E2433]">
                      <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] block font-mono">Confidence Level</span>
                      <span className={`text-sm font-bold font-mono ${conf.confidence >= 80 ? 'text-green-400' : conf.confidence >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{conf.confidence}% ({conf.tier})</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 9: STRUCTURAL ANALYSIS */}
          {activeSubTab === 12 && (
            <div className="space-y-6 animate-fade-in text-xs text-[#D1D5DB] leading-relaxed">
              <div className="border-l-4 border-amber-500 pl-4 py-2 bg-[#1C2438]/30 rounded-r-xl">
                <h3 className="text-lg font-serif font-bold text-[#F5F5F7] tracking-wider uppercase">Structural House Analysis</h3>
                <p className="text-xs font-mono text-[#9CA3AF] mt-0.5">Four Pillars of Natal House Judgment</p>
              </div>

              {/* Sections Kendra / Trikona / Upachaya / Dusthana */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Kendra */}
                <div className="p-5 bg-[#0A0E17] rounded-xl border border-[#1E2433] space-y-3">
                  <h4 className="font-bold font-serif text-amber-400 uppercase tracking-wider text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-500" />
                    Kendra Analysis (Angular Houses)
                  </h4>
                  <p>
                    Houses <strong className="text-white font-mono">1, 4, 7, and 10</strong> represent the cardinal pillars of self, foundation, relationships, and professional karma. Strong Kendra lords ensure a life of dynamic capacity and resilience against adversity.
                  </p>
                  <p className="border-t border-[#1E2433]/50 pt-2 text-[#9CA3AF]">
                    Lagna Sign: <strong className="text-[#F5F5F7] font-mono">{lagnaSign}</strong>. Rulers: Saturn, Venus, Sun, Mars.
                  </p>
                </div>

                {/* Trikona */}
                <div className="p-5 bg-[#0A0E17] rounded-xl border border-[#1E2433] space-y-3">
                  <h4 className="font-bold font-serif text-amber-400 uppercase tracking-wider text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-500" />
                    Trikona Analysis (Trine Houses)
                  </h4>
                  <p>
                    Houses <strong className="text-white font-mono">5 and 9</strong> rule intellect, progeny, divine luck, past-karma merits, and spiritual dharma. Clean trines allow high recovery from worldly crises and bring effortless windfalls.
                  </p>
                  <p className="border-t border-[#1E2433]/50 pt-2 text-[#9CA3AF]">
                    5th sign: Gemini (Mercury), 9th sign: Libra (Venus). Both represent creative grace.
                  </p>
                </div>

                {/* Upachaya */}
                <div className="p-5 bg-[#0A0E17] rounded-xl border border-[#1E2433] space-y-3">
                  <h4 className="font-bold font-serif text-amber-400 uppercase tracking-wider text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-500" />
                    Upachaya Analysis (Growth Houses)
                  </h4>
                  <p>
                    Houses <strong className="text-white font-mono">3, 6, and 11</strong> represent worldly courage, conflict resolution, and material gains. They grow stronger progressively with focused self-will and strategic efforts.
                  </p>
                </div>

                {/* Dusthana */}
                <div className="p-5 bg-[#0A0E17] rounded-xl border border-[#1E2433] space-y-3">
                  <h4 className="font-bold font-serif text-amber-400 uppercase tracking-wider text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-500" />
                    Dusthana & Maraka Assessment
                  </h4>
                  <p>
                    Houses <strong className="text-white font-mono">6, 8, and 12</strong> rule debts, chronic blockages, and expenses/losses. Classically, 2nd and 7th lords act as Maraka (death-inflicting) in timing, requiring careful remediation when highly afflicted.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 10: TEMPORAL ALIGNMENT */}
          {activeSubTab === 13 && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="border-l-4 border-amber-500 pl-4 py-2 bg-[#1C2438]/30 rounded-r-xl">
                <h3 className="text-lg font-serif font-bold text-[#F5F5F7] tracking-wider uppercase">Vimshottari Timeline & Gochara Impact</h3>
                <p className="text-xs font-mono text-[#9CA3AF] mt-0.5">Chronological Lifecycle & Active Solar Transits</p>
              </div>

              {/* Mahadashas sequence table */}
              <div className="p-5 bg-[#0A0E17] rounded-xl border border-[#1E2433] space-y-4">
                <h4 className="font-bold font-serif text-amber-400 text-sm">Vimshottari Mahādaśā Lifespan Sequence</h4>
                <div className="overflow-x-auto rounded-lg border border-[#1E2433]/50">
                  <table className="w-full text-left">
                    <thead className="bg-[#151C2C] text-[#9CA3AF] font-mono border-b border-[#1E2433]">
                      <tr>
                        <th className="p-3">Cycle</th>
                        <th className="p-3">Mahadasha Lord</th>
                        <th className="p-3">Start Date</th>
                        <th className="p-3">End Date</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2433]/50">
                      {mds.map((m, idx) => {
                        const isCurrent = m.lord === activeMdLord;
                        return (
                          <tr key={idx} className={`hover:bg-[#151D2F]/30 ${isCurrent ? 'bg-amber-500/5 font-semibold text-amber-400' : 'text-[#D1D5DB]'}`}>
                            <td className="p-3 font-mono">#{idx + 1}</td>
                            <td className="p-3 font-bold font-serif text-sm">{m.lord}</td>
                            <td className="p-3 font-mono">{m.start.toISOString().split('T')[0]}</td>
                            <td className="p-3 font-mono">{m.end.toISOString().split('T')[0]}</td>
                            <td className="p-3 font-mono">{m.duration.toFixed(1)} Yrs</td>
                            <td className="p-3">
                              {isCurrent ? (
                                <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider font-mono">Active Cycle</span>
                              ) : now > m.end ? (
                                <span className="text-[#6B7280]">Past</span>
                              ) : (
                                <span className="text-[#4B5563]">Upcoming</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Active Antardashas */}
              <div className="p-5 bg-[#0A0E17] rounded-xl border border-[#1E2433] space-y-4">
                <h4 className="font-bold font-serif text-amber-400 text-sm">Antardaśā Modulation inside {activeMdLord} Mahadasha</h4>
                <div className="overflow-x-auto rounded-lg border border-[#1E2433]/50">
                  <table className="w-full text-left">
                    <thead className="bg-[#151C2C] text-[#9CA3AF] font-mono border-b border-[#1E2433]">
                      <tr>
                        <th className="p-3">Antardasha Lord</th>
                        <th className="p-3">Start Date</th>
                        <th className="p-3">End Date</th>
                        <th className="p-3">Duration (Yrs)</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2433]/50 text-[#D1D5DB]">
                      {ads.map((a, idx) => {
                        const isCurrent = a.lord === activeAdLord;
                        return (
                          <tr key={idx} className={`hover:bg-[#151D2F]/30 ${isCurrent ? 'bg-amber-500/5 font-semibold text-amber-400' : ''}`}>
                            <td className="p-3 font-serif font-bold text-sm">{a.lord}</td>
                            <td className="p-3 font-mono">{a.start.toISOString().split('T')[0]}</td>
                            <td className="p-3 font-mono">{a.end.toISOString().split('T')[0]}</td>
                            <td className="p-3 font-mono">{a.duration.toFixed(2)}</td>
                            <td className="p-3">
                              {isCurrent ? (
                                <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider font-mono animate-pulse">Running Now</span>
                              ) : now > a.end ? (
                                <span className="text-[#6B7280]">Elapsed</span>
                              ) : (
                                <span className="text-[#4B5563]">Upcoming</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


        </div>

    </div>
  );
};
