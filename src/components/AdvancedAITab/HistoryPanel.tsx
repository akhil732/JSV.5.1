import React, { useState } from 'react';
import { History, Search, Trash2, X, Plus, Clock, ArrowRight } from 'lucide-react';

export interface HistoryItem {
  id: string;
  query: string;
  timestamp: Date;
}

interface HistoryPanelProps {
  isOpen: boolean;
  history: HistoryItem[];
  activeHistoryId?: string | null;
  onClose: () => void;
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  onNewConsultation: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  history,
  activeHistoryId,
  onClose,
  onSelectHistory,
  onDeleteHistoryItem,
  onClearHistory,
  onNewConsultation
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) =>
    item.query.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatRelativeTime = (date: Date) => {
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed left-0 top-0 bottom-0 w-full sm:w-96 bg-ds-surface border-r border-ds-secondary/15 z-50 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 text-ds-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ds-secondary/15 bg-ds-surface-container">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-ds-primary" />
            <h2 className="text-sm font-serif font-bold text-ds-on-surface">
              Query History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-ds-surface border border-ds-secondary/15 text-ds-on-surface-variant hover:text-ds-on-surface cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Controls */}
        <div className="p-4 space-y-3 border-b border-ds-secondary/15 bg-ds-surface">
          <button
            onClick={() => {
              onNewConsultation();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-ds-primary hover:bg-ds-primary/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Consultation</span>
          </button>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-ds-on-surface-variant/60 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search past queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-ds-surface-container border border-ds-secondary/15 rounded-xl text-xs text-ds-on-surface placeholder:text-ds-on-surface-variant/60 focus:outline-none focus:border-ds-primary transition-colors"
            />
          </div>
        </div>

        {/* History Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-ds-surface/50">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-xs text-ds-on-surface-variant font-mono font-bold">
              {searchTerm ? 'No queries matching search' : 'No history items saved yet'}
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className={`group p-3 rounded-xl border transition-all flex items-start justify-between gap-2 cursor-pointer shadow-xs ${
                  item.id === activeHistoryId
                    ? 'bg-ds-primary/10 border-ds-primary/50 text-ds-primary'
                    : 'bg-ds-surface border border-ds-secondary/15 hover:border-ds-primary/30 text-ds-secondary'
                }`}
                onClick={() => {
                  onSelectHistory(item);
                  onClose();
                }}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-xs font-bold line-clamp-2 leading-snug">
                    {item.query}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-ds-on-surface-variant font-mono font-bold">
                    <Clock className="w-3 h-3 text-ds-primary/80" />
                    <span>{formatRelativeTime(item.timestamp)}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHistoryItem(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-ds-error-crimson/10 text-ds-on-surface-variant/40 hover:text-ds-error-crimson transition-all"
                  title="Delete query"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-ds-secondary/15 bg-ds-surface-container">
            <button
              onClick={onClearHistory}
              className="w-full py-2 bg-ds-surface hover:bg-ds-error-crimson/10 border border-ds-secondary/15 hover:border-ds-error-crimson/40 text-ds-error-crimson font-bold rounded-xl text-xs font-mono transition-colors cursor-pointer shadow-sm"
            >
              Clear History
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryPanel;
