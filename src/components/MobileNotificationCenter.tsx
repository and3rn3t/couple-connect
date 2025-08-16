import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogTitle,
  MobileDialogTrigger,
} from '@/components/ui/mobile-dialog';
import { MobileButton } from '@/components/ui/mobile-button';
import {
  Bell,
  Heart,
  Users,
  Trophy,
  Lightning,
  CheckCircle,
  X,
  Gear,
} from '@/components/ui/InlineIcons';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Action, Issue } from '@/App';
import { Partner } from './PartnerSetup';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Notification types for mobile-optimized display
export interface MobileNotification {
  id: string;
  type: 'achievement' | 'reminder' | 'milestone' | 'challenge' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  actionRequired: boolean;
  relatedPartner?: string;
  data?: Record<string, unknown>;
}

export interface NotificationSettings {
  enablePush: boolean;
  enableSound: boolean;
  enableVibration: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    achievements: boolean;
    reminders: boolean;
    milestones: boolean;
    challenges: boolean;
    messages: boolean;
    system: boolean;
  };
}

interface MobileNotificationCenterProps {
  _actions: Action[];
  _issues: Issue[];
  _currentPartner: Partner;
  _otherPartner: Partner;
  notifications: MobileNotification[];
  onNotificationRead: (notificationId: string) => void;
  onNotificationDismiss: (notificationId: string) => void;
  onSettingsChange: (settings: NotificationSettings) => void;
  settings: NotificationSettings;
}

export const MobileNotificationCenter = ({
  _actions,
  _issues,
  _currentPartner,
  _otherPartner,
  notifications,
  onNotificationRead,
  onNotificationDismiss,
  onSettingsChange,
  settings,
}: MobileNotificationCenterProps) => {
  const { triggerHaptic } = useHapticFeedback();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'important'>('unread');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showNotificationPreview, setShowNotificationPreview] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<MobileNotification | null>(null);

  // Filter notifications based on active tab
  const filteredNotifications = notifications
    .filter((notification) => {
      switch (activeTab) {
        case 'unread':
          return !notification.isRead;
        case 'important':
          return notification.priority === 'high' || notification.actionRequired;
        default:
          return true;
      }
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Get notification icon based on type
  const getNotificationIcon = (type: MobileNotification['type']) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'milestone':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'challenge':
        return <Lightning className="w-5 h-5 text-orange-500" />;
      case 'message':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'system':
        return <Gear className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: MobileNotification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle notification tap with haptic feedback
  const handleNotificationTap = (notification: MobileNotification) => {
    triggerHaptic('light');
    setSelectedNotification(notification);
    setShowNotificationPreview(true);

    if (!notification.isRead) {
      onNotificationRead(notification.id);
    }
  };

  // Handle notification swipe actions
  const handleSwipeAction = (notification: MobileNotification, action: 'read' | 'dismiss') => {
    triggerHaptic('medium');

    if (action === 'read' && !notification.isRead) {
      onNotificationRead(notification.id);
      toast.success('Marked as read');
    } else if (action === 'dismiss') {
      onNotificationDismiss(notification.id);
      toast.success('Notification dismissed');
    }
  };

  // Handle tab change with haptic feedback
  const handleTabChange = (tab: 'all' | 'unread' | 'important') => {
    triggerHaptic('light');
    setActiveTab(tab);
  };

  // Handle settings toggle
  const handleSettingsToggle = (setting: keyof NotificationSettings, value: boolean) => {
    triggerHaptic('light');
    onSettingsChange({
      ...settings,
      [setting]: value,
    });
  };

  // Handle category settings toggle
  const handleCategoryToggle = (
    category: keyof NotificationSettings['categories'],
    value: boolean
  ) => {
    triggerHaptic('light');
    onSettingsChange({
      ...settings,
      categories: {
        ...settings.categories,
        [category]: value,
      },
    });
  };

  // Format timestamp for mobile display
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const importantCount = notifications.filter(
    (n) => n.priority === 'high' || n.actionRequired
  ).length;

  return (
    <>
      <Card className="mx-4 my-6 shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
              <div className="flex items-center gap-2">
                <Bell className="w-6 h-6 text-blue-500" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </CardTitle>

            <MobileDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <MobileDialogTrigger asChild>
                <MobileButton
                  variant="ghost"
                  className="p-2"
                  onClick={() => triggerHaptic('light')}
                >
                  <Gear className="w-5 h-5 text-gray-600" />
                </MobileButton>
              </MobileDialogTrigger>
              <MobileDialogContent className="max-w-sm">
                <MobileDialogHeader>
                  <MobileDialogTitle>Notification Settings</MobileDialogTitle>
                </MobileDialogHeader>

                <div className="space-y-6 p-4">
                  {/* General Settings */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">General</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Push Notifications</span>
                        <MobileButton
                          variant={settings.enablePush ? 'default' : 'outline'}
                          className="h-8 px-3 text-xs"
                          onClick={() => handleSettingsToggle('enablePush', !settings.enablePush)}
                        >
                          {settings.enablePush ? 'On' : 'Off'}
                        </MobileButton>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Sound</span>
                        <MobileButton
                          variant={settings.enableSound ? 'default' : 'outline'}
                          className="h-8 px-3 text-xs"
                          onClick={() => handleSettingsToggle('enableSound', !settings.enableSound)}
                        >
                          {settings.enableSound ? 'On' : 'Off'}
                        </MobileButton>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Vibration</span>
                        <MobileButton
                          variant={settings.enableVibration ? 'default' : 'outline'}
                          className="h-8 px-3 text-xs"
                          onClick={() =>
                            handleSettingsToggle('enableVibration', !settings.enableVibration)
                          }
                        >
                          {settings.enableVibration ? 'On' : 'Off'}
                        </MobileButton>
                      </div>
                    </div>
                  </div>

                  {/* Category Settings */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                    <div className="space-y-3">
                      {Object.entries(settings.categories).map(([category, enabled]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 capitalize">{category}</span>
                          <MobileButton
                            variant={enabled ? 'default' : 'outline'}
                            className="h-8 px-3 text-xs"
                            onClick={() =>
                              handleCategoryToggle(
                                category as keyof NotificationSettings['categories'],
                                !enabled
                              )
                            }
                          >
                            {enabled ? 'On' : 'Off'}
                          </MobileButton>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </MobileDialogContent>
            </MobileDialog>
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-4 px-4">
            {[
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'important', label: 'Important', count: importantCount },
              { key: 'all', label: 'All', count: notifications.length },
            ].map((tab) => (
              <MobileButton
                key={tab.key}
                variant="ghost"
                className={cn(
                  'flex-1 py-3 px-4 text-sm font-medium rounded-none border-b-2 transition-colors',
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
                onClick={() => handleTabChange(tab.key as 'all' | 'unread' | 'important')}
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge className="ml-2 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5">
                    {tab.count}
                  </Badge>
                )}
              </MobileButton>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-1">
            <AnimatePresence>
              {filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-12 px-4"
                >
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    {activeTab === 'unread'
                      ? 'No unread notifications'
                      : activeTab === 'important'
                        ? 'No important notifications'
                        : 'No notifications yet'}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {activeTab === 'unread'
                      ? "You're all caught up!"
                      : 'New notifications will appear here'}
                  </p>
                </motion.div>
              ) : (
                filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn('relative group', !notification.isRead && 'bg-blue-50')}
                  >
                    <MobileButton
                      variant="ghost"
                      className={cn(
                        'w-full p-4 h-auto justify-start text-left',
                        'hover:bg-gray-50 active:bg-gray-100',
                        'transition-colors duration-200'
                      )}
                      onClick={() => handleNotificationTap(notification)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4
                                className={cn(
                                  'text-sm font-medium truncate',
                                  notification.isRead ? 'text-gray-700' : 'text-gray-900'
                                )}
                              >
                                {notification.title}
                              </h4>
                              <p
                                className={cn(
                                  'text-sm mt-1 line-clamp-2',
                                  notification.isRead ? 'text-gray-500' : 'text-gray-600'
                                )}
                              >
                                {notification.message}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(notification.timestamp)}
                              </span>

                              {notification.priority === 'high' && (
                                <Badge className={getPriorityColor(notification.priority)}>
                                  High
                                </Badge>
                              )}

                              {notification.actionRequired && (
                                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                  Action Required
                                </Badge>
                              )}

                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </MobileButton>

                    {/* Quick Actions (visible on hover/long press) */}
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <MobileButton
                            variant="ghost"
                            className="p-2 h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSwipeAction(notification, 'read');
                            }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </MobileButton>
                        )}

                        <MobileButton
                          variant="ghost"
                          className="p-2 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwipeAction(notification, 'dismiss');
                          }}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </MobileButton>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Notification Detail Preview Dialog */}
      <MobileDialog open={showNotificationPreview} onOpenChange={setShowNotificationPreview}>
        <MobileDialogContent className="max-w-sm">
          {selectedNotification && (
            <>
              <MobileDialogHeader>
                <MobileDialogTitle className="flex items-center gap-2">
                  {getNotificationIcon(selectedNotification.type)}
                  {selectedNotification.title}
                </MobileDialogTitle>
              </MobileDialogHeader>

              <div className="p-4 space-y-4">
                <div>
                  <p className="text-gray-700 leading-relaxed">{selectedNotification.message}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{formatTimestamp(selectedNotification.timestamp)}</span>
                  <div className="flex gap-2">
                    {selectedNotification.priority === 'high' && (
                      <Badge className={getPriorityColor(selectedNotification.priority)}>
                        High Priority
                      </Badge>
                    )}
                    {selectedNotification.actionRequired && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        Action Required
                      </Badge>
                    )}
                  </div>
                </div>

                {selectedNotification.relatedPartner && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Related to:</span>{' '}
                      {selectedNotification.relatedPartner}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  {!selectedNotification.isRead && (
                    <MobileButton
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        handleSwipeAction(selectedNotification, 'read');
                        setShowNotificationPreview(false);
                      }}
                    >
                      Mark as Read
                    </MobileButton>
                  )}

                  <MobileButton
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      handleSwipeAction(selectedNotification, 'dismiss');
                      setShowNotificationPreview(false);
                    }}
                  >
                    Dismiss
                  </MobileButton>
                </div>
              </div>
            </>
          )}
        </MobileDialogContent>
      </MobileDialog>
    </>
  );
};

export default MobileNotificationCenter;
