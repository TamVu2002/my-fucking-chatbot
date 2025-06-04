'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Zap, Bot, GitCompare, Target } from 'lucide-react';
import Link from 'next/link';

const analyticsCards = [
  {
    title: 'Overview Dashboard',
    description: 'Get insights into your chatbot usage, token consumption, and conversation trends',
    icon: BarChart3,
    href: '/analytics/overview',
    color: 'bg-blue-500',
    stats: { chats: 342, tokens: '1.2M', uptime: '99.8%' }
  },
  {
    title: 'Performance Optimization',
    description: 'Monitor system performance, AI recommendations, and optimization opportunities',
    icon: Zap,
    href: '/analytics/performance',
    color: 'bg-green-500',
    stats: { score: '94/100', alerts: 3, optimizations: 12 }
  },
  {
    title: 'AI Suggestions',
    description: 'Get intelligent recommendations for improving prompts, performance, and user experience',
    icon: Bot,
    href: '/analytics/suggestions',
    color: 'bg-purple-500',
    stats: { suggestions: 18, implemented: 8, impact: 'High' }
  },
  {
    title: 'Model Comparison',
    description: 'Compare different AI models, analyze performance, and find the best fit for your needs',
    icon: GitCompare,
    href: '/analytics/comparison',
    color: 'bg-orange-500',
    stats: { models: 15, benchmarks: 5, tests: 24 }
  },
  {
    title: 'Usage Trends',
    description: 'Analyze conversation patterns, peak usage times, and user engagement metrics',
    icon: TrendingUp,
    href: '/analytics/trends',
    color: 'bg-cyan-500',
    stats: { growth: '+23%', peak: '2-4 PM', engagement: '87%' }
  },
  {
    title: 'Quality Metrics',
    description: 'Track response quality, user satisfaction, and conversation success rates',
    icon: Target,
    href: '/analytics/quality',
    color: 'bg-pink-500',
    stats: { satisfaction: '4.6/5', success: '91%', feedback: 156 }
  }
];

export default function AnalyticsPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  return (
    <div className="space-y-8">
      {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Advanced Analytics Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unlock the full potential of your chatbot with comprehensive analytics, AI-powered insights, and performance optimization tools
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">342</div>
            <div className="text-sm text-muted-foreground">Total Chats</div>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-500">1.2M</div>
            <div className="text-sm text-muted-foreground">Tokens Used</div>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">94%</div>
            <div className="text-sm text-muted-foreground">Performance</div>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">18</div>
            <div className="text-sm text-muted-foreground">AI Suggestions</div>
          </div>
        </motion.div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyticsCards.map((card, index) => {
            const Icon = card.icon;
            const isHovered = hoveredCard === index;

            return (
              <motion.div
                key={card.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Link href={card.href}>
                  <motion.div
                    className="relative bg-card border rounded-xl p-6 cursor-pointer overflow-hidden group"
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Background Gradient */}
                    <motion.div
                      className={`absolute inset-0 ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                      initial={false}
                      animate={{ opacity: isHovered ? 0.05 : 0 }}
                    />

                    {/* Icon */}
                    <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {card.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        {Object.entries(card.stats).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-sm font-medium">{value}</div>
                            <div className="text-xs text-muted-foreground capitalize">{key}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hover Arrow */}
                    <motion.div
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ x: -10 }}
                      animate={{ x: isHovered ? 0 : -10 }}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-card border rounded-xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We&apos;re continuously working on new analytics features including real-time monitoring, 
            advanced AI insights, custom dashboards, and integration with external analytics platforms.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-muted rounded-full px-4 py-2 text-sm">Real-time Monitoring</div>
            <div className="bg-muted rounded-full px-4 py-2 text-sm">Custom Dashboards</div>
            <div className="bg-muted rounded-full px-4 py-2 text-sm">A/B Testing</div>
            <div className="bg-muted rounded-full px-4 py-2 text-sm">API Analytics</div>
          </div>        </motion.div>
    </div>
  );
}
