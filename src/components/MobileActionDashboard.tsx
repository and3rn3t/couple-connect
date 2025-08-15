import React, { useState } from 'react';
import { CheckCircle, Clock, Plus, Target } from '@phosphor-icons/react';
import { Issue, Action } from '@/App';
import { Partner } from '@/components/PartnerSetup';
import { toast } from 'sonner';
import ActionDialog from '@/components/ActionDialog';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';
import { ACTION_CONSTRAINTS, NOTIFICATION_MESSAGES } from '@/constants/mobile';
import { FloatingActionButton } from '@/components/EnhancedMobileNavigation';
import { SwipeableActionCard } from '@/components/SwipeableActionCard';
import { PullToRefresh } from '@/components/PullToRefresh';

interface MobileActionDashboardProps {
  issues: Issue[];
  actions: Action[];
  setActions: (update: (current: Action[]) => Action[]) => void;
  currentPartner: Partner;
  otherPartner: Partner;
  viewingAsPartner: Partner;
}

export function MobileActionDashboard({
  issues: _issues,
  actions,
  setActions,
  currentPartner,
  otherPartner,
  viewingAsPartner: _viewingAsPartner,
}: MobileActionDashboardProps) {
  const { isMobile } = useMobileDetection();
  const { triggerButtonPress, triggerSuccess } = useHapticFeedback();

  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  if (!isMobile) {
    return null; // Fallback to desktop version
  }

  const pendingActions = actions.filter((a) => a.status === 'pending');
  const inProgressActions = actions.filter((a) => a.status === 'in-progress');
  const completedActions = actions.filter((a) => a.status === 'completed');

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

  const handleAddAction = () => {
    triggerButtonPress();
    setEditingAction(null);
    setIsActionDialogOpen(true);
  };

  const handleRefresh = async () => {
    triggerSuccess();
    // Simulate refresh - in real app this would sync with backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Actions refreshed');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    triggerButtonPress();
  };

  return (
    <div className="pb-safe-area-bottom">
      {/* Simple Tab Navigation */}
      <div className="flex bg-background border-b border-border mb-4">
        {[
          { id: 'pending', label: 'To Do', count: pendingActions.length },
          { id: 'in-progress', label: 'Active', count: inProgressActions.length },
          { id: 'completed', label: 'Done', count: completedActions.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Pull to Refresh Wrapper */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-4 px-4">
          {/* Dynamic Content Based on Active Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-3">
              {pendingActions.length > 0 ? (
                pendingActions.map((action) => (
                  <SwipeableActionCard
                    key={action.id}
                    action={action}
                    onStatusChange={handleStatusChange}
                    onDelete={(actionId) => {
                      setActions((current) => current.filter((a) => a.id !== actionId));
                      toast.success('Action deleted');
                    }}
                    onEdit={(action) => {
                      setEditingAction(action);
                      setIsActionDialogOpen(true);
                    }}
                    currentPartner={currentPartner}
                    otherPartner={otherPartner}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No pending actions</p>
                  <p className="text-sm">Tap + to add a new action</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'in-progress' && (
            <div className="space-y-3">
              {inProgressActions.length > 0 ? (
                inProgressActions.map((action) => (
                  <SwipeableActionCard
                    key={action.id}
                    action={action}
                    onStatusChange={handleStatusChange}
                    onDelete={(actionId) => {
                      setActions((current) => current.filter((a) => a.id !== actionId));
                      toast.success('Action deleted');
                    }}
                    onEdit={(action) => {
                      setEditingAction(action);
                      setIsActionDialogOpen(true);
                    }}
                    currentPartner={currentPartner}
                    otherPartner={otherPartner}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No actions in progress</p>
                  <p className="text-sm">Start working on an action to see it here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="space-y-3">
              {completedActions.length > 0 ? (
                completedActions
                  .slice(0, ACTION_CONSTRAINTS.MAX_COMPLETED_DISPLAY)
                  .map((action) => (
                    <SwipeableActionCard
                      key={action.id}
                      action={action}
                      onStatusChange={handleStatusChange}
                      onDelete={(actionId) => {
                        setActions((current) => current.filter((a) => a.id !== actionId));
                        toast.success('Action deleted');
                      }}
                      onEdit={(action) => {
                        setEditingAction(action);
                        setIsActionDialogOpen(true);
                      }}
                      currentPartner={currentPartner}
                      otherPartner={otherPartner}
                    />
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No completed actions</p>
                  <p className="text-sm">Complete actions to see them here</p>
                </div>
              )}
              {completedActions.length > ACTION_CONSTRAINTS.MAX_COMPLETED_DISPLAY && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  and {completedActions.length - ACTION_CONSTRAINTS.MAX_COMPLETED_DISPLAY} more
                  completed actions
                </p>
              )}
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Enhanced Floating Action Button */}
      <FloatingActionButton
        icon={<Plus size={20} weight="bold" />}
        onAction={handleAddAction}
        label="Add Action"
        className="bottom-24"
      />

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
