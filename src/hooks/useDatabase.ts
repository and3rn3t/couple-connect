import { useState, useEffect } from 'react';
import { db } from '../services/database';
import type { User, Couple, Issue, Action } from '../services/types';

// Enhanced version of useKV that can work with database entities
export function useKV<T>(key: string, defaultValue?: T) {
  const [value, setValue] = useState<T | undefined>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = (newValue: T | undefined | ((prev: T | undefined) => T | undefined)) => {
    try {
      const valueToStore =
        typeof newValue === 'function'
          ? (newValue as (prev: T | undefined) => T | undefined)(value)
          : newValue;

      setValue(valueToStore);
      if (valueToStore === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : defaultValue;
          setValue(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, defaultValue]);

  return [value, setStoredValue] as const;
}

// Database-specific hooks for common entities
export function useCurrentUser() {
  const [userId] = useKV<string>('current_user_id');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      db.getUser(userId)
        .then(setUser)
        .catch((error) => {
          console.error('Error fetching user:', error);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [userId]);

  return { user, loading, userId };
}

export function useCurrentCouple() {
  const { userId } = useCurrentUser();
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      db.getCoupleByUser(userId)
        .then(setCouple)
        .catch((error) => {
          console.error('Error fetching couple:', error);
          setCouple(null);
        })
        .finally(() => setLoading(false));
    } else {
      setCouple(null);
      setLoading(false);
    }
  }, [userId]);

  return { couple, loading };
}

export function useIssues() {
  const { couple } = useCurrentCouple();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshIssues = async () => {
    if (couple) {
      setLoading(true);
      try {
        const fetchedIssues = await db.getIssues(couple.id);
        setIssues(fetchedIssues);
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const loadIssues = async () => {
      if (couple) {
        setLoading(true);
        try {
          const fetchedIssues = await db.getIssues(couple.id);
          setIssues(fetchedIssues);
        } catch (error) {
          console.error('Error fetching issues:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadIssues();
  }, [couple]);

  const createIssue = async (
    issueData: Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'couple_id'>
  ) => {
    if (!couple) throw new Error('No couple found');

    const newIssue = await db.createIssue({
      ...issueData,
      couple_id: couple.id,
    });

    await refreshIssues();
    return newIssue;
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    const updatedIssue = await db.updateIssue(id, updates);
    await refreshIssues();
    return updatedIssue;
  };

  const deleteIssue = async (id: string) => {
    await db.deleteIssue(id);
    await refreshIssues();
  };

  return {
    issues,
    loading,
    createIssue,
    updateIssue,
    deleteIssue,
    refreshIssues,
  };
}

export function useActions(filters?: { status?: string; assigned_to?: string }) {
  const { couple } = useCurrentCouple();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshActions = async () => {
    if (couple) {
      setLoading(true);
      try {
        const fetchedActions = await db.getActions(couple.id, filters);
        setActions(fetchedActions);
      } catch (error) {
        console.error('Error fetching actions:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const loadActions = async () => {
      if (couple) {
        setLoading(true);
        try {
          const fetchedActions = await db.getActions(couple.id, filters);
          setActions(fetchedActions);
        } catch (error) {
          console.error('Error fetching actions:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadActions();
  }, [couple, filters]);

  const createAction = async (
    actionData: Omit<Action, 'id' | 'created_at' | 'updated_at' | 'couple_id'>
  ) => {
    if (!couple) throw new Error('No couple found');

    const newAction = await db.createAction({
      ...actionData,
      couple_id: couple.id,
    });

    await refreshActions();
    return newAction;
  };

  const updateAction = async (id: string, updates: Partial<Action>) => {
    const updatedAction = await db.updateAction(id, updates);
    await refreshActions();
    return updatedAction;
  };

  const deleteAction = async (id: string) => {
    await db.deleteAction(id);
    await refreshActions();
  };

  return {
    actions,
    loading,
    createAction,
    updateAction,
    deleteAction,
    refreshActions,
  };
}
