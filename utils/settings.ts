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

/**
 * Safely read a key from a chrome.storage area with a timeout guard so it never hangs.
 */
function storageGet(area: chrome.storage.StorageArea | undefined, key: string): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    if (!area) {
      resolve({});
      return;
    }
    let settled = false;
    const finish = (res: Record<string, unknown>) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(res);
      }
    };
    const timer = setTimeout(() => finish({}), 800);

    try {
      const maybePromise = (area.get as unknown as (
        k: string,
        cb: (res: Record<string, unknown>) => void
      ) => Promise<Record<string, unknown>> | void)(key, (res) => {
        finish(res || {});
      });
      if (maybePromise && typeof (maybePromise as Promise<Record<string, unknown>>).then === 'function') {
        (maybePromise as Promise<Record<string, unknown>>)
          .then((res) => finish(res || {}))
          .catch(() => finish({}));
      }
    } catch {
      finish({});
    }
  });
}

/**
 * Safely write items to a chrome.storage area with a timeout guard so it never hangs.
 */
function storageSet(area: chrome.storage.StorageArea | undefined, items: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    if (!area) {
      resolve();
      return;
    }
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve();
      }
    };
    const timer = setTimeout(finish, 800);

    try {
      const maybePromise = (area.set as unknown as (
        it: Record<string, unknown>,
        cb: () => void
      ) => Promise<void> | void)(items, () => {
        finish();
      });
      if (maybePromise && typeof (maybePromise as Promise<void>).then === 'function') {
        (maybePromise as Promise<void>).then(finish).catch(finish);
      }
    } catch {
      finish();
    }
  });
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
 * Load settings from chrome.storage.local (primary for reliability) with fallback to sync
 */
export async function loadSettings(): Promise<WikiCraftSettings> {
  try {
    const localRes = await storageGet(chrome?.storage?.local, STORAGE_KEY);
    if (localRes?.[STORAGE_KEY]) {
      return normalizeSettings(localRes[STORAGE_KEY] as Partial<WikiCraftSettings>);
    }
    const syncRes = await storageGet(chrome?.storage?.sync, STORAGE_KEY);
    if (syncRes?.[STORAGE_KEY]) {
      return normalizeSettings(syncRes[STORAGE_KEY] as Partial<WikiCraftSettings>);
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save partial or full settings to chrome.storage.local and mirror to chrome.storage.sync in background
 */
export async function saveSettings(partial: Partial<WikiCraftSettings>): Promise<WikiCraftSettings> {
  const current = await loadSettings();
  const next: WikiCraftSettings = {
    ...current,
    ...partial,
  };
  await storageSet(chrome?.storage?.local, { [STORAGE_KEY]: next });
  void storageSet(chrome?.storage?.sync, { [STORAGE_KEY]: next });
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
