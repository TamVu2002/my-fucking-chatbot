'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Hash, ArrowRight, Settings, MessageSquare, BarChart3, Users, Code, Palette, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Command list with navigation and actions
  const commands: Command[] = [
    // Navigation
    {
      id: 'nav-chat',
      title: 'Chat',
      description: 'Start a new conversation',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => router.push('/chat'),
      category: 'Navigation',
      keywords: ['chat', 'conversation', 'talk']
    },
    {
      id: 'nav-prompts',
      title: 'Prompts',
      description: 'Manage prompt templates',
      icon: <Hash className="w-4 h-4" />,
      action: () => router.push('/prompts'),
      category: 'Navigation',
      keywords: ['prompts', 'templates']
    },
    {
      id: 'nav-models',
      title: 'Model Comparison',
      description: 'Compare different AI models',
      icon: <BarChart3 className="w-4 h-4" />,
      action: () => router.push('/models'),
      category: 'Navigation',
      keywords: ['models', 'comparison', 'analyze']
    },
    {
      id: 'nav-analytics',
      title: 'Analytics',
      description: 'View usage analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      action: () => router.push('/analytics'),
      category: 'Navigation',
      keywords: ['analytics', 'statistics', 'metrics']
    },
    {
      id: 'nav-collaboration',
      title: 'Collaboration',
      description: 'Team collaboration features',
      icon: <Users className="w-4 h-4" />,
      action: () => router.push('/collaboration'),
      category: 'Navigation',
      keywords: ['collaboration', 'team', 'share']
    },
    {
      id: 'nav-testing',
      title: 'A/B Testing',
      description: 'Run model tests and experiments',
      icon: <Code className="w-4 h-4" />,
      action: () => router.push('/testing'),
      category: 'Navigation',
      keywords: ['testing', 'experiment', 'ab test']
    },
    {
      id: 'nav-settings',
      title: 'Settings',
      description: 'Configure application settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/settings'),
      category: 'Navigation',
      keywords: ['settings', 'preferences', 'configuration']
    },
    // Actions
    {
      id: 'action-new-chat',
      title: 'New Chat',
      description: 'Start a fresh conversation',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => {
        router.push('/chat');
      },
      category: 'Actions',
      keywords: ['new', 'chat', 'fresh', 'start']
    },
    {
      id: 'action-theme-toggle',
      title: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: <Palette className="w-4 h-4" />,
      action: () => {
        document.documentElement.classList.toggle('dark');
      },
      category: 'Actions',
      keywords: ['theme', 'dark', 'light', 'mode']
    },
    {
      id: 'action-quick-test',
      title: 'Quick Model Test',
      description: 'Run a quick comparison test',
      icon: <Zap className="w-4 h-4" />,
      action: () => router.push('/testing?quick=true'),
      category: 'Actions',
      keywords: ['quick', 'test', 'fast', 'comparison']
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  }, [filteredCommands, selectedIndex, executeCommand, onOpenChange]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    const category = command.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 outline-none text-sm"
                autoFocus
              />
              <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 rounded">
                ESC
              </kbd>
            </div>

            {/* Commands List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredCommands.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  <p>No commands found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </motion.div>
              ) : (
                <div className="py-2">
                  {Object.entries(groupedCommands).map(([category, commands]) => (
                    <div key={category}>
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {category}
                      </div>
                      {commands.map((command) => {
                        const globalIndex = filteredCommands.indexOf(command);
                        const isSelected = globalIndex === selectedIndex;
                        
                        return (
                          <motion.button
                            key={command.id}
                            onClick={() => executeCommand(command)}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`w-full px-4 py-2 text-left flex items-center justify-between group transition-colors ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center min-w-0">
                              <div className={`mr-3 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
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
                            <motion.div
                              initial={{ x: -5, opacity: 0 }}
                              animate={{ 
                                x: 0, 
                                opacity: isSelected ? 1 : 0
                              }}
                              whileHover={{ opacity: 0.5 }}
                            >
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </motion.div>
                          </motion.button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded mr-1">
                      ↑↓
                    </kbd>
                    Navigate
                  </span>
                  <span className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded mr-1">
                      ↵
                    </kbd>
                    Select
                  </span>
                </div>
                <span>
                  {filteredCommands.length} {filteredCommands.length === 1 ? 'command' : 'commands'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommandPalette;
