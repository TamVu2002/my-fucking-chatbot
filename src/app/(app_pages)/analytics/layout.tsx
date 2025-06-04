'use client';
import { AnalyticsNavigation } from '@/components/analytics/AnalyticsNavigation';

export default function AnalyticsLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <AnalyticsNavigation />
      <div className="container mx-auto p-6">
        {children}
      </div>
    </div>
  );
}
