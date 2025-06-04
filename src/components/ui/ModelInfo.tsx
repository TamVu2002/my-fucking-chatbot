'use client';

import { motion } from 'framer-motion';
import { Brain, Clock, Zap } from 'lucide-react';

interface ModelInfoProps {
  model?: {
    id: string;
    name: string;
    description?: string;
    context_length: number;
  };
  parameters: {
    temperature: number;
    top_p: number;
    max_tokens: number;
  };
}

const ModelInfo = ({ model, parameters }: ModelInfoProps) => {
  if (!model) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
    >
      <div className="flex items-start gap-3">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <Brain className="w-4 h-4 text-white" />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 text-sm truncate">
            {model.name}
          </h3>
          
          {model.description && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 line-clamp-2">
              {model.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-2 text-xs text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{model.context_length.toLocaleString()} tokens</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Temp: {parameters.temperature}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ModelInfo;
