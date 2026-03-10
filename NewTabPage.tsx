import React, { useState } from 'react';
import { Search, Globe, Zap, Shield, ExternalLink, CloudLightning, Info } from 'lucide-react';
import { Bookmark } from '../types';
import { getFaviconUrl } from '../utils/proxy';

interface NewTabPageProps {
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  searchEngine: string;
}

const QUICK_LINKS = [
  { title: 'Google', url: 'https://www.google.com', icon: '🔍' },
  { title: 'YouTube', url: 'https://www.youtube.com', icon: '▶️' },
  { title: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '📚' },
  { title: 'Reddit', url: 'https://www.reddit.com', icon: '🗨️' },
  { title: 'Discord', url: 'https://discord.com/app', icon: '💬' },
  { title: 'Twitch', url: 'https://www.twitch.tv', icon: '🎮' },
  { title: 'Twitter/X', url: 'https://x.com', icon: '🐦' },
  { title: 'TikTok', url: 'https://www.tiktok.com', icon: '🎵' },
  { title: 'Spotify', url: 'https://open.spotify.com', icon: '🎧' },
  { title: 'Netflix', url: 'https://www.netflix.com', icon: '🎬' },
  { title: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { title: 'ChatGPT', url: 'https://chat.openai.com', icon: '🤖' },
];

export const NewTabPage: React.FC<NewTabPageProps> = ({ bookmarks, onNavigate, searchEngine }) => {
  const [searchValue, setSearchValue] = useState('');
  const [showTip, setShowTip] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onNavigate(searchValue.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-full bg-surface-dark overflow-y-auto pt-[8vh] pb-16 px-4 animate-fade-in">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="relative">
          <Globe className="w-12 h-12 text-accent" />
          <Zap className="w-5 h-5 text-warning absolute -bottom-1 -right-1" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
            Nova
          </h1>
          <p className="text-xs text-text-muted tracking-widest uppercase">Web Browser</p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="w-full max-w-xl mb-6">
        <div className="flex items-center gap-3 px-5 py-3.5 bg-surface rounded-2xl border border-border hover:border-border-light focus-within:border-accent focus-within:shadow-lg focus-within:shadow-accent-glow transition-all duration-300">
          <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={`Search with ${searchEngine.charAt(0).toUpperCase() + searchEngine.slice(1)} or enter URL...`}
            className="flex-1 bg-transparent text-base text-text-primary placeholder-text-muted outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors"
          >
            Go
          </button>
        </div>
      </form>

      {/* Tip Banner */}
      {showTip && (
        <div className="w-full max-w-xl mb-6 animate-fade-in">
          <div className="flex items-start gap-3 px-4 py-3 bg-accent/10 border border-accent/30 rounded-xl">
            <CloudLightning className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-text-primary font-medium">Set up the Cloudflare Worker proxy for full access!</p>
              <p className="text-xs text-text-secondary mt-1">
                Go to ⚙️ Settings → set Proxy Mode to "Cloudflare Worker" and paste your worker URL. Check the README for a step-by-step guide.
              </p>
            </div>
            <button
              onClick={() => setShowTip(false)}
              className="text-text-muted hover:text-text-primary text-xs flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="w-full max-w-2xl mb-8">
        <h2 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          Quick Links
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.url}
              onClick={() => onNavigate(link.url)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface border border-border hover:border-accent hover:bg-surface-light transition-all duration-200 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className="text-xs text-text-secondary group-hover:text-text-primary truncate w-full text-center">
                {link.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <div className="w-full max-w-2xl">
          <h2 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-success" />
            Your Bookmarks
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {bookmarks.slice(0, 8).map((bm) => (
              <button
                key={bm.id}
                onClick={() => onNavigate(bm.url)}
                className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border hover:border-accent hover:bg-surface-light transition-all duration-200 group"
              >
                <img
                  src={getFaviconUrl(bm.url)}
                  alt=""
                  className="w-4 h-4 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-xs text-text-secondary group-hover:text-text-primary truncate">
                  {bm.title}
                </span>
                <ExternalLink className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 ml-auto flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shortcuts Help */}
      <div className="w-full max-w-2xl mt-8">
        <div className="flex items-center gap-3 px-4 py-3 bg-surface rounded-xl border border-border">
          <Info className="w-4 h-4 text-text-muted flex-shrink-0" />
          <div className="flex gap-4 text-xs text-text-muted flex-wrap">
            <span>
              <kbd className="px-1.5 py-0.5 bg-surface-lighter rounded text-text-secondary">Ctrl+`</kbd> Panic
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-surface-lighter rounded text-text-secondary">Ctrl+T</kbd> New Tab
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-surface-lighter rounded text-text-secondary">⚙️ Settings</kbd> Set up proxy
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-xs text-text-muted">
          Nova Browser • Deploy on{' '}
          <span className="text-accent">Cloudflare Pages</span> +{' '}
          <span className="text-accent">GitHub</span>
        </p>
      </div>
    </div>
  );
};
