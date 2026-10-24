export type Role = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  model?: string;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface UserMemoryItem {
  id: string;
  category: 'preference' | 'fact' | 'note' | 'goal';
  content: string;
  createdAt: number;
}

export type SidebarTab =
  | 'chat'
  | 'history'
  | 'settings'
  | 'memory'
  | 'tools'
  | 'about';

export type ThemeMode = 'dark' | 'light' | 'system';
export type FontSize = 'compact' | 'normal' | 'relaxed';

export interface AppSettings {
  apiKey: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  theme: ThemeMode;
  fontSize: FontSize;
  reducedMotion: boolean;
  enableMemoryInjection: boolean; // Automatically inject user memory/notes into Winter's prompt
}

export interface ServerStatus {
  status: string;
  appName: string;
  hasServerKey: boolean;
  recommendedModel: string;
}

export interface NativeDeviceStatus {
  isCapacitor: boolean;
  platform: 'web' | 'android' | 'ios';
  batteryLevel?: number;
  isCharging?: boolean;
  networkType?: string;
  permissions: {
    notifications: 'granted' | 'denied' | 'prompt';
    microphone: 'granted' | 'denied' | 'prompt';
    storage: 'granted' | 'denied' | 'prompt';
  };
}

export const DEFAULT_SYSTEM_PROMPT = `You are Winter, a personal AI assistant.
You embody the quiet, crystalline elegance and calmness of winter.
- Tone: Calm, clear, intelligent, and subtly warm.
- Style: Speak naturally and helpfully without fluff, hollow enthusiasm, or sycophancy.
- Brevity: Be concise and structured by default. When asked for deeper insight, code, analysis, or structured plans, provide thorough, rigorous, and beautifully formatted answers.
- Formatting: Use clean markdown, bullet points, and code blocks with language identifiers where appropriate.`;

export const AVAILABLE_MODELS = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    description: 'Fastest, highly capable flagship flash model (Recommended)',
    speed: 'Ultra Fast',
    memoryUsage: 'Low',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    description: 'Lightest footprint, lowest latency for low-spec devices',
    speed: 'Instantaneous',
    memoryUsage: 'Minimal',
  },
];
