'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Database, 
  Network, 
  Target, 
  Gauge, 
  RefreshCw,
  BarChart3,
  Activity,
  Shield,
  Sparkles,
  Brain,
  Layers,
  MonitorSpeaker
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animations';
import { LineChart as RechartsLineChart, Line, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

// Types
interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  trend: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  category: 'response' | 'throughput' | 'reliability' | 'efficiency';
  lastUpdated: number;
  history: { timestamp: number; value: number }[];
}

interface OptimizationRecommendation {
  id: string;
  type: 'performance' | 'cost' | 'reliability' | 'user_experience';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  estimatedImprovement: number;
  category: string;
  actions: string[];
  isImplemented: boolean;
}

interface ModelBenchmark {
  modelId: string;
  modelName: string;
  avgResponseTime: number;
  throughput: number;
  errorRate: number;
  costPerToken: number;
  qualityScore: number;
  efficiency: number;
  popularityScore: number;
  trend: number;
}

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  latency: number;
  uptime: number;
  errorRate: number;
  requestsPerSecond: number;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  resolved: boolean;
  metric: string;
}

// Mock data
const MOCK_PERFORMANCE_METRICS: PerformanceMetric[] = [
  {
    id: 'response_time',
    name: 'Avg Response Time',
    value: 850,
    unit: 'ms',
    target: 1000,
    trend: -12.5,
    status: 'good',
    category: 'response',
    lastUpdated: Date.now(),
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (24 - i) * 60 * 60 * 1000,
      value: Math.random() * 200 + 700
    }))
  },
  {
    id: 'throughput',
    name: 'Requests/Sec',
    value: 45.6,
    unit: 'req/s',
    target: 50,
    trend: 8.3,
    status: 'good',
    category: 'throughput',
    lastUpdated: Date.now(),
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (24 - i) * 60 * 60 * 1000,
      value: Math.random() * 20 + 35
    }))
  },
  {
    id: 'error_rate',
    name: 'Error Rate',
    value: 0.8,
    unit: '%',
    target: 1.0,
    trend: -2.1,
    status: 'excellent',
    category: 'reliability',
    lastUpdated: Date.now(),
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (24 - i) * 60 * 60 * 1000,
      value: Math.random() * 2
    }))
  },
  {
    id: 'token_efficiency',
    name: 'Token Efficiency',
    value: 92.4,
    unit: '%',
    target: 90,
    trend: 3.7,
    status: 'excellent',
    category: 'efficiency',
    lastUpdated: Date.now(),
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (24 - i) * 60 * 60 * 1000,
      value: Math.random() * 10 + 85
    }))
  }
];

const MOCK_RECOMMENDATIONS: OptimizationRecommendation[] = [
  {
    id: 'rec_1',
    type: 'performance',
    priority: 'high',
    title: 'Implement Response Caching',
    description: 'Cache frequently requested responses to reduce API calls and improve response times.',
    impact: 'Could reduce response time by 40% for repeated queries',
    effort: 'medium',
    estimatedImprovement: 40,
    category: 'Caching',
    actions: ['Set up Redis cache', 'Implement cache invalidation strategy', 'Monitor cache hit rates'],
    isImplemented: false
  },
  {
    id: 'rec_2',
    type: 'cost',
    priority: 'medium',
    title: 'Optimize Model Selection',
    description: 'Use faster, cheaper models for simple queries and reserve premium models for complex tasks.',
    impact: 'Potential 25% cost reduction with minimal quality impact',
    effort: 'high',
    estimatedImprovement: 25,
    category: 'Model Optimization',
    actions: ['Implement query complexity analysis', 'Create model routing logic', 'A/B test model performance'],
    isImplemented: false
  },
  {
    id: 'rec_3',
    type: 'user_experience',
    priority: 'high',
    title: 'Add Streaming Responses',
    description: 'Implement streaming to show partial responses as they generate.',
    impact: 'Improve perceived response time by 60%',
    effort: 'medium',
    estimatedImprovement: 60,
    category: 'User Experience',
    actions: ['Implement SSE streaming', 'Update UI for streaming display', 'Handle stream interruptions'],
    isImplemented: true
  }
];

const MOCK_MODEL_BENCHMARKS: ModelBenchmark[] = [
  {
    modelId: 'gpt-4-turbo',
    modelName: 'GPT-4 Turbo',
    avgResponseTime: 1200,
    throughput: 25.3,
    errorRate: 0.5,
    costPerToken: 0.00003,
    qualityScore: 9.2,
    efficiency: 8.7,
    popularityScore: 9.5,
    trend: 5.2
  },
  {
    modelId: 'claude-3-opus',
    modelName: 'Claude 3 Opus',
    avgResponseTime: 980,
    throughput: 32.1,
    errorRate: 0.3,
    costPerToken: 0.000025,
    qualityScore: 9.0,
    efficiency: 9.1,
    popularityScore: 8.8,
    trend: 8.7
  },
  {
    modelId: 'gemini-pro',
    modelName: 'Gemini Pro',
    avgResponseTime: 750,
    throughput: 45.6,
    errorRate: 0.8,
    costPerToken: 0.00002,
    qualityScore: 8.5,
    efficiency: 9.3,
    popularityScore: 7.9,
    trend: 12.3
  }
];

const MOCK_SYSTEM_HEALTH: SystemHealth = {
  cpu: 68,
  memory: 74,
  disk: 45,
  network: 23,
  latency: 120,
  uptime: 99.97,
  errorRate: 0.8,
  requestsPerSecond: 45.6
};

const MOCK_ALERTS: PerformanceAlert[] = [
  {
    id: 'alert_1',
    type: 'warning',
    title: 'High Memory Usage',
    message: 'Memory usage has exceeded 70% for the past 15 minutes',
    timestamp: Date.now() - 15 * 60 * 1000,
    resolved: false,
    metric: 'memory'
  },
  {
    id: 'alert_2',
    type: 'info',
    title: 'Model Performance Improved',
    message: 'Claude 3 Opus response time improved by 15% after optimization',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    resolved: true,
    metric: 'response_time'
  }
];

interface PerformanceOptimizationDashboardProps {
  className?: string;
}

export default function PerformanceOptimizationDashboard({ className = '' }: PerformanceOptimizationDashboardProps) {
  const [selectedCategory] = useState<'all' | 'response' | 'throughput' | 'reliability' | 'efficiency'>('all');
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'alerts'>('overview');

  const filteredMetrics = useMemo(() => {
    if (selectedCategory === 'all') return MOCK_PERFORMANCE_METRICS;
    return MOCK_PERFORMANCE_METRICS.filter(metric => metric.category === selectedCategory);
  }, [selectedCategory]);

  const performanceScore = useMemo(() => {
    const scores = MOCK_PERFORMANCE_METRICS.map(metric => {
      const normalized = Math.min(metric.value / metric.target, 1.5);
      return metric.category === 'response' ? (2 - normalized) * 50 : normalized * 66.67;
    });
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const handleMetricClick = useCallback((metricId: string) => {
    setSelectedMetric(selectedMetric === metricId ? null : metricId);
  }, [selectedMetric]);

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Zap className="w-8 h-8 text-blue-500 mr-3" />
            Performance Optimization
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time performance monitoring and optimization recommendations
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg border transition-colors ${
              autoRefresh 
                ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-400'
                : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>

          {/* View Mode Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { key: 'overview', label: 'Overview', icon: Gauge },
              { key: 'detailed', label: 'Detailed', icon: BarChart3 },
              { key: 'alerts', label: 'Alerts', icon: AlertTriangle }
            ].map(({ key, label, icon: Icon }) => (              <button
                key={key}
                onClick={() => setViewMode(key as 'overview' | 'detailed' | 'alerts')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  viewMode === key
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Score & Quick Stats */}
      <AnimatedCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Performance Score */}
          <div className="lg:col-span-2">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Overall Performance Score
              </h3>
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - performanceScore / 100)}`}
                    className="text-blue-500 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {performanceScore}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  performanceScore >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  performanceScore >= 70 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  performanceScore >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {performanceScore >= 90 ? 'Excellent' :
                   performanceScore >= 70 ? 'Good' :
                   performanceScore >= 50 ? 'Fair' : 'Needs Improvement'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">850ms</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response</div>
            </motion.div>

            <motion.div
              className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">45.6</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Req/Second</div>
            </motion.div>

            <motion.div
              className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <Target className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">99.2%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
            </motion.div>
          </div>
        </div>
      </AnimatedCard>

      {/* Main Content based on View Mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMetrics.map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleMetricClick(metric.id)}
                  className="cursor-pointer group"
                >
                  <AnimatedCard className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                        {metric.category === 'response' && <Clock className="w-5 h-5" />}
                        {metric.category === 'throughput' && <Activity className="w-5 h-5" />}
                        {metric.category === 'reliability' && <Shield className="w-5 h-5" />}
                        {metric.category === 'efficiency' && <Zap className="w-5 h-5" />}
                      </div>
                      <div className="flex items-center text-sm">
                        {metric.trend > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={metric.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                          {Math.abs(metric.trend).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {metric.name}
                    </h3>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {metric.value.toFixed(1)}<span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          metric.status === 'excellent' ? 'bg-green-500' :
                          metric.status === 'good' ? 'bg-blue-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                      />
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Target: {metric.target}{metric.unit}
                    </div>

                    {/* Miniature chart */}
                    {selectedMetric === metric.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 h-16"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={metric.history.slice(-12)}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={
                                metric.status === 'excellent' ? '#10b981' :
                                metric.status === 'good' ? '#3b82f6' :
                                metric.status === 'warning' ? '#f59e0b' : '#ef4444'
                              }
                              strokeWidth={2}
                              dot={false}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </motion.div>
                    )}
                  </AnimatedCard>
                </motion.div>
              ))}
            </div>

            {/* Model Benchmarks */}
            <AnimatedCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Brain className="w-5 h-5 text-purple-500 mr-2" />
                  Model Performance Benchmarks
                </h3>
                <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  View All Models
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Model</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Response Time</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Throughput</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Quality</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Efficiency</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_MODEL_BENCHMARKS.map((model, index) => (
                      <motion.tr
                        key={model.modelId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900 dark:text-white">{model.modelName}</div>
                          <div className="text-sm text-gray-500">Cost: ${(model.costPerToken * 1000).toFixed(4)}/1k</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900 dark:text-white">{model.avgResponseTime}ms</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900 dark:text-white">{model.throughput} req/s</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${model.qualityScore * 10}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white">{model.qualityScore}/10</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${model.efficiency * 10}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white">{model.efficiency}/10</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {model.trend > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span className={`text-sm ${model.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {model.trend > 0 ? '+' : ''}{model.trend.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AnimatedCard>

            {/* Optimization Recommendations */}
            {showRecommendations && (
              <AnimatedCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
                    AI-Powered Optimization Recommendations
                  </h3>
                  <button
                    onClick={() => setShowRecommendations(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  {MOCK_RECOMMENDATIONS.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${
                        rec.isImplemented
                          ? 'bg-green-50 border-green-500 dark:bg-green-900/20'
                          : 'bg-white border-blue-500 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{rec.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                              {rec.priority}
                            </span>
                            {rec.isImplemented && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rec.description}</p>
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{rec.impact}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            +{rec.estimatedImprovement}%
                          </div>
                          <div className="text-xs text-gray-500">Improvement</div>
                        </div>
                      </div>

                      {!rec.isImplemented && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Effort: <span className="font-medium">{rec.effort}</span>
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Category: <span className="font-medium">{rec.category}</span>
                              </span>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                              Implement
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </AnimatedCard>
            )}
          </motion.div>
        )}

        {viewMode === 'detailed' && (
          <motion.div
            key="detailed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* System Health Dashboard */}
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <MonitorSpeaker className="w-5 h-5 text-blue-500 mr-2" />
                System Health Monitor
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'CPU Usage', value: MOCK_SYSTEM_HEALTH.cpu, icon: Cpu, color: 'blue' },                  { label: 'Memory', value: MOCK_SYSTEM_HEALTH.memory, icon: Database, color: 'green' },
                  { label: 'Disk I/O', value: MOCK_SYSTEM_HEALTH.disk, icon: Layers, color: 'purple' },
                  { label: 'Network', value: MOCK_SYSTEM_HEALTH.network, icon: Network, color: 'yellow' }
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - item.value / 100)}`}
                          className={`transition-all duration-1000 ${
                            item.color === 'blue' ? 'text-blue-500' :
                            item.color === 'green' ? 'text-green-500' :
                            item.color === 'purple' ? 'text-purple-500' : 'text-yellow-500'
                          }`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <item.icon className={`w-6 h-6 ${
                          item.color === 'blue' ? 'text-blue-500' :
                          item.color === 'green' ? 'text-green-500' :
                          item.color === 'purple' ? 'text-purple-500' : 'text-yellow-500'
                        }`} />
                      </div>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{item.value}%</div>
                  </div>
                ))}
              </div>
            </AnimatedCard>

            {/* Detailed Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMetrics.map((metric) => (
                <AnimatedCard key={metric.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">{metric.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>

                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metric.history}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
                        <XAxis 
                          dataKey="timestamp"
                          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                          className="text-gray-600 dark:text-gray-400"
                        />
                        <YAxis className="text-gray-600 dark:text-gray-400" />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleString()}
                          formatter={(value) => [`${value} ${metric.unit}`, metric.name]}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={
                            metric.status === 'excellent' ? '#10b981' :
                            metric.status === 'good' ? '#3b82f6' :
                            metric.status === 'warning' ? '#f59e0b' : '#ef4444'
                          }
                          fill={
                            metric.status === 'excellent' ? '#10b981' :
                            metric.status === 'good' ? '#3b82f6' :
                            metric.status === 'warning' ? '#f59e0b' : '#ef4444'
                          }
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </motion.div>
        )}

        {viewMode === 'alerts' && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                Performance Alerts & Notifications
              </h3>

              <div className="space-y-4">
                {MOCK_ALERTS.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.type === 'error' ? 'bg-red-50 border-red-500 dark:bg-red-900/20' :
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20' :
                      'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {alert.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />}
                        {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />}
                        {alert.type === 'info' && <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />}
                        
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {alert.resolved ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">
                            Resolved
                          </span>
                        ) : (
                          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs">
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedCard>
          </motion.div>
        )}      </AnimatePresence>
    </div>
  );
}

export { PerformanceOptimizationDashboard };
