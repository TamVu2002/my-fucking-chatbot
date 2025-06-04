'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ChatContainerProps {
  children: ReactNode;
}

const ChatContainer = ({ children }: ChatContainerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        duration: 0.6
      }}
      className="flex flex-col h-full max-w-6xl mx-auto px-4 sm:px-6 relative"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20 pointer-events-none rounded-2xl" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {children}
      </div>
    </motion.div>
  );
};

export default ChatContainer;
