import { db } from './database';

// Utility functions to initialize the database with seed data
export async function initializeDatabase() {
  try {
    // Check if data already exists
    const existingCategories = await db.getIssueCategories();
    if (existingCategories.length > 0) {
      return;
    }

    // Seed issue categories
    await seedIssueCategories();

    // Seed action templates
    await seedActionTemplates();

    // Seed achievements
    await seedAchievements();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

async function seedIssueCategories() {
  const categories = [
    {
      id: 'communication',
      name: 'Communication',
      description: 'Issues related to talking, listening, and understanding each other',
      color: '#3b82f6',
      icon: 'ChatBubble',
      sort_order: 1,
    },
    {
      id: 'intimacy-and-connection',
      name: 'Intimacy & Connection',
      description: 'Physical and emotional closeness concerns',
      color: '#ec4899',
      icon: 'Heart',
      sort_order: 2,
    },
    {
      id: 'finances',
      name: 'Finances',
      description: 'Money management, spending habits, and financial goals',
      color: '#10b981',
      icon: 'CurrencyDollar',
      sort_order: 3,
    },
    {
      id: 'household-and-chores',
      name: 'Household & Chores',
      description: 'Managing home responsibilities and daily tasks',
      color: '#f59e0b',
      icon: 'Home',
      sort_order: 4,
    },
    {
      id: 'time-and-priorities',
      name: 'Time & Priorities',
      description: 'Balancing work, relationship, and personal time',
      color: '#8b5cf6',
      icon: 'Clock',
      sort_order: 5,
    },
    {
      id: 'family-and-social',
      name: 'Family & Social',
      description: 'Extended family relationships and social dynamics',
      color: '#06b6d4',
      icon: 'Users',
      sort_order: 6,
    },
    {
      id: 'future-planning',
      name: 'Future Planning',
      description: 'Goals, dreams, and long-term relationship planning',
      color: '#84cc16',
      icon: 'TrendingUp',
      sort_order: 7,
    },
    {
      id: 'conflict-resolution',
      name: 'Conflict Resolution',
      description: 'How to handle disagreements and arguments',
      color: '#ef4444',
      icon: 'ExclamationTriangle',
      sort_order: 8,
    },
    {
      id: 'trust-and-security',
      name: 'Trust & Security',
      description: 'Building and maintaining trust in the relationship',
      color: '#6366f1',
      icon: 'Shield',
      sort_order: 9,
    },
    {
      id: 'personal-growth',
      name: 'Personal Growth',
      description: 'Individual development within the relationship',
      color: '#14b8a6',
      icon: 'AcademicCap',
      sort_order: 10,
    },
  ];

  categories.forEach((category) => {
    localStorage.setItem(`cc_category_${category.id}`, JSON.stringify(category));
  });
}

async function seedActionTemplates() {
  const templates = [
    {
      id: 'daily-10-minute-check-in',
      name: 'Daily 10-Minute Check-In',
      description: 'Establish a daily routine for sharing feelings and experiences',
      category: 'communication',
      difficulty: 'easy' as const,
      estimated_duration: '1-2 weeks to establish habit',
      steps: [
        {
          title: 'Choose a consistent time',
          description: "Pick the same time each day when you're both available and relaxed",
        },
        {
          title: 'Create a distraction-free space',
          description: 'Turn off phones, TV, and other distractions',
        },
        {
          title: 'Share three things',
          description:
            "Each person shares: how they're feeling, one highlight from their day, and one thing they need from their partner",
        },
        {
          title: 'Practice active listening',
          description:
            'Listen without interrupting, ask follow-up questions, and validate feelings',
        },
        {
          title: 'End with appreciation',
          description:
            'Each person shares one thing they appreciate about their partner from that day',
        },
      ],
      tags: ['communication', 'daily-routine', 'connection', 'listening'],
      success_rate: 0.85,
      usage_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'active-listening-practice',
      name: 'Active Listening Practice',
      description: 'Improve listening skills through structured exercises',
      category: 'communication',
      difficulty: 'medium' as const,
      estimated_duration: '2-3 weeks',
      steps: [
        {
          title: 'Set up practice sessions',
          description: 'Schedule 15-minute sessions 3x per week to practice',
        },
        {
          title: 'Learn the technique',
          description:
            'One person speaks for 2 minutes while the other only listens - no interrupting',
        },
        {
          title: 'Reflect back',
          description: 'Listener summarizes what they heard and asks "Did I understand correctly?"',
        },
        {
          title: 'Validate emotions',
          description:
            'Acknowledge the speaker\'s feelings: "That sounds frustrating" or "I can see why you\'d feel excited"',
        },
        {
          title: 'Switch roles',
          description: 'Take turns being speaker and listener',
        },
        {
          title: 'Practice in real conversations',
          description: 'Use these skills during regular discussions and check-ins',
        },
      ],
      tags: ['communication', 'listening', 'validation', 'practice'],
      success_rate: 0.78,
      usage_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  templates.forEach((template) => {
    localStorage.setItem(`cc_template_${template.id}`, JSON.stringify(template));
  });
}

async function seedAchievements() {
  const achievements = [
    {
      id: 'first-check-in',
      name: 'First Check-In',
      description: 'Complete your first daily check-in together',
      icon: 'ChatBubble',
      category: 'milestone' as const,
      points: 10,
      requirements: { action_completions: 1, action_types: ['daily-check-in'] },
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'week-warrior',
      name: 'Week Warrior',
      description: 'Complete actions for 7 days in a row',
      icon: 'Fire',
      category: 'consistency' as const,
      points: 50,
      requirements: { consecutive_days: 7 },
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  achievements.forEach((achievement) => {
    localStorage.setItem(`cc_achievement_${achievement.id}`, JSON.stringify(achievement));
  });
}

// Helper function to clear all data (useful for development)
export function clearDatabase() {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith('cc_'));
  keys.forEach((key) => localStorage.removeItem(key));
}

// Helper function to export current data (useful for migration)
export function exportDatabase() {
  const data: Record<string, unknown> = {};
  const keys = Object.keys(localStorage).filter((key) => key.startsWith('cc_'));
  keys.forEach((key) => {
    try {
      data[key] = JSON.parse(localStorage.getItem(key) || '');
    } catch (error) {
      console.warn(`Error parsing data for key ${key}:`, error);
    }
  });
  return data;
}
