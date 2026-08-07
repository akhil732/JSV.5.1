import React from 'react';
import { Award, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface CompatibilityGaugeProps {
  currentScore: number;
  maxScore?: number;
  label?: string;
}

export const CompatibilityGauge: React.FC<CompatibilityGaugeProps> = ({
  currentScore,
  maxScore = 36,
  label = 'Ashta Kuta Compatibility Score',
}) => {
  const normalizedScore = Math.min(Math.max(currentScore, 0), maxScore);
  const percentageVal = Math.round((normalizedScore / maxScore) * 100);

  // Determine Match Tier & Theme
  let tierTitle = "Requires Astrological Remediation";
  let tierDescription = "Score is below the standard 18-point threshold. Specific dosha remedies are recommended.";
  let badgeBg = "bg-rose-500/10 text-rose-400 border-rose-500/30";
  let TierIcon = ShieldAlert;

  if (normalizedScore >= 28) {
    tierTitle = "Exceptional Match";
    tierDescription = "Score exceeds 28/36 (78%+). Highly auspicious alignment across temperaments and longevity.";
    badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    TierIcon = Award;
  } else if (normalizedScore >= 24) {
    tierTitle = "Very Good Match";
    tierDescription = "Score is between 24-27 (66%-75%). Strong emotional and physical harmony for long-term marriage.";
    badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    TierIcon = CheckCircle2;
  } else if (normalizedScore >= 18) {
    tierTitle = "Good & Acceptable Match";
    tierDescription = "Score meets the 18/36 baseline threshold (50%+). Recommended with minor dosha checks.";
    badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    TierIcon = CheckCircle2;
  } else {
    tierTitle = "Needs Remedial Consideration";
    tierDescription = "Below 18 points. Requires in-depth analysis of planetary Dashas and remedial Poojas.";
    badgeBg = "bg-rose-500/10 text-rose-400 border-rose-500/30";
    TierIcon = AlertTriangle;
  }

  return (
    <div className="bg-ds-surface rounded-ds-xl border border-ds-outline p-6 shadow-ds-lg flex flex-col items-center text-center justify-center h-full space-y-5">
      
      {/* Tier Recommendation Badge Header */}
      <div className="flex flex-col items-center space-y-1.5">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-bold uppercase tracking-wider ${badgeBg}`}>
          <TierIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{tierTitle}</span>
        </div>
        <p className="text-xs text-ds-on-surface-variant max-w-sm leading-relaxed mt-1">
          {tierDescription}
        </p>
      </div>

      {/* Clean Score Display without Ring Chart */}
      <div
        className="bg-ds-surface-variant/40 rounded-ds-xl p-6 border border-ds-outline w-full max-w-sm flex flex-col items-center justify-center space-y-2"
        role="meter"
        aria-valuenow={normalizedScore}
        aria-valuemin={0}
        aria-valuemax={maxScore}
        aria-label={label}
      >
        <div className="flex items-baseline font-mono text-ds-on-surface">
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">{normalizedScore}</span>
          <span className="text-lg sm:text-xl text-ds-on-surface-variant ml-1">/{maxScore}</span>
        </div>
        
        <div>
          <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-ds-surface text-ds-primary border border-ds-outline">
            {percentageVal}% Normalized
          </span>
        </div>

        <div className="text-[11px] text-ds-on-surface-variant pt-1">
          <span>{label}</span>
        </div>
      </div>

    </div>
  );
};

export default CompatibilityGauge;
