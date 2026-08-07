import React, { useState } from 'react';
import {
  Pin,
  ChevronDown,
  History,
  Search,
  X,
  PlusCircle,
  Trash2,
  Sliders,
  Layers,
  Sparkles,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export interface HistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  response?: string;
}

export interface SelectedFieldsData {
  houseFocus: string;
  subLord: string;
  dashaPeriod: string;
  kpVerdict: {
    verdict: 'YES' | 'NO' | 'DELAYED';
    confidence: number;
  };
  rulingPlanets: string[];
}

interface LeftSidebarProps {
  selectedFields: SelectedFieldsData;
  history: HistoryItem[];
  activeHistoryId?: string | null;
  onLoadHistory: (item: HistoryItem) => void;
  onDeleteHistoryItem?: (id: string) => void;
  onClearHistory: () => void;
  onNewConsultation: () => void;
  onOpenInspector: () => void;
  onOpenPreferences: () => void;
  onOpenShortcuts?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  selectedFields,
  history,
  activeHistoryId,
  onLoadHistory,
  onDeleteHistoryItem,
  onClearHistory,
  onNewConsultation,
  onOpenInspector,
  onOpenPreferences,
  onOpenShortcuts,
  isOpen,
  onClose
}) => {
  const [fieldsExpanded, setFieldsExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(6);

  // Helper for relative timestamps
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredHistory = history.filter((item) =>
    item.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedHistory = filteredHistory.slice(0, displayCount);

  const getVerdictBadge = (verdict: 'YES' | 'NO' | 'DELAYED', confidence: number) => {
    if (verdict === 'YES') {
      return <span className="field-value text-emerald-400 font-bold">✓ YES ({confidence}%)</span>;
    }
    if (verdict === 'DELAYED') {
      return <span className="field-value text-amber-400 font-bold">⏳ DELAYED ({confidence}%)</span>;
    }
    return <span className="field-value text-rose-400 font-bold">✕ NO ({confidence}%)</span>;
  };

  return (
    <aside
      className={`ai-sidebar ${isOpen ? 'open' : ''}`}
      id="ai-sidebar"
      aria-label="Astrological Analysis Context and Query History"
    >
      {/* Top: Selected Fields / Analysis Context */}
      <section className="sidebar-section selected-fields-section">
        <div className="section-header">
          <h3 className="section-title" id="sidebar-context-heading">
            <Pin className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>Analysis Context</span>
          </h3>
          <button
            className={`expand-toggle ${fieldsExpanded ? 'expanded' : ''}`}
            onClick={() => setFieldsExpanded(!fieldsExpanded)}
            title="Toggle Analysis Context"
            aria-expanded={fieldsExpanded}
            aria-controls="selected-fields"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {fieldsExpanded && (
          <dl className="selected-fields-content" id="selected-fields">
            <div className="field-item" onClick={onOpenInspector} role="button" tabIndex={0} aria-label="House Focus details">
              <dt className="field-label">House Focus</dt>
              <dd className="field-value">{selectedFields.houseFocus}</dd>
            </div>

            <div className="field-item" onClick={onOpenInspector} role="button" tabIndex={0} aria-label="House Lord details">
              <dt className="field-label">House Lord</dt>
              <dd className="field-value text-amber-300">{selectedFields.subLord}</dd>
            </div>

            <div className="field-item" onClick={onOpenInspector} role="button" tabIndex={0} aria-label="Active Dasha details">
              <dt className="field-label">Active Dasha</dt>
              <dd className="field-value text-sky-300">{selectedFields.dashaPeriod}</dd>
            </div>

            <div className="field-item" onClick={onOpenInspector} role="button" tabIndex={0} aria-label="Vedic Verdict details">
              <dt className="field-label">Vedic Promise Verdict</dt>
              <dd>{getVerdictBadge(selectedFields.kpVerdict.verdict, selectedFields.kpVerdict.confidence)}</dd>
            </div>

            <div className="field-item" onClick={onOpenInspector} role="button" tabIndex={0} aria-label="Ruling Planets details">
              <dt className="field-label">Key Factors</dt>
              <dd className="field-value">{selectedFields.rulingPlanets.join(', ')}</dd>
            </div>

            <div className="field-actions">
              <button
                className="field-action-btn"
                onClick={onOpenInspector}
                aria-label="Inspect Full Chart Data"
              >
                Inspect Chart
              </button>
              <button
                className="field-action-btn"
                onClick={onOpenPreferences}
                aria-label="View Astrological Facts and Settings"
              >
                Facts & Data
              </button>
            </div>
          </dl>
        )}
      </section>

      {/* Middle: Query History */}
      <section className="sidebar-section query-history-section">
        <div className="section-header">
          <h3 className="section-title" id="sidebar-history-heading">
            <History className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>Query History</span>
          </h3>
          <button
            className={`expand-toggle ${historyExpanded ? 'expanded' : ''}`}
            onClick={() => setHistoryExpanded(!historyExpanded)}
            title="Toggle Query History"
            aria-expanded={historyExpanded}
            aria-controls="query-history"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {historyExpanded && (
          <>
            <div className="query-history-search">
              <input
                type="text"
                placeholder="🔍 Search queries..."
                className="history-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search query history"
              />
            </div>

            <div className="query-history-list" id="query-history" role="list">
              {displayedHistory.length === 0 ? (
                <div className="text-center py-6 px-2 text-xs text-[#64748B] italic">
                  {searchQuery ? 'No matching queries' : 'No query history yet'}
                </div>
              ) : (
                displayedHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`history-item ${activeHistoryId === item.id ? 'active' : ''}`}
                    onClick={() => {
                      onLoadHistory(item);
                      onClose();
                    }}
                    role="listitem"
                    tabIndex={0}
                  >
                    <div className="history-item-content">
                      <div className="history-query">🔹 {item.query}</div>
                      <div className="history-meta">
                        <span className="history-time">{formatRelativeTime(item.timestamp)}</span>
                        <span className="text-[#64748B]">•</span>
                        <span>
                          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    {onDeleteHistoryItem && (
                      <button
                        className="history-delete-btn"
                        title="Delete query"
                        aria-label={`Delete query "${item.query}"`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteHistoryItem(item.id);
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))
              )}

              {filteredHistory.length > displayCount && (
                <button
                  className="history-load-more"
                  onClick={() => setDisplayCount((prev) => prev + 5)}
                  aria-label="Load more query history items"
                >
                  ⬇️ Load More ({filteredHistory.length - displayCount} remaining)
                </button>
              )}
            </div>
          </>
        )}
      </section>

      {/* Bottom: Action Buttons */}
      <section className="sidebar-section sidebar-actions">
        <button
          className="action-button primary-action"
          onClick={onNewConsultation}
          aria-label="Start new consultation session"
        >
          <PlusCircle className="w-4 h-4" aria-hidden="true" />
          <span>+ New Consultation</span>
        </button>

        <button
          className="action-button secondary-action"
          onClick={onClearHistory}
          aria-label="Clear all query history"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          <span>Clear History</span>
        </button>

        {onOpenShortcuts && (
          <button
            className="action-button secondary-action"
            onClick={onOpenShortcuts}
            aria-label="View keyboard shortcuts"
          >
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
            <span>Shortcuts (⌘/Ctrl+?)</span>
          </button>
        )}
      </section>

      {/* Mobile Close Button */}
      <button
        className="sidebar-close-mobile"
        id="sidebar-close"
        onClick={onClose}
        aria-label="Close sidebar panel"
      >
        ✕ Close Sidebar
      </button>
    </aside>
  );
};
