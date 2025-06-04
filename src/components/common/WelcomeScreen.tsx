'use client';

import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Zap, 
  FileText, 
  Keyboard,
  Sparkles,
  Shield,
  ShieldOff
} from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const featureVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  }
};

export default function WelcomeScreen() {
  const { currentMode } = useAppSettings();

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Smart Conversations',
      description: 'Chat with advanced AI models powered by OpenRouter',
      color: 'bg-blue-500'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-time Streaming',
      description: 'Get responses in real-time as the AI generates them',
      color: 'bg-yellow-500'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'File Upload',
      description: 'Upload documents to provide context for your conversations',
      color: 'bg-green-500'
    },
    {
      icon: currentMode === 'safe' ? <Shield className="w-6 h-6" /> : <ShieldOff className="w-6 h-6" />,
      title: `${currentMode === 'safe' ? 'Safe' : 'NSFW'} Mode`,
      description: `Currently in ${currentMode === 'safe' ? 'family-friendly' : 'unrestricted'} mode`,
      color: currentMode === 'safe' ? 'bg-green-500' : 'bg-red-500'
    }
  ];

  const shortcuts = [
    { key: 'Ctrl/Cmd + K', action: 'Open Command Palette' },
    { key: 'Enter', action: 'Send Message (new line)' },
    { key: 'Ctrl/Cmd + Enter', action: 'Send Message (submit)' },
    { key: 'Esc', action: 'Close Modals' }
  ];

  return (
    <motion.div
      className="flex-1 flex items-center justify-center p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Welcome to Your AI Playground
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the power of advanced AI models with real-time streaming, 
            file uploads, and intelligent conversations.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={featureVariants}
              whileHover={{ 
                y: -5,
                transition: { type: 'spring', stiffness: 300 }
              }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.color} rounded-lg text-white mb-4`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Keyboard Shortcuts */}
        <motion.div variants={itemVariants} className="mt-12">
          <div className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Keyboard className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-semibold text-foreground">Keyboard Shortcuts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shortcuts.map((shortcut) => (
                <motion.div
                  key={shortcut.key}
                  variants={itemVariants}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <span className="text-sm text-muted-foreground">{shortcut.action}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-background border border-border rounded">
                    {shortcut.key}
                  </kbd>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Getting Started */}
        <motion.div variants={itemVariants} className="space-y-4">
          <p className="text-muted-foreground">
            Start by typing a message below, or press{' '}
            <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded">
              Ctrl+K
            </kbd>{' '}
            to open the command palette
          </p>
          
          <motion.div
            className="inline-block"
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
          >
            <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
