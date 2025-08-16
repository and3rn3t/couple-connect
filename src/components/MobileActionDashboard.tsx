import React, { useState } from 'react';
import {
  MobileCard,
  MobileButton,
  MobileDialog,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogTitle,
  MobileDialogTrigger,
} from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, Clock, User, Users, Calendar, Plus } from '@/components/ui/InlineIcons';
import { Issue, Action } from '@/App';
import { Partner } from '@/components/PartnerSetup';
import { toast } from 'sonner';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';
import { MotionDiv } from '@/components/ui/lazy-motion';

interface MobileActionDashboardProps {
  issues: Issue[];
  actions: Action[];
  setActions: (update: (current: Action[]) => Action[]) => void;
  currentPartner: Partner;
  otherPartner: Partner;
  viewingAsPartner: Partner;
}

export default function MobileActionDashboard({
  issues,
  actions,
  setActions,
  currentPartner,
  otherPartner,
  viewingAsPartner,
}: MobileActionDashboardProps) {
  const { isMobile } = useMobileDetection();
  const { triggerSuccess, triggerSelection } = useHapticFeedback();
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'progress' | 'completed'>('pending');

  const pendingActions = actions.filter((a) => a.status === 'pending');
  const inProgressActions = actions.filter((a) => a.status === 'in-progress');
  const completedActions = actions.filter((a) => a.status === 'completed');

  const getIssueTitle = (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId);
    return issue?.title || 'Unknown Issue';
  };

  const handleStatusChange = (actionId: string, status: Action['status']) => {
    setActions((current) =>
      current.map((action) =>
        action.id === actionId
          ? {
              ...action,
              status,
              completedAt: status === 'completed' ? new Date().toISOString() : action.completedAt,
              completedBy: status === 'completed' ? viewingAsPartner.id : action.completedBy,
            }
          : action
      )
    );

    if (status === 'completed') {
      triggerSuccess();
      toast.success('Action completed! Great work! 🎉');
    } else {
      triggerSelection();
      toast.success(`Action moved to ${status.replace('-', ' ')}`);
    }
  };

  const getActionsByTab = () => {
    switch (selectedTab) {
      case 'pending':
        return pendingActions;
      case 'progress':
        return inProgressActions;
      case 'completed':
        return completedActions;
      default:
        return pendingActions;
    }
  };

  const getStatusIcon = (status: Action['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in-progress':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Action['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const ActionCard = ({ action }: { action: Action }) => {
    const assignedPartner =
      action.assignedTo === 'both'
        ? null
        : [currentPartner, otherPartner].find((p) => p.id === action.assignedTo);

    return (
      <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
        <MobileCard
          onClick={() => {
            setEditingAction(action);
            setIsActionDialogOpen(true);
          }}
          className={cn(
            'transition-all duration-200 hover:shadow-md active:scale-98',
            isMobile && 'touch-manipulation'
          )}
        >
          <div className="p-4">
            {/* Header with status and assigned user */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(action.status)}
                <Badge variant="outline" className={getStatusColor(action.status)}>
                  {action.status.replace('-', ' ')}
                </Badge>
              </div>

              {assignedPartner && (
                <div className="flex items-center gap-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/10">
                      {assignedPartner.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{assignedPartner.name}</span>
                </div>
              )}

              {action.assignedTo === 'both' && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Both</span>
                </div>
              )}
            </div>

            {/* Action title and description */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm leading-tight line-clamp-2">{action.title}</h3>

              {action.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{action.description}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>For: {getIssueTitle(action.issueId)}</span>
                {action.dueDate && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(action.dueDate).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action buttons for status changes */}
            {action.status !== 'completed' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                {action.status === 'pending' && (
                  <MobileButton
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(action.id, 'in-progress');
                    }}
                    className="flex-1"
                  >
                    Start
                  </MobileButton>
                )}

                {action.status === 'in-progress' && (
                  <MobileButton
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(action.id, 'completed');
                    }}
                    className="flex-1"
                  >
                    Complete ✅
                  </MobileButton>
                )}

                <MobileButton
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingAction(action);
                    setIsActionDialogOpen(true);
                  }}
                >
                  <span className="text-xs">Edit</span>
                </MobileButton>
              </div>
            )}
          </div>
        </MobileCard>
      </MotionDiv>
    );
  };

  const TabButton = ({
    tab,
    label,
    count,
  }: {
    tab: typeof selectedTab;
    label: string;
    count: number;
  }) => (
    <MobileButton
      variant={selectedTab === tab ? 'default' : 'ghost'}
      size="sm"
      onClick={() => setSelectedTab(tab)}
      className={cn('flex-1 relative', selectedTab === tab && 'shadow-sm')}
    >
      <span>{label}</span>
      {count > 0 && (
        <Badge
          variant="secondary"
          className={cn(
            'ml-2 h-5 w-5 text-xs rounded-full p-0 flex items-center justify-center',
            selectedTab === tab ? 'bg-primary-foreground text-primary' : 'bg-muted'
          )}
        >
          {count}
        </Badge>
      )}
    </MobileButton>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Action Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Track your relationship improvement actions
          </p>
        </div>

        <MobileDialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <MobileDialogTrigger asChild>
            <MobileButton size={isMobile ? 'icon' : 'default'}>
              <Plus className="h-4 w-4" />
              {!isMobile && <span className="ml-2">New Action</span>}
            </MobileButton>
          </MobileDialogTrigger>
          <MobileDialogContent variant={isMobile ? 'sheet' : 'modal'}>
            <MobileDialogHeader>
              <MobileDialogTitle>
                {editingAction ? 'Edit Action' : 'Create New Action'}
              </MobileDialogTitle>
            </MobileDialogHeader>
            {/* Action dialog content would go here */}
            <div className="p-4">
              <p className="text-sm text-muted-foreground">Action dialog content coming soon! 🚧</p>
            </div>
          </MobileDialogContent>
        </MobileDialog>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <TabButton tab="pending" label="Pending" count={pendingActions.length} />
        <TabButton tab="progress" label="In Progress" count={inProgressActions.length} />
        <TabButton tab="completed" label="Completed" count={completedActions.length} />
      </div>

      {/* Actions list */}
      <div className="space-y-2">
        {getActionsByTab().length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              {selectedTab === 'pending' && <Clock className="h-8 w-8 text-muted-foreground" />}
              {selectedTab === 'progress' && <User className="h-8 w-8 text-muted-foreground" />}
              {selectedTab === 'completed' && (
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="font-medium text-lg mb-2">No {selectedTab.replace('-', ' ')} actions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedTab === 'pending' &&
                'Create some actions to get started on improving your relationship! 💕'}
              {selectedTab === 'progress' && 'Start working on some pending actions! 🚀'}
              {selectedTab === 'completed' && 'Complete some actions to see them here! 🎯'}
            </p>
            <MobileButton onClick={() => setIsActionDialogOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Action
            </MobileButton>
          </div>
        ) : (
          getActionsByTab().map((action) => <ActionCard key={action.id} action={action} />)
        )}
      </div>
    </div>
  );
}
