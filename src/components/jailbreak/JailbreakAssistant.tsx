'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Zap, 
  Brain, 
  Target, 
  AlertTriangle, 
  Copy, 
  RefreshCw, 
  Settings, 
  TrendingUp,
  Play,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  jailbreakEngine, 
  JailbreakRequest, 
  JailbreakResponse, 
  JailbreakPrompt, 
  JailbreakTechnique,
  JailbreakUtils,
  ModelAnalysisResponse
} from '@/lib/jailbreak-engine';

interface JailbreakAssistantProps {
  selectedModel?: string;
  onPromptGenerated?: (prompt: string) => void;
  className?: string;
}

export default function JailbreakAssistant({ 
  selectedModel = '', 
  onPromptGenerated,
  className = '' 
}: JailbreakAssistantProps) {
  // State management
  const [targetBehavior, setTargetBehavior] = useState('');
  const [creativityLevel, setCreativityLevel] = useState(0.8);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>(['roleplay', 'cognitive_bias']);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<JailbreakPrompt[]>([]);
  const [successProbability, setSuccessProbability] = useState(0);
  const [availableTechniques, setAvailableTechniques] = useState<JailbreakTechnique[]>([]);
  const [modelAnalysis, setModelAnalysis] = useState<ModelAnalysisResponse | null>(null);  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [engineStatus, setEngineStatus] = useState(jailbreakEngine.getStatus());

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  // Load techniques on mount
  useEffect(() => {
    loadAvailableTechniques();
    checkEngineStatus();
  }, []);

  // Auto-scroll to bottom when prompts are generated
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [generatedPrompts]);

  const checkEngineStatus = async () => {
    await jailbreakEngine.checkServiceAvailability();
    setEngineStatus(jailbreakEngine.getStatus());
  };

  const loadAvailableTechniques = async () => {
    try {
      const techniques = await jailbreakEngine.getAvailableTechniques();
      setAvailableTechniques(techniques);
    } catch (error) {
      console.error('Failed to load techniques:', error);
    }
  };
  const analyzeSelectedModel = useCallback(async () => {
    if (!selectedModel) return;

    try {
      const analysis = await jailbreakEngine.analyzeModel({ model_id: selectedModel });
      setModelAnalysis(analysis);
    } catch (error) {
      console.error('Model analysis failed:', error);
    }
  }, [selectedModel]);

  // Auto-analyze model when it changes
  useEffect(() => {
    if (selectedModel && autoAnalyze) {
      analyzeSelectedModel();
    }
  }, [selectedModel, autoAnalyze, analyzeSelectedModel]);

  const generateJailbreaks = async () => {
    if (!targetBehavior.trim()) {
      alert('Please enter a target behavior to generate jailbreaks for.');
      return;
    }

    setIsGenerating(true);

    try {
      const request: JailbreakRequest = {
        target_behavior: targetBehavior,
        model_type: selectedModel || 'general',
        creativity_level: creativityLevel,
        techniques: selectedTechniques,
        max_attempts: maxAttempts,
        filter_strength: modelAnalysis?.filter_strength || 'medium',
      };      const response: JailbreakResponse = await jailbreakEngine.generateJailbreaks(request);
      
      setGeneratedPrompts(response.prompts);
      setSuccessProbability(response.success_probability);

    } catch (error) {
      console.error('Jailbreak generation failed:', error);
      alert('Failed to generate jailbreaks. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPromptToClipboard = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  };
  const handleUsePrompt = (prompt: string) => {
    if (onPromptGenerated) {
      onPromptGenerated(prompt);
    }
  };

  const toggleTechnique = (technique: string) => {
    setSelectedTechniques(prev => 
      prev.includes(technique) 
        ? prev.filter(t => t !== technique)
        : [...prev, technique]
    );
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'very_high': return 'text-green-500';
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getFilterStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`bg-background border border-border rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg">
            <Shield className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Advanced Jailbreak Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Generate sophisticated prompts to bypass AI model restrictions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Service Status Indicator */}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
            engineStatus.isServiceAvailable 
              ? 'bg-green-500/20 text-green-500' 
              : 'bg-orange-500/20 text-orange-500'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              engineStatus.isServiceAvailable ? 'bg-green-500' : 'bg-orange-500'
            } ${engineStatus.isServiceAvailable ? 'animate-pulse' : ''}`} />
            <span>{engineStatus.isServiceAvailable ? 'ML Service' : 'Fallback Mode'}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-muted-foreground"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Model Analysis Section */}
      {modelAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-muted/50 rounded-lg border border-border/50"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Model Analysis: {selectedModel}</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={analyzeSelectedModel}
              className="text-muted-foreground"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <div className="text-center">
              <div className={`text-lg font-semibold ${getFilterStrengthColor(modelAnalysis.filter_strength)}`}>
                {modelAnalysis.filter_strength.toUpperCase()}
              </div>
              <div className="text-xs text-muted-foreground">Filter Strength</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">
                {Math.round(modelAnalysis.vulnerability_score * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Vulnerability</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-500">
                {modelAnalysis.recommended_techniques.length}
              </div>
              <div className="text-xs text-muted-foreground">Techniques</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-500">
                {JailbreakUtils.estimateDifficulty(selectedModel, targetBehavior).toUpperCase()}
              </div>
              <div className="text-xs text-muted-foreground">Difficulty</div>
            </div>
          </div>

          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <div>
                <h4 className="text-sm font-medium mb-2">Recommended Techniques:</h4>
                <div className="flex flex-wrap gap-2">
                  {modelAnalysis.recommended_techniques.map(technique => (
                    <span
                      key={technique}
                      className="px-2 py-1 bg-primary/20 text-primary rounded text-xs"
                    >
                      {technique}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Bypass Strategies:</h4>
                <ul className="space-y-1">
                  {modelAnalysis.bypass_strategies.map((strategy, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-start space-x-2">
                      <Target className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                      <span>{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Input Section */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Target Behavior</label>
          <Textarea
            value={targetBehavior}
            onChange={(e) => setTargetBehavior(e.target.value)}
            placeholder="Describe the behavior or content you want to generate prompts for..."
            className="min-h-[80px]"
          />
        </div>

        {/* Technique Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Jailbreak Techniques</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableTechniques.map(technique => (
              <motion.div
                key={technique.name}
                whileHover={{ scale: 1.02 }}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTechniques.includes(technique.name)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => toggleTechnique(technique.name)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">
                    {technique.name.replace('_', ' ')}
                  </span>
                  <span className={`text-xs ${getEffectivenessColor(technique.effectiveness)}`}>
                    {technique.effectiveness}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {technique.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Creativity Level: {creativityLevel}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={creativityLevel}
                    onChange={(e) => setCreativityLevel(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max Attempts</label>
                  <Select value={maxAttempts.toString()} onValueChange={(v) => setMaxAttempts(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 5, 7, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoAnalyze"
                  checked={autoAnalyze}
                  onChange={(e) => setAutoAnalyze(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="autoAnalyze" className="text-sm">
                  Auto-analyze models when changed
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generateJailbreaks}
        disabled={isGenerating || !targetBehavior.trim() || selectedTechniques.length === 0}
        className="w-full mb-6"
        size="lg"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Generating Jailbreaks...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Generate Advanced Jailbreaks
          </>
        )}
      </Button>

      {/* Results Section */}
      {generatedPrompts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Success Probability */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Success Probability</div>
                <div className="text-sm text-muted-foreground">
                  Based on model analysis and technique selection
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-500">
              {Math.round(successProbability * 100)}%
            </div>
          </div>

          {/* Generated Prompts */}
          <div>
            <h3 className="font-medium mb-3 flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Generated Jailbreak Prompts ({generatedPrompts.length})</span>
            </h3>

            <div className="space-y-3" ref={scrollRef}>
              {generatedPrompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-border rounded-lg bg-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {prompt.technique.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                        {Math.round(prompt.confidence * 100)}% confidence
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPromptToClipboard(prompt.text)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUsePrompt(prompt.text)}
                        className="h-8 w-8 p-0"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {prompt.description}
                  </p>

                  <div className="bg-muted/50 p-3 rounded text-sm font-mono">
                    {prompt.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-destructive mb-1">⚠️ Responsible Use Warning</div>
            <p className="text-destructive/80">
              These jailbreak techniques are for educational and research purposes only. 
              Use responsibly and in accordance with AI service terms of use. 
              Generated content may bypass safety measures and produce harmful outputs.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}