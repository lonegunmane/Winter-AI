export type Role = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  model?: string;
  isError?: boolean;
  isOffline?: boolean;
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

export type ThemeMode = 'dark';
export type FontSize = 'compact' | 'normal' | 'relaxed';

export type OfflineEngineChoice = 'smart-local' | 'webllm-smollm' | 'webllm-qwen';

export interface AppSettings {
  apiKey: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  theme: ThemeMode;
  fontSize: FontSize;
  reducedMotion: boolean;
  enableMemoryInjection: boolean;
  offlineEngine: OfflineEngineChoice;
  forceOfflineMode: boolean; // Allows testing/forcing offline engine even when online
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

export const DEFAULT_SYSTEM_PROMPT = `You are Winter, an elite personal AI assistant.
You embody the quiet, crystalline elegance and calmness of winter.
- Tone: Calm, clear, intelligent, and subtly warm.
- Style: Speak naturally and helpfully without fluff, hollow enthusiasm, or sycophancy.
- Capabilities: Deeply capable across reasoning, planning, coding, writing, research, and analysis.
- Brevity: Be concise and structured by default. When asked for deeper insight, code, analysis, or structured plans, provide thorough, rigorous, and beautifully formatted answers.
- Formatting: Use clean markdown, bullet points, and code blocks with language identifiers where appropriate.`;

export const AVAILABLE_MODELS = [
  {
    id: 'gemini-2.0-flash',
    name: 'Winter Flash (Recommended)',
    description: 'High-speed cloud intelligence with deep reasoning and analysis',
    speed: '< 1s latency',
    tier: 'Cloud',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Winter Flash Lite',
    description: 'Instantaneous response time, ultra-light bandwidth',
    speed: '< 0.5s latency',
    tier: 'Cloud',
  },
];

export const OFFLINE_ENGINES = [
  {
    id: 'smart-local',
    name: 'Winter Smart Local Brain',
    description: 'Instant, zero-download, ultra-fast local reasoning engine (Huawei P20 & low RAM friendly)',
    size: '0 MB (Pre-bundled)',
    recommendedFor: 'Low-spec phones & offline reliability',
  },
  {
    id: 'webllm-smollm',
    name: 'SmolLM-135M Quantized',
    description: 'Ultra-compact neural weights running via WebGPU/WASM in browser',
    size: '~120 MB',
    recommendedFor: 'Neural text generation on 6GB+ RAM devices',
  },
  {
    id: 'webllm-qwen',
    name: 'Qwen2-0.5B-Instruct Q4',
    description: 'Strong compact language model running on-device',
    size: '~350 MB',
    recommendedFor: 'Laptops and modern tablets with WebGPU',
  },
];
