import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Target, BarChart3 } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import MindmapView from '@/components/MindmapView'
import ActionDashboard from '@/components/ActionDashboard'
import ProgressView from '@/components/ProgressView'
import PartnerSetup, { Partner } from '@/components/PartnerSetup'
import PartnerProfile from '@/components/PartnerProfile'
import NotificationCenter from '@/components/NotificationCenter'
import NotificationSummary from '@/components/NotificationSummary'
import GamificationCenter, { GamificationState } from '@/components/GamificationCenter'
import RewardSystem from '@/components/RewardSystem'
import DailyChallenges from '@/components/DailyChallenges'

export interface Issue {
  id: string
  title: string
  description: string
  category: 'communication' | 'intimacy' | 'finance' | 'time' | 'family' | 'personal-growth' | 'other'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  position: { x: number; y: number }
  connections: string[]
}

export interface Action {
  id: string
  issueId: string
  title: string
  description: string
  assignedTo: 'partner1' | 'partner2' | 'both'
  assignedToId?: string // Partner ID for more specific assignment
  dueDate: string
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  createdBy: string // Partner ID who created the action
  completedAt?: string
  completedBy?: string // Partner ID who completed the action
  notes: string[]
}

export interface RelationshipHealth {
  overallScore: number
  categories: {
    communication: number
    intimacy: number
    finance: number
    time: number
    family: number
    personalGrowth: number
  }
  lastUpdated: string
}

function App() {
  // Partner identification state
  const [currentPartner, setCurrentPartner] = useKV<Partner | null>("current-partner", null)
  const [otherPartner, setOtherPartner] = useKV<Partner | null>("other-partner", null)
  const [viewingAsPartner, setViewingAsPartner] = useState<string | null>(null) // For switching perspectives
  
  const [issues, setIssues] = useKV<Issue[]>("relationship-issues", [])
  const [actions, setActions] = useKV<Action[]>("relationship-actions", [])
  const [healthScore, setHealthScore] = useKV<RelationshipHealth>("relationship-health", {
    overallScore: 7,
    categories: {
      communication: 7,
      intimacy: 7,
      finance: 8,
      time: 6,
      family: 7,
      personalGrowth: 6
    },
    lastUpdated: new Date().toISOString()
  })

  // Gamification state
  const [gamificationState, setGamificationState] = useKV<GamificationState>("gamification-state", {
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievements: [],
    weeklyGoal: 7,
    weeklyProgress: 0,
    partnerStats: {}
  })
  
  const [activeTab, setActiveTab] = useState("mindmap")
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false)

  // If no partners are set up, show setup screen
  if (!currentPartner || !otherPartner) {
    return (
      <PartnerSetup 
        onComplete={(current, other) => {
          setCurrentPartner(() => current)
          setOtherPartner(() => other)
        }} 
      />
    )
  }

  // Determine which partner's perspective we're viewing
  const activePartner = viewingAsPartner 
    ? (viewingAsPartner === currentPartner.id ? currentPartner : otherPartner)
    : currentPartner
  
  const isViewingOwnPerspective = activePartner.id === currentPartner.id

  // Filter actions based on current view
  const getPersonalizedActions = () => {
    if (isViewingOwnPerspective) {
      // Show actions assigned to current user or both
      return actions.filter(action => 
        action.assignedToId === currentPartner.id || 
        action.assignedTo === 'both' ||
        action.createdBy === currentPartner.id
      )
    } else {
      // Show actions from partner's perspective
      return actions.filter(action => 
        action.assignedToId === otherPartner.id || 
        action.assignedTo === 'both' ||
        action.createdBy === otherPartner.id
      )
    }
  }

  const handleSwitchView = () => {
    setViewingAsPartner(viewingAsPartner === currentPartner.id ? otherPartner.id : currentPartner.id)
  }

  const handleSignOut = () => {
    setCurrentPartner(() => null)
    setOtherPartner(() => null)
    setViewingAsPartner(null)
  }

  const handleActionUpdate = (actionId: string, updates: Partial<Action>) => {
    setActions(currentActions => 
      currentActions.map(action => 
        action.id === actionId ? { ...action, ...updates } : action
      )
    )
  }

  const handleCreateAction = (newAction: Omit<Action, 'id' | 'createdAt'>) => {
    const action: Action = {
      ...newAction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    setActions(currentActions => [...currentActions, action])
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Heart className="text-accent" size={32} weight="fill" />
              <div>
                <h1 className="text-3xl font-medium text-foreground">Together</h1>
                <p className="text-muted-foreground">
                  {isViewingOwnPerspective 
                    ? "Your personal accountability view" 
                    : `Viewing ${activePartner.name}'s perspective`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GamificationCenter
                actions={actions}
                issues={issues}
                currentPartner={currentPartner}
                otherPartner={otherPartner}
                gamificationState={gamificationState}
                onUpdateGamification={setGamificationState}
              />
              <RewardSystem
                currentPartner={currentPartner}
                otherPartner={otherPartner}
                gamificationState={gamificationState}
                onUpdateGamification={setGamificationState}
              />
              <NotificationCenter
                actions={actions}
                issues={issues}
                currentPartner={currentPartner}
                otherPartner={otherPartner}
                onActionUpdate={handleActionUpdate}
                isOpen={notificationCenterOpen}
                onOpenChange={setNotificationCenterOpen}
              />
              <PartnerProfile 
                currentPartner={currentPartner}
                otherPartner={otherPartner}
                onSwitchView={handleSwitchView}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground text-lg">
              Building stronger relationships through accountability and growth
            </p>
          </div>
        </header>

        <NotificationSummary
          actions={actions}
          issues={issues}
          currentPartner={currentPartner}
          otherPartner={otherPartner}
          onViewAll={() => setNotificationCenterOpen(true)}
        />

        <DailyChallenges
          actions={actions}
          issues={issues}
          currentPartner={currentPartner}
          otherPartner={otherPartner}
          gamificationState={gamificationState}
          onUpdateGamification={setGamificationState}
          onCreateAction={handleCreateAction}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="mindmap" className="flex items-center gap-2">
              <Heart size={16} />
              Issues Map
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Target size={16} />
              Action Plans
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 size={16} />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mindmap" className="space-y-6">
            <MindmapView 
              issues={issues} 
              setIssues={setIssues}
              actions={actions}
              setActions={setActions}
              currentPartner={currentPartner}
              otherPartner={otherPartner}
              viewingAsPartner={activePartner}
            />
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <ActionDashboard 
              issues={issues}
              actions={getPersonalizedActions()}
              setActions={setActions}
              currentPartner={currentPartner}
              otherPartner={otherPartner}
              viewingAsPartner={activePartner}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <ProgressView 
              issues={issues}
              actions={actions}
              healthScore={healthScore}
              setHealthScore={setHealthScore}
              currentPartner={currentPartner}
              otherPartner={otherPartner}
              viewingAsPartner={activePartner}
            />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}

export default App