import React from 'react';
import { X, Trash2, Clock, ExternalLink } from 'lucide-react';
import { HistoryEntry } from '../types';
import { extractDomain, getFaviconUrl } from '../utils/proxy';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onNavigate: (url: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onNavigate,
  onClearHistory,
  onClose,
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="absolute right-0 top-0 w-80 h-full bg-surface border-l border-border z-50 flex flex-col animate-slide-down">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          History ({history.length})
        </h2>
        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-1 rounded hover:bg-danger/20 text-text-muted hover:text-danger transition-colors"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-lighter transition-colors">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <Clock className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No history yet</p>
            <p className="text-xs mt-1">Your browsing history will appear here</p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-light transition-colors cursor-pointer"
                onClick={() => {
                  onNavigate(entry.url);
                  onClose();
                }}
              >
                <img
                  src={getFaviconUrl(entry.url)}
                  alt=""
                  className="w-4 h-4 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{entry.title}</p>
                  <p className="text-xs text-text-muted truncate">{extractDomain(entry.url)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-text-muted">{formatTime(entry.timestamp)}</span>
                  <ExternalLink className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
