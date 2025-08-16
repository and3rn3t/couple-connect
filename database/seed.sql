-- Seed data for Couple Connect Database
-- Run this after creating the schema

-- Issue Categories
INSERT OR IGNORE INTO issue_categories (id, name, description, color, icon, sort_order) VALUES
('communication', 'Communication', 'Issues related to talking, listening, and understanding each other', '#3b82f6', 'ChatBubble', 1),
('intimacy', 'Intimacy & Connection', 'Physical and emotional closeness concerns', '#ec4899', 'Heart', 2),
('finances', 'Finances', 'Money management, spending habits, and financial goals', '#10b981', 'CurrencyDollar', 3),
('household', 'Household & Chores', 'Managing home responsibilities and daily tasks', '#f59e0b', 'Home', 4),
('time', 'Time & Priorities', 'Balancing work, relationship, and personal time', '#8b5cf6', 'Clock', 5),
('family', 'Family & Social', 'Extended family relationships and social dynamics', '#06b6d4', 'Users', 6),
('future', 'Future Planning', 'Goals, dreams, and long-term relationship planning', '#84cc16', 'TrendingUp', 7),
('conflict', 'Conflict Resolution', 'How to handle disagreements and arguments', '#ef4444', 'ExclamationTriangle', 8),
('trust', 'Trust & Security', 'Building and maintaining trust in the relationship', '#6366f1', 'Shield', 9),
('personal', 'Personal Growth', 'Individual development within the relationship', '#14b8a6', 'AcademicCap', 10);

-- Action Templates for Communication
INSERT OR IGNORE INTO action_templates (id, name, description, category, difficulty, estimated_duration, steps, tags, success_rate) VALUES
('daily-check-in', 'Daily 10-Minute Check-In', 'Establish a daily routine for sharing feelings and experiences', 'communication', 'easy', '1-2 weeks to establish habit',
'[
  {"title": "Choose a consistent time", "description": "Pick the same time each day when you''re both available and relaxed"},
  {"title": "Create a distraction-free space", "description": "Turn off phones, TV, and other distractions"},
  {"title": "Share three things", "description": "Each person shares: how they''re feeling, one highlight from their day, and one thing they need from their partner"},
  {"title": "Practice active listening", "description": "Listen without interrupting, ask follow-up questions, and validate feelings"},
  {"title": "End with appreciation", "description": "Each person shares one thing they appreciate about their partner from that day"}
]',
'["communication", "daily-routine", "connection", "listening"]', 0.85),

('active-listening', 'Active Listening Practice', 'Improve listening skills through structured exercises', 'communication', 'medium', '2-3 weeks',
'[
  {"title": "Set up practice sessions", "description": "Schedule 15-minute sessions 3x per week to practice"},
  {"title": "Learn the technique", "description": "One person speaks for 2 minutes while the other only listens - no interrupting"},
  {"title": "Reflect back", "description": "Listener summarizes what they heard and asks \"Did I understand correctly?\""},
  {"title": "Validate emotions", "description": "Acknowledge the speaker''s feelings: \"That sounds frustrating\" or \"I can see why you''d feel excited\""},
  {"title": "Switch roles", "description": "Take turns being speaker and listener"},
  {"title": "Practice in real conversations", "description": "Use these skills during regular discussions and check-ins"}
]',
'["communication", "listening", "validation", "practice"]', 0.78),

-- Action Templates for Household
('chore-rotation', 'Fair Chore Distribution System', 'Create an equitable system for managing household tasks', 'household', 'medium', '1 week setup',
'[
  {"title": "List all household tasks", "description": "Make a complete list of daily, weekly, and monthly chores"},
  {"title": "Rate task preferences", "description": "Each person rates each task: Love it (+2), Like it (+1), Neutral (0), Dislike (-1), Hate it (-2)"},
  {"title": "Assign based on preferences", "description": "Give each person tasks they prefer when possible"},
  {"title": "Balance the workload", "description": "Ensure total time spent is roughly equal between partners"},
  {"title": "Create a tracking system", "description": "Use a shared app, calendar, or chart to track completion"},
  {"title": "Review weekly", "description": "Check in each week to adjust the system as needed"}
]',
'["household", "chores", "fairness", "organization"]', 0.82),

-- Action Templates for Time Management
('weekly-planning', 'Weekly Relationship Planning Session', 'Dedicate time each week to plan together time and individual priorities', 'time', 'easy', '30 minutes weekly',
'[
  {"title": "Schedule weekly meeting", "description": "Pick the same day/time each week for 30-minute planning session"},
  {"title": "Review the past week", "description": "Discuss what went well and what was challenging"},
  {"title": "Plan couple time", "description": "Schedule at least 2 hours of quality time together for the upcoming week"},
  {"title": "Respect individual time", "description": "Ensure each person has scheduled time for personal activities"},
  {"title": "Coordinate schedules", "description": "Share important events, deadlines, and commitments"},
  {"title": "Set one shared goal", "description": "Choose one small thing to work on together this week"}
]',
'["time-management", "planning", "balance", "quality-time"]', 0.79);

-- Sample Achievements
INSERT OR IGNORE INTO achievements (id, name, description, icon, category, points, requirements) VALUES
('first-check-in', 'First Check-In', 'Complete your first daily check-in together', 'ChatBubble', 'milestone', 10,
'{"action_completions": 1, "action_types": ["daily-check-in"]}'),

('week-streak', 'Week Warrior', 'Complete actions for 7 days in a row', 'Fire', 'consistency', 50,
'{"consecutive_days": 7}'),

('communication-master', 'Communication Champion', 'Complete 5 communication-focused actions', 'Star', 'progress', 100,
'{"category_completions": {"communication": 5}}'),

('team-player', 'Perfect Partners', 'Both partners complete actions on the same day 10 times', 'Heart', 'collaboration', 75,
'{"same_day_completions": 10}'),

('issue-resolver', 'Problem Solver', 'Successfully resolve your first relationship issue', 'CheckCircle', 'milestone', 200,
'{"resolved_issues": 1}');
