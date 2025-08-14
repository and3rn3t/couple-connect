import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Heart, TrendUp, CheckCircle, Target, Calendar, ChartBar } from '@phosphor-icons/react'
import { Issue, Action, RelationshipHealth } from '@/App'
import { Partner } from '@/components/PartnerSetup'
import { toast } from 'sonner'

interface ProgressViewProps {
  issues: Issue[]
  actions: Action[]
  healthScore: RelationshipHealth
  setHealthScore: (update: (current: RelationshipHealth) => RelationshipHealth) => void
  currentPartner: Partner
  otherPartner: Partner
  viewingAsPartner: Partner
}

export default function ProgressView({ 
  issues, 
  actions, 
  healthScore, 
  setHealthScore, 
  currentPartner, 
  otherPartner, 
  viewingAsPartner 
}: ProgressViewProps) {
  const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false)
  const [tempScores, setTempScores] = useState(healthScore.categories)

  const completedActions = actions.filter(a => a.status === 'completed')
  const totalActions = actions.length
  const completionRate = totalActions > 0 ? (completedActions.length / totalActions) * 100 : 0

  // Partner-specific metrics
  const myActions = actions.filter(a => 
    a.assignedToId === currentPartner.id || 
    (a.assignedTo === 'both' && viewingAsPartner.id === currentPartner.id)
  )
  const partnerActions = actions.filter(a => 
    a.assignedToId === otherPartner.id || 
    (a.assignedTo === 'both' && viewingAsPartner.id === otherPartner.id)
  )

  const myCompletedActions = myActions.filter(a => a.status === 'completed').length
  const partnerCompletedActions = partnerActions.filter(a => a.status === 'completed').length
  
  const myCompletionRate = myActions.length > 0 ? (myCompletedActions / myActions.length) * 100 : 0
  const partnerCompletionRate = partnerActions.length > 0 ? (partnerCompletedActions / partnerActions.length) * 100 : 0

  const issuesByCategory = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const actionsByCategory = actions.reduce((acc, action) => {
    const issue = issues.find(i => i.id === action.issueId)
    if (issue) {
      if (!acc[issue.category]) acc[issue.category] = { total: 0, completed: 0 }
      acc[issue.category].total++
      if (action.status === 'completed') {
        acc[issue.category].completed++
      }
    }
    return acc
  }, {} as Record<string, { total: number; completed: number }>)

  const recentCompletions = completedActions
    .filter(a => a.completedAt && a.completedBy)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5)

  const getPartnerName = (partnerId: string) => {
    return partnerId === currentPartner.id ? currentPartner.name : otherPartner.name
  }

  const upcomingActions = actions
    .filter(a => a.status !== 'completed' && a.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const categoryLabels = {
    communication: 'Communication',
    intimacy: 'Intimacy',
    finance: 'Finance',
    time: 'Time Management',
    family: 'Family',
    'personal-growth': 'Personal Growth'
  }

  const handleUpdateHealthScore = () => {
    const overallScore = Math.round(
      Object.values(tempScores).reduce((sum, score) => sum + score, 0) / 
      Object.values(tempScores).length
    )

    setHealthScore((current) => ({
      ...current,
      overallScore,
      categories: tempScores,
      lastUpdated: new Date().toISOString()
    }))

    setIsHealthDialogOpen(false)
    toast.success('Relationship health updated!')
  }

  const getIssueTitle = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId)
    return issue?.title || 'Unknown Issue'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getHealthColor = (score: number) => {
    if (score >= 8) return 'text-primary'
    if (score >= 6) return 'text-accent'
    return 'text-destructive'
  }

  const getHealthLabel = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Needs Work'
    return 'Critical'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium mb-2">
            {viewingAsPartner.id === currentPartner.id ? 'Your Progress & Health' : `${viewingAsPartner.name}'s Progress View`}
          </h2>
          <p className="text-muted-foreground">
            {viewingAsPartner.id === currentPartner.id 
              ? 'Track your relationship journey and celebrate growth'
              : `See progress from ${viewingAsPartner.name}'s perspective`
            }
          </p>
        </div>
      </div>

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="text-accent" size={20} weight="fill" />
              Relationship Health Score
            </CardTitle>
            <Dialog open={isHealthDialogOpen} onOpenChange={setIsHealthDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Update Score
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Relationship Health</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-sm text-muted-foreground">{tempScores[key as keyof typeof tempScores]}/10</span>
                      </div>
                      <Slider
                        value={[tempScores[key as keyof typeof tempScores]]}
                        onValueChange={([value]) => 
                          setTempScores(prev => ({ ...prev, [key]: value }))
                        }
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  ))}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsHealthDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateHealthScore}>
                      Update Health Score
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getHealthColor(healthScore.overallScore)}`}>
                {healthScore.overallScore}/10
              </div>
              <Badge variant="secondary" className="mt-2">
                {getHealthLabel(healthScore.overallScore)}
              </Badge>
            </div>
            <div className="flex-1 space-y-3">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const score = healthScore.categories[key as keyof typeof healthScore.categories]
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-24 text-sm">{label}</div>
                    <Progress value={score * 10} className="flex-1" />
                    <div className={`text-sm font-medium ${getHealthColor(score)}`}>
                      {score}/10
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Last updated: {formatDate(healthScore.lastUpdated)}
          </p>
        </CardContent>
      </Card>

      {/* Partner Progress Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {currentPartner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {currentPartner.name}'s Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Actions</span>
              <span className="font-bold">{myActions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Completed</span>
              <span className="font-bold text-primary">{myCompletedActions}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Completion Rate</span>
                <span className="font-bold">{Math.round(myCompletionRate)}%</span>
              </div>
              <Progress value={myCompletionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                  {otherPartner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {otherPartner.name}'s Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Actions</span>
              <span className="font-bold">{partnerActions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Completed</span>
              <span className="font-bold text-primary">{partnerCompletedActions}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Completion Rate</span>
                <span className="font-bold">{Math.round(partnerCompletionRate)}%</span>
              </div>
              <Progress value={partnerCompletionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-primary" size={20} />
              <span className="text-sm font-medium">Total Actions</span>
            </div>
            <div className="text-2xl font-bold">{totalActions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-primary" size={20} weight="fill" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <div className="text-2xl font-bold">{completedActions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendUp className="text-accent" size={20} />
              <span className="text-sm font-medium">Overall Rate</span>
            </div>
            <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <ChartBar className="text-secondary" size={20} />
              <span className="text-sm font-medium">Active Issues</span>
            </div>
            <div className="text-2xl font-bold">{issues.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Progress by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const issueCount = issuesByCategory[key] || 0
              const actionData = actionsByCategory[key] || { total: 0, completed: 0 }
              const progress = actionData.total > 0 ? (actionData.completed / actionData.total) * 100 : 0

              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{label}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{issueCount} issues</span>
                      <span>•</span>
                      <span>{actionData.completed}/{actionData.total} actions</span>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="text-primary" size={20} weight="fill" />
              Recent Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompletions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No completed actions yet</p>
            ) : (
              <div className="space-y-3">
                {recentCompletions.map((action) => (
                  <div key={action.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="text-primary mt-0.5" size={16} weight="fill" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{action.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {getIssueTitle(action.issueId)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          Completed {formatDate(action.completedAt!)}
                        </p>
                        {action.completedBy && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <div className="flex items-center gap-1">
                              <Avatar className="h-3 w-3">
                                <AvatarFallback className="text-[8px]">
                                  {getPartnerName(action.completedBy).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {getPartnerName(action.completedBy)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="text-accent" size={20} />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingActions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {upcomingActions.map((action) => (
                  <div key={action.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="text-accent mt-0.5" size={16} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{action.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {getIssueTitle(action.issueId)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due {formatDate(action.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}