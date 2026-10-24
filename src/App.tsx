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
  idbLoadConversations,
  idbSaveConversations,
  idbLoadSettings,
  idbSaveSettings,
  idbLoadMemory,
  idbSaveMemory,
} from './utils/indexedDBStorage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { registerBackButtonHandler, triggerHapticFeedback } from './utils/capacitorBridge';
import { WinterLocalEngine } from './utils/localEngine';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MemoryView } from './components/views/MemoryView';
import { AboutView } from './components/views/AboutView';
import { HistoryView } from './components/views/HistoryView';
import { FrostySnowflakeLogo } from './components/FrostySnowflakeLogo';
import { Sparkles, Key } from 'lucide-react';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string>('');
  const [memoryItems, setMemoryItems] = useState<UserMemoryItem[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>('chat');
  
  // Grok / Claude style collapsible sidebar (defaults open on large screens, collapsed on mobile)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);

  const isOnline = useOnlineStatus();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load from IndexedDB on initial mount
  useEffect(() => {
    async function initStorage() {
      const [convos, loadedSettings, memories] = await Promise.all([
        idbLoadConversations(),
        idbLoadSettings(),
        idbLoadMemory(),
      ]);

      setConversations(convos);
      setActiveConvoId(convos[0]?.id || `convo_${Date.now()}`);
      setSettings(loadedSettings);
      setMemoryItems(memories);
    }

    initStorage();
  }, []);

  // Sync settings to IndexedDB
  useEffect(() => {
    if (settings) {
      idbSaveSettings(settings);
    }
  }, [settings]);

  // Sync conversations to IndexedDB
  useEffect(() => {
    if (conversations.length > 0) {
      idbSaveConversations(conversations);
    }
  }, [conversations]);

  // Sync user memory to IndexedDB
  useEffect(() => {
    if (memoryItems.length > 0) {
      idbSaveMemory(memoryItems);
    }
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
          recommendedModel: 'gemini-2.0-flash',
        });
      });
  }, []);

  // Determine if offline engine is active
  const isOfflineModeActive = !isOnline || Boolean(settings?.forceOfflineMode);

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

  // Scroll to bottom when messages update
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({
      behavior: settings?.reducedMotion ? 'auto' : behavior,
    });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom('smooth');
    }
  }, [messages.length, activeTab]);

  // Quick toggle for offline simulation
  const handleToggleOfflineMode = () => {
    triggerHapticFeedback('light');
    if (!settings) return;
    setSettings((prev) =>
      prev ? { ...prev, forceOfflineMode: !prev.forceOfflineMode } : null
    );
  };

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
    if (!promptText || isGenerating || !settings) return;

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
      model: isOfflineModeActive ? 'Winter Local Brain' : settings.model,
      isOffline: isOfflineModeActive,
    };

    const shouldUpdateTitle =
      messages.length === 0 || currentConversation.title === 'New Conversation';
    const computedTitle = shouldUpdateTitle
      ? promptText.slice(0, 28).trim() + (promptText.length > 28 ? '...' : '')
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

    // Check if we should execute OFFLINE or ONLINE
    if (isOfflineModeActive) {
      try {
        await WinterLocalEngine.generateStreaming({
          prompt: promptText,
          history: messages,
          systemPrompt: settings.systemPrompt,
          memoryItems: settings.enableMemoryInjection ? memoryItems : [],
          onChunk: (accumulated) => {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === activeConvoId
                  ? {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantMessageId
                          ? { ...m, content: accumulated, isOffline: true }
                          : m
                      ),
                    }
                  : c
              )
            );
          },
          signal: controller.signal,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Offline generation error:', err);
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
      return;
    }

    // ONLINE MODE (Cloud)
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

      // 1. Try Express / Server route (sub-second latency with flash models)
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: conversationPayload,
            model: settings.model || 'gemini-2.0-flash',
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
        console.warn('Server proxy failed, testing direct client fallback or offline fallback:', err);
      }

      // 2. Client-side direct fallback if custom API key is configured
      if (!usedServer || !accumulatedText.trim()) {
        const apiKey = settings.apiKey.trim();
        if (apiKey) {
          const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
            settings.model || 'gemini-2.0-flash'
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

          if (directResponse.ok && directResponse.body) {
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
                  // Ignore
                }
              }
            }
          }
        }
      }

      // 3. Seamless Instant Local Fallback if cloud was unreachable!
      if (!accumulatedText.trim()) {
        await WinterLocalEngine.generateStreaming({
          prompt: promptText,
          history: messages,
          systemPrompt: settings.systemPrompt,
          memoryItems: settings.enableMemoryInjection ? memoryItems : [],
          onChunk: (accumulated) => {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === activeConvoId
                  ? {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantMessageId
                          ? { ...m, content: accumulated, isOffline: true }
                          : m
                      ),
                    }
                  : c
              )
            );
          },
          signal: controller.signal,
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;

      // Fallback seamlessly to local engine on error
      await WinterLocalEngine.generateStreaming({
        prompt: promptText,
        history: messages,
        systemPrompt: settings.systemPrompt,
        memoryItems: settings.enableMemoryInjection ? memoryItems : [],
        onChunk: (accumulated) => {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeConvoId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: accumulated, isOffline: true }
                        : m
                    ),
                  }
                : c
            )
          );
        },
        signal: controller.signal,
      });
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

  if (!settings) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030712] text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <FrostySnowflakeLogo size={42} spinning={true} />
          <p className="text-xs text-slate-400 font-mono animate-pulse">Initializing Winter...</p>
        </div>
      </div>
    );
  }

  const hasApiKeyReady = Boolean(serverStatus?.hasServerKey || settings.apiKey.trim());

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] antialiased select-text">
      {/* Grok & Claude Collapsible Sidebar (Can be completely hidden) */}
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
        isOfflineModeActive={isOfflineModeActive}
      />

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Minimal Claude/Grok Top Bar */}
        <Header
          settings={settings}
          conversationTitle={
            activeTab === 'chat'
              ? currentConversation.title
              : activeTab === 'history'
              ? 'History'
              : activeTab === 'memory'
              ? 'Memory'
              : 'About'
          }
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={handleNewChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleOfflineMode={handleToggleOfflineMode}
          isGenerating={isGenerating}
          isOnline={isOnline}
          isOfflineModeActive={isOfflineModeActive}
          serverStatus={serverStatus}
        />

        {/* View Switcher: Chat, History, Memory, or About */}
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
              setSettings((prev) => (prev ? { ...prev, enableMemoryInjection: enabled } : null))
            }
          />
        ) : activeTab === 'about' ? (
          <AboutView />
        ) : (
          /* Main Clean Centered Chat Area */
          <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-between">
            {messages.length === 0 ? (
              /* Minimalist Welcome Screen */
              <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-2xl mx-auto w-full text-center animate-in fade-in duration-300">
                <FrostySnowflakeLogo size={68} className="mb-3" />

                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                  Winter
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                  Calm, intelligent personal AI companion. Fast online cloud intelligence with automatic offline on-device brain.
                </p>

                {/* Prompt Starter Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left mb-4">
                  {[
                    {
                      title: 'Summarize key points',
                      desc: 'Extract main takeaways calmly and concisely',
                    },
                    {
                      title: 'Plan a structured day',
                      desc: 'Design a clean time-blocked focus schedule',
                    },
                    {
                      title: 'Review or write code',
                      desc: 'Inspect algorithms or draft clean TypeScript',
                    },
                    {
                      title: 'Draft a message',
                      desc: 'Write a calm, respectful professional note',
                    },
                  ].map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(card.desc)}
                      className="p-3.5 rounded-2xl bg-[#0c1424]/90 hover:bg-[#111c33] border border-slate-800/80 hover:border-sky-500/40 transition-all text-left group"
                    >
                      <p className="text-xs font-semibold text-sky-300 group-hover:text-sky-200 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        <span>{card.title}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{card.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Optional Key Setup Reminder if server has no key and user entered none */}
                {!hasApiKeyReady && !isOfflineModeActive && (
                  <div className="mt-2 p-3 rounded-xl bg-sky-950/30 border border-sky-900/50 max-w-md w-full flex items-center justify-between text-xs text-sky-200">
                    <div className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Configure your API key or use Offline Brain</span>
                    </div>
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-sky-400 text-slate-950 font-medium hover:bg-sky-300 transition-colors"
                    >
                      Settings
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Message List (Centered Column Claude/Grok style) */
              <div className="w-full max-w-3xl mx-auto py-3 space-y-1">
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

            {/* Input Bar (Centered container) */}
            <ChatInput
              input={input}
              setInput={setInput}
              onSend={handleSendMessage}
              onStop={handleStopGenerating}
              isGenerating={isGenerating}
              isOnline={!isOfflineModeActive}
              showStarters={messages.length > 0 && messages.length < 3}
            />
          </main>
        )}

        {/* Offline Toast Banner */}
        <OfflineIndicator isOfflineModeActive={isOfflineModeActive} />

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
