import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, ChevronDown, X, RefreshCw, AlertCircle, UserPlus, Check, SlidersHorizontal } from 'lucide-react';
import { PersonFormData } from '../types/marriageMatch';
import { getSavedPersonsByGender, addSavedPerson } from '../lib/savedPersons';
import { ProfileStorageService } from '../lib/profileStorageService';
import { LocationSuggestion } from '../types';
import { TimeWheelPicker } from './WheelPicker';

interface PersonBirthFormProps {
  gender: 'Male' | 'Female';
  onUpdate: (formData: PersonFormData) => void;
  isLoading: boolean;
  language?: 'en' | 'hi' | 'te';
}

const labels = {
  en: {
    maleTitle: "Male Birth Details",
    femaleTitle: "Female Birth Details",
    fullName: "Full Name",
    namePlaceholder: "Enter full name (e.g., Rahul Sharma)",
    genderLabel: "Gender Selection",
    dob: "Date of Birth",
    tob: "Time of Birth",
    pob: "Place of Birth",
    pobPlaceholder: "Type city name (e.g. Hyderabad)",
    coordsTz: "Coordinates & Timezone (Optional Override)",
    coordsSub: "Auto-detected from place search. Edit only if needed.",
    lat: "Latitude",
    lng: "Longitude",
    utcOffset: "UTC Offset (Hours)",
    selectSaved: "Saved Profiles",
    noSaved: "No saved profiles found for this gender",
    errLat: "Latitude must be between -90 and 90° (e.g., 17.38)",
    errLng: "Longitude must be between -180 and 180° (e.g., 78.48)",
    errTz: "Timezone offset must be between -12 and 14",
    male: "Male",
    female: "Female",
    savingOption: "Save Profile",
    savedSuccess: "Profile saved!",
    required: "* Required field",
    noMatchingPlaces: "No matching places found. You can enter location coordinates manually below.",
    connectionFailed: "Connection failed. Please enter coordinates manually below.",
    quickTimeNoon: "12:00 (Noon)",
    quickTimeSunrise: "06:00 (Sunrise)",
    secIdentity: "1. Personal Information",
    secBirth: "2. Birth Details",
    secCoords: "3. Advanced Coordinates"
  },
  hi: {
    maleTitle: "पुरुष जन्म विवरण",
    femaleTitle: "स्त्री जन्म विवरण",
    fullName: "पूरा नाम",
    namePlaceholder: "पूरा नाम दर्ज करें (उदा. राहुल शर्मा)",
    genderLabel: "लिंग चयन",
    dob: "जन्म तिथि",
    tob: "जन्म का समय",
    pob: "जन्म स्थान / शहर",
    pobPlaceholder: "शहर का नाम टाइप करें (उदा. हैदराबाद)",
    coordsTz: "निर्देशांक और समयक्षेत्र (वैकल्पिक ओवरराइड)",
    coordsSub: "स्थान खोज से स्वतः पता लगाया गया। आवश्यकता होने पर ही संपादित करें।",
    lat: "अक्षांश",
    lng: "रेखांश",
    utcOffset: "यूटीसी ऑफसेट",
    selectSaved: "सहेजे गए प्रोफ़ाइल",
    noSaved: "इस लिंग की कोई सहेजी गई प्रोफ़ाइल नहीं है",
    errLat: "अक्षांश -90 और 90 के बीच होना चाहिए",
    errLng: "रेखांश -180 और 180 के बीच होना चाहिए",
    errTz: "समयक्षेत्र -12 और 14 के बीच होना चाहिए",
    male: "पुरुष",
    female: "स्त्री",
    savingOption: "प्रोफ़ाइल सहेजें",
    savedSuccess: "प्रोफ़ाइल सहेजी गई!",
    required: "* आवश्यक फ़ील्ड",
    noMatchingPlaces: "कोई मिलान स्थान नहीं मिला। मैन्युअल रूप से दर्ज करें।",
    connectionFailed: "कनेक्शन विफल रहा। निर्देशांक मैन्युअल रूप से दर्ज करें।",
    quickTimeNoon: "12:00 (दोपहर)",
    quickTimeSunrise: "06:00 (सूर्योदय)",
    secIdentity: "1. व्यक्तिगत जानकारी",
    secBirth: "2. जन्म विवरण",
    secCoords: "3. उन्नत निर्देशांक"
  },
  te: {
    maleTitle: "పురుషుడు జనన వివరాలు",
    femaleTitle: "స్త్రీ జనన వివరాలు",
    fullName: "పూర్తి పేరు",
    namePlaceholder: "పూర్తి పేరు నమోదు చేయండి (ఉదా. రాహుల్ శర్మ)",
    genderLabel: "లింగం",
    dob: "పుట్టిన తేదీ",
    tob: "పుట్టిన సమయం",
    pob: "పుట్టిన స్థలం / నగరం",
    pobPlaceholder: "నగరం పేరు టైప్ చేయండి (ఉదా. హైదరాబాద్)",
    coordsTz: "అక్షాంశ రేఖాంశాలు (ఐచ్ఛిక వివరాలు)",
    coordsSub: "స్వయంచాలకంగా తీసుకోబడింది.",
    lat: "అక్షాంశం",
    lng: "రేఖాంశం",
    utcOffset: "టైమ్ జోన్",
    selectSaved: "సేవ్ చేసిన ప్రొఫైల్స్",
    noSaved: "ఈ లింగం యొక్క ప్రొఫైల్‌లు లేవు",
    errLat: "అక్షాంశం -90 నుండి 90 మధ్య ఉండాలి",
    errLng: "రేఖాంశం -180 నుండి 180 మధ్య ఉండాలి",
    errTz: "టైమ్ జోన్ -12 నుండి 14 మధ్య ఉండాలి",
    male: "పురుషుడు",
    female: "స్త్రీ",
    savingOption: "ప్రొఫైల్ సేవ్ చేయి",
    savedSuccess: "విజయవంతంగా సేవ్ చేయబడింది!",
    required: "* తప్పనిసరి వివరాలు",
    noMatchingPlaces: "సరిపోలే స్థలాలు ఏవీ కనుగోనబడలేదు.",
    connectionFailed: "కనెక్షన్ విఫలమైంది.",
    quickTimeNoon: "12:00 (మధ్యాహ్నం)",
    quickTimeSunrise: "06:00 (సూర్యోదయం)",
    secIdentity: "1. వ్యక్తిగత వివరాలు",
    secBirth: "2. జనన వివరాలు",
    secCoords: "3. అధునాతన వివరాలు"
  }
};

const PersonBirthForm: React.FC<PersonBirthFormProps> = ({
  gender,
  onUpdate,
  isLoading,
  language = 'en',
}) => {
  const l = labels[language] || labels.en;

  // Form Fields State
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [timezone, setTimezone] = useState('');

  // UI State: Collapsible Advanced Coords
  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);
  const [step, setStep] = useState(1);

  // Autocomplete / Location Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Saved Persons Combobox State
  const [savedPersons, setSavedPersons] = useState<any[]>([]);
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Time Picker Popover State
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerHour, setPickerHour] = useState('12');
  const [pickerMin, setPickerMin] = useState('00');
  const [pickerSec, setPickerSec] = useState('00');

  // Refs
  const savedDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

  // Subscribe to profile updates of this gender
  useEffect(() => {
    const unsubscribe = ProfileStorageService.subscribe((profiles) => {
      const list = profiles.filter((p) => p.gender === gender);
      setSavedPersons(list);
    });
    return unsubscribe;
  }, [gender]);

  // Click outside listener for all popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (savedDropdownRef.current && !savedDropdownRef.current.contains(event.target as Node)) {
        setShowSavedDropdown(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Location search autocomplete with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    if (searchQuery === place) return;

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      setLocationError(null);
      try {
        const res = await fetch(`/api/jhora-proxy/location/autocomplete?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error('Failed to retrieve location matching results');
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setSuggestions(data.results);
          setShowLocationDropdown(true);
        } else {
          setSuggestions([]);
          setLocationError(l.noMatchingPlaces);
          setShowLocationDropdown(true);
        }
      } catch (err) {
        console.error(err);
        setLocationError(l.connectionFailed);
        setSuggestions([]);
        setShowLocationDropdown(true);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, place, l.noMatchingPlaces, l.connectionFailed]);

  // Handle select of location
  const handleSelectLocation = (item: LocationSuggestion) => {
    setPlace(item.place);
    setSearchQuery(item.displayName);
    setLatitude(item.latitude.toString());
    setLongitude(item.longitude.toString());
    setTimezone(item.timezone.toString());
    setSuggestions([]);
    setShowLocationDropdown(false);
    setLocationError(null);
  };

  // Custom Time Picker interaction
  const handleTimePickerChange = (type: 'hour' | 'minute' | 'second', val: string) => {
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

  // Helper to get 12-hour AM/PM label
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

  // Profile Matching Check: see if current details are already saved
  useEffect(() => {
    const isProfileAlreadySaved = savedPersons.some(
      (p) => (p.name || '').trim().toLowerCase() === (name || '').trim().toLowerCase() && p.date === date && p.time === time
    );
    setIsSaved(isProfileAlreadySaved);
  }, [name, date, time, savedPersons]);

  // Trigger parent update
  useEffect(() => {
    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);
    const tzVal = parseFloat(timezone);

    onUpdate({
      name: (name || '').trim(),
      gender,
      date,
      time,
      place,
      latitude: isNaN(latVal) ? 0 : latVal,
      longitude: isNaN(lngVal) ? 0 : lngVal,
      timezone: isNaN(tzVal) ? 0 : tzVal
    });
  }, [name, gender, date, time, place, latitude, longitude, timezone, onUpdate]);

  // Handle Saved Profile Auto-Fill
  const handleSelectSavedProfile = (profile: any) => {
    setName(profile.name || '');
    setDate(profile.date || '');
    setTime(profile.time || '');
    setPlace(profile.place || '');
    setSearchQuery(profile.place || '');
    setLatitude(profile.latitude !== undefined && profile.latitude !== null ? profile.latitude.toString() : '');
    setLongitude(profile.longitude !== undefined && profile.longitude !== null ? profile.longitude.toString() : '');
    setTimezone(profile.timezone !== undefined && profile.timezone !== null ? profile.timezone.toString() : '');

    const timeParts = (profile.time || '12:00:00').split(':');
    setPickerHour(timeParts[0] || '12');
    setPickerMin(timeParts[1] || '00');
    setPickerSec(timeParts[2] || '00');

    setShowSavedDropdown(false);
  };

  // Quick-save this person
  const handleQuickSave = () => {
    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);
    const tzVal = parseFloat(timezone);

    if (!(name || '').trim() || !date || !time || !(place || '').trim() || isNaN(latVal) || isNaN(lngVal) || isNaN(tzVal)) {
      return;
    }

    addSavedPerson({
      name: (name || '').trim(),
      gender,
      date,
      time,
      place,
      latitude: latVal,
      longitude: lngVal,
      timezone: tzVal
    });

    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Input Range Validations
  const latVal = parseFloat(latitude);
  const isLatInvalid = latitude !== '' && (isNaN(latVal) || latVal < -90 || latVal > 90);

  const lngVal = parseFloat(longitude);
  const isLngInvalid = longitude !== '' && (isNaN(lngVal) || lngVal < -180 || lngVal > 180);

  const tzVal = parseFloat(timezone);
  const isTzInvalid = timezone !== '' && (isNaN(tzVal) || tzVal < -12 || tzVal > 14);

  const isFormValid =
    name.trim() !== '' &&
    date !== '' &&
    time !== '' &&
    place.trim() !== '' &&
    !isLatInvalid && latitude !== '' &&
    !isLngInvalid && longitude !== '' &&
    !isTzInvalid && timezone !== '';

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="light bg-ds-surface rounded-ds-xl border border-ds-secondary/15 p-5 sm:p-6 shadow-ds-lg w-full">
      
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-ds-secondary/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-ds-full ${gender === 'Male' ? 'bg-ds-secondary shadow-md shadow-ds-secondary/30' : 'bg-ds-primary shadow-md shadow-ds-primary/30'}`} aria-hidden="true" />
          <div>
            <h3 className="text-base sm:text-lg font-serif text-ds-secondary font-bold tracking-wide uppercase">
              {gender === 'Male' ? l.maleTitle : l.femaleTitle}
            </h3>
            <span className="text-[10px] text-ds-on-surface-variant font-mono">{l.required}</span>
          </div>
        </div>

        {/* Quick Saved Profile Selector */}
        <div className="relative" ref={savedDropdownRef}>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setShowSavedDropdown(!showSavedDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-ds-lg bg-ds-surface border border-ds-secondary/20 text-xs font-semibold text-ds-secondary hover:border-ds-primary transition-colors cursor-pointer shadow-ds-sm focus-ring"
            aria-expanded={showSavedDropdown}
            aria-haspopup="listbox"
          >
            <span>{l.selectSaved}</span>
            <ChevronDown className="w-3.5 h-3.5 text-ds-primary" aria-hidden="true" />
          </button>

          {showSavedDropdown && (
            <div 
              className="absolute right-0 mt-1.5 w-72 bg-ds-surface border border-ds-secondary/20 rounded-ds-lg shadow-ds-lg overflow-hidden z-50 max-h-60 overflow-y-auto"
              role="listbox"
            >
              {savedPersons.length === 0 ? (
                <div className="px-4 py-3 text-xs text-ds-on-surface-variant text-center italic">
                  {l.noSaved}
                </div>
              ) : (
                savedPersons.map((profile) => (
                  <button
                    key={profile.id}
                    role="option"
                    aria-selected="false"
                    type="button"
                    onClick={() => handleSelectSavedProfile(profile)}
                    className="w-full text-left px-4 py-3 hover:bg-ds-surface-container border-b border-ds-secondary/10 last:border-0 transition-colors flex flex-col gap-0.5 cursor-pointer focus-ring"
                  >
                    <span className="text-xs font-semibold text-ds-secondary">{profile.name}</span>
                    <span className="text-[10px] text-ds-on-surface-variant">
                      📅 {profile.date} • ⏰ {profile.time} • 📍 {profile.place}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">

        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className="space-y-3 bg-ds-surface-container p-4 rounded-ds-lg border border-ds-secondary/15">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ds-primary font-mono flex justify-between items-center">
            <span>{l.secIdentity}</span>
            {isFormValid && !isSaved && (
              <button
                type="button"
                onClick={handleQuickSave}
                className="text-[10px] text-ds-primary hover:underline flex items-center gap-1 cursor-pointer font-sans font-bold focus-ring rounded-ds-sm p-1"
              >
                <UserPlus className="w-3 h-3" aria-hidden="true" /> {l.savingOption}
              </button>
            )}
            {showSaveSuccess && (
              <span className="text-[10px] text-ds-success-green flex items-center gap-0.5 font-sans font-bold">
                <Check className="w-3 h-3" aria-hidden="true" /> {l.savedSuccess}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={`fullName-${gender}`} className="text-xs font-semibold text-ds-secondary flex items-center justify-between">
              <span>{l.fullName} <span className="text-ds-primary" aria-hidden="true">*</span><span className="sr-only">Required</span></span>
            </label>
            <input
              id={`fullName-${gender}`}
              type="text"
              required
              disabled={isLoading}
              placeholder={l.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 bg-ds-surface border border-ds-secondary/20 focus:ring-2 focus:ring-ds-primary/20 focus:border-ds-primary rounded-ds-lg px-3.5 py-2.5 text-sm text-ds-secondary focus:outline-none transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* SECTION 2: BIRTH DETAILS */}
        <div className="space-y-4 bg-ds-surface-container p-4 rounded-ds-lg border border-ds-secondary/15">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ds-primary font-mono">
            {l.secBirth}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label htmlFor={`dob-${gender}`} className="text-xs font-semibold text-ds-secondary">
                {l.dob} <span className="text-ds-primary" aria-hidden="true">*</span><span className="sr-only">Required</span>
              </label>
              <div className="relative">
                <input
                  id={`dob-${gender}`}
                  type="date"
                  required
                  disabled={isLoading}
                  max={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full box-border h-11 bg-ds-surface border border-ds-secondary/20 focus:ring-2 focus:ring-ds-primary/20 focus:border-ds-primary rounded-ds-lg pl-3.5 pr-10 py-2 text-xs sm:text-sm text-ds-secondary focus:outline-none transition-all disabled:opacity-50 font-mono [appearance:none] [-webkit-appearance:none] [&::-webkit-calendar-picker-indicator]:hidden [&::-moz-calendar-picker-indicator]:hidden"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-primary pointer-events-none">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <span className="text-[10px] text-ds-on-surface-variant block font-mono">Format: YYYY-MM-DD</span>
            </div>

            {/* Time of Birth */}
            <div className="space-y-1.5 relative" ref={timePickerRef}>
              <div className="flex items-center justify-between">
                <label htmlFor={`tob-${gender}`} className="text-xs font-semibold text-ds-secondary flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-ds-primary shrink-0" aria-hidden="true" />
                  <span>{l.tob} <span className="text-ds-primary" aria-hidden="true">*</span><span className="sr-only">Required</span></span>
                </label>
              </div>

              <div className="relative cursor-pointer" onClick={() => !isLoading && setShowTimePicker(true)}>
                <input
                  id={`tob-${gender}`}
                  type="text"
                  required
                  readOnly
                  disabled={isLoading}
                  placeholder="Select time"
                  value={time}
                  onClick={() => !isLoading && setShowTimePicker(true)}
                  className="w-full h-11 bg-ds-surface border border-ds-secondary/20 focus:ring-2 focus:ring-ds-primary/20 focus:border-ds-primary rounded-ds-lg pl-3.5 pr-10 py-2 text-xs text-ds-secondary focus:outline-none transition-all disabled:opacity-50 font-mono cursor-pointer"
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isLoading) setShowTimePicker(!showTimePicker);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-primary hover:text-ds-primary/80 transition-colors cursor-pointer p-1 focus-ring rounded-ds-sm"
                  title="Open Time Wheel Picker"
                >
                  <Clock className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Time Wheel Picker Popover */}
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

          {/* Place of Birth Lookup */}
          <div className="space-y-1.5 relative" ref={locationDropdownRef}>
            <label htmlFor={`pob-${gender}`} className="text-xs font-semibold text-ds-secondary flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-ds-primary shrink-0" aria-hidden="true" />
              <span>{l.pob} <span className="text-ds-primary" aria-hidden="true">*</span><span className="sr-only">Required</span></span>
            </label>
            <div className="relative">
              <input
                id={`pob-${gender}`}
                type="text"
                required
                disabled={isLoading}
                placeholder={l.pobPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0 || locationError) setShowLocationDropdown(true);
                }}
                className="w-full h-11 bg-ds-surface border border-ds-secondary/20 focus:ring-2 focus:ring-ds-primary/20 focus:border-ds-primary rounded-ds-lg pl-10 pr-8 py-2.5 text-xs text-ds-secondary focus:outline-none transition-all disabled:opacity-50"
                aria-expanded={showLocationDropdown}
                aria-autocomplete="list"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ds-on-surface-variant">
                {searching ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-ds-primary" aria-hidden="true" />
                ) : (
                  <MapPin className="w-4 h-4 text-ds-primary" aria-hidden="true" />
                )}
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setPlace('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-on-surface-variant hover:text-ds-secondary p-1 cursor-pointer focus-ring rounded-ds-sm"
                  aria-label="Clear location search"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {showLocationDropdown && (searchQuery.length >= 3) && (
              <div 
                className="absolute left-0 right-0 top-full mt-1 bg-ds-surface border border-ds-secondary/20 rounded-ds-lg shadow-ds-lg overflow-hidden z-50 max-h-52 overflow-y-auto animate-in fade-in duration-150"
                role="listbox"
              >
                {suggestions.map((item, idx) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected="false"
                    key={item.displayName + idx}
                    onClick={() => handleSelectLocation(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-ds-surface-container border-b border-ds-secondary/10 last:border-0 transition-colors flex flex-col cursor-pointer focus-ring"
                  >
                    <span className="text-xs font-semibold text-ds-secondary">{item.place}</span>
                    <span className="text-[10px] text-ds-on-surface-variant mt-0.5">
                      📍 {item.displayName} (UTC {item.timezone >= 0 ? `+${item.timezone}` : item.timezone})
                    </span>
                  </button>
                ))}
                {locationError && (
                  <div className="p-3 text-xs text-ds-on-surface-variant bg-ds-warning-amber/10 flex items-start gap-2 border border-ds-warning-amber/30 rounded-ds-lg">
                    <AlertCircle className="w-4 h-4 text-ds-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{locationError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: ADVANCED COORDINATES (Collapsible) */}
        <div className="border border-ds-secondary/15 rounded-ds-lg overflow-hidden bg-ds-surface-container">
          <button
            type="button"
            onClick={() => setShowAdvancedCoords(!showAdvancedCoords)}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-ds-on-surface-variant hover:text-ds-secondary transition-colors cursor-pointer focus-ring"
            aria-expanded={showAdvancedCoords}
            aria-controls={`advanced-coords-${gender}`}
          >
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ds-primary">
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{l.secCoords}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-ds-on-surface-variant font-mono">
                {latitude ? `${latitude}°, ${longitude}° (UTC ${timezone})` : 'Auto-detected'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvancedCoords ? 'rotate-180' : ''}`} aria-hidden="true" />
            </div>
          </button>

          {showAdvancedCoords && (
            <div id={`advanced-coords-${gender}`} className="p-4 border-t border-ds-secondary/10 space-y-3 bg-ds-surface">
              <p className="text-[10px] text-ds-on-surface-variant">{l.coordsSub}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label htmlFor={`lat-${gender}`} className="text-[10px] uppercase font-mono tracking-wider text-ds-on-surface-variant block">{l.lat}</label>
                  <input
                    id={`lat-${gender}`}
                    type="text"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className={`w-full bg-ds-surface-container border ${isLatInvalid ? 'border-ds-error-crimson' : 'border-ds-secondary/20'} rounded-ds-md px-2.5 py-1.5 text-xs text-ds-secondary font-mono focus:outline-none focus:border-ds-primary focus:ring-2 focus:ring-ds-primary/20`}
                    aria-invalid={isLatInvalid}
                  />
                  {isLatInvalid && <span className="text-[9px] text-ds-error-crimson block">{l.errLat}</span>}
                </div>
                <div className="space-y-1">
                  <label htmlFor={`lng-${gender}`} className="text-[10px] uppercase font-mono tracking-wider text-ds-on-surface-variant block">{l.lng}</label>
                  <input
                    id={`lng-${gender}`}
                    type="text"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className={`w-full bg-ds-surface-container border ${isLngInvalid ? 'border-ds-error-crimson' : 'border-ds-secondary/20'} rounded-ds-md px-2.5 py-1.5 text-xs text-ds-secondary font-mono focus:outline-none focus:border-ds-primary focus:ring-2 focus:ring-ds-primary/20`}
                    aria-invalid={isLngInvalid}
                  />
                  {isLngInvalid && <span className="text-[9px] text-ds-error-crimson block">{l.errLng}</span>}
                </div>
                <div className="space-y-1">
                  <label htmlFor={`tz-${gender}`} className="text-[10px] uppercase font-mono tracking-wider text-ds-on-surface-variant block">{l.utcOffset}</label>
                  <input
                    id={`tz-${gender}`}
                    type="text"
                    required
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className={`w-full bg-ds-surface-container border ${isTzInvalid ? 'border-ds-error-crimson' : 'border-ds-secondary/20'} rounded-ds-md px-2.5 py-1.5 text-xs text-ds-secondary font-mono focus:outline-none focus:border-ds-primary focus:ring-2 focus:ring-ds-primary/20`}
                    aria-invalid={isTzInvalid}
                  />
                  {isTzInvalid && <span className="text-[9px] text-ds-error-crimson block">{l.errTz}</span>}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PersonBirthForm;
