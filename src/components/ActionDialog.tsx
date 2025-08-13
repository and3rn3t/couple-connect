import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Issue, Action } from '@/App'
import { Partner } from '@/components/PartnerSetup'
import { toast } from 'sonner'

interface ActionDialogProps {
  isOpen: boolean
  onClose: () => void
  issue: Issue | null
  actions: Action[]
  setActions: (update: (current: Action[]) => Action[]) => void
  action?: Action | null
  currentPartner: Partner
  otherPartner: Partner
}

export default function ActionDialog({ 
  isOpen, 
  onClose, 
  issue, 
  actions, 
  setActions, 
  action, 
  currentPartner, 
  otherPartner 
}: ActionDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState<Action['assignedTo']>('both')
  const [assignedToId, setAssignedToId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (action) {
      setTitle(action.title)
      setDescription(action.description)
      setAssignedTo(action.assignedTo)
      setAssignedToId(action.assignedToId || '')
      setDueDate(action.dueDate ? action.dueDate.split('T')[0] : '')
    } else {
      setTitle('')
      setDescription('')
      setAssignedTo('both')
      setAssignedToId('')
      setDueDate('')
    }
  }, [action])

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a title for the action')
      return
    }

    if (!issue && !action) {
      toast.error('No issue selected')
      return
    }

    if (action) {
      // Update existing action
      setActions((current) =>
        current.map((a) =>
          a.id === action.id
            ? { 
                ...a, 
                title, 
                description, 
                assignedTo, 
                assignedToId: assignedToId || undefined,
                dueDate: dueDate ? new Date(dueDate).toISOString() : '' 
              }
            : a
        )
      )
      toast.success('Action updated successfully')
    } else {
      // Create new action
      const newAction: Action = {
        id: crypto.randomUUID(),
        issueId: issue!.id,
        title,
        description,
        assignedTo,
        assignedToId: assignedToId || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: currentPartner.id,
        notes: []
      }
      setActions((current) => [...current, newAction])
      toast.success('Action created successfully')
    }

    onClose()
  }

  const handleDelete = () => {
    if (action) {
      setActions((current) => current.filter((a) => a.id !== action.id))
      toast.success('Action deleted')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {action ? 'Edit Action' : 'Create Action Plan'}
          </DialogTitle>
          {issue && (
            <p className="text-sm text-muted-foreground">
              For issue: {issue.title}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="action-title">Action Title</Label>
            <Input
              id="action-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Schedule weekly budget meetings"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-description">Action Description</Label>
            <Textarea
              id="action-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what needs to be done and how you'll do it..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select 
                value={assignedToId || assignedTo} 
                onValueChange={(value) => {
                  if (value === currentPartner.id || value === otherPartner.id) {
                    setAssignedToId(value)
                    setAssignedTo('partner1') // Will be updated by the component logic
                  } else {
                    setAssignedToId('')
                    setAssignedTo(value as Action['assignedTo'])
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={currentPartner.id}>{currentPartner.name} (You)</SelectItem>
                  <SelectItem value={otherPartner.id}>{otherPartner.name}</SelectItem>
                  <SelectItem value="both">Both Partners</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date (Optional)</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              {action && (
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Action
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {action ? 'Update' : 'Create'} Action
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}