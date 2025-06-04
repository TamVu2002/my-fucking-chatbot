'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Clock, 
  DollarSign, 
  Target, 
  Star, 
  BarChart3, 
  Gauge, 
  Search, 
  RefreshCw, 
  Download, 
  Share2, 
  Plus,
  Check,
  X,
  Play
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Types
interface ModelMetrics {
  id: string;
  name: string;
  provider: string;
  version: string;
  category: 'text' | 'code' | 'creative' | 'analytical' | 'multimodal';
  pricing: {
    inputTokens: number; // per 1M tokens
    outputTokens: number; // per 1M tokens
    requestBased?: number; // per request
  };
  performance: {
    responseTime: number; // ms
    throughput: number; // tokens/second
    uptime: number; // percentage
    errorRate: number; // percentage
  };
  quality: {
    accuracy: number; // 0-100
    creativity: number; // 0-100
    coherence: number; // 0-100
    safety: number; // 0-100
    bias: number; // 0-100 (lower is better)
  };
  capabilities: {
    maxTokens: number;
    contextWindow: number;
    multimodal: boolean;
    streaming: boolean;
    functions: boolean;
    fineTuning: boolean;
  };
  benchmarks: {
    mmlu: number; // Massive Multitask Language Understanding
    hellaswag: number; // Commonsense reasoning
    humaneval: number; // Code generation
    gsm8k: number; // Grade school math
    truthfulqa: number; // Truthfulness
  };
  usage: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    userSatisfaction: number; // 0-5
    popularityRank: number;
  };
  lastUpdated: number;
  isActive: boolean;
  tags: string[];
}

interface ComparisonTest {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedOutput?: string;
  evaluationCriteria: string[];
  isRunning: boolean;
  results: {
    [modelId: string]: {
      response: string;
      responseTime: number;
      tokenCount: number;
      cost: number;
      score: number;
      timestamp: number;
    };
  };
}

// Mock Data
const MOCK_MODELS: ModelMetrics[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    version: '1106-preview',
    category: 'text',
    pricing: {
      inputTokens: 10,
      outputTokens: 30
    },
    performance: {
      responseTime: 1250,
      throughput: 85,
      uptime: 99.7,
      errorRate: 0.3
    },
    quality: {
      accuracy: 94,
      creativity: 92,
      coherence: 96,
      safety: 98,
      bias: 15
    },
    capabilities: {
      maxTokens: 4096,
      contextWindow: 128000,
      multimodal: true,
      streaming: true,
      functions: true,
      fineTuning: false
    },
    benchmarks: {
      mmlu: 86.4,
      hellaswag: 95.3,
      humaneval: 67.0,
      gsm8k: 92.0,
      truthfulqa: 59.0
    },
    usage: {
      totalRequests: 15420,
      totalTokens: 2450000,
      totalCost: 456.78,
      userSatisfaction: 4.6,
      popularityRank: 1
    },
    lastUpdated: Date.now() - 2 * 60 * 60 * 1000,
    isActive: true,
    tags: ['flagship', 'multimodal', 'latest']
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    version: '20240229',
    category: 'text',
    pricing: {
      inputTokens: 15,
      outputTokens: 75
    },
    performance: {
      responseTime: 980,
      throughput: 92,
      uptime: 99.9,
      errorRate: 0.2
    },
    quality: {
      accuracy: 96,
      creativity: 94,
      coherence: 98,
      safety: 99,
      bias: 12
    },
    capabilities: {
      maxTokens: 4096,
      contextWindow: 200000,
      multimodal: true,
      streaming: true,
      functions: false,
      fineTuning: false
    },
    benchmarks: {
      mmlu: 86.8,
      hellaswag: 95.4,
      humaneval: 84.9,
      gsm8k: 95.0,
      truthfulqa: 83.0
    },
    usage: {
      totalRequests: 12380,
      totalTokens: 1950000,
      totalCost: 567.23,
      userSatisfaction: 4.8,
      popularityRank: 2
    },
    lastUpdated: Date.now() - 1 * 60 * 60 * 1000,
    isActive: true,
    tags: ['high-quality', 'safety', 'reasoning']
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    version: '1.0',
    category: 'multimodal',
    pricing: {
      inputTokens: 2.5,
      outputTokens: 7.5
    },
    performance: {
      responseTime: 750,
      throughput: 120,
      uptime: 99.5,
      errorRate: 0.5
    },
    quality: {
      accuracy: 88,
      creativity: 87,
      coherence: 89,
      safety: 95,
      bias: 18
    },
    capabilities: {
      maxTokens: 8192,
      contextWindow: 32000,
      multimodal: true,
      streaming: true,
      functions: true,
      fineTuning: false
    },
    benchmarks: {
      mmlu: 83.7,
      hellaswag: 87.8,
      humaneval: 67.7,
      gsm8k: 86.5,
      truthfulqa: 71.8
    },
    usage: {
      totalRequests: 8950,
      totalTokens: 1320000,
      totalCost: 198.45,
      userSatisfaction: 4.2,
      popularityRank: 3
    },
    lastUpdated: Date.now() - 3 * 60 * 60 * 1000,
    isActive: true,
    tags: ['multimodal', 'fast', 'affordable']
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    version: '0125',
    category: 'text',
    pricing: {
      inputTokens: 0.5,
      outputTokens: 1.5
    },
    performance: {
      responseTime: 450,
      throughput: 150,
      uptime: 99.8,
      errorRate: 0.4
    },
    quality: {
      accuracy: 82,
      creativity: 79,
      coherence: 85,
      safety: 92,
      bias: 22
    },
    capabilities: {
      maxTokens: 4096,
      contextWindow: 16385,
      multimodal: false,
      streaming: true,
      functions: true,
      fineTuning: true
    },
    benchmarks: {
      mmlu: 70.0,
      hellaswag: 85.5,
      humaneval: 48.1,
      gsm8k: 57.1,
      truthfulqa: 47.0
    },
    usage: {
      totalRequests: 25670,
      totalTokens: 3240000,
      totalCost: 89.12,
      userSatisfaction: 4.0,
      popularityRank: 4
    },
    lastUpdated: Date.now() - 4 * 60 * 60 * 1000,
    isActive: true,
    tags: ['affordable', 'fast', 'reliable']
  }
];

const MOCK_COMPARISON_TESTS: ComparisonTest[] = [
  {
    id: 'test_1',
    name: 'Creative Writing',
    description: 'Generate a creative short story about a time traveler',
    prompt: 'Write a 200-word creative short story about a time traveler who discovers they can only travel to their own past mistakes.',
    category: 'Creative',
    difficulty: 'medium',
    evaluationCriteria: ['Creativity', 'Narrative structure', 'Character development', 'Originality'],
    isRunning: false,
    results: {
      'gpt-4-turbo': {
        response: 'Sarah stared at the brass pocket watch, its hands frozen at 3:47. The moment she\'d said those cruel words to her mother...',
        responseTime: 1200,
        tokenCount: 180,
        cost: 0.0054,
        score: 92,
        timestamp: Date.now() - 30 * 60 * 1000
      },
      'claude-3-opus': {
        response: 'The device hummed with temporal energy as Marcus calibrated the coordinates. Each journey backward led only to his failures...',
        responseTime: 980,
        tokenCount: 195,
        cost: 0.014625,
        score: 96,
        timestamp: Date.now() - 30 * 60 * 1000
      }
    }
  },
  {
    id: 'test_2',
    name: 'Code Generation',
    description: 'Create a Python function for data analysis',
    prompt: 'Write a Python function that takes a pandas DataFrame and returns the top 5 correlations between numeric columns, excluding self-correlations.',
    category: 'Code',
    difficulty: 'hard',
    evaluationCriteria: ['Correctness', 'Efficiency', 'Code quality', 'Documentation'],
    isRunning: false,
    results: {
      'gpt-4-turbo': {
        response: 'def top_correlations(df, n=5):\n    """Return top n correlations between numeric columns"""\n    numeric_cols = df.select_dtypes(include=[np.number]).columns...',
        responseTime: 1450,
        tokenCount: 220,
        cost: 0.0066,
        score: 88,
        timestamp: Date.now() - 45 * 60 * 1000
      }
    }
  }
];

interface AdvancedModelComparisonProps {
  className?: string;
}

export default function AdvancedModelComparison({ className = '' }: AdvancedModelComparisonProps) {
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4-turbo', 'claude-3-opus']);
  const [comparisonView, setComparisonView] = useState<'overview' | 'benchmarks' | 'costs' | 'tests'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'text' | 'code' | 'creative' | 'analytical' | 'multimodal'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'cost' | 'quality' | 'popularity'>('popularity');
  const [showInactive, setShowInactive] = useState(false);
  const [comparisonTests, setComparisonTests] = useState(MOCK_COMPARISON_TESTS);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const filteredModels = useMemo(() => {
    const filtered = MOCK_MODELS.filter(model => {
      if (!showInactive && !model.isActive) return false;
      if (filterCategory !== 'all' && model.category !== filterCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return model.name.toLowerCase().includes(query) ||
               model.provider.toLowerCase().includes(query) ||
               model.tags.some(tag => tag.toLowerCase().includes(query));
      }
      return true;
    });

    // Sort models
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'performance':
          return b.performance.throughput - a.performance.throughput;
        case 'cost':
          return a.pricing.inputTokens - b.pricing.inputTokens;
        case 'quality':
          return b.quality.accuracy - a.quality.accuracy;
        case 'popularity':
          return a.usage.popularityRank - b.usage.popularityRank;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, filterCategory, sortBy, showInactive]);
  const selectedModelData = useMemo(() => {
    return selectedModels.map(id => MOCK_MODELS.find(m => m.id === id)).filter((model): model is ModelMetrics => !!model);
  }, [selectedModels]);

  const toggleModelSelection = useCallback((modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else if (prev.length < 4) { // Limit to 4 models for comparison
        return [...prev, modelId];
      }
      return prev;
    });
  }, []);

  const runComparisonTest = useCallback(async (testId: string) => {
    setIsRunningTests(true);
    setComparisonTests(prev => prev.map(test => 
      test.id === testId ? { ...test, isRunning: true } : test
    ));

    // Simulate running tests on selected models
    await new Promise(resolve => setTimeout(resolve, 3000));

    setComparisonTests(prev => prev.map(test => {
      if (test.id === testId) {
        const newResults = { ...test.results };
        selectedModels.forEach(modelId => {
          if (!newResults[modelId]) {
            newResults[modelId] = {
              response: `Sample response from ${MOCK_MODELS.find(m => m.id === modelId)?.name}...`,
              responseTime: Math.random() * 2000 + 500,
              tokenCount: Math.floor(Math.random() * 200) + 150,
              cost: Math.random() * 0.02,
              score: Math.floor(Math.random() * 30) + 70,
              timestamp: Date.now()
            };
          }
        });
        return { ...test, isRunning: false, results: newResults };
      }
      return test;
    }));

    setIsRunningTests(false);
  }, [selectedModels]);

  const getQualityRadarData = useMemo(() => {
    return selectedModelData.map(model => ({
      model: model.name,
      accuracy: model.quality.accuracy,
      creativity: model.quality.creativity,
      coherence: model.quality.coherence,
      safety: model.quality.safety,
      bias: 100 - model.quality.bias // Invert bias for better visualization
    }));
  }, [selectedModelData]);  const getBenchmarkData = useMemo(() => {
    return Object.keys(selectedModelData[0]?.benchmarks || {}).map(benchmark => {
      const data: { benchmark: string; [key: string]: string | number } = { benchmark: benchmark.toUpperCase() };
      selectedModelData.forEach(model => {
        data[model.name] = model.benchmarks[benchmark as keyof typeof model.benchmarks];
      });
      return data;
    });
  }, [selectedModelData]);

  const getCostComparisonData = useMemo(() => {
    return selectedModelData.map(model => ({
      name: model.name,
      inputCost: model.pricing.inputTokens,
      outputCost: model.pricing.outputTokens,
      totalUsageCost: model.usage.totalCost
    }));
  }, [selectedModelData]);

  const renderOverviewComparison = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Model</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Response Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Throughput</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Uptime</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Error Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">User Rating</th>
              </tr>
            </thead>
            <tbody>
              {selectedModelData.map((model, index) => (
                <motion.tr
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{model.name}</div>
                        <div className="text-sm text-gray-500">{model.provider}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">{model.performance.responseTime}ms</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-gray-900 dark:text-white">{model.performance.throughput} tok/s</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${model.performance.uptime}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{model.performance.uptime}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      model.performance.errorRate < 0.5 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {model.performance.errorRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-gray-900 dark:text-white">{model.usage.userSatisfaction}/5</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedCard>

      {/* Quality Radar Chart */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quality Assessment</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={getQualityRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              {selectedModelData.map((model, index) => (
                <Radar
                  key={model.id}
                  name={model.name}
                  dataKey={model.name}
                  stroke={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]}
                  fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]}
                  fillOpacity={0.1}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </AnimatedCard>

      {/* Capabilities Comparison */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Capabilities</h3>        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {selectedModelData.map((model) => (
            <div key={model.id} className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">{model.name}</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Context Window</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(model.capabilities.contextWindow / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Max Tokens</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(model.capabilities.maxTokens / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Multimodal</span>
                  {model.capabilities.multimodal ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Streaming</span>
                  {model.capabilities.streaming ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Functions</span>
                  {model.capabilities.functions ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Fine-tuning</span>
                  {model.capabilities.fineTuning ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>
    </div>
  );

  const renderBenchmarkComparison = () => (
    <AnimatedCard className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Benchmark Scores</h3>
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getBenchmarkData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="benchmark" />
            <YAxis />
            <Tooltip />
            {selectedModelData.map((model, index) => (
              <Bar
                key={model.id}
                dataKey={model.name}
                fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Benchmark Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(selectedModelData[0]?.benchmarks || {}).map(([benchmark]) => (
          <div key={benchmark} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {benchmark.toUpperCase()}
            </h4>
            <div className="space-y-2">
              {selectedModelData.map((model) => (
                <div key={model.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{model.name}</span>                  <span className="font-medium text-gray-900 dark:text-white">
                    {(model.benchmarks[benchmark as keyof typeof model.benchmarks] as number).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AnimatedCard>
  );

  const renderCostComparison = () => (
    <div className="space-y-6">
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost Analysis</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getCostComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Bar dataKey="inputCost" name="Input (per 1M tokens)" fill="#3b82f6" />
              <Bar dataKey="outputCost" name="Output (per 1M tokens)" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnimatedCard>

      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage Costs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Model</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total Requests</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total Tokens</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Total Cost</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Cost per Token</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Cost per Request</th>
              </tr>
            </thead>
            <tbody>
              {selectedModelData.map((model) => (
                <tr key={model.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{model.name}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {model.usage.totalRequests.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {(model.usage.totalTokens / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    ${model.usage.totalCost.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    ${((model.usage.totalCost / model.usage.totalTokens) * 1000).toFixed(6)}/1K
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    ${(model.usage.totalCost / model.usage.totalRequests).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedCard>
    </div>
  );

  const renderTestComparison = () => (
    <div className="space-y-6">
      {/* Test Controls */}
      <AnimatedCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Comparison Tests
          </h3>
          <button
            onClick={() => {/* Add new test */}}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Test</span>
          </button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Selected Models: {selectedModels.map(id => MOCK_MODELS.find(m => m.id === id)?.name).join(', ')}
        </div>
      </AnimatedCard>

      {/* Test Results */}
      {comparisonTests.map((test) => (
        <AnimatedCard key={test.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{test.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{test.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                test.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {test.difficulty}
              </span>
              <button
                onClick={() => runComparisonTest(test.id)}
                disabled={test.isRunning || isRunningTests}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {test.isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Test</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Test Prompt */}
          <div className="mb-4">
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Test Prompt:</h5>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
              {test.prompt}
            </div>
          </div>

          {/* Results */}
          {Object.keys(test.results).length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Results:</h5>
              <div className="space-y-4">
                {selectedModels.map((modelId) => {
                  const result = test.results[modelId];
                  const model = MOCK_MODELS.find(m => m.id === modelId);
                  
                  if (!result || !model) return null;

                  return (
                    <div key={modelId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="font-medium text-gray-900 dark:text-white">{model.name}</h6>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Score: <strong className="text-gray-900 dark:text-white">{result.score}/100</strong></span>
                          <span>Time: <strong>{result.responseTime}ms</strong></span>
                          <span>Cost: <strong>${result.cost.toFixed(4)}</strong></span>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm text-gray-700 dark:text-gray-300">
                        {result.response}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </AnimatedCard>
      ))}
    </div>
  );

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Brain className="w-8 h-8 text-blue-500 mr-3" />
            Advanced Model Comparison
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analysis and benchmarking of AI models
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <AnimatedCard className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'all' | 'text' | 'code' | 'creative' | 'analytical' | 'multimodal')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Categories</option>
              <option value="text">Text</option>
              <option value="code">Code</option>
              <option value="creative">Creative</option>
              <option value="analytical">Analytical</option>
              <option value="multimodal">Multimodal</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'performance' | 'cost' | 'quality' | 'popularity')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="popularity">Popularity</option>
              <option value="name">Name</option>
              <option value="performance">Performance</option>
              <option value="cost">Cost</option>
              <option value="quality">Quality</option>
            </select>

            <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span>Show inactive</span>
            </label>
          </div>
        </div>
      </AnimatedCard>

      {/* Model Selection */}
      <AnimatedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Models to Compare (max 4)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredModels.map((model) => (
            <motion.button
              key={model.id}
              onClick={() => toggleModelSelection(model.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedModels.includes(model.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{model.name}</h4>
                {selectedModels.includes(model.id) && (
                  <Check className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{model.provider}</p>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{model.category}</span>
                <Star className="w-3 h-3 text-yellow-500" />
                <span>{model.usage.userSatisfaction}/5</span>
              </div>
            </motion.button>
          ))}
        </div>
      </AnimatedCard>

      {/* Comparison Views */}
      {selectedModels.length > 0 && (
        <>
          {/* View Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { key: 'overview', label: 'Overview', icon: Gauge },
              { key: 'benchmarks', label: 'Benchmarks', icon: BarChart3 },
              { key: 'costs', label: 'Costs', icon: DollarSign },
              { key: 'tests', label: 'Tests', icon: Target }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setComparisonView(key as 'overview' | 'benchmarks' | 'costs' | 'tests')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                  comparisonView === key
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Comparison Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={comparisonView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {comparisonView === 'overview' && renderOverviewComparison()}
              {comparisonView === 'benchmarks' && renderBenchmarkComparison()}
              {comparisonView === 'costs' && renderCostComparison()}
              {comparisonView === 'tests' && renderTestComparison()}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {/* Empty State */}
      {selectedModels.length === 0 && (
        <AnimatedCard className="p-12 text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Select Models to Compare
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Choose up to 4 models from the list above to start comparing their performance, costs, and capabilities.
          </p>
        </AnimatedCard>      )}
    </div>
  );
}

export { AdvancedModelComparison };
