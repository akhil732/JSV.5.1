import React from 'react';
import { KutaResult } from '../types/marriageMatch';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, Sparkles } from 'lucide-react';

interface CompatibilityRulesCardProps {
  kutas: KutaResult[];
  totalScore?: number;
  maxScore?: number;
  language?: 'en' | 'hi' | 'te';
}

const translations = {
  en: {
    title: "Vedic Compatibility Rule Checks",
    subtitle: "Evaluation of critical marital doshas and alignment conditions",
    favourable: "Favourable Alignment",
    notFavourable: "Requires Remediation",
    partial: "Moderate Alignment",
    remediesTitle: "Actionable Remedies & Mitigation Steps:",
    remedy1: "Perform Pada Pooja and Lord Vishnu Sahasranama chanting.",
    remedy2: "Chant Nakshatra Beeja mantras during auspicious muhurtas.",
    remedy3: "Practice mindful daily communication and shared meditation.",
    remedy4: "Consult a qualified Vedic scholar for personalized Shanti Pooja timing."
  },
  hi: {
    title: "वैदिक संगतता नियम जांच",
    subtitle: "महत्वपूर्ण वैवाहिक दोषों और संरेखण स्थितियों का मूल्यांकन",
    favourable: "अनुकूल संरेखण",
    notFavourable: "उपचार की आवश्यकता",
    partial: "मध्यम संरेखण",
    remediesTitle: "कार्रवाई योग्य उपचार और निवारण चरण:",
    remedy1: "पद पूजा और श्री विष्णु सहस्रनाम पाठ करें।",
    remedy2: "शुभ मुहूर्त में नक्षत्र बीज मंत्रों का जाप करें।",
    remedy3: "दैनिक बातचीत और ध्यान का अभ्यास करें।",
    remedy4: "व्यक्तिगत शांति पूजा के लिए योग्य ज्योतिषी से परामर्श लें।"
  },
  te: {
    title: "వైదిక అనుకూలత నియమ తనిఖీ",
    subtitle: "ముఖ్యమైన వైవాహిక దోషాల విశ్లేషణ",
    favourable: "అనుకూల సమన్వయం",
    notFavourable: "పరిహారం అవసరం",
    partial: "మధ్యస్థ సమన్వయం",
    remediesTitle: "పరిహారాలు మరియు నివారణ మార్గాలు:",
    remedy1: "పద పూజ మరియు శ్రీ విష్ణు సహస్రనామ పారాయణం చేయండి.",
    remedy2: "నక్షత్ర బీజ మంత్రాలను జపించండి.",
    remedy3: "రోజూ ధ్యానం చేయండి.",
    remedy4: "శాంతి పూజల కోసం జ్యోతిష్యులను సంప్రదించండి."
  }
};

export const CompatibilityRulesCard: React.FC<CompatibilityRulesCardProps> = ({ kutas, totalScore = 0, maxScore = 36, language = 'en' }) => {
  const l = translations[language] || translations.en;

  const normalizedScore = Math.min(Math.max(totalScore, 0), maxScore);

  let tierTitle = "Requires Astrological Remediation";
  let badgeBg = "bg-rose-500/10 text-rose-400 border-rose-500/30";
  let textTheme = "text-rose-400";
  let TierIcon = ShieldAlert;

  if (normalizedScore >= 28) {
    tierTitle = "Exceptional Match";
    badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    textTheme = "text-emerald-400";
    TierIcon = Sparkles;
  } else if (normalizedScore >= 24) {
    tierTitle = "Very Good Match";
    badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    textTheme = "text-emerald-400";
    TierIcon = CheckCircle2;
  } else if (normalizedScore >= 18) {
    tierTitle = "Good & Acceptable Match";
    badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    textTheme = "text-amber-400";
    TierIcon = CheckCircle2;
  } else {
    tierTitle = "Needs Remedial Consideration";
    badgeBg = "bg-rose-500/10 text-rose-400 border-rose-500/30";
    textTheme = "text-rose-400";
    TierIcon = AlertTriangle;
  }

  return (
    <div className="bg-[#10141F] rounded-2xl border border-[#1E2433] p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1E2433] pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-full border text-sm font-semibold flex items-center gap-2 ${badgeBg}`}>
            <TierIcon className="w-4 h-4" />
            {tierTitle}
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold font-serif ${textTheme}`}>
            {totalScore.toFixed(1)}
          </span>
          <span className="text-lg font-medium text-[#718096]">
            / {maxScore}
          </span>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="space-y-3.5">
        {kutas.map((kuta, idx) => {
          const isUnfavourable = kuta.isUnfavourable;
          const ratio = (kuta.boyValue || 0) / (kuta.max || 1);
          const isFavourable = !isUnfavourable && ratio >= 0.5;

          let badgeText = l.favourable;
          let badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
          let borderClass = "border-[#1E2433] bg-[#0A0E17]";
          let IconComponent = CheckCircle2;

          if (isUnfavourable) {
            badgeText = l.notFavourable;
            badgeBg = "bg-rose-500/10 text-rose-400 border-rose-500/30";
            borderClass = "border-rose-500/30 bg-rose-500/5";
            IconComponent = ShieldAlert;
          } else if (!isFavourable) {
            badgeText = l.partial;
            badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/30";
            borderClass = "border-amber-500/30 bg-amber-500/5";
            IconComponent = AlertTriangle;
          }

          return (
            <div key={idx} className={`p-4 rounded-xl border ${borderClass} transition-all space-y-3`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 shrink-0 ${isUnfavourable ? 'text-rose-400' : isFavourable ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <h4 className="text-sm font-bold text-[#F5F5F7]">
                      {kuta.name}
                    </h4>
                  </div>
                  
                  {(kuta.details || kuta.description) && (
                    <p className="text-xs text-[#A0AEC0] leading-relaxed">
                      {kuta.details || kuta.description}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badgeBg}`}>
                    {badgeText}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompatibilityRulesCard;
