'use client';

import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const EnhancedTypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-end gap-2 mb-4 justify-start"
    >
      {/* Avatar */}
      <motion.div 
        className="chat-avatar chat-avatar-assistant"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Bot size={16} />
      </motion.div>

      {/* Typing bubble */}
      <motion.div
        className="chat-message chat-message-assistant"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <motion.div
              className="w-2 h-2 bg-current rounded-full"
              animate={{
                y: [0, -6, 0],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0
              }}
            />
            <motion.div
              className="w-2 h-2 bg-current rounded-full"
              animate={{
                y: [0, -6, 0],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
            />
            <motion.div
              className="w-2 h-2 bg-current rounded-full"
              animate={{
                y: [0, -6, 0],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4
              }}
            />
          </div>
          <span className="text-xs opacity-70">AI is thinking</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedTypingIndicator;
