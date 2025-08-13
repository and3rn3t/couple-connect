import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Issue } from '@/App'
import { toast } from 'sonner'

interface IssueDialogProps {
  isOpen: boolean
  onClose: () => void
  issue: Issue | null
  issues: Issue[]
  setIssues: (update: (current: Issue[]) => Issue[]) => void
}

export default function IssueDialog({ isOpen, onClose, issue, issues, setIssues }: IssueDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Issue['category']>('communication')
  const [priority, setPriority] = useState<Issue['priority']>('medium')
  const [connections, setConnections] = useState<string[]>([])

  useEffect(() => {
    if (issue) {
      setTitle(issue.title)
      setDescription(issue.description)
      setCategory(issue.category)
      setPriority(issue.priority)
      setConnections(issue.connections)
    } else {
      setTitle('')
      setDescription('')
      setCategory('communication')
      setPriority('medium')
      setConnections([])
    }
  }, [issue])

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a title for the issue')
      return
    }

    if (issue) {
      // Update existing issue
      setIssues((current) =>
        current.map((i) =>
          i.id === issue.id
            ? { ...i, title, description, category, priority, connections }
            : i
        )
      )
      toast.success('Issue updated successfully')
    } else {
      // Create new issue
      const newIssue: Issue = {
        id: crypto.randomUUID(),
        title,
        description,
        category,
        priority,
        connections,
        createdAt: new Date().toISOString(),
        position: { x: Math.random() * 400, y: Math.random() * 300 }
      }
      setIssues((current) => [...current, newIssue])
      toast.success('Issue created successfully')
    }

    onClose()
  }

  const handleDelete = () => {
    if (issue) {
      setIssues((current) => current.filter((i) => i.id !== issue.id))
      toast.success('Issue deleted')
      onClose()
    }
  }

  const toggleConnection = (issueId: string) => {
    setConnections((current) =>
      current.includes(issueId)
        ? current.filter((id) => id !== issueId)
        : [...current, issueId]
    )
  }

  const availableConnections = issues.filter(i => i.id !== issue?.id)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {issue ? 'Edit Issue' : 'Add New Issue'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Need better communication about finances"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in more detail..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(value: Issue['category']) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="intimacy">Intimacy</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="time">Time Management</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="personal-growth">Personal Growth</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value: Issue['priority']) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {availableConnections.length > 0 && (
            <div className="space-y-3">
              <Label>Related Issues</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableConnections.map((availableIssue) => (
                  <div key={availableIssue.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={availableIssue.id}
                      checked={connections.includes(availableIssue.id)}
                      onCheckedChange={() => toggleConnection(availableIssue.id)}
                    />
                    <Label htmlFor={availableIssue.id} className="text-sm">
                      {availableIssue.title}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <div>
              {issue && (
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Issue
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {issue ? 'Update' : 'Create'} Issue
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}