import React, { useState, useEffect, useRef } from 'react';
import { Heart, Loader2, AlertCircle, Sparkles, CheckCircle2, ShieldAlert, Layers, BarChart3, Edit3 } from 'lucide-react';
import PersonBirthForm from '../components/PersonBirthForm';
import PersonSummaryCard from '../components/PersonSummaryCard';
import CompatibilityGauge from '../components/CompatibilityGauge';
import LagnaChartCard from '../components/LagnaChartCard';
import CompatibilityRulesCard from '../components/CompatibilityRulesCard';
import KutaBreakdownCard from '../components/KutaBreakdownCard';
import { DoshasView } from '../components/DoshasView';
import { checkMarriageMatch } from '../lib/marriageMatchAPI';
import { PersonFormData, MarriageMatchResult, ChartStyle } from '../types/marriageMatch';
import { safeSetLocalStorageItem } from '../lib/storageUtils';
import { Button, ButtonGroup } from '../components/design-system/Button';

const defaultFormData: PersonFormData = {
  name: '',
  date: '1995-01-01',
  time: '12:00:00',
  place: '',
  latitude: 0,
  longitude: 0,
  timezone: 0,
};

const labels = {
  en: {
    title: "Vedic Marriage Compatibility Match",
    subtitle: "Precision Ashta Kuta, Dosha, and Planetary Analysis",
    checkBtn: "CALCULATE MARRIAGE MATCH",
    checking: "CALCULATING ASTROLOGICAL ALIGNMENT...",
    boyDetails: "Groom's Profile",
    girlDetails: "Bride's Profile",
    retry: "RETRY CALCULATION",
    errorTitle: "Calculation Notice",
    boyChartTitle: "Groom's Lagna Chart (D-1)",
    girlChartTitle: "Bride's Lagna Chart (D-1)",
    editForms: "Modify Input Data",
    tabRules: "Compatibility Rules",
    tabCharts: "Birth Charts (D-1)",
    tabKuta: "Ashta Kuta Breakdown",
    tabDoshas: "Doshas & Remedies"
  },
  hi: {
    title: "वैदिक विवाह अनुकूलता मिलान",
    subtitle: "सटीक अष्टकूट, दोष और ग्रह विलेषण",
    checkBtn: "विवाह मिलान की गणना करें",
    checking: "ज्योतिषीय संरेखण की गणना हो रही है...",
    boyDetails: "वर प्रोफ़ाइल",
    girlDetails: "वधू प्रोफ़ाइल",
    retry: "पुनः प्रयास करें",
    errorTitle: "गणना सूचना",
    boyChartTitle: "वर लग्न कुंडली (D-1)",
    girlChartTitle: "वधू लग्न कुंडली (D-1)",
    editForms: "विवरण संपादित करें",
    tabRules: "अनुकूलता नियम",
    tabCharts: "जन्म कुंडली (D-1)",
    tabKuta: "अष्टकूट ब्रेकडाउन",
    tabDoshas: "दोष और उपचार"
  },
  te: {
    title: "వైదిక వివాహ అనుకూలత మైత్రి",
    subtitle: "ఖచ్చితమైన అష్టకూట మరియు గ్రహ విశ్లేషణ",
    checkBtn: "వివాహ అనుకూలతను తనిఖీ చేయండి",
    checking: "జాతక పొంతన తనిఖీ చేస్తున్నాము...",
    boyDetails: "వరుడి ప్రొఫైల్",
    girlDetails: "వధువు ప్రొఫైల్",
    retry: "మళ్లీ ప్రయత్నించండి",
    errorTitle: "లోపం సమచారం",
    boyChartTitle: "వరుడి లగ్న కుండలి (D-1)",
    girlChartTitle: "వధువు లగ్న కుండలి (D-1)",
    editForms: "వివరాలను సవరించండి",
    tabRules: "అనుకూలత సూత్రాలు",
    tabCharts: "జాతక చక్రాలు (D-1)",
    tabKuta: "అష్టకూట విశ్లేషణ",
    tabDoshas: "దోషాలు & పరిహారాలు"
  }
};

interface MarriageMatchProps {
  language?: 'en' | 'hi' | 'te';
}

const MarriageMatch: React.FC<MarriageMatchProps> = ({ language = 'en' }) => {
  const l = labels[language] || labels.en;

  const [boyFormData, setBoyFormData] = useState<PersonFormData>(defaultFormData);
  const [girlFormData, setGirlFormData] = useState<PersonFormData>(defaultFormData);
  
  const [chartStyle, setChartStyle] = useState<ChartStyle>('south-indian');
  const [matchResult, setMatchResult] = useState<MarriageMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Deep-Dive Tab (defaulting to Birth Charts as first tab)
  const [activeTab, setActiveTab] = useState<'charts' | 'kuta' | 'doshas'>('charts');

  // Form Collapse state when results are generated
  const [showForms, setShowForms] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sanathanam_last_marriage_match');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.boy) setBoyFormData(parsed.boy);
        if (parsed.girl) setGirlFormData(parsed.girl);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Save to local storage when form changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      safeSetLocalStorageItem('sanathanam_last_marriage_match', JSON.stringify({ boy: boyFormData, girl: girlFormData }));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [boyFormData, girlFormData]);

  const isFormComplete = (data: PersonFormData) => {
    return data.name && data.date && data.time && data.place;
  };

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormComplete(boyFormData) || !isFormComplete(girlFormData)) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await checkMarriageMatch({ boy: boyFormData, girl: girlFormData });
      setMatchResult(result);
      setShowForms(false); // Collapse forms so results are front-and-center
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during calculation.");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || !isFormComplete(boyFormData) || !isFormComplete(girlFormData);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 py-8 animate-fade-in pb-24 max-w-7xl mx-auto space-y-8">
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-royal-navy/10 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-pink-500/10 text-pink-400 rounded-2xl border border-pink-500/20 shadow-sm">
            <Heart className="w-7 h-7 fill-pink-500/30" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-playfair font-bold text-royal-navy tracking-wide uppercase">
              {l.title}
            </h1>
            <p className="text-body-md text-on-surface-variant mt-0.5">{l.subtitle}</p>
          </div>
        </div>

        {matchResult && (
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit3 className="w-4 h-4" />}
            onClick={() => setShowForms(!showForms)}
          >
            {showForms ? "Hide Input Forms" : l.editForms}
          </Button>
        )}
      </div>

      {/* TIER 0: BIRTH DATA INPUT FORMS */}
      {showForms && (
        <form onSubmit={handleCheck} className="bg-ds-surface rounded-2xl border border-ds-secondary/15 shadow-ds-sm overflow-hidden flex flex-col w-full transition-all">
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
            
            {/* Groom's Form */}
            <div className="space-y-4">
              <PersonBirthForm
                gender="Male"
                language={language}
                onUpdate={setBoyFormData}
                isLoading={loading}
              />
            </div>
            
            {/* Divider for desktop */}
            <div className="hidden lg:block absolute left-1/2 top-6 bottom-6 w-px bg-ds-secondary/15 -translate-x-1/2" />
            
            {/* Bride's Form */}
            <div className="space-y-4">
              <PersonBirthForm
                gender="Female"
                language={language}
                onUpdate={setGirlFormData}
                isLoading={loading}
              />
            </div>
          </div>
          
          <div className="p-4 sm:p-6 bg-ds-surface-container border-t border-ds-secondary/10">
            {error && (
              <div className="mb-4 p-4 bg-error-container/30 border border-error-container rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                <div>
                  <p className="text-body-md font-bold text-error">{l.errorTitle}</p>
                  <p className="text-body-sm text-error/90 mt-1">{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-error"
                    onClick={handleCheck}
                  >
                    {l.retry}
                  </Button>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitDisabled}
              isLoading={loading}
              icon={!loading ? <Heart className="w-5 h-5 fill-white" /> : undefined}
            >
              {loading ? l.checking : l.checkBtn}
            </Button>
          </div>
        </form>
      )}

      {/* Loading Full Screen Placeholder */}
      {loading && (
        <div className="w-full min-h-[360px] flex flex-col items-center justify-center text-deep-saffron border-2 border-dashed border-royal-navy/10 rounded-3xl p-8 text-center bg-white shadow-md">
          <Loader2 className="w-12 h-12 mb-4 animate-spin text-deep-saffron" />
          <p className="text-label-caps animate-pulse">{l.checking}</p>
        </div>
      )}

      {/* TIER 1, 2, 3: RESULTS PRESENTATION */}
      {matchResult && !loading && (
        <div ref={resultsRef} className="space-y-8 animate-fade-in w-full">
          
          {/* TIER 1: HERO VERDICT BANNER */}
          <div className="w-full">
            <div className="w-full rounded-2xl">
              <CompatibilityRulesCard
                kutas={matchResult.kutas}
                totalScore={matchResult.totalScore}
                maxScore={matchResult.maxScore}
                language={language}
              />
            </div>
          </div>

          {/* TIER 2: PROFILES SIDE BY SIDE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <PersonSummaryCard
              cardTitle={l.boyDetails}
              borderColor="blue"
              manglikDoshaPresent={matchResult.manglik?.boy}
              person={{
                name: boyFormData.name,
                date: boyFormData.date,
                time: boyFormData.time,
                place: boyFormData.place,
                nakshatra: matchResult.boyInfo?.nakshatra || "Unknown",
                rasi: matchResult.boyInfo?.rasi || "Unknown",
                lagna: matchResult.boyInfo?.lagna || "Unknown",
              }}
            />
            <PersonSummaryCard
              cardTitle={l.girlDetails}
              borderColor="purple"
              manglikDoshaPresent={matchResult.manglik?.girl}
              person={{
                name: girlFormData.name,
                date: girlFormData.date,
                time: girlFormData.time,
                place: girlFormData.place,
                nakshatra: matchResult.girlInfo?.nakshatra || "Unknown",
                rasi: matchResult.girlInfo?.rasi || "Unknown",
                lagna: matchResult.girlInfo?.lagna || "Unknown",
              }}
            />
          </div>

          {/* TIER 3: TECHNICAL DEEP-DIVES (Tab Navigation) */}
          <div className="space-y-6 pt-4">
            
            {/* Tab Selector Bar */}
            <div className="flex items-center gap-2 p-1.5 overflow-x-auto custom-scrollbar">
              <Button
                variant={activeTab === 'charts' ? 'primary' : 'ghost'}
                size="sm"
                icon={<Layers className="w-4 h-4" />}
                onClick={() => setActiveTab('charts')}
              >
                {l.tabCharts}
              </Button>

              <Button
                variant={activeTab === 'kuta' ? 'primary' : 'ghost'}
                size="sm"
                icon={<BarChart3 className="w-4 h-4" />}
                onClick={() => setActiveTab('kuta')}
              >
                {l.tabKuta}
              </Button>

              <Button
                variant={activeTab === 'doshas' ? 'primary' : 'ghost'}
                size="sm"
                icon={<ShieldAlert className="w-4 h-4" />}
                onClick={() => setActiveTab('doshas')}
              >
                {l.tabDoshas}
              </Button>
            </div>

            {/* TAB CONTENT PANELS */}
            {activeTab === 'charts' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <LagnaChartCard
                  horoscope={matchResult.boyHoroscope}
                  cardTitle={l.boyChartTitle}
                  borderColor="blue"
                  chartStyle={chartStyle}
                  onChartStyleChange={setChartStyle}
                />
                <LagnaChartCard
                  horoscope={matchResult.girlHoroscope}
                  cardTitle={l.girlChartTitle}
                  borderColor="purple"
                  chartStyle={chartStyle}
                  onChartStyleChange={setChartStyle}
                />
              </div>
            )}

            {activeTab === 'kuta' && (
              matchResult.kutas.map((kuta, index) => (
                <KutaBreakdownCard
                  key={index}
                  kuta={{
                    name: kuta.name,
                    maxPoints: kuta.max,
                    obtainedPoints: kuta.boyValue,
                    status: kuta.isUnfavourable ? 'unfavorable' : (kuta.boyValue < kuta.max ? 'moderate' : 'favorable'),
                    description: kuta.description || kuta.details || ''
                  }}
                />
              ))
            )}

            {activeTab === 'doshas' && (
              <DoshasView
                doshas={matchResult.doshas || {}}
                boyHoroscope={matchResult.boyHoroscope}
                girlHoroscope={matchResult.girlHoroscope}
                language={language}
              />
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default MarriageMatch;
