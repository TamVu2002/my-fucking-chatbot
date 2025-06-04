'use client';
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, DollarSign, Clock, Zap } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export interface TokenUsage {
  timestamp: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  model: string;
  conversationId: string;
}

interface TokenUsageChartProps {
  data: TokenUsage[];
  type?: 'line' | 'bar' | 'area' | 'pie';
  timeframe?: '1h' | '24h' | '7d' | '30d';
  className?: string;
}

const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6'
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.danger, COLORS.info, COLORS.purple];

export default function TokenUsageChart({ 
  data, 
  type = 'line', 
  timeframe = '24h',
  className = '' 
}: TokenUsageChartProps) {
  const { theme } = useAppSettings();
  const isDark = theme === 'dark';

  const processedData = useMemo(() => {
    if (!data.length) return [];

    const now = Date.now();
    const timeframes = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const cutoff = now - timeframes[timeframe];
    const filteredData = data.filter(item => item.timestamp >= cutoff);

    // Group by time intervals
    const interval = timeframes[timeframe] / 20; // 20 data points
    const grouped = filteredData.reduce((acc, item) => {
      const intervalStart = Math.floor(item.timestamp / interval) * interval;
      if (!acc[intervalStart]) {
        acc[intervalStart] = {
          timestamp: intervalStart,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          cost: 0,
          count: 0
        };
      }
      acc[intervalStart].inputTokens += item.inputTokens;
      acc[intervalStart].outputTokens += item.outputTokens;
      acc[intervalStart].totalTokens += item.totalTokens;
      acc[intervalStart].cost += item.cost;
      acc[intervalStart].count += 1;
      return acc;
    }, {} as Record<number, any>);

    return Object.values(grouped).map(item => ({
      ...item,
      time: new Date(item.timestamp).toLocaleTimeString(),
      date: new Date(item.timestamp).toLocaleDateString()
    }));
  }, [data, timeframe]);

  const modelUsage = useMemo(() => {
    const modelStats = data.reduce((acc, item) => {
      if (!acc[item.model]) {
        acc[item.model] = {
          name: item.model,
          totalTokens: 0,
          cost: 0,
          requests: 0
        };
      }
      acc[item.model].totalTokens += item.totalTokens;
      acc[item.model].cost += item.cost;
      acc[item.model].requests += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(modelStats);
  }, [data]);

  const totalStats = useMemo(() => {
    const total = data.reduce((acc, item) => ({
      totalTokens: acc.totalTokens + item.totalTokens,
      totalCost: acc.totalCost + item.cost,
      totalRequests: acc.totalRequests + 1
    }), { totalTokens: 0, totalCost: 0, totalRequests: 0 });

    const avgTokensPerRequest = total.totalRequests > 0 ? total.totalTokens / total.totalRequests : 0;
    const avgCostPerRequest = total.totalRequests > 0 ? total.totalCost / total.totalRequests : 0;

    return {
      ...total,
      avgTokensPerRequest,
      avgCostPerRequest
    };
  }, [data]);

  const renderChart = () => {
    const chartProps = {
      data: processedData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="time" 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              fontSize={12}
            />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: isDark ? '#f3f4f6' : '#1f2937'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="totalTokens" 
              stroke={COLORS.primary} 
              strokeWidth={2}
              dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="cost" 
              stroke={COLORS.secondary} 
              strokeWidth={2}
              dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 4 }}
              yAxisId="right"
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="time" 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              fontSize={12}
            />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: isDark ? '#f3f4f6' : '#1f2937'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="inputTokens" 
              stackId="1"
              stroke={COLORS.primary} 
              fill={COLORS.primary}
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="outputTokens" 
              stackId="1"
              stroke={COLORS.secondary} 
              fill={COLORS.secondary}
              fillOpacity={0.6}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="time" 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              fontSize={12}
            />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: isDark ? '#f3f4f6' : '#1f2937'
              }}
            />
            <Bar dataKey="totalTokens" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={modelUsage}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="totalTokens"
            >
              {modelUsage.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PIE_COLORS[index % PIE_COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: isDark ? '#f3f4f6' : '#1f2937'
              }}
            />
          </PieChart>
        );      default:
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="time" 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              fontSize={12}
            />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: isDark ? '#f3f4f6' : '#1f2937'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="totalTokens" 
              stroke={COLORS.primary} 
              strokeWidth={2}
              dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Token Usage Analytics
          </h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last {timeframe}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400">Total Tokens</p>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {totalStats.totalTokens.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>        <motion.div
          className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 text-green-500 mr-2" />
            <div>
              <p className="text-xs text-green-600 dark:text-green-400">Total Cost</p>
              <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                ${totalStats.totalCost.toFixed(4)}
              </p>
            </div>
          </div>
        </motion.div>        <motion.div
          className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <Zap className="w-4 h-4 text-purple-500 mr-2" />
            <div>
              <p className="text-xs text-purple-600 dark:text-purple-400">Avg Tokens</p>
              <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                {Math.round(totalStats.avgTokensPerRequest)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-yellow-500 mr-2" />
            <div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Requests</p>
              <p className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                {totalStats.totalRequests}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Model Breakdown */}
      {type === 'pie' && modelUsage.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Usage by Model
          </h4>
          <div className="space-y-2">
            {modelUsage.map((model, index) => (
              <div key={model.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{model.name}</span>
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {model.totalTokens.toLocaleString()} tokens
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
