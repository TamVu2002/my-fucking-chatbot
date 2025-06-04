'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Clock, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ChatStatsProps {
  messageCount: number;
  isActive: boolean;
}

const ChatStats = ({ messageCount, isActive }: ChatStatsProps) => {
  const [time, setTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);

  // Prevent hydration mismatch by not rendering time until mounted
  if (!mounted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-4 text-xs"
      >
        {/* Message Count */}
        <motion.div
          className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-lg"
          whileHover={{ scale: 1.05 }}
        >
          <MessageSquare className="w-3 h-3 text-blue-500" />
          <span className="font-medium">{messageCount}</span>
          <span className="text-muted-foreground">messages</span>
        </motion.div>

        {/* Activity Status */}
        <motion.div
          className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-lg"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={isActive ? { 
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1] 
            } : {}}
            transition={{ 
              duration: 1.5, 
              repeat: isActive ? Infinity : 0,
              ease: "easeInOut" 
            }}
          >
            <Activity className={`w-3 h-3 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
          </motion.div>
          <span className={`font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
            {isActive ? 'Active' : 'Idle'}
          </span>
        </motion.div>

        {/* Session Time - Hidden during SSR */}
        <motion.div
          className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-lg"
          whileHover={{ scale: 1.05 }}
        >
          <Clock className="w-3 h-3 text-orange-500" />
          <span className="font-medium text-muted-foreground">
            --:--
          </span>
        </motion.div>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-4 text-xs"
    >
      {/* Message Count */}
      <motion.div
        className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-lg"
        whileHover={{ scale: 1.05 }}
      >
        <MessageSquare className="w-3 h-3 text-blue-500" />
        <span className="font-medium">{messageCount}</span>
        <span className="text-muted-foreground">messages</span>
      </motion.div>

      {/* Activity Status */}
      <motion.div
        className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-lg"
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          animate={isActive ? { 
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1] 
          } : {}}
          transition={{ 
            duration: 1.5, 
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut" 
          }}
        >
          <Activity className={`w-3 h-3 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
        </motion.div>
        <span className={`font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
          {isActive ? 'Active' : 'Idle'}
        </span>
      </motion.div>      {/* Session Time */}
      <motion.div
        className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-lg"
        whileHover={{ scale: 1.05 }}
      >
        <Clock className="w-3 h-3 text-orange-500" />
        <span className="font-medium text-muted-foreground">
          {time}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default ChatStats;