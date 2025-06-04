'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSettings, ChatSession } from '@/contexts/AppSettingsContext';
import { Button, Textarea, FileUpload, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { SendHorizontal, Copy, Loader2 } from 'lucide-react';
import { marked } from 'marked';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Model {
  id: string;
  name: string;
  description?: string;
  context_length: number;
}

interface ChatParameters {
  temperature: number;
  top_p: number;
  max_tokens: number;
}

export default function ChatPage() {
  const { currentMode, sessionToRestore, setSessionToRestore } = useAppSettings();
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [parameters, setParameters] = useState<ChatParameters>({
    temperature: 0.7,
    top_p: 1,
    max_tokens: 2048,
  });  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch('/api/models');
        const data = await response.json();
        if (data.data) {
          setModels(data.data);
          if (data.data.length > 0 && !selectedModel) {
            setSelectedModel(data.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load models:', error);
      }
    };

    loadModels();
  }, [selectedModel]);

  // Load default system prompt based on mode
  useEffect(() => {
    const defaultSafePrompt = "You are a helpful, harmless, and honest AI assistant. Provide informative and accurate responses while being respectful and appropriate.";
    const defaultNSFWPrompt = "You are an AI assistant capable of discussing adult content when appropriate. Be helpful and informative while respecting boundaries.";
    
    if (currentMode === 'safe') {
      setSystemPrompt(defaultSafePrompt);
    } else {
      setSystemPrompt(defaultNSFWPrompt);
    }
  }, [currentMode]);

  // Restore session if available
  useEffect(() => {
    if (sessionToRestore) {
      setMessages(sessionToRestore.messages);
      setSelectedModel(sessionToRestore.model);
      setParameters(sessionToRestore.parameters);
      setSystemPrompt(sessionToRestore.systemPrompt);
      setSessionToRestore(null);
    }
  }, [sessionToRestore, setSessionToRestore]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  // Save session to history
  const saveSession = useCallback(() => {
    if (messages.length === 0) return;

    const session: ChatSession = {
      id: Date.now().toString(),
      timestamp: new Date(),
      messages,
      model: selectedModel,
      parameters,
      systemPrompt,
      mode: currentMode,
    };

    const existingSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    const updatedSessions = [session, ...existingSessions];
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  }, [messages, selectedModel, parameters, systemPrompt, currentMode]);
  const sendMessage = async () => {
    if (!userInput.trim() || isLoading || !selectedModel) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setUploadedFile(null); // Clear uploaded file after sending
    setIsLoading(true);

    // Create placeholder for assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, initialAssistantMessage]);

    try {      const messagesForApi = [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { 
          role: 'user' as const, 
          content: uploadedFile 
            ? `${userInput}\n\n[File: ${uploadedFile.name}]\n${uploadedFile.content}`
            : userInput
        },
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: messagesForApi,
          stream: true,
          ...parameters,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  fullContent += content;
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                }              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        }
      }    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: `Sorry, I encountered an error: ${errorMessage}. Please try again.` }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' && e.ctrlKey) || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const clearChat = () => {
    if (messages.length > 0) {
      saveSession(); // Save before clearing
    }
    setMessages([]);
  };  // Save session when user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length > 0) {
        saveSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages.length, saveSession]);

  return (    <div className="flex flex-col h-full max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header Controls */}
      <div className="border-b pb-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Temperature: {parameters.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={parameters.temperature}
              onChange={(e) => setParameters(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>

          {/* Clear Chat */}
          <div className="flex items-end">
            <Button onClick={clearChat} variant="outline" className="w-full">
              Clear Chat
            </Button>
          </div>
        </div>

        {/* System Prompt */}
        {currentMode === 'nsfw' && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">System Prompt</label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter system prompt..."
              rows={2}
            />
          </div>
        )}
      </div>      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">Welcome to Chatbot Playground</h3>
            <p className="text-muted-foreground mb-4">
              Select a model and start chatting! You can upload files, adjust parameters, and switch between Safe and NSFW modes.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>💡 <strong>Tip:</strong> Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Enter</kbd> to send messages</p>
            </div>
          </motion.div>
        )}
        
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">                    {message.role === 'assistant' ? (
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: marked(message.content) }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    {/* Show typing indicator for empty assistant messages */}
                    {message.role === 'assistant' && !message.content && isLoading && (
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs opacity-70 ml-2">Thinking...</span>
                      </div>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(message.content)}
                    className="ml-2 h-6 w-6"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs opacity-50 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-muted p-4 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t pt-4">        <div className="flex space-x-2">
          <FileUpload
            onFileContent={(content, fileName) => setUploadedFile({ content, name: fileName })}
            onRemove={() => setUploadedFile(null)}
            uploadedFile={uploadedFile}
            disabled={isLoading}
          />
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 min-h-[60px] max-h-[200px]"
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !userInput.trim() || !selectedModel}
            size="icon"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
