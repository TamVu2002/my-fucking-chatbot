'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap,
  ChevronRight, 
  Filter, 
  Search, 
  MessageSquare, 
  Clock, 
  ThumbsUp, 
  ThumbsDown,
  Wand2,
  Users,
  Bookmark,
  PenTool,
  Palette,
  Layers
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animations';

// Types
interface AISuggestion {
  id: string;
  type: 'prompt_optimization' | 'conversation_improvement' | 'performance_boost' | 'user_experience' | 'cost_optimization' | 'creative_enhancement';
  category: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedImprovement: number;
  tags: string[];
  example?: string;
  implementation: string[];
  relatedSuggestions: string[];
  userFeedback?: 'positive' | 'negative' | null;
  timeToImplement: number; // minutes
  isBookmarked: boolean;
  priority: number;
  lastUpdated: number;
}

interface SuggestionCategory {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  description: string;
  count: number;
}

// Mock AI Suggestions Data
const MOCK_SUGGESTIONS: AISuggestion[] = [
  {
    id: 'sug_1',
    type: 'prompt_optimization',
    category: 'Writing Enhancement',
    title: 'Use Chain-of-Thought for Complex Reasoning',
    description: 'Your prompts for analytical tasks could benefit from explicit step-by-step reasoning instructions. This can improve accuracy by 35%.',
    confidence: 0.92,
    impact: 'high',
    difficulty: 'easy',
    estimatedImprovement: 35,
    tags: ['reasoning', 'accuracy', 'analytical'],
    example: 'Instead of "Analyze this data", try "Let\'s analyze this data step by step: 1) First, identify the key trends 2) Then, examine correlations 3) Finally, draw conclusions"',
    implementation: [
      'Add "Let\'s think step by step" to analytical prompts',
      'Break complex requests into numbered steps',
      'Ask for reasoning before conclusions'
    ],
    relatedSuggestions: ['sug_2', 'sug_5'],
    timeToImplement: 5,
    isBookmarked: false,
    priority: 9,
    lastUpdated: Date.now() - 2 * 60 * 60 * 1000
  },
  {
    id: 'sug_2',
    type: 'conversation_improvement',
    category: 'User Engagement',
    title: 'Implement Contextual Follow-up Questions',
    description: 'AI analysis shows your conversations could be 45% more engaging with proactive follow-up questions based on user responses.',
    confidence: 0.87,
    impact: 'high',
    difficulty: 'medium',
    estimatedImprovement: 45,
    tags: ['engagement', 'conversation', 'follow-up'],
    example: 'After a user asks about Python, suggest: "Would you like me to show you some practical examples?" or "Are you working on a specific project?"',
    implementation: [
      'Analyze user responses for implicit interests',
      'Generate contextual follow-up questions',
      'Track conversation depth metrics'
    ],
    relatedSuggestions: ['sug_1', 'sug_3'],
    timeToImplement: 30,
    isBookmarked: true,
    priority: 8,
    lastUpdated: Date.now() - 1 * 60 * 60 * 1000
  },
  {
    id: 'sug_3',
    type: 'performance_boost',
    category: 'Response Speed',
    title: 'Optimize Token Usage with Smart Truncation',
    description: 'Implement intelligent context truncation to reduce tokens by 25% while maintaining conversation quality.',
    confidence: 0.89,
    impact: 'medium',
    difficulty: 'hard',
    estimatedImprovement: 25,
    tags: ['performance', 'tokens', 'optimization'],
    example: 'Prioritize recent messages and key context while intelligently summarizing older conversation parts.',
    implementation: [
      'Implement context importance scoring',
      'Create smart truncation algorithms',
      'Maintain conversation coherence metrics'
    ],
    relatedSuggestions: ['sug_4', 'sug_6'],
    timeToImplement: 120,
    isBookmarked: false,
    priority: 7,
    lastUpdated: Date.now() - 3 * 60 * 60 * 1000
  },
  {
    id: 'sug_4',
    type: 'user_experience',
    category: 'Interface Enhancement',
    title: 'Add Typing Indicators with Context',
    description: 'Smart typing indicators that show what the AI is working on can improve perceived responsiveness by 40%.',
    confidence: 0.85,
    impact: 'medium',
    difficulty: 'easy',
    estimatedImprovement: 40,
    tags: ['UX', 'feedback', 'responsiveness'],
    example: 'Show "Analyzing your code..." or "Researching latest information..." instead of generic typing indicator.',
    implementation: [
      'Implement contextual typing messages',
      'Add progress indicators for long operations',
      'Create smart response time estimation'
    ],
    relatedSuggestions: ['sug_2', 'sug_7'],
    timeToImplement: 45,
    isBookmarked: false,
    priority: 6,
    lastUpdated: Date.now() - 4 * 60 * 60 * 1000
  },
  {
    id: 'sug_5',
    type: 'cost_optimization',
    category: 'Model Selection',
    title: 'Implement Dynamic Model Routing',
    description: 'Route simple queries to cheaper models and complex ones to premium models. Potential 30% cost reduction.',
    confidence: 0.91,
    impact: 'high',
    difficulty: 'hard',
    estimatedImprovement: 30,
    tags: ['cost', 'routing', 'efficiency'],
    example: 'Use GPT-3.5 for basic questions, GPT-4 for complex analysis, and Claude for creative writing.',
    implementation: [
      'Build query complexity classifier',
      'Create model routing logic',
      'Implement fallback mechanisms'
    ],
    relatedSuggestions: ['sug_3', 'sug_8'],
    timeToImplement: 180,
    isBookmarked: true,
    priority: 9,
    lastUpdated: Date.now() - 5 * 60 * 60 * 1000
  },
  {
    id: 'sug_6',
    type: 'creative_enhancement',
    category: 'Content Generation',
    title: 'Add Creative Mode with Style Templates',
    description: 'Implement style templates for creative writing that can increase user satisfaction by 50%.',
    confidence: 0.83,
    impact: 'medium',
    difficulty: 'medium',
    estimatedImprovement: 50,
    tags: ['creativity', 'templates', 'writing'],
    example: 'Offer styles like "Hemingway", "Shakespeare", "Technical Writer", "Poet" for different writing needs.',
    implementation: [
      'Create style template library',
      'Implement style consistency checking',
      'Add creative enhancement suggestions'
    ],
    relatedSuggestions: ['sug_1', 'sug_4'],
    timeToImplement: 90,
    isBookmarked: false,
    priority: 5,
    lastUpdated: Date.now() - 6 * 60 * 60 * 1000
  }
];

const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    id: 'prompt_optimization',
    name: 'Prompt Optimization',
    icon: PenTool,
    color: 'blue',
    description: 'Enhance your prompts for better AI responses',
    count: MOCK_SUGGESTIONS.filter(s => s.type === 'prompt_optimization').length
  },
  {
    id: 'conversation_improvement',
    name: 'Conversation Flow',
    icon: MessageSquare,
    color: 'green',
    description: 'Improve dialogue engagement and natural flow',
    count: MOCK_SUGGESTIONS.filter(s => s.type === 'conversation_improvement').length
  },
  {
    id: 'performance_boost',
    name: 'Performance',
    icon: Zap,
    color: 'yellow',
    description: 'Speed up responses and optimize resource usage',
    count: MOCK_SUGGESTIONS.filter(s => s.type === 'performance_boost').length
  },
  {
    id: 'user_experience',
    name: 'User Experience',
    icon: Users,
    color: 'purple',
    description: 'Enhance interface and user interaction design',
    count: MOCK_SUGGESTIONS.filter(s => s.type === 'user_experience').length
  },
  {
    id: 'cost_optimization',
    name: 'Cost Efficiency',
    icon: Target,
    color: 'red',
    description: 'Reduce costs while maintaining quality',
    count: MOCK_SUGGESTIONS.filter(s => s.type === 'cost_optimization').length
  },
  {
    id: 'creative_enhancement',
    name: 'Creative Features',
    icon: Palette,
    color: 'pink',
    description: 'Add creative capabilities and style options',
    count: MOCK_SUGGESTIONS.filter(s => s.type === 'creative_enhancement').length
  }
];

interface AIPoweredSuggestionsEngineProps {
  className?: string;
}

export default function AIPoweredSuggestionsEngine({ 
  className = ''
}: AIPoweredSuggestionsEngineProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'impact' | 'confidence' | 'recent'>('priority');
  const [filterBy, setFilterBy] = useState<'all' | 'bookmarked' | 'high_impact' | 'easy'>('all');
  const [suggestions, setSuggestions] = useState(MOCK_SUGGESTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);

  const filteredSuggestions = useMemo(() => {
    let filtered = suggestions;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(s => s.type === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.tags.some(tag => tag.toLowerCase().includes(query)) ||
        s.category.toLowerCase().includes(query)
      );
    }

    // Apply filters
    switch (filterBy) {
      case 'bookmarked':
        filtered = filtered.filter(s => s.isBookmarked);
        break;
      case 'high_impact':
        filtered = filtered.filter(s => s.impact === 'high' || s.impact === 'critical');
        break;
      case 'easy':
        filtered = filtered.filter(s => s.difficulty === 'easy');
        break;
    }

    // Sort suggestions
    switch (sortBy) {
      case 'priority':
        filtered.sort((a, b) => b.priority - a.priority);
        break;
      case 'impact':
        filtered.sort((a, b) => {
          const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return impactOrder[b.impact] - impactOrder[a.impact];
        });
        break;
      case 'confidence':
        filtered.sort((a, b) => b.confidence - a.confidence);
        break;
      case 'recent':
        filtered.sort((a, b) => b.lastUpdated - a.lastUpdated);
        break;
    }

    return filtered;
  }, [suggestions, selectedCategory, searchQuery, sortBy, filterBy]);

  const toggleBookmark = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, isBookmarked: !s.isBookmarked } : s
    ));
  }, []);

  const provideFeedback = useCallback((suggestionId: string, feedback: 'positive' | 'negative') => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId ? { ...s, userFeedback: feedback } : s
    ));
  }, []);

  const generateNewSuggestions = useCallback(async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would call an AI service
    const newSuggestion: AISuggestion = {
      id: `sug_${Date.now()}`,
      type: 'prompt_optimization',
      category: 'AI-Generated',
      title: 'Implement Few-Shot Learning Examples',
      description: 'Add 2-3 examples in your prompts to improve response quality by 40%.',
      confidence: 0.88,
      impact: 'high',
      difficulty: 'easy',
      estimatedImprovement: 40,
      tags: ['few-shot', 'examples', 'quality'],
      example: 'Show examples before asking for similar output',
      implementation: ['Add example section to prompts', 'Create example library'],
      relatedSuggestions: [],
      timeToImplement: 15,
      isBookmarked: false,
      priority: 8,
      lastUpdated: Date.now()
    };

    setSuggestions(prev => [newSuggestion, ...prev]);
    setIsGenerating(false);
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'hard': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const category = SUGGESTION_CATEGORIES.find(c => c.id === categoryId);
    switch (category?.color) {
      case 'blue': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'green': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'yellow': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'purple': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'red': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'pink': return 'text-pink-600 bg-pink-50 dark:bg-pink-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Brain className="w-8 h-8 text-purple-500 mr-3" />
            AI-Powered Suggestions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Intelligent recommendations to optimize your chatbot experience
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={generateNewSuggestions}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Generate New'}</span>
          </button>
        </div>
      </div>

      {/* Categories */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Layers className="w-5 h-5 text-blue-500 mr-2" />
          Suggestion Categories
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUGGESTION_CATEGORIES.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedCategory === category.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <category.icon className={`w-6 h-6 ${
                  selectedCategory === category.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
                }`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {category.count}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                {category.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
            </motion.button>
          ))}
        </div>
      </AnimatedCard>

      {/* Filters and Search */}
      <AnimatedCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search suggestions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select              value={filterBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterBy(e.target.value as 'all' | 'bookmarked' | 'high_impact' | 'easy')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Suggestions</option>
                <option value="bookmarked">Bookmarked</option>
                <option value="high_impact">High Impact</option>
                <option value="easy">Easy to Implement</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
              <select              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'priority' | 'impact' | 'confidence' | 'recent')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="priority">Priority</option>
                <option value="impact">Impact</option>
                <option value="confidence">Confidence</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Suggestions List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredSuggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <AnimatedCard className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {suggestion.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(suggestion.impact)}`}>
                          {suggestion.impact}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(suggestion.difficulty)}`}>
                          {suggestion.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(suggestion.type)}`}>
                          {suggestion.category}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {suggestion.description}
                    </p>

                    {/* Metrics */}
                    <div className="flex items-center space-x-6 mb-4">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          +{suggestion.estimatedImprovement}% improvement
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {(suggestion.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {suggestion.timeToImplement}min to implement
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center space-x-2 mb-4">
                      {suggestion.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedSuggestion === suggestion.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
                        >
                          {/* Example */}
                          {suggestion.example && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Example:</h4>
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
                                {suggestion.example}
                              </div>
                            </div>
                          )}

                          {/* Implementation Steps */}
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Implementation Steps:</h4>
                            <ul className="space-y-1">
                              {suggestion.implementation.map((step, i) => (
                                <li key={i} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                  <span className="text-purple-500 font-medium">{i + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Related Suggestions */}
                          {suggestion.relatedSuggestions.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Related Suggestions:</h4>
                              <div className="flex flex-wrap gap-2">
                                {suggestion.relatedSuggestions.map((relatedId) => {
                                  const related = suggestions.find(s => s.id === relatedId);
                                  return related ? (
                                    <button
                                      key={relatedId}
                                      onClick={() => setExpandedSuggestion(relatedId)}
                                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-xs hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                                    >
                                      {related.title}
                                    </button>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-center space-y-2 ml-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {suggestion.priority}
                      </div>
                      <div className="text-xs text-gray-500">Priority</div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => toggleBookmark(suggestion.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          suggestion.isBookmarked
                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setExpandedSuggestion(
                          expandedSuggestion === suggestion.id ? null : suggestion.id
                        )}
                        className="p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        <ChevronRight className={`w-4 h-4 transition-transform ${
                          expandedSuggestion === suggestion.id ? 'rotate-90' : ''
                        }`} />
                      </button>

                      <div className="flex space-x-1">
                        <button
                          onClick={() => provideFeedback(suggestion.id, 'positive')}
                          className={`p-1 rounded transition-colors ${
                            suggestion.userFeedback === 'positive'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 hover:bg-green-100 hover:text-green-600'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => provideFeedback(suggestion.id, 'negative')}
                          className={`p-1 rounded transition-colors ${
                            suggestion.userFeedback === 'negative'
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 hover:bg-red-100 hover:text-red-600'
                          }`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredSuggestions.length === 0 && (
        <AnimatedCard className="p-12 text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No suggestions found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your filters or search terms, or generate new AI suggestions.
          </p>
          <button
            onClick={generateNewSuggestions}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Generate New Suggestions
          </button>
        </AnimatedCard>      )}
    </div>
  );
}

export { AIPoweredSuggestionsEngine };
