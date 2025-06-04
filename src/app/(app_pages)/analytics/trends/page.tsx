'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Clock, MessageSquare, BarChart3 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

// Mock data for trends
const usageData = [
  { date: '2024-05-01', chats: 45, tokens: 23000, users: 12 },
  { date: '2024-05-02', chats: 52, tokens: 28000, users: 15 },
  { date: '2024-05-03', chats: 38, tokens: 19000, users: 11 },
  { date: '2024-05-04', chats: 67, tokens: 34000, users: 18 },
  { date: '2024-05-05', chats: 71, tokens: 41000, users: 22 },
  { date: '2024-05-06', chats: 58, tokens: 31000, users: 16 },
  { date: '2024-05-07', chats: 84, tokens: 48000, users: 25 },
];

const hourlyData = [
  { hour: '00:00', usage: 5 },
  { hour: '01:00', usage: 3 },
  { hour: '02:00', usage: 2 },
  { hour: '03:00', usage: 1 },
  { hour: '04:00', usage: 2 },
  { hour: '05:00', usage: 4 },
  { hour: '06:00', usage: 8 },
  { hour: '07:00', usage: 15 },
  { hour: '08:00', usage: 25 },
  { hour: '09:00', usage: 35 },
  { hour: '10:00', usage: 42 },
  { hour: '11:00', usage: 38 },
  { hour: '12:00', usage: 45 },
  { hour: '13:00', usage: 50 },
  { hour: '14:00', usage: 48 },
  { hour: '15:00', usage: 44 },
  { hour: '16:00', usage: 41 },
  { hour: '17:00', usage: 35 },
  { hour: '18:00', usage: 28 },
  { hour: '19:00', usage: 22 },
  { hour: '20:00', usage: 18 },
  { hour: '21:00', usage: 15 },
  { hour: '22:00', usage: 12 },
  { hour: '23:00', usage: 8 },
];

const categoryData = [
  { name: 'General Chat', value: 35, color: '#3b82f6' },
  { name: 'Technical Support', value: 25, color: '#10b981' },
  { name: 'Creative Writing', value: 20, color: '#f59e0b' },
  { name: 'Code Assistance', value: 15, color: '#8b5cf6' },
  { name: 'Other', value: 5, color: '#6b7280' },
];

const trendMetrics = [
  {
    title: 'Total Conversations',
    value: '2,847',
    change: '+23%',
    trend: 'up',
    icon: MessageSquare,
    color: 'text-blue-500'
  },
  {
    title: 'Active Users',
    value: '1,234',
    change: '+15%',
    trend: 'up',
    icon: Users,
    color: 'text-green-500'
  },
  {
    title: 'Avg Response Time',
    value: '1.2s',
    change: '-8%',
    trend: 'down',
    icon: Clock,
    color: 'text-orange-500'
  },
  {
    title: 'Token Usage',
    value: '2.4M',
    change: '+31%',
    trend: 'up',
    icon: BarChart3,
    color: 'text-purple-500'
  }
];

export default function AnalyticsTrendsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  return (
    <div className="space-y-8">
      {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold">Usage Trends</h1>
            <p className="text-muted-foreground mt-2">
              Analyze conversation patterns, peak usage times, and user engagement metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-background border rounded-lg px-3 py-2"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </motion.div>

        {/* Trend Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {trendMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const isPositive = metric.trend === 'up';
            const TrendIcon = isPositive ? TrendingUp : TrendingDown;

            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-opacity-10 flex items-center justify-center ${metric.color}`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    <TrendIcon className="h-4 w-4" />
                    {metric.change}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.title}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usage Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Usage Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="chats" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Hourly Usage Pattern */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Peak Usage Hours</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Token Usage Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Token Consumption</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="tokens" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Conversation Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Conversation Categories</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Tooltip />
                  <RechartsPieChart>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categoryData.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="text-sm font-medium">{category.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Insights Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-300">Growth Trend</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Usage has increased by 23% over the last week, with peak activity between 1-3 PM.
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">User Engagement</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Average session duration is 8.5 minutes with 87% user satisfaction rate.
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-orange-700 dark:text-orange-300">Performance</span>
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Response times have improved by 8%, with 99.2% uptime this week.
              </p>            </div>
          </div>
        </motion.div>
    </div>
  );
}
