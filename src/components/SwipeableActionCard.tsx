import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, ArrowRight, Calendar, User } from '@/components/ui/InlineIcons';
import { cn } from '@/lib/utils';
import { useGestures } from '@/hooks/useGestures';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { motion, AnimatePresence } from 'framer-motion';
import { Action } from '@/App';
import { Partner } from '@/components/PartnerSetup';

interface SwipeableActionCardProps {
  action: Action;
  onStatusChange: (actionId: string, newStatus: Action['status']) => void;
  onDelete: (actionId: string) => void;
  onEdit: (action: Action) => void;
  currentPartner: Partner;
  otherPartner: Partner;
  className?: string;
}

/**
 * Enhanced action card with swipe gestures for mobile interaction
 * Supports swipe-to-complete, swipe-to-delete, and long-press context menu
 */
export function SwipeableActionCard({
  action,
  onStatusChange,
  onDelete,
  onEdit,
  currentPartner,
  otherPartner,
  className,
}: SwipeableActionCardProps) {
  const { triggerSuccess, triggerError, triggerSelection } = useHapticFeedback();
  const [swipeOffset, _setSwipeOffset] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getActionIcon = () => {
    switch (action.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (action.status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAssignedPartner = () => {
    if (action.assignedTo === 'both') return 'Both';
    if (action.assignedTo === 'partner1') return currentPartner.name;
    if (action.assignedTo === 'partner2') return otherPartner.name;
    return 'Unassigned';
  };

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    triggerSelection();

    if (direction === 'right' && action.status !== 'completed') {
      // Swipe right to complete
      setIsCompleting(true);
      triggerSuccess();

      setTimeout(() => {
        onStatusChange(action.id, 'completed');
        setIsCompleting(false);
      }, 300);
    } else if (direction === 'left') {
      // Swipe left to delete
      setIsDeleting(true);
      triggerError();

      setTimeout(() => {
        onDelete(action.id);
      }, 300);
    } else if (direction === 'up') {
      // Swipe up to show actions
      setShowActions(true);
      triggerSelection();
    }
  };

  const handleLongPress = () => {
    triggerSelection();
    setShowActions(true);
  };

  const handleTap = () => {
    triggerSelection();
    onEdit(action);
  };

  const gestureRef = useGestures(
    {
      onSwipe: ({ direction }) => handleSwipe(direction),
      onLongPress: handleLongPress,
      onTap: handleTap,
    },
    {
      swipeThreshold: 50,
      longPressThreshold: 400,
      preventDefault: false, // Allow normal scrolling
    }
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const isOverdue = () => {
    const dueDate = new Date(action.dueDate);
    const now = new Date();
    return dueDate < now && action.status !== 'completed';
  };

  return (
    <motion.div
      ref={gestureRef}
      className={cn('relative touch-manipulation', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isDeleting ? 0 : 1,
        y: 0,
        x: swipeOffset,
        scale: isCompleting ? 0.95 : 1,
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {/* Swipe Action Backgrounds */}
      <div className="absolute inset-0 flex">
        {/* Right swipe background (complete) */}
        <motion.div
          className="flex-1 bg-green-500 rounded-lg flex items-center justify-start pl-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: swipeOffset > 0 ? 1 : 0 }}
          transition={{ duration: 0.1 }}
        >
          <CheckCircle className="h-6 w-6 text-white" />
          <span className="ml-2 text-white font-medium">Complete</span>
        </motion.div>

        {/* Left swipe background (delete) */}
        <motion.div
          className="flex-1 bg-red-500 rounded-lg flex items-center justify-end pr-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: swipeOffset < 0 ? 1 : 0 }}
          transition={{ duration: 0.1 }}
        >
          <span className="mr-2 text-white font-medium">Delete</span>
          <TrashSimple className="h-6 w-6 text-white" />
        </motion.div>
      </div>

      {/* Main Card */}
      <Card
        className={cn(
          'relative z-10 border shadow-sm transition-all duration-200',
          'touch-target-44 cursor-pointer',
          isOverdue() && action.status !== 'completed' && 'border-red-200 bg-red-50',
          isCompleting && 'bg-green-50 border-green-200',
          isDeleting && 'bg-red-50 border-red-200'
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {getActionIcon()}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium leading-tight truncate">
                  {action.title}
                </CardTitle>
                {action.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {action.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-2">
              <Badge variant="outline" className={cn('text-xs', getStatusColor())}>
                {action.status}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                  triggerSelection();
                }}
              >
                <DotsThreeVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{getAssignedPartner()}</span>
              </div>

              {action.dueDate && (
                <div
                  className={cn(
                    'flex items-center gap-1',
                    isOverdue() && action.status !== 'completed' && 'text-red-600'
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(action.dueDate)}</span>
                </div>
              )}
            </div>

            {action.status === 'in-progress' && (
              <div className="flex items-center gap-2">
                <Progress value={60} className="w-12 h-1" />
                <span className="text-xs">60%</span>
              </div>
            )}
          </div>

          {/* Progress Notes */}
          {action.notes.length > 0 && (
            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
              <p className="text-muted-foreground">
                Latest: {action.notes[action.notes.length - 1]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Menu */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-20 mt-2"
          >
            <Card className="p-2 shadow-lg border">
              <div className="grid grid-cols-2 gap-2">
                {action.status !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onStatusChange(action.id, 'completed');
                      setShowActions(false);
                      triggerSuccess();
                    }}
                    className="h-8 text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Button>
                )}

                {action.status !== 'in-progress' && action.status !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onStatusChange(action.id, 'in-progress');
                      setShowActions(false);
                      triggerSelection();
                    }}
                    className="h-8 text-xs"
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onEdit(action);
                    setShowActions(false);
                    triggerSelection();
                  }}
                  className="h-8 text-xs"
                >
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onDelete(action.id);
                    triggerError();
                  }}
                  className="h-8 text-xs"
                >
                  <TrashSimple className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close actions menu */}
      {showActions && (
        <div
          className="fixed inset-0 z-10 bg-transparent"
          onClick={() => setShowActions(false)}
          onTouchStart={() => setShowActions(false)}
        />
      )}
    </motion.div>
  );
}

/**
 * Gesture instruction component to teach users about swipe actions
 */
export function SwipeInstructions({ className }: { className?: string }) {
  const [showInstructions, setShowInstructions] = useState(true);

  if (!showInstructions) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn('mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg', className)}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Gesture Controls</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• Swipe right to complete</p>
            <p>• Swipe left to delete</p>
            <p>• Long press for menu</p>
            <p>• Tap to edit</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInstructions(false)}
          className="h-6 w-6 p-0 text-blue-600"
        >
          ×
        </Button>
      </div>
    </motion.div>
  );
}
