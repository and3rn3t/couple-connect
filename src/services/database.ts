// Database service for Couple Connect
// This service handles all database operations for the application

import {
  User,
  Couple,
  Issue,
  Action,
  ActionTemplate,
  IssueCategory,
  Achievement,
  GamificationStats,
  ActivityLog,
} from './types';

// Database interface (will be implemented differently for development vs production)
export interface DatabaseService {
  // User operations
  getUser(id: string): Promise<User | null>;
  createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Couple operations
  getCouple(id: string): Promise<Couple | null>;
  getCoupleByUser(userId: string): Promise<Couple | null>;
  createCouple(couple: Omit<Couple, 'id' | 'created_at' | 'updated_at'>): Promise<Couple>;
  updateCouple(id: string, updates: Partial<Couple>): Promise<Couple>;

  // Issue operations
  getIssues(coupleId: string): Promise<Issue[]>;
  getIssue(id: string): Promise<Issue | null>;
  createIssue(issue: Omit<Issue, 'id' | 'created_at' | 'updated_at'>): Promise<Issue>;
  updateIssue(id: string, updates: Partial<Issue>): Promise<Issue>;
  deleteIssue(id: string): Promise<void>;

  // Action operations
  getActions(
    coupleId: string,
    filters?: { status?: string; assigned_to?: string }
  ): Promise<Action[]>;
  getAction(id: string): Promise<Action | null>;
  createAction(action: Omit<Action, 'id' | 'created_at' | 'updated_at'>): Promise<Action>;
  updateAction(id: string, updates: Partial<Action>): Promise<Action>;
  deleteAction(id: string): Promise<void>;

  // Template operations
  getActionTemplates(category?: string): Promise<ActionTemplate[]>;
  getActionTemplate(id: string): Promise<ActionTemplate | null>;

  // Category operations
  getIssueCategories(): Promise<IssueCategory[]>;

  // Gamification operations
  getUserStats(userId: string): Promise<GamificationStats[]>;
  getCoupleStats(coupleId: string): Promise<GamificationStats[]>;
  updateStats(stats: Partial<GamificationStats>): Promise<GamificationStats>;

  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  getCoupleAchievements(coupleId: string): Promise<Achievement[]>;

  // Activity logging
  logActivity(activity: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog>;
  getActivityLog(coupleId: string, limit?: number): Promise<ActivityLog[]>;
}

// LocalStorage implementation for development
export class LocalStorageDatabase implements DatabaseService {
  private getKey(type: string, id?: string): string {
    return id ? `cc_${type}_${id}` : `cc_${type}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private getFromStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  private setToStorage(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  }

  private getAllFromStorage<T>(prefix: string): T[] {
    const items: T[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        const item = this.getFromStorage<T>(key);
        if (item) items.push(item);
      }
    }
    return items;
  }

  async getUser(id: string): Promise<User | null> {
    return this.getFromStorage<User>(this.getKey('user', id));
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const user: User = {
      ...userData,
      id: this.generateId(),
      created_at: this.getTimestamp(),
      updated_at: this.getTimestamp(),
    };
    this.setToStorage(this.getKey('user', user.id), user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error('User not found');

    const updatedUser = { ...user, ...updates, updated_at: this.getTimestamp() };
    this.setToStorage(this.getKey('user', id), updatedUser);
    return updatedUser;
  }

  async getCouple(id: string): Promise<Couple | null> {
    return this.getFromStorage<Couple>(this.getKey('couple', id));
  }

  async getCoupleByUser(userId: string): Promise<Couple | null> {
    const couples = this.getAllFromStorage<Couple>('cc_couple_');
    return couples.find((c) => c.user1_id === userId || c.user2_id === userId) || null;
  }

  async createCouple(
    coupleData: Omit<Couple, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Couple> {
    const couple: Couple = {
      ...coupleData,
      id: this.generateId(),
      created_at: this.getTimestamp(),
      updated_at: this.getTimestamp(),
    };
    this.setToStorage(this.getKey('couple', couple.id), couple);
    return couple;
  }

  async updateCouple(id: string, updates: Partial<Couple>): Promise<Couple> {
    const couple = await this.getCouple(id);
    if (!couple) throw new Error('Couple not found');

    const updatedCouple = { ...couple, ...updates, updated_at: this.getTimestamp() };
    this.setToStorage(this.getKey('couple', id), updatedCouple);
    return updatedCouple;
  }

  async getIssues(coupleId: string): Promise<Issue[]> {
    const issues = this.getAllFromStorage<Issue>('cc_issue_');
    return issues.filter((issue) => issue.couple_id === coupleId);
  }

  async getIssue(id: string): Promise<Issue | null> {
    return this.getFromStorage<Issue>(this.getKey('issue', id));
  }

  async createIssue(issueData: Omit<Issue, 'id' | 'created_at' | 'updated_at'>): Promise<Issue> {
    const issue: Issue = {
      ...issueData,
      id: this.generateId(),
      created_at: this.getTimestamp(),
      updated_at: this.getTimestamp(),
    };
    this.setToStorage(this.getKey('issue', issue.id), issue);
    return issue;
  }

  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue> {
    const issue = await this.getIssue(id);
    if (!issue) throw new Error('Issue not found');

    const updatedIssue = { ...issue, ...updates, updated_at: this.getTimestamp() };
    this.setToStorage(this.getKey('issue', id), updatedIssue);
    return updatedIssue;
  }

  async deleteIssue(id: string): Promise<void> {
    localStorage.removeItem(this.getKey('issue', id));
  }

  async getActions(
    coupleId: string,
    filters?: { status?: string; assigned_to?: string }
  ): Promise<Action[]> {
    let actions = this.getAllFromStorage<Action>('cc_action_');
    actions = actions.filter((action) => action.couple_id === coupleId);

    if (filters?.status) {
      actions = actions.filter((action) => action.status === filters.status);
    }
    if (filters?.assigned_to) {
      actions = actions.filter((action) => action.assigned_to === filters.assigned_to);
    }

    return actions;
  }

  async getAction(id: string): Promise<Action | null> {
    return this.getFromStorage<Action>(this.getKey('action', id));
  }

  async createAction(
    actionData: Omit<Action, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Action> {
    const action: Action = {
      ...actionData,
      id: this.generateId(),
      created_at: this.getTimestamp(),
      updated_at: this.getTimestamp(),
    };
    this.setToStorage(this.getKey('action', action.id), action);
    return action;
  }

  async updateAction(id: string, updates: Partial<Action>): Promise<Action> {
    const action = await this.getAction(id);
    if (!action) throw new Error('Action not found');

    const updatedAction = { ...action, ...updates, updated_at: this.getTimestamp() };
    this.setToStorage(this.getKey('action', id), updatedAction);
    return updatedAction;
  }

  async deleteAction(id: string): Promise<void> {
    localStorage.removeItem(this.getKey('action', id));
  }

  async getActionTemplates(category?: string): Promise<ActionTemplate[]> {
    let templates = this.getAllFromStorage<ActionTemplate>('cc_template_');
    if (category) {
      templates = templates.filter((template) => template.category === category);
    }
    return templates.filter((template) => template.is_active);
  }

  async getActionTemplate(id: string): Promise<ActionTemplate | null> {
    return this.getFromStorage<ActionTemplate>(this.getKey('template', id));
  }

  async getIssueCategories(): Promise<IssueCategory[]> {
    return this.getAllFromStorage<IssueCategory>('cc_category_');
  }

  async getUserStats(userId: string): Promise<GamificationStats[]> {
    const stats = this.getAllFromStorage<GamificationStats>('cc_stats_');
    return stats.filter((stat) => stat.user_id === userId);
  }

  async getCoupleStats(coupleId: string): Promise<GamificationStats[]> {
    const stats = this.getAllFromStorage<GamificationStats>('cc_stats_');
    return stats.filter((stat) => stat.couple_id === coupleId);
  }

  async updateStats(statsData: Partial<GamificationStats>): Promise<GamificationStats> {
    const existingStats = this.getAllFromStorage<GamificationStats>('cc_stats_').find(
      (s) =>
        s.user_id === statsData.user_id &&
        s.couple_id === statsData.couple_id &&
        s.stat_type === statsData.stat_type
    );

    if (existingStats) {
      const updatedStats = { ...existingStats, ...statsData, last_updated: this.getTimestamp() };
      this.setToStorage(this.getKey('stats', existingStats.id), updatedStats);
      return updatedStats;
    } else {
      const newStats: GamificationStats = {
        ...(statsData as GamificationStats),
        id: this.generateId(),
        current_value: statsData.current_value ?? 0,
        highest_value: statsData.highest_value ?? 0,
        last_updated: this.getTimestamp(),
      };
      this.setToStorage(this.getKey('stats', newStats.id), newStats);
      return newStats;
    }
  }

  async getAchievements(): Promise<Achievement[]> {
    return this.getAllFromStorage<Achievement>('cc_achievement_').filter((a) => a.is_active);
  }

  async getUserAchievements(_userId: string): Promise<Achievement[]> {
    // This is simplified - in real implementation would join tables
    return [];
  }

  async getCoupleAchievements(_coupleId: string): Promise<Achievement[]> {
    // This is simplified - in real implementation would join tables
    return [];
  }

  async logActivity(activityData: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog> {
    const activity: ActivityLog = {
      ...activityData,
      id: this.generateId(),
      created_at: this.getTimestamp(),
    };
    this.setToStorage(this.getKey('activity', activity.id), activity);
    return activity;
  }

  async getActivityLog(coupleId: string, limit = 50): Promise<ActivityLog[]> {
    const activities = this.getAllFromStorage<ActivityLog>('cc_activity_');
    return activities
      .filter((activity) => activity.couple_id === coupleId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }
}

// Singleton instance - will be replaced with factory pattern for production
export const db = new LocalStorageDatabase();

// Factory function for creating database instances
export function createDatabaseService(env?: { DB?: unknown }): DatabaseService {
  if (env?.DB) {
    // In production, this would create a D1 database instance
    // For now, fallback to localStorage
    console.warn('D1 database detected but not implemented yet, using localStorage');
    return new LocalStorageDatabase();
  }
  return new LocalStorageDatabase();
}
