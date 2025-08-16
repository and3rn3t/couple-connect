import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogTitle,
} from '@/components/ui/mobile-dialog';
import { MobileButton } from '@/components/ui/mobile-button';
import {
  Calendar,
  Heart,
  Users,
  Trophy,
  Lightning,
  CheckCircle,
  Star,
  Flame,
  TrendUp,
  X,
} from '@/components/ui/InlineIcons';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Action, Issue } from '@/App';
import { Partner } from './PartnerSetup';
import { toast } from 'sonner';
import CelebrationAnimation from './CelebrationAnimation';
import { cn } from '@/lib/utils';

// Mobile-optimized challenge types
export interface MobileDailyChallenge {
  id: string;
  title: string;
  description: string;
  category: 'connection' | 'communication' | 'intimacy' | 'fun' | 'growth';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeEstimate: string;
  completed: boolean;
  completedBy?: string[];
  completedAt?: Date;
  streakCount?: number;
  instructions: string[];
  tips?: string[];
  canSkip: boolean;
  requiresBothPartners: boolean;
}

export interface ChallengeStreak {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: Date;
  streakMultiplier: number;
}

interface MobileDailyChallengesProps {
  _actions: Action[];
  _issues: Issue[];
  _currentPartner: Partner;
  _otherPartner: Partner;
  challenges: MobileDailyChallenge[];
  streakData: ChallengeStreak;
  onChallengeComplete: (challengeId: string) => void;
  onChallengeSkip: (challengeId: string) => void;
  onChallengeStart: (challengeId: string) => void;
}

export const MobileDailyChallenges = ({
  _actions,
  _issues,
  _currentPartner,
  _otherPartner,
  challenges,
  streakData,
  onChallengeComplete,
  onChallengeSkip,
  onChallengeStart,
}: MobileDailyChallengesProps) => {
  const { triggerHaptic } = useHapticFeedback();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [showChallengeDetail, setShowChallengeDetail] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<MobileDailyChallenge | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    type: 'challenge';
    title: string;
    points: number;
  } | null>(null);

  // Swipe gesture handling
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [-150, 0, 150], [0.3, 1, 0.3]);
  const dragRotation = useTransform(dragX, [-150, 0, 150], [-10, 0, 10]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current challenge
  const currentChallenge = challenges[currentChallengeIndex];
  const completedToday = challenges.filter((c) => c.completed).length;
  const availableChallenges = challenges.filter((c) => !c.completed);

  // Get category icon and color
  const getCategoryConfig = (category: MobileDailyChallenge['category']) => {
    switch (category) {
      case 'connection':
        return {
          icon: <Heart className="w-5 h-5" />,
          color: 'from-red-500 to-pink-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
        };
      case 'communication':
        return {
          icon: <Users className="w-5 h-5" />,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
        };
      case 'intimacy':
        return {
          icon: <Flame className="w-5 h-5" />,
          color: 'from-orange-500 to-red-500',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
        };
      case 'fun':
        return {
          icon: <Star className="w-5 h-5" />,
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
        };
      case 'growth':
        return {
          icon: <TrendUp className="w-5 h-5" />,
          color: 'from-green-500 to-teal-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
        };
    }
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: MobileDailyChallenge['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  // Handle swipe gesture completion
  const handleSwipeComplete = (direction: 'left' | 'right') => {
    if (!currentChallenge) return;

    triggerHaptic('medium');

    if (direction === 'right') {
      // Swipe right = Complete challenge
      handleChallengeComplete(currentChallenge);
    } else {
      // Swipe left = Skip challenge (if allowed)
      if (currentChallenge.canSkip) {
        handleChallengeSkip(currentChallenge);
      } else {
        triggerHaptic('heavy');
        toast.error('This challenge cannot be skipped');
        return;
      }
    }

    // Move to next challenge
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(currentChallengeIndex + 1);
    }
  };

  // Handle challenge completion
  const handleChallengeComplete = (challenge: MobileDailyChallenge) => {
    triggerHaptic('heavy');
    onChallengeComplete(challenge.id);

    // Show celebration
    setCelebrationData({
      type: 'challenge',
      title: challenge.title,
      points: challenge.points * (streakData.streakMultiplier || 1),
    });
    setShowCelebration(true);

    toast.success(`Challenge completed! +${challenge.points} points`);
  };

  // Handle challenge skip
  const handleChallengeSkip = (challenge: MobileDailyChallenge) => {
    triggerHaptic('light');
    onChallengeSkip(challenge.id);
    toast.info('Challenge skipped');
  };

  // Handle challenge detail view
  const handleChallengeDetail = (challenge: MobileDailyChallenge) => {
    triggerHaptic('light');
    setSelectedChallenge(challenge);
    setShowChallengeDetail(true);
    onChallengeStart(challenge.id);
  };

  // Calculate completion percentage
  const completionPercentage =
    challenges.length > 0 ? (completedToday / challenges.length) * 100 : 0;

  return (
    <>
      <Card className="mx-4 my-6 shadow-lg border-0 bg-white overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              <span>Daily Challenges</span>
            </div>
          </CardTitle>

          {/* Streak Display */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-lg font-bold text-orange-600">
                  {streakData.currentStreak}
                </span>
                <span className="text-sm text-gray-600">day streak</span>
              </div>

              {streakData.streakMultiplier > 1 && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  {streakData.streakMultiplier}x points
                </Badge>
              )}
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600">Today's Progress</div>
              <div className="text-lg font-bold text-blue-600">
                {completedToday}/{challenges.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={completionPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="font-medium">{Math.round(completionPercentage)}% Complete</span>
              <span>100%</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-6">
          {availableChallenges.length === 0 ? (
            // All challenges completed
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 px-4"
            >
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">All Challenges Complete!</h3>
              <p className="text-gray-600 mb-4">
                Amazing work! You've completed all today's challenges.
              </p>
              <Badge className="bg-green-100 text-green-800 border-green-200 text-lg px-4 py-2">
                +{challenges.reduce((sum, c) => sum + c.points, 0)} Total Points
              </Badge>
            </motion.div>
          ) : (
            // Current challenge card
            <div className="px-4">
              <div className="text-center mb-4">
                <span className="text-sm text-gray-500">
                  Challenge {currentChallengeIndex + 1} of {challenges.length}
                </span>
              </div>

              <div ref={containerRef} className="relative h-96">
                <AnimatePresence>
                  {currentChallenge && (
                    <motion.div
                      key={currentChallenge.id}
                      className="absolute inset-0"
                      style={{
                        x: dragX,
                        opacity: dragOpacity,
                        rotate: dragRotation,
                      }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, info) => {
                        const threshold = 100;
                        if (info.offset.x > threshold) {
                          handleSwipeComplete('right');
                        } else if (info.offset.x < -threshold) {
                          handleSwipeComplete('left');
                        }
                        dragX.set(0);
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card
                        className="h-full cursor-grab active:cursor-grabbing shadow-xl border-2 border-gray-100"
                        onClick={() => handleChallengeDetail(currentChallenge)}
                      >
                        <CardContent className="p-6 h-full flex flex-col">
                          {/* Category & Difficulty */}
                          <div className="flex items-center justify-between mb-4">
                            {(() => {
                              const config = getCategoryConfig(currentChallenge.category);
                              return (
                                <div
                                  className={cn(
                                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                                    config.bgColor,
                                    config.textColor
                                  )}
                                >
                                  {config.icon}
                                  <span className="capitalize">{currentChallenge.category}</span>
                                </div>
                              );
                            })()}

                            <Badge className={getDifficultyColor(currentChallenge.difficulty)}>
                              {currentChallenge.difficulty}
                            </Badge>
                          </div>

                          {/* Challenge Content */}
                          <div className="flex-1 flex flex-col justify-center text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                              {currentChallenge.title}
                            </h3>

                            <p className="text-gray-600 text-lg leading-relaxed mb-4">
                              {currentChallenge.description}
                            </p>

                            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Lightning className="w-4 h-4" />
                                <span>{currentChallenge.points} points</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{currentChallenge.timeEstimate}</span>
                              </div>

                              {currentChallenge.requiresBothPartners && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>Both partners</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Swipe Instructions */}
                          <div className="mt-6 space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <div className="flex items-center gap-1">
                                <span>Swipe left</span>
                                {currentChallenge.canSkip ? (
                                  <span>to skip</span>
                                ) : (
                                  <span className="text-gray-300">cannot skip</span>
                                )}
                              </div>

                              <div className="text-center">
                                <span>Tap for details</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <span>Swipe right</span>
                                <span>to complete</span>
                              </div>
                            </div>

                            <div className="flex justify-center">
                              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                {currentChallenge?.canSkip && (
                  <MobileButton
                    variant="outline"
                    className="flex-1 py-3"
                    onClick={() => handleChallengeSkip(currentChallenge)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Skip
                  </MobileButton>
                )}

                <MobileButton
                  variant="outline"
                  className="flex-1 py-3"
                  onClick={() => currentChallenge && handleChallengeDetail(currentChallenge)}
                >
                  View Details
                </MobileButton>

                <MobileButton
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600"
                  onClick={() => currentChallenge && handleChallengeComplete(currentChallenge)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete
                </MobileButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Challenge Detail Dialog */}
      <MobileDialog open={showChallengeDetail} onOpenChange={setShowChallengeDetail}>
        <MobileDialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
          {selectedChallenge && (
            <>
              <MobileDialogHeader>
                <MobileDialogTitle className="text-lg">{selectedChallenge.title}</MobileDialogTitle>
              </MobileDialogHeader>

              <div className="p-4 space-y-6">
                {/* Challenge Meta */}
                <div className="flex items-center justify-between">
                  {(() => {
                    const config = getCategoryConfig(selectedChallenge.category);
                    return (
                      <div
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                          config.bgColor,
                          config.textColor
                        )}
                      >
                        {config.icon}
                        <span className="capitalize">{selectedChallenge.category}</span>
                      </div>
                    );
                  })()}

                  <Badge className={getDifficultyColor(selectedChallenge.difficulty)}>
                    {selectedChallenge.difficulty}
                  </Badge>
                </div>

                {/* Description */}
                <div>
                  <p className="text-gray-700 leading-relaxed">{selectedChallenge.description}</p>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Instructions</h4>
                  <div className="space-y-2">
                    {selectedChallenge.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 text-sm">{instruction}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                {selectedChallenge.tips && selectedChallenge.tips.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Tips</h4>
                    <div className="space-y-2">
                      {selectedChallenge.tips.map((tip, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-blue-700 text-sm">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenge Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedChallenge.points}
                    </div>
                    <div className="text-xs text-gray-600">Points</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedChallenge.timeEstimate}
                    </div>
                    <div className="text-xs text-gray-600">Estimated Time</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  {selectedChallenge.canSkip && (
                    <MobileButton
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        handleChallengeSkip(selectedChallenge);
                        setShowChallengeDetail(false);
                      }}
                    >
                      Skip
                    </MobileButton>
                  )}

                  <MobileButton
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      handleChallengeComplete(selectedChallenge);
                      setShowChallengeDetail(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </MobileButton>
                </div>
              </div>
            </>
          )}
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
};

export default MobileDailyChallenges;
