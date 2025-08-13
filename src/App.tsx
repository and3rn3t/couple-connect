import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Target, BarChart3 } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import MindmapView from '@/components/MindmapView'
import ActionDashboard from '@/components/ActionDashboard'
import ProgressView from '@/components/ProgressView'

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
  dueDate: string
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  completedAt?: string
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
  
  const [activeTab, setActiveTab] = useState("mindmap")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="text-accent" size={32} weight="fill" />
            <h1 className="text-3xl font-medium text-foreground">Together</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Building stronger relationships through accountability and growth
          </p>
        </header>

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
            />
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <ActionDashboard 
              issues={issues}
              actions={actions}
              setActions={setActions}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <ProgressView 
              issues={issues}
              actions={actions}
              healthScore={healthScore}
              setHealthScore={setHealthScore}
            />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}

export default App