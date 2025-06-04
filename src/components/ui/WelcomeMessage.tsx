'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, Upload, Settings } from 'lucide-react';

const WelcomeMessage = () => {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const iconVariants = {
    initial: { scale: 0 },
    animate: { 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15,
        delay: 0.3
      }
    }
  };

  const features = [
    {
      icon: MessageCircle,
      title: "Smart Conversations",
      description: "Chat with advanced AI models"
    },
    {
      icon: Upload,
      title: "File Upload",
      description: "Share documents and files"
    },
    {
      icon: Settings,
      title: "Customizable",
      description: "Adjust parameters and prompts"
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      {/* Main icon */}
      <motion.div
        variants={iconVariants}
        className="relative mb-6"
      >
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
          }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <MessageCircle className="w-10 h-10 text-white" />
        </motion.div>
        
        {/* Floating sparkle */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </motion.div>
      </motion.div>      {/* Welcome text */}
      <motion.div variants={itemVariants} className="mb-8">
        <motion.h1 
          className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent mb-3"
          animate={{
            backgroundPosition: ["0%", "100%", "0%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            backgroundSize: "200% 100%"
          }}
        >
          Welcome to ChatBot Playground
        </motion.h1>
        <motion.p 
          className="text-lg text-muted-foreground max-w-md"
          variants={itemVariants}
        >
          Start a conversation with our AI assistant. Choose your model and begin chatting!
        </motion.p>
      </motion.div>

      {/* Features grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-2xl"
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            className="flex flex-col items-center p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
            whileHover={{ 
              y: -4,
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)"
            }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div
              className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center mb-3"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
            <p className="text-xs text-muted-foreground text-center">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Tip */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-800"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          💡
        </motion.div>
        <div className="text-sm">
          <span className="font-medium text-blue-700 dark:text-blue-300">Pro tip:</span>
          <span className="text-blue-600 dark:text-blue-400 ml-1">
            Press <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs font-mono">Ctrl+Enter</kbd> to send messages quickly
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeMessage;
