export interface ActionTemplate {
  id: string;
  category:
    | 'communication'
    | 'intimacy'
    | 'finance'
    | 'time'
    | 'family'
    | 'personal-growth'
    | 'other';
  title: string;
  description: string;
  suggestedAssignment: 'partner1' | 'partner2' | 'both';
  suggestedDuration: number; // days
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  relatedTemplates?: string[]; // IDs of templates that work well together
}

export const actionTemplates: ActionTemplate[] = [
  // Communication Templates
  {
    id: 'daily-check-in',
    category: 'communication',
    title: 'Daily 15-minute check-in',
    description:
      'Set aside 15 minutes each evening to share how your day went, discuss any concerns, and plan for tomorrow together.',
    suggestedAssignment: 'both',
    suggestedDuration: 7,
    tags: ['daily', 'routine', 'sharing'],
    difficulty: 'easy',
    relatedTemplates: ['weekly-relationship-meeting'],
  },
  {
    id: 'active-listening-practice',
    category: 'communication',
    title: 'Practice active listening exercises',
    description:
      'Take turns speaking for 5 minutes while the other person listens without interrupting, then summarize what you heard.',
    suggestedAssignment: 'both',
    suggestedDuration: 14,
    tags: ['listening', 'understanding', 'practice'],
    difficulty: 'medium',
  },
  {
    id: 'conflict-resolution-rules',
    category: 'communication',
    title: 'Establish conflict resolution guidelines',
    description:
      "Together, create a set of rules for how you'll handle disagreements (no yelling, taking breaks when heated, etc.).",
    suggestedAssignment: 'both',
    suggestedDuration: 3,
    tags: ['conflict', 'boundaries', 'rules'],
    difficulty: 'medium',
  },
  {
    id: 'weekly-relationship-meeting',
    category: 'communication',
    title: 'Weekly relationship meeting',
    description:
      'Hold a weekly 30-minute meeting to discuss relationship goals, address concerns, and celebrate wins.',
    suggestedAssignment: 'both',
    suggestedDuration: 21,
    tags: ['weekly', 'planning', 'goals'],
    difficulty: 'easy',
    relatedTemplates: ['daily-check-in'],
  },

  // Intimacy Templates
  {
    id: 'date-night-planning',
    category: 'intimacy',
    title: 'Plan weekly date nights',
    description:
      'Take turns planning a special date night each week, focusing on quality time together without distractions.',
    suggestedAssignment: 'both',
    suggestedDuration: 28,
    tags: ['dates', 'quality-time', 'romance'],
    difficulty: 'easy',
  },
  {
    id: 'physical-affection-increase',
    category: 'intimacy',
    title: 'Increase daily physical affection',
    description:
      'Make an effort to include more hugs, kisses, and non-sexual touch throughout each day.',
    suggestedAssignment: 'both',
    suggestedDuration: 14,
    tags: ['touch', 'affection', 'daily'],
    difficulty: 'easy',
  },
  {
    id: 'love-language-practice',
    category: 'intimacy',
    title: "Practice each other's love languages",
    description:
      "Identify your partner's primary love language and consciously express love in that way daily.",
    suggestedAssignment: 'both',
    suggestedDuration: 21,
    tags: ['love-languages', 'expression', 'understanding'],
    difficulty: 'medium',
  },
  {
    id: 'intimacy-conversation',
    category: 'intimacy',
    title: 'Have an open intimacy conversation',
    description:
      'Schedule a comfortable, private time to openly discuss your intimacy needs, desires, and boundaries.',
    suggestedAssignment: 'both',
    suggestedDuration: 1,
    tags: ['conversation', 'needs', 'boundaries'],
    difficulty: 'hard',
  },

  // Finance Templates
  {
    id: 'budget-meeting',
    category: 'finance',
    title: 'Monthly budget review meeting',
    description:
      'Meet monthly to review expenses, discuss financial goals, and adjust your budget as needed.',
    suggestedAssignment: 'both',
    suggestedDuration: 30,
    tags: ['budget', 'monthly', 'planning'],
    difficulty: 'medium',
  },
  {
    id: 'spending-transparency',
    category: 'finance',
    title: 'Implement spending transparency',
    description:
      'Agree on a spending limit that requires discussion with your partner before making purchases.',
    suggestedAssignment: 'both',
    suggestedDuration: 14,
    tags: ['transparency', 'spending', 'agreement'],
    difficulty: 'medium',
  },
  {
    id: 'financial-goals-setting',
    category: 'finance',
    title: 'Set shared financial goals',
    description:
      'Together, identify 3 financial goals (short, medium, long-term) and create action plans to achieve them.',
    suggestedAssignment: 'both',
    suggestedDuration: 7,
    tags: ['goals', 'planning', 'future'],
    difficulty: 'easy',
  },
  {
    id: 'expense-tracking',
    category: 'finance',
    title: 'Track all expenses for two weeks',
    description:
      'Both partners track every expense to get a clear picture of spending patterns and identify areas for improvement.',
    suggestedAssignment: 'both',
    suggestedDuration: 14,
    tags: ['tracking', 'awareness', 'data'],
    difficulty: 'easy',
  },

  // Time Management Templates
  {
    id: 'quality-time-scheduling',
    category: 'time',
    title: 'Schedule protected quality time',
    description:
      'Block out specific times each week that are dedicated solely to being together without work or other distractions.',
    suggestedAssignment: 'both',
    suggestedDuration: 21,
    tags: ['scheduling', 'quality-time', 'boundaries'],
    difficulty: 'easy',
  },
  {
    id: 'shared-calendar',
    category: 'time',
    title: 'Create a shared calendar system',
    description:
      'Set up a shared digital calendar to coordinate schedules, plan together time, and avoid conflicts.',
    suggestedAssignment: 'both',
    suggestedDuration: 3,
    tags: ['calendar', 'coordination', 'planning'],
    difficulty: 'easy',
  },
  {
    id: 'digital-boundaries',
    category: 'time',
    title: 'Establish phone-free times',
    description:
      'Agree on specific times (meals, first hour home, etc.) when phones and devices are put away.',
    suggestedAssignment: 'both',
    suggestedDuration: 14,
    tags: ['boundaries', 'digital', 'presence'],
    difficulty: 'medium',
  },
  {
    id: 'individual-time-respect',
    category: 'time',
    title: 'Respect individual time needs',
    description:
      'Discuss and schedule regular individual time for personal hobbies, friends, and self-care.',
    suggestedAssignment: 'both',
    suggestedDuration: 14,
    tags: ['individual', 'balance', 'respect'],
    difficulty: 'medium',
  },

  // Family Templates
  {
    id: 'family-meeting',
    category: 'family',
    title: 'Weekly family meetings',
    description:
      'Hold regular family meetings to discuss schedules, address issues, and make decisions together.',
    suggestedAssignment: 'both',
    suggestedDuration: 28,
    tags: ['family', 'meetings', 'decisions'],
    difficulty: 'easy',
  },
  {
    id: 'parenting-strategy-align',
    category: 'family',
    title: 'Align parenting strategies',
    description:
      'Discuss and agree on consistent parenting approaches, discipline methods, and household rules.',
    suggestedAssignment: 'both',
    suggestedDuration: 7,
    tags: ['parenting', 'consistency', 'rules'],
    difficulty: 'medium',
  },
  {
    id: 'extended-family-boundaries',
    category: 'family',
    title: 'Set extended family boundaries',
    description:
      'Discuss and establish boundaries with extended family regarding holidays, visits, and involvement in decisions.',
    suggestedAssignment: 'both',
    suggestedDuration: 7,
    tags: ['boundaries', 'extended-family', 'decisions'],
    difficulty: 'hard',
  },

  // Personal Growth Templates
  {
    id: 'support-goals',
    category: 'personal-growth',
    title: "Support each other's personal goals",
    description:
      'Share individual goals with each other and create specific ways to support and encourage progress.',
    suggestedAssignment: 'both',
    suggestedDuration: 21,
    tags: ['goals', 'support', 'encouragement'],
    difficulty: 'easy',
  },
  {
    id: 'gratitude-practice',
    category: 'personal-growth',
    title: 'Daily gratitude sharing',
    description:
      "Each evening, share three things you're grateful for, including at least one thing about your partner.",
    suggestedAssignment: 'both',
    suggestedDuration: 21,
    tags: ['gratitude', 'daily', 'appreciation'],
    difficulty: 'easy',
  },
  {
    id: 'relationship-education',
    category: 'personal-growth',
    title: 'Read relationship book together',
    description: 'Choose a relationship book to read together and discuss one chapter each week.',
    suggestedAssignment: 'both',
    suggestedDuration: 56,
    tags: ['education', 'reading', 'discussion'],
    difficulty: 'medium',
  },
  {
    id: 'counseling-commitment',
    category: 'personal-growth',
    title: 'Attend couples counseling sessions',
    description:
      'Commit to attending couples counseling sessions to work on your relationship with professional guidance.',
    suggestedAssignment: 'both',
    suggestedDuration: 84,
    tags: ['counseling', 'professional', 'commitment'],
    difficulty: 'hard',
  },
];

export const getTemplatesByCategory = (category: ActionTemplate['category']): ActionTemplate[] => {
  return actionTemplates.filter((template) => template.category === category);
};

export const getTemplateById = (id: string): ActionTemplate | undefined => {
  return actionTemplates.find((template) => template.id === id);
};

export const getRelatedTemplates = (templateId: string): ActionTemplate[] => {
  const template = getTemplateById(templateId);
  if (!template?.relatedTemplates) return [];

  return template.relatedTemplates
    .map((id) => getTemplateById(id))
    .filter(Boolean) as ActionTemplate[];
};

export const searchTemplates = (query: string): ActionTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return actionTemplates.filter(
    (template) =>
      template.title.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};
