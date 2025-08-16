import React, { useState } from 'react';
import { CheckCircle, Clock, Plus, Target } from '@/components/ui/InlineIcons';
import { Issue, Action } from '@/App';
import { Partner } from '@/components/PartnerSetup';
import { toast } from 'sonner';
import ActionDialog from '@/components/ActionDialogOptimized';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';
import { ACTION_CONSTRAINTS, NOTIFICATION_MESSAGES } from '@/constants/mobile';
import { MobileActionCard } from '@/components/ui/mobile-card';
import { TouchButton } from '@/components/ui/touch-feedback';
import { MobileLayout, MobileStack } from '@/components/ui/mobile-layout';
import { PullToRefresh } from '@/components/PullToRefresh';
import { Badge } from '@/components/ui/badge';

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
  const { triggerHaptic } = useHapticFeedback();

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
    triggerHaptic('medium');
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
    triggerHaptic('light');
    setEditingAction(null);
    setIsActionDialogOpen(true);
  };

  const handleRefresh = async () => {
    triggerHaptic('selection');
    // Simulate refresh - in real app this would sync with backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Actions refreshed');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    triggerHaptic('selection');
  };

  return (
    <MobileLayout noGutters>
      <MobileStack spacing="none" className="pb-safe-area-bottom">
        {/* Enhanced Tab Navigation */}
        <div className="flex bg-background border-b border-border shadow-sm">
          {[
            {
              id: 'pending',
              label: 'To Do',
              count: pendingActions.length,
              icon: Clock,
              color: 'text-orange-500',
            },
            {
              id: 'in-progress',
              label: 'Active',
              count: inProgressActions.length,
              icon: Target,
              color: 'text-blue-500',
            },
            {
              id: 'completed',
              label: 'Done',
              count: completedActions.length,
              icon: CheckCircle,
              color: 'text-green-500',
            },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TouchButton
                key={tab.id}
                onPress={() => handleTabChange(tab.id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-2 py-4 px-2 border-b-2 transition-all duration-200',
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground'
                )}
                variant="ghost"
                hapticType="selection"
                pressScale={0.98}
              >
                <div className="flex items-center gap-2">
                  <IconComponent size={18} className={activeTab === tab.id ? tab.color : ''} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </div>
                {tab.count > 0 && (
                  <Badge
                    variant={activeTab === tab.id ? 'default' : 'secondary'}
                    className="text-xs min-w-[24px] h-5"
                  >
                    {tab.count}
                  </Badge>
                )}
              </TouchButton>
            );
          })}
        </div>

        {/* Pull to Refresh Content */}
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="px-4 py-4 min-h-[calc(100vh-200px)]">
            <MobileStack spacing="md">
              {/* Pending Actions */}
              {activeTab === 'pending' && (
                <>
                  {pendingActions.length > 0 ? (
                    pendingActions.map((action) => (
                      <MobileActionCard
                        key={action.id}
                        title={action.title}
                        description={action.description}
                        icon={<Clock size={20} className="text-orange-500" />}
                        badge={
                          action.dueDate && (
                            <Badge variant="outline" className="text-xs">
                              Due {new Date(action.dueDate).toLocaleDateString()}
                            </Badge>
                          )
                        }
                        onClick={() => {
                          setEditingAction(action);
                          setIsActionDialogOpen(true);
                        }}
                        onSwipeLeft={() => handleStatusChange(action.id, 'completed')}
                        onSwipeRight={() => handleStatusChange(action.id, 'in-progress')}
                      >
                        <div className="flex items-center justify-between pt-3">
                          <div className="text-sm text-muted-foreground">
                            {action.assignedTo === 'both'
                              ? 'Both partners'
                              : action.assignedToId === currentPartner.id
                                ? currentPartner.name
                                : otherPartner.name}
                          </div>
                          <div className="flex gap-2">
                            <TouchButton
                              onPress={() => handleStatusChange(action.id, 'in-progress')}
                              size="sm"
                              variant="ghost"
                              hapticType="light"
                            >
                              Start
                            </TouchButton>
                            <TouchButton
                              onPress={() => handleStatusChange(action.id, 'completed')}
                              size="sm"
                              variant="primary"
                              hapticType="medium"
                            >
                              Complete
                            </TouchButton>
                          </div>
                        </div>
                      </MobileActionCard>
                    ))
                  ) : (
                    <MobileActionCard
                      title="No pending actions"
                      description="Tap the + button to add your first action and start improving your relationship"
                      icon={<Target size={24} className="text-muted-foreground" />}
                      onClick={handleAddAction}
                    >
                      <div></div>
                    </MobileActionCard>
                  )}
                </>
              )}

              {/* In Progress Actions */}
              {activeTab === 'in-progress' && (
                <>
                  {inProgressActions.length > 0 ? (
                    inProgressActions.map((action) => (
                      <MobileActionCard
                        key={action.id}
                        title={action.title}
                        description={action.description}
                        icon={<Target size={20} className="text-blue-500" />}
                        badge={<Badge className="text-xs bg-blue-500">In Progress</Badge>}
                        onClick={() => {
                          setEditingAction(action);
                          setIsActionDialogOpen(true);
                        }}
                        onSwipeLeft={() => handleStatusChange(action.id, 'pending')}
                        onSwipeRight={() => handleStatusChange(action.id, 'completed')}
                      >
                        <div className="flex items-center justify-between pt-3">
                          <div className="text-sm text-muted-foreground">
                            {action.assignedTo === 'both'
                              ? 'Both partners'
                              : action.assignedToId === currentPartner.id
                                ? currentPartner.name
                                : otherPartner.name}
                          </div>
                          <div className="flex gap-2">
                            <TouchButton
                              onPress={() => handleStatusChange(action.id, 'pending')}
                              size="sm"
                              variant="ghost"
                              hapticType="light"
                            >
                              Pause
                            </TouchButton>
                            <TouchButton
                              onPress={() => handleStatusChange(action.id, 'completed')}
                              size="sm"
                              variant="primary"
                              hapticType="medium"
                            >
                              Complete
                            </TouchButton>
                          </div>
                        </div>
                      </MobileActionCard>
                    ))
                  ) : (
                    <MobileActionCard
                      title="No active actions"
                      description="Start working on a pending action to see it here"
                      icon={<Clock size={24} className="text-muted-foreground" />}
                      onClick={() => setActiveTab('pending')}
                    >
                      <div></div>
                    </MobileActionCard>
                  )}
                </>
              )}

              {/* Completed Actions */}
              {activeTab === 'completed' && (
                <>
                  {completedActions
                    .slice(0, ACTION_CONSTRAINTS.MAX_COMPLETED_DISPLAY)
                    .map((action) => (
                      <MobileActionCard
                        key={action.id}
                        title={action.title}
                        description={action.description}
                        icon={<CheckCircle size={20} className="text-green-500" />}
                        badge={
                          <Badge variant="secondary" className="text-xs">
                            Completed
                          </Badge>
                        }
                        onClick={() => {
                          setEditingAction(action);
                          setIsActionDialogOpen(true);
                        }}
                      >
                        <div className="text-sm text-muted-foreground pt-3">
                          Completed{' '}
                          {action.completedAt && new Date(action.completedAt).toLocaleDateString()}
                          {action.completedBy &&
                            ` by ${
                              action.completedBy === currentPartner.id
                                ? currentPartner.name
                                : otherPartner.name
                            }`}
                        </div>
                      </MobileActionCard>
                    ))}
                  {completedActions.length === 0 && (
                    <MobileActionCard
                      title="No completed actions yet"
                      description="Complete some actions to see your progress here"
                      icon={<CheckCircle size={24} className="text-muted-foreground" />}
                      onClick={() => setActiveTab('pending')}
                    >
                      <div></div>
                    </MobileActionCard>
                  )}
                  {completedActions.length > ACTION_CONSTRAINTS.MAX_COMPLETED_DISPLAY && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        + {completedActions.length - ACTION_CONSTRAINTS.MAX_COMPLETED_DISPLAY} more
                        completed actions
                      </p>
                    </div>
                  )}
                </>
              )}
            </MobileStack>
          </div>
        </PullToRefresh>

        {/* Enhanced Floating Action Button */}
        <div className="fixed bottom-20 right-4 z-50">
          <TouchButton
            onPress={handleAddAction}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
            hapticType="medium"
            pressScale={0.9}
          >
            <Plus size={24} weight="bold" />
          </TouchButton>
        </div>

        {/* Action Dialog */}
        <ActionDialog
          isOpen={isActionDialogOpen}
          onClose={() => {
            setIsActionDialogOpen(false);
            setEditingAction(null);
          }}
          issue={null}
          actions={actions}
          setActions={setActions}
          action={editingAction}
          currentPartner={currentPartner}
          otherPartner={otherPartner}
        />
      </MobileStack>
    </MobileLayout>
  );
}

export default MobileActionDashboard;
