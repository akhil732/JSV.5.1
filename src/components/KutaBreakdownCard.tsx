import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Kuta {
  name: string;
  maxPoints: number;
  obtainedPoints: number;
  status: 'favorable' | 'moderate' | 'unfavorable';
  description: string;
}

interface KutaBreakdownCardProps {
  kuta: Kuta;
}

export const KutaBreakdownCard: React.FC<KutaBreakdownCardProps> = ({ kuta }) => {
  const percentage = (kuta.obtainedPoints / kuta.maxPoints) * 100;
  
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'favorable':
        return {
          bg: '#27AE60/20',
          text: '#27AE60',
          label: 'FAVORABLE'
        };
      case 'moderate':
        return {
          bg: '#F39C12/20',
          text: '#F39C12',
          label: 'MODERATE'
        };
      case 'unfavorable':
        return {
          bg: '#C0392B/20',
          text: '#C0392B',
          label: 'CAUTION'
        };
      default:
        return { bg: '#999/20', text: '#999', label: 'UNKNOWN' };
    }
  };

  const statusStyles = getStatusStyles(kuta.status);

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#2C3E50]/10 hover:shadow-xs transition-shadow shadow-2xs">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-serif font-bold text-[#2C3E50]">{kuta.name}</h3>
          <p className="text-xs text-[#564337] mt-1 font-medium">{kuta.description}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap ml-2 border ${
            kuta.status === 'favorable' 
              ? 'bg-[#27AE60]/10 text-[#27AE60] border-[#27AE60]/20' 
              : kuta.status === 'moderate'
              ? 'bg-[#E67E22]/10 text-[#E67E22] border-[#E67E22]/20'
              : 'bg-[#C0392B]/10 text-[#C0392B] border-[#C0392B]/20'
          }`}
        >
          {statusStyles.label}
        </span>
      </div>

      {/* Score Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-[#FDFBF7] rounded-full overflow-hidden border border-[#2C3E50]/5">
          <div
            className={`
              h-full transition-all duration-300 rounded-full
              ${kuta.status === 'favorable' ? 'bg-[#27AE60]' : ''}
              ${kuta.status === 'moderate' ? 'bg-[#E67E22]' : ''}
              ${kuta.status === 'unfavorable' ? 'bg-[#C0392B]' : ''}
            `}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm font-bold text-[#2C3E50] min-w-max font-mono">
          {kuta.obtainedPoints}/{kuta.maxPoints}
        </span>
      </div>
    </div>
  );
};

export default KutaBreakdownCard;
