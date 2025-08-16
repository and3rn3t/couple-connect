import { useState, useEffect } from 'react';
import { useKV } from '../hooks/useKV';
import { Bell, X, Clock, Warning, CheckCircle, SettingsIcon } from '@/components/ui/InlineIcons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Action, Issue } from '../App';
import { Partner } from './PartnerSetup';
import { useNotificationSystem } from '../hooks/useNotificationSystem';

// Constants for notification system
const NOTIFICATION_DEFAULTS = {
  ENABLED: true,
  OVERDUE_REMINDERS: true,
  DEADLINE_WARNINGS: true,
  PARTNER_UPDATES: true,
  WARNING_DAYS: 3,
  BROWSER_NOTIFICATIONS: false,
} as const;

const TIME_CONSTANTS = {
  MS_PER_DAY: 1000 * 60 * 60 * 24,
  MS_PER_HOUR: 1000 * 60 * 60,
  HOURS_IN_DAY: 24,
} as const;

const NOTIFICATION_LIMITS = {
  MAX_UNREAD_DISPLAY: 9,
} as const;

const WARNING_DAY_OPTIONS = [
  { value: 1, label: '1 day' },
  { value: 2, label: '2 days' },
  { value: 3, label: '3 days' },
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weeks' },
] as const;

interface Notification {
  id: string;
  type: 'overdue' | 'deadline-soon' | 'partner-completed';
  actionId: string;
  partnerId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface NotificationSettings {
  enabled: boolean;
  overdueReminders: boolean;
  deadlineWarnings: boolean;
  partnerUpdates: boolean;
  warningDays: number; // Days before deadline to show warning
  browserNotifications: boolean;
}

interface NotificationCenterProps {
  actions: Action[];
  issues: Issue[];
  currentPartner: Partner;
  otherPartner: Partner;
  onActionUpdate: (actionId: string, updates: Partial<Action>) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function NotificationCenter({
  actions,
  issues,
  currentPartner,
  otherPartner,
  onActionUpdate: _onActionUpdate,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useKV<Notification[]>('notifications', []);
  const [settings, setSettings] = useKV<NotificationSettings>('notification-settings', {
    enabled: NOTIFICATION_DEFAULTS.ENABLED,
    overdueReminders: NOTIFICATION_DEFAULTS.OVERDUE_REMINDERS,
    deadlineWarnings: NOTIFICATION_DEFAULTS.DEADLINE_WARNINGS,
    partnerUpdates: NOTIFICATION_DEFAULTS.PARTNER_UPDATES,
    warningDays: NOTIFICATION_DEFAULTS.WARNING_DAYS,
    browserNotifications: NOTIFICATION_DEFAULTS.BROWSER_NOTIFICATIONS,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Use external control if provided, otherwise use internal state
  const dialogOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const setDialogOpen = externalOnOpenChange || setIsOpen;

  // Initialize the notification system
  const { requestNotificationPermission } = useNotificationSystem({
    actions,
    issues,
    currentPartner,
    otherPartner,
    settings: settings || {
      enabled: NOTIFICATION_DEFAULTS.ENABLED,
      overdueReminders: NOTIFICATION_DEFAULTS.OVERDUE_REMINDERS,
      deadlineWarnings: NOTIFICATION_DEFAULTS.DEADLINE_WARNINGS,
      partnerUpdates: NOTIFICATION_DEFAULTS.PARTNER_UPDATES,
      warningDays: NOTIFICATION_DEFAULTS.WARNING_DAYS,
      browserNotifications: NOTIFICATION_DEFAULTS.BROWSER_NOTIFICATIONS,
    },
  });

  // Generate notifications based on current actions
  useEffect(() => {
    const currentSettings = settings || {
      enabled: true,
      overdueReminders: true,
      deadlineWarnings: true,
      partnerUpdates: true,
      warningDays: 3,
      browserNotifications: false,
    };

    if (!currentSettings.enabled) return;

    const now = new Date();
    const currentNotifications = notifications || [];
    const newNotifications: Notification[] = [];

    actions.forEach((action) => {
      const dueDate = new Date(action.dueDate);
      const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / TIME_CONSTANTS.MS_PER_DAY);

      // Check for overdue actions
      if (currentSettings.overdueReminders && action.status !== 'completed' && daysDiff < 0) {
        const existingOverdue = currentNotifications.find(
          (n) =>
            n.actionId === action.id && n.type === 'overdue' && n.partnerId === currentPartner.id
        );

        if (!existingOverdue) {
          const issue = issues.find((i) => i.id === action.issueId);
          newNotifications.push({
            id: `overdue-${action.id}-${Date.now()}`,
            type: 'overdue',
            actionId: action.id,
            partnerId: currentPartner.id,
            title: 'Overdue Action',
            message: `"${action.title}" was due ${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} ago${issue ? ` (${issue.title})` : ''}`,
            createdAt: new Date().toISOString(),
            read: false,
            priority: 'high',
          });
        }
      }

      // Check for upcoming deadlines
      if (
        currentSettings.deadlineWarnings &&
        action.status !== 'completed' &&
        daysDiff > 0 &&
        daysDiff <= currentSettings.warningDays
      ) {
        const existingWarning = currentNotifications.find(
          (n) =>
            n.actionId === action.id &&
            n.type === 'deadline-soon' &&
            n.partnerId === currentPartner.id
        );

        if (!existingWarning) {
          const issue = issues.find((i) => i.id === action.issueId);
          newNotifications.push({
            id: `deadline-${action.id}-${Date.now()}`,
            type: 'deadline-soon',
            actionId: action.id,
            partnerId: currentPartner.id,
            title: 'Upcoming Deadline',
            message: `"${action.title}" is due in ${daysDiff} day${daysDiff === 1 ? '' : 's'}${issue ? ` (${issue.title})` : ''}`,
            createdAt: new Date().toISOString(),
            read: false,
            priority: daysDiff === 1 ? 'high' : 'medium',
          });
        }
      }

      // Check for partner completions
      if (
        currentSettings.partnerUpdates &&
        action.status === 'completed' &&
        action.completedBy === otherPartner.id
      ) {
        const existingCompletion = currentNotifications.find(
          (n) =>
            n.actionId === action.id &&
            n.type === 'partner-completed' &&
            n.partnerId === currentPartner.id
        );

        if (!existingCompletion && action.completedAt) {
          const completedDate = new Date(action.completedAt);
          const hoursSinceCompletion =
            (now.getTime() - completedDate.getTime()) / TIME_CONSTANTS.MS_PER_HOUR;

          // Only notify if completed within last 24 hours
          if (hoursSinceCompletion <= TIME_CONSTANTS.HOURS_IN_DAY) {
            const issue = issues.find((i) => i.id === action.issueId);
            newNotifications.push({
              id: `completed-${action.id}-${Date.now()}`,
              type: 'partner-completed',
              actionId: action.id,
              partnerId: currentPartner.id,
              title: 'Partner Completed Action',
              message: `${otherPartner.name} completed "${action.title}"${issue ? ` (${issue.title})` : ''}`,
              createdAt: new Date().toISOString(),
              read: false,
              priority: 'low',
            });
          }
        }
      }
    });

    if (newNotifications.length > 0) {
      setNotifications((current) => [...(current || []), ...newNotifications]);

      // Show toast for high priority notifications
      newNotifications.forEach((notification) => {
        if (notification.priority === 'high') {
          toast.error(notification.title, {
            description: notification.message,
            action: {
              label: 'View',
              onClick: () => setIsOpen(true),
            },
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, issues, currentPartner.id, otherPartner.id, settings]); // ✅ FIXED: Removed notifications to prevent infinite loop (Aug 16, 2025)

  const unreadCount = (notifications || []).filter(
    (n) => !n.read && n.partnerId === currentPartner.id
  ).length;

  const currentPartnerNotifications = (notifications || [])
    .filter((n) => n.partnerId === currentPartner.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const markAsRead = (notificationId: string) => {
    setNotifications((current) =>
      (current || []).map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      (current || []).map((n) => (n.partnerId === currentPartner.id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((current) => (current || []).filter((n) => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications((current) => (current || []).filter((n) => n.partnerId !== currentPartner.id));
  };

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    setSettings((current) => {
      const currentSettings = current || {
        enabled: true,
        overdueReminders: true,
        deadlineWarnings: true,
        partnerUpdates: true,
        warningDays: 3,
        browserNotifications: false,
      };
      return { ...currentSettings, ...updates };
    });
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'overdue':
        return <Warning className="text-destructive" size={16} />;
      case 'deadline-soon':
        return <Clock className="text-accent" size={16} />;
      case 'partner-completed':
        return <CheckCircle className="text-primary" size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get safe settings values
  const safeSettings = settings || {
    enabled: true,
    overdueReminders: true,
    deadlineWarnings: true,
    partnerUpdates: true,
    warningDays: 3,
    browserNotifications: false,
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="relative" onClick={() => setDialogOpen(true)}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
          >
            {unreadCount > NOTIFICATION_LIMITS.MAX_UNREAD_DISPLAY ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bell size={20} />
                Notifications
                {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-1"
                >
                  <SettingsIcon size={14} />
                  Settings
                </Button>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {showSettings && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-sm">Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications-enabled">Enable notifications</Label>
                  <Switch
                    id="notifications-enabled"
                    checked={safeSettings.enabled}
                    onCheckedChange={(checked) => updateSettings({ enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="overdue-reminders">Overdue action reminders</Label>
                  <Switch
                    id="overdue-reminders"
                    checked={safeSettings.overdueReminders}
                    onCheckedChange={(checked) => updateSettings({ overdueReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="deadline-warnings">Upcoming deadline warnings</Label>
                  <Switch
                    id="deadline-warnings"
                    checked={safeSettings.deadlineWarnings}
                    onCheckedChange={(checked) => updateSettings({ deadlineWarnings: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="partner-updates">Partner completion updates</Label>
                  <Switch
                    id="partner-updates"
                    checked={safeSettings.partnerUpdates}
                    onCheckedChange={(checked) => updateSettings({ partnerUpdates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="browser-notifications">Browser notifications</Label>
                    {'Notification' in window && (
                      <span className="text-xs text-muted-foreground">
                        Status:{' '}
                        {Notification.permission === 'granted'
                          ? '✓ Enabled'
                          : Notification.permission === 'denied'
                            ? '✗ Blocked'
                            : '? Permission needed'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {safeSettings.browserNotifications &&
                      'Notification' in window &&
                      Notification.permission === 'default' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={requestNotificationPermission}
                          className="text-xs"
                        >
                          Allow
                        </Button>
                      )}
                    <Switch
                      id="browser-notifications"
                      checked={safeSettings.browserNotifications}
                      onCheckedChange={(checked) => {
                        updateSettings({ browserNotifications: checked });
                        if (checked) {
                          requestNotificationPermission();
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="warning-days">Warning days before deadline</Label>
                  <select
                    id="warning-days"
                    value={safeSettings.warningDays}
                    onChange={(e) => updateSettings({ warningDays: parseInt(e.target.value) })}
                    className="bg-background border border-input rounded px-2 py-1 text-sm"
                    aria-label="Warning days before deadline"
                  >
                    {WARNING_DAY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex-1 overflow-y-auto space-y-3">
            {currentPartnerNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell size={48} className="mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm">You'll be notified about overdue actions and deadlines</p>
              </div>
            ) : (
              <>
                {currentPartnerNotifications.map((notification) => {
                  const action = actions.find((a) => a.id === notification.actionId);
                  const _issue = action ? issues.find((i) => i.id === action.issueId) : null;

                  return (
                    <Card
                      key={notification.id}
                      className={`${!notification.read ? 'ring-2 ring-primary/20' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <Badge
                                  variant={getPriorityColor(notification.priority)}
                                  className="text-xs"
                                >
                                  {notification.priority}
                                </Badge>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                  {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                                  {new Date(notification.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {action && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs"
                                    onClick={() => {
                                      markAsRead(notification.id);
                                      // Focus on the specific action - you could emit an event here
                                      toast.info('Action located in Action Plans tab');
                                      setDialogOpen(false);
                                    }}
                                  >
                                    View Action
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-8 w-8 p-0"
                              >
                                <CheckCircle size={14} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {currentPartnerNotifications.length > 3 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                      Clear All Notifications
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
