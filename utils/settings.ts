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

function normalizeSettings(raw: Partial<WikiCraftSettings> | undefined): WikiCraftSettings {
  if (!raw) return DEFAULT_SETTINGS;
  return {
    enabled: typeof raw.enabled === 'boolean' ? raw.enabled : DEFAULT_SETTINGS.enabled,
    themeMode:
      raw.themeMode === 'light' || raw.themeMode === 'dark' || raw.themeMode === 'system'
        ? raw.themeMode
        : DEFAULT_SETTINGS.themeMode,
  };
}

function getStorageAreas(): chrome.storage.StorageArea[] {
  const areas: chrome.storage.StorageArea[] = [];
  const browserStorage = (globalThis as { browser?: { storage?: typeof chrome.storage } }).browser?.storage;
  const storage = browserStorage ?? (typeof chrome !== 'undefined' ? chrome.storage : undefined);
  if (!storage) return areas;

  if (storage.local) areas.push(storage.local);
  if (storage.sync) areas.push(storage.sync);
  return areas;
}

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
    return normalizeSettings(JSON.parse(raw) as Partial<WikiCraftSettings>);
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
 * Load settings from extension storage (local first, then sync)
 */
export async function loadSettings(): Promise<WikiCraftSettings> {
  const areas = getStorageAreas();
  for (const area of areas) {
    try {
      const result = await area.get(STORAGE_KEY);
      if (result?.[STORAGE_KEY]) {
        return normalizeSettings(result[STORAGE_KEY] as Partial<WikiCraftSettings>);
      }
    } catch {
      // Try next storage area
    }
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save partial or full settings to extension storage
 */
export async function saveSettings(partial: Partial<WikiCraftSettings>): Promise<WikiCraftSettings> {
  const current = await loadSettings();
  const next: WikiCraftSettings = {
    ...current,
    ...partial,
  };
  const areas = getStorageAreas();
  for (const area of areas) {
    try {
      await area.set({ [STORAGE_KEY]: next });
    } catch {
      // Ignore if a particular storage area (e.g. sync without iCloud) is unavailable
    }
  }
  return next;
}

/**
 * Cycle through Light -> Dark -> System
 */
export function getNextThemeMode(current: ThemeMode): ThemeMode {
  const order: ThemeMode[] = ['light', 'dark', 'system'];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}
