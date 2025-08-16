import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Heart,
  Users,
  Clock,
  TrendUp,
  CurrencyDollar,
  House,
  DotsThreeVertical,
} from '@/components/ui/InlineIcons';
import { Issue, Action } from '@/App';
import { Partner } from '@/components/PartnerSetup';
import IssueDialog from '@/components/IssueDialog';
import ActionDialog from '@/components/ActionDialogOptimized';

interface MindmapViewProps {
  issues: Issue[];
  setIssues: (update: (current: Issue[]) => Issue[]) => void;
  actions: Action[];
  setActions: (update: (current: Action[]) => Action[]) => void;
  currentPartner: Partner;
  otherPartner: Partner;
  viewingAsPartner: Partner;
}

const categoryIcons = {
  communication: Heart,
  intimacy: Heart,
  finance: CurrencyDollar,
  time: Clock,
  family: House,
  'personal-growth': TrendUp,
  other: DotsThreeVertical,
};

const categoryColors = {
  communication: 'bg-accent/20 text-accent border-accent/30',
  intimacy: 'bg-secondary/20 text-secondary-foreground border-secondary/30',
  finance: 'bg-primary/20 text-primary-foreground border-primary/30',
  time: 'bg-muted text-muted-foreground border-border',
  family: 'bg-accent/10 text-accent border-accent/20',
  'personal-growth': 'bg-primary/10 text-primary-foreground border-primary/20',
  other: 'bg-muted text-muted-foreground border-border',
};

export default function MindmapView({
  issues,
  setIssues,
  actions,
  setActions,
  currentPartner,
  otherPartner,
  viewingAsPartner: _viewingAsPartner,
}: MindmapViewProps) {
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

  const handleAddIssue = () => {
    setEditingIssue(null);
    setIsIssueDialogOpen(true);
  };

  const handleEditIssue = (issue: Issue) => {
    setEditingIssue(issue);
    setIsIssueDialogOpen(true);
  };

  const handleCreateAction = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsActionDialogOpen(true);
  };

  const getIssueActions = (issueId: string) => {
    return actions.filter((action) => action.issueId === issueId);
  };

  const getCategoryLabel = (category: string) => {
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium mb-2">Relationship Issues Map</h2>
          <p className="text-muted-foreground">
            Visualize and connect the areas you'd like to work on together
          </p>
        </div>
        <Button onClick={handleAddIssue} className="flex items-center gap-2">
          <Plus size={16} />
          Add Issue
        </Button>
      </div>

      {issues.length === 0 ? (
        <Card className="p-12 text-center">
          <CardContent>
            <Heart className="mx-auto mb-4 text-muted-foreground" size={48} weight="light" />
            <h3 className="text-lg font-medium mb-2">Start Your Journey</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Begin by identifying areas in your relationship you'd like to explore and improve
              together.
            </p>
            <Button onClick={handleAddIssue} className="flex items-center gap-2 mx-auto">
              <Plus size={16} />
              Add Your First Issue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => {
            const Icon = categoryIcons[issue.category];
            const issueActions = getIssueActions(issue.id);
            const completedActions = issueActions.filter((a) => a.status === 'completed').length;

            return (
              <Card
                key={issue.id}
                className={`transition-all hover:shadow-md cursor-pointer ${categoryColors[issue.category]}`}
                onClick={() => handleEditIssue(issue)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={20} weight="duotone" />
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryLabel(issue.category)}
                      </Badge>
                    </div>
                    <Badge
                      variant={
                        issue.priority === 'high'
                          ? 'destructive'
                          : issue.priority === 'medium'
                            ? 'default'
                            : 'secondary'
                      }
                      className="text-xs"
                    >
                      {issue.priority}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{issue.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {issueActions.length > 0 && (
                        <span>
                          {completedActions}/{issueActions.length} actions complete
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateAction(issue);
                      }}
                      className="text-xs"
                    >
                      <Plus size={14} />
                      Action
                    </Button>
                  </div>

                  {issue.connections.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <Users size={12} className="inline mr-1" />
                      Connected to {issue.connections.length} other issue
                      {issue.connections.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <IssueDialog
        isOpen={isIssueDialogOpen}
        onClose={() => setIsIssueDialogOpen(false)}
        issue={editingIssue}
        issues={issues}
        setIssues={setIssues}
      />

      <ActionDialog
        isOpen={isActionDialogOpen}
        onClose={() => setIsActionDialogOpen(false)}
        issue={selectedIssue}
        actions={actions}
        setActions={setActions}
        currentPartner={currentPartner}
        otherPartner={otherPartner}
      />
    </div>
  );
}
