import { useState, useEffect, useCallback, useRef } from 'react';
import { TabBar } from './components/TabBar';
import { AddressBar } from './components/AddressBar';
import { NewTabPage } from './components/NewTabPage';
import { SettingsPanel } from './components/SettingsPanel';
import { BookmarksPanel } from './components/BookmarksPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { Tab, Bookmark, HistoryEntry, Settings } from './types';
import { processInput, extractDomain, buildProxyUrl } from './utils/proxy';
import {
  loadBookmarks,
  saveBookmarks,
  loadHistory,
  saveHistory,
  loadSettings,
  saveSettings,
} from './utils/storage';

const createNewTab = (): Tab => ({
  id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36),
  title: 'New Tab',
  url: 'nova://newtab',
  isLoading: false,
});

type PanelType = 'settings' | 'bookmarks' | 'history' | null;

function App() {
  const [tabs, setTabs] = useState<Tab[]>([createNewTab()]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks());
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory());
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [openPanel, setOpenPanel] = useState<PanelType>(null);
  const [navHistory, setNavHistory] = useState<Record<string, { back: string[]; forward: string[] }>>({});

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Tab cloak effect
  useEffect(() => {
    if (settings.cloakEnabled && settings.cloakTitle) {
      document.title = settings.cloakTitle;
      if (settings.cloakIcon) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = settings.cloakIcon;
      }
    } else {
      document.title = 'Nova Browser';
    }
  }, [settings.cloakEnabled, settings.cloakTitle, settings.cloakIcon]);

  // Save data
  useEffect(() => { saveBookmarks(bookmarks); }, [bookmarks]);
  useEffect(() => { saveHistory(history); }, [history]);
  useEffect(() => { saveSettings(settings); }, [settings]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        window.location.href = 'https://classroom.google.com';
      }
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        handleNewTab();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, ...updates } : t)));
  }, []);

  const navigate = useCallback(
    (input: string) => {
      const processedUrl = processInput(input, settings);
      if (!processedUrl) return;

      setNavHistory((prev) => {
        const tabHistory = prev[activeTabId] || { back: [], forward: [] };
        const currentUrl = activeTab.url;
        if (currentUrl && currentUrl !== 'nova://newtab') {
          return {
            ...prev,
            [activeTabId]: {
              back: [...tabHistory.back, currentUrl],
              forward: [],
            },
          };
        }
        return prev;
      });

      const title = extractDomain(processedUrl);
      updateTab(activeTabId, {
        url: processedUrl,
        title: title,
        isLoading: true,
      });

      const entry: HistoryEntry = {
        id: Date.now().toString(),
        title: title,
        url: processedUrl,
        timestamp: Date.now(),
      };
      setHistory((prev) => [entry, ...prev].slice(0, 200));
    },
    [activeTabId, activeTab, settings, updateTab]
  );

  const handleBack = useCallback(() => {
    const tabHistory = navHistory[activeTabId];
    if (!tabHistory || tabHistory.back.length === 0) return;

    const prevUrl = tabHistory.back[tabHistory.back.length - 1];
    setNavHistory((prev) => ({
      ...prev,
      [activeTabId]: {
        back: tabHistory.back.slice(0, -1),
        forward: [activeTab.url, ...tabHistory.forward],
      },
    }));

    updateTab(activeTabId, {
      url: prevUrl,
      title: extractDomain(prevUrl),
      isLoading: true,
    });
  }, [activeTabId, activeTab, navHistory, updateTab]);

  const handleForward = useCallback(() => {
    const tabHistory = navHistory[activeTabId];
    if (!tabHistory || tabHistory.forward.length === 0) return;

    const nextUrl = tabHistory.forward[0];
    setNavHistory((prev) => ({
      ...prev,
      [activeTabId]: {
        back: [...tabHistory.back, activeTab.url],
        forward: tabHistory.forward.slice(1),
      },
    }));

    updateTab(activeTabId, {
      url: nextUrl,
      title: extractDomain(nextUrl),
      isLoading: true,
    });
  }, [activeTabId, activeTab, navHistory, updateTab]);

  const handleRefresh = useCallback(() => {
    if (activeTab.url && activeTab.url !== 'nova://newtab') {
      updateTab(activeTabId, { isLoading: true });
      if (iframeRef.current) {
        const src = iframeRef.current.src;
        iframeRef.current.src = '';
        setTimeout(() => {
          if (iframeRef.current) iframeRef.current.src = src;
        }, 50);
      }
    }
  }, [activeTab, activeTabId, updateTab]);

  const handleHome = useCallback(() => {
    updateTab(activeTabId, { url: 'nova://newtab', title: 'New Tab', isLoading: false });
  }, [activeTabId, updateTab]);

  const handleNewTab = useCallback(() => {
    const newTab = createNewTab();
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const handleCloseTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        if (prev.length <= 1) return prev;
        const newTabs = prev.filter((t) => t.id !== tabId);
        if (tabId === activeTabId) {
          const idx = prev.findIndex((t) => t.id === tabId);
          const newActive = newTabs[Math.min(idx, newTabs.length - 1)];
          setActiveTabId(newActive.id);
        }
        return newTabs;
      });
    },
    [activeTabId]
  );

  const handleBookmark = useCallback(() => {
    if (activeTab.url === 'nova://newtab') return;

    const exists = bookmarks.find((b) => b.url === activeTab.url);
    if (exists) {
      setBookmarks((prev) => prev.filter((b) => b.id !== exists.id));
    } else {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        title: activeTab.title || extractDomain(activeTab.url),
        url: activeTab.url,
      };
      setBookmarks((prev) => [...prev, newBookmark]);
    }
  }, [activeTab, bookmarks]);

  const handleTogglePanel = useCallback((panel: PanelType) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  }, []);

  const isBookmarked = bookmarks.some((b) => b.url === activeTab.url);
  const tabNavHistory = navHistory[activeTabId] || { back: [], forward: [] };
  const canGoBack = tabNavHistory.back.length > 0;
  const canGoForward = tabNavHistory.forward.length > 0;

  const isNewTab = activeTab.url === 'nova://newtab';
  const iframeSrc = isNewTab ? '' : buildProxyUrl(activeTab.url, settings);

  const proxyLabel = (() => {
    switch (settings.proxyService) {
      case 'worker': return 'Cloudflare Worker';
      case 'alloy': return 'AllOrigins';
      case 'corrosion': return 'CodeTabs';
      default: return 'Direct';
    }
  })();

  return (
    <div className="flex flex-col h-full bg-surface-dark">
      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
      />

      {/* Address Bar */}
      <AddressBar
        url={activeTab.url}
        isLoading={activeTab.isLoading}
        onNavigate={navigate}
        onBack={handleBack}
        onForward={handleForward}
        onRefresh={handleRefresh}
        onHome={handleHome}
        onBookmark={handleBookmark}
        onTogglePanel={handleTogglePanel}
        isBookmarked={isBookmarked}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
      />

      {/* Loading bar */}
      {activeTab.isLoading && (
        <div className="h-0.5 bg-surface-dark overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-light rounded-r-full"
            style={{
              width: '70%',
              animation: 'loading 1.5s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {isNewTab ? (
          <NewTabPage
            bookmarks={bookmarks}
            onNavigate={navigate}
            searchEngine={settings.searchEngine}
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            className="w-full h-full"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
            onLoad={() => updateTab(activeTabId, { isLoading: false })}
            onError={() => updateTab(activeTabId, { isLoading: false })}
            title={activeTab.title}
          />
        )}

        {/* Side Panels */}
        {openPanel === 'settings' && (
          <SettingsPanel
            settings={settings}
            onUpdateSettings={setSettings}
            onClose={() => setOpenPanel(null)}
          />
        )}
        {openPanel === 'bookmarks' && (
          <BookmarksPanel
            bookmarks={bookmarks}
            onNavigate={navigate}
            onRemove={(id) => setBookmarks((prev) => prev.filter((b) => b.id !== id))}
            onClose={() => setOpenPanel(null)}
          />
        )}
        {openPanel === 'history' && (
          <HistoryPanel
            history={history}
            onNavigate={navigate}
            onClearHistory={() => setHistory([])}
            onClose={() => setOpenPanel(null)}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-surface-dark border-t border-border text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${activeTab.isLoading ? 'bg-warning animate-pulse' : 'bg-success'}`} />
          <span>{activeTab.isLoading ? 'Loading...' : 'Ready'}</span>
          {!isNewTab && (
            <span className="text-text-muted truncate max-w-[300px]">
              — {activeTab.url}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1 ${settings.proxyService === 'worker' ? 'text-success' : ''}`}>
            {settings.proxyService === 'worker' ? '☁️' : '🌐'} {proxyLabel}
          </span>
          {settings.cloakEnabled && <span className="text-accent">🛡️ Cloaked</span>}
          <span>{tabs.length} tab{tabs.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
