'use client';

import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isLoading?: boolean;
}

const ConnectionStatus = ({ isConnected, isLoading }: ConnectionStatusProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50 text-xs"
    >
      <motion.div
        animate={isLoading ? { rotate: 360 } : {}}
        transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
      >
        {isConnected ? (
          <Wifi className="w-3 h-3 text-green-500" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-500" />
        )}
      </motion.div>
      
      <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
        {isLoading ? 'Processing...' : isConnected ? 'AI Online' : 'AI Offline'}
      </span>
      
      {isConnected && (
        <motion.div
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
};

export default ConnectionStatus;
