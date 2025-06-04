'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Hash, ArrowRight, Settings, MessageSquare, BarChart3, Users, Code, Palette, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  keywords?: string[];
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const commands: Command[] = [
    {
      id: 'nav-chat',
      title: 'Chat',
      description: 'Start a new conversation',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => router.push('/chat'),
      category: 'Navigation',
      keywords: ['chat', 'conversation', 'talk']
    }
  ];

  const filteredCommands = commands.filter(command => {
    if (!query) return true;
    
    const searchQuery = query.toLowerCase();
    const matchesTitle = command.title.toLowerCase().includes(searchQuery);
    const matchesDescription = command.description?.toLowerCase().includes(searchQuery);
    const matchesKeywords = command.keywords?.some(keyword => 
      keyword.toLowerCase().includes(searchQuery)
    );
    
    return matchesTitle || matchesDescription || matchesKeywords;
  });

  const executeCommand = useCallback((command: Command) => {
    command.action();
    onOpenChange(false);
    setQuery('');
    setSelectedIndex(0);
  }, [onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl mx-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
          <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 outline-none text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.map((command) => (
              <button
                key={command.id}
                onClick={() => executeCommand(command)}
                className="w-full px-4 py-2 text-left flex items-center justify-between group transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center min-w-0">
                  <div className="mr-3 text-gray-400">
                    {command.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {command.title}
                    </div>
                    {command.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {command.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
