import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogTitle,
} from '@/components/ui/mobile-dialog';
import { MobileButton } from '@/components/ui/mobile-button';
import {
  Heart,
  Trophy,
  Gift,
  Users,
  Calendar,
  Star,
  CheckCircle,
  Plus,
  Bell,
  Flame,
  Camera,
  Download,
} from '@/components/ui/InlineIcons';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Action, Issue } from '@/App';
import { Partner } from './PartnerSetup';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Activity types for the feed
export interface ActivityFeedItem {
  id: string;
  type:
    | 'challenge_completed'
    | 'milestone_reached'
    | 'date_planned'
    | 'achievement_unlocked'
    | 'memory_shared'
    | 'gift_given'
    | 'streak_extended'
    | 'points_earned'
    | 'connection_improved'
    | 'photo_shared'
    | 'message_sent'
    | 'goal_set'
    | 'anniversary'
    | 'custom';
  title: string;
  description: string;
  timestamp: Date;
  participants: string[]; // Partner names involved
  points?: number;
  category: 'relationship' | 'achievement' | 'communication' | 'goal' | 'milestone' | 'social';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  metadata?: {
    photos?: string[];
    challengeId?: string;
    achievementId?: string;
    goalId?: string;
    memoryId?: string;
    [key: string]: unknown;
  };
}

export interface ActivityFilter {
  categories: string[];
  timeRange: 'today' | 'week' | 'month' | 'all';
  participants: string[];
  types: string[];
  unreadOnly: boolean;
}

interface MobileActivityFeedProps {
  _actions: Action[];
  _issues: Issue[];
  _currentUser: Partner;
  _partner: Partner;
  activities: ActivityFeedItem[];
  filters: ActivityFilter;
  onActivityRead: (activityId: string) => void;
  onFilterChange: (filters: Partial<ActivityFilter>) => void;
  onActivityAction: (activityId: string, action: 'like' | 'comment' | 'share' | 'bookmark') => void;
}

export const MobileActivityFeed = ({
  _actions,
  _issues,
  _currentUser,
  _partner,
  activities,
  filters,
  onActivityRead,
  onFilterChange,
  onActivityAction,
}: MobileActivityFeedProps) => {
  const { triggerHaptic } = useHapticFeedback();
  const [selectedActivity, setSelectedActivity] = useState<ActivityFeedItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showActivityDetail, setShowActivityDetail] = useState(false);

  // Get activity icon based on type
  const getActivityIcon = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'challenge_completed':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'milestone_reached':
        return <Star className="w-5 h-5 text-purple-500" />;
      case 'date_planned':
        return <Calendar className="w-5 h-5 text-red-500" />;
      case 'achievement_unlocked':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'memory_shared':
        return <Camera className="w-5 h-5 text-blue-500" />;
      case 'gift_given':
        return <Gift className="w-5 h-5 text-pink-500" />;
      case 'streak_extended':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'points_earned':
        return <Plus className="w-5 h-5 text-green-500" />;
      case 'connection_improved':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'photo_shared':
        return <Camera className="w-5 h-5 text-blue-500" />;
      case 'message_sent':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'goal_set':
        return <Star className="w-5 h-5 text-purple-500" />;
      case 'anniversary':
        return <Heart className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get category color
  const getCategoryColor = (category: ActivityFeedItem['category']) => {
    switch (category) {
      case 'relationship':
        return 'bg-red-100 text-red-700';
      case 'achievement':
        return 'bg-yellow-100 text-yellow-700';
      case 'communication':
        return 'bg-blue-100 text-blue-700';
      case 'goal':
        return 'bg-purple-100 text-purple-700';
      case 'milestone':
        return 'bg-green-100 text-green-700';
      case 'social':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get priority indicator
  const getPriorityColor = (priority: ActivityFeedItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-gray-300';
      default:
        return 'border-l-gray-300';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }
  };

  // Handle activity click
  const handleActivityClick = (activity: ActivityFeedItem) => {
    triggerHaptic('light');

    if (!activity.isRead) {
      onActivityRead(activity.id);
    }

    setSelectedActivity(activity);
    setShowActivityDetail(true);
  };

  // Handle filter change
  const handleFilterToggle = (filterType: keyof ActivityFilter, value: string) => {
    triggerHaptic('light');

    if (filterType === 'categories') {
      const currentCategories = filters.categories;
      const updatedCategories = currentCategories.includes(value)
        ? currentCategories.filter((cat) => cat !== value)
        : [...currentCategories, value];
      onFilterChange({ categories: updatedCategories });
    } else if (filterType === 'types') {
      const currentTypes = filters.types;
      const updatedTypes = currentTypes.includes(value)
        ? currentTypes.filter((type) => type !== value)
        : [...currentTypes, value];
      onFilterChange({ types: updatedTypes });
    }
  };

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(activity.category)) {
      return false;
    }

    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(activity.type)) {
      return false;
    }

    // Unread filter
    if (filters.unreadOnly && activity.isRead) {
      return false;
    }

    // Time range filter
    const now = new Date();
    const activityDate = activity.timestamp;

    switch (filters.timeRange) {
      case 'today':
        return activityDate.toDateString() === now.toDateString();
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return activityDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return activityDate >= monthAgo;
      }
      default:
        return true;
    }
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce(
    (groups, activity) => {
      const dateKey = activity.timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
      return groups;
    },
    {} as Record<string, ActivityFeedItem[]>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Activity Feed</h1>
              <p className="text-sm text-gray-600">
                {filteredActivities.length} activities
                {filters.unreadOnly &&
                  ` (${filteredActivities.filter((a) => !a.isRead).length} unread)`}
              </p>
            </div>

            <MobileButton
              variant="outline"
              size="sm"
              onClick={() => {
                triggerHaptic('light');
                setShowFilters(true);
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              Filter
            </MobileButton>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'all', label: 'All', active: filters.timeRange === 'all' },
              { key: 'today', label: 'Today', active: filters.timeRange === 'today' },
              { key: 'week', label: 'This Week', active: filters.timeRange === 'week' },
              { key: 'month', label: 'This Month', active: filters.timeRange === 'month' },
            ].map((timeFilter) => (
              <MobileButton
                key={timeFilter.key}
                variant={timeFilter.active ? 'default' : 'outline'}
                size="sm"
                className="px-3 py-1 text-xs whitespace-nowrap"
                onClick={() => {
                  triggerHaptic('light');
                  onFilterChange({ timeRange: timeFilter.key as ActivityFilter['timeRange'] });
                }}
              >
                {timeFilter.label}
              </MobileButton>
            ))}

            <MobileButton
              variant={filters.unreadOnly ? 'default' : 'outline'}
              size="sm"
              className="px-3 py-1 text-xs whitespace-nowrap"
              onClick={() => {
                triggerHaptic('light');
                onFilterChange({ unreadOnly: !filters.unreadOnly });
              }}
            >
              Unread Only
            </MobileButton>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="p-4 space-y-4">
          {Object.keys(groupedActivities).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No Activities</h3>
                <p className="text-sm text-gray-600">
                  No activities match your current filters. Try adjusting your filter settings.
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedActivities)
              .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
              .map(([dateKey, dayActivities]) => {
                const date = new Date(dateKey);
                const today = new Date().toDateString();
                const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

                let dateLabel = date.toLocaleDateString();
                if (dateKey === today) dateLabel = 'Today';
                else if (dateKey === yesterday) dateLabel = 'Yesterday';

                return (
                  <div key={dateKey} className="space-y-3">
                    {/* Date Header */}
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-gray-600">{dateLabel}</div>
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <div className="text-xs text-gray-500">
                        {dayActivities.length}{' '}
                        {dayActivities.length === 1 ? 'activity' : 'activities'}
                      </div>
                    </div>

                    {/* Activities for the day */}
                    <div className="space-y-2">
                      {dayActivities
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                        .map((activity) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="cursor-pointer"
                            onClick={() => handleActivityClick(activity)}
                          >
                            <Card
                              className={cn(
                                'border-l-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                                getPriorityColor(activity.priority),
                                !activity.isRead && 'bg-blue-50 border-blue-200'
                              )}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  {/* Activity Icon */}
                                  <div className="mt-1">{getActivityIcon(activity.type)}</div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <h3
                                          className={cn(
                                            'font-semibold text-sm leading-tight',
                                            !activity.isRead ? 'text-gray-900' : 'text-gray-700'
                                          )}
                                        >
                                          {activity.title}
                                        </h3>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {activity.description}
                                        </p>
                                      </div>

                                      {!activity.isRead && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                      )}
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex items-center gap-2 mt-3">
                                      {/* Participants */}
                                      <div className="flex items-center gap-1">
                                        {activity.participants
                                          .slice(0, 2)
                                          .map((participant, index) => (
                                            <Avatar key={index} className="w-5 h-5">
                                              <AvatarFallback className="text-xs">
                                                {participant.charAt(0).toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                          ))}
                                        {activity.participants.length > 2 && (
                                          <span className="text-xs text-gray-500">
                                            +{activity.participants.length - 2}
                                          </span>
                                        )}
                                      </div>

                                      {/* Category Badge */}
                                      <Badge
                                        className={cn(
                                          'text-xs px-2 py-0.5',
                                          getCategoryColor(activity.category)
                                        )}
                                      >
                                        {activity.category}
                                      </Badge>

                                      {/* Points */}
                                      {activity.points && (
                                        <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5">
                                          +{activity.points} pts
                                        </Badge>
                                      )}

                                      {/* Timestamp */}
                                      <span className="text-xs text-gray-500 ml-auto">
                                        {formatTimestamp(activity.timestamp)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Activity Detail Dialog */}
      <MobileDialog open={showActivityDetail} onOpenChange={setShowActivityDetail}>
        <MobileDialogContent className="max-w-sm">
          {selectedActivity && (
            <>
              <MobileDialogHeader>
                <MobileDialogTitle className="flex items-center gap-2">
                  {getActivityIcon(selectedActivity.type)}
                  {selectedActivity.title}
                </MobileDialogTitle>
              </MobileDialogHeader>

              <div className="p-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedActivity.description}
                  </p>
                </div>

                {/* Activity Metadata */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Category:</span>
                    <Badge className={getCategoryColor(selectedActivity.category)}>
                      {selectedActivity.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Time:</span>
                    <span className="text-gray-900">
                      {selectedActivity.timestamp.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Participants:</span>
                    <span className="text-gray-900">
                      {selectedActivity.participants.join(', ')}
                    </span>
                  </div>

                  {selectedActivity.points && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Points Earned:</span>
                      <Badge className="bg-green-100 text-green-700">
                        +{selectedActivity.points} pts
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <MobileButton
                    variant="outline"
                    className="text-sm"
                    onClick={() => {
                      triggerHaptic('light');
                      onActivityAction(selectedActivity.id, 'like');
                      toast.success('Activity liked!');
                    }}
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Like
                  </MobileButton>

                  <MobileButton
                    variant="outline"
                    className="text-sm"
                    onClick={() => {
                      triggerHaptic('light');
                      onActivityAction(selectedActivity.id, 'bookmark');
                      toast.success('Activity bookmarked!');
                    }}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Save
                  </MobileButton>
                </div>
              </div>
            </>
          )}
        </MobileDialogContent>
      </MobileDialog>

      {/* Filters Dialog */}
      <MobileDialog open={showFilters} onOpenChange={setShowFilters}>
        <MobileDialogContent className="max-w-sm">
          <MobileDialogHeader>
            <MobileDialogTitle>Filter Activities</MobileDialogTitle>
          </MobileDialogHeader>

          <div className="p-4 space-y-4">
            {/* Categories */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'relationship',
                  'achievement',
                  'communication',
                  'goal',
                  'milestone',
                  'social',
                ].map((category) => (
                  <MobileButton
                    key={category}
                    variant={filters.categories.includes(category) ? 'default' : 'outline'}
                    size="sm"
                    className="capitalize text-xs"
                    onClick={() => handleFilterToggle('categories', category)}
                  >
                    {category}
                  </MobileButton>
                ))}
              </div>
            </div>

            {/* Reset Filters */}
            <MobileButton
              variant="outline"
              className="w-full"
              onClick={() => {
                triggerHaptic('medium');
                onFilterChange({
                  categories: [],
                  types: [],
                  unreadOnly: false,
                  timeRange: 'all',
                });
                toast.success('Filters reset');
              }}
            >
              Reset All Filters
            </MobileButton>
          </div>
        </MobileDialogContent>
      </MobileDialog>
    </>
  );
};

export default MobileActivityFeed;
