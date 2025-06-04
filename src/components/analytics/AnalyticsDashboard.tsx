'use client';
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock, 
  Zap,
  Target,
  Award,
  Activity,
  PieChart,
  Filter
} from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animations';
import TokenUsageChart from '@/components/analytics/TokenUsageChart';
import type { TokenUsage } from '@/components/analytics/TokenUsageChart';

interface AnalyticsData {
  tokenUsage: TokenUsage[];
  chatSessions: ChatSession[];
  userMetrics: UserMetrics;
  modelPerformance: ModelPerformance[];
  timeMetrics: TimeMetrics;
}

interface ChatSession {
  id: string;
  startTime: number;
  endTime: number;
  messageCount: number;
  tokensUsed: number;
  model: string;
  userSatisfaction?: number;
  category: string;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  avgSessionDuration: number;
  engagementScore: number;
}

interface ModelPerformance {
  modelId: string;
  modelName: string;
  totalRequests: number;
  avgResponseTime: number;
  successRate: number;
  avgTokensPerRequest: number;
  userSatisfaction: number;
  cost: number;
}

interface TimeMetrics {
  avgResponseTime: number;
  avgTokenGenerationRate: number;
  peakUsageHours: number[];
  systemUptime: number;
}

// Mock data for demonstration
const MOCK_ANALYTICS_DATA: AnalyticsData = {
  tokenUsage: Array.from({ length: 30 }, (_, i) => ({
    timestamp: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
    inputTokens: Math.floor(Math.random() * 1000) + 500,
    outputTokens: Math.floor(Math.random() * 1500) + 800,
    totalTokens: 0,
    cost: Math.random() * 0.5,
    model: ['gpt-4', 'claude-3', 'gemini-pro'][Math.floor(Math.random() * 3)],
    conversationId: `conv-${i}`
  })).map(item => ({ ...item, totalTokens: item.inputTokens + item.outputTokens })),
  
  chatSessions: Array.from({ length: 100 }, (_, i) => ({
    id: `session-${i}`,
    startTime: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
    endTime: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 + Math.random() * 60 * 60 * 1000,
    messageCount: Math.floor(Math.random() * 20) + 1,
    tokensUsed: Math.floor(Math.random() * 5000) + 1000,
    model: ['gpt-4', 'claude-3', 'gemini-pro'][Math.floor(Math.random() * 3)],
    userSatisfaction: Math.random() * 2 + 3, // 3-5 stars
    category: ['coding', 'writing', 'analysis', 'creative'][Math.floor(Math.random() * 4)]
  })),
  
  userMetrics: {
    totalUsers: 1250,
    activeUsers: 890,
    newUsers: 45,
    retentionRate: 0.78,
    avgSessionDuration: 15.5,
    engagementScore: 8.2
  },
  
  modelPerformance: [
    {
      modelId: 'gpt-4',
      modelName: 'GPT-4 Turbo',
      totalRequests: 2150,
      avgResponseTime: 1250,
      successRate: 0.98,
      avgTokensPerRequest: 1200,
      userSatisfaction: 4.5,
      cost: 125.50
    },
    {
      modelId: 'claude-3',
      modelName: 'Claude 3 Opus',
      totalRequests: 1850,
      avgResponseTime: 980,
      successRate: 0.97,
      avgTokensPerRequest: 1100,
      userSatisfaction: 4.6,
      cost: 98.20
    },
    {
      modelId: 'gemini-pro',
      modelName: 'Gemini Pro',
      totalRequests: 950,
      avgResponseTime: 850,
      successRate: 0.95,
      avgTokensPerRequest: 900,
      userSatisfaction: 4.2,
      cost: 42.30
    }
  ],
  
  timeMetrics: {
    avgResponseTime: 1100,
    avgTokenGenerationRate: 85,
    peakUsageHours: [9, 10, 14, 15, 20, 21],
    systemUptime: 0.999
  }
};

interface AnalyticsDashboardProps {
  data?: AnalyticsData;
  className?: string;
}

export default function AnalyticsDashboard({ data = MOCK_ANALYTICS_DATA, className = '' }: AnalyticsDashboardProps) {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'usage' | 'performance' | 'users'>('usage');

  const aggregatedStats = useMemo(() => {
    const totalTokens = data.tokenUsage.reduce((sum, item) => sum + item.totalTokens, 0);
    const totalCost = data.tokenUsage.reduce((sum, item) => sum + item.cost, 0);
    const totalSessions = data.chatSessions.length;
    const avgSatisfaction = data.chatSessions
      .filter(s => s.userSatisfaction)
      .reduce((sum, s) => sum + (s.userSatisfaction || 0), 0) / 
      data.chatSessions.filter(s => s.userSatisfaction).length;

    return {
      totalTokens,
      totalCost,
      totalSessions,
      avgSatisfaction,
      costPerToken: totalTokens > 0 ? totalCost / totalTokens : 0,
      tokensPerSession: totalSessions > 0 ? totalTokens / totalSessions : 0
    };
  }, [data]);

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into your chatbot performance
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />            <select
              value={timeframe}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeframe(e.target.value as '24h' | '7d' | '30d')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { key: 'usage', label: 'Usage', icon: BarChart3 },
              { key: 'performance', label: 'Performance', icon: TrendingUp },
              { key: 'users', label: 'Users', icon: Users }
            ].map(({ key, label, icon: Icon }) => (              <button
                key={key}
                onClick={() => setSelectedMetric(key as 'usage' | 'performance' | 'users')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  selectedMetric === key
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Tokens"
          value={aggregatedStats.totalTokens.toLocaleString()}
          change={12.5}
          icon={Zap}
          color="blue"
        />
        <KPICard
          title="Total Cost"
          value={`$${aggregatedStats.totalCost.toFixed(2)}`}
          change={-3.2}
          icon={BarChart3}
          color="green"
        />
        <KPICard
          title="Active Sessions"
          value={data.userMetrics.activeUsers.toLocaleString()}
          change={8.1}
          icon={MessageSquare}
          color="purple"
        />
        <KPICard
          title="Avg Satisfaction"
          value={aggregatedStats.avgSatisfaction.toFixed(1)}
          change={5.7}
          icon={Award}
          color="yellow"
          suffix="/5"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Usage Chart */}
        <div className="lg:col-span-2">
          <TokenUsageChart
            data={data.tokenUsage}
            type="area"
            timeframe={timeframe}
          />
        </div>

        {/* Model Performance */}
        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Model Performance
            </h3>
            <Target className="w-5 h-5 text-blue-500" />
          </div>

          <div className="space-y-4">
            {data.modelPerformance.map((model, index) => (
              <motion.div
                key={model.modelId}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {model.modelName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {model.totalRequests} requests • {model.avgResponseTime}ms avg
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {model.userSatisfaction.toFixed(1)}/5
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ${model.cost.toFixed(2)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>

        {/* User Activity */}
        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              User Activity
            </h3>
            <Activity className="w-5 h-5 text-green-500" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Users</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.userMetrics.totalUsers.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Users</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.userMetrics.activeUsers.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">New Users</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                +{data.userMetrics.newUsers}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Retention Rate</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {(data.userMetrics.retentionRate * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Avg Session</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.userMetrics.avgSessionDuration.toFixed(1)}m
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Engagement Score</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {data.userMetrics.engagementScore.toFixed(1)}/10
              </span>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Response Time Distribution */}
        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Response Times
            </h3>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Average</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.timeMetrics.avgResponseTime}ms
              </span>
            </div>
            
            <div className="space-y-2">
              {data.modelPerformance.map((model) => (
                <div key={model.modelId} className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${(model.avgResponseTime / Math.max(...data.modelPerformance.map(m => m.avgResponseTime))) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-16">
                    {model.avgResponseTime}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedCard>

        {/* Cost Analysis */}
        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cost Analysis
            </h3>
            <PieChart className="w-5 h-5 text-red-500" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Cost per Token</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${(aggregatedStats.costPerToken * 1000).toFixed(4)}/1k
              </span>
            </div>

            <div className="space-y-2">
              {data.modelPerformance.map((model) => (
                <div key={model.modelId} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {model.modelName}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${model.cost.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedCard>

        {/* System Health */}
        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              System Health
            </h3>
            <Activity className="w-5 h-5 text-green-500" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Uptime</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {(data.timeMetrics.systemUptime * 100).toFixed(2)}%
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Token Gen Rate</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.timeMetrics.avgTokenGenerationRate} tokens/s
              </span>
            </div>

            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Peak Hours</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.timeMetrics.peakUsageHours.map((hour) => (
                  <span
                    key={hour}
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
                  >
                    {hour}:00
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: 'blue' | 'green' | 'purple' | 'yellow';
  suffix?: string;
}

function KPICard({ title, value, change, icon: Icon, color, suffix = '' }: KPICardProps) {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    yellow: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
  };

  return (
    <AnimatedCard className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}{suffix}
          </p>
          <div className="flex items-center mt-2">
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <motion.div
                animate={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
              </motion.div>
            )}
            <span className={`text-sm font-medium ${
              change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>    </AnimatedCard>
  );
}

export { AnalyticsDashboard };
