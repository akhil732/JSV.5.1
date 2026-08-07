import React from 'react';
import { calculateManglikDosha } from '../lib/manglikDosha';
import { ShieldAlert, CheckCircle2, AlertTriangle, Info, Sparkles, HeartHandshake } from 'lucide-react';

interface DoshasViewProps {
  doshas?: any;
  horoscopeData?: any; // Single person mode
  boyHoroscope?: any;  // Marriage match mode
  girlHoroscope?: any; // Marriage match mode
  language?: string;
}

export const DoshasView: React.FC<DoshasViewProps> = ({ doshas, horoscopeData, boyHoroscope, girlHoroscope }) => {
  const manglikResultSingle = horoscopeData ? calculateManglikDosha(horoscopeData) : null;
  const manglikResultBoy = boyHoroscope ? calculateManglikDosha(boyHoroscope) : null;
  const manglikResultGirl = girlHoroscope ? calculateManglikDosha(girlHoroscope) : null;
  
  const doshaEntries = doshas ? Object.entries(doshas) : [];

  const isDoshaActive = (htmlText: string) => {
    if (typeof htmlText !== 'string') return false;
    const txt = htmlText.replace(/<[^>]*>/g, ' ').toLowerCase();
    if (
      txt.includes("there is no") || 
      txt.includes("is no") || 
      txt.includes("is ineffective") || 
      txt.includes("no ganda") || 
      txt.includes("no kalathra") || 
      txt.includes("no shrapit") || 
      txt.includes("no ghata") || 
      txt.includes("no guru chandal")
    ) {
      return false;
    }
    return true;
  };

  const cleanHtml = (htmlText: string) => {
    if (typeof htmlText !== 'string') return '';
    return htmlText
      .replace(/^<html>/, '')
      .replace(/<\/html>$/, '')
      .trim();
  };

  const renderManglikCard = (manglikResult: any, titlePrefix: string = '') => {
    if (!manglikResult) return null;
    return (
      <div className="bg-ds-surface border border-ds-secondary/15 rounded-ds-xl p-5 relative overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-ds-lg border ${
              manglikResult.status === 'PRESENT' 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                : manglikResult.status === 'CANCELLED'
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            }`}>
              {manglikResult.status === 'PRESENT' ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-serif font-bold text-ds-secondary">{titlePrefix}Manglik (Kuja) Dosha Evaluation</h4>
              <p className="text-xs text-ds-on-surface-variant mt-1 max-w-xl">
                {manglikResult.reason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
              manglikResult.status === 'PRESENT' 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                : manglikResult.status === 'CANCELLED'
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            }`}>
              {manglikResult.status} {manglikResult.severity !== 'NONE' && `(${manglikResult.severity})`}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const activeDoshas = doshaEntries.filter(([doshaName, rawHtml]: [string, any]) => {
    if (typeof rawHtml !== 'string') return false;
    if (doshaName.toLowerCase().includes('manglik')) return false;
    return isDoshaActive(rawHtml);
  });

  return (
    <div className="rounded-ds-xl border border-ds-secondary/15 bg-ds-surface overflow-hidden shadow-ds-sm flex flex-col space-y-6 p-5 sm:p-6">
      
      {/* Header Banner */}
      <div className="bg-ds-surface-container p-4 rounded-ds-lg border border-ds-secondary/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-ds-primary/10 text-ds-primary rounded-ds-lg border border-ds-primary/20">
            <Sparkles className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-ds-secondary tracking-wide uppercase">
              Planetary Doshas
            </h3>
          </div>
        </div>
      </div>

      {/* Manglik Dosha Card */}
      {manglikResultSingle && renderManglikCard(manglikResultSingle)}
      {manglikResultBoy && renderManglikCard(manglikResultBoy, 'Male: ')}
      {manglikResultGirl && renderManglikCard(manglikResultGirl, 'Female: ')}

      {/* Additional Doshas */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-ds-on-surface-variant mb-3">Other Planetary Doshas</h4>
        {activeDoshas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDoshas.map(([doshaName, rawHtml]: [string, any]) => {
              return (
                <div
                  key={doshaName}
                  className="bg-ds-surface-container border border-ds-secondary/15 p-4 rounded-ds-lg hover:border-ds-primary/30 transition-all flex items-center justify-between shadow-xs"
                >
                  <span className="text-xs font-serif font-bold text-ds-secondary">{doshaName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border bg-ds-primary/10 border-ds-primary/30 text-ds-primary">
                    ACTIVE (MONITORED)
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-ds-lg flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="text-xs font-medium">All other major planetary doshas (such as Kaal Sarp, Shrapit, Guru Chandal, and Ghata) are clear.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoshasView;
