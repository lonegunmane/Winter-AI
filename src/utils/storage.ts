import { AppSettings, ChatMessage, Conversation, DEFAULT_SYSTEM_PROMPT, UserMemoryItem } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'winter_conversations_v2',
  ACTIVE_CONVO_ID: 'winter_active_convo_id_v2',
  SETTINGS: 'winter_settings_v2',
  MEMORY: 'winter_user_memory_v2',
  SCRATCHPAD: 'winter_scratchpad_v2',
  // Legacy key for migration
  LEGACY_MESSAGES: 'winter_chat_messages_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  model: 'gemini-3.8-flash',
  temperature: 0.7,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  theme: 'dark',
  fontSize: 'normal',
  reducedMotion: false,
  enableMemoryInjection: true,
  offlineEngine: 'smart-local',
  forceOfflineMode: false,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // Check if legacy messages exist to migrate
    const legacyRaw = localStorage.getItem(STORAGE_KEYS.LEGACY_MESSAGES);
    if (legacyRaw) {
      const legacyMsgs: ChatMessage[] = JSON.parse(legacyRaw);
      if (Array.isArray(legacyMsgs) && legacyMsgs.length > 0) {
        const migrated: Conversation = {
          id: 'convo_initial',
          title: 'Initial Session',
          createdAt: legacyMsgs[0]?.timestamp || Date.now(),
          updatedAt: Date.now(),
          messages: legacyMsgs,
        };
        saveConversations([migrated]);
        return [migrated];
      }
    }

    // Default new conversation
    const initial: Conversation = {
      id: `convo_${Date.now()}`,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    return [initial];
  } catch (e) {
    console.error('Failed to load conversations:', e);
    return [
      {
        id: `convo_${Date.now()}`,
        title: 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      },
    ];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    // Keep max 40 conversations to prevent storage overflow on low-spec phones
    const trimmed = conversations.slice(0, 40).map((c) => ({
      ...c,
      messages: c.messages.slice(-80), // keep max 80 messages per chat
    }));
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save conversations:', e);
  }
}

export function loadActiveConvoId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVO_ID);
}

export function saveActiveConvoId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVO_ID, id);
}

export function loadUserMemory(): UserMemoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMORY);
    if (!raw) {
      // Seed initial helpful facts
      return [
        {
          id: 'mem_1',
          category: 'preference',
          content: 'User prefers concise, clear, and calm explanations without unnecessary pleasantries.',
          createdAt: Date.now(),
        },
      ];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserMemory(memory: UserMemoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMORY, JSON.stringify(memory));
  } catch (e) {
    console.error('Failed to save memory:', e);
  }
}

export function loadScratchpad(): string {
  return localStorage.getItem(STORAGE_KEYS.SCRATCHPAD) || '';
}

export function saveScratchpad(text: string): void {
  localStorage.setItem(STORAGE_KEYS.SCRATCHPAD, text);
}

export function getStorageUsage(): { usedKb: number; formatted: string } {
  try {
    let totalLength = 0;
    for (const key of Object.values(STORAGE_KEYS)) {
      const item = localStorage.getItem(key);
      if (item) totalLength += item.length;
    }
    const kb = Math.round((totalLength * 2) / 1024);
    return {
      usedKb: kb,
      formatted: kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`,
    };
  } catch {
    return { usedKb: 0, formatted: '0 KB' };
  }
}

export function exportConversation(conversation: Conversation, format: 'json' | 'markdown'): void {
  let content = '';
  const dateStr = new Date(conversation.createdAt).toISOString().slice(0, 10);
  let filename = `winter-${conversation.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'chat'}-${dateStr}`;
  let mimeType = 'text/plain';

  if (format === 'json') {
    content = JSON.stringify(conversation, null, 2);
    filename += '.json';
    mimeType = 'application/json';
  } else {
    filename += '.md';
    mimeType = 'text/markdown';
    content = `# ${conversation.title}\n*Exported from Winter on ${new Date().toLocaleString()}*\n\n---\n\n`;
    conversation.messages.forEach((m) => {
      const sender = m.role === 'user' ? '👤 User' : '❄️ Winter';
      const time = new Date(m.timestamp).toLocaleTimeString();
      content += `### ${sender} (${time})\n\n${m.content}\n\n---\n\n`;
    });
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function clearMessages(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_MESSAGES);
  } catch (e) {
    console.error('Failed to clear messages:', e);
  }
}

export function exportChatHistory(messages: ChatMessage[], format: 'json' | 'markdown'): void {
  const dummyConvo: Conversation = {
    id: 'export',
    title: 'Winter Chat History',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages,
  };
  exportConversation(dummyConvo, format);
}
