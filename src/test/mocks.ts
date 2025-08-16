import { vi } from 'vitest';
import type { User, Couple, Issue, Action } from '../services/types';

// Mock database service for testing
export const mockDb = {
  createUser: vi.fn(
    async (userData: Partial<User>): Promise<User> => ({
      id: 'test-user-id',
      name: userData.name || 'Test User',
      email: userData.email || 'test@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  ),

  createCouple: vi.fn(
    async (coupleData: Partial<Couple>): Promise<Couple> => ({
      id: 'test-couple-id',
      user1_id: coupleData.user1_id || 'user1',
      user2_id: coupleData.user2_id || 'user2',
      relationship_name: coupleData.relationship_name || 'Test Relationship',
      anniversary_date: coupleData.anniversary_date || new Date().toISOString(),
      status: coupleData.status || 'active',
      settings: coupleData.settings || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  ),

  createIssue: vi.fn(
    async (issueData: Partial<Issue>): Promise<Issue> => ({
      id: 'test-issue-id',
      couple_id: issueData.couple_id || 'test-couple-id',
      title: issueData.title || 'Test Issue',
      description: issueData.description || 'Test Description',
      category_id: issueData.category_id || 'communication',
      priority: issueData.priority || 'medium',
      status: issueData.status || 'identified',
      position_x: issueData.position_x || 0,
      position_y: issueData.position_y || 0,
      created_by: issueData.created_by || 'user1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: issueData.resolved_at,
    })
  ),

  createAction: vi.fn(
    async (actionData: Partial<Action>): Promise<Action> => ({
      id: 'test-action-id',
      couple_id: actionData.couple_id || 'test-couple-id',
      issue_id: actionData.issue_id || 'test-issue-id',
      title: actionData.title || 'Test Action',
      description: actionData.description || 'Test Action Description',
      assigned_to: actionData.assigned_to || 'user1',
      priority: actionData.priority || 'medium',
      status: actionData.status || 'pending',
      due_date: actionData.due_date || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: actionData.completed_at,
    })
  ),

  getUsers: vi.fn(async (): Promise<User[]> => []),
  getCouples: vi.fn(async (): Promise<Couple[]> => []),
  getIssues: vi.fn(async (): Promise<Issue[]> => []),
  getActions: vi.fn(async (): Promise<Action[]> => []),
  updateUser: vi.fn(),
  updateCouple: vi.fn(),
  updateIssue: vi.fn(),
  updateAction: vi.fn(),
  deleteUser: vi.fn(),
  deleteCouple: vi.fn(),
  deleteIssue: vi.fn(),
  deleteAction: vi.fn(),
};

// Mock KV storage for testing
export const mockKV = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  list: vi.fn(),
};

// Test data factories
export const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createTestCouple = (overrides: Partial<Couple> = {}): Couple => ({
  id: 'test-couple-id',
  user1_id: 'user1',
  user2_id: 'user2',
  relationship_name: 'Test Relationship',
  anniversary_date: '2024-01-01T00:00:00Z',
  status: 'active',
  settings: {},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createTestIssue = (overrides: Partial<Issue> = {}): Issue => ({
  id: 'test-issue-id',
  couple_id: 'test-couple-id',
  title: 'Communication Issue',
  description: 'We need to work on our communication',
  category_id: 'communication',
  priority: 'medium',
  status: 'identified',
  position_x: 100,
  position_y: 200,
  created_by: 'user1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  resolved_at: undefined,
  ...overrides,
});

export const createTestAction = (overrides: Partial<Action> = {}): Action => ({
  id: 'test-action-id',
  couple_id: 'test-couple-id',
  issue_id: 'test-issue-id',
  title: 'Practice Active Listening',
  description: 'Spend 15 minutes practicing active listening exercises',
  assigned_to: 'user1',
  priority: 'medium',
  status: 'pending',
  due_date: '2024-01-07T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  completed_at: undefined,
  ...overrides,
});

// Reset all mocks
export const resetMocks = () => {
  Object.values(mockDb).forEach((mock) => {
    if (vi.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
  Object.values(mockKV).forEach((mock) => {
    if (vi.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
};
