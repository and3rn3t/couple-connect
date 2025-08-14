import { Clock, Warning, CheckCircle } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Action, Issue } from '../App'
import { Partner } from './PartnerSetup'

interface NotificationSummaryProps {
  actions: Action[]
  issues: Issue[]
  currentPartner: Partner
  otherPartner: Partner
  onViewAll: () => void
}

export default function NotificationSummary({ 
  actions, 
  issues, 
  currentPartner, 
  otherPartner,
  onViewAll 
}: NotificationSummaryProps) {
  const now = new Date()
  
  // Get current partner's actions
  const myActions = actions.filter(action => 
    action.assignedToId === currentPartner.id || 
    action.assignedTo === 'both'
  )

  // Calculate notification counts
  const overdueActions = myActions.filter(action => {
    if (action.status === 'completed') return false
    const dueDate = new Date(action.dueDate)
    return dueDate < now
  })

  const dueSoonActions = myActions.filter(action => {
    if (action.status === 'completed') return false
    const dueDate = new Date(action.dueDate)
    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff > 0 && daysDiff <= 2
  })

  const recentCompletions = actions.filter(action => {
    if (action.status !== 'completed' || !action.completedAt) return false
    const completedDate = new Date(action.completedAt)
    const hoursSinceCompletion = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60)
    return hoursSinceCompletion <= 24 && action.completedBy === otherPartner.id
  })

  const totalNotifications = overdueActions.length + dueSoonActions.length + recentCompletions.length

  if (totalNotifications === 0) return null

  return (
    <Card className="mb-6 border-l-4 border-l-accent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Warning size={16} className="text-accent" />
            Attention Needed
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-xs"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {overdueActions.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-md">
            <div className="flex items-center gap-2">
              <Warning size={16} className="text-destructive" />
              <span className="text-sm font-medium">Overdue Actions</span>
            </div>
            <Badge variant="destructive">
              {overdueActions.length}
            </Badge>
          </div>
        )}

        {dueSoonActions.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-accent/10 rounded-md">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              <span className="text-sm font-medium">Due Soon</span>
            </div>
            <Badge variant="secondary">
              {dueSoonActions.length}
            </Badge>
          </div>
        )}

        {recentCompletions.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-primary" />
              <span className="text-sm font-medium">{otherPartner.name} Completed</span>
            </div>
            <Badge variant="outline">
              {recentCompletions.length}
            </Badge>
          </div>
        )}

        {/* Quick preview of most urgent action */}
        {overdueActions.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Most Urgent:</p>
            <p className="text-sm font-medium">
              {overdueActions[0].title}
            </p>
            <p className="text-xs text-muted-foreground">
              Due {new Date(overdueActions[0].dueDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}