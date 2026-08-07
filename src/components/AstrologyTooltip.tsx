import React, { useState } from 'react';
import styles from './AstrologyTooltip.module.css';

const ASTROLOGY_GLOSSARY: Record<string, { definition: string; telugu: string; example: string }> = {
  'bhukti': {
    definition: 'The sub-period within a major planetary period (Mahadasha). Each Mahadasha is divided into 9 Bhukti periods.',
    telugu: 'భుక్తి - ఉప కాల వ్యవధి',
    example: 'In Jupiter Mahadasha, Mercury Bhukti activates analytical and communication endeavors.'
  },
  'gochara': {
    definition: 'Current planetary transits; the real-time movement of planets through zodiacal signs.',
    telugu: 'గోచర - వర్తమాన గ్రహ సంచారం',
    example: 'Saturn transiting through your 10th house indicates career restructuring and consolidation.'
  },
  'sub-lord': {
    definition: 'The ruling planet of a micro-division within a Nakshatra (KP System). Crucial for binary outcomes.',
    telugu: 'ఉప-ప్రభువు - నక్షత్ర సూక్ష్మ భాగ స్వామి',
    example: 'If 10th Cusp Sub-Lord promises 2, 6, 10, career promotion is guaranteed.'
  },
  'mahadasha': {
    definition: 'Major planetary period in Vimshottari Dasha, lasting between 6 and 20 years.',
    telugu: 'మహాదశ - ప్రధాన గ్రహ కాలం',
    example: 'Mercury Mahadasha brings focus to learning, commercial ventures, and mental agility.'
  },
  'lagna': {
    definition: 'The Ascendant sign rising on the eastern horizon at the exact time of birth.',
    telugu: 'లగ్నము - జన్మ రాశి లగ్నం',
    example: 'Cancer Lagna indicates an empathetic, intuitive, and protective nature.'
  }
};

interface AstrologyTooltipProps {
  term: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const AstrologyTooltip: React.FC<AstrologyTooltipProps> = ({
  term,
  children,
  placement = 'top'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const key = term.toLowerCase().replace(/\s+/g, '-');
  const glossary = ASTROLOGY_GLOSSARY[key] || ASTROLOGY_GLOSSARY[term.toLowerCase()];

  if (!glossary) {
    return <span>{children}</span>;
  }

  return (
    <div className={styles.tooltip}>
      <span
        className={styles.trigger}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Definition: ${term}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          } else if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
      >
        {children}
        <span className={styles.indicator} aria-hidden="true">?</span>
      </span>

      {isOpen && (
        <div
          className={`${styles.popover} ${styles[`placement-${placement}`]}`}
          role="tooltip"
          id={`tooltip-${term.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <p className={styles.definition}>{glossary.definition}</p>
          <p className={styles.telugu}>{glossary.telugu}</p>
          <p className={styles.example}>
            <strong>Example:</strong> {glossary.example}
          </p>
        </div>
      )}
    </div>
  );
};

export default AstrologyTooltip;
