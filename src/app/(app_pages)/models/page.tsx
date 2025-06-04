'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Search, Check, MessageSquare, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppSettings, Model } from '@/contexts/AppSettingsContext';
import ModelCard from '@/components/ui/ModelCard';

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const { selectedModel, setSelectedModel, chatParameters, setChatParameters } = useAppSettings();
  const router = useRouter();

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/models');
        const data = await response.json();
        if (data.data) {
          setModels(data.data);
          // Set a default model if none is selected
          if (!selectedModel && data.data.length > 0) {
            setSelectedModel(data.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load models:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, [selectedModel, setSelectedModel]);

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const getFilteredModels = () => {
    return models
      .filter(model => {
        // Filter by search term
        if (searchTerm && !model.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }

        // Filter by category
        if (selectedFilter === 'all') {
          return true;
        } else if (selectedFilter === 'free') {
          return (
            (parseFloat(model.pricing?.prompt || '0') === 0) && 
            (parseFloat(model.pricing?.completion || '0') === 0) &&
            (!model.pricing?.request || parseFloat(model.pricing.request) === 0)
          );
        } else if (selectedFilter === 'large') {
          return model.context_length >= 100000;
        } else if (selectedFilter === 'small') {
          return model.context_length < 100000;
        }
        
        return true;
      });
  };

  const filteredModels = getFilteredModels();

  const startChatWithModel = (modelId: string) => {
    setSelectedModel(modelId);
    router.push('/chat');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Models</h1>
          <p className="text-muted-foreground">
            Select and configure your preferred AI models
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={() => router.push('/chat')} variant="outline" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Go to Chat</span>
          </Button>
        </div>
      </div>

      {/* Search and filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 touch-manipulation">
          {['all', 'free', 'large', 'small'].map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={selectedFilter === filter ? "default" : "outline"}
              onClick={() => setSelectedFilter(filter)}
              className="px-4 whitespace-nowrap"
            >
              {filter === 'all' && 'All Models'}
              {filter === 'free' && 'Free Only'}
              {filter === 'large' && 'Large Context'}
              {filter === 'small' && 'Small Context'}
              {selectedFilter === filter && (
                <Check className="ml-1 h-3 w-3" />
              )}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading available models...</p>
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-card">
          <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No models found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters.
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setSelectedFilter('all');
          }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                isSelected={selectedModel === model.id}
                onSelect={handleModelSelect}
                onStartChat={startChatWithModel}
              />
            ))}
          </AnimatePresence>
        </div>
      )}      {selectedModel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 border rounded-lg bg-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Model Parameters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Temperature */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">
                  Temperature
                </label>
                <span className="text-sm font-semibold text-primary">
                  {chatParameters.temperature}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={chatParameters.temperature}
                onChange={(e) => setChatParameters({
                  ...chatParameters,
                  temperature: parseFloat(e.target.value)
                })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Conservative</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Controls randomness. Lower values are more deterministic, higher values are more creative.
              </p>
            </div>
            
            {/* Top P */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">
                  Top P
                </label>
                <span className="text-sm font-semibold text-primary">
                  {chatParameters.top_p}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={chatParameters.top_p}
                onChange={(e) => setChatParameters({
                  ...chatParameters,
                  top_p: parseFloat(e.target.value)
                })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Focused</span>
                <span>Balanced</span>
                <span>Diverse</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Controls diversity of word choices. Lower values make responses more focused.
              </p>
            </div>
            
            {/* Max Tokens */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">
                  Max Tokens
                </label>
                <span className="text-sm font-semibold text-primary">
                  {chatParameters.max_tokens}
                </span>
              </div>
              <input
                type="range"
                min="256"
                max="4096"
                step="256"
                value={chatParameters.max_tokens}
                onChange={(e) => setChatParameters({
                  ...chatParameters,
                  max_tokens: parseInt(e.target.value)
                })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Short</span>
                <span>Medium</span>
                <span>Long</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sets the maximum length of the model&apos;s response.
              </p>
            </div>
          </div>
            <div className="mt-6 flex justify-end">
            <Button onClick={() => router.push('/chat')} className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Apply & Start Chatting
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// End of ModelsPage component
