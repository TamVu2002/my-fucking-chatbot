'use client';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type Mode = 'safe' | 'nsfw';
export type Theme = 'light' | 'dark';

export interface ChatSession {
  id: string;
  timestamp: Date;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
  model: string;
  parameters: {
    temperature: number;
    top_p: number;
    max_tokens: number;
  };
  systemPrompt: string;
  mode: Mode;
}

interface AppSettings {
  currentMode: Mode;
  setCurrentMode: (mode: Mode) => void;
  currentTheme: Theme;
  setCurrentTheme: (theme: Theme) => void;
  theme: Theme; // Deprecated: use currentTheme
  setTheme: (theme: Theme) => void; // Deprecated: use setCurrentTheme
  sessionToRestore: ChatSession | null;
  setSessionToRestore: (session: ChatSession | null) => void;
  clearChatHistory: () => void;
  resetToDefaults: () => void;
}

const AppSettingsContext = createContext<AppSettings | undefined>(undefined);

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [currentMode, setCurrentModeState] = useState<Mode>('safe');
  const [theme, setThemeState] = useState<Theme>('light');
  const [sessionToRestore, setSessionToRestore] = useState<ChatSession | null>(null);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedMode = localStorage.getItem('appMode') as Mode | null;
    if (savedMode && (savedMode === 'safe' || savedMode === 'nsfw')) {
      setCurrentModeState(savedMode);
    }
    
    const savedTheme = localStorage.getItem('appTheme') as Theme | null;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeState(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
    }
  }, []);
  const setCurrentMode = (mode: Mode) => {
    setCurrentModeState(mode);
    localStorage.setItem('appMode', mode);
  };

  const setTheme = (theme: Theme) => {
    setThemeState(theme);
    localStorage.setItem('appTheme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  };

  const clearChatHistory = () => {
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('chatSessions');
  };

  const resetToDefaults = () => {
    setCurrentModeState('safe');
    setThemeState('light');
    localStorage.removeItem('appMode');
    localStorage.removeItem('appTheme');
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('chatSessions');
    localStorage.removeItem('userPrompts');
    localStorage.removeItem('appSettings');
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add('light');
  };
  
  useEffect(() => {
    // Apply theme to HTML element
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);
  return (
    <AppSettingsContext.Provider value={{ 
      currentMode, 
      setCurrentMode, 
      currentTheme: theme,
      setCurrentTheme: setTheme,
      theme, 
      setTheme,
      sessionToRestore,
      setSessionToRestore,
      clearChatHistory,
      resetToDefaults
    }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = (): AppSettings => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};
