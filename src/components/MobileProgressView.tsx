import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Heart,
  Target,
  CheckCircle,
  TrendUp,
  ChartBar,
  Calendar,
} from '@/components/ui/InlineIcons';
import { Issue, Action, RelationshipHealth } from '@/App';
import { Partner } from '@/components/PartnerSetup';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { MobileCard } from '@/components/ui/mobile-card';
import { MobilePage, MobileStack } from '@/components/ui/mobile-layout';

// Use the main app's RelationshipHealth interface
type HealthScore = RelationshipHealth;

interface MobileProgressViewProps {
  issues: Issue[];
  actions: Action[];
  healthScore: HealthScore;
  setHealthScore: (update: (current: HealthScore) => HealthScore) => void;
  currentPartner: Partner;
  otherPartner: Partner;
  viewingAsPartner: Partner;
}

const HEALTH_CONSTANTS = {
  MAX_SCORE: 10,
  PERCENTAGE_MULTIPLIER: 100,
  SCORE_MULTIPLIER: 10,
};

const categoryLabels = {
  communication: 'Communication',
  intimacy: 'Intimacy',
  finance: 'Finance',
  time: 'Time Together',
  family: 'Family',
  personalGrowth: 'Personal Growth',
};

export function MobileProgressView({
  issues,
  actions,
  healthScore,
  setHealthScore: _setHealthScore,
  currentPartner,
  otherPartner,
  viewingAsPartner,
}: MobileProgressViewProps) {
  const { isMobile } = useMobileDetection();
  const { triggerHaptic } = useHapticFeedback();

  if (!isMobile) {
    return null; // Fallback to desktop version
  }

  const completedActions = actions.filter((a) => a.status === 'completed');
  const totalActions = actions.length;
  const completionRate =
    totalActions > 0
      ? (completedActions.length / totalActions) * HEALTH_CONSTANTS.PERCENTAGE_MULTIPLIER
      : 0;

  const myActions = actions.filter(
    (a) =>
      a.assignedToId === currentPartner.id ||
      (a.assignedTo === 'both' && viewingAsPartner.id === currentPartner.id)
  );
  const partnerActions = actions.filter(
    (a) =>
      a.assignedToId === otherPartner.id ||
      (a.assignedTo === 'both' && viewingAsPartner.id === otherPartner.id)
  );

  const myCompletedActions = myActions.filter((a) => a.status === 'completed').length;
  const partnerCompletedActions = partnerActions.filter((a) => a.status === 'completed').length;

  const myCompletionRate = myActions.length > 0 ? (myCompletedActions / myActions.length) * 100 : 0;
  const partnerCompletionRate =
    partnerActions.length > 0 ? (partnerCompletedActions / partnerActions.length) * 100 : 0;

  const recentCompletions = completedActions
    .filter((a) => a.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 3);

  const upcomingActions = actions
    .filter((a) => a.status !== 'completed' && a.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);

  const getHealthColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    if (score >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Needs Work';
    return 'Critical';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getIssueTitle = (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId);
    return issue?.title || 'Unknown Issue';
  };

  const getPartnerName = (partnerId: string) => {
    if (partnerId === currentPartner.id) return currentPartner.name;
    if (partnerId === otherPartner.id) return otherPartner.name;
    return 'Unknown';
  };

  const handleHealthScorePress = () => {
    triggerHaptic('light');
    // Would open health score editor in real implementation
  };

  return (
    <MobilePage
      title={
        viewingAsPartner.id === currentPartner.id
          ? 'Your Progress'
          : `${viewingAsPartner.name}'s Progress`
      }
    >
      <MobileStack spacing="lg" className="pb-safe-area-bottom">
        {/* Health Score Card */}
        <MobileCard variant="default" elevated onClick={handleHealthScorePress} pressable>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getHealthColor(healthScore.overallScore)}`}>
                {healthScore.overallScore}/{HEALTH_CONSTANTS.MAX_SCORE}
              </div>
              <Badge variant="secondary" className="mt-1">
                {getHealthLabel(healthScore.overallScore)}
              </Badge>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="text-accent" size={20} weight="fill" />
                <span className="text-sm font-medium">Relationship Health</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Last updated: {formatDate(healthScore.lastUpdated)}
              </div>
            </div>
          </div>
        </MobileCard>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <MobileCard variant="default" className="text-center p-4">
            <Target className="text-primary mx-auto mb-2" size={24} />
            <div className="text-xl font-bold">{totalActions}</div>
            <div className="text-sm text-muted-foreground">Total Actions</div>
          </MobileCard>

          <MobileCard variant="default" className="text-center p-4">
            <CheckCircle className="text-green-500 mx-auto mb-2" size={24} weight="fill" />
            <div className="text-xl font-bold">{completedActions.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </MobileCard>

          <MobileCard variant="default" className="text-center p-4">
            <TrendUp className="text-accent mx-auto mb-2" size={24} />
            <div className="text-xl font-bold">{Math.round(completionRate)}%</div>
            <div className="text-sm text-muted-foreground">Overall Rate</div>
          </MobileCard>

          <MobileCard variant="default" className="text-center p-4">
            <ChartBar className="text-secondary mx-auto mb-2" size={24} />
            <div className="text-xl font-bold">{issues.length}</div>
            <div className="text-sm text-muted-foreground">Active Issues</div>
          </MobileCard>
        </div>

        {/* Health Categories */}
        <MobileCard>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Health Categories</h3>
            {Object.entries(categoryLabels).map(([key, label]) => {
              const score = healthScore.categories[key as keyof typeof healthScore.categories];
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    <span className={`text-sm font-semibold ${getHealthColor(score)}`}>
                      {score}/{HEALTH_CONSTANTS.MAX_SCORE}
                    </span>
                  </div>
                  <Progress value={score * HEALTH_CONSTANTS.SCORE_MULTIPLIER} className="h-2" />
                </div>
              );
            })}
          </div>
        </MobileCard>

        {/* Partner Comparison */}
        <div className="grid grid-cols-1 gap-3">
          <MobileCard>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                  {currentPartner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{currentPartner.name}'s Progress</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Actions</span>
                <span className="font-semibold">{myActions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Completed</span>
                <span className="font-semibold text-primary">{myCompletedActions}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Progress</span>
                  <span className="font-semibold">{Math.round(myCompletionRate)}%</span>
                </div>
                <Progress value={myCompletionRate} className="h-2" />
              </div>
            </div>
          </MobileCard>

          <MobileCard>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm bg-accent text-accent-foreground">
                  {otherPartner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{otherPartner.name}'s Progress</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Actions</span>
                <span className="font-semibold">{partnerActions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Completed</span>
                <span className="font-semibold text-primary">{partnerCompletedActions}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Progress</span>
                  <span className="font-semibold">{Math.round(partnerCompletionRate)}%</span>
                </div>
                <Progress value={partnerCompletionRate} className="h-2" />
              </div>
            </div>
          </MobileCard>
        </div>

        {/* Recent Activity */}
        {recentCompletions.length > 0 && (
          <MobileCard>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-primary" size={20} weight="fill" />
                <h3 className="text-lg font-semibold">Recent Completions</h3>
              </div>
              {recentCompletions.map((action) => (
                <div key={action.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="text-primary mt-0.5" size={16} weight="fill" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{getIssueTitle(action.issueId)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        Completed {formatDate(action.completedAt!)}
                      </p>
                      {action.completedBy && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {getPartnerName(action.completedBy)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </MobileCard>
        )}

        {/* Upcoming Deadlines */}
        {upcomingActions.length > 0 && (
          <MobileCard>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="text-accent" size={20} />
                <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
              </div>
              {upcomingActions.map((action) => (
                <div key={action.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="text-accent mt-0.5" size={16} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{getIssueTitle(action.issueId)}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {formatDate(action.dueDate!)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </MobileCard>
        )}
      </MobileStack>
    </MobilePage>
  );
}

export default MobileProgressView;
