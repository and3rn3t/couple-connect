import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircle, Clock, User, Users, Calendar, Plus } from '@phosphor-icons/react'
import { Issue, Action } from '@/App'
import { Partner } from '@/components/PartnerSetup'
import { toast } from 'sonner'
import ActionDialog from '@/components/ActionDialog'

interface ActionDashboardProps {
  issues: Issue[]
  actions: Action[]
  setActions: (update: (current: Action[]) => Action[]) => void
  currentPartner: Partner
  otherPartner: Partner
  viewingAsPartner: Partner
}

export default function ActionDashboard({ 
  issues, 
  actions, 
  setActions, 
  currentPartner, 
  otherPartner, 
  viewingAsPartner 
}: ActionDashboardProps) {
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<Action | null>(null)
  const [newNote, setNewNote] = useState<{ [key: string]: string }>({})

  const pendingActions = actions.filter(a => a.status === 'pending')
  const inProgressActions = actions.filter(a => a.status === 'in-progress')
  const completedActions = actions.filter(a => a.status === 'completed')

  const getIssueTitle = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId)
    return issue?.title || 'Unknown Issue'
  }

  const handleStatusChange = (actionId: string, status: Action['status']) => {
    setActions((current) =>
      current.map((action) =>
        action.id === actionId
          ? {
              ...action,
              status,
              completedAt: status === 'completed' ? new Date().toISOString() : undefined,
              completedBy: status === 'completed' ? currentPartner.id : undefined
            }
          : action
      )
    )
    
    if (status === 'completed') {
      toast.success('Action marked as completed! 🎉')
    }
  }

  const handleAddNote = (actionId: string) => {
    const note = newNote[actionId]?.trim()
    if (!note) return

    const noteWithAuthor = `${new Date().toLocaleDateString()} (${currentPartner.name}): ${note}`

    setActions((current) =>
      current.map((action) =>
        action.id === actionId
          ? {
              ...action,
              notes: [...action.notes, noteWithAuthor]
            }
          : action
      )
    )

    setNewNote(prev => ({ ...prev, [actionId]: '' }))
    toast.success('Note added')
  }

  const handleEditAction = (action: Action) => {
    setEditingAction(action)
    setIsActionDialogOpen(true)
  }

  const getAssignedToDisplay = (action: Action) => {
    if (action.assignedToId) {
      const assignedPartner = action.assignedToId === currentPartner.id ? currentPartner : otherPartner
      return { 
        text: assignedPartner.name, 
        icon: User,
        avatar: assignedPartner.name.charAt(0).toUpperCase()
      }
    }
    
    switch (action.assignedTo) {
      case 'partner1': return { text: 'Partner 1', icon: User, avatar: 'P1' }
      case 'partner2': return { text: 'Partner 2', icon: User, avatar: 'P2' }
      case 'both': return { text: 'Both Partners', icon: Users, avatar: null }
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const isOverdue = (action: Action) => {
    if (!action.dueDate || action.status === 'completed') return false
    return new Date(action.dueDate) < new Date()
  }

  const ActionCard = ({ action }: { action: Action }) => {
    const assigned = getAssignedToDisplay(action)
    const AssignedIcon = assigned.icon
    const overdue = isOverdue(action)
    const isAssignedToCurrentUser = action.assignedToId === currentPartner.id || action.assignedTo === 'both'
    const canEdit = action.createdBy === currentPartner.id || isAssignedToCurrentUser

    return (
      <Card key={action.id} className="transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={action.status === 'completed'}
                onCheckedChange={(checked) =>
                  handleStatusChange(action.id, checked ? 'completed' : 'pending')
                }
                disabled={!isAssignedToCurrentUser}
              />
              <div>
                <CardTitle className="text-base">{action.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {getIssueTitle(action.issueId)}
                </p>
              </div>
            </div>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditAction(action)}
              >
                Edit
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {action.description && (
            <p className="text-sm text-muted-foreground">
              {action.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {assigned.avatar ? (
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-xs text-xs bg-muted">
                    {assigned.avatar}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <AssignedIcon size={14} />
              )}
              {assigned.text}
            </div>
            {action.dueDate && (
              <div className={`flex items-center gap-1 ${overdue ? 'text-destructive' : ''}`}>
                <Calendar size={14} />
                {formatDate(action.dueDate)}
                {overdue && <span className="text-destructive font-medium">Overdue</span>}
              </div>
            )}
            <Badge
              variant={
                action.status === 'completed' ? 'default' :
                action.status === 'in-progress' ? 'secondary' : 'outline'
              }
              className="text-xs"
            >
              {action.status.replace('-', ' ')}
            </Badge>
          </div>

          {action.notes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Notes:</h4>
              <div className="space-y-1">
                {action.notes.slice(-2).map((note, index) => (
                  <p key={index} className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              placeholder="Add a progress note..."
              value={newNote[action.id] || ''}
              onChange={(e) => setNewNote(prev => ({ ...prev, [action.id]: e.target.value }))}
              className="text-xs"
              rows={2}
            />
            <Button
              size="sm"
              onClick={() => handleAddNote(action.id)}
              disabled={!newNote[action.id]?.trim()}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium mb-2">
            {viewingAsPartner.id === currentPartner.id ? 'Your Actions' : `${viewingAsPartner.name}'s Actions`}
          </h2>
          <p className="text-muted-foreground">
            {viewingAsPartner.id === currentPartner.id 
              ? 'Track progress on your relationship goals'
              : `View ${viewingAsPartner.name}'s perspective on shared goals`
            }
          </p>
        </div>
        <Button onClick={() => setIsActionDialogOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          New Action
        </Button>
      </div>

      {actions.length === 0 ? (
        <Card className="p-12 text-center">
          <CardContent>
            <CheckCircle className="mx-auto mb-4 text-muted-foreground" size={48} weight="light" />
            <h3 className="text-lg font-medium mb-2">No Actions Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by creating action plans from your issues, or add a new action directly.
            </p>
            <Button onClick={() => setIsActionDialogOpen(true)} className="flex items-center gap-2 mx-auto">
              <Plus size={16} />
              Create Your First Action
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground" size={20} />
              <h3 className="font-medium">Pending ({pendingActions.length})</h3>
            </div>
            {pendingActions.map(action => <ActionCard key={action.id} action={action} />)}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="text-accent" size={20} />
              <h3 className="font-medium">In Progress ({inProgressActions.length})</h3>
            </div>
            {inProgressActions.map(action => <ActionCard key={action.id} action={action} />)}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-primary" size={20} weight="fill" />
              <h3 className="font-medium">Completed ({completedActions.length})</h3>
            </div>
            {completedActions.map(action => <ActionCard key={action.id} action={action} />)}
          </div>
        </div>
      )}

      <ActionDialog
        isOpen={isActionDialogOpen}
        onClose={() => {
          setIsActionDialogOpen(false)
          setEditingAction(null)
        }}
        issue={null}
        actions={actions}
        setActions={setActions}
        action={editingAction}
        currentPartner={currentPartner}
        otherPartner={otherPartner}
      />
    </div>
  )
}