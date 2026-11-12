import {
  loadSettings,
  resolveThemeMode,
  saveSettings,
  STORAGE_KEY,
  type ThemeMode,
  type WikiCraftSettings,
} from '../../utils/settings';

function t(key: string, fallback: string): string {
  try {
    if (typeof chrome !== 'undefined' && chrome.i18n?.getMessage) {
      const msg = chrome.i18n.getMessage(key);
      if (msg) return msg;
    }
  } catch {
    // Fallback below
  }
  return fallback;
}

function applyLocalization(): void {
  const map: Array<[string, string, string]> = [
    ['i18n-subtitle', 'popupSubtitle', 'Modern reading theme for Wikipedia'],
    ['i18n-enable-label', 'enableTheme', 'Enable Theme'],
    ['i18n-enable-hint', 'enableThemeHint', 'Apply WikiCraft styling on Wikipedia'],
    ['i18n-appearance-label', 'appearanceLabel', 'Appearance'],
    ['i18n-mode-light', 'modeLight', 'Light'],
    ['i18n-mode-dark', 'modeDark', 'Dark'],
    ['i18n-mode-system', 'modeSystem', 'System'],
    ['i18n-open-wiki', 'openWikipedia', 'Open Wikipedia ↗'],
  ];

  for (const [id, key, fallback] of map) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = t(key, fallback);
    }
  }
}

async function initPopup(): Promise<void> {
  applyLocalization();

  const enableToggle = document.getElementById('enable-toggle') as HTMLInputElement;
  const statusBadge = document.getElementById('status-badge') as HTMLElement;
  const themeSection = document.getElementById('theme-section') as HTMLElement;
  const segmentButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.segment-btn')
  );

  let currentSettings = await loadSettings();

  function render(settings: WikiCraftSettings): void {
    currentSettings = settings;

    const resolvedTheme = resolveThemeMode(settings.themeMode);
    document.documentElement.setAttribute('data-popup-theme', resolvedTheme);

    enableToggle.checked = settings.enabled;
    statusBadge.textContent = settings.enabled
      ? t('statusActive', 'Active')
      : t('statusPaused', 'Paused');
    statusBadge.classList.toggle('is-paused', !settings.enabled);
    themeSection.classList.toggle('is-disabled', !settings.enabled);

    segmentButtons.forEach((btn) => {
      const isSelected = btn.dataset.mode === settings.themeMode;
      btn.classList.toggle('is-active', isSelected);
      btn.setAttribute('aria-checked', String(isSelected));
    });
  }

  render(currentSettings);

  enableToggle.addEventListener('change', async () => {
    const updated = await saveSettings({ enabled: enableToggle.checked });
    render(updated);
  });

  segmentButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const mode = btn.dataset.mode as ThemeMode | undefined;
      if (!mode) return;
      const updated = await saveSettings({ enabled: true, themeMode: mode });
      render(updated);
    });
  });

  if (typeof window.matchMedia === 'function') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (currentSettings.themeMode === 'system') {
        render(currentSettings);
      }
    });
  }

  if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes[STORAGE_KEY]?.newValue) {
        render(changes[STORAGE_KEY].newValue as WikiCraftSettings);
      }
    });
  }
}

initPopup();
