import { AppSettings, Conversation, DEFAULT_SYSTEM_PROMPT, UserMemoryItem } from '../types';

const DB_NAME = 'WinterDatabase';
const DB_VERSION = 1;

const STORES = {
  CONVERSATIONS: 'conversations',
  SETTINGS: 'settings',
  MEMORY: 'memory',
  SCRATCHPAD: 'scratchpad',
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.CONVERSATIONS)) {
        db.createObjectStore(STORES.CONVERSATIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.MEMORY)) {
        db.createObjectStore(STORES.MEMORY, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.SCRATCHPAD)) {
        db.createObjectStore(STORES.SCRATCHPAD, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback to localStorage if IndexedDB errors
const LS_KEYS = {
  CONVERSATIONS: 'winter_conversations_v3',
  SETTINGS: 'winter_settings_v3',
  MEMORY: 'winter_memory_v3',
  SCRATCHPAD: 'winter_scratchpad_v3',
};

export async function idbSaveConversations(conversations: Conversation[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.CONVERSATIONS, 'readwrite');
    const store = tx.objectStore(STORES.CONVERSATIONS);
    store.clear();
    for (const c of conversations) {
      store.put(c);
    }
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch (err) {
    console.warn('IDB save conversations failed, falling back to localStorage:', err);
  }
  try {
    localStorage.setItem(LS_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  } catch {
    // Ignore quota errors
  }
}

export async function idbLoadConversations(): Promise<Conversation[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.CONVERSATIONS, 'readonly');
    const store = tx.objectStore(STORES.CONVERSATIONS);
    const request = store.getAll();

    const data: Conversation[] = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    if (data && data.length > 0) {
      return data.sort((a, b) => b.updatedAt - a.updatedAt);
    }
  } catch (err) {
    console.warn('IDB load conversations failed, using localStorage:', err);
  }

  // LocalStorage fallback
  try {
    const raw = localStorage.getItem(LS_KEYS.CONVERSATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore
  }

  // Default initial conversation
  const initial: Conversation = {
    id: `convo_${Date.now()}`,
    title: 'New Conversation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
  return [initial];
}

export async function idbSaveSettings(settings: AppSettings): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.SETTINGS, 'readwrite');
    const store = tx.objectStore(STORES.SETTINGS);
    store.put({ id: 'current', ...settings });
  } catch (err) {
    console.warn('IDB save settings failed:', err);
  }
  try {
    localStorage.setItem(LS_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}

export async function idbLoadSettings(): Promise<AppSettings> {
  const defaultSettings: AppSettings = {
    apiKey: '',
    model: 'gemini-2.0-flash',
    temperature: 0.7,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    theme: 'dark',
    fontSize: 'normal',
    reducedMotion: false,
    enableMemoryInjection: true,
    offlineEngine: 'smart-local',
    forceOfflineMode: false,
  };

  try {
    const db = await openDB();
    const tx = db.transaction(STORES.SETTINGS, 'readonly');
    const store = tx.objectStore(STORES.SETTINGS);
    const request = store.get('current');
    const result = await new Promise<AppSettings | null>((resolve) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
    if (result) return { ...defaultSettings, ...result };
  } catch {
    // Ignore
  }

  try {
    const raw = localStorage.getItem(LS_KEYS.SETTINGS);
    if (raw) {
      return { ...defaultSettings, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore
  }

  return defaultSettings;
}

export async function idbSaveMemory(memories: UserMemoryItem[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.MEMORY, 'readwrite');
    const store = tx.objectStore(STORES.MEMORY);
    store.clear();
    for (const m of memories) {
      store.put(m);
    }
  } catch (err) {
    console.warn('IDB save memory failed:', err);
  }
  try {
    localStorage.setItem(LS_KEYS.MEMORY, JSON.stringify(memories));
  } catch {
    // Ignore
  }
}

export async function idbLoadMemory(): Promise<UserMemoryItem[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.MEMORY, 'readonly');
    const store = tx.objectStore(STORES.MEMORY);
    const request = store.getAll();
    const data: UserMemoryItem[] = await new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
    if (data && data.length > 0) return data;
  } catch {
    // Fall through
  }

  try {
    const raw = localStorage.getItem(LS_KEYS.MEMORY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Fall through
  }

  return [
    {
      id: 'mem_1',
      category: 'preference',
      content: 'User prefers concise, intelligent, calm explanations without unnecessary fluff.',
      createdAt: Date.now(),
    },
  ];
}
