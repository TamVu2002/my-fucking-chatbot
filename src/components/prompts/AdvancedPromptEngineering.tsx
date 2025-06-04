'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Brain,
  Zap,
  Target,
  Lightbulb,
  Wand2,
  Code,
  MessageSquare,
  BookOpen,
  Microscope,
  Palette,
  Settings,
  Play,
  RotateCcw,
  Save,
  Copy,
  Share2,
  TrendingUp,
  Award,
  Star,
  ChevronDown,
  ChevronUp,
  Plus,
  Filter,
  Search,
  ArrowRight,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useAppSettings } from '@/contexts/AppSettingsContext';

// Types for advanced prompt engineering
interface PromptPattern {
  id: string;
  name: string;
  description: string;
  pattern: string;
  category: 'reasoning' | 'creativity' | 'analysis' | 'instruction' | 'roleplay' | 'coding';
  effectiveness: number; // 0-100
  usageCount: number;
  tags: string[];
  examples: string[];
}

interface PromptOptimization {
  original: string;
  optimized: string;
  improvements: string[];
  score: number;
  reasoning: string;
  suggestedParams: {
    temperature: number;
    topP: number;
    maxTokens: number;
  };
}

interface PromptAnalysis {
  clarity: number;
  specificity: number;
  completeness: number;
  effectiveness: number;
  suggestions: string[];
  missingElements: string[];
  strengths: string[];
}

interface AdvancedPromptEngineeringProps {
  onPromptGenerated?: (prompt: string) => void;
  onParametersChanged?: (params: any) => void;
  className?: string;
}

// Predefined prompt patterns
const PROMPT_PATTERNS: PromptPattern[] = [
  {
    id: 'chain-of-thought',
    name: 'Chain of Thought',
    description: 'Step-by-step reasoning for complex problems',
    pattern: 'Let\'s think step by step:\n1. First, {step1}\n2. Then, {step2}\n3. Finally, {step3}\n\nBased on this analysis...',
    category: 'reasoning',
    effectiveness: 95,
    usageCount: 0,
    tags: ['reasoning', 'step-by-step', 'analysis'],
    examples: ['Math problems', 'Decision making', 'Problem solving']
  },
  {
    id: 'few-shot',
    name: 'Few-Shot Learning',
    description: 'Provide examples to guide model behavior',
    pattern: 'Here are some examples:\n\nExample 1: {example1}\nOutput: {output1}\n\nExample 2: {example2}\nOutput: {output2}\n\nNow apply this to: {task}',
    category: 'instruction',
    effectiveness: 88,
    usageCount: 0,
    tags: ['examples', 'learning', 'pattern'],
    examples: ['Classification tasks', 'Format specification', 'Style mimicking']
  },
  {
    id: 'role-prompt',
    name: 'Role-Based Prompting',
    description: 'Assign specific expertise roles to the AI',
    pattern: 'You are a {role} with {years} years of experience in {domain}. Your expertise includes {expertise}. Please {task} while maintaining your professional perspective.',
    category: 'roleplay',
    effectiveness: 92,
    usageCount: 0,
    tags: ['role', 'expertise', 'perspective'],
    examples: ['Expert consultation', 'Professional advice', 'Specialized knowledge']
  },
  {
    id: 'constraint-based',
    name: 'Constraint-Based',
    description: 'Define clear boundaries and requirements',
    pattern: 'Please {task} with the following constraints:\n- {constraint1}\n- {constraint2}\n- {constraint3}\n\nEnsure your response adheres to all constraints.',
    category: 'instruction',
    effectiveness: 85,
    usageCount: 0,
    tags: ['constraints', 'boundaries', 'requirements'],
    examples: ['Content guidelines', 'Format requirements', 'Length limits']
  },
  {
    id: 'metacognitive',
    name: 'Metacognitive Prompting',
    description: 'Ask AI to reflect on its own thinking process',
    pattern: 'Before answering, consider:\n1. What do I know about this topic?\n2. What might I be uncertain about?\n3. How confident am I in my response?\n\nNow, {task}',
    category: 'reasoning',
    effectiveness: 78,
    usageCount: 0,
    tags: ['reflection', 'confidence', 'uncertainty'],
    examples: ['Complex decisions', 'Research tasks', 'Critical analysis']
  }
];

const OPTIMIZATION_SUGGESTIONS = [
  'Add specific context about your domain or use case',
  'Include examples of desired output format',
  'Specify the target audience or expertise level',
  'Add constraints or requirements for the response',
  'Include step-by-step instructions for complex tasks',
  'Specify the desired tone and style',
  'Add relevant background information',
  'Include evaluation criteria for the response'
];

export default function AdvancedPromptEngineering({
  onPromptGenerated,
  onParametersChanged,
  className = ''
}: AdvancedPromptEngineeringProps) {
  const { currentTheme } = useAppSettings();
  
  // State management
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<PromptPattern | null>(null);
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [optimization, setOptimization] = useState<PromptOptimization | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [patternVariables, setPatternVariables] = useState<Record<string, string>>({});

  // Filter patterns based on search and category
  const filteredPatterns = useMemo(() => {
    return PROMPT_PATTERNS.filter(pattern => {
      const matchesSearch = pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pattern.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pattern.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || pattern.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Analyze prompt quality
  const analyzePrompt = useCallback((prompt: string) => {
    if (!prompt.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis (in real app, this would call your AI service)
    setTimeout(() => {
      const wordCount = prompt.split(' ').length;
      const hasExamples = prompt.toLowerCase().includes('example');
      const hasConstraints = prompt.includes('constraint') || prompt.includes('requirement');
      const hasContext = wordCount > 20;
      const hasSpecificity = prompt.includes('specific') || prompt.includes('exactly');
      
      const analysis: PromptAnalysis = {
        clarity: hasContext ? 85 : 60,
        specificity: hasSpecificity ? 90 : 65,
        completeness: hasExamples && hasConstraints ? 95 : 70,
        effectiveness: (hasContext && hasExamples && hasConstraints) ? 92 : 75,
        suggestions: [
          !hasExamples && 'Consider adding specific examples',
          !hasConstraints && 'Add clear constraints or requirements',
          !hasContext && 'Provide more context about your use case',
          wordCount < 10 && 'Expand the prompt with more details'
        ].filter(Boolean) as string[],
        missingElements: [
          !hasExamples && 'Examples',
          !hasConstraints && 'Constraints',
          !hasContext && 'Context'
        ].filter(Boolean) as string[],
        strengths: [
          hasExamples && 'Includes examples',
          hasConstraints && 'Has clear constraints',
          hasContext && 'Provides good context',
          hasSpecificity && 'Specific instructions'
        ].filter(Boolean) as string[]
      };
      
      setAnalysis(analysis);
      setIsAnalyzing(false);
    }, 1500);
  }, []);

  // Optimize prompt
  const optimizePrompt = useCallback((prompt: string) => {
    if (!prompt.trim()) return;
    
    setIsOptimizing(true);
    
    // Simulate AI optimization
    setTimeout(() => {
      const optimization: PromptOptimization = {
        original: prompt,
        optimized: `${prompt}\n\nPlease structure your response as follows:\n1. Brief overview\n2. Detailed analysis\n3. Specific recommendations\n\nUse clear, professional language and provide concrete examples where applicable.`,
        improvements: [
          'Added response structure guidance',
          'Specified desired output format',
          'Included tone and style requirements',
          'Added request for examples'
        ],
        score: 85,
        reasoning: 'The optimized prompt provides clearer structure and expectations, leading to more consistent and useful responses.',
        suggestedParams: {
          temperature: 0.7,
          topP: 0.9,
          maxTokens: 1000
        }
      };
      
      setOptimization(optimization);
      setIsOptimizing(false);
    }, 2000);
  }, []);

  // Apply pattern to current prompt
  const applyPattern = useCallback((pattern: PromptPattern) => {
    setSelectedPattern(pattern);
    
    // Extract variables from pattern
    const variables = pattern.pattern.match(/\{([^}]+)\}/g) || [];
    const variableObj: Record<string, string> = {};
    variables.forEach(variable => {
      const key = variable.slice(1, -1);
      variableObj[key] = '';
    });
    setPatternVariables(variableObj);
  }, []);

  // Generate final prompt from pattern
  const generateFromPattern = useCallback(() => {
    if (!selectedPattern) return;
    
    let generatedPrompt = selectedPattern.pattern;
    Object.entries(patternVariables).forEach(([key, value]) => {
      generatedPrompt = generatedPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value || `[${key}]`);
    });
    
    setCurrentPrompt(generatedPrompt);
    if (onPromptGenerated) {
      onPromptGenerated(generatedPrompt);
    }
    
    // Update usage count
    const updatedPattern = { ...selectedPattern, usageCount: selectedPattern.usageCount + 1 };
    // In real app, save this to localStorage or database
  }, [selectedPattern, patternVariables, onPromptGenerated]);

  // Copy prompt to clipboard
  const copyPrompt = useCallback((prompt: string) => {
    navigator.clipboard.writeText(prompt);
  }, []);

  // Get effectiveness color
  const getEffectivenessColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`advanced-prompt-engineering ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold">Advanced Prompt Engineering</h2>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Advanced Tools
          </Button>
        </div>

        {/* Current Prompt Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Current Prompt</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => analyzePrompt(currentPrompt)}
                disabled={isAnalyzing || !currentPrompt.trim()}
              >
                {isAnalyzing ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Microscope className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Microscope className="w-4 h-4" />
                )}
                Analyze
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => optimizePrompt(currentPrompt)}
                disabled={isOptimizing || !currentPrompt.trim()}
              >
                {isOptimizing ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Optimize
              </Button>
            </div>
          </div>
          <Textarea
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            placeholder="Enter your prompt here or select a pattern below..."
            rows={6}
            className="resize-none"
          />
        </div>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 border"
            >
              <h3 className="flex items-center gap-2 font-semibold mb-3">
                <Gauge className="w-5 h-5" />
                Prompt Analysis
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'Clarity', value: analysis.clarity },
                  { label: 'Specificity', value: analysis.specificity },
                  { label: 'Completeness', value: analysis.completeness },
                  { label: 'Effectiveness', value: analysis.effectiveness }
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-bold mb-1" style={{ color: `hsl(${value * 1.2}, 70%, 50%)` }}>
                      {value}%
                    </div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>

              {analysis.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Suggestions for Improvement:</h4>
                  <ul className="space-y-1">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Optimization Results */}
        <AnimatePresence>
          {optimization && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 border"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Sparkles className="w-5 h-5" />
                  Optimized Prompt (Score: {optimization.score}%)
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyPrompt(optimization.optimized)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPrompt(optimization.optimized);
                      if (onPromptGenerated) onPromptGenerated(optimization.optimized);
                    }}
                  >
                    <ArrowRight className="w-4 h-4" />
                    Use This
                  </Button>
                </div>
              </div>
              
              <div className="bg-background rounded p-3 mb-3 text-sm font-mono">
                {optimization.optimized}
              </div>
              
              <div className="text-sm text-muted-foreground mb-3">
                {optimization.reasoning}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Improvements Made:</h4>
                <ul className="space-y-1">
                  {optimization.improvements.map((improvement, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>

              {onParametersChanged && (
                <div className="mt-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onParametersChanged(optimization.suggestedParams)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Apply Suggested Parameters
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pattern Library */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Prompt Pattern Library</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Search patterns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Categories</option>
                <option value="reasoning">Reasoning</option>
                <option value="creativity">Creativity</option>
                <option value="analysis">Analysis</option>
                <option value="instruction">Instruction</option>
                <option value="roleplay">Roleplay</option>
                <option value="coding">Coding</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatterns.map((pattern) => (
              <motion.div
                key={pattern.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedPattern?.id === pattern.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-border'
                }`}
                onClick={() => applyPattern(pattern)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{pattern.name}</h4>
                  <div className="flex items-center gap-1">
                    <Star className={`w-4 h-4 ${getEffectivenessColor(pattern.effectiveness)}`} />
                    <span className={`text-xs ${getEffectivenessColor(pattern.effectiveness)}`}>
                      {pattern.effectiveness}%
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {pattern.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Used {pattern.usageCount} times
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pattern Variable Editor */}
        <AnimatePresence>
          {selectedPattern && Object.keys(patternVariables).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Customize Pattern: {selectedPattern.name}</h3>
                <Button
                  onClick={generateFromPattern}
                  disabled={!Object.values(patternVariables).some(v => v.trim())}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Prompt
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(patternVariables).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <Input
                      value={value}
                      onChange={(e) => setPatternVariables(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={`Enter ${key}...`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-background rounded border">
                <div className="text-sm font-medium mb-2">Preview:</div>
                <div className="text-sm font-mono whitespace-pre-wrap">
                  {selectedPattern.pattern.replace(/\{([^}]+)\}/g, (match, key) => 
                    patternVariables[key] || `[${key}]`
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Tools */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Advanced Tools</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Quick Suggestions */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Quick Improvements
                    </h4>
                    <div className="space-y-2">
                      {OPTIMIZATION_SUGGESTIONS.slice(0, 4).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const improved = currentPrompt + '\n\n' + suggestion;
                            setCurrentPrompt(improved);
                          }}
                          className="w-full text-left justify-start h-auto py-2 px-3"
                        >
                          <Plus className="w-3 h-3 mr-2" />
                          <span className="text-xs">{suggestion}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Template Generator */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Template Generator
                    </h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <MessageSquare className="w-3 h-3 mr-2" />
                        Chat Assistant
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <BookOpen className="w-3 h-3 mr-2" />
                        Content Writer
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Code className="w-3 h-3 mr-2" />
                        Code Helper
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Palette className="w-3 h-3 mr-2" />
                        Creative Writer
                      </Button>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Performance
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Prompts Optimized:</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg. Improvement:</span>
                        <span className="font-medium text-green-500">+23%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Patterns Used:</span>
                        <span className="font-medium">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="font-medium text-green-500">94%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
