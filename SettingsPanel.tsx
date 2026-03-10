import React from 'react';
import { X, Shield, Globe, Eye, Search, AlertTriangle, Rocket } from 'lucide-react';
import { Settings } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const update = (partial: Partial<Settings>) => {
    onUpdateSettings({ ...settings, ...partial });
  };

  const handleAboutBlankLaunch = () => {
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${settings.cloakTitle || 'Google Classroom'}</title>
          ${settings.cloakIcon ? `<link rel="icon" href="${settings.cloakIcon}">` : ''}
          <style>body{margin:0;overflow:hidden}iframe{width:100vw;height:100vh;border:none}</style>
        </head>
        <body>
          <iframe src="${window.location.href}" allowfullscreen></iframe>
        </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="absolute right-0 top-0 w-80 h-full bg-surface border-l border-border z-50 flex flex-col animate-slide-down overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          Settings
        </h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-surface-lighter transition-colors">
          <X className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Search Engine */}
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Search className="w-3.5 h-3.5" />
            Search Engine
          </label>
          <select
            value={settings.searchEngine}
            onChange={(e) => update({ searchEngine: e.target.value as Settings['searchEngine'] })}
            className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-sm text-text-primary outline-none focus:border-accent"
          >
            <option value="google">Google</option>
            <option value="duckduckgo">DuckDuckGo</option>
            <option value="bing">Bing</option>
            <option value="brave">Brave Search</option>
          </select>
        </div>

        {/* Proxy Mode */}
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Globe className="w-3.5 h-3.5" />
            Proxy Mode
          </label>
          <select
            value={settings.proxyService}
            onChange={(e) => update({ proxyService: e.target.value as Settings['proxyService'] })}
            className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-sm text-text-primary outline-none focus:border-accent"
          >
            <option value="direct">Direct (No Proxy)</option>
            <option value="alloy">AllOrigins Proxy</option>
            <option value="corrosion">CodeTabs Proxy</option>
            <option value="worker">☁️ Cloudflare Worker (Best)</option>
          </select>
          <p className="text-xs text-text-muted mt-1.5">
            {settings.proxyService === 'direct' && 'Loads sites directly. Many sites will block iframe loading.'}
            {settings.proxyService === 'alloy' && 'Routes through AllOrigins. Good for basic pages.'}
            {settings.proxyService === 'corrosion' && 'Routes through CodeTabs. Alternative free proxy.'}
            {settings.proxyService === 'worker' && '⭐ Best option! Set your Cloudflare Worker URL below.'}
          </p>
        </div>

        {/* Custom Proxy URL */}
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
            {settings.proxyService === 'worker' ? '☁️ Cloudflare Worker URL' : 'Custom Proxy URL'}
          </label>
          <input
            type="text"
            value={settings.customProxyUrl}
            onChange={(e) => update({ customProxyUrl: e.target.value })}
            placeholder="https://your-worker.workers.dev/?url={url}"
            className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent"
          />
          <p className="text-xs text-text-muted mt-1.5">
            Use <code className="text-accent">{'{url}'}</code> as placeholder. See the README for setup instructions!
          </p>
        </div>

        {/* Tab Cloak */}
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Eye className="w-3.5 h-3.5" />
            Tab Cloak
          </label>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => update({ cloakEnabled: !settings.cloakEnabled })}
              className={`
                relative w-10 h-5 rounded-full transition-colors
                ${settings.cloakEnabled ? 'bg-accent' : 'bg-surface-lighter'}
              `}
            >
              <div
                className={`
                  absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform
                  ${settings.cloakEnabled ? 'translate-x-5' : 'translate-x-0.5'}
                `}
              />
            </button>
            <span className="text-sm text-text-secondary">
              {settings.cloakEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          {settings.cloakEnabled && (
            <div className="space-y-2 animate-fade-in">
              <input
                type="text"
                value={settings.cloakTitle}
                onChange={(e) => update({ cloakTitle: e.target.value })}
                placeholder="Tab title (e.g., Google Classroom)"
                className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent"
              />
              <input
                type="text"
                value={settings.cloakIcon}
                onChange={(e) => update({ cloakIcon: e.target.value })}
                placeholder="Favicon URL"
                className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent"
              />
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { name: 'Classroom', title: 'Google Classroom', icon: 'https://ssl.gstatic.com/classroom/favicon.png' },
                  { name: 'Drive', title: 'My Drive - Google Drive', icon: 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png' },
                  { name: 'Docs', title: 'Google Docs', icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico' },
                  { name: 'Canvas', title: 'Dashboard', icon: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico' },
                  { name: 'Khan', title: 'Khan Academy', icon: 'https://cdn.kastatic.org/images/favicon.ico' },
                  { name: 'Clever', title: 'Clever | Portal', icon: 'https://apps.clever.com/favicon.ico' },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => update({ cloakTitle: preset.title, cloakIcon: preset.icon })}
                    className="px-2 py-1 text-xs bg-surface-lighter border border-border rounded hover:border-accent transition-colors text-text-secondary"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* About:blank Launch */}
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Rocket className="w-3.5 h-3.5" />
            about:blank Cloak
          </label>
          <button
            onClick={handleAboutBlankLaunch}
            className="w-full px-3 py-2.5 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Rocket className="w-4 h-4" />
            Launch in about:blank
          </button>
          <p className="text-xs text-text-muted mt-1.5">
            Opens Nova in a new tab with <code className="text-accent">about:blank</code> as the URL. This makes it invisible to browser history and most monitoring extensions!
          </p>
        </div>

        {/* Panic Key Info */}
        <div className="p-3 bg-surface-light border border-border rounded-lg">
          <h3 className="text-xs font-semibold text-warning mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Keyboard Shortcuts
          </h3>
          <div className="space-y-1 text-xs text-text-muted">
            <p><kbd className="px-1 py-0.5 bg-surface-lighter rounded text-text-secondary">Ctrl + `</kbd> — 🚨 Panic key (goes to Classroom)</p>
            <p><kbd className="px-1 py-0.5 bg-surface-lighter rounded text-text-secondary">Ctrl + T</kbd> — New tab</p>
            <p><kbd className="px-1 py-0.5 bg-surface-lighter rounded text-text-secondary">Ctrl + E</kbd> — Focus address bar</p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg">
          <h3 className="text-xs font-semibold text-danger mb-2">⚠️ Clear All Data</h3>
          <button
            onClick={() => {
              if (confirm('Clear all Nova Browser data? (Bookmarks, history, settings)')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="px-3 py-1.5 bg-danger/20 hover:bg-danger/30 text-danger text-xs font-medium rounded-lg transition-colors border border-danger/30"
          >
            Reset Everything
          </button>
        </div>
      </div>
    </div>
  );
};
