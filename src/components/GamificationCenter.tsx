import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Star,
  Flame,
  Gift,
  TrendUp,
  Heart,
  Target,
  ChartBar,
  Users,
  Calendar,
  Lightning,
} from '@/components/ui/InlineIcons';
import { Action, Issue } from '@/App';
import { Partner } from './PartnerSetup';
import { toast } from 'sonner';
import CelebrationAnimation from './CelebrationAnimation';

// Gamification constants
const ACHIEVEMENT_POINTS = {
  FIRST_STEPS: 50,
  GETTING_STARTED: 200,
  MONTH_STREAK: 500,
  HUNDRED_DAY_STREAK: 1000,
  ACTION_STARTER: 150,
  ACTION_ACHIEVER: 400,
  ISSUE_RESOLVER: 300,
  SUPPORTIVE_PARTNER: 250,
  TEAM_BUILDER: 200,
  RELATIONSHIP_CHAMPION: 600,
} as const;

const ACHIEVEMENT_THRESHOLDS = {
  ACTIONS_COMPLETED_BASIC: 10,
  ACTIONS_COMPLETED_ADVANCED: 50,
  CONSECUTIVE_DAYS_MONTH: 30,
  CONSECUTIVE_DAYS_HUNDRED: 100,
  ACTIONS_CREATED_BASIC: 10,
} as const;

const UI_CONSTANTS = {
  ACHIEVEMENT_TOAST_DURATION: 5000,
} as const;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'consistency' | 'completion' | 'collaboration' | 'growth' | 'milestone';
  points: number;
  unlockedAt?: string;
  unlockedBy?: string; // Partner ID
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type:
      | 'actions_completed'
      | 'consecutive_days'
      | 'issues_resolved'
      | 'actions_created'
      | 'health_score'
      | 'partner_actions';
    count: number;
    timeframe?: number; // days
  };
}

export interface GamificationState {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  achievements: Achievement[];
  weeklyGoal: number;
  weeklyProgress: number;
  partnerStats: {
    [partnerId: string]: {
      points: number;
      achievements: string[];
      streak: number;
    };
  };
}

interface GamificationCenterProps {
  actions: Action[];
  issues: Issue[];
  currentPartner: Partner;
  otherPartner: Partner;
  gamificationState: GamificationState;
  onUpdateGamification: (state: GamificationState) => void;
}

const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'unlockedBy'>[] = [
  // Consistency Achievements
  {
    id: 'first-action',
    title: 'Getting Started',
    description: 'Complete your first action together',
    icon: <Target className="w-5 h-5" />,
    category: 'milestone',
    points: ACHIEVEMENT_POINTS.FIRST_STEPS,
    rarity: 'common',
    requirements: { type: 'actions_completed', count: 1 },
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Stay active for 7 consecutive days',
    icon: <Flame className="w-5 h-5" />,
    category: 'consistency',
    points: ACHIEVEMENT_POINTS.GETTING_STARTED,
    rarity: 'rare',
    requirements: { type: 'consecutive_days', count: 7 },
  },
  {
    id: 'month-master',
    title: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: <Calendar className="w-5 h-5" />,
    category: 'consistency',
    points: ACHIEVEMENT_POINTS.MONTH_STREAK,
    rarity: 'epic',
    requirements: {
      type: 'consecutive_days',
      count: ACHIEVEMENT_THRESHOLDS.CONSECUTIVE_DAYS_MONTH,
    },
  },
  {
    id: 'dedication-legend',
    title: 'Dedication Legend',
    description: 'Achieve a 100-day streak',
    icon: <Lightning className="w-5 h-5" />,
    category: 'consistency',
    points: ACHIEVEMENT_POINTS.HUNDRED_DAY_STREAK,
    rarity: 'legendary',
    requirements: {
      type: 'consecutive_days',
      count: ACHIEVEMENT_THRESHOLDS.CONSECUTIVE_DAYS_HUNDRED,
    },
  },
  // Completion Achievements
  {
    id: 'action-hero',
    title: 'Action Hero',
    description: 'Complete 10 actions',
    icon: <Trophy className="w-5 h-5" />,
    category: 'completion',
    points: ACHIEVEMENT_POINTS.ACTION_STARTER,
    rarity: 'common',
    requirements: {
      type: 'actions_completed',
      count: ACHIEVEMENT_THRESHOLDS.ACTIONS_COMPLETED_BASIC,
    },
  },
  {
    id: 'productivity-champion',
    title: 'Productivity Champion',
    description: 'Complete 50 actions',
    icon: <Star className="w-5 h-5" />,
    category: 'completion',
    points: ACHIEVEMENT_POINTS.ACTION_ACHIEVER,
    rarity: 'rare',
    requirements: {
      type: 'actions_completed',
      count: ACHIEVEMENT_THRESHOLDS.ACTIONS_COMPLETED_ADVANCED,
    },
  },
  {
    id: 'resolution-master',
    title: 'Resolution Master',
    description: 'Help resolve 5 relationship issues',
    icon: <Heart className="w-5 h-5" />,
    category: 'growth',
    points: ACHIEVEMENT_POINTS.ISSUE_RESOLVER,
    rarity: 'rare',
    requirements: { type: 'issues_resolved', count: 5 },
  },
  // Collaboration Achievements
  {
    id: 'team-player',
    title: 'Team Player',
    description: 'Complete 5 actions assigned by your partner',
    icon: <Users className="w-5 h-5" />,
    category: 'collaboration',
    points: ACHIEVEMENT_POINTS.SUPPORTIVE_PARTNER,
    rarity: 'rare',
    requirements: { type: 'partner_actions', count: 5 },
  },
  {
    id: 'supportive-partner',
    title: 'Supportive Partner',
    description: 'Create 10 actions for your partner',
    icon: <Gift className="w-5 h-5" />,
    category: 'collaboration',
    points: ACHIEVEMENT_POINTS.TEAM_BUILDER,
    rarity: 'common',
    requirements: { type: 'actions_created', count: ACHIEVEMENT_THRESHOLDS.ACTIONS_CREATED_BASIC },
  },
  // Growth Achievements
  {
    id: 'relationship-guru',
    title: 'Relationship Guru',
    description: 'Achieve an overall health score of 9+',
    icon: <TrendUp className="w-5 h-5" />,
    category: 'growth',
    points: 600,
    rarity: 'epic',
    requirements: { type: 'health_score', count: 9 },
  },
];

export default function GamificationCenter({
  actions,
  issues,
  currentPartner,
  otherPartner,
  gamificationState,
  onUpdateGamification,
}: GamificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [_newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    type: 'achievement' | 'streak' | 'reward' | 'challenge';
    title: string;
    points?: number;
  } | null>(null);

  // Calculate statistics for achievements
  const calculateStats = () => {
    const completedActions = actions.filter((a) => a.status === 'completed');
    const userCompletedActions = completedActions.filter(
      (a) => a.completedBy === currentPartner.id
    );
    const partnerCreatedActions = actions.filter(
      (a) => a.createdBy === otherPartner.id && a.completedBy === currentPartner.id
    );
    const userCreatedActions = actions.filter((a) => a.createdBy === currentPartner.id);
    const resolvedIssues = issues.filter((i) => {
      const relatedActions = actions.filter((a) => a.issueId === i.id);
      return relatedActions.length > 0 && relatedActions.every((a) => a.status === 'completed');
    });

    return {
      completedActions: userCompletedActions.length,
      partnerActions: partnerCreatedActions.length,
      createdActions: userCreatedActions.length,
      resolvedIssues: resolvedIssues.length,
    };
  };

  // Check for new achievements
  const checkAchievements = () => {
    const stats = calculateStats();
    const unlockedAchievements = gamificationState.achievements.map((a) => a.id);
    const newlyUnlocked: Achievement[] = [];

    DEFAULT_ACHIEVEMENTS.forEach((achievement) => {
      if (unlockedAchievements.includes(achievement.id)) return;

      let unlocked = false;
      const req = achievement.requirements;

      switch (req.type) {
        case 'actions_completed':
          unlocked = stats.completedActions >= req.count;
          break;
        case 'consecutive_days':
          unlocked = gamificationState.currentStreak >= req.count;
          break;
        case 'issues_resolved':
          unlocked = stats.resolvedIssues >= req.count;
          break;
        case 'actions_created':
          unlocked = stats.createdActions >= req.count;
          break;
        case 'partner_actions':
          unlocked = stats.partnerActions >= req.count;
          break;
        case 'health_score':
          // This would need health score data passed in
          unlocked = false;
          break;
      }

      if (unlocked) {
        const unlockedAchievement: Achievement = {
          ...achievement,
          unlockedAt: new Date().toISOString(),
          unlockedBy: currentPartner.id,
        };
        newlyUnlocked.push(unlockedAchievement);
      }
    });

    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked);

      const updatedState = {
        ...gamificationState,
        achievements: [...gamificationState.achievements, ...newlyUnlocked],
        totalPoints:
          gamificationState.totalPoints + newlyUnlocked.reduce((sum, a) => sum + a.points, 0),
      };

      onUpdateGamification(updatedState);

      // Show toast for new achievements
      newlyUnlocked.forEach((achievement) => {
        toast.success(`🏆 Achievement Unlocked: ${achievement.title}!`, {
          description: `+${achievement.points} points`,
          duration: UI_CONSTANTS.ACHIEVEMENT_TOAST_DURATION,
        });

        // Show celebration animation for first achievement
        if (newlyUnlocked.indexOf(achievement) === 0) {
          setCelebrationData({
            type: 'achievement',
            title: achievement.title,
            points: achievement.points,
          });
          setShowCelebration(true);
        }
      });
    }
  };

  // Update streak and daily activity
  const updateDailyActivity = () => {
    const today = new Date().toDateString();
    const lastActivity = gamificationState.lastActivityDate;

    if (lastActivity !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let newStreak = 1;
      if (lastActivity === yesterday.toDateString()) {
        newStreak = gamificationState.currentStreak + 1;
      }

      const updatedState = {
        ...gamificationState,
        currentStreak: newStreak,
        longestStreak: Math.max(gamificationState.longestStreak, newStreak),
        lastActivityDate: today,
      };

      onUpdateGamification(updatedState);
    }
  };

  useEffect(() => {
    updateDailyActivity();
    checkAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, issues]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-zinc-100 text-zinc-800';
      case 'rare':
        return 'bg-blue-100 text-blue-800';
      case 'epic':
        return 'bg-purple-100 text-purple-800';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'consistency':
        return <Flame className="w-4 h-4" />;
      case 'completion':
        return <Target className="w-4 h-4" />;
      case 'collaboration':
        return <Users className="w-4 h-4" />;
      case 'growth':
        return <TrendUp className="w-4 h-4" />;
      case 'milestone':
        return <Trophy className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const weeklyProgressPercentage = Math.min(
    (gamificationState.weeklyProgress / gamificationState.weeklyGoal) * 100,
    100
  );

  return (
    <>
      <CelebrationAnimation
        show={showCelebration}
        type={celebrationData?.type || 'achievement'}
        title={celebrationData?.title || ''}
        points={celebrationData?.points}
        onComplete={() => {
          setShowCelebration(false);
          setCelebrationData(null);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Trophy className="w-4 h-4 mr-2" />
            {gamificationState.totalPoints} pts
            {gamificationState.currentStreak > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                <Flame className="w-3 h-3 mr-1" />
                {gamificationState.currentStreak}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              Relationship Achievements
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Points</p>
                      <p className="text-2xl font-semibold">{gamificationState.totalPoints}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                      <p className="text-2xl font-semibold">{gamificationState.currentStreak}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Achievements</p>
                      <p className="text-2xl font-semibold">
                        {gamificationState.achievements.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <ChartBar className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Best Streak</p>
                      <p className="text-2xl font-semibold">{gamificationState.longestStreak}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Goal Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Weekly Goal
                </CardTitle>
                <CardDescription>
                  Complete {gamificationState.weeklyGoal} relationship actions this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {gamificationState.weeklyProgress} / {gamificationState.weeklyGoal} actions
                    </span>
                    <span>{Math.round(weeklyProgressPercentage)}%</span>
                  </div>
                  <Progress value={weeklyProgressPercentage} className="w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Achievements Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Achievements</h3>
              {gamificationState.achievements.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      No achievements yet. Start completing actions to unlock your first
                      achievement!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gamificationState.achievements.map((achievement) => (
                    <Card key={achievement.id} className="relative overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {achievement.icon}
                            <Badge
                              variant="secondary"
                              className={getRarityColor(achievement.rarity)}
                            >
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">+{achievement.points}</p>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        </div>
                        <h4 className="font-semibold mb-1">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {getCategoryIcon(achievement.category)}
                          <span className="capitalize">{achievement.category}</span>
                          {achievement.unlockedAt && (
                            <span>• {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Available Achievements */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Available Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEFAULT_ACHIEVEMENTS.filter(
                  (a) => !gamificationState.achievements.some((ua) => ua.id === a.id)
                ).map((achievement) => (
                  <Card key={achievement.id} className="relative overflow-hidden opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {achievement.icon}
                          <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">+{achievement.points}</p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                      <h4 className="font-semibold mb-1">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {getCategoryIcon(achievement.category)}
                        <span className="capitalize">{achievement.category}</span>
                        <span>• Locked</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
