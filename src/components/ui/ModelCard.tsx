'use client';
import { Bot, Zap, Clock, Sparkles, Check, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Model } from '@/contexts/AppSettingsContext';

interface ModelCardProps {
  model: Model;
  isSelected: boolean;
  onSelect: (modelId: string) => void;
  onStartChat: (modelId: string) => void;
}

const ModelCard = ({ model, isSelected, onSelect, onStartChat }: ModelCardProps) => {
  const isFree = model.pricing && 
    parseFloat(model.pricing.prompt) === 0 && 
    parseFloat(model.pricing.completion) === 0 && 
    (!model.pricing.request || parseFloat(model.pricing.request) === 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`p-4 border rounded-lg ${
        isSelected 
          ? 'bg-primary/10 border-primary/50' 
          : 'bg-card hover:bg-accent/50 transition-colors'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isSelected ? 'bg-primary' : 'bg-primary/20'
          }`}>
            <Bot className={`w-5 h-5 ${
              isSelected ? 'text-primary-foreground' : 'text-primary'
            }`} />
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-lg">{model.name}</h3>
          </div>
        </div>
        
        {isSelected && (
          <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
            Selected
          </div>
        )}
      </div>
      
      {model.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {model.description}
        </p>
      )}
      
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{model.context_length.toLocaleString()} tokens</span>
        </div>
        
        {model.architecture?.modality && (
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{model.architecture.modality}</span>
          </div>
        )}
        
        {isFree && (
          <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" />
            <span>Free</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 mt-auto">
        {isSelected ? (
          <Button 
            onClick={() => onStartChat(model.id)}
            className="w-full flex items-center justify-center"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Start Chatting
          </Button>
        ) : (
          <Button 
            variant="outline"
            onClick={() => onSelect(model.id)}
            className="w-full"
          >
            <Check className="mr-2 h-4 w-4" />
            Select Model
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default ModelCard;
