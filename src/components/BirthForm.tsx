import React, { useState, useEffect, useRef } from 'react';
import { BirthDetails, LocationSuggestion } from '../types';
import { SavedPerson } from '../types/marriageMatch';
import { getSavedPersons } from '../lib/savedPersons';
import { MapPin, Clock, Calendar, User, Search, RefreshCw, AlertCircle, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { TimeWheelPicker } from './WheelPicker';

interface BirthFormProps {
  onSubmit: (details: BirthDetails) => void;
  initialValues?: BirthDetails | null;
  loading: boolean;
  error: string | null;
  language?: 'en' | 'hi' | 'te';
  embedded?: boolean;
  hideHeader?: boolean;
}

const formLabels = {
  en: {
    title: "Birth Specifications Form",
    subtitle: "Enter exact birth data for precision Vedic natal chart calculation",
    fullName: "Full Name",
    namePlaceholder: "e.g. Akhil Indrakanti",
    genderSelection: "Gender",
    male: "Male",
    female: "Female",
    dob: "Date of Birth",
    tob: "Time of Birth (24-Hour)",
    approxTime: "Unsure / Approximate time",
    pob: "Place of Birth",
    pobPlaceholder: "Search city or town (e.g. Hyderabad)",
    coordsTz: "Advanced Coordinates & Timezone",
    coordsSub: "Auto-detected. Edit manually only if needed.",
    lat: "Latitude (°N/S)",
    lng: "Longitude (°E/W)",
    utcOffset: "UTC Offset (Hrs)",
    genFailed: "Calculation Failed",
    calculating: "CALCULATING NATAL CHARTS...",
    startHoroscope: "GENERATE NATAL REPORT",
    updateHoroscope: "RE-CALCULATE HOROSCOPE",
    noMatchingPlaces: "No matching places found. Enter details manually below.",
    connectionFailed: "Connection failed. Please specify coordinates manually.",
    selectSaved: "Load Saved Profile",
    quickTimeNoon: "12:00 (Noon)",
    quickTimeSunrise: "06:00 (Sunrise)",
    secIdentity: "1. Identity",
    secBirth: "2. Birth Specifications",
    secCoords: "3. Coordinates & Timezone"
  },
  hi: {
    title: "जन्म विवरण फ़ॉर्म",
    subtitle: "सटीक वैदिक कुंडली गणना के लिए जन्म डेटा दर्ज करें",
    fullName: "पूरा नाम",
    namePlaceholder: "उदा. अखिल इंद्रकांति",
    genderSelection: "लिंग",
    male: "पुरुष",
    female: "स्त्री",
    dob: "जन्म तिथि",
    tob: "जन्म का समय",
    approxTime: "अनुमानित समय",
    pob: "जन्म स्थान",
    pobPlaceholder: "शहर या कस्बा खोजें (उदा. हैदराबाद)",
    coordsTz: "उन्नत निर्देशांक और समयक्षेत्र",
    coordsSub: "स्वतः पता लगाया गया।",
    lat: "अक्षांश",
    lng: "रेखांश",
    utcOffset: "यूटीसी ऑफसेट",
    genFailed: "गणना विफल रही",
    calculating: "चार्ट की गणना हो रही है...",
    startHoroscope: "कुंडली बनाएं",
    updateHoroscope: "कुंडली अपडेट करें",
    noMatchingPlaces: "कोई मिलान स्थान नहीं मिला।",
    connectionFailed: "कनेक्शन विफल रहा।",
    selectSaved: "सहेजी गई प्रोफ़ाइल लोड करें",
    quickTimeNoon: "12:00 (दोपहर)",
    quickTimeSunrise: "06:00 (सूर्योदय)",
    secIdentity: "1. पहचान",
    secBirth: "2. जन्म विवरण",
    secCoords: "3. निर्देशांक और समयक्षेत्र"
  },
  te: {
    title: "జనన వివరాల నమూనా",
    subtitle: "ఖచ్చితమైన జాతక విశ్లేషణ కోసం వివరాలు అందించండి",
    fullName: "పూర్తి పేరు",
    namePlaceholder: "ఉదా. అఖిల్ ఇంద్రకంటి",
    genderSelection: "లింగం",
    male: "పురుషుడు",
    female: "స్త్రీ",
    dob: "పుట్టిన తేదీ",
    tob: "పుట్టిన సమయం",
    approxTime: "సుమారు సమయం",
    pob: "పుట్టిన స్థలం",
    pobPlaceholder: "నగరం లేదా ఊరు వెతకండి (ఉదా. హైదరాబాద్)",
    coordsTz: "అక్షాంశ రేఖాంశాల వివరాలు",
    coordsSub: "సవరించగలిగే వివరాలు",
    lat: "అక్షాంశం",
    lng: "రేఖాంశం",
    utcOffset: "టైమ్ జోన్",
    genFailed: "లెక్కింపు విఫలమైంది",
    calculating: "జాతకాన్ని లెక్కిస్తున్నాము...",
    startHoroscope: "జాతకాన్ని రూపొందించండి",
    updateHoroscope: "జాతకాన్ని అప్‌డేట్ చేయండి",
    noMatchingPlaces: "సరిపోలే స్థలాలు లేవు.",
    connectionFailed: "కనెక్షన్ విఫలమైంది.",
    selectSaved: "సేవ్ చేసిన ప్రొఫైల్ ఎంచుకోండి",
    quickTimeNoon: "12:00 (మధ్యాహ్నం)",
    quickTimeSunrise: "06:00 (సూర్యోదయం)",
    secIdentity: "1. గుర్తింపు",
    secBirth: "2. జనన వివరాలు",
    secCoords: "3. అక్షాంశ రేఖాంశాలు"
  }
};

export const BirthForm: React.FC<BirthFormProps> = ({
  onSubmit,
  initialValues,
  loading,
  error,
  language = 'en'
}) => {
  const l = formLabels[language] || formLabels.en;

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [approximateTime, setApproximateTime] = useState(false);
  const [place, setPlace] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [timezone, setTimezone] = useState('');

  // UI States
  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);

  // Saved profiles
  const [savedProfiles, setSavedProfiles] = useState<SavedPerson[]>([]);

  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Time Picker Popover state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerHour, setPickerHour] = useState('12');
  const [pickerMin, setPickerMin] = useState('00');
  const [pickerSec, setPickerSec] = useState('00');
  const timePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSavedProfiles(getSavedPersons());
  }, []);

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name);
      setGender(initialValues.gender);
      setDate(initialValues.date);
      setTime(initialValues.time);
      setApproximateTime(initialValues.approximateTime);
      setPlace(initialValues.place);
      setLatitude(initialValues.latitude.toString());
      setLongitude(initialValues.longitude.toString());
      setTimezone(initialValues.timezone.toString());
      setSearchQuery(initialValues.place);

      // Parse time to pre-populate custom picker spinners
      const parts = (initialValues.time || '12:00:00').split(':');
      setPickerHour(parts[0] || '12');
      setPickerMin(parts[1] || '00');
      setPickerSec(parts[2] || '00');
    } else {
      // Default values
      setName('');
      setGender('Male');
      setDate('1996-11-01');
      setTime('13:50:00');
      setApproximateTime(false);
      setPlace('Hyderabad');
      setLatitude('17.3850');
      setLongitude('78.4867');
      setTimezone('5.5');
      setSearchQuery('Hyderabad');

      setPickerHour('13');
      setPickerMin('50');
      setPickerSec('00');
    }
  }, [initialValues]);

  const handleSelectProfile = (personId: string) => {
    const person = savedProfiles.find(p => p.id === personId);
    if (!person) return;

    setName(person.name);
    setGender(person.gender);
    setDate(person.date);
    setTime(person.time);
    setApproximateTime(false);
    setPlace(person.place);
    setLatitude(person.latitude.toString());
    setLongitude(person.longitude.toString());
    setTimezone(person.timezone.toString());
    setSearchQuery(person.place);

    const parts = (person.time || '12:00:00').split(':');
    setPickerHour(parts[0] || '12');
    setPickerMin(parts[1] || '00');
    setPickerSec(parts[2] || '00');
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced location search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    if (searchQuery === place) return;

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(`https://jagannatha-hora-359167915530.europe-west1.run.app/location/autocomplete?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error('Failed to retrieve location matching results');
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setSuggestions(data.results);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setSearchError(l.noMatchingPlaces);
          setShowDropdown(true);
        }
      } catch (err: any) {
        console.error(err);
        setSearchError(l.connectionFailed);
        setSuggestions([]);
        setShowDropdown(true);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, place, l.noMatchingPlaces, l.connectionFailed]);

  const handleSelectSuggestion = (item: LocationSuggestion) => {
    setPlace(item.place);
    setSearchQuery(item.displayName);
    setLatitude(item.latitude.toString());
    setLongitude(item.longitude.toString());
    setTimezone(item.timezone.toString());
    setSuggestions([]);
    setShowDropdown(false);
    setSearchError(null);
  };

  const handlePickerChange = (type: 'hour' | 'minute' | 'second', val: string) => {
    let h = pickerHour;
    let m = pickerMin;
    let s = pickerSec;

    if (type === 'hour') {
      h = val;
      setPickerHour(val);
    } else if (type === 'minute') {
      m = val;
      setPickerMin(val);
    } else if (type === 'second') {
      s = val;
      setPickerSec(val);
    }

    setTime(`${h}:${m}:${s}`);
  };

  const get12HourFormat = (timeStr: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return '';
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    if (isNaN(h)) return '';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!date) return;
    
    if (!approximateTime && !time) {
      alert("Please select a time or check 'Approximate time'");
      return;
    }

    const finalTime = approximateTime && !time ? '12:00:00' : time;

    if (!place.trim()) return;

    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);
    const tzVal = parseFloat(timezone);

    if (isNaN(latVal) || isNaN(lngVal) || isNaN(tzVal)) {
      alert("Please ensure coordinates and timezone are valid numbers.");
      return;
    }

    onSubmit({
      name,
      gender,
      date,
      time: finalTime,
      approximateTime,
      place,
      latitude: latVal,
      longitude: lngVal,
      timezone: tzVal
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div id="birth-details-form-container" className="light bg-ds-surface rounded-ds-xl border border-ds-secondary/15 p-6 lg:p-8 max-w-xl mx-auto shadow-ds-lg">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-ds-secondary/10">
        <div className="p-3 bg-ds-primary/10 text-ds-primary rounded-ds-xl border border-ds-primary/20">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-serif text-ds-secondary font-bold">{l.title}</h2>
          <p className="text-xs text-ds-on-surface-variant">{l.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">


        {/* SECTION 1: IDENTITY */}
        <div className="space-y-3 bg-ds-surface-container p-4 rounded-ds-lg border border-ds-secondary/15">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ds-primary font-mono">
            {l.secIdentity}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ds-secondary">
                {l.fullName} <span className="text-ds-primary">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={l.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 bg-ds-surface border border-ds-secondary/20 focus:ring-2 focus:ring-ds-primary/20 focus:border-ds-primary rounded-ds-lg px-3.5 py-2.5 text-sm text-ds-secondary focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ds-secondary block">
                {l.genderSelection} <span className="text-ds-primary">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 h-11 items-center">
                <label className={`flex items-center justify-center gap-2 h-full rounded-ds-lg border text-xs font-bold cursor-pointer transition-all ${
                  gender === 'Male'
                    ? 'border-ds-primary bg-ds-primary/10 text-ds-primary'
                    : 'border-ds-secondary/20 bg-ds-surface text-ds-on-surface-variant hover:text-ds-secondary'
                }`}>
                  <input
                    type="radio"
                    name="mainGender"
                    checked={gender === 'Male'}
                    onChange={() => setGender('Male')}
                    className="sr-only"
                  />
                  {l.male}
                </label>
                <label className={`flex items-center justify-center gap-2 h-full rounded-ds-lg border text-xs font-bold cursor-pointer transition-all ${
                  gender === 'Female'
                    ? 'border-ds-primary bg-ds-primary/10 text-ds-primary'
                    : 'border-ds-secondary/20 bg-ds-surface text-ds-on-surface-variant hover:text-ds-secondary'
                }`}>
                  <input
                    type="radio"
                    name="mainGender"
                    checked={gender === 'Female'}
                    onChange={() => setGender('Female')}
                    className="sr-only"
                  />
                  {l.female}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: BIRTH SPECIFICATIONS */}
        <div className="space-y-4 bg-ds-surface-container p-4 rounded-ds-lg border border-ds-secondary/15">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ds-primary font-mono">
            {l.secBirth}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ds-secondary">
                {l.dob} <span className="text-ds-primary">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  max={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full box-border h-11 bg-ds-surface border border-ds-secondary/20 focus:ring-2 focus:ring-ds-primary/20 focus:border-ds-primary rounded-ds-lg pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-ds-secondary focus:outline-none transition-all font-mono [appearance:none] [-webkit-appearance:none] [&::-webkit-calendar-picker-indicator]:hidden [&::-moz-calendar-picker-indicator]:hidden"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-primary pointer-events-none">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Time of Birth */}
            <div className="space-y-1.5 relative" ref={timePickerRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ds-secondary flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-ds-primary shrink-0" />
                  <span>{l.tob} <span className="text-ds-primary">*</span></span>
                </label>
              </div>

              <div className="relative cursor-pointer" onClick={() => setShowTimePicker(true)}>
                <input
                  type="text"
                  required
                  readOnly
                  placeholder="Select time"
                  value={time}
                  onClick={() => setShowTimePicker(true)}
                  className="w-full h-11 bg-ds-surface border border-ds-secondary/20 focus:ring-2 focus:ring-ds-primary/20 focus:border-ds-primary rounded-ds-lg pl-3.5 pr-10 py-2.5 text-xs text-ds-secondary focus:outline-none transition-all font-mono cursor-pointer"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTimePicker(!showTimePicker);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-primary hover:text-ds-primary transition-colors cursor-pointer p-1"
                >
                  <Clock className="w-4 h-4" />
                </button>
              </div>

              {/* Time Popover with Hour, Minute, and AM/PM Wheels */}
              {showTimePicker && (
                <div className="absolute right-0 w-72 mt-1 z-50">
                  <TimeWheelPicker
                    value={time || '12:00:00'}
                    onChange={(newTime24) => setTime(newTime24)}
                    onClose={() => setShowTimePicker(false)}
                  />
                </div>
              )}
            </div>

          </div>

          {/* Place of Birth */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="text-xs font-semibold text-ds-secondary flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-ds-primary shrink-0" />
              <span>{l.pob} <span className="text-ds-primary">*</span></span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={l.pobPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0 || searchError) setShowDropdown(true);
                }}
                className="w-full h-11 bg-ds-surface border border-ds-secondary/20 focus:ring-2 focus:ring-ds-primary/20 focus:border-ds-primary rounded-ds-lg pl-10 pr-10 py-2.5 text-sm text-ds-secondary focus:outline-none transition-all"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ds-outline">
                {searching ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-ds-primary" />
                ) : (
                  <Search className="w-4 h-4 text-ds-primary" />
                )}
              </div>
            </div>

            {showDropdown && (searchQuery.length >= 3) && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-ds-surface border border-ds-secondary/20 rounded-ds-lg shadow-ds-lg overflow-hidden z-50 max-h-52 overflow-y-auto animate-in fade-in duration-150">
                {suggestions.map((item, idx) => (
                  <button
                    type="button"
                    key={item.displayName + idx}
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-ds-surface-container border-b border-ds-secondary/10 last:border-0 transition-colors flex flex-col cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-ds-secondary">{item.place}</span>
                    <span className="text-[10px] text-ds-on-surface-variant mt-0.5">
                      📍 {item.displayName} (UTC {item.timezone >= 0 ? `+${item.timezone}` : item.timezone})
                    </span>
                  </button>
                ))}
                {searchError && (
                  <div className="p-3 text-xs text-ds-on-surface-variant bg-ds-surface-container flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-ds-primary shrink-0 mt-0.5" />
                    <span>{searchError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: ADVANCED COORDINATES (Collapsible) */}
        <div className="border border-ds-secondary/15 rounded-ds-lg overflow-hidden bg-ds-surface">
          <button
            type="button"
            onClick={() => setShowAdvancedCoords(!showAdvancedCoords)}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-ds-secondary hover:text-ds-primary transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ds-primary">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{l.secCoords}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-ds-outline font-mono">
                {latitude ? `${latitude}°, ${longitude}°` : 'Auto-detected'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvancedCoords ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {showAdvancedCoords && (
            <div className="p-4 border-t border-ds-secondary/15 space-y-3 bg-ds-surface-container">
              <p className="text-[10px] text-ds-on-surface-variant">{l.coordsSub}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-ds-on-surface-variant block">{l.lat}</label>
                  <input
                    type="text"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full bg-ds-surface border border-ds-secondary/20 rounded-ds-lg px-2.5 py-1.5 text-xs text-ds-secondary font-mono focus:outline-none focus:border-ds-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-ds-on-surface-variant block">{l.lng}</label>
                  <input
                    type="text"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full bg-ds-surface border border-ds-secondary/20 rounded-ds-lg px-2.5 py-1.5 text-xs text-ds-secondary font-mono focus:outline-none focus:border-ds-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-ds-on-surface-variant block">{l.utcOffset}</label>
                  <input
                    type="text"
                    required
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-ds-surface border border-ds-secondary/20 rounded-ds-lg px-2.5 py-1.5 text-xs text-ds-secondary font-mono focus:outline-none focus:border-ds-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-red-300">{l.genFailed}</p>
              <p className="leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-ds-lg bg-ds-primary hover:bg-ds-primary/90 active:scale-[0.99] disabled:opacity-50 text-ds-on-primary font-extrabold text-xs uppercase tracking-wider transition-all shadow-ds-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {loading ? l.calculating : (initialValues ? l.updateHoroscope : l.startHoroscope)}
          </button>
        </div>
      </form>
    </div>
  );
};
