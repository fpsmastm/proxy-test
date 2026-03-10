import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Shield,
  Star,
  Search,
  Settings,
  BookOpen,
  Clock,
} from 'lucide-react';

interface AddressBarProps {
  url: string;
  isLoading: boolean;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onHome: () => void;
  onBookmark: () => void;
  onTogglePanel: (panel: 'settings' | 'bookmarks' | 'history') => void;
  isBookmarked: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export const AddressBar: React.FC<AddressBarProps> = ({
  url,
  isLoading,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  onHome,
  onBookmark,
  onTogglePanel,
  isBookmarked,
  canGoBack,
  canGoForward,
}) => {
  const [inputValue, setInputValue] = useState(url);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(url === 'nova://newtab' ? '' : url);
    }
  }, [url, isFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onNavigate(inputValue.trim());
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const navBtnClass = (enabled: boolean) =>
    `p-1.5 rounded transition-colors ${
      enabled
        ? 'hover:bg-surface-lighter text-text-secondary hover:text-text-primary'
        : 'text-text-muted cursor-not-allowed'
    }`;

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-surface border-b border-border">
      {/* Navigation buttons */}
      <button onClick={onBack} disabled={!canGoBack} className={navBtnClass(canGoBack)} title="Back">
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button onClick={onForward} disabled={!canGoForward} className={navBtnClass(canGoForward)} title="Forward">
        <ArrowRight className="w-4 h-4" />
      </button>
      <button onClick={onRefresh} className={navBtnClass(true)} title="Refresh">
        <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
      <button onClick={onHome} className={navBtnClass(true)} title="Home">
        <Home className="w-4 h-4" />
      </button>

      {/* URL Bar */}
      <form onSubmit={handleSubmit} className="flex-1 mx-1">
        <div
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200
            ${isFocused
              ? 'bg-surface-dark ring-2 ring-accent shadow-lg shadow-accent-glow'
              : 'bg-surface-light hover:bg-surface-lighter'
            }
          `}
        >
          {isFocused ? (
            <Search className="w-4 h-4 text-accent flex-shrink-0" />
          ) : (
            <Shield className="w-4 h-4 text-success flex-shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={() => setIsFocused(false)}
            placeholder="Search or enter URL..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
            spellCheck={false}
          />
        </div>
      </form>

      {/* Action buttons */}
      <button
        onClick={onBookmark}
        className={`p-1.5 rounded transition-colors hover:bg-surface-lighter ${
          isBookmarked ? 'text-warning' : 'text-text-secondary hover:text-text-primary'
        }`}
        title="Bookmark"
      >
        <Star className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
      </button>
      <button
        onClick={() => onTogglePanel('bookmarks')}
        className="p-1.5 rounded transition-colors hover:bg-surface-lighter text-text-secondary hover:text-text-primary"
        title="Bookmarks"
      >
        <BookOpen className="w-4 h-4" />
      </button>
      <button
        onClick={() => onTogglePanel('history')}
        className="p-1.5 rounded transition-colors hover:bg-surface-lighter text-text-secondary hover:text-text-primary"
        title="History"
      >
        <Clock className="w-4 h-4" />
      </button>
      <button
        onClick={() => onTogglePanel('settings')}
        className="p-1.5 rounded transition-colors hover:bg-surface-lighter text-text-secondary hover:text-text-primary"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
};
