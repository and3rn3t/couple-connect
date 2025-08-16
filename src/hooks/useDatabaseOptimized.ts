import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../services/database';
import { databaseCache, withRetry, getDatabaseConfig } from '../services/databaseConfig';
import type { User, Couple, Issue, Action } from '../services/types';

// Enhanced useKV that can work with database entities
export function useKV<T>(key: string, defaultValue?: T) {
  const [value, setValue] = useState<T | undefined>(() => {
    // Check cache first
    const cached = databaseCache.get(key);
    if (cached !== null) {
      return cached as T;
    }

    try {
      const item = localStorage.getItem(key);
      const parsed = item ? JSON.parse(item) : defaultValue;

      // Cache the result
      if (parsed !== undefined) {
        databaseCache.set(key, parsed);
      }

      return parsed;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback(
    (newValue: T | undefined | ((prev: T | undefined) => T | undefined)) => {
      try {
        const valueToStore =
          typeof newValue === 'function'
            ? (newValue as (prev: T | undefined) => T | undefined)(value)
            : newValue;

        setValue(valueToStore);

        if (valueToStore === undefined) {
          localStorage.removeItem(key);
          databaseCache.invalidate(key);
        } else {
          localStorage.setItem(key, JSON.stringify(valueToStore));
          databaseCache.set(key, valueToStore);
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, value]
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : defaultValue;
          setValue(newValue);
          databaseCache.set(key, newValue);
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

// Enhanced user hook with caching and error handling
export function useCurrentUser() {
  const [userId] = useKV<string>('current_user_id');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async (id: string) => {
    const cacheKey = `user_${id}`;

    // Check cache first
    const cached = databaseCache.get(cacheKey);
    if (cached) {
      setUser(cached as User);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = getDatabaseConfig();
      const fetchedUser = await withRetry(() => db.getUser(id), config);

      setUser(fetchedUser);

      // Cache the result
      if (fetchedUser) {
        databaseCache.set(cacheKey, fetchedUser);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
      setError(errorMessage);
      console.error('Error fetching user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadUser(userId);
    } else {
      setUser(null);
      setLoading(false);
      setError(null);
    }
  }, [userId, loadUser]);

  const refreshUser = useCallback(() => {
    if (userId) {
      databaseCache.invalidate(`user_${userId}`);
      loadUser(userId);
    }
  }, [userId, loadUser]);

  return { user, loading, error, userId, refreshUser };
}

// Enhanced couple hook with caching
export function useCurrentCouple() {
  const { userId } = useCurrentUser();
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCouple = useCallback(async (id: string) => {
    const cacheKey = `couple_by_user_${id}`;

    // Check cache first
    const cached = databaseCache.get(cacheKey);
    if (cached) {
      setCouple(cached as Couple);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = getDatabaseConfig();
      const fetchedCouple = await withRetry(() => db.getCoupleByUser(id), config);

      setCouple(fetchedCouple);

      // Cache the result
      if (fetchedCouple) {
        databaseCache.set(cacheKey, fetchedCouple);
        databaseCache.set(`couple_${fetchedCouple.id}`, fetchedCouple);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch couple';
      setError(errorMessage);
      console.error('Error fetching couple:', err);
      setCouple(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadCouple(userId);
    } else {
      setCouple(null);
      setLoading(false);
      setError(null);
    }
  }, [userId, loadCouple]);

  const refreshCouple = useCallback(() => {
    if (userId) {
      databaseCache.invalidate(`couple_by_user_${userId}`);
      loadCouple(userId);
    }
  }, [userId, loadCouple]);

  return { couple, loading, error, refreshCouple };
}

// Enhanced issues hook with caching and optimistic updates
export function useIssues() {
  const { couple } = useCurrentCouple();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIssues = useCallback(async (coupleId: string) => {
    const cacheKey = `issues_${coupleId}`;

    // Check cache first
    const cached = databaseCache.get(cacheKey);
    if (cached) {
      setIssues(cached as Issue[]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = getDatabaseConfig();
      const fetchedIssues = await withRetry(() => db.getIssues(coupleId), config);

      setIssues(fetchedIssues);

      // Cache the result
      databaseCache.set(cacheKey, fetchedIssues);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch issues';
      setError(errorMessage);
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (couple) {
      loadIssues(couple.id);
    }
  }, [couple, loadIssues]);

  const refreshIssues = useCallback(async () => {
    if (couple) {
      databaseCache.invalidate(`issues_${couple.id}`);
      await loadIssues(couple.id);
    }
  }, [couple, loadIssues]);

  const createIssue = useCallback(
    async (issueData: Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'couple_id'>) => {
      if (!couple) throw new Error('No couple found');

      const config = getDatabaseConfig();

      if (config.enableOptimisticUpdates) {
        // Optimistic update
        const tempId = `temp_${Date.now()}`;
        const optimisticIssue: Issue = {
          ...issueData,
          id: tempId,
          couple_id: couple.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setIssues((prev) => [...prev, optimisticIssue]);

        try {
          const newIssue = await withRetry(
            () =>
              db.createIssue({
                ...issueData,
                couple_id: couple.id,
              }),
            config
          );

          // Replace optimistic update with real data
          setIssues((prev) => prev.map((issue) => (issue.id === tempId ? newIssue : issue)));

          // Invalidate cache and refresh
          await refreshIssues();
          return newIssue;
        } catch (err) {
          // Remove optimistic update on error
          setIssues((prev) => prev.filter((issue) => issue.id !== tempId));
          throw err;
        }
      } else {
        const newIssue = await withRetry(
          () =>
            db.createIssue({
              ...issueData,
              couple_id: couple.id,
            }),
          config
        );

        await refreshIssues();
        return newIssue;
      }
    },
    [couple, refreshIssues]
  );

  const updateIssue = useCallback(
    async (id: string, updates: Partial<Issue>) => {
      const config = getDatabaseConfig();

      if (config.enableOptimisticUpdates) {
        // Optimistic update
        setIssues((prev) =>
          prev.map((issue) => (issue.id === id ? { ...issue, ...updates } : issue))
        );

        try {
          const updatedIssue = await withRetry(() => db.updateIssue(id, updates), config);
          await refreshIssues();
          return updatedIssue;
        } catch (err) {
          // Revert optimistic update on error
          await refreshIssues();
          throw err;
        }
      } else {
        const updatedIssue = await withRetry(() => db.updateIssue(id, updates), config);
        await refreshIssues();
        return updatedIssue;
      }
    },
    [refreshIssues]
  );

  const deleteIssue = useCallback(
    async (id: string) => {
      const config = getDatabaseConfig();

      if (config.enableOptimisticUpdates) {
        // Optimistic update
        const previousIssues = issues;
        setIssues((prev) => prev.filter((issue) => issue.id !== id));

        try {
          await withRetry(() => db.deleteIssue(id), config);
          await refreshIssues();
        } catch (err) {
          // Revert optimistic update on error
          setIssues(previousIssues);
          throw err;
        }
      } else {
        await withRetry(() => db.deleteIssue(id), config);
        await refreshIssues();
      }
    },
    [issues, refreshIssues]
  );

  return {
    issues,
    loading,
    error,
    createIssue,
    updateIssue,
    deleteIssue,
    refreshIssues,
  };
}

// Enhanced actions hook with filtering and caching
export function useActions(filters?: { status?: string; assigned_to?: string }) {
  const { couple } = useCurrentCouple();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => {
    if (!couple) return '';
    const filterKey = filters ? `_${JSON.stringify(filters)}` : '';
    return `actions_${couple.id}${filterKey}`;
  }, [couple, filters]);

  const loadActions = useCallback(
    async (coupleId: string) => {
      // Check cache first
      const cached = databaseCache.get(cacheKey);
      if (cached) {
        setActions(cached as Action[]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const config = getDatabaseConfig();
        const fetchedActions = await withRetry(() => db.getActions(coupleId, filters), config);

        setActions(fetchedActions);

        // Cache the result
        databaseCache.set(cacheKey, fetchedActions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch actions';
        setError(errorMessage);
        console.error('Error fetching actions:', err);
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, filters]
  );

  useEffect(() => {
    if (couple) {
      loadActions(couple.id);
    }
  }, [couple, loadActions]);

  const refreshActions = useCallback(async () => {
    if (couple) {
      databaseCache.invalidate(`actions_${couple.id}`);
      await loadActions(couple.id);
    }
  }, [couple, loadActions]);

  const createAction = useCallback(
    async (actionData: Omit<Action, 'id' | 'created_at' | 'updated_at' | 'couple_id'>) => {
      if (!couple) throw new Error('No couple found');

      const config = getDatabaseConfig();

      const newAction = await withRetry(
        () =>
          db.createAction({
            ...actionData,
            couple_id: couple.id,
          }),
        config
      );

      await refreshActions();
      return newAction;
    },
    [couple, refreshActions]
  );

  const updateAction = useCallback(
    async (id: string, updates: Partial<Action>) => {
      const config = getDatabaseConfig();
      const updatedAction = await withRetry(() => db.updateAction(id, updates), config);
      await refreshActions();
      return updatedAction;
    },
    [refreshActions]
  );

  const deleteAction = useCallback(
    async (id: string) => {
      const config = getDatabaseConfig();
      await withRetry(() => db.deleteAction(id), config);
      await refreshActions();
    },
    [refreshActions]
  );

  return {
    actions,
    loading,
    error,
    createAction,
    updateAction,
    deleteAction,
    refreshActions,
  };
}
