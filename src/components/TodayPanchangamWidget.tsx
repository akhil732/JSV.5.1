import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export interface TodayPanchangamWidgetProps {
  loading: boolean;
  error: string | null;
  data: {
    Tithi?: string;
    Raasi?: string;
    Nakshatram?: string;
    Yoga?: string;
    Karana?: string;
    'Sun Rise'?: string;
    'Sun Set'?: string;
  } | null;
  language: 'en' | 'hi' | 'te';
}

const TRANSLATIONS = {
  en: {
    title: "TODAY'S PANCHANGAM",
    dateLabel: "Today's Date",
    tithi: "Tithi",
    rasi: "Janma Rasi",
    nakshatra: "Nakshatram",
    yoga: "Nitya Yoga",
    karana: "Karana",
    sunrise: "Sun Rise",
    sunset: "Sun Set",
    loading: "Fetching Today's Panchangam...",
    error: "Failed to load Today's Panchangam",
    subLabel: "Lahiri Chitrapaksha Ayanamsa • 06:00 AM Standard Location",
    localAstro: "Daily Vedic Timing"
  },
  hi: {
    title: "आज का पंचांग",
    dateLabel: "आज की तिथि",
    tithi: "तिथि",
    rasi: "जन्म राशि",
    nakshatra: "नक्षत्र",
    yoga: "नित्य योग",
    karana: "करण",
    sunrise: "सूर्योदय",
    sunset: "सूर्यास्त",
    loading: "आज का पंचांग लोड हो रहा है...",
    error: "आज का पंचांग लोड करने में विफल",
    subLabel: "लाहिड़ी चित्रपक्ष अयनांश • सुबह 06:00 बजे मानक स्थान",
    localAstro: "दैनिक वैदिक काल"
  },
  te: {
    title: "నేటి పంచాంగము",
    dateLabel: "నేటి తేదీ",
    tithi: "తిథి",
    rasi: "జన్మ రాశి",
    nakshatra: "నక్షత్రం",
    yoga: "నిత్య యోగం",
    karana: "కరణం",
    sunrise: "సూర్యోదయం",
    sunset: "సూర్యాస్తమయం",
    loading: "నేటి పంచాంగాన్ని లోడ్ చేస్తోంది...",
    error: "నేటి పంచాంగాన్ని లోడ్ చేయడం విఫలమైంది",
    subLabel: "లాహిరి చిత్రపక్ష అయనాంశం • ఉదయం 06:00 ప్రామాణిక స్థానం",
    localAstro: "దైనందిన వైదిక కాలం"
  }
};

const translateValue = (value: string, lang: 'en' | 'hi' | 'te') => {
  if (!value) return '';
  if (lang === 'en') return value;

  const hindiReplacements: Record<string, string> = {
    'Sukla': 'शुक्ल',
    'Krsna': 'कृष्ण',
    'Krishna': 'कृष्ण',
    'Ends': 'समाप्ति',
    'at': 'बजे',
    'Janma Rasi': 'जन्म राशि',
    'Not Found': 'नहीं मिला',
    'Pratipada': 'प्रतिपदा',
    'Dwitiya': 'द्वितीया',
    'Tritiya': 'तृतीया',
    'Chaturthi': 'चतुर्थी',
    'Panchami': 'पंचमी',
    'Shasthi': 'षष्ठी',
    'Saptami': 'सप्तमी',
    'Ashtami': 'अष्टमी',
    'Navami': 'नवमी',
    'Dashami': 'दशमी',
    'Ekadashi': 'एकादशी',
    'Dwadashi': 'द्वादशी',
    'Trayodashi': 'त्रयोदशी',
    'Chaturdashi': 'चतुर्दशी',
    'Purnima': 'पूर्णिमा',
    'Amavasya': 'अमावस्या',
  };

  const teluguReplacements: Record<string, string> = {
    'Sukla': 'శుక్ల',
    'Krsna': 'కృష్ణ',
    'Krishna': 'కృష్ణ',
    'Ends': 'ముగింపు',
    'at': 'సమయానికి',
    'Janma Rasi': 'జన్మ రాశి',
    'Not Found': 'లభించలేదు',
    'Pratipada': 'పాడ్యమి',
    'Dwitiya': 'విదియ',
    'Tritiya': 'తదియ',
    'Chaturthi': 'చవితి',
    'Panchami': 'పంచమి',
    'Shasthi': 'షష్ఠి',
    'Saptami': 'సప్తమి',
    'Ashtami': 'అష్టమి',
    'Navami': 'నవమి',
    'Dashami': 'దశమి',
    'Ekadashi': 'ఏకాదశి',
    'Dwadashi': 'ద్వాదశి',
    'Trayodashi': 'త్రయోదశి',
    'Chaturdashi': 'చతుర్దశి',
    'Purnima': 'పౌర్ణమి',
    'Amavasya': 'అమవాస్య',
  };

  const replacements = lang === 'hi' ? hindiReplacements : teluguReplacements;
  let translated = value;
  
  Object.entries(replacements).forEach(([eng, local]) => {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    translated = translated.replace(regex, local);
  });

  return translated;
};

export const TodayPanchangamWidget: React.FC<TodayPanchangamWidgetProps> = ({
  loading,
  error,
  data,
  language
}) => {
  const l = TRANSLATIONS[language] || TRANSLATIONS.en;
  const todayStr = new Date().toLocaleDateString(language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'te-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1E2433] bg-[#10141F] p-6 shadow-lg flex flex-col items-center justify-center py-10">
        <RefreshCw className="w-8 h-8 animate-spin text-[#F5A623] mb-3" />
        <p className="text-xs font-mono text-[#9CA3AF]">{l.loading}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-[#1E2433] bg-[#10141F] p-6 shadow-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-[#F5F5F7]">{l.error}</h4>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Ensure internet connectivity to synchronize dynamic daily planetary movements.
          </p>
        </div>
      </div>
    );
  }

  const items = [
    { label: l.tithi, value: translateValue(data.Tithi || '', language) || 'Not Found', icon: '🌙' },
    { label: l.rasi, value: translateValue(data.Raasi || '', language) || 'Not Found', icon: '🦁' },
    { label: l.nakshatra, value: translateValue(data.Nakshatram || '', language) || 'Not Found', icon: '✨' },
    { label: l.yoga, value: translateValue(data.Yoga || '', language) || 'Not Found', icon: '🧘' },
    { label: l.karana, value: translateValue(data.Karana || '', language) || 'Not Found', icon: '🐚' },
    { label: l.sunrise, value: data['Sun Rise'] || 'Not Found', icon: '🌅' },
    { label: l.sunset, value: data['Sun Set'] || 'Not Found', icon: '🌇' }
  ];

  return (
    <div id="today-panchangam-card" className="rounded-2xl border border-ds-secondary/15 bg-ds-surface p-5 lg:p-6 space-y-4 shadow-ds-sm max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ds-secondary/15 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🏮</span>
          <div>
            <p className="text-[10px] text-ds-on-surface-variant font-mono mt-0.5">{l.subLabel}</p>
          </div>
        </div>
        <div className="text-[10px] font-mono text-ds-primary bg-ds-primary/10 border border-ds-primary/20 px-2 py-0.5 rounded-md self-start sm:self-auto">
          {todayStr}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-ds-secondary/15 bg-ds-surface-container p-2.5 flex flex-col justify-between hover:border-ds-primary/25 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-ds-on-surface-variant group-hover:text-ds-primary transition-colors">
                  {item.label}
                </span>
                <span className="text-xs">{item.icon}</span>
              </div>
              <p className="text-xs font-bold text-ds-secondary leading-tight break-words">
                {item.value}
              </p>
            </div>
            <div className="mt-1.5 text-[8px] text-ds-on-surface-variant font-mono">
              {l.localAstro}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayPanchangamWidget;

