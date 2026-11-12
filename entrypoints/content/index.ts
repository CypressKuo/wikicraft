import './style.css';
import {
  DEFAULT_SETTINGS,
  getNextThemeMode,
  getSyncCachedSettings,
  loadSettings,
  resolveThemeMode,
  saveSettings,
  setSyncCachedSettings,
  STORAGE_KEY,
  type ThemeMode,
  type WikiCraftSettings,
} from '../../utils/settings';

const ICONS: Record<ThemeMode, string> = {
  light: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/></svg>`,
  dark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 14.8A8.5 8.5 0 0 1 9.2 3.6a8.5 8.5 0 1 0 11.2 11.2Z"/></svg>`,
  system: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>`,
};

function getModeLabel(mode: ThemeMode): string {
  try {
    if (typeof chrome !== 'undefined' && chrome.i18n?.getMessage) {
      const key =
        mode === 'light' ? 'modeLight' : mode === 'dark' ? 'modeDark' : 'modeSystem';
      const msg = chrome.i18n.getMessage(key);
      if (msg) return msg;
    }
  } catch {
    // Fallback below
  }
  const isZh = document.documentElement.lang?.toLowerCase().startsWith('zh');
  if (isZh) {
    return mode === 'light' ? '淺色' : mode === 'dark' ? '深色' : '系統';
  }
  return mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'System';
}

function getTooltipText(): string {
  try {
    if (typeof chrome !== 'undefined' && chrome.i18n?.getMessage) {
      const msg = chrome.i18n.getMessage('inPageToggleTooltip');
      if (msg) return msg;
    }
  } catch {
    // Fallback below
  }
  return 'WikiCraft Appearance (Light / Dark / System)';
}

/**
 * Determine if an element is an intentional color swatch or chart bar (e.g., climate chart bar,
 * sports kit box, metro line color badge, or marked with .notheme) that should keep its inline color.
 */
function shouldPreserveInlineColor(el: HTMLElement): boolean {
  if (el.classList.contains('notheme') || el.closest('.notheme')) {
    return true;
  }
  const text = (el.textContent || '').replace(/\u00a0/g, '').trim();
  if (text.length === 0 && el.children.length === 0) {
    return true;
  }
  const widthAttr = el.getAttribute('width') || el.style.width;
  if (widthAttr && /^(1?\d|20)(px)?$/.test(widthAttr.trim()) && text.length <= 2) {
    return true;
  }
  // Preserve absolute-positioned chart bars (e.g. Wikipedia climate chart columns)
  if (el.style.position === 'absolute' && text.length <= 3) {
    return true;
  }
  return false;
}

/**
 * Normalize hardcoded inline background and text colors inside Wikipedia infoboxes, tables, and navboxes
 * so they blend harmoniously into the Notion/Craft card aesthetic in both Light and Dark modes.
 */
function sanitizeInlineStyles(root: ParentNode = document): void {
  const containerSelector =
    '.infobox, .infobox_v2, .infobox_v3, .infobox-subbox, table.wikitable, .navbox, table.sidebar, .vertical-navbox, .ambox, .tmbox, .ombox, .cmbox, .fmbox, .hatnote';
  const candidates = root.querySelectorAll<HTMLElement>(
    `${containerSelector}, .infobox [style], .infobox_v2 [style], .infobox_v3 [style], .infobox-subbox [style], table.wikitable [style], .navbox [style], table.sidebar [style], .vertical-navbox [style], .ambox [style], .hatnote [style]`
  );

  candidates.forEach((el) => {
    if (el.dataset.wcChecked === 'true') return;
    el.dataset.wcChecked = 'true';

    const styleAttr = el.getAttribute('style');
    if (!styleAttr) return;

    if (shouldPreserveInlineColor(el)) return;

    const hasBg = /background(-color)?\s*:/i.test(styleAttr);
    const hasColor = /(^|;)\s*color\s*:/i.test(styleAttr);

    if (hasBg) {
      const tag = el.tagName.toLowerCase();
      const isHeader =
        tag === 'th' ||
        el.classList.contains('infobox-header') ||
        el.classList.contains('infobox-above') ||
        el.classList.contains('infobox-subheader') ||
        el.classList.contains('navbox-title') ||
        el.classList.contains('navbox-abovebelow') ||
        el.classList.contains('sidebar-heading') ||
        el.classList.contains('sidebar-title');

      el.dataset.wcBgSanitized = isHeader ? 'elevated' : 'surface';
    }

    if (hasColor) {
      el.dataset.wcTextSanitized = 'true';
    }
  });
}

export default defineContentScript({
  matches: ['*://*.wikipedia.org/*'],
  excludeMatches: ['*://*.m.wikipedia.org/*'],
  runAt: 'document_start',

  main() {
    let currentSettings: WikiCraftSettings = getSyncCachedSettings();
    let toggleBtn: HTMLButtonElement | null = null;

    function rememberOriginalWikiTheme(root: HTMLElement): void {
      if (root.dataset.wcOrigWikiTheme) return;
      if (root.classList.contains('skin-theme-clientpref-night')) {
        root.dataset.wcOrigWikiTheme = 'night';
      } else if (root.classList.contains('skin-theme-clientpref-os')) {
        root.dataset.wcOrigWikiTheme = 'os';
      } else {
        root.dataset.wcOrigWikiTheme = 'day';
      }
    }

    function syncWikiNativeThemeClasses(root: HTMLElement, resolved: 'light' | 'dark'): void {
      rememberOriginalWikiTheme(root);
      root.classList.remove(
        'skin-theme-clientpref-day',
        'skin-theme-clientpref-night',
        'skin-theme-clientpref-os'
      );
      root.classList.add(
        resolved === 'dark' ? 'skin-theme-clientpref-night' : 'skin-theme-clientpref-day'
      );
    }

    function restoreWikiNativeThemeClasses(root: HTMLElement): void {
      const orig = root.dataset.wcOrigWikiTheme;
      if (!orig) return;
      root.classList.remove(
        'skin-theme-clientpref-day',
        'skin-theme-clientpref-night',
        'skin-theme-clientpref-os'
      );
      root.classList.add(`skin-theme-clientpref-${orig}`);
    }

    function applyToDOM(settings: WikiCraftSettings): void {
      currentSettings = settings;
      setSyncCachedSettings(settings);

      const root = document.documentElement;
      if (settings.enabled) {
        const resolved = resolveThemeMode(settings.themeMode);
        root.setAttribute('data-wikicraft-enabled', 'true');
        root.setAttribute('data-wikicraft-theme', resolved);
        syncWikiNativeThemeClasses(root, resolved);
      } else {
        root.removeAttribute('data-wikicraft-enabled');
        root.removeAttribute('data-wikicraft-theme');
        restoreWikiNativeThemeClasses(root);
      }

      updateHeaderToggleUI();
    }

    function updateHeaderToggleUI(): void {
      if (!toggleBtn) return;
      const mode = currentSettings.themeMode;
      const label = getModeLabel(mode);
      toggleBtn.innerHTML = `${ICONS[mode]}<span>${label}</span>`;
      toggleBtn.title = getTooltipText();
      toggleBtn.setAttribute('aria-label', `${getTooltipText()}: ${label}`);
    }

    function injectHeaderToggle(): void {
      if (document.getElementById('wikicraft-header-toggle')) return;

      const headerEnd =
        document.querySelector('.vector-header-end .vector-user-links') ||
        document.querySelector('.vector-header-end') ||
        document.querySelector('#p-personal ul') ||
        document.querySelector('#p-personal');

      if (!headerEnd) return;

      const wrapper = document.createElement('div');
      wrapper.id = 'wikicraft-header-toggle';
      wrapper.className = 'wc-header-toggle-wrapper';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wc-header-toggle-btn';
      btn.addEventListener('click', async () => {
        const nextMode = currentSettings.enabled
          ? getNextThemeMode(currentSettings.themeMode)
          : currentSettings.themeMode;
        const nextSettings: WikiCraftSettings = {
          enabled: true,
          themeMode: nextMode,
        };
        applyToDOM(nextSettings);
        await saveSettings(nextSettings);
      });

      wrapper.appendChild(btn);
      headerEnd.prepend(wrapper);
      toggleBtn = btn;
      updateHeaderToggleUI();
    }

    // 1. Apply synchronously at document_start to guarantee zero FOUC
    applyToDOM(currentSettings);

    // 2. Reconcile with chrome.storage.sync asynchronously
    loadSettings()
      .then((saved) => {
        applyToDOM(saved);
      })
      .catch(() => {
        applyToDOM(DEFAULT_SETTINGS);
      });

    // 3. Listen to OS dark mode changes when in 'system' mode
    if (typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (currentSettings.enabled && currentSettings.themeMode === 'system') {
          applyToDOM(currentSettings);
        }
      });
    }

    // 4. Listen to changes triggered from the extension Popup or other Wikipedia tabs
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener((changes) => {
        if (changes[STORAGE_KEY]?.newValue) {
          const next = changes[STORAGE_KEY].newValue as WikiCraftSettings;
          applyToDOM(next);
        }
      });
    }

    // 5. Run DOM enhancements when DOM is ready
    const onDomReady = () => {
      if (currentSettings.enabled) {
        syncWikiNativeThemeClasses(
          document.documentElement,
          resolveThemeMode(currentSettings.themeMode)
        );
      }
      injectHeaderToggle();
      sanitizeInlineStyles(document);

      const contentEl = document.getElementById('mw-content-text');
      if (contentEl) {
        const observer = new MutationObserver((mutations) => {
          for (const m of mutations) {
            m.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement) {
                sanitizeInlineStyles(node);
              }
            });
          }
        });
        observer.observe(contentEl, { childList: true, subtree: true });
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onDomReady, { once: true });
    } else {
      onDomReady();
    }
  },
});
