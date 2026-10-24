import React, { useState, useEffect, useRef } from 'react';
import {
  ChatMessage as ChatMessageType,
  Conversation,
  UserMemoryItem,
  AppSettings,
  ServerStatus,
  SidebarTab,
} from './types';
import {
  loadConversations,
  saveConversations,
  loadActiveConvoId,
  saveActiveConvoId,
  loadUserMemory,
  saveUserMemory,
  loadSettings,
  saveSettings,
} from './utils/storage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { registerBackButtonHandler, triggerHapticFeedback } from './utils/capacitorBridge';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MemoryView } from './components/views/MemoryView';
import { ToolsView } from './components/views/ToolsView';
import { AboutView } from './components/views/AboutView';
import { HistoryView } from './components/views/HistoryView';
import { WinterLogo } from './components/WinterLogo';
import { Sparkles, Key, Zap, Shield, BatteryCharging } from 'lucide-react';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeConvoId, setActiveConvoId] = useState<string>(() => {
    const saved = loadActiveConvoId();
    const convos = loadConversations();
    if (saved && convos.some((c) => c.id === saved)) return saved;
    return convos[0]?.id || `convo_${Date.now()}`;
  });

  const [memoryItems, setMemoryItems] = useState<UserMemoryItem[]>(() => loadUserMemory());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [activeTab, setActiveTab] = useState<SidebarTab>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);

  const isOnline = useOnlineStatus();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Active conversation object
  const currentConversation =
    conversations.find((c) => c.id === activeConvoId) ||
    conversations[0] || {
      id: activeConvoId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

  const messages = currentConversation.messages;

  // Sync settings & theme on change
  useEffect(() => {
    saveSettings(settings);
    if (settings.theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, [settings]);

  // Sync conversations
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Sync active convo id
  useEffect(() => {
    saveActiveConvoId(activeConvoId);
  }, [activeConvoId]);

  // Sync user memory
  useEffect(() => {
    saveUserMemory(memoryItems);
  }, [memoryItems]);

  // Android hardware back button handler
  useEffect(() => {
    const unregister = registerBackButtonHandler(() => {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
        return true;
      }
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
        return true;
      }
      if (activeTab !== 'chat') {
        setActiveTab('chat');
        return true;
      }
      return false;
    });
    return unregister;
  }, [isSidebarOpen, isSettingsOpen, activeTab]);

  // Scroll to bottom when messages update
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({
      behavior: settings.reducedMotion ? 'auto' : behavior,
    });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom('smooth');
    }
  }, [messages.length, activeTab]);

  // Check server status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data: ServerStatus) => {
        setServerStatus(data);
      })
      .catch(() => {
        setServerStatus({
          status: 'static-mode',
          appName: 'Winter',
          hasServerKey: false,
          recommendedModel: 'gemini-3.8-flash',
        });
      });
  }, []);

  const handleToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  // Switch to a new conversation
  const handleNewChat = () => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    const newId = `convo_${Date.now()}`;
    const newConvo: Conversation = {
      id: newId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [newConvo, ...prev]);
    setActiveConvoId(newId);
    setActiveTab('chat');
    setInput('');
    triggerHapticFeedback('light');
  };

  const handleSelectConversation = (id: string) => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    setActiveConvoId(id);
    setActiveTab('chat');
    triggerHapticFeedback('light');
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHapticFeedback('medium');
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const fallbackId = `convo_${Date.now()}`;
        setActiveConvoId(fallbackId);
        return [
          {
            id: fallbackId,
            title: 'New Conversation',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [],
          },
        ];
      }
      if (activeConvoId === id) {
        setActiveConvoId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleClearAllConversations = () => {
    triggerHapticFeedback('medium');
    const freshId = `convo_${Date.now()}`;
    const freshConvo: Conversation = {
      id: freshId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations([freshConvo]);
    setActiveConvoId(freshId);
    setActiveTab('chat');
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    triggerHapticFeedback('light');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend !== undefined ? textToSend : input).trim();
    if (!promptText || isGenerating || !isOnline) return;

    setInput('');
    triggerHapticFeedback('light');

    const userMessage: ChatMessageType = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
    };

    const assistantMessageId = `asst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const placeholderAssistant: ChatMessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: settings.model,
    };

    // Auto-update conversation title if it's the first message
    const shouldUpdateTitle =
      messages.length === 0 || currentConversation.title === 'New Conversation';
    const computedTitle = shouldUpdateTitle
      ? promptText.slice(0, 30).trim() + (promptText.length > 30 ? '...' : '')
      : currentConversation.title;

    const updatedMessages = [...messages, userMessage, placeholderAssistant];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvoId
          ? {
              ...c,
              title: computedTitle,
              updatedAt: Date.now(),
              messages: updatedMessages,
            }
          : c
      )
    );

    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Inject user memory facts into system prompt if enabled
    let effectiveSystemPrompt = settings.systemPrompt;
    if (settings.enableMemoryInjection && memoryItems.length > 0) {
      effectiveSystemPrompt += `\n\n[USER FACTS & PREFERENCES STORED IN WINTER MEMORY]:\n${memoryItems
        .map((m) => `- (${m.category}): ${m.content}`)
        .join('\n')}`;
    }

    try {
      const conversationPayload = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: promptText },
      ];

      let usedServer = false;
      let accumulatedText = '';

      // 1. Try Server Endpoint (/api/chat)
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: conversationPayload,
            model: settings.model,
            temperature: settings.temperature,
            systemInstruction: effectiveSystemPrompt,
            customApiKey: settings.apiKey || undefined,
          }),
          signal: controller.signal,
        });

        if (response.ok && response.body) {
          usedServer = true;
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data: ')) continue;
              const payload = trimmed.slice(6);
              if (payload === '[DONE]') break;

              try {
                const parsed = JSON.parse(payload);
                if (parsed.error) throw new Error(parsed.error);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === activeConvoId
                        ? {
                            ...c,
                            messages: c.messages.map((m) =>
                              m.id === assistantMessageId
                                ? { ...m, content: accumulatedText }
                                : m
                            ),
                          }
                        : c
                    )
                  );
                }
              } catch (e: unknown) {
                if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
                  throw e;
                }
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') throw err;
        console.warn('Server endpoint bypassed, trying direct client fallback:', err);
      }

      // 2. Client-side REST Fallback (for static Netlify / Vercel / standalone Capacitor APK)
      if (!usedServer || !accumulatedText.trim()) {
        const apiKey = settings.apiKey.trim();
        if (!apiKey) {
          throw new Error(
            'No Gemini API key found. Please open Settings (⚙️ in header or sidebar) and enter your Gemini API key.'
          );
        }

        const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          settings.model
        )}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

        const restContents = conversationPayload.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        const directResponse = await fetch(directUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: restContents,
            systemInstruction: { parts: [{ text: effectiveSystemPrompt }] },
            generationConfig: { temperature: settings.temperature },
          }),
          signal: controller.signal,
        });

        if (!directResponse.ok) {
          const errBody = await directResponse.json().catch(() => ({}));
          throw new Error(
            errBody.error?.message ||
              `HTTP ${directResponse.status}: Failed to reach Gemini API.`
          );
        }

        if (!directResponse.body) {
          throw new Error('ReadableStream not supported.');
        }

        const reader = directResponse.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const payload = trimmed.slice(6);

            try {
              const parsed = JSON.parse(payload);
              const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (chunkText) {
                accumulatedText += chunkText;
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === activeConvoId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantMessageId
                              ? { ...m, content: accumulatedText }
                              : m
                          ),
                        }
                      : c
                  )
                );
              }
            } catch {
              // Ignore incomplete chunks
            }
          }
        }
      }

      if (!accumulatedText.trim()) {
        accumulatedText =
          'Winter received your prompt, but generated an empty response. Please try again.';
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvoId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: accumulatedText }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;

      const errorMsg =
        err instanceof Error
          ? err.message
          : 'An unexpected connection error occurred with the Gemini API.';

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvoId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content: `⚠️ **Winter Notice:**\n\n${errorMsg}\n\n*Tap ⚙️ Settings to verify your API key or connection.*`,
                        isError: true,
                      }
                    : m
                ),
              }
            : c
        )
      );
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetry = (messageId: string) => {
    const index = messages.findIndex((m) => m.id === messageId);
    if (index <= 0) return;
    const previousUserMessage = messages[index - 1];
    if (previousUserMessage.role !== 'user') return;

    const pruned = messages.slice(0, index - 1);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvoId ? { ...c, messages: pruned } : c))
    );
    handleSendMessage(previousUserMessage.content);
  };

  const handleEdit = (content: string) => {
    setInput(content);
  };

  const handleSelectTab = (tab: SidebarTab) => {
    triggerHapticFeedback('light');
    if (tab === 'settings') {
      setIsSettingsOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  const hasApiKeyReady = Boolean(serverStatus?.hasServerKey || settings.apiKey.trim());

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] antialiased select-text">
      {/* Left Collapsible Dashboard Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        conversations={conversations}
        activeConvoId={activeConvoId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isOnline={isOnline}
      />

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Header with hamburger and active title */}
        <Header
          settings={settings}
          conversationTitle={
            activeTab === 'chat'
              ? currentConversation.title
              : activeTab === 'history'
              ? 'Chat History'
              : activeTab === 'memory'
              ? 'Memory & Notes'
              : activeTab === 'tools'
              ? 'Tools & Bridge'
              : 'About Winter'
          }
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleTheme={handleToggleTheme}
          isGenerating={isGenerating}
          isOnline={isOnline}
          serverStatus={serverStatus}
        />

        {/* View Switcher: Chat, History, Memory, Tools, or About */}
        {activeTab === 'history' ? (
          <HistoryView
            conversations={conversations}
            activeConvoId={activeConvoId}
            onSelectConversation={(id) => {
              handleSelectConversation(id);
              setActiveTab('chat');
            }}
            onDeleteConversation={handleDeleteConversation}
            onRenameConversation={handleRenameConversation}
            onClearAll={handleClearAllConversations}
          />
        ) : activeTab === 'memory' ? (
          <MemoryView
            memoryItems={memoryItems}
            onSaveMemory={setMemoryItems}
            enableMemoryInjection={settings.enableMemoryInjection}
            onToggleMemoryInjection={(enabled) =>
              setSettings((prev) => ({ ...prev, enableMemoryInjection: enabled }))
            }
          />
        ) : activeTab === 'tools' ? (
          <ToolsView />
        ) : activeTab === 'about' ? (
          <AboutView />
        ) : (
          /* Main Chat Area */
          <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-between">
            {messages.length === 0 ? (
              /* Welcome Screen with stylish W logo */
              <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-2xl mx-auto w-full text-center animate-in fade-in duration-300">
                <WinterLogo size={76} className="mb-4" />

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                  Winter
                </h2>
                <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
                  Calm, intelligent, and focused personal AI assistant. Designed for speed, privacy, and low-spec hardware.
                </p>

                {/* Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                    <Zap className="w-3.5 h-3.5 text-sky-400" />
                    <span>Ultra-fast Flash Model</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Low Memory &amp; Battery</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>100% Local Storage</span>
                  </span>
                </div>

                {/* Prompt Starter Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left mb-4">
                  {[
                    {
                      title: 'Plan with clarity',
                      desc: 'Help me prioritize my day with calm focus',
                    },
                    {
                      title: 'Concise explanation',
                      desc: 'Explain quantum computing in 3 simple paragraphs',
                    },
                    {
                      title: 'Review my code',
                      desc: 'Inspect a function for edge cases and performance',
                    },
                    {
                      title: 'Draft a message',
                      desc: 'Write a calm, respectful response to a complex request',
                    },
                  ].map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(card.desc)}
                      className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800/80 hover:border-sky-500/50 transition-all text-left group"
                    >
                      <p className="text-xs font-semibold text-sky-300 group-hover:text-sky-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        <span>{card.title}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{card.desc}</p>
                    </button>
                  ))}
                </div>

                {/* API Key Reminder if not setup */}
                {!hasApiKeyReady && (
                  <div className="mt-2 p-3 rounded-xl bg-sky-950/50 border border-sky-800/60 max-w-md w-full flex items-center justify-between text-xs text-sky-200">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Configure your Gemini API key to begin</span>
                    </div>
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-sky-500 text-slate-950 font-medium hover:bg-sky-400 transition-colors"
                    >
                      Open Settings
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Message List */
              <div className="w-full max-w-4xl mx-auto py-3 space-y-1">
                {messages.map((m, index) => {
                  const isLast = index === messages.length - 1;
                  return (
                    <ChatMessage
                      key={m.id}
                      message={m}
                      isStreaming={isLast && isGenerating && m.role === 'assistant'}
                      fontSize={settings.fontSize}
                      onRetry={handleRetry}
                      onEdit={handleEdit}
                    />
                  );
                })}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}

            {/* Input Bar */}
            <ChatInput
              input={input}
              setInput={setInput}
              onSend={handleSendMessage}
              onStop={handleStopGenerating}
              isGenerating={isGenerating}
              isOnline={isOnline}
              showStarters={messages.length > 0 && messages.length < 4}
            />
          </main>
        )}

        {/* Offline Toast Banner */}
        <OfflineIndicator />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSaveSettings={(newSettings) => setSettings(newSettings)}
          serverStatus={serverStatus}
          messageCount={messages.length}
          onClearHistory={handleClearAllConversations}
        />
      </div>
    </div>
  );
}
