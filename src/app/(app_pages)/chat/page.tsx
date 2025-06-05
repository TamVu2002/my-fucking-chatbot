'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSettings, ChatSession } from '@/contexts/AppSettingsContext';
import { Button, Textarea, FileUpload, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { SendHorizontal } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import MessageBubble from '@/components/ui/MessageBubble';
import EnhancedTypingIndicator from '@/components/ui/EnhancedTypingIndicator';
import WelcomeMessage from '@/components/ui/WelcomeMessage';
import ChatContainer from '@/components/ui/ChatContainer';
import ConnectionStatus from '@/components/ui/ConnectionStatus';
import ModelInfo from '@/components/ui/ModelInfo';
import ChatStats from '@/components/ui/ChatStats';
import QuickActions from '@/components/ui/QuickActions';
import JailbreakAssistant from '@/components/jailbreak/JailbreakAssistant';
import { useSoundEffects } from '@/components/ui/SoundEffectPlayer';

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

export default function ChatPage() {
  const { 
    currentMode, 
    sessionToRestore, 
    setSessionToRestore, 
    selectedModel, 
    setSelectedModel,
    chatParameters,
    setChatParameters
  } = useAppSettings();
  
  const { playSound } = useSoundEffects();
  const [models, setModels] = useState<Model[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  }, [selectedModel, setSelectedModel]);

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
      setChatParameters(sessionToRestore.parameters);
      setSystemPrompt(sessionToRestore.systemPrompt);
      setSessionToRestore(null);
    }
  }, [sessionToRestore, setSessionToRestore, setChatParameters, setSelectedModel]);

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
      parameters: chatParameters,
      systemPrompt,
      mode: currentMode,
    };

    const existingSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    const updatedSessions = [session, ...existingSessions];
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  }, [messages, selectedModel, chatParameters, systemPrompt, currentMode]);
  
  const sendMessage = async () => {
    if (!userInput.trim() || isLoading || !selectedModel) return;

    // Play send sound
    playSound('send');

    // Store the input content before clearing
    const messageContent = userInput;
    const fileContent = uploadedFile;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
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

    try {
      const messagesForApi = [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { 
          role: 'user' as const, 
          content: fileContent 
            ? `${messageContent}\n\n[File: ${fileContent.name}]\n${fileContent.content}`
            : messageContent
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
          ...chatParameters,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let hasContent = false;

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
                  hasContent = true;
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                }
              } catch (parseError) {
                console.warn('Failed to parse JSON:', data, parseError);
                // Skip invalid JSON lines
              }
            }
          }
        }
      }

      // Play receive sound if we got content
      if (hasContent) {
        playSound('receive');
      }
    } catch (error) {
      console.error('Chat error:', error);
      playSound('error');
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
  };
  
  const regenerateLastResponse = async () => {
    if (messages.length >= 2) {
      const lastUserMessage = messages[messages.length - 2];
      if (lastUserMessage.role === 'user') {
        // Remove the last assistant message
        setMessages(prev => prev.slice(0, -1));
        
        // Set the user input and trigger send
        setUserInput(lastUserMessage.content);
        
        // Wait a bit for state to update, then send
        setTimeout(() => {
          setUserInput('');
          setIsLoading(true);
          
          // Create placeholder for new assistant message
          const assistantMessageId = Date.now().toString();
          const initialAssistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, initialAssistantMessage]);
          
          // Call the API
          regenerateApiCall(lastUserMessage.content, assistantMessageId);
        }, 100);
      }
    }
  };

  const regenerateApiCall = async (userContent: string, assistantMessageId: string) => {
    try {
      playSound('send');
      
      const messagesForApi = [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        ...messages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: userContent },
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
          ...chatParameters,
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
                }
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Regenerate error:', error);
      playSound('error');
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
      playSound('receive');
    }
  };

  const exportChat = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      model: selectedModel,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp
      }))
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareChat = async () => {
    const shareText = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chat Conversation',
          text: shareText
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      await copyToClipboard(shareText);
    }
  };
  
  // Save session when user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length > 0) {
        saveSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages.length, saveSession]);
  
  return (
    <ChatContainer>
      {/* Header Controls */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 mb-6 shadow-sm">
        {/* Connection Status and Chat Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <h2 className="text-lg font-semibold text-foreground/90">Chat Configuration</h2>
            <ChatStats 
              messageCount={messages.length} 
              isActive={isLoading || messages.length > 0}
            />
          </div>
          <ConnectionStatus isConnected={!!selectedModel} isLoading={isLoading} />
        </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Model Selection */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium mb-2 text-foreground/80">AI Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-background/80 border-border/50 focus:border-primary/50 transition-colors min-h-[40px]">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      {model.description && (
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80">
              Temperature: <span className="text-primary font-semibold">{chatParameters.temperature}</span>
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={chatParameters.temperature}                onChange={(e) => setChatParameters({
                  ...chatParameters,
                  temperature: parseFloat(e.target.value) 
                })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conservative</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>
          </div>

          {/* Clear Chat */}
          <div className="flex items-end">
            <Button 
              onClick={clearChat} 
              variant="outline" 
              className="w-full bg-background/80 border-border/50 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all duration-200 min-h-[40px]"
            >
              Clear Chat
            </Button>
          </div>
        </div>

        {/* System Prompt */}
        {currentMode === 'nsfw' && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <label className="block text-sm font-medium mb-2 text-yellow-800 dark:text-yellow-200">
              System Prompt (NSFW Mode)
            </label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter system prompt..."
              rows={2}
              className="bg-background/80 border-yellow-300 dark:border-yellow-700 focus:border-yellow-500"
            />
          </div>
        )}
        
        {/* Model Info Display */}
        {selectedModel && (
          <ModelInfo 
            model={models.find(m => m.id === selectedModel)} 
            parameters={chatParameters}
          />
        )}
      </div>      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 chat-messages px-2 py-4 bg-gradient-to-b from-background/50 to-background/80 rounded-xl backdrop-blur-sm">
        {messages.length === 0 && (
          <>
            <WelcomeMessage />
            {/* Jailbreak Assistant - Show only in jailbreak mode */}
            {currentMode === 'jailbreak' && (
              <div className="mt-6">
                <JailbreakAssistant
                  onPromptGenerated={(prompt) => {
                    setUserInput(prompt);
                  }}
                  selectedModel={selectedModel}
                />
              </div>
            )}
          </>
        )}
        
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onCopy={copyToClipboard}
              isLoading={isLoading && message.role === 'assistant' && !message.content}
            />
          ))}
        </AnimatePresence>
        
        {/* Enhanced typing indicator */}
        {isLoading && (
          <EnhancedTypingIndicator />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length > 0 && (
        <QuickActions
          onRegenerate={regenerateLastResponse}
          onExport={exportChat}
          onShare={shareChat}
          onCopy={() => copyToClipboard(messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n'))}
          disabled={isLoading}
        />
      )}
      
      {/* Input Area */}
      <div className="chat-input-area">
        <div className="flex items-end space-x-2 sm:space-x-3">
          <div className="flex-shrink-0">
            <FileUpload
              onFileContent={(content, fileName) => setUploadedFile({ content, name: fileName })}
              onRemove={() => setUploadedFile(null)}
              uploadedFile={uploadedFile}
              disabled={isLoading}
            />
          </div>
          <div className="flex-1 relative min-w-0">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="min-h-[52px] max-h-[200px] pr-12 sm:pr-14 resize-none border-2 border-border/50 focus:border-primary/50 rounded-2xl bg-background/50 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !userInput.trim() || !selectedModel}
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm touch-manipulation"
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* File indicator */}
        {uploadedFile && (
          <div className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            📎 {uploadedFile.name} attached
          </div>
        )}
      </div>
    </ChatContainer>
  );
}
