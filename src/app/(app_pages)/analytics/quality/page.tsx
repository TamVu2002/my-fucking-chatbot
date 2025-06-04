'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Star, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Mock data for quality metrics
const qualityTrends = [
  { date: '2024-05-01', satisfaction: 4.2, accuracy: 85, helpfulness: 82, clarity: 88 },
  { date: '2024-05-02', satisfaction: 4.4, accuracy: 87, helpfulness: 85, clarity: 90 },
  { date: '2024-05-03', satisfaction: 4.1, accuracy: 83, helpfulness: 80, clarity: 86 },
  { date: '2024-05-04', satisfaction: 4.6, accuracy: 90, helpfulness: 88, clarity: 92 },
  { date: '2024-05-05', satisfaction: 4.7, accuracy: 92, helpfulness: 90, clarity: 94 },
  { date: '2024-05-06', satisfaction: 4.5, accuracy: 89, helpfulness: 87, clarity: 91 },
  { date: '2024-05-07', satisfaction: 4.8, accuracy: 94, helpfulness: 92, clarity: 96 },
];

const responseCategories = [
  { category: 'Accuracy', score: 92, benchmark: 85 },
  { category: 'Helpfulness', score: 88, benchmark: 80 },
  { category: 'Clarity', score: 94, benchmark: 85 },
  { category: 'Relevance', score: 90, benchmark: 82 },
  { category: 'Completeness', score: 86, benchmark: 78 },
  { category: 'Timeliness', score: 95, benchmark: 90 },
];

const feedbackData = [
  { type: 'Positive', count: 1247, percentage: 76 },
  { type: 'Neutral', count: 289, percentage: 18 },
  { type: 'Negative', count: 98, percentage: 6 },
];

const qualityMetrics = [
  {
    title: 'Overall Satisfaction',
    value: '4.6/5',
    change: '+0.3',
    trend: 'up',
    icon: Star,
    color: 'text-yellow-500'
  },
  {
    title: 'Success Rate',
    value: '91%',
    change: '+5%',
    trend: 'up',
    icon: Target,
    color: 'text-green-500'
  },
  {
    title: 'Response Accuracy',
    value: '94%',
    change: '+2%',
    trend: 'up',
    icon: Award,
    color: 'text-blue-500'
  },
  {
    title: 'Issue Resolution',
    value: '87%',
    change: '+4%',
    trend: 'up',
    icon: MessageSquare,
    color: 'text-purple-500'
  }
];

export default function AnalyticsQualityPage() {
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
          <h1 className="text-3xl font-bold">Quality Metrics</h1>
          <p className="text-muted-foreground mt-2">
            Track response quality, user satisfaction, and conversation success rates
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

      {/* Quality Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {qualityMetrics.map((metric, index) => {
          const Icon = metric.icon;

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
                <div className="flex items-center gap-1 text-sm text-green-500">
                  <TrendingUp className="h-4 w-4" />
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
        {/* Satisfaction Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Satisfaction Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={qualityTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="satisfaction" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quality Categories Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Quality Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={responseCategories}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={0} domain={[0, 100]} />
              <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="Benchmark" dataKey="benchmark" stroke="#10b981" fill="transparent" strokeDasharray="5 5" />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Response Quality Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Quality Scores vs Benchmarks</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responseCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="benchmark" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Feedback Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">User Feedback</h3>
          <div className="space-y-4">
            {feedbackData.map((feedback) => (
              <div key={feedback.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {feedback.type === 'Positive' && <ThumbsUp className="h-4 w-4 text-green-500" />}
                    {feedback.type === 'Neutral' && <MessageSquare className="h-4 w-4 text-yellow-500" />}
                    {feedback.type === 'Negative' && <ThumbsDown className="h-4 w-4 text-red-500" />}
                    <span className="font-medium">{feedback.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{feedback.count}</div>
                    <div className="text-sm text-muted-foreground">{feedback.percentage}%</div>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      feedback.type === 'Positive' ? 'bg-green-500' :
                      feedback.type === 'Neutral' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${feedback.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
