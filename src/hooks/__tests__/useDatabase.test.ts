import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { User, Couple, Issue, Action } from '@/services/types';

// Mock the database service - must be at top level for hoisting
vi.mock('@/services/database', () => ({
  db: {
    getUser: vi.fn(),
    getCoupleByUser: vi.fn(),
    getIssues: vi.fn(),
    getActions: vi.fn(),
    createIssue: vi.fn(),
    updateIssue: vi.fn(),
    deleteIssue: vi.fn(),
    createAction: vi.fn(),
    updateAction: vi.fn(),
    deleteAction: vi.fn(),
  },
}));

// Import after mocking
import { useCurrentUser, useCurrentCouple, useIssues, useActions } from '../useDatabase';
import { db } from '@/services/database';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useCurrentUser', () => {
  const mockUser: User = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar_url: 'avatar-url',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return null user when no userId in localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.userId).toBeUndefined();
  });

  it('should fetch user when userId exists in localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('user-1'));
    vi.mocked(db.getUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.loading).toBe(true);
    expect(result.current.userId).toBe('user-1');

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.loading).toBe(false);
    });

    expect(db.getUser).toHaveBeenCalledWith('user-1');
  });

  it('should handle database errors gracefully', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('user-1'));
    vi.mocked(db.getUser).mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useCurrentUser());

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(console.error).toHaveBeenCalledWith('Error fetching user:', expect.any(Error));
  });

  it('should handle localStorage parse errors', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json');
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.userId).toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
  });
});

describe('useCurrentCouple', () => {
  const mockCouple: Couple = {
    id: 'couple-1',
    user1_id: 'user-1',
    user2_id: 'user-2',
    status: 'active',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return null couple when no user', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurrentCouple());

    expect(result.current.couple).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should fetch couple when user exists', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('user-1'));
    const mockUser = { id: 'user-1' };
    vi.mocked(db.getUser).mockResolvedValue(mockUser as User);
    vi.mocked(db.getCoupleByUser).mockResolvedValue(mockCouple);

    const { result } = renderHook(() => useCurrentCouple());

    await waitFor(() => {
      expect(result.current.couple).toEqual(mockCouple);
      expect(result.current.loading).toBe(false);
    });

    expect(db.getCoupleByUser).toHaveBeenCalledWith('user-1');
  });

  it('should handle database errors when fetching couple', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('user-1'));
    const mockUser = { id: 'user-1' };
    vi.mocked(db.getUser).mockResolvedValue(mockUser as User);
    vi.mocked(db.getCoupleByUser).mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useCurrentCouple());

    await waitFor(() => {
      expect(result.current.couple).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(console.error).toHaveBeenCalledWith('Error fetching couple:', expect.any(Error));
  });
});

describe('useIssues', () => {
  const mockCouple: Couple = {
    id: 'couple-1',
    user1_id: 'user-1',
    user2_id: 'user-2',
    status: 'active',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockIssues: Issue[] = [
    {
      id: 'issue-1',
      title: 'Communication Issue',
      description: 'Need to improve communication',
      couple_id: 'couple-1',
      status: 'identified',
      priority: 'high',
      position_x: 0,
      position_y: 0,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock current user/couple
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('user-1'));
    const mockUser = { id: 'user-1' };
    vi.mocked(db.getUser).mockResolvedValue(mockUser as User);
    vi.mocked(db.getCoupleByUser).mockResolvedValue(mockCouple);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch issues when couple exists', async () => {
    vi.mocked(db.getIssues).mockResolvedValue(mockIssues);

    const { result } = renderHook(() => useIssues());

    await waitFor(() => {
      expect(result.current.issues).toEqual(mockIssues);
      expect(result.current.loading).toBe(false);
    });

    expect(db.getIssues).toHaveBeenCalledWith('couple-1');
  });

  it('should handle errors when fetching issues', async () => {
    // Setup successful user/couple mocks first
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('user-1'));
    const mockUser = { id: 'user-1' };
    vi.mocked(db.getUser).mockResolvedValue(mockUser as User);
    vi.mocked(db.getCoupleByUser).mockResolvedValue(mockCouple);
    vi.mocked(db.getIssues).mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useIssues());

    await waitFor(() => {
      expect(result.current.issues).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    expect(console.error).toHaveBeenCalledWith('Error fetching issues:', expect.any(Error));
  });

  it('should create new issue', async () => {
    vi.mocked(db.getIssues).mockResolvedValue(mockIssues);
    const newIssue = { ...mockIssues[0], id: 'issue-2', title: 'New Issue' };
    vi.mocked(db.createIssue).mockResolvedValue(newIssue);
    vi.mocked(db.getIssues)
      .mockResolvedValueOnce(mockIssues)
      .mockResolvedValueOnce([...mockIssues, newIssue]);

    const { result } = renderHook(() => useIssues());

    await waitFor(() => {
      expect(result.current.issues).toEqual(mockIssues);
    });

    await act(async () => {
      const created = await result.current.createIssue({
        title: 'New Issue',
        description: 'A new issue',
        status: 'identified',
        priority: 'medium',
        position_x: 0,
        position_y: 0,
      });
      expect(created).toEqual(newIssue);
    });

    expect(db.createIssue).toHaveBeenCalledWith({
      title: 'New Issue',
      description: 'A new issue',
      status: 'identified',
      priority: 'medium',
      position_x: 0,
      position_y: 0,
      couple_id: 'couple-1',
    });
  });

  it('should update existing issue', async () => {
    vi.mocked(db.getIssues).mockResolvedValue(mockIssues);
    const updatedIssue = { ...mockIssues[0], status: 'resolved' as const };
    vi.mocked(db.updateIssue).mockResolvedValue(updatedIssue);

    const { result } = renderHook(() => useIssues());

    await waitFor(() => {
      expect(result.current.issues).toEqual(mockIssues);
    });

    await act(async () => {
      const updated = await result.current.updateIssue('issue-1', { status: 'resolved' });
      expect(updated).toEqual(updatedIssue);
    });

    expect(db.updateIssue).toHaveBeenCalledWith('issue-1', { status: 'resolved' });
  });

  it('should delete issue', async () => {
    vi.mocked(db.getIssues).mockResolvedValue(mockIssues);
    vi.mocked(db.deleteIssue).mockResolvedValue(undefined);

    const { result } = renderHook(() => useIssues());

    await waitFor(() => {
      expect(result.current.issues).toEqual(mockIssues);
    });

    await act(async () => {
      await result.current.deleteIssue('issue-1');
    });

    expect(db.deleteIssue).toHaveBeenCalledWith('issue-1');
  });

  it('should refresh issues manually', async () => {
    vi.mocked(db.getIssues).mockResolvedValue(mockIssues);

    const { result } = renderHook(() => useIssues());

    await waitFor(() => {
      expect(result.current.issues).toEqual(mockIssues);
    });

    await act(async () => {
      await result.current.refreshIssues();
    });

    // Should call getIssues twice - once on mount, once on refresh
    expect(db.getIssues).toHaveBeenCalledTimes(2);
  });

  it('should throw error when creating issue without couple', async () => {
    vi.mocked(db.getCoupleByUser).mockResolvedValue(null);

    const { result } = renderHook(() => useIssues());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      result.current.createIssue({
        title: 'Test',
        description: 'Test',
        status: 'identified',
        priority: 'medium',
        position_x: 0,
        position_y: 0,
      })
    ).rejects.toThrow('No couple found');
  });
});

describe('useActions', () => {
  const mockCouple: Couple = {
    id: 'couple-1',
    user1_id: 'user-1',
    user2_id: 'user-2',
    status: 'active',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockActions: Action[] = [
    {
      id: 'action-1',
      title: 'Weekly Date Night',
      description: 'Plan a weekly date night',
      couple_id: 'couple-1',
      status: 'pending',
      priority: 'medium',
      assigned_to: 'user-1',
      due_date: '2023-12-31',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock current user/couple
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('user-1'));
    const mockUser = { id: 'user-1' };
    vi.mocked(db.getUser).mockResolvedValue(mockUser as User);
    vi.mocked(db.getCoupleByUser).mockResolvedValue(mockCouple);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch actions when couple exists', async () => {
    vi.mocked(db.getActions).mockResolvedValue(mockActions);

    const { result } = renderHook(() => useActions());

    await waitFor(() => {
      expect(result.current.actions).toEqual(mockActions);
      expect(result.current.loading).toBe(false);
    });

    expect(db.getActions).toHaveBeenCalledWith('couple-1', undefined);
  });

  it('should fetch actions with filters', async () => {
    vi.mocked(db.getActions).mockResolvedValue(mockActions);
    const filters = { status: 'pending' as const, assigned_to: 'user-1' };

    const { result } = renderHook(() => useActions(filters));

    await waitFor(() => {
      expect(result.current.actions).toEqual(mockActions);
    });

    expect(db.getActions).toHaveBeenCalledWith('couple-1', filters);
  });

  it('should create new action', async () => {
    vi.mocked(db.getActions).mockResolvedValue(mockActions);
    const newAction = { ...mockActions[0], id: 'action-2', title: 'New Action' };
    vi.mocked(db.createAction).mockResolvedValue(newAction);

    const { result } = renderHook(() => useActions());

    await waitFor(() => {
      expect(result.current.actions).toEqual(mockActions);
    });

    await act(async () => {
      const created = await result.current.createAction({
        title: 'New Action',
        description: 'A new action',
        status: 'pending',
        priority: 'medium',
        assigned_to: 'user-1',
        due_date: '2024-01-01',
      });
      expect(created).toEqual(newAction);
    });

    expect(db.createAction).toHaveBeenCalledWith({
      title: 'New Action',
      description: 'A new action',
      status: 'pending',
      priority: 'medium',
      assigned_to: 'user-1',
      due_date: '2024-01-01',
      couple_id: 'couple-1',
    });
  });

  it('should update existing action', async () => {
    vi.mocked(db.getActions).mockResolvedValue(mockActions);
    const updatedAction = { ...mockActions[0], status: 'completed' as const };
    vi.mocked(db.updateAction).mockResolvedValue(updatedAction);

    const { result } = renderHook(() => useActions());

    await waitFor(() => {
      expect(result.current.actions).toEqual(mockActions);
    });

    await act(async () => {
      const updated = await result.current.updateAction('action-1', { status: 'completed' });
      expect(updated).toEqual(updatedAction);
    });

    expect(db.updateAction).toHaveBeenCalledWith('action-1', { status: 'completed' });
  });

  it('should delete action', async () => {
    vi.mocked(db.getActions).mockResolvedValue(mockActions);
    vi.mocked(db.deleteAction).mockResolvedValue(undefined);

    const { result } = renderHook(() => useActions());

    await waitFor(() => {
      expect(result.current.actions).toEqual(mockActions);
    });

    await act(async () => {
      await result.current.deleteAction('action-1');
    });

    expect(db.deleteAction).toHaveBeenCalledWith('action-1');
  });

  it('should handle errors when fetching actions', async () => {
    // Setup successful user/couple mocks first
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('user-1'));
    const mockUser = { id: 'user-1' };
    vi.mocked(db.getUser).mockResolvedValue(mockUser as User);
    vi.mocked(db.getCoupleByUser).mockResolvedValue(mockCouple);
    vi.mocked(db.getActions).mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useActions());

    await waitFor(() => {
      expect(result.current.actions).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    expect(console.error).toHaveBeenCalledWith('Error fetching actions:', expect.any(Error));
  });

  it('should throw error when creating action without couple', async () => {
    vi.mocked(db.getCoupleByUser).mockResolvedValue(null);

    const { result } = renderHook(() => useActions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      result.current.createAction({
        title: 'Test',
        description: 'Test',
        status: 'pending',
        priority: 'medium',
        assigned_to: 'user-1',
        due_date: '2024-01-01',
      })
    ).rejects.toThrow('No couple found');
  });
});
