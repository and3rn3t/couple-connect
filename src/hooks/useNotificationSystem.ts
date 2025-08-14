import { useEffect } from 'react';
import { useKV } from './useKV';
import { Action, Issue } from '../App';
import { Partner } from '../components/PartnerSetup';

interface NotificationSettings {
  enabled: boolean;
  overdueReminders: boolean;
  deadlineWarnings: boolean;
  partnerUpdates: boolean;
  warningDays: number;
  browserNotifications: boolean;
}

interface UseNotificationSystemProps {
  actions: Action[];
  issues: Issue[];
  currentPartner: Partner;
  otherPartner: Partner;
  settings: NotificationSettings;
}

export function useNotificationSystem({
  actions,
  issues,
  currentPartner,
  otherPartner: _otherPartner,
  settings,
}: UseNotificationSystemProps) {
  const [lastNotificationCheck, setLastNotificationCheck] = useKV<string>(
    'last-notification-check',
    ''
  );

  // Request permission for browser notifications
  useEffect(() => {
    if (settings.browserNotifications && settings.enabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [settings.browserNotifications, settings.enabled]);

  // Check for actions requiring notifications
  useEffect(() => {
    if (!settings.enabled) return;

    const now = new Date();
    const currentTime = now.toISOString();

    // Only check if we haven't checked in the last hour
    if (lastNotificationCheck) {
      const lastCheck = new Date(lastNotificationCheck);
      const hoursSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastCheck < 1) return;
    }

    let urgentNotifications = 0;
    let warningNotifications = 0;

    actions.forEach((action) => {
      // Only check actions assigned to current partner
      if (action.assignedToId !== currentPartner.id && action.assignedTo !== 'both') return;
      if (action.status === 'completed') return;

      const dueDate = new Date(action.dueDate);
      const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const issue = issues.find((i) => i.id === action.issueId);

      // Count overdue actions
      if (settings.overdueReminders && daysDiff < 0) {
        urgentNotifications++;

        // Send browser notification for overdue actions
        if (
          settings.browserNotifications &&
          Notification.permission === 'granted' &&
          Math.abs(daysDiff) <= 3
        ) {
          // Only for recently overdue items
          new Notification('Overdue Action', {
            body: `"${action.title}" was due ${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} ago`,
            icon: '/favicon.ico',
            tag: `overdue-${action.id}`, // Prevents duplicate notifications
          });
        }
      }

      // Count upcoming deadlines
      if (settings.deadlineWarnings && daysDiff > 0 && daysDiff <= settings.warningDays) {
        warningNotifications++;

        // Send browser notification for urgent deadlines (1 day)
        if (
          settings.browserNotifications &&
          Notification.permission === 'granted' &&
          daysDiff === 1
        ) {
          new Notification('Action Due Tomorrow', {
            body: `"${action.title}" is due tomorrow${issue ? ` (${issue.title})` : ''}`,
            icon: '/favicon.ico',
            tag: `deadline-${action.id}`,
          });
        }
      }
    });

    // Update the last check time
    setLastNotificationCheck(() => currentTime);

    // Update document title with notification count
    const totalNotifications = urgentNotifications + warningNotifications;
    if (totalNotifications > 0) {
      document.title = `(${totalNotifications}) Together - Couples Accountability`;
    } else {
      document.title = 'Together - Couples Accountability';
    }
  }, [
    actions,
    issues,
    currentPartner.id,
    settings,
    lastNotificationCheck,
    setLastNotificationCheck,
  ]);

  // Clean up document title on unmount
  useEffect(() => {
    return () => {
      document.title = 'Together - Couples Accountability';
    };
  }, []);

  return {
    // You could return utility functions here if needed
    requestNotificationPermission: () => {
      if ('Notification' in window && Notification.permission === 'default') {
        return Notification.requestPermission();
      }
      return Promise.resolve(Notification.permission);
    },
  };
}
