// Database types for Couple Connect
// These match the schema defined in database/schema.sql

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Couple {
  id: string;
  user1_id: string;
  user2_id: string;
  relationship_name?: string;
  anniversary_date?: string;
  status: 'active' | 'paused' | 'archived';
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface IssueCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sort_order: number;
}

export interface Issue {
  id: string;
  couple_id: string;
  title: string;
  description?: string;
  category_id?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'identified' | 'in_progress' | 'resolved' | 'archived';
  position_x: number;
  position_y: number;
  created_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IssueConnection {
  id: string;
  issue1_id: string;
  issue2_id: string;
  connection_type: 'related' | 'causes' | 'blocks' | 'similar';
  strength: number; // 1-5
  created_at: string;
}

export interface ActionTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_duration?: string;
  steps: ActionStep[];
  tags?: string[];
  success_rate?: number;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActionStep {
  title: string;
  description: string;
}

export interface Action {
  id: string;
  couple_id: string;
  issue_id?: string;
  template_id?: string;
  title: string;
  description?: string;
  assigned_to: string; // 'both', 'user1', 'user2', or user_id
  status: 'pending' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  estimated_minutes?: number;
  actual_minutes?: number;
  custom_steps?: ActionStep[];
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ActionProgress {
  id: string;
  action_id: string;
  step_index: number;
  step_title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_by?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
}

export interface CheckIn {
  id: string;
  couple_id: string;
  action_id?: string;
  type: 'scheduled' | 'manual' | 'reminder';
  initiated_by?: string;
  partner_id?: string;
  message?: string;
  response?: string;
  mood_rating?: number; // 1-5
  progress_rating?: number; // 1-5
  responded_at?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category: 'progress' | 'consistency' | 'collaboration' | 'milestone';
  points: number;
  requirements: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface CoupleAchievement {
  id: string;
  couple_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface GamificationStats {
  id: string;
  user_id?: string;
  couple_id?: string;
  stat_type: 'individual_points' | 'couple_points' | 'streak_days';
  current_value: number;
  highest_value: number;
  last_updated: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  couple_id?: string;
  activity_type: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
  error?: string;
}
