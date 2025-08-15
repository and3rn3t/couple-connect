import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Circle,
  Lightning,
  Heart,
  Target,
  ChatCircle,
  Clock,
  Gift,
} from '@phosphor-icons/react';
import { Action, Issue } from '@/App';
import { Partner } from './PartnerSetup';
import { GamificationState } from './GamificationCenter';
import { toast } from 'sonner';
import { useKV } from '../hooks/useKV';

// Local constants for daily challenges
const CHALLENGE_CONSTANTS = {
  DAILY_CHALLENGE_COUNT: 3,
  TOAST_DURATION: 4000,
  RANDOM_SHUFFLE_CENTER: 0.5,
  NEXT_DAY_OFFSET: 1,
  MIDNIGHT_HOUR: 0,
  MIDNIGHT_MINUTE: 0,
  MIDNIGHT_SECOND: 0,
  MIDNIGHT_MS: 0,
} as const;

// Point value ranges for reference (used in CHALLENGE_TEMPLATES below)
const _CHALLENGE_POINTS = {
  EASY_MIN: 10,
  EASY_MAX: 20,
  MEDIUM_MIN: 25,
  MEDIUM_MAX: 40,
  HARD_MIN: 45,
  HARD_MAX: 60,
} as const;

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'action_completion' | 'communication' | 'appreciation' | 'quality_time' | 'goal_setting';
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completedAt?: string;
  completedBy?: string;
  expiresAt: string;
  progress: number;
  maxProgress: number;
}

interface DailyChallengesProps {
  actions: Action[];
  issues: Issue[];
  currentPartner: Partner;
  otherPartner: Partner;
  gamificationState: GamificationState;
  onUpdateGamification: (state: GamificationState) => void;
  onCreateAction: (action: Omit<Action, 'id' | 'createdAt'>) => void;
}

const CHALLENGE_TEMPLATES = [
  // Easy Challenges (10-20 points)
  {
    type: 'appreciation',
    difficulty: 'easy',
    points: 15,
    title: 'Express Gratitude',
    description: 'Leave a sweet note or message for your partner',
    icon: <Heart className="w-4 h-4" />,
    maxProgress: 1,
  },
  {
    type: 'communication',
    difficulty: 'easy',
    points: 20,
    title: 'Check-In Champion',
    description: 'Have a 5-minute check-in conversation about your day',
    icon: <ChatCircle className="w-4 h-4" />,
    maxProgress: 1,
  },
  {
    type: 'action_completion',
    difficulty: 'easy',
    points: 25,
    title: 'Action Hero',
    description: 'Complete at least 1 relationship action today',
    icon: <Target className="w-4 h-4" />,
    maxProgress: 1,
  },
  {
    type: 'quality_time',
    difficulty: 'easy',
    points: 20,
    title: 'Quality Moments',
    description: 'Spend 15 minutes together without devices',
    icon: <Clock className="w-4 h-4" />,
    maxProgress: 1,
  },

  // Medium Challenges (25-40 points)
  {
    type: 'action_completion',
    difficulty: 'medium',
    points: 35,
    title: 'Productivity Partner',
    description: 'Complete 3 relationship actions today',
    icon: <Target className="w-4 h-4" />,
    maxProgress: 3,
  },
  {
    type: 'goal_setting',
    difficulty: 'medium',
    points: 30,
    title: 'Future Planner',
    description: 'Create 2 new action items for relationship growth',
    icon: <Lightning className="w-4 h-4" />,
    maxProgress: 2,
  },
  {
    type: 'appreciation',
    difficulty: 'medium',
    points: 25,
    title: 'Appreciation Artist',
    description: 'Give your partner 3 genuine compliments today',
    icon: <Heart className="w-4 h-4" />,
    maxProgress: 3,
  },
  {
    type: 'quality_time',
    difficulty: 'medium',
    points: 40,
    title: 'Connection Time',
    description: 'Have a 30-minute meaningful conversation',
    icon: <ChatCircle className="w-4 h-4" />,
    maxProgress: 1,
  },

  // Hard Challenges (45-60 points)
  {
    type: 'action_completion',
    difficulty: 'hard',
    points: 60,
    title: 'Action Superstar',
    description: 'Complete 5 relationship actions in one day',
    icon: <Target className="w-4 h-4" />,
    maxProgress: 5,
  },
  {
    type: 'goal_setting',
    difficulty: 'hard',
    points: 50,
    title: 'Growth Architect',
    description: 'Identify and create action plans for a new relationship area',
    icon: <Lightning className="w-4 h-4" />,
    maxProgress: 1,
  },
  {
    type: 'communication',
    difficulty: 'hard',
    points: 55,
    title: 'Deep Connector',
    description: 'Have an hour-long heart-to-heart conversation',
    icon: <ChatCircle className="w-4 h-4" />,
    maxProgress: 1,
  },
];

export default function DailyChallenges({
  actions,
  issues: _issues,
  currentPartner,
  otherPartner: _otherPartner,
  gamificationState,
  onUpdateGamification,
  onCreateAction: _onCreateAction,
}: DailyChallengesProps) {
  const [dailyChallenges, setDailyChallenges] = useKV<DailyChallenge[]>('daily-challenges', []);
  const [challengeCompletions, setChallengeCompletions] = useKV<{ [date: string]: string[] }>(
    'challenge-completions',
    {}
  );

  const generateDailyChallenges = () => {
    const today = new Date().toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + CHALLENGE_CONSTANTS.NEXT_DAY_OFFSET);
    tomorrow.setHours(
      CHALLENGE_CONSTANTS.MIDNIGHT_HOUR,
      CHALLENGE_CONSTANTS.MIDNIGHT_MINUTE,
      CHALLENGE_CONSTANTS.MIDNIGHT_SECOND,
      CHALLENGE_CONSTANTS.MIDNIGHT_MS
    );

    // Check if we already have challenges for today
    const hasTodays = (dailyChallenges || []).some(
      (challenge) => new Date(challenge.expiresAt).toDateString() === tomorrow.toDateString()
    );

    if (!hasTodays) {
      // Generate 3 new challenges for today
      const shuffled = [...CHALLENGE_TEMPLATES].sort(
        () => Math.random() - CHALLENGE_CONSTANTS.RANDOM_SHUFFLE_CENTER
      );
      const selectedTemplates = shuffled.slice(0, CHALLENGE_CONSTANTS.DAILY_CHALLENGE_COUNT);

      const newChallenges: DailyChallenge[] = selectedTemplates.map((template, index) => ({
        id: `challenge-${today}-${index}`,
        ...template,
        type: template.type as DailyChallenge['type'],
        difficulty: template.difficulty as DailyChallenge['difficulty'],
        progress: 0,
        expiresAt: tomorrow.toISOString(),
      }));

      setDailyChallenges([
        ...(dailyChallenges || []).filter((c) => new Date(c.expiresAt) > new Date()), // Remove expired
        ...newChallenges,
      ]);
    }
  };

  const updateChallengeProgress = () => {
    const today = new Date().toDateString();
    const todaysActions = actions.filter(
      (action) =>
        action.completedBy === currentPartner.id &&
        action.completedAt &&
        new Date(action.completedAt).toDateString() === today
    );

    const todaysCreatedActions = actions.filter(
      (action) =>
        action.createdBy === currentPartner.id &&
        new Date(action.createdAt).toDateString() === today
    );

    setDailyChallenges(
      (dailyChallenges || []).map((challenge) => {
        if (challenge.completedAt) return challenge; // Already completed

        let newProgress = challenge.progress;

        switch (challenge.type) {
          case 'action_completion':
            newProgress = Math.min(todaysActions.length, challenge.maxProgress);
            break;
          case 'goal_setting':
            newProgress = Math.min(todaysCreatedActions.length, challenge.maxProgress);
            break;
          // For other types, progress would be manually updated through specific actions
        }

        // Check if challenge is now complete
        if (newProgress >= challenge.maxProgress && !challenge.completedAt) {
          // Mark as completed
          const completed = {
            ...challenge,
            progress: newProgress,
            completedAt: new Date().toISOString(),
            completedBy: currentPartner.id,
          };

          // Award points
          const updatedGamification = {
            ...gamificationState,
            totalPoints: gamificationState.totalPoints + challenge.points,
          };
          onUpdateGamification(updatedGamification);

          // Track completion
          const today = new Date().toDateString();
          setChallengeCompletions({
            ...(challengeCompletions || {}),
            [today]: [...((challengeCompletions || {})[today] || []), challenge.id],
          });

          toast.success(`🎯 Challenge Complete: ${challenge.title}!`, {
            description: `+${challenge.points} points earned`,
            duration: CHALLENGE_CONSTANTS.TOAST_DURATION,
          });

          return completed;
        }

        return { ...challenge, progress: newProgress };
      })
    );
  };

  const manualCompleteChallenge = (challengeId: string) => {
    setDailyChallenges(
      (dailyChallenges || []).map((challenge) => {
        if (challenge.id === challengeId && !challenge.completedAt) {
          const completed = {
            ...challenge,
            progress: challenge.maxProgress,
            completedAt: new Date().toISOString(),
            completedBy: currentPartner.id,
          };

          // Award points
          const updatedGamification = {
            ...gamificationState,
            totalPoints: gamificationState.totalPoints + challenge.points,
          };
          onUpdateGamification(updatedGamification);

          toast.success(`🎯 Challenge Complete: ${challenge.title}!`, {
            description: `+${challenge.points} points earned`,
            duration: CHALLENGE_CONSTANTS.TOAST_DURATION,
          });

          return completed;
        }
        return challenge;
      })
    );
  };

  useEffect(() => {
    generateDailyChallenges();
    updateChallengeProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const todaysChallenges = (dailyChallenges || []).filter((challenge) => {
    const challengeDate = new Date(challenge.expiresAt);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + CHALLENGE_CONSTANTS.NEXT_DAY_OFFSET);
    return challengeDate.toDateString() === tomorrow.toDateString();
  });

  const completedToday = todaysChallenges.filter((c) => c.completedAt).length;
  const totalToday = todaysChallenges.length;

  if (todaysChallenges.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightning className="w-5 h-5 text-accent" />
              Daily Challenges
            </CardTitle>
            <CardDescription>
              Complete challenges to earn bonus points and build healthy habits
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-lg font-semibold">
              {completedToday}/{totalToday}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {todaysChallenges.map((challenge) => {
          const isCompleted = !!challenge.completedAt;
          const progressPercentage = (challenge.progress / challenge.maxProgress) * 100;

          return (
            <div key={challenge.id} className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-green-500" weight="fill" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {challenge.icon}
                  <h4
                    className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {challenge.title}
                  </h4>
                  <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="secondary">+{challenge.points} pts</Badge>
                </div>

                <p
                  className={`text-sm mb-2 ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}
                >
                  {challenge.description}
                </p>

                {!isCompleted && challenge.maxProgress > 1 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>
                        {challenge.progress} / {challenge.maxProgress}
                      </span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                )}

                {isCompleted && challenge.completedAt && (
                  <p className="text-xs text-green-600">
                    ✓ Completed at {new Date(challenge.completedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>

              {!isCompleted &&
                (challenge.type === 'appreciation' ||
                  challenge.type === 'communication' ||
                  challenge.type === 'quality_time') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => manualCompleteChallenge(challenge.id)}
                  >
                    Mark Complete
                  </Button>
                )}
            </div>
          );
        })}

        {completedToday === totalToday && (
          <div className="text-center p-4 bg-accent/10 rounded-lg">
            <Gift className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="font-medium text-accent">All challenges completed! 🎉</p>
            <p className="text-sm text-muted-foreground">Check back tomorrow for new challenges</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
