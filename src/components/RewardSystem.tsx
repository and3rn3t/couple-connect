import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Gift, Heart, Coffee, Sparkles, Calendar, Camera, Music, GameController, ShoppingBag, Star } from '@phosphor-icons/react'
import { Partner } from '@/App'
import { GamificationState } from './GamificationCenter'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

export interface Reward {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'date' | 'personal' | 'shared' | 'surprise' | 'experience'
  cost: number
  rarity: 'common' | 'rare' | 'epic'
  unlockLevel?: number // Points threshold to unlock
  redemptions: {
    redeemedAt: string
    redeemedBy: string
    message?: string
  }[]
}

interface RewardSystemProps {
  currentPartner: Partner
  otherPartner: Partner
  gamificationState: GamificationState
  onUpdateGamification: (state: GamificationState) => void
}

const AVAILABLE_REWARDS: Omit<Reward, 'redemptions'>[] = [
  // Date Night Rewards
  {
    id: 'movie-night',
    title: 'Movie Night Choice',
    description: 'Get to pick the movie for your next date night',
    icon: <Camera className="w-5 h-5" />,
    category: 'date',
    cost: 100,
    rarity: 'common'
  },
  {
    id: 'restaurant-choice',
    title: 'Restaurant Choice',
    description: 'Choose the restaurant for your next dinner date',
    icon: <Coffee className="w-5 h-5" />,
    category: 'date',
    cost: 150,
    rarity: 'common'
  },
  {
    id: 'surprise-date',
    title: 'Surprise Date Planning',
    description: 'Your partner plans a complete surprise date for you',
    icon: <Sparkles className="w-5 h-5" />,
    category: 'date',
    cost: 300,
    rarity: 'rare',
    unlockLevel: 500
  },
  {
    id: 'weekend-getaway',
    title: 'Weekend Getaway Planning',
    description: 'Plan and lead a romantic weekend getaway',
    icon: <Calendar className="w-5 h-5" />,
    category: 'experience',
    cost: 800,
    rarity: 'epic',
    unlockLevel: 1500
  },

  // Personal Rewards
  {
    id: 'breakfast-in-bed',
    title: 'Breakfast in Bed',
    description: 'Enjoy a delicious breakfast made and served in bed',
    icon: <Heart className="w-5 h-5" />,
    category: 'personal',
    cost: 200,
    rarity: 'common'
  },
  {
    id: 'massage',
    title: '30-Minute Massage',
    description: 'Receive a relaxing 30-minute massage from your partner',
    icon: <Sparkles className="w-5 h-5" />,
    category: 'personal',
    cost: 250,
    rarity: 'rare'
  },
  {
    id: 'hobby-time',
    title: 'Uninterrupted Hobby Time',
    description: '3 hours of guilt-free time for your favorite hobby',
    icon: <GameController className="w-5 h-5" />,
    category: 'personal',
    cost: 180,
    rarity: 'common'
  },
  {
    id: 'spa-day',
    title: 'Home Spa Day',
    description: 'A full day of pampering and relaxation at home',
    icon: <Star className="w-5 h-5" />,
    category: 'personal',
    cost: 500,
    rarity: 'epic',
    unlockLevel: 1000
  },

  // Shared Experience Rewards
  {
    id: 'playlist-control',
    title: 'Music Playlist Control',
    description: 'Control the music playlist for a whole week',
    icon: <Music className="w-5 h-5" />,
    category: 'shared',
    cost: 120,
    rarity: 'common'
  },
  {
    id: 'cooking-together',
    title: 'Cooking Adventure',
    description: 'Cook a new cuisine together with all ingredients provided',
    icon: <Coffee className="w-5 h-5" />,
    category: 'shared',
    cost: 220,
    rarity: 'rare'
  },
  {
    id: 'game-night',
    title: 'Game Night Host',
    description: 'Host and plan a fun game night for just the two of you',
    icon: <GameController className="w-5 h-5" />,
    category: 'shared',
    cost: 180,
    rarity: 'common'
  },

  // Surprise Rewards
  {
    id: 'small-gift',
    title: 'Small Surprise Gift',
    description: 'Receive a thoughtful small gift (under $25)',
    icon: <Gift className="w-5 h-5" />,
    category: 'surprise',
    cost: 350,
    rarity: 'rare',
    unlockLevel: 300
  },
  {
    id: 'favorite-treat',
    title: 'Favorite Treat Delivery',
    description: 'Your favorite snack or treat delivered to you',
    icon: <ShoppingBag className="w-5 h-5" />,
    category: 'surprise',
    cost: 160,
    rarity: 'common'
  },
  {
    id: 'love-note',
    title: 'Handwritten Love Letter',
    description: 'Receive a heartfelt handwritten love letter',
    icon: <Heart className="w-5 h-5" />,
    category: 'surprise',
    cost: 100,
    rarity: 'common'
  }
]

export default function RewardSystem({ 
  currentPartner, 
  otherPartner, 
  gamificationState, 
  onUpdateGamification 
}: RewardSystemProps) {
  const [open, setOpen] = useState(false)
  const [redeemedRewards, setRedeemedRewards] = useKV<Reward[]>('redeemed-rewards', [])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const canAfford = (cost: number) => gamificationState.totalPoints >= cost
  const canUnlock = (reward: Omit<Reward, 'redemptions'>) => 
    !reward.unlockLevel || gamificationState.totalPoints >= reward.unlockLevel

  const redeemReward = (reward: Omit<Reward, 'redemptions'>) => {
    if (!canAfford(reward.cost)) {
      toast.error("Not enough points to redeem this reward!")
      return
    }

    const redemption = {
      redeemedAt: new Date().toISOString(),
      redeemedBy: currentPartner.id,
      message: `${currentPartner.name} redeemed: ${reward.title}`
    }

    const redeemedReward: Reward = {
      ...reward,
      redemptions: [redemption]
    }

    // Update redeemed rewards
    setRedeemedRewards(current => [...current, redeemedReward])

    // Update gamification state (deduct points)
    const updatedGamificationState = {
      ...gamificationState,
      totalPoints: gamificationState.totalPoints - reward.cost
    }
    onUpdateGamification(updatedGamificationState)

    toast.success(`🎁 Redeemed: ${reward.title}!`, {
      description: `Your partner will be notified. Enjoy your reward!`,
      duration: 5000
    })

    // You could trigger a notification to the other partner here
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-green-100 text-green-800'
      case 'rare': return 'bg-blue-100 text-blue-800'
      case 'epic': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'date': return 'bg-pink-100 text-pink-800'
      case 'personal': return 'bg-indigo-100 text-indigo-800'
      case 'shared': return 'bg-orange-100 text-orange-800'
      case 'surprise': return 'bg-yellow-100 text-yellow-800'
      case 'experience': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredRewards = AVAILABLE_REWARDS.filter(reward => 
    selectedCategory === 'all' || reward.category === selectedCategory
  )

  const categories = [
    { id: 'all', name: 'All Rewards', icon: <Gift className="w-4 h-4" /> },
    { id: 'date', name: 'Date Night', icon: <Heart className="w-4 h-4" /> },
    { id: 'personal', name: 'Personal', icon: <Star className="w-4 h-4" /> },
    { id: 'shared', name: 'Together', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'surprise', name: 'Surprises', icon: <Gift className="w-4 h-4" /> },
    { id: 'experience', name: 'Experiences', icon: <Calendar className="w-4 h-4" /> },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Gift className="w-4 h-4 mr-2" />
          Rewards
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-accent" />
            Reward Store
          </DialogTitle>
          <p className="text-muted-foreground">
            Redeem your points for relationship rewards and experiences
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Points Balance */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Points</p>
                  <p className="text-2xl font-bold text-accent">{gamificationState.totalPoints}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>Redeem points for special rewards</p>
                  <p>and relationship experiences</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Redemptions */}
          {redeemedRewards.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Recent Redemptions</h3>
              <div className="space-y-2">
                {redeemedRewards
                  .slice(-3)
                  .reverse()
                  .map((reward, index) => (
                    <Card key={`${reward.id}-${index}`} className="border-l-4 border-l-accent">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {reward.icon}
                            <div>
                              <p className="font-medium">{reward.title}</p>
                              <p className="text-sm text-muted-foreground">
                                Redeemed {new Date(reward.redemptions[0].redeemedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">-{reward.cost} pts</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              <Separator className="my-4" />
            </div>
          )}

          {/* Category Filter */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  {category.icon}
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRewards.map(reward => {
              const isAffordable = canAfford(reward.cost)
              const isUnlocked = canUnlock(reward)
              const isRedeemable = isAffordable && isUnlocked

              return (
                <Card key={reward.id} className={`relative overflow-hidden ${!isUnlocked ? 'opacity-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {reward.icon}
                        <div className="space-y-1">
                          <Badge variant="outline" className={getRarityColor(reward.rarity)}>
                            {reward.rarity}
                          </Badge>
                          <Badge variant="outline" className={getCategoryColor(reward.category)}>
                            {reward.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isAffordable ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {reward.cost}
                        </p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>

                    <h4 className="font-semibold mb-2">{reward.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>

                    {!isUnlocked && reward.unlockLevel && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-1">
                          Unlocks at {reward.unlockLevel} points
                        </p>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-accent h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min((gamificationState.totalPoints / reward.unlockLevel) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={() => redeemReward(reward)}
                      disabled={!isRedeemable}
                      className="w-full"
                      variant={isRedeemable ? "default" : "outline"}
                    >
                      {!isUnlocked 
                        ? "Locked" 
                        : !isAffordable 
                        ? "Need More Points" 
                        : "Redeem"
                      }
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredRewards.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No rewards found in this category.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}