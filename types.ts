export interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading: boolean;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

export interface HistoryEntry {
  id: string;
  title: string;
  url: string;
  timestamp: number;
}

export type ProxyService = 'direct' | 'alloy' | 'corrosion' | 'worker';

export interface Settings {
  proxyService: ProxyService;
  customProxyUrl: string;
  cloakTitle: string;
  cloakIcon: string;
  cloakEnabled: boolean;
  searchEngine: 'google' | 'bing' | 'duckduckgo' | 'brave';
  aboutBlankCloak: boolean;
}
