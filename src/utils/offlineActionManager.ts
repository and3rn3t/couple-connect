/**
 * Offline Action Queue Manager
 * Handles queuing and syncing actions when offline
 */

import {
  useOfflineFirst,
  type OfflineActionData,
  type OfflineIssueData,
  type OfflineProgressData,
} from '@/hooks/useServiceWorker';
import { Action, Issue } from '@/App';

export interface OfflineActionManager {
  createActionOfflineFirst: (action: Omit<Action, 'id' | 'createdAt'>) => Promise<string | null>;
  createIssueOfflineFirst: (issue: Omit<Issue, 'id' | 'createdAt'>) => Promise<string | null>;
  updateActionStatusOfflineFirst: (
    actionId: string,
    status: Action['status'],
    partnerId: string
  ) => Promise<boolean>;
  isOffline: boolean;
}

/**
 * Hook for offline-first action management
 */
export function useOfflineActionManager(): OfflineActionManager {
  const { isOffline, executeWithOfflineSupport } = useOfflineFirst();

  const createActionOfflineFirst = async (
    action: Omit<Action, 'id' | 'createdAt'>
  ): Promise<string | null> => {
    const actionData: OfflineActionData = {
      title: action.title,
      description: action.description,
      issueId: action.issueId,
      partnerId: action.createdBy,
      assignedTo: action.assignedTo,
      assignedToId: action.assignedToId,
      dueDate: action.dueDate,
      status: action.status,
      notes: action.notes,
    };

    return executeWithOfflineSupport(
      async () => {
        // This would be your actual API call
        const response = await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actionData),
        });

        if (!response.ok) {
          throw new Error('Failed to create action');
        }

        const result = await response.json();
        return result.id;
      },
      null, // Return null if offline
      'action',
      actionData
    );
  };

  const createIssueOfflineFirst = async (
    issue: Omit<Issue, 'id' | 'createdAt'>
  ): Promise<string | null> => {
    const issueData: OfflineIssueData = {
      title: issue.title,
      description: issue.description,
      partnerId: 'current-user', // We'll need to get this from context
      category: issue.category,
      priority: issue.priority,
    };

    return executeWithOfflineSupport(
      async () => {
        // This would be your actual API call
        const response = await fetch('/api/issues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(issueData),
        });

        if (!response.ok) {
          throw new Error('Failed to create issue');
        }

        const result = await response.json();
        return result.id;
      },
      null, // Return null if offline
      'issue',
      issueData
    );
  };

  const updateActionStatusOfflineFirst = async (
    actionId: string,
    status: Action['status'],
    partnerId: string
  ): Promise<boolean> => {
    const progressData: OfflineProgressData = {
      actionId,
      status,
      partnerId,
      timestamp: new Date().toISOString(),
    };

    return executeWithOfflineSupport(
      async () => {
        // This would be your actual API call
        const response = await fetch(`/api/actions/${actionId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progressData),
        });

        return response.ok;
      },
      false, // Return false if offline
      'progress',
      progressData
    );
  };

  return {
    createActionOfflineFirst,
    createIssueOfflineFirst,
    updateActionStatusOfflineFirst,
    isOffline,
  };
}

/**
 * Utility functions for offline data handling
 */
export const offlineUtils = {
  /**
   * Generate optimistic ID for offline-created items
   */
  generateOptimisticId: (type: 'action' | 'issue' | 'progress'): string => {
    return `offline-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Check if an ID is an optimistic offline ID
   */
  isOptimisticId: (id: string): boolean => {
    return id.startsWith('offline-');
  },

  /**
   * Show appropriate user feedback for offline actions
   */
  showOfflineFeedback: (type: 'action' | 'issue' | 'progress') => {
    const messages = {
      action: "Action saved! It will sync when you're back online.",
      issue: "Issue saved! It will sync when you're back online.",
      progress: "Progress updated! It will sync when you're back online.",
    };

    // This would integrate with your toast system
    return messages[type];
  },

  /**
   * Merge offline and online data
   */
  mergeOfflineData: <T extends { id: string }>(onlineData: T[], offlineData: T[]): T[] => {
    const merged = [...onlineData];

    // Add offline items that aren't duplicated online
    offlineData.forEach((offlineItem) => {
      if (!merged.find((item) => item.id === offlineItem.id)) {
        merged.push(offlineItem);
      }
    });

    return merged;
  },
};

/**
 * Enhanced toast messages for offline scenarios
 */
export const offlineToasts = {
  actionCreated: (isOffline: boolean) => ({
    title: isOffline ? 'Action Queued' : 'Action Created',
    description: isOffline
      ? "Your action will be created when you're back online"
      : 'New action has been created successfully',
    variant: isOffline ? 'default' : 'success',
  }),

  issueReported: (isOffline: boolean) => ({
    title: isOffline ? 'Issue Queued' : 'Issue Reported',
    description: isOffline
      ? "Your issue will be reported when you're back online"
      : 'Issue has been reported successfully',
    variant: isOffline ? 'default' : 'success',
  }),

  progressUpdated: (isOffline: boolean) => ({
    title: isOffline ? 'Progress Queued' : 'Progress Updated',
    description: isOffline
      ? "Your progress will update when you're back online"
      : 'Progress has been updated successfully',
    variant: isOffline ? 'default' : 'success',
  }),

  syncCompleted: (itemCount: number) => ({
    title: 'Sync Complete',
    description: `${itemCount} offline changes have been synced`,
    variant: 'success',
  }),

  syncFailed: () => ({
    title: 'Sync Failed',
    description: 'Some changes could not be synced. They will retry automatically.',
    variant: 'destructive',
  }),
} as const;
