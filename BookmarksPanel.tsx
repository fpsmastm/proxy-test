import React from 'react';
import { X, Trash2, ExternalLink, BookOpen } from 'lucide-react';
import { Bookmark } from '../types';
import { getFaviconUrl, extractDomain } from '../utils/proxy';

interface BookmarksPanelProps {
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export const BookmarksPanel: React.FC<BookmarksPanelProps> = ({
  bookmarks,
  onNavigate,
  onRemove,
  onClose,
}) => {
  return (
    <div className="absolute right-0 top-0 w-80 h-full bg-surface border-l border-border z-50 flex flex-col animate-slide-down">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          Bookmarks ({bookmarks.length})
        </h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-surface-lighter transition-colors">
          <X className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <BookOpen className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No bookmarks yet</p>
            <p className="text-xs mt-1">Click the star icon to add one!</p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-light transition-colors cursor-pointer"
                onClick={() => {
                  onNavigate(bm.url);
                  onClose();
                }}
              >
                <img
                  src={getFaviconUrl(bm.url)}
                  alt=""
                  className="w-4 h-4 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{bm.title}</p>
                  <p className="text-xs text-text-muted truncate">{extractDomain(bm.url)}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(bm.id);
                    }}
                    className="p-1 rounded hover:bg-danger/20 text-text-muted hover:text-danger transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
