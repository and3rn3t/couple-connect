import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MobileButton } from '@/components/ui/mobile-button';
import { Clock, Warning, CheckCircle, Heart, X } from '@/components/ui/InlineIcons';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Action, Issue } from '../App';
import { Partner } from './PartnerSetup';
import { toast } from 'sonner';

interface MobileNotificationSummaryProps {
  actions: Action[];
  issues: Issue[];
  currentPartner: Partner;
  otherPartner: Partner;
  onViewAll: () => void;
}

interface NotificationItem {
  id: string;
  type: 'overdue' | 'due-soon' | 'completed' | 'new-issue';
  title: string;
  subtitle: string;
  action?: Action;
  issue?: Issue;
  icon: React.ReactNode;
  color: string;
  actionable?: boolean;
}

export const MobileNotificationSummary = ({
  actions,
  issues: _issues,
  currentPartner,
  otherPartner,
  onViewAll,
}: MobileNotificationSummaryProps) => {
  const { triggerHaptic } = useHapticFeedback();
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedItems, setDismissedItems] = useState<string[]>([]);

  const now = new Date();

  // Get current partner's actions
  const myActions = actions.filter(
    (action) => action.assignedToId === currentPartner.id || action.assignedTo === 'both'
  );

  // Calculate different notification types
  const overdueActions = myActions.filter((action) => {
    if (action.status === 'completed') return false;
    const dueDate = new Date(action.dueDate);
    return dueDate < now;
  });

  const dueSoonActions = myActions.filter((action) => {
    if (action.status === 'completed') return false;
    const dueDate = new Date(action.dueDate);
    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 0 && daysDiff <= 2;
  });

  const recentCompletions = actions.filter((action) => {
    if (action.status !== 'completed' || !action.completedAt) return false;
    const completedDate = new Date(action.completedAt);
    const hoursSinceCompletion = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceCompletion <= 24 && action.completedBy === otherPartner.id;
  });

  // Create notification items array
  const notificationItems: NotificationItem[] = [
    // Overdue actions
    ...overdueActions.map((action) => ({
      id: `overdue-${action.id}`,
      type: 'overdue' as const,
      title: action.title,
      subtitle: `Overdue since ${new Date(action.dueDate).toLocaleDateString()}`,
      action,
      icon: <Warning className="w-5 h-5" />,
      color: 'text-red-600',
      actionable: true,
    })),
    // Due soon actions
    ...dueSoonActions.map((action) => ({
      id: `due-soon-${action.id}`,
      type: 'due-soon' as const,
      title: action.title,
      subtitle: `Due ${new Date(action.dueDate).toLocaleDateString()}`,
      action,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-yellow-600',
      actionable: true,
    })),
    // Recent completions by partner
    ...recentCompletions.map((action) => ({
      id: `completed-${action.id}`,
      type: 'completed' as const,
      title: `${otherPartner.name} completed: ${action.title}`,
      subtitle: `Completed ${action.completedAt ? new Date(action.completedAt).toLocaleDateString() : 'recently'}`,
      action,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-600',
      actionable: false,
    })),
  ].filter((item) => !dismissedItems.includes(item.id));

  const totalNotifications = notificationItems.length;

  // Handle item dismissal
  const handleDismissItem = (itemId: string) => {
    triggerHaptic('light');
    setDismissedItems((prev) => [...prev, itemId]);
    toast.success('Notification dismissed');
  };

  // Handle expand/collapse
  const handleToggleExpanded = () => {
    triggerHaptic('medium');
    setIsExpanded(!isExpanded);
  };

  // Handle action button tap
  const handleActionTap = (item: NotificationItem) => {
    triggerHaptic('medium');
    if (item.action) {
      // In a real app, this would navigate to the action or open action dialog
      toast.success(`Opening action: ${item.action.title}`);
    }
  };

  // Handle celebrate completion
  const handleCelebrate = (item: NotificationItem) => {
    if (item.type === 'completed') {
      triggerHaptic('heavy');
      toast.success(`🎉 Way to go ${otherPartner.name}!`);

      // Add celebration animation or confetti here
      handleDismissItem(item.id);
    }
  };

  if (totalNotifications === 0) return null;

  const urgentCount = overdueActions.length;
  const importantCount = dueSoonActions.length;
  const positiveCount = recentCompletions.length;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
      <Card
        className={`border-l-4 ${urgentCount > 0 ? 'border-l-red-500' : importantCount > 0 ? 'border-l-yellow-500' : 'border-l-green-500'}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  urgentCount > 0
                    ? 'bg-red-100'
                    : importantCount > 0
                      ? 'bg-yellow-100'
                      : 'bg-green-100'
                }`}
              >
                {urgentCount > 0 ? (
                  <Warning className="w-4 h-4 text-red-600" />
                ) : importantCount > 0 ? (
                  <Clock className="w-4 h-4 text-yellow-600" />
                ) : (
                  <Heart className="w-4 h-4 text-green-600" />
                )}
              </div>

              <div>
                <CardTitle className="text-sm font-semibold">
                  {urgentCount > 0
                    ? 'Action Required'
                    : importantCount > 0
                      ? 'Upcoming Tasks'
                      : 'Recent Updates'}
                </CardTitle>
                <p className="text-xs text-gray-600">
                  {urgentCount > 0 && `${urgentCount} overdue`}
                  {urgentCount > 0 && (importantCount > 0 || positiveCount > 0) && ', '}
                  {importantCount > 0 && `${importantCount} due soon`}
                  {importantCount > 0 && positiveCount > 0 && ', '}
                  {positiveCount > 0 && `${positiveCount} completed`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className={`${
                  urgentCount > 0
                    ? 'bg-red-100 text-red-700'
                    : importantCount > 0
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                }`}
              >
                {totalNotifications}
              </Badge>

              <MobileButton variant="ghost" size="sm" onClick={handleToggleExpanded}>
                {isExpanded ? (
                  <span className="text-lg">▲</span>
                ) : (
                  <span className="text-lg">▼</span>
                )}
              </MobileButton>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="space-y-3 pt-0">
                {notificationItems.slice(0, 5).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      item.type === 'overdue'
                        ? 'bg-red-50 border-red-200'
                        : item.type === 'due-soon'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className={item.color}>{item.icon}</div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.title}</h4>
                      <p className="text-xs text-gray-600">{item.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.actionable && (
                        <MobileButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleActionTap(item)}
                          className={`text-xs ${
                            item.type === 'overdue'
                              ? 'border-red-300 text-red-700 hover:bg-red-100'
                              : 'border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                          }`}
                        >
                          View
                        </MobileButton>
                      )}

                      {item.type === 'completed' && (
                        <MobileButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleCelebrate(item)}
                          className="text-xs border-green-300 text-green-700 hover:bg-green-100"
                        >
                          🎉
                        </MobileButton>
                      )}

                      <MobileButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismissItem(item.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </MobileButton>
                    </div>
                  </motion.div>
                ))}

                {notificationItems.length > 5 && (
                  <div className="text-center pt-2">
                    <MobileButton
                      variant="outline"
                      size="sm"
                      onClick={onViewAll}
                      className="text-xs"
                    >
                      View {notificationItems.length - 5} more
                    </MobileButton>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <MobileButton variant="outline" size="sm" onClick={onViewAll} className="flex-1">
                    View All
                  </MobileButton>

                  <MobileButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDismissedItems(notificationItems.map((item) => item.id));
                      toast.success('All notifications dismissed');
                      triggerHaptic('light');
                    }}
                    className="flex-1"
                  >
                    Dismiss All
                  </MobileButton>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick action summary when collapsed */}
        {!isExpanded && totalNotifications > 0 && (
          <CardContent className="pt-0">
            <div className="text-center">
              <MobileButton
                variant="ghost"
                size="sm"
                onClick={handleToggleExpanded}
                className="text-xs text-gray-600"
              >
                Tap to view {totalNotifications} notification{totalNotifications !== 1 ? 's' : ''}
              </MobileButton>
            </div>

            {/* Show most urgent item preview */}
            {notificationItems.length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-center">
                <p className="text-xs font-medium text-gray-800">{notificationItems[0].title}</p>
                <p className="text-xs text-gray-600">{notificationItems[0].subtitle}</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default MobileNotificationSummary;
