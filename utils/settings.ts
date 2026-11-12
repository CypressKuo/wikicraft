export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface WikiCraftSettings {
  enabled: boolean;
  themeMode: ThemeMode;
}

export const DEFAULT_SETTINGS: WikiCraftSettings = {
  enabled: true,
  themeMode: 'system',
};

export const STORAGE_KEY = 'wikicraft_settings';
export const LOCAL_CACHE_KEY = 'wikicraft_local_cache_v1';

/**
 * Resolve 'system' | 'light' | 'dark' into actual 'light' | 'dark'
 */
export function resolveThemeMode(mode: ThemeMode): ResolvedTheme {
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Synchronously read cached settings from localStorage (used at document_start to prevent FOUC)
 */
export function getSyncCachedSettings(): WikiCraftSettings {
  try {
    const raw = window.localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<WikiCraftSettings>;
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_SETTINGS.enabled,
      themeMode:
        parsed.themeMode === 'light' || parsed.themeMode === 'dark' || parsed.themeMode === 'system'
          ? parsed.themeMode
          : DEFAULT_SETTINGS.themeMode,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Synchronously write cached settings to localStorage
 */
export function setSyncCachedSettings(settings: WikiCraftSettings): void {
  try {
    window.localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota / private mode restrictions
  }
}

/**
 * Load settings from chrome.storage.sync (with fallback to chrome.storage.local and DEFAULT_SETTINGS)
 */
export async function loadSettings(): Promise<WikiCraftSettings> {
  try {
    const storageArea = chrome?.storage?.sync ?? chrome?.storage?.local;
    if (!storageArea) {
      return DEFAULT_SETTINGS;
    }
    const result = await storageArea.get(STORAGE_KEY);
    const saved = result?.[STORAGE_KEY] as Partial<WikiCraftSettings> | undefined;
    if (!saved) {
      return DEFAULT_SETTINGS;
    }
    return {
      enabled: typeof saved.enabled === 'boolean' ? saved.enabled : DEFAULT_SETTINGS.enabled,
      themeMode:
        saved.themeMode === 'light' || saved.themeMode === 'dark' || saved.themeMode === 'system'
          ? saved.themeMode
          : DEFAULT_SETTINGS.themeMode,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save partial or full settings to chrome.storage.sync
 */
export async function saveSettings(partial: Partial<WikiCraftSettings>): Promise<WikiCraftSettings> {
  const current = await loadSettings();
  const next: WikiCraftSettings = {
    ...current,
    ...partial,
  };
  try {
    const storageArea = chrome?.storage?.sync ?? chrome?.storage?.local;
    if (storageArea) {
      await storageArea.set({ [STORAGE_KEY]: next });
    }
  } catch {
    // Fallback if sync fails
  }
  return next;
}

/**
 * Cycle through Light -> Dark -> System (or if currently resolved to light, switch to dark, etc.)
 */
export function getNextThemeMode(current: ThemeMode): ThemeMode {
  const order: ThemeMode[] = ['light', 'dark', 'system'];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}
