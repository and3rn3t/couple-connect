import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogTitle,
  MobileDialogTrigger,
} from '@/components/ui/mobile-dialog';
import { MobileButton } from '@/components/ui/mobile-button';
import { Trophy, Star, Flame, TrendUp, Heart, Users, Lightning } from '@/components/ui/InlineIcons';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Action, Issue } from '@/App';
import { Partner } from './PartnerSetup';
import { toast } from 'sonner';
import CelebrationAnimation from './CelebrationAnimation';
import { cn } from '@/lib/utils';

// Import types from original component
import type { Achievement, GamificationState } from './GamificationCenter';

interface MobileGamificationCenterProps {
  _actions: Action[];
  _issues: Issue[];
  currentPartner: Partner;
  otherPartner: Partner;
  gamificationState: GamificationState;
  _onUpdateGamification: (state: GamificationState) => void;
}

// Mobile-optimized achievement categories
const MOBILE_ACHIEVEMENT_CATEGORIES = {
  consistency: {
    name: 'Consistency',
    icon: <Flame className="w-5 h-5" />,
    color: 'from-orange-500 to-red-500',
    description: 'Keep the momentum going!',
  },
  completion: {
    name: 'Completion',
    icon: <Trophy className="w-5 h-5" />,
    color: 'from-yellow-500 to-orange-500',
    description: 'Achievement unlocked!',
  },
  collaboration: {
    name: 'Teamwork',
    icon: <Users className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
    description: 'Better together!',
  },
  growth: {
    name: 'Growth',
    icon: <TrendUp className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500',
    description: 'Level up your relationship!',
  },
  milestone: {
    name: 'Milestones',
    icon: <Star className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    description: 'Special moments!',
  },
} as const;

// Rarity styles for mobile
const RARITY_STYLES = {
  common: {
    border: 'border-gray-300',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    glow: '',
  },
  rare: {
    border: 'border-blue-300',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    glow: 'shadow-blue-200/50',
  },
  epic: {
    border: 'border-purple-300',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    glow: 'shadow-purple-200/50',
  },
  legendary: {
    border: 'border-yellow-300',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    glow: 'shadow-yellow-200/50 shadow-lg',
  },
} as const;

export default function MobileGamificationCenter({
  _actions,
  _issues,
  currentPartner,
  otherPartner,
  gamificationState,
  _onUpdateGamification,
}: MobileGamificationCenterProps) {
  const { triggerHaptic } = useHapticFeedback();

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    type: 'achievement' | 'streak' | 'reward' | 'challenge';
    title: string;
    points?: number;
  } | null>(null);

  // Calculate level based on points (mobile-friendly progression)
  const getCurrentLevel = () => {
    const points = gamificationState.totalPoints;
    if (points < 100) return { level: 1, nextLevelAt: 100, progress: points };
    if (points < 300) return { level: 2, nextLevelAt: 300, progress: points - 100 };
    if (points < 600) return { level: 3, nextLevelAt: 600, progress: points - 300 };
    if (points < 1000) return { level: 4, nextLevelAt: 1000, progress: points - 600 };
    if (points < 1500) return { level: 5, nextLevelAt: 1500, progress: points - 1000 };
    return { level: 6, nextLevelAt: 2000, progress: points - 1500 };
  };

  const levelInfo = getCurrentLevel();
  const progressPercentage =
    (levelInfo.progress /
      (levelInfo.nextLevelAt - (gamificationState.totalPoints - levelInfo.progress))) *
    100;

  // Get achievements by category for mobile display
  const getAchievementsByCategory = () => {
    const categories: Record<string, Achievement[]> = {};

    gamificationState.achievements.forEach((achievement) => {
      if (!categories[achievement.category]) {
        categories[achievement.category] = [];
      }
      categories[achievement.category].push(achievement);
    });

    return categories;
  };

  // Handle achievement tap with haptic feedback
  const handleAchievementTap = (achievement: Achievement) => {
    triggerHaptic('selection');

    if (achievement.unlockedAt) {
      toast.success(`🏆 ${achievement.title}`, {
        description: `Earned ${achievement.points} points! ${achievement.description}`,
        duration: 3000,
      });
    }
  };

  // Handle category selection with haptic feedback
  const handleCategorySelect = (category: string) => {
    triggerHaptic('light');
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const achievementsByCategory = getAchievementsByCategory();

  return (
    <>
      <MobileDialog open={open} onOpenChange={setOpen}>
        <MobileDialogTrigger asChild>
          <MobileButton
            variant="default"
            className={cn(
              'relative overflow-hidden',
              'bg-gradient-to-r from-purple-500 to-pink-500',
              'shadow-lg shadow-purple-200/50',
              'touch-target-44'
            )}
            onClick={() => {
              triggerHaptic('medium');
              setOpen(true);
            }}
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Achievements</span>
              <Badge variant="secondary" className="ml-1 bg-white/20 text-white border-0">
                {gamificationState.achievements.filter((a) => a.unlockedAt).length}
              </Badge>
            </div>

            {/* Sparkle animation for unlocked achievements */}
            <motion.div
              className="absolute inset-0 bg-white/10"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </MobileButton>
        </MobileDialogTrigger>

        <MobileDialogContent className="h-[90vh] overflow-hidden">
          <MobileDialogHeader className="pb-4">
            <MobileDialogTitle className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Gamification Hub</span>
              </div>
            </MobileDialogTitle>
          </MobileDialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 pb-safe-area-bottom">
            {/* Level & Progress Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">Level {levelInfo.level}</h3>
                      <p className="text-blue-100 text-sm">
                        {gamificationState.totalPoints} total points
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-300">
                        <Flame className="w-4 h-4" />
                        <span className="font-semibold">{gamificationState.currentStreak}</span>
                      </div>
                      <p className="text-blue-100 text-xs">day streak</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to Level {levelInfo.level + 1}</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3 bg-white/20" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid grid-cols-2 gap-4"
            >
              <Card className="touch-target-44 ios-touch-feedback">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">
                    {gamificationState.achievements.filter((a) => a.unlockedAt).length}
                  </p>
                  <p className="text-sm text-gray-600">Achievements</p>
                </CardContent>
              </Card>

              <Card className="touch-target-44 ios-touch-feedback">
                <CardContent className="p-4 text-center">
                  <Lightning className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold">{gamificationState.longestStreak}</p>
                  <p className="text-sm text-gray-600">Best Streak</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievement Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Achievement Categories
              </h3>

              <div className="space-y-3">
                {Object.entries(MOBILE_ACHIEVEMENT_CATEGORIES).map(([categoryKey, category]) => {
                  const categoryAchievements = achievementsByCategory[categoryKey] || [];
                  const unlockedCount = categoryAchievements.filter((a) => a.unlockedAt).length;
                  const isExpanded = selectedCategory === categoryKey;

                  return (
                    <div key={categoryKey}>
                      {/* Category Header */}
                      <MobileButton
                        variant="ghost"
                        className={cn(
                          'w-full justify-between p-4 h-auto',
                          'bg-gradient-to-r',
                          category.color,
                          'text-white shadow-md',
                          isExpanded && 'shadow-lg'
                        )}
                        onClick={() => handleCategorySelect(categoryKey)}
                      >
                        <div className="flex items-center gap-3">
                          {category.icon}
                          <div className="text-left">
                            <p className="font-semibold">{category.name}</p>
                            <p className="text-sm opacity-90">{category.description}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge variant="secondary" className="bg-white/20 text-white border-0">
                            {unlockedCount}/{categoryAchievements.length}
                          </Badge>
                        </div>
                      </MobileButton>

                      {/* Expanded Achievement List */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="grid gap-3 p-4 bg-gray-50 rounded-b-lg">
                              {categoryAchievements.map((achievement) => {
                                const isUnlocked = !!achievement.unlockedAt;
                                const rarityStyle = RARITY_STYLES[achievement.rarity];

                                return (
                                  <motion.div
                                    key={achievement.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <MobileButton
                                      variant="ghost"
                                      className={cn(
                                        'w-full p-4 h-auto justify-start',
                                        rarityStyle.bg,
                                        rarityStyle.border,
                                        rarityStyle.glow,
                                        'border',
                                        !isUnlocked && 'opacity-60'
                                      )}
                                      onClick={() => handleAchievementTap(achievement)}
                                    >
                                      <div className="flex items-start gap-3 w-full">
                                        <div
                                          className={cn(
                                            'p-2 rounded-lg',
                                            isUnlocked ? 'bg-white shadow-sm' : 'bg-gray-200'
                                          )}
                                        >
                                          {achievement.icon}
                                        </div>

                                        <div className="flex-1 text-left">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h4 className={cn('font-semibold', rarityStyle.text)}>
                                              {achievement.title}
                                            </h4>
                                            {isUnlocked && (
                                              <Badge variant="secondary" className="text-xs">
                                                +{achievement.points}
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm text-gray-600 mb-2">
                                            {achievement.description}
                                          </p>

                                          <div className="flex items-center gap-2">
                                            <Badge
                                              variant="outline"
                                              className={cn('text-xs', rarityStyle.text)}
                                            >
                                              {achievement.rarity}
                                            </Badge>
                                            {isUnlocked && achievement.unlockedAt && (
                                              <span className="text-xs text-gray-500">
                                                Unlocked{' '}
                                                {new Date(
                                                  achievement.unlockedAt
                                                ).toLocaleDateString()}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </MobileButton>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Partner Comparison - Mobile Optimized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="w-5 h-5 text-red-500" />
                    Partner Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Current Partner */}
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="font-semibold text-blue-700">{currentPartner.name}</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {gamificationState.totalPoints}
                      </p>
                      <p className="text-sm text-blue-600">points</p>
                    </div>

                    {/* Other Partner */}
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="font-semibold text-green-700">{otherPartner.name}</p>
                      <p className="text-2xl font-bold text-green-600">
                        {gamificationState.partnerStats[otherPartner.id]?.points || 0}
                      </p>
                      <p className="text-sm text-green-600">points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </MobileDialogContent>
      </MobileDialog>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && celebrationData && (
          <CelebrationAnimation
            show={showCelebration}
            type={celebrationData.type}
            title={celebrationData.title}
            points={celebrationData.points}
            onComplete={() => {
              setShowCelebration(false);
              setCelebrationData(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
