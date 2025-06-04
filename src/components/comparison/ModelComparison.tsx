'use client';
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Send, Copy, Download, RotateCcw, Settings, Zap, Brain, Timer } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { AnimatedDiv, AnimatedButton } from '@/components/ui/animations';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokens?: number;
  latency?: number;
}

interface ModelSession {
  id: string;
  modelId: string;
  modelName: string;
  messages: ChatMessage[];
  isLoading: boolean;
  settings: {
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  stats: {
    totalTokens: number;
    averageLatency: number;
    responseCount: number;
  };
}

interface Model {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  pricing: {
    input: number;
    output: number;
  };
}

const DEFAULT_MODELS: Model[] = [
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    contextLength: 128000,
    pricing: { input: 0.01, output: 0.03 }
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    contextLength: 200000,
    pricing: { input: 0.015, output: 0.075 }
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    contextLength: 32000,
    pricing: { input: 0.0005, output: 0.0015 }
  }
];

const DEFAULT_SETTINGS = {
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0
};

export default function ModelComparison() {
  const { theme } = useAppSettings();
  const [sessions, setSessions] = useState<ModelSession[]>([]);
  const [prompt, setPrompt] = useState('');
  const [availableModels] = useState<Model[]>(DEFAULT_MODELS);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const addModelSession = useCallback((model: Model) => {
    const newSession: ModelSession = {
      id: `session-${Date.now()}-${Math.random()}`,
      modelId: model.id,
      modelName: model.name,
      messages: [],
      isLoading: false,
      settings: { ...DEFAULT_SETTINGS },
      stats: {
        totalTokens: 0,
        averageLatency: 0,
        responseCount: 0
      }
    };

    setSessions(prev => [...prev, newSession]);
    setShowModelSelector(false);
  }, []);

  const removeModelSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  }, []);

  const updateSessionSettings = useCallback((sessionId: string, settings: Partial<ModelSession['settings']>) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, settings: { ...session.settings, ...settings } }
        : session
    ));
  }, []);

  const sendMessage = useCallback(async () => {
    if (!prompt.trim() || sessions.length === 0) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt.trim(),
      timestamp: Date.now()
    };

    // Add user message to all sessions
    setSessions(prev => prev.map(session => ({
      ...session,
      messages: [...session.messages, userMessage],
      isLoading: true
    })));

    setPrompt('');

    // Send to all models simultaneously
    const promises = sessions.map(async (session) => {
      const startTime = Date.now();
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: session.modelId,
            messages: [...session.messages, userMessage].map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            ...session.settings
          })
        });

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        const latency = Date.now() - startTime;

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-${session.id}`,
          role: 'assistant',
          content: data.content || 'No response received',
          timestamp: Date.now(),
          tokens: data.usage?.total_tokens || 0,
          latency
        };

        setSessions(prev => prev.map(s => {
          if (s.id !== session.id) return s;
          
          const newStats = {
            totalTokens: s.stats.totalTokens + (assistantMessage.tokens || 0),
            responseCount: s.stats.responseCount + 1,
            averageLatency: (s.stats.averageLatency * s.stats.responseCount + latency) / (s.stats.responseCount + 1)
          };

          return {
            ...s,
            messages: [...s.messages, assistantMessage],
            isLoading: false,
            stats: newStats
          };
        }));
      } catch (error) {
        console.error('Error sending message to', session.modelName, error);
        
        const errorMessage: ChatMessage = {
          id: `msg-error-${Date.now()}-${session.id}`,
          role: 'assistant',
          content: 'Error: Failed to get response from this model.',
          timestamp: Date.now()
        };

        setSessions(prev => prev.map(s => 
          s.id === session.id 
            ? { ...s, messages: [...s.messages, errorMessage], isLoading: false }
            : s
        ));
      }
    });

    await Promise.all(promises);
  }, [prompt, sessions]);

  const clearAllSessions = useCallback(() => {
    setSessions(prev => prev.map(session => ({
      ...session,
      messages: [],
      stats: {
        totalTokens: 0,
        averageLatency: 0,
        responseCount: 0
      }
    })));
  }, []);

  const exportComparison = useCallback(() => {
    const comparison = {
      timestamp: new Date().toISOString(),
      sessions: sessions.map(session => ({
        model: session.modelName,
        settings: session.settings,
        stats: session.stats,
        messages: session.messages
      }))
    };

    const blob = new Blob([JSON.stringify(comparison, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model-comparison-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessions]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Model Comparison
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {sessions.length} models active
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <AnimatedButton
              onClick={clearAllSessions}
              variant="ghost"
              size="sm"
              disabled={sessions.length === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </AnimatedButton>
            
            <AnimatedButton
              onClick={exportComparison}
              variant="ghost"
              size="sm"
              disabled={sessions.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </AnimatedButton>

            <AnimatedButton
              onClick={() => setShowModelSelector(true)}
              variant="default"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Model
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {sessions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <AnimatedDiv className="text-center">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Models Selected
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Add models to start comparing their responses side by side
              </p>
              <AnimatedButton
                onClick={() => setShowModelSelector(true)}
                variant="default"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Model
              </AnimatedButton>
            </AnimatedDiv>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-auto">
            {sessions.map((session) => (
              <ModelSessionPanel
                key={session.id}
                session={session}
                onRemove={() => removeModelSession(session.id)}
                onUpdateSettings={(settings) => updateSessionSettings(session.id, settings)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Prompt Input */}
      {sessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={promptRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter your prompt to send to all models... (Ctrl/Cmd + Enter to send)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={3}
              />
            </div>
            <AnimatedButton
              onClick={sendMessage}
              disabled={!prompt.trim() || sessions.some(s => s.isLoading)}
              variant="default"
            >
              <Send className="w-4 h-4" />
            </AnimatedButton>
          </div>
        </div>
      )}

      {/* Model Selector Modal */}
      <ModelSelectorModal
        isOpen={showModelSelector}
        onClose={() => setShowModelSelector(false)}
        availableModels={availableModels}
        selectedModels={sessions.map(s => s.modelId)}
        onSelectModel={addModelSession}
      />
    </div>
  );
}

// Model Session Panel Component
interface ModelSessionPanelProps {
  session: ModelSession;
  onRemove: () => void;
  onUpdateSettings: (settings: Partial<ModelSession['settings']>) => void;
}

function ModelSessionPanel({ session, onRemove, onUpdateSettings }: ModelSessionPanelProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <motion.div
      layout
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {session.modelName}
            </h3>
            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                {session.stats.totalTokens} tokens
              </div>
              <div className="flex items-center">
                <Timer className="w-3 h-3 mr-1" />
                {session.stats.averageLatency.toFixed(0)}ms avg
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onRemove}
              className="p-1 rounded text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400">Temperature</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={session.settings.temperature}
                    onChange={(e) => onUpdateSettings({ temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{session.settings.temperature}</span>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400">Max Tokens</label>
                  <input
                    type="number"
                    min="1"
                    max="4000"
                    value={session.settings.maxTokens}
                    onChange={(e) => onUpdateSettings({ maxTokens: parseInt(e.target.value) })}
                    className="w-full px-2 py-1 text-xs rounded border dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {session.messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-50 dark:bg-blue-900/20 ml-4'
                : 'bg-gray-50 dark:bg-gray-700 mr-4'
            }`}
          >
            <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
              {message.content}
            </div>
            {message.role === 'assistant' && (
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  {message.tokens && (
                    <span>{message.tokens} tokens</span>
                  )}
                  {message.latency && (
                    <span>{message.latency}ms</span>
                  )}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(message.content)}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}

        {session.isLoading && (
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
            <span className="text-sm">Generating response...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Model Selector Modal Component
interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableModels: Model[];
  selectedModels: string[];
  onSelectModel: (model: Model) => void;
}

function ModelSelectorModal({ isOpen, onClose, availableModels, selectedModels, onSelectModel }: ModelSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Model
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {availableModels.map((model) => (
            <button
              key={model.id}
              onClick={() => onSelectModel(model)}
              disabled={selectedModels.includes(model.id)}
              className={`w-full p-3 text-left rounded-lg border transition-colors ${
                selectedModels.includes(model.id)
                  ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {model.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {model.provider} • {model.contextLength.toLocaleString()} context
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
