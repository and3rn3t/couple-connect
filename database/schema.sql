-- Couple Connect Database Schema
-- Cloudflare D1 (SQLite) Database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  preferences TEXT, -- JSON string for user preferences
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Couples table - represents the relationship between two users
CREATE TABLE IF NOT EXISTS couples (
  id TEXT PRIMARY KEY,
  user1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship_name TEXT, -- e.g., "John & Jane"
  anniversary_date DATE,
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'archived'
  settings TEXT, -- JSON string for couple-specific settings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user1_id, user2_id)
);

-- Issue categories for organization
CREATE TABLE IF NOT EXISTS issue_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT, -- hex color for UI
  icon TEXT, -- icon name for UI
  sort_order INTEGER DEFAULT 0
);

-- Issues identified by couples - core of the mindmap
CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id TEXT REFERENCES issue_categories(id),
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'identified', -- 'identified', 'in_progress', 'resolved', 'archived'
  position_x REAL DEFAULT 0, -- for mindmap positioning
  position_y REAL DEFAULT 0,
  created_by TEXT REFERENCES users(id),
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Relationships between issues in the mindmap
CREATE TABLE IF NOT EXISTS issue_connections (
  id TEXT PRIMARY KEY,
  issue1_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  issue2_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  connection_type TEXT DEFAULT 'related', -- 'related', 'causes', 'blocks', 'similar'
  strength INTEGER DEFAULT 1, -- 1-5 scale of connection strength
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(issue1_id, issue2_id)
);

-- Action templates - expert-backed strategies
CREATE TABLE IF NOT EXISTS action_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- matches issue categories
  difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  estimated_duration TEXT, -- e.g., "1 week", "2-3 days"
  steps TEXT NOT NULL, -- JSON array of step objects
  tags TEXT, -- JSON array of tags for searchability
  success_rate REAL, -- 0.0-1.0 based on user feedback
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Action plans created from templates or custom
CREATE TABLE IF NOT EXISTS actions (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
  template_id TEXT REFERENCES action_templates(id),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT NOT NULL, -- 'both', 'user1', 'user2', or specific user_id
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'paused', 'cancelled'
  priority TEXT DEFAULT 'medium',
  due_date DATETIME,
  started_at DATETIME,
  completed_at DATETIME,
  estimated_minutes INTEGER, -- time estimate
  actual_minutes INTEGER, -- time actually spent
  custom_steps TEXT, -- JSON array if customized from template
  notes TEXT, -- progress notes
  created_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Action step progress tracking
CREATE TABLE IF NOT EXISTS action_progress (
  id TEXT PRIMARY KEY,
  action_id TEXT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  step_title TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped'
  completed_by TEXT REFERENCES users(id),
  completed_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(action_id, step_index)
);

-- Accountability check-ins between partners
CREATE TABLE IF NOT EXISTS check_ins (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  action_id TEXT REFERENCES actions(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'scheduled', 'manual', 'reminder'
  initiated_by TEXT REFERENCES users(id),
  partner_id TEXT REFERENCES users(id),
  message TEXT,
  response TEXT,
  mood_rating INTEGER, -- 1-5 scale
  progress_rating INTEGER, -- 1-5 scale
  responded_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gamification: achievements and rewards
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  category TEXT, -- 'progress', 'consistency', 'collaboration', 'milestone'
  points INTEGER DEFAULT 0,
  requirements TEXT, -- JSON object describing unlock conditions
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User achievements earned
CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

-- Couple achievements earned together
CREATE TABLE IF NOT EXISTS couple_achievements (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(couple_id, achievement_id)
);

-- Points and streaks tracking
CREATE TABLE IF NOT EXISTS gamification_stats (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  couple_id TEXT REFERENCES couples(id) ON DELETE CASCADE,
  stat_type TEXT NOT NULL, -- 'individual_points', 'couple_points', 'streak_days'
  current_value INTEGER DEFAULT 0,
  highest_value INTEGER DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, couple_id, stat_type)
);

-- Activity log for tracking progress and generating insights
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  couple_id TEXT REFERENCES couples(id),
  activity_type TEXT NOT NULL, -- 'issue_created', 'action_completed', 'check_in_responded', etc.
  entity_type TEXT, -- 'issue', 'action', 'check_in', etc.
  entity_id TEXT, -- ID of the related entity
  metadata TEXT, -- JSON string with additional context
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_couples_users ON couples(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_issues_couple ON issues(couple_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_actions_couple ON actions(couple_id);
CREATE INDEX IF NOT EXISTS idx_actions_assigned ON actions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_actions_status ON actions(status);
CREATE INDEX IF NOT EXISTS idx_actions_due ON actions(due_date);
CREATE INDEX IF NOT EXISTS idx_activity_log_couple ON activity_log(couple_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON activity_log(created_at);
