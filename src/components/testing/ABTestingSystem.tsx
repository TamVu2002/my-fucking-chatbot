'use client';
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TestTube, 
  Plus, 
  Play, 
  Pause, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target,
  Award,
  RefreshCw,
  Download,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Users
} from 'lucide-react';
import { AnimatedDiv, AnimatedButton } from '@/components/ui/animations';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export interface PromptVariant {
  id: string;
  name: string;
  content: string;
  systemPrompt?: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
  };
}

export interface TestResult {
  id: string;
  variantId: string;
  timestamp: number;
  userQuery: string;
  response: string;
  metrics: {
    responseTime: number;
    tokenCount: number;
    userRating?: number; // 1-5 stars
    userFeedback?: string;
    engagement?: 'positive' | 'negative' | 'neutral';
  };
  metadata: {
    userId?: string;
    sessionId: string;
    modelUsed: string;
  };
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: PromptVariant[];
  targetMetrics: Array<'response_time' | 'user_rating' | 'engagement' | 'token_efficiency'>;
  trafficSplit: Record<string, number>; // variantId -> percentage
  results: TestResult[];
  settings: {
    minSampleSize: number;
    significanceLevel: number;
    maxDuration: number; // days
    autoStop: boolean;
  };
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  winner?: string;
}

interface ABTestingSystemProps {
  onRunTest?: (test: ABTest, variant: PromptVariant, query: string) => Promise<TestResult>;
  className?: string;
}

export default function ABTestingSystem({ onRunTest, className = '' }: ABTestingSystemProps) {
  const { theme } = useAppSettings();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [testQuery, setTestQuery] = useState('');
  const [isRunningTest, setIsRunningTest] = useState(false);

  const createNewTest = useCallback(() => {
    const newTest: ABTest = {
      id: `test-${Date.now()}`,
      name: 'New A/B Test',
      description: '',
      status: 'draft',
      variants: [
        {
          id: `variant-a-${Date.now()}`,
          name: 'Variant A (Control)',
          content: '',
          parameters: { temperature: 0.7, maxTokens: 1000, topP: 1 }
        },
        {
          id: `variant-b-${Date.now()}`,
          name: 'Variant B',
          content: '',
          parameters: { temperature: 0.7, maxTokens: 1000, topP: 1 }
        }
      ],
      targetMetrics: ['user_rating', 'response_time'],
      trafficSplit: {},
      results: [],
      settings: {
        minSampleSize: 50,
        significanceLevel: 0.95,
        maxDuration: 7,
        autoStop: true
      },
      createdAt: Date.now()
    };

    // Initialize equal traffic split
    const splitPercentage = 100 / newTest.variants.length;
    newTest.trafficSplit = newTest.variants.reduce((acc, variant) => {
      acc[variant.id] = splitPercentage;
      return acc;
    }, {} as Record<string, number>);

    setTests(prev => [...prev, newTest]);
    setSelectedTest(newTest);
    setShowCreateTest(true);
  }, []);

  const saveTest = useCallback((updatedTest: ABTest) => {
    setTests(prev => prev.map(test => 
      test.id === updatedTest.id ? updatedTest : test
    ));
    setSelectedTest(updatedTest);
    setShowCreateTest(false);
  }, []);

  const startTest = useCallback((testId: string) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: 'running' as const, startedAt: Date.now() }
        : test
    ));
  }, []);

  const pauseTest = useCallback((testId: string) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: 'paused' as const }
        : test
    ));
  }, []);

  const runTestQuery = useCallback(async (test: ABTest) => {
    if (!testQuery.trim() || !onRunTest) return;

    setIsRunningTest(true);

    try {
      // Select variant based on traffic split (simplified random selection)
      const random = Math.random() * 100;
      let cumulative = 0;
      let selectedVariant: PromptVariant | null = null;

      for (const variant of test.variants) {
        cumulative += test.trafficSplit[variant.id] || 0;
        if (random <= cumulative) {
          selectedVariant = variant;
          break;
        }
      }

      if (!selectedVariant) {
        selectedVariant = test.variants[0]; // Fallback
      }

      const result = await onRunTest(test, selectedVariant, testQuery);
      
      // Add result to test
      setTests(prev => prev.map(t => 
        t.id === test.id 
          ? { ...t, results: [...t.results, result] }
          : t
      ));

      setTestQuery('');
    } catch (error) {
      console.error('Failed to run test:', error);
    } finally {
      setIsRunningTest(false);
    }
  }, [testQuery, onRunTest]);

  const calculateMetrics = useCallback((test: ABTest) => {
    const metrics = test.variants.map(variant => {
      const variantResults = test.results.filter(r => r.variantId === variant.id);
      
      if (variantResults.length === 0) {
        return {
          variantId: variant.id,
          variantName: variant.name,
          sampleSize: 0,
          avgResponseTime: 0,
          avgUserRating: 0,
          avgTokenCount: 0,
          engagementRate: 0
        };
      }

      const avgResponseTime = variantResults.reduce((sum, r) => sum + r.metrics.responseTime, 0) / variantResults.length;
      const ratingsResults = variantResults.filter(r => r.metrics.userRating);
      const avgUserRating = ratingsResults.length > 0 
        ? ratingsResults.reduce((sum, r) => sum + (r.metrics.userRating || 0), 0) / ratingsResults.length 
        : 0;
      const avgTokenCount = variantResults.reduce((sum, r) => sum + r.metrics.tokenCount, 0) / variantResults.length;
      const positiveEngagement = variantResults.filter(r => r.metrics.engagement === 'positive').length;
      const engagementRate = positiveEngagement / variantResults.length;

      return {
        variantId: variant.id,
        variantName: variant.name,
        sampleSize: variantResults.length,
        avgResponseTime,
        avgUserRating,
        avgTokenCount,
        engagementRate
      };
    });

    return metrics;
  }, []);

  const determineWinner = useCallback((test: ABTest) => {
    const metrics = calculateMetrics(test);
    
    if (metrics.every(m => m.sampleSize < test.settings.minSampleSize)) {
      return null; // Not enough data
    }

    // Simple winner determination based on user rating (can be enhanced with statistical significance)
    const bestVariant = metrics.reduce((best, current) => {
      if (current.avgUserRating > best.avgUserRating && current.sampleSize >= test.settings.minSampleSize) {
        return current;
      }
      return best;
    });

    return bestVariant.variantId;
  }, [calculateMetrics]);

  const exportResults = useCallback((test: ABTest) => {
    const metrics = calculateMetrics(test);
    const exportData = {
      test: {
        id: test.id,
        name: test.name,
        description: test.description,
        status: test.status,
        startedAt: test.startedAt,
        endedAt: test.endedAt
      },
      variants: test.variants,
      metrics,
      results: test.results,
      winner: determineWinner(test),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab-test-results-${test.name.replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [calculateMetrics, determineWinner]);

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TestTube className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              A/B Testing Lab
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Test and optimize your prompt variations
            </p>
          </div>
        </div>

        <AnimatedButton
          onClick={createNewTest}
          variant="default"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Test
        </AnimatedButton>
      </div>

      {/* Tests List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Tests
          </h2>
          
          <div className="space-y-3">
            {tests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                isSelected={selectedTest?.id === test.id}
                onSelect={() => setSelectedTest(test)}
                onStart={() => startTest(test.id)}
                onPause={() => pauseTest(test.id)}
                calculateMetrics={calculateMetrics}
              />
            ))}

            {tests.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <TestTube className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tests created yet</p>
                <p className="text-sm">Create your first A/B test to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Test Details */}
        <div className="lg:col-span-2">
          {selectedTest ? (
            <TestDetailsView
              test={selectedTest}
              onEdit={() => setShowCreateTest(true)}
              onExport={() => exportResults(selectedTest)}
              calculateMetrics={calculateMetrics}
              determineWinner={determineWinner}
              testQuery={testQuery}
              setTestQuery={setTestQuery}
              onRunTest={() => runTestQuery(selectedTest)}
              isRunningTest={isRunningTest}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a Test
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a test from the list to view details and results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Test Creator/Editor Modal */}
      <TestCreatorModal
        isOpen={showCreateTest}
        test={selectedTest}
        onSave={saveTest}
        onClose={() => setShowCreateTest(false)}
      />
    </div>
  );
}

// Test Card Component
interface TestCardProps {
  test: ABTest;
  isSelected: boolean;
  onSelect: () => void;
  onStart: () => void;
  onPause: () => void;
  calculateMetrics: (test: ABTest) => any[];
}

function TestCard({ test, isSelected, onSelect, onStart, onPause, calculateMetrics }: TestCardProps) {
  const metrics = calculateMetrics(test);
  const totalResults = test.results.length;

  return (
    <motion.div
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white truncate">
          {test.name}
        </h3>
        <StatusBadge status={test.status} />
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {test.description || 'No description'}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            {totalResults} results
          </span>
          <span className="flex items-center">
            <Target className="w-3 h-3 mr-1" />
            {test.variants.length} variants
          </span>
        </div>
      </div>

      {test.status === 'running' && (
        <div className="flex justify-between items-center">
          <div className="text-xs text-green-600 dark:text-green-400">
            ● Live
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPause();
            }}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Pause className="w-3 h-3" />
          </button>
        </div>
      )}

      {test.status === 'draft' && (
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <Play className="w-3 h-3" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: ABTest['status'] }) {
  const configs = {
    draft: { color: 'gray', icon: Clock },
    running: { color: 'green', icon: Play },
    paused: { color: 'yellow', icon: Pause },
    completed: { color: 'blue', icon: CheckCircle }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/20 dark:text-${config.color}-300`}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </span>
  );
}

// Test Details View Component
interface TestDetailsViewProps {
  test: ABTest;
  onEdit: () => void;
  onExport: () => void;
  calculateMetrics: (test: ABTest) => any[];
  determineWinner: (test: ABTest) => string | null;
  testQuery: string;
  setTestQuery: (query: string) => void;
  onRunTest: () => void;
  isRunningTest: boolean;
}

function TestDetailsView({ 
  test, 
  onEdit, 
  onExport, 
  calculateMetrics, 
  determineWinner,
  testQuery,
  setTestQuery,
  onRunTest,
  isRunningTest
}: TestDetailsViewProps) {
  const metrics = calculateMetrics(test);
  const winner = determineWinner(test);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {test.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {test.description}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <AnimatedButton onClick={onEdit} variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Edit
            </AnimatedButton>
            <AnimatedButton onClick={onExport} variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Test Query Interface */}
      {test.status === 'running' && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Test Query
          </h3>
          <div className="flex space-x-3">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Enter a query to test both variants..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <AnimatedButton
              onClick={onRunTest}
              disabled={!testQuery.trim() || isRunningTest}
              variant="default"
            >
              {isRunningTest ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </AnimatedButton>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white">
            Performance Metrics
          </h3>
          {winner && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <Award className="w-4 h-4 mr-1" />
              <span className="text-sm">
                Winner: {metrics.find(m => m.variantId === winner)?.variantName}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.variantId}
              className={`p-4 rounded-lg border ${
                winner === metric.variantId
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {metric.variantName}
                </h4>
                {winner === metric.variantId && (
                  <Award className="w-4 h-4 text-green-500" />
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sample Size:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metric.sampleSize}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Rating:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metric.avgUserRating.toFixed(2)}/5
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metric.avgResponseTime.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Engagement:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(metric.engagementRate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Test Creator Modal (Simplified)
interface TestCreatorModalProps {
  isOpen: boolean;
  test: ABTest | null;
  onSave: (test: ABTest) => void;
  onClose: () => void;
}

function TestCreatorModal({ isOpen, test, onSave, onClose }: TestCreatorModalProps) {
  const [formData, setFormData] = useState<ABTest | null>(test);

  React.useEffect(() => {
    setFormData(test);
  }, [test]);

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {test?.id.startsWith('test-') ? 'Create A/B Test' : 'Edit A/B Test'}
          </h2>
          
          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <AnimatedButton onClick={onClose} variant="ghost">
              Cancel
            </AnimatedButton>
            <AnimatedButton onClick={() => onSave(formData)} variant="default">
              Save Test
            </AnimatedButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
