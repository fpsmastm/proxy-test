import React from 'react';
import { X, Plus, Globe } from 'lucide-react';
import { Tab } from '../types';
import { getFaviconUrl, extractDomain } from '../utils/proxy';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}) => {
  return (
    <div className="flex items-center bg-surface-dark border-b border-border h-9 select-none overflow-x-auto">
      <div className="flex items-center flex-1 min-w-0">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`
              group flex items-center gap-1.5 px-3 h-9 min-w-[120px] max-w-[200px] cursor-pointer
              border-r border-border transition-colors duration-150
              ${tab.id === activeTabId
                ? 'bg-surface text-text-primary'
                : 'bg-surface-dark text-text-secondary hover:bg-surface-light'
              }
            `}
          >
            {tab.isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : tab.url && tab.url !== 'nova://newtab' ? (
              <img
                src={getFaviconUrl(tab.url)}
                alt=""
                className="w-3.5 h-3.5 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-3.5 h-3.5 flex-shrink-0 text-accent" />
            )}
            <span className="flex-1 text-xs truncate">
              {tab.title || extractDomain(tab.url) || 'New Tab'}
            </span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-surface-lighter rounded p-0.5 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onNewTab}
        className="flex items-center justify-center w-8 h-8 mx-1 rounded hover:bg-surface-light transition-colors"
        title="New Tab"
      >
        <Plus className="w-4 h-4 text-text-secondary" />
      </button>
    </div>
  );
};
