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
} from '@/components/ui/mobile-dialog';
import { MobileButton } from '@/components/ui/mobile-button';
import {
  Gift,
  Heart,
  Users,
  Trophy,
  CheckCircle,
  Star,
  X,
  Clock,
  Plus,
} from '@/components/ui/InlineIcons';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Action, Issue } from '@/App';
import { Partner } from './PartnerSetup';
import { toast } from 'sonner';
import CelebrationAnimation from './CelebrationAnimation';
import { cn } from '@/lib/utils';

// Mobile-optimized reward types
export interface MobileReward {
  id: string;
  title: string;
  description: string;
  category: 'relationship' | 'personal' | 'shared' | 'milestone' | 'surprise';
  cost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  claimed: boolean;
  claimedAt?: Date;
  claimedBy?: string;
  expiresAt?: Date;
  requiresPartnerApproval: boolean;
  canGiftToPartner: boolean;
  customizable: boolean;
  redeemInstructions?: string[];
  image?: string;
  tags: string[];
}

export interface RewardProgress {
  totalPointsEarned: number;
  totalPointsSpent: number;
  currentPoints: number;
  rewardsUnlocked: number;
  rewardsClaimed: number;
  nextMilestone: {
    points: number;
    reward: string;
  };
}

export interface RewardStore {
  featuredRewards: MobileReward[];
  categories: {
    [key: string]: MobileReward[];
  };
  personalizedRecommendations: MobileReward[];
}

interface MobileRewardSystemProps {
  _actions: Action[];
  _issues: Issue[];
  _currentPartner: Partner;
  _otherPartner: Partner;
  rewardStore: RewardStore;
  progress: RewardProgress;
  onRewardClaim: (rewardId: string) => void;
  onRewardGift: (rewardId: string, partnerId: string) => void;
  _onCustomRewardCreate: (reward: Partial<MobileReward>) => void;
}

export const MobileRewardSystem = ({
  _actions,
  _issues,
  _currentPartner,
  _otherPartner,
  rewardStore,
  progress,
  onRewardClaim,
  onRewardGift,
  _onCustomRewardCreate,
}: MobileRewardSystemProps) => {
  const { triggerHaptic } = useHapticFeedback();
  const [activeTab, setActiveTab] = useState<'featured' | 'categories' | 'my-rewards'>('featured');
  const [selectedCategory, setSelectedCategory] = useState<string>('relationship');
  const [showRewardDetail, setShowRewardDetail] = useState(false);
  const [selectedReward, setSelectedReward] = useState<MobileReward | null>(null);
  const [showCustomReward, setShowCustomReward] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    type: 'reward';
    title: string;
    points?: number;
  } | null>(null);

  // Mobile-optimized component state

  // Get category configuration
  const getCategoryConfig = (category: MobileReward['category']) => {
    switch (category) {
      case 'relationship':
        return {
          icon: <Heart className="w-5 h-5" />,
          color: 'from-red-500 to-pink-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          name: 'Relationship',
        };
      case 'personal':
        return {
          icon: <Star className="w-5 h-5" />,
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          name: 'Personal',
        };
      case 'shared':
        return {
          icon: <Users className="w-5 h-5" />,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          name: 'Shared',
        };
      case 'milestone':
        return {
          icon: <Trophy className="w-5 h-5" />,
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          name: 'Milestone',
        };
      case 'surprise':
        return {
          icon: <Gift className="w-5 h-5" />,
          color: 'from-green-500 to-teal-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          name: 'Surprise',
        };
    }
  };

  // Get rarity configuration
  const getRarityConfig = (rarity: MobileReward['rarity']) => {
    switch (rarity) {
      case 'common':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          glow: '',
          bgGradient: 'from-gray-50 to-white',
        };
      case 'rare':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          glow: 'shadow-blue-200',
          bgGradient: 'from-blue-50 to-white',
        };
      case 'epic':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          glow: 'shadow-purple-200',
          bgGradient: 'from-purple-50 to-white',
        };
      case 'legendary':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          glow: 'shadow-yellow-200 shadow-lg',
          bgGradient: 'from-yellow-50 to-white',
        };
    }
  };

  // Handle reward claim with haptic feedback
  const handleRewardClaim = (reward: MobileReward) => {
    if (progress.currentPoints < reward.cost) {
      triggerHaptic('heavy');
      toast.error(`Not enough points! Need ${reward.cost - progress.currentPoints} more.`);
      return;
    }

    triggerHaptic('medium');
    onRewardClaim(reward.id);

    // Show celebration
    setCelebrationData({
      type: 'reward',
      title: `${reward.title} Claimed!`,
    });
    setShowCelebration(true);

    toast.success(`Reward claimed: ${reward.title}`);
  };

  // Handle reward gift
  const handleRewardGift = (reward: MobileReward) => {
    if (!reward.canGiftToPartner) {
      triggerHaptic('heavy');
      toast.error('This reward cannot be gifted');
      return;
    }

    if (progress.currentPoints < reward.cost) {
      triggerHaptic('heavy');
      toast.error(`Not enough points to gift this reward!`);
      return;
    }

    triggerHaptic('light');
    onRewardGift(reward.id, _otherPartner.id);
    toast.success(`Gift sent to ${_otherPartner.name}!`);
  };

  // Handle reward detail view
  const handleRewardDetail = (reward: MobileReward) => {
    triggerHaptic('light');
    setSelectedReward(reward);
    setShowRewardDetail(true);
  };

  // Handle tab change
  const handleTabChange = (tab: 'featured' | 'categories' | 'my-rewards') => {
    triggerHaptic('light');
    setActiveTab(tab);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    triggerHaptic('light');
    setSelectedCategory(category);
  };

  // Calculate progress to next milestone
  const progressToNextMilestone =
    progress.nextMilestone.points > 0
      ? (progress.currentPoints / progress.nextMilestone.points) * 100
      : 0;

  // Get rewards for current view
  const getCurrentRewards = () => {
    switch (activeTab) {
      case 'featured':
        return rewardStore.featuredRewards;
      case 'categories':
        return rewardStore.categories[selectedCategory] || [];
      case 'my-rewards':
        return Object.values(rewardStore.categories)
          .flat()
          .filter((reward) => reward.claimed);
      default:
        return [];
    }
  };

  const currentRewards = getCurrentRewards();

  return (
    <>
      <Card className="mx-4 my-6 shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-green-500" />
              <span>Reward Store</span>
            </div>
          </CardTitle>

          {/* Points Display */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {progress.currentPoints.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Available Points</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{progress.rewardsClaimed}</div>
                <div className="text-xs text-gray-600">Claimed</div>
              </div>
            </div>

            {/* Custom Reward Button */}
            <MobileButton
              variant="outline"
              className="p-2"
              onClick={() => {
                triggerHaptic('light');
                setShowCustomReward(true);
              }}
            >
              <Plus className="w-5 h-5" />
            </MobileButton>
          </div>

          {/* Progress to Next Milestone */}
          {progress.nextMilestone.points > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Next Milestone</span>
                <span className="text-sm font-medium text-gray-900">
                  {progress.nextMilestone.reward}
                </span>
              </div>
              <Progress value={progressToNextMilestone} className="h-2" />
              <div className="text-xs text-gray-500 mt-1 text-center">
                {progress.nextMilestone.points - progress.currentPoints} points to go
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-4 px-4">
            {[
              { key: 'featured', label: 'Featured', icon: <Star className="w-4 h-4" /> },
              { key: 'categories', label: 'Browse', icon: <Gift className="w-4 h-4" /> },
              { key: 'my-rewards', label: 'My Rewards', icon: <Trophy className="w-4 h-4" /> },
            ].map((tab) => (
              <MobileButton
                key={tab.key}
                variant="ghost"
                className={cn(
                  'flex-1 py-3 px-4 text-sm font-medium rounded-none border-b-2 transition-colors',
                  'flex items-center justify-center gap-2',
                  activeTab === tab.key
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
                onClick={() => handleTabChange(tab.key as 'featured' | 'categories' | 'my-rewards')}
              >
                {tab.icon}
                {tab.label}
              </MobileButton>
            ))}
          </div>

          {/* Category Selector (only visible in categories tab) */}
          {activeTab === 'categories' && (
            <div className="px-4 mb-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.keys(rewardStore.categories).map((categoryKey) => {
                  const config = getCategoryConfig(categoryKey as MobileReward['category']);
                  const isSelected = selectedCategory === categoryKey;

                  return (
                    <MobileButton
                      key={categoryKey}
                      variant={isSelected ? 'default' : 'outline'}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap',
                        isSelected && 'bg-green-500 hover:bg-green-600'
                      )}
                      onClick={() => handleCategoryChange(categoryKey)}
                    >
                      {config.icon}
                      {config.name}
                    </MobileButton>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rewards Grid */}
          <div className="px-4">
            {currentRewards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  {activeTab === 'my-rewards' ? 'No rewards claimed yet' : 'No rewards available'}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {activeTab === 'my-rewards'
                    ? 'Start earning points to claim your first reward!'
                    : 'Check back later for new rewards'}
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-4 pb-6">
                <AnimatePresence>
                  {currentRewards.map((reward, index) => {
                    const rarityConfig = getRarityConfig(reward.rarity);
                    const categoryConfig = getCategoryConfig(reward.category);
                    const canAfford = progress.currentPoints >= reward.cost;
                    const isExpired = reward.expiresAt && new Date() > reward.expiresAt;

                    return (
                      <motion.div
                        key={reward.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn('relative', rarityConfig.glow)}
                      >
                        <Card
                          className={cn(
                            'cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                            'border-2',
                            reward.rarity === 'legendary' && 'border-yellow-200',
                            reward.rarity === 'epic' && 'border-purple-200',
                            reward.rarity === 'rare' && 'border-blue-200',
                            (!canAfford || isExpired || !reward.unlocked) && 'opacity-60',
                            rarityConfig.bgGradient &&
                              `bg-gradient-to-br ${rarityConfig.bgGradient}`
                          )}
                          onClick={() => handleRewardDetail(reward)}
                        >
                          <CardContent className="p-4">
                            {/* Reward Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {categoryConfig.icon}
                                <Badge className={rarityConfig.color}>{reward.rarity}</Badge>
                              </div>

                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  {reward.cost}
                                </div>
                                <div className="text-xs text-gray-500">points</div>
                              </div>
                            </div>

                            {/* Reward Content */}
                            <div className="mb-4">
                              <h3 className="font-bold text-gray-900 mb-1">{reward.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {reward.description}
                              </p>
                            </div>

                            {/* Reward Status & Actions */}
                            <div className="flex items-center gap-2">
                              {!reward.unlocked ? (
                                <Badge className="bg-gray-100 text-gray-600 flex items-center gap-1">
                                  <X className="w-3 h-3" />
                                  Locked
                                </Badge>
                              ) : reward.claimed ? (
                                <Badge className="bg-green-100 text-green-600 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Claimed
                                </Badge>
                              ) : isExpired ? (
                                <Badge className="bg-red-100 text-red-600 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Expired
                                </Badge>
                              ) : (
                                <div className="flex gap-2 flex-1">
                                  <MobileButton
                                    variant={canAfford ? 'default' : 'outline'}
                                    className={cn(
                                      'flex-1 py-2 text-xs',
                                      canAfford && 'bg-green-500 hover:bg-green-600'
                                    )}
                                    disabled={!canAfford}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRewardClaim(reward);
                                    }}
                                  >
                                    Claim
                                  </MobileButton>

                                  {reward.canGiftToPartner && (
                                    <MobileButton
                                      variant="outline"
                                      className="px-3 py-2 text-xs"
                                      disabled={!canAfford}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRewardGift(reward);
                                      }}
                                    >
                                      <Heart className="w-3 h-3" />
                                    </MobileButton>
                                  )}
                                </div>
                              )}

                              {reward.expiresAt && !isExpired && (
                                <div className="text-xs text-gray-500">
                                  Expires {reward.expiresAt.toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            {/* Tags */}
                            {reward.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {reward.tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {reward.tags.length > 3 && (
                                  <Badge className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5">
                                    +{reward.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reward Detail Dialog */}
      <MobileDialog open={showRewardDetail} onOpenChange={setShowRewardDetail}>
        <MobileDialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
          {selectedReward && (
            <>
              <MobileDialogHeader>
                <MobileDialogTitle className="text-lg">{selectedReward.title}</MobileDialogTitle>
              </MobileDialogHeader>

              <div className="p-4 space-y-6">
                {/* Reward Meta */}
                <div className="flex items-center justify-between">
                  {(() => {
                    const categoryConfig = getCategoryConfig(selectedReward.category);
                    const rarityConfig = getRarityConfig(selectedReward.rarity);

                    return (
                      <>
                        <div
                          className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                            categoryConfig.bgColor,
                            categoryConfig.textColor
                          )}
                        >
                          {categoryConfig.icon}
                          <span>{categoryConfig.name}</span>
                        </div>

                        <Badge className={rarityConfig.color}>{selectedReward.rarity}</Badge>
                      </>
                    );
                  })()}
                </div>

                {/* Description */}
                <div>
                  <p className="text-gray-700 leading-relaxed">{selectedReward.description}</p>
                </div>

                {/* Redeem Instructions */}
                {selectedReward.redeemInstructions &&
                  selectedReward.redeemInstructions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">How to Redeem</h4>
                      <div className="space-y-2">
                        {selectedReward.redeemInstructions.map((instruction, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-gray-700 text-sm">{instruction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Reward Details */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedReward.cost}</div>
                    <div className="text-xs text-gray-600">Points Cost</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedReward.category}
                    </div>
                    <div className="text-xs text-gray-600">Category</div>
                  </div>
                </div>

                {/* Special Features */}
                <div className="space-y-2">
                  {selectedReward.requiresPartnerApproval && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700">Requires partner approval</span>
                    </div>
                  )}

                  {selectedReward.canGiftToPartner && (
                    <div className="flex items-center gap-2 p-2 bg-pink-50 rounded-lg">
                      <Heart className="w-4 h-4 text-pink-600" />
                      <span className="text-sm text-pink-700">Can be gifted to partner</span>
                    </div>
                  )}

                  {selectedReward.customizable && (
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                      <Star className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-purple-700">Customizable reward</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {selectedReward.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReward.tags.map((tag) => (
                        <Badge key={tag} className="bg-gray-100 text-gray-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedReward.unlocked && !selectedReward.claimed && (
                  <div className="flex gap-3 pt-2">
                    {selectedReward.canGiftToPartner &&
                      progress.currentPoints >= selectedReward.cost && (
                        <MobileButton
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            handleRewardGift(selectedReward);
                            setShowRewardDetail(false);
                          }}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Gift
                        </MobileButton>
                      )}

                    <MobileButton
                      className={cn(
                        'flex-1',
                        progress.currentPoints >= selectedReward.cost
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'opacity-50'
                      )}
                      disabled={progress.currentPoints < selectedReward.cost}
                      onClick={() => {
                        handleRewardClaim(selectedReward);
                        setShowRewardDetail(false);
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Claim ({selectedReward.cost} pts)
                    </MobileButton>
                  </div>
                )}
              </div>
            </>
          )}
        </MobileDialogContent>
      </MobileDialog>

      {/* Custom Reward Dialog */}
      <MobileDialog open={showCustomReward} onOpenChange={setShowCustomReward}>
        <MobileDialogContent className="max-w-sm">
          <MobileDialogHeader>
            <MobileDialogTitle>Create Custom Reward</MobileDialogTitle>
          </MobileDialogHeader>

          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-600">
              Create a personalized reward that's meaningful to your relationship. These custom
              rewards can be anything from date ideas to personal treats!
            </p>

            <MobileButton
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={() => {
                // This would open a form or navigate to custom reward creation
                triggerHaptic('light');
                toast.info('Custom reward creation coming soon!');
                setShowCustomReward(false);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Start Creating
            </MobileButton>
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
};

export default MobileRewardSystem;
