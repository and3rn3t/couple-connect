import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogTitle,
} from '@/components/ui/mobile-dialog';
import { MobileButton } from '@/components/ui/mobile-button';
import {
  TrendUp,
  Heart,
  Users,
  Trophy,
  Star,
  Flame,
  CheckCircle,
  Clock,
} from '@/components/ui/InlineIcons';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Action, Issue } from '@/App';
import { Partner } from './PartnerSetup';
import { cn } from '@/lib/utils';

// Mobile-optimized progress data types
export interface MobileProgressMetric {
  id: string;
  title: string;
  category: 'relationship' | 'communication' | 'intimacy' | 'growth' | 'activities';
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  color: string;
  icon: React.ReactNode;
  description: string;
  milestones: ProgressMilestone[];
}

export interface ProgressMilestone {
  value: number;
  label: string;
  achieved: boolean;
  achievedDate?: Date;
}

export interface MobileChartData {
  date: string;
  value: number;
  label?: string;
}

export interface ProgressSummary {
  totalMetrics: number;
  improvingMetrics: number;
  completedGoals: number;
  overallScore: number;
  weeklyGrowth: number;
}

interface MobileProgressVisualizationProps {
  _actions: Action[];
  _issues: Issue[];
  _currentPartner: Partner;
  _otherPartner: Partner;
  metrics: MobileProgressMetric[];
  chartData: { [metricId: string]: MobileChartData[] };
  summary: ProgressSummary;
  onMetricTap: (metricId: string) => void;
  onTimeframeChange: (timeframe: 'week' | 'month' | 'year') => void;
}

export const MobileProgressVisualization = ({
  _actions,
  _issues,
  _currentPartner,
  _otherPartner,
  metrics,
  chartData,
  summary,
  onMetricTap,
  onTimeframeChange,
}: MobileProgressVisualizationProps) => {
  const { triggerHaptic } = useHapticFeedback();
  const [activeTimeframe, setActiveTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [selectedMetric, setSelectedMetric] = useState<MobileProgressMetric | null>(null);
  const [showMetricDetail, setShowMetricDetail] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Get category configuration
  const getCategoryConfig = (category: MobileProgressMetric['category']) => {
    switch (category) {
      case 'relationship':
        return {
          icon: <Heart className="w-5 h-5" />,
          color: 'from-red-500 to-pink-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          name: 'Relationship',
        };
      case 'communication':
        return {
          icon: <Users className="w-5 h-5" />,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          name: 'Communication',
        };
      case 'intimacy':
        return {
          icon: <Flame className="w-5 h-5" />,
          color: 'from-orange-500 to-red-500',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          name: 'Intimacy',
        };
      case 'growth':
        return {
          icon: <TrendUp className="w-5 h-5" />,
          color: 'from-green-500 to-teal-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          name: 'Growth',
        };
      case 'activities':
        return {
          icon: <Star className="w-5 h-5" />,
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          name: 'Activities',
        };
    }
  };

  // Get trend icon and color
  const getTrendConfig = (trend: MobileProgressMetric['trend']) => {
    switch (trend) {
      case 'up':
        return {
          icon: <TrendUp className="w-4 h-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      case 'down':
        return {
          icon: <TrendUp className="w-4 h-4 transform rotate-180" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        };
      case 'stable':
        return {
          icon: <TrendUp className="w-4 h-4 transform rotate-90" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };
    }
  };

  // Filter metrics by category
  const filteredMetrics = useMemo(() => {
    if (activeCategory === 'all') return metrics;
    return metrics.filter((metric) => metric.category === activeCategory);
  }, [metrics, activeCategory]);

  // Handle timeframe change
  const handleTimeframeChange = (timeframe: 'week' | 'month' | 'year') => {
    triggerHaptic('light');
    setActiveTimeframe(timeframe);
    onTimeframeChange(timeframe);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    triggerHaptic('light');
    setActiveCategory(category);
  };

  // Handle metric detail view
  const handleMetricDetail = (metric: MobileProgressMetric) => {
    triggerHaptic('light');
    setSelectedMetric(metric);
    setShowMetricDetail(true);
    onMetricTap(metric.id);
  };

  // Calculate progress percentage
  const getProgressPercentage = (metric: MobileProgressMetric) => {
    return Math.min((metric.currentValue / metric.targetValue) * 100, 100);
  };

  // Simple mobile-optimized chart component
  const MobileChart = ({ data, color }: { data: MobileChartData[]; color: string }) => {
    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const range = maxValue - minValue || 1;

    return (
      <div className="h-20 flex items-end gap-1 px-2">
        {data.map((point, index) => {
          const height = ((point.value - minValue) / range) * 70 + 5; // 5px minimum height
          return (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${height}px` }}
              transition={{ delay: index * 0.05 }}
              className={cn('flex-1 rounded-t-sm min-w-[2px]', color)}
              style={{ backgroundColor: color.includes('bg-') ? undefined : color }}
            />
          );
        })}
      </div>
    );
  };

  // Get unique categories
  const categories = Array.from(new Set(metrics.map((m) => m.category)));

  return (
    <>
      <Card className="mx-4 my-6 shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
            <div className="flex items-center gap-2">
              <TrendUp className="w-6 h-6 text-green-500" />
              <span>Progress Insights</span>
            </div>
          </CardTitle>

          {/* Overall Progress Summary */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.overallScore}%</div>
              <div className="text-xs text-green-700">Overall Score</div>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">+{summary.weeklyGrowth}%</div>
              <div className="text-xs text-blue-700">Weekly Growth</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <TrendUp className="w-4 h-4 text-green-500" />
              <span>{summary.improvingMetrics} improving</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>{summary.completedGoals} completed</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-blue-500" />
              <span>{summary.totalMetrics} total metrics</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {/* Timeframe Selector */}
          <div className="flex border-b border-gray-200 mb-4 px-4">
            {[
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
              { key: 'year', label: 'Year' },
            ].map((timeframe) => (
              <MobileButton
                key={timeframe.key}
                variant="ghost"
                className={cn(
                  'flex-1 py-3 px-4 text-sm font-medium rounded-none border-b-2 transition-colors',
                  activeTimeframe === timeframe.key
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
                onClick={() => handleTimeframeChange(timeframe.key as 'week' | 'month' | 'year')}
              >
                {timeframe.label}
              </MobileButton>
            ))}
          </div>

          {/* Category Filter */}
          <div className="px-4 mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <MobileButton
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                className={cn(
                  'px-4 py-2 text-sm whitespace-nowrap',
                  activeCategory === 'all' && 'bg-green-500 hover:bg-green-600'
                )}
                onClick={() => handleCategoryChange('all')}
              >
                All Categories
              </MobileButton>

              {categories.map((categoryKey) => {
                const config = getCategoryConfig(categoryKey);
                const isSelected = activeCategory === categoryKey;

                return (
                  <MobileButton
                    key={categoryKey}
                    variant={isSelected ? 'default' : 'outline'}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap',
                      isSelected && 'bg-green-500 hover:bg-green-600'
                    )}
                    onClick={() => handleCategoryChange(categoryKey)}
                  >
                    {config.icon}
                    {config.name}
                  </MobileButton>
                );
              })}
            </div>
          </div>

          {/* Progress Metrics */}
          <div className="px-4 space-y-4 pb-6">
            {filteredMetrics.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <TrendUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No metrics available</p>
                <p className="text-gray-400 text-sm mt-2">Check back later for progress updates</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filteredMetrics.map((metric, index) => {
                  const progressPercentage = getProgressPercentage(metric);
                  const trendConfig = getTrendConfig(metric.trend);
                  const categoryConfig = getCategoryConfig(metric.category);
                  const completedMilestones = metric.milestones.filter((m) => m.achieved).length;

                  return (
                    <motion.div
                      key={metric.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className="cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-gray-200"
                        onClick={() => handleMetricDetail(metric)}
                      >
                        <CardContent className="p-4">
                          {/* Metric Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={cn('p-2 rounded-lg', categoryConfig.bgColor)}>
                                {categoryConfig.icon}
                              </div>

                              <div>
                                <h3 className="font-semibold text-gray-900 text-sm">
                                  {metric.title}
                                </h3>
                                <p className="text-xs text-gray-600">{metric.description}</p>
                              </div>
                            </div>

                            <div
                              className={cn(
                                'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                                trendConfig.bgColor,
                                trendConfig.color
                              )}
                            >
                              {trendConfig.icon}
                              <span>{Math.abs(metric.trendPercentage)}%</span>
                            </div>
                          </div>

                          {/* Current Progress */}
                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Progress</span>
                              <span className="text-sm font-medium text-gray-900">
                                {metric.currentValue} / {metric.targetValue} {metric.unit}
                              </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>0</span>
                              <span className="font-medium">{Math.round(progressPercentage)}%</span>
                              <span>
                                {metric.targetValue} {metric.unit}
                              </span>
                            </div>
                          </div>

                          {/* Mini Chart */}
                          {chartData[metric.id] && chartData[metric.id].length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs text-gray-600 mb-2">
                                {activeTimeframe} trend
                              </div>
                              <MobileChart data={chartData[metric.id]} color={metric.color} />
                            </div>
                          )}

                          {/* Milestones & Category */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={categoryConfig.bgColor + ' ' + categoryConfig.textColor}
                              >
                                {categoryConfig.name}
                              </Badge>

                              {completedMilestones > 0 && (
                                <Badge className="bg-yellow-100 text-yellow-700">
                                  {completedMilestones} milestones
                                </Badge>
                              )}
                            </div>

                            <div className="text-xs text-gray-500">{metric.timeframe}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metric Detail Dialog */}
      <MobileDialog open={showMetricDetail} onOpenChange={setShowMetricDetail}>
        <MobileDialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
          {selectedMetric && (
            <>
              <MobileDialogHeader>
                <MobileDialogTitle className="text-lg">{selectedMetric.title}</MobileDialogTitle>
              </MobileDialogHeader>

              <div className="p-4 space-y-6">
                {/* Metric Overview */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {selectedMetric.currentValue}
                    <span className="text-lg text-gray-600 ml-1">
                      / {selectedMetric.targetValue}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {selectedMetric.unit} • {selectedMetric.timeframe}
                  </div>

                  <Progress value={getProgressPercentage(selectedMetric)} className="h-3 mb-2" />
                  <div className="text-sm text-gray-600">
                    {Math.round(getProgressPercentage(selectedMetric))}% complete
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-gray-700 leading-relaxed">{selectedMetric.description}</p>
                </div>

                {/* Trend Analysis */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  {(() => {
                    const trendConfig = getTrendConfig(selectedMetric.trend);
                    return (
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-full', trendConfig.bgColor)}>
                          {trendConfig.icon}
                        </div>
                        <div>
                          <div className={cn('font-medium', trendConfig.color)}>
                            {selectedMetric.trend === 'up'
                              ? 'Improving'
                              : selectedMetric.trend === 'down'
                                ? 'Declining'
                                : 'Stable'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {Math.abs(selectedMetric.trendPercentage)}% vs last period
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Chart Visualization */}
                {chartData[selectedMetric.id] && chartData[selectedMetric.id].length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">{activeTimeframe} Progress</h4>
                    <div className="h-32 bg-gray-50 rounded-lg p-4">
                      <MobileChart
                        data={chartData[selectedMetric.id]}
                        color={selectedMetric.color}
                      />
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {selectedMetric.milestones.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Milestones</h4>
                    <div className="space-y-3">
                      {selectedMetric.milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border',
                            milestone.achieved
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          )}
                        >
                          <div
                            className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center',
                              milestone.achieved ? 'bg-green-500' : 'bg-gray-300'
                            )}
                          >
                            {milestone.achieved ? (
                              <CheckCircle className="w-4 h-4 text-white" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-600" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div
                              className={cn(
                                'font-medium text-sm',
                                milestone.achieved ? 'text-green-700' : 'text-gray-700'
                              )}
                            >
                              {milestone.label}
                            </div>
                            <div className="text-xs text-gray-600">
                              {milestone.value} {selectedMetric.unit}
                              {milestone.achievedDate && (
                                <span className="ml-2">
                                  • {milestone.achievedDate.toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Info */}
                <div className="flex items-center gap-2">
                  {(() => {
                    const categoryConfig = getCategoryConfig(selectedMetric.category);
                    return (
                      <div
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium',
                          categoryConfig.bgColor,
                          categoryConfig.textColor
                        )}
                      >
                        {categoryConfig.icon}
                        <span>{categoryConfig.name} Metric</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </MobileDialogContent>
      </MobileDialog>
    </>
  );
};

export default MobileProgressVisualization;
