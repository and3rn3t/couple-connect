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
import { MobileInput } from '@/components/ui/mobile-input';
import {
  User,
  Heart,
  Users,
  Calendar,
  Star,
  Bell,
  Gift,
  Trophy,
  Plus,
} from '@/components/ui/InlineIcons';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Action, Issue } from '@/App';
import { Partner } from './PartnerSetup';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mobile-optimized partner data types
export interface MobilePartnerStats {
  relationshipDuration: string;
  sharedActivities: number;
  completedChallenges: number;
  totalPoints: number;
  currentStreak: number;
  achievementsUnlocked: number;
  favoriteActivity: string;
  connectionScore: number;
}

export interface PartnerPreference {
  id: string;
  category: 'communication' | 'dates' | 'intimacy' | 'gifts' | 'activities';
  title: string;
  value: string;
  icon: React.ReactNode;
  isPrivate: boolean;
}

export interface SharedMemory {
  id: string;
  title: string;
  date: Date;
  description: string;
  category: 'milestone' | 'date' | 'achievement' | 'special' | 'everyday';
  rating: number;
  photos?: string[];
  tags: string[];
}

export interface PartnerAchievement {
  id: string;
  title: string;
  description: string;
  earnedDate: Date;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  icon: React.ReactNode;
}

interface MobilePartnerProfileAdvancedProps {
  _actions: Action[];
  _issues: Issue[];
  partner: Partner;
  _currentUser: Partner;
  stats: MobilePartnerStats;
  preferences: PartnerPreference[];
  memories: SharedMemory[];
  achievements: PartnerAchievement[];
  _onPreferenceUpdate: (preferenceId: string, value: string) => void;
  _onMemoryAdd: (memory: Partial<SharedMemory>) => void;
  onConnectionRequest: () => void;
}

export const MobilePartnerProfileAdvanced = ({
  _actions,
  _issues,
  partner,
  _currentUser,
  stats,
  preferences,
  memories,
  achievements,
  _onPreferenceUpdate,
  _onMemoryAdd,
  onConnectionRequest,
}: MobilePartnerProfileAdvancedProps) => {
  const { triggerHaptic } = useHapticFeedback();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'preferences' | 'memories' | 'achievements'
  >('overview');
  const [showEditPreference, setShowEditPreference] = useState(false);
  const [selectedPreference, setSelectedPreference] = useState<PartnerPreference | null>(null);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [showAchievementDetail, setShowAchievementDetail] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<PartnerAchievement | null>(null);

  // Get category configuration for preferences
  const getPreferenceCategoryConfig = (category: PartnerPreference['category']) => {
    switch (category) {
      case 'communication':
        return {
          icon: <Users className="w-5 h-5" />,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          name: 'Communication',
        };
      case 'dates':
        return {
          icon: <Heart className="w-5 h-5" />,
          color: 'from-red-500 to-pink-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          name: 'Date Ideas',
        };
      case 'intimacy':
        return {
          icon: <Heart className="w-5 h-5" />,
          color: 'from-pink-500 to-red-500',
          bgColor: 'bg-pink-50',
          textColor: 'text-pink-700',
          name: 'Intimacy',
        };
      case 'gifts':
        return {
          icon: <Gift className="w-5 h-5" />,
          color: 'from-green-500 to-teal-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          name: 'Gifts',
        };
      case 'activities':
        return {
          icon: <Star className="w-5 h-5" />,
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          name: 'Activities',
        };
    }
  };

  // Get memory category configuration
  const getMemoryCategoryConfig = (category: SharedMemory['category']) => {
    switch (category) {
      case 'milestone':
        return {
          icon: <Trophy className="w-4 h-4" />,
          color: 'bg-yellow-100 text-yellow-700',
          name: 'Milestone',
        };
      case 'date':
        return {
          icon: <Heart className="w-4 h-4" />,
          color: 'bg-red-100 text-red-700',
          name: 'Date',
        };
      case 'achievement':
        return {
          icon: <Star className="w-4 h-4" />,
          color: 'bg-blue-100 text-blue-700',
          name: 'Achievement',
        };
      case 'special':
        return {
          icon: <Gift className="w-4 h-4" />,
          color: 'bg-purple-100 text-purple-700',
          name: 'Special',
        };
      case 'everyday':
        return {
          icon: <Calendar className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-700',
          name: 'Everyday',
        };
    }
  };

  // Get achievement rarity configuration
  const getAchievementRarityConfig = (rarity: PartnerAchievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return { color: 'bg-gray-100 text-gray-800', glow: '' };
      case 'rare':
        return { color: 'bg-blue-100 text-blue-800', glow: 'shadow-blue-200' };
      case 'epic':
        return { color: 'bg-purple-100 text-purple-800', glow: 'shadow-purple-200' };
      case 'legendary':
        return { color: 'bg-yellow-100 text-yellow-800', glow: 'shadow-yellow-200 shadow-lg' };
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'overview' | 'preferences' | 'memories' | 'achievements') => {
    triggerHaptic('light');
    setActiveTab(tab);
  };

  // Handle preference edit
  const handlePreferenceEdit = (preference: PartnerPreference) => {
    triggerHaptic('light');
    setSelectedPreference(preference);
    setShowEditPreference(true);
  };

  // Handle memory detail
  const handleMemoryAdd = () => {
    triggerHaptic('light');
    setShowAddMemory(true);
  };

  // Handle achievement detail
  const handleAchievementDetail = (achievement: PartnerAchievement) => {
    triggerHaptic('light');
    setSelectedAchievement(achievement);
    setShowAchievementDetail(true);
  };

  // Format duration
  const formatDuration = (duration: string) => {
    return duration;
  };

  // Get star rating
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn('w-3 h-3', star <= rating ? 'text-yellow-500' : 'text-gray-300')}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Card className="mx-4 my-6 shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          {/* Partner Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {partner.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-gray-900">{partner.name}</CardTitle>
              <p className="text-sm text-gray-600">
                {formatDuration(stats.relationshipDuration)} together
              </p>

              {/* Connection Score */}
              <div className="flex items-center gap-2 mt-2">
                <Heart className="w-4 h-4 text-red-500" />
                <Progress value={stats.connectionScore} className="h-2 flex-1" />
                <span className="text-sm font-medium text-gray-700">{stats.connectionScore}%</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {stats.totalPoints.toLocaleString()}
              </div>
              <div className="text-xs text-blue-700">Total Points</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{stats.currentStreak}</div>
              <div className="text-xs text-green-700">Day Streak</div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{stats.achievementsUnlocked}</div>
              <div className="text-xs text-purple-700">Achievements</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-4 px-4 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
              { key: 'preferences', label: 'Prefs', icon: <Heart className="w-4 h-4" /> },
              { key: 'memories', label: 'Memories', icon: <Calendar className="w-4 h-4" /> },
              { key: 'achievements', label: 'Awards', icon: <Trophy className="w-4 h-4" /> },
            ].map((tab) => (
              <MobileButton
                key={tab.key}
                variant="ghost"
                className={cn(
                  'py-3 px-3 text-sm font-medium rounded-none border-b-2 transition-colors whitespace-nowrap',
                  'flex items-center justify-center gap-2 min-w-0',
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
                onClick={() =>
                  handleTabChange(
                    tab.key as 'overview' | 'preferences' | 'memories' | 'achievements'
                  )
                }
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </MobileButton>
            ))}
          </div>

          {/* Tab Content */}
          <div className="px-4 pb-6">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Detailed Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Shared Activities</div>
                      <div className="text-xl font-bold text-gray-900">
                        {stats.sharedActivities}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Completed Challenges</div>
                      <div className="text-xl font-bold text-gray-900">
                        {stats.completedChallenges}
                      </div>
                    </div>
                  </div>

                  {/* Favorite Activity */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Star className="w-6 h-6 text-yellow-500" />
                      <div>
                        <div className="font-semibold text-gray-900">Favorite Activity</div>
                        <div className="text-sm text-gray-600">{stats.favoriteActivity}</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <MobileButton
                      className="py-3 bg-blue-500 hover:bg-blue-600"
                      onClick={() => {
                        triggerHaptic('medium');
                        onConnectionRequest();
                        toast.success('Connection request sent!');
                      }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Connect
                    </MobileButton>

                    <MobileButton
                      variant="outline"
                      className="py-3"
                      onClick={() => {
                        triggerHaptic('light');
                        toast.info('Message feature coming soon!');
                      }}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Message
                    </MobileButton>
                  </div>
                </motion.div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {preferences.map((preference) => {
                    const config = getPreferenceCategoryConfig(preference.category);

                    return (
                      <Card
                        key={preference.id}
                        className="cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => handlePreferenceEdit(preference)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn('p-2 rounded-lg', config.bgColor)}>
                                {config.icon}
                              </div>

                              <div>
                                <h3 className="font-semibold text-gray-900 text-sm">
                                  {preference.title}
                                </h3>
                                <p className="text-sm text-gray-600">{preference.value}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {preference.isPrivate && (
                                <Badge className="bg-gray-100 text-gray-600 text-xs">Private</Badge>
                              )}
                              <Badge className={config.bgColor + ' ' + config.textColor}>
                                {config.name}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </motion.div>
              )}

              {/* Memories Tab */}
              {activeTab === 'memories' && (
                <motion.div
                  key="memories"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Add Memory Button */}
                  <MobileButton
                    className="w-full py-3 bg-green-500 hover:bg-green-600"
                    onClick={handleMemoryAdd}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Memory
                  </MobileButton>

                  {/* Memories List */}
                  {memories.map((memory) => {
                    const config = getMemoryCategoryConfig(memory.category);

                    return (
                      <Card key={memory.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm">
                                {memory.title}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {memory.date.toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge className={config.color}>
                                {config.icon}
                                {config.name}
                              </Badge>
                              <StarRating rating={memory.rating} />
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">{memory.description}</p>

                          {memory.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {memory.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {memory.tags.length > 3 && (
                                <Badge className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5">
                                  +{memory.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </motion.div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {achievements.map((achievement) => {
                    const rarityConfig = getAchievementRarityConfig(achievement.rarity);

                    return (
                      <Card
                        key={achievement.id}
                        className={cn(
                          'cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                          rarityConfig.glow
                        )}
                        onClick={() => handleAchievementDetail(achievement)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                              {achievement.icon}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-sm">
                                    {achievement.title}
                                  </h3>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {achievement.description}
                                  </p>
                                </div>

                                <Badge className={rarityConfig.color}>{achievement.rarity}</Badge>
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {achievement.earnedDate.toLocaleDateString()}
                                  </span>
                                  <Badge className="bg-green-100 text-green-700">
                                    +{achievement.points} pts
                                  </Badge>
                                </div>

                                <Badge className="bg-blue-100 text-blue-700">
                                  {achievement.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Edit Preference Dialog */}
      <MobileDialog open={showEditPreference} onOpenChange={setShowEditPreference}>
        <MobileDialogContent className="max-w-sm">
          {selectedPreference && (
            <>
              <MobileDialogHeader>
                <MobileDialogTitle>Edit {selectedPreference.title}</MobileDialogTitle>
              </MobileDialogHeader>

              <div className="p-4 space-y-4">
                <MobileInput
                  placeholder="Enter your preference..."
                  defaultValue={selectedPreference.value}
                  className="w-full"
                />

                <div className="flex gap-3 pt-2">
                  <MobileButton
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowEditPreference(false)}
                  >
                    Cancel
                  </MobileButton>

                  <MobileButton
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                    onClick={() => {
                      // Handle preference update
                      triggerHaptic('medium');
                      toast.success('Preference updated!');
                      setShowEditPreference(false);
                    }}
                  >
                    Save
                  </MobileButton>
                </div>
              </div>
            </>
          )}
        </MobileDialogContent>
      </MobileDialog>

      {/* Add Memory Dialog */}
      <MobileDialog open={showAddMemory} onOpenChange={setShowAddMemory}>
        <MobileDialogContent className="max-w-sm">
          <MobileDialogHeader>
            <MobileDialogTitle>Add New Memory</MobileDialogTitle>
          </MobileDialogHeader>

          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-600">
              Create a shared memory that you both will cherish. This could be a special date,
              milestone, or everyday moment that made you smile.
            </p>

            <MobileButton
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={() => {
                triggerHaptic('medium');
                toast.info('Memory creation form coming soon!');
                setShowAddMemory(false);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Memory
            </MobileButton>
          </div>
        </MobileDialogContent>
      </MobileDialog>

      {/* Achievement Detail Dialog */}
      <MobileDialog open={showAchievementDetail} onOpenChange={setShowAchievementDetail}>
        <MobileDialogContent className="max-w-sm">
          {selectedAchievement && (
            <>
              <MobileDialogHeader>
                <MobileDialogTitle>{selectedAchievement.title}</MobileDialogTitle>
              </MobileDialogHeader>

              <div className="p-4 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {selectedAchievement.icon}
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {selectedAchievement.title}
                  </h3>

                  <p className="text-gray-600 mb-4">{selectedAchievement.description}</p>

                  <div className="flex justify-center gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        {selectedAchievement.points}
                      </div>
                      <div className="text-xs text-gray-600">Points</div>
                    </div>

                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">
                        {selectedAchievement.rarity}
                      </div>
                      <div className="text-xs text-gray-600">Rarity</div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    Earned on {selectedAchievement.earnedDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </>
          )}
        </MobileDialogContent>
      </MobileDialog>
    </>
  );
};

export default MobilePartnerProfileAdvanced;
