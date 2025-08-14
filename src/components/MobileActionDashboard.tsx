import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, Clock, User, Users, Calendar, Plus, Target } from '@phosphor-icons/react';
import { Issue, Action } from '@/App';
import { Partner } from '@/components/PartnerSetup';
import { toast } from 'sonner';
import ActionDialog from '@/components/ActionDialog';
import { MobileSheet } from '@/components/ui/mobile-navigation';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';
import { ACTION_CONSTRAINTS, MOBILE_TEXT, NOTIFICATION_MESSAGES } from '@/constants/mobile';

interface MobileActionDashboardProps {
  issues: Issue[];
  actions: Action[];
  setActions: (update: (current: Action[]) => Action[]) => void;
  currentPartner: Partner;
  otherPartner: Partner;
  viewingAsPartner: Partner;
}

export function MobileActionDashboard({
  issues,
  actions,
  setActions,
  currentPartner,
  otherPartner,
  viewingAsPartner: _viewingAsPartner,
}: MobileActionDashboardProps) {
  const { isMobile, screenSize } = useMobileDetection();
  const { triggerButtonPress, triggerSuccess } = useHapticFeedback();

  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  if (!isMobile) {
    return null; // Fallback to desktop version
  }

  const pendingActions = actions.filter((a) => a.status === 'pending');
  const inProgressActions = actions.filter((a) => a.status === 'in-progress');
  const completedActions = actions.filter((a) => a.status === 'completed');

  const getIssueTitle = (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId);
    return issue?.title || MOBILE_TEXT.UNKNOWN_ISSUE;
  };

  const handleStatusChange = (actionId: string, status: Action['status']) => {
    triggerSuccess();
    setActions((current) =>
      current.map((action) =>
        action.id === actionId
          ? {
              ...action,
              status,
              completedAt: status === 'completed' ? new Date().toISOString() : undefined,
              completedBy: status === 'completed' ? currentPartner.id : undefined,
            }
          : action
      )
    );

    if (status === 'completed') {
      toast.success(NOTIFICATION_MESSAGES.ACTION_COMPLETED);
    }
  };

  const handleActionPress = (action: Action) => {
    triggerButtonPress();
    setSelectedActionId(action.id);
    setIsActionSheetOpen(true);
  };

  const handleAddAction = () => {
    triggerButtonPress();
    setEditingAction(null);
    setIsActionDialogOpen(true);
  };

  const getAssignedToDisplay = (action: Action) => {
    if (action.assignedToId) {
      const assignedPartner =
        action.assignedToId === currentPartner.id ? currentPartner : otherPartner;
      return {
        text: assignedPartner.name,
        icon: User,
        avatar: assignedPartner.name.charAt(0).toUpperCase(),
      };
    }

    switch (action.assignedTo) {
      case 'both':
        return { text: 'Both', icon: Users, avatar: '👫' };
      case 'partner1':
        return { text: currentPartner.name, icon: User, avatar: currentPartner.name.charAt(0) };
      case 'partner2':
        return { text: otherPartner.name, icon: User, avatar: otherPartner.name.charAt(0) };
      default:
        return { text: currentPartner.name, icon: User, avatar: currentPartner.name.charAt(0) };
    }
  };

  const ActionCard = ({ action }: { action: Action }) => {
    const assignedTo = getAssignedToDisplay(action);
    const isCompleted = action.status === 'completed';

    return (
      <div
        className={cn(
          'ios-card p-4 mb-3 ios-touch-feedback cursor-pointer',
          'transition-all duration-150',
          isCompleted && 'opacity-75'
        )}
        onClick={() => handleActionPress(action)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-3">
            <h4
              className={cn(
                'font-medium text-foreground mb-1',
                screenSize === 'small' ? 'text-sm' : 'text-base'
              )}
            >
              {action.title}
            </h4>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{action.description}</p>
          </div>

          <Checkbox
            checked={isCompleted}
            onCheckedChange={(checked) =>
              handleStatusChange(action.id, checked ? 'completed' : 'pending')
            }
            className="touch-target-44 mt-1"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5">
              <AvatarFallback className="text-xs">{assignedTo.avatar}</AvatarFallback>
            </Avatar>
            <span>{assignedTo.text}</span>
          </div>

          <Badge variant="secondary" className="text-xs">
            Due{' '}
            {action.dueDate
              ? new Date(action.dueDate).toLocaleDateString()
              : MOBILE_TEXT.NO_DUE_DATE}
          </Badge>
        </div>

        {action.dueDate && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Calendar size={12} />
            <span>Due {new Date(action.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    );
  };

  const selectedAction = selectedActionId ? actions.find((a) => a.id === selectedActionId) : null;

  return (
    <div className="pb-safe-area-bottom space-y-4">
      {/* Floating Add Button */}
      <Button
        onClick={handleAddAction}
        className={cn(
          'fixed bottom-20 right-4 z-40',
          'ios-button-primary touch-target-56 rounded-full shadow-lg',
          'w-14 h-14 p-0'
        )}
        aria-label="Add new action"
      >
        <Plus size={24} weight="bold" />
      </Button>

      {/* Action Lists */}
      <div className="space-y-6">
        {/* Pending Actions */}
        {pendingActions.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4 px-4">
              To Do ({pendingActions.length})
            </h3>
            <div className="px-4">
              {pendingActions.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          </section>
        )}

        {/* In Progress Actions */}
        {inProgressActions.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4 px-4">
              In Progress ({inProgressActions.length})
            </h3>
            <div className="px-4">
              {inProgressActions.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Actions */}
        {completedActions.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4 px-4">
              Completed ({completedActions.length})
            </h3>
            <div className="px-4">
              {completedActions.slice(0, ACTION_CONSTRAINTS.MAX_COMPLETED_DISPLAY).map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
              {completedActions.length > ACTION_CONSTRAINTS.MAX_COMPLETED_DISPLAY && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  and {completedActions.length - ACTION_CONSTRAINTS.MAX_COMPLETED_DISPLAY} more
                  completed actions
                </p>
              )}
            </div>
          </section>
        )}

        {/* Empty State */}
        {actions.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Target size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{MOBILE_TEXT.EMPTY_STATE.NO_ACTIONS}</h3>
            <p className="text-muted-foreground mb-6">
              {MOBILE_TEXT.EMPTY_STATE.NO_ACTIONS_DESCRIPTION}
            </p>
            <Button onClick={handleAddAction} className="ios-button-primary">
              <Plus size={16} className="mr-2" />
              {MOBILE_TEXT.EMPTY_STATE.CREATE_FIRST_ACTION}
            </Button>
          </div>
        )}
      </div>

      {/* Action Detail Sheet */}
      <MobileSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        title={selectedAction?.title}
      >
        {selectedAction && (
          <div className="py-4 space-y-6">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">
                {selectedAction.description || 'No description provided'}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Issue</h4>
              <p className="text-muted-foreground">{getIssueTitle(selectedAction.issueId)}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Status</h4>
              <div className="flex gap-2">
                {(['pending', 'in-progress', 'completed'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={selectedAction.status === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      handleStatusChange(selectedAction.id, status);
                      setIsActionSheetOpen(false);
                    }}
                    className="flex-1 ios-touch-feedback"
                  >
                    {status === 'pending' && <Clock size={16} className="mr-1" />}
                    {status === 'completed' && <CheckCircle size={16} className="mr-1" />}
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {selectedAction.notes.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <div className="space-y-2">
                  {selectedAction.notes.map((note, index) => (
                    <div
                      key={index}
                      className="text-sm text-muted-foreground p-3 bg-muted rounded-lg"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </MobileSheet>

      {/* Action Dialog */}
      <ActionDialog
        isOpen={isActionDialogOpen}
        onClose={() => setIsActionDialogOpen(false)}
        action={editingAction}
        issue={null}
        actions={actions}
        setActions={setActions}
        currentPartner={currentPartner}
        otherPartner={otherPartner}
      />
    </div>
  );
}

export default MobileActionDashboard;
