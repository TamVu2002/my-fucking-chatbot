'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart3, Zap, Brain, GitCompare, TrendingUp, Target } from 'lucide-react';

const analyticsNavItems = [
  { href: '/analytics/overview', label: 'Overview', icon: BarChart3 },
  { href: '/analytics/performance', label: 'Performance', icon: Zap },
  { href: '/analytics/suggestions', label: 'AI Suggestions', icon: Brain },
  { href: '/analytics/comparison', label: 'Comparison', icon: GitCompare },
  { href: '/analytics/trends', label: 'Trends', icon: TrendingUp },
  { href: '/analytics/quality', label: 'Quality', icon: Target },
];

export function AnalyticsNavigation() {
  const pathname = usePathname();

  return (
    <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
      <div className="container mx-auto px-6">
        <div className="flex items-center space-x-8 overflow-x-auto py-4">
          {analyticsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-md"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
