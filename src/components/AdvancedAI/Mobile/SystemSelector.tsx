import React, { useState } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { ConsultationPersona } from '../../../lib/services/EnhancedGeminiConsultationService';

export type SystemId = 'vedic' | 'divisional' | 'remedies';

export interface SystemOption {
  id: SystemId;
  label: string;
  badge: string;
  description: string;
  icon: string;
  persona: ConsultationPersona;
}

export const SYSTEMS: SystemOption[] = [
  {
    id: 'vedic',
    label: 'Vedic Predictive & Timing (Parashari)',
    badge: 'VEDIC',
    description: 'D1 Rasi, D9 Navamsha, D10 Dashamsha, Vimshottari Dasha & Gochar w.r.t Moon',
    icon: '🏛️',
    persona: 'classical_parashari'
  },
  {
    id: 'divisional',
    label: 'Divisional Charts & Yogas',
    badge: 'D-CHARTS',
    description: 'D1-D10 Divisional Charts, Raja Yogas, Dhana Yogas & House Lord Dignity',
    icon: '🌌',
    persona: 'vedic_divisional'
  },
  {
    id: 'remedies',
    label: 'Vedic Remedies & Upaya',
    badge: 'REMEDIES',
    description: 'Traditional Vedic Upaya: Mantras, Stotrams, Fasting/Vrat & Daan/Charity',
    icon: '🪔',
    persona: 'vedic_remedial'
  }
];

interface SystemSelectorProps {
  currentSystem: SystemId;
  onChangeSystem: (system: SystemId) => void;
}

export const SystemSelector: React.FC<SystemSelectorProps> = ({
  currentSystem,
  onChangeSystem
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeOption = SYSTEMS.find((s) => s.id === currentSystem) || SYSTEMS[0];

  const handleSelect = (id: SystemId) => {
    try {
      localStorage.setItem('preferred-system', id);
    } catch (e) {}
    onChangeSystem(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-ds-surface-container hover:bg-ds-surface border border-ds-secondary/15 hover:border-ds-primary/50 rounded-xl text-xs font-semibold text-ds-on-surface transition-all cursor-pointer shadow-sm"
        aria-label="Select Astrology Analysis System"
      >
        <span className="text-sm leading-none">{activeOption.icon}</span>
        <span className="font-mono text-[11px] font-extrabold text-ds-primary">
          [{activeOption.badge}]
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-ds-on-surface-variant" />
      </button>

      {/* Modal Overlay / Slide-up Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 text-ds-on-surface">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-md bg-ds-surface border border-ds-secondary/15 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ds-secondary/15 bg-ds-surface-container">
              <div className="flex items-center gap-2">
                <span className="text-base">🔮</span>
                <h3 className="text-sm font-bold text-ds-on-surface">
                  Select Analysis System
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-ds-surface text-ds-on-surface-variant hover:text-ds-on-surface transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options List */}
            <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto bg-ds-surface/50">
              {SYSTEMS.map((system) => {
                const isSelected = system.id === currentSystem;
                return (
                  <label
                    key={system.id}
                    onClick={() => handleSelect(system.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-ds-primary/10 border-ds-primary/30 shadow-sm'
                        : 'bg-ds-surface border-ds-secondary/15 hover:border-ds-primary/30 hover:bg-ds-surface-container'
                    }`}
                  >
                    <input
                      type="radio"
                      name="astrology_system"
                      value={system.id}
                      checked={isSelected}
                      onChange={() => handleSelect(system.id)}
                      className="mt-1 accent-ds-primary cursor-pointer"
                    />

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{system.icon}</span>
                          <span className={`text-xs font-bold ${isSelected ? 'text-ds-primary' : 'text-ds-on-surface'}`}>
                            {system.label}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-ds-primary/10 text-ds-primary text-[10px] font-mono font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-ds-on-surface-variant leading-relaxed">
                        {system.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-ds-secondary/15 bg-ds-surface-container flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-4 py-2 bg-ds-surface hover:bg-ds-surface-container text-ds-on-surface-variant hover:text-ds-on-surface border border-ds-secondary/15 rounded-xl text-xs font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

