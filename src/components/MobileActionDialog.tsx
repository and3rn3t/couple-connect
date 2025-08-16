import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogTitle,
} from '@/components/ui/mobile-dialog';
import { MobileButton } from '@/components/ui/mobile-button';
import { MobileInput } from '@/components/ui/mobile-input';
import {
  MagicWand,
  PencilSimple,
  Calendar,
  Users,
  User,
  CheckCircle,
  X,
  ArrowRight,
  Heart,
  Star,
  Plus,
} from '@/components/ui/InlineIcons';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Issue, Action } from '@/App';
import { Partner } from '@/components/PartnerSetup';
import { toast } from 'sonner';

// Simplified template interface for mobile
interface MobileActionTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: React.ReactNode;
}

interface MobileActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
  actions: Action[];
  setActions: (update: (current: Action[]) => Action[]) => void;
  action?: Action | null;
  currentPartner: Partner;
  otherPartner: Partner;
}

export const MobileActionDialog = ({
  isOpen,
  onClose,
  issue,
  actions: _actions,
  setActions,
  action,
  currentPartner,
  otherPartner,
}: MobileActionDialogProps) => {
  const { triggerHaptic } = useHapticFeedback();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<Action['assignedTo']>('both');
  const [assignedToId, setAssignedToId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');

  // UI state
  const [currentStep, setCurrentStep] = useState<'method' | 'template' | 'form' | 'review'>(
    'method'
  );
  const [selectedTemplate, setSelectedTemplate] = useState<MobileActionTemplate | null>(null);
  const [showTemplateDetail, setShowTemplateDetail] = useState(false);

  // Sample templates (in real app, these would come from props or API)
  const templates: MobileActionTemplate[] = [
    {
      id: '1',
      title: 'Weekly Check-in Meeting',
      description: 'Schedule regular relationship check-ins to discuss feelings and goals',
      category: 'communication',
      estimatedTime: '30 min',
      difficulty: 'easy',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: '2',
      title: 'Date Night Planning',
      description: 'Plan and schedule regular date nights to strengthen your connection',
      category: 'intimacy',
      estimatedTime: '1 hour',
      difficulty: 'easy',
      icon: <Heart className="w-5 h-5" />,
    },
    {
      id: '3',
      title: 'Budget Discussion',
      description: 'Create a financial plan and discuss money goals together',
      category: 'finances',
      estimatedTime: '45 min',
      difficulty: 'medium',
      icon: <Star className="w-5 h-5" />,
    },
    {
      id: '4',
      title: 'Conflict Resolution Session',
      description: 'Address disagreements using structured communication techniques',
      category: 'communication',
      estimatedTime: '1 hour',
      difficulty: 'hard',
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ];

  // Filter templates based on issue category
  const relevantTemplates = issue
    ? templates.filter((t) => t.category === issue.category)
    : templates;

  // Initialize form when editing existing action
  useEffect(() => {
    if (action) {
      setTitle(action.title);
      setDescription(action.description);
      setAssignedTo(action.assignedTo);
      setAssignedToId(action.assignedToId || '');
      setDueDate(action.dueDate);
      // Remove priority field since it's not in Action interface
      setCurrentStep('form');
    } else {
      // Reset form for new action
      setTitle('');
      setDescription('');
      setAssignedTo('both');
      setAssignedToId('');
      setDueDate('');
      setSelectedTemplate(null);
      setCurrentStep('method');
    }
  }, [action, isOpen]);

  // Handle template selection
  const handleTemplateSelect = (template: MobileActionTemplate) => {
    triggerHaptic('medium');
    setSelectedTemplate(template);
    setTitle(template.title);
    setDescription(template.description);
    setCurrentStep('form');
    toast.success('Template applied!');
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Please enter an action title');
      return;
    }

    triggerHaptic('heavy');

    const actionData: Partial<Action> = {
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      assignedToId: assignedToId,
      dueDate,
      issueId: issue?.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (action) {
      // Edit existing action
      setActions((current) =>
        current.map((a) => (a.id === action.id ? { ...a, ...actionData } : a))
      );
      toast.success('Action updated successfully!');
    } else {
      // Create new action
      const newAction: Action = {
        id: Date.now().toString(),
        ...actionData,
      } as Action;

      setActions((current) => [...current, newAction]);
      toast.success('Action created successfully!');
    }

    onClose();
  };

  // Handle step navigation
  const handleStepChange = (step: typeof currentStep) => {
    triggerHaptic('light');
    setCurrentStep(step);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <MobileDialog open={isOpen} onOpenChange={onClose}>
        <MobileDialogContent className="max-w-sm max-h-[90vh] flex flex-col">
          <MobileDialogHeader className="border-b border-gray-200">
            <MobileDialogTitle className="flex items-center justify-between">
              <span>{action ? 'Edit Action' : 'Create Action'}</span>
              <MobileButton variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </MobileButton>
            </MobileDialogTitle>
            {issue && <p className="text-sm text-gray-600 mt-1">For issue: {issue.title}</p>}
          </MobileDialogHeader>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {/* Step 1: Choose Method (Create vs Template) */}
              {currentStep === 'method' && !action && (
                <motion.div
                  key="method"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 space-y-4"
                >
                  <div className="text-center py-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      How would you like to create this action?
                    </h3>
                    <p className="text-sm text-gray-600">
                      Choose a template for quick setup or create from scratch
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Card
                      className="cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-2 border-blue-200"
                      onClick={() => handleStepChange('template')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <MagicWand className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Use Template</h4>
                            <p className="text-sm text-gray-600">
                              Quick start with proven solutions
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className="cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => handleStepChange('form')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <PencilSimple className="w-6 h-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Create Custom</h4>
                            <p className="text-sm text-gray-600">Build your own action plan</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Template Selection */}
              {currentStep === 'template' && (
                <motion.div
                  key="template"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <MobileButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStepChange('method')}
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </MobileButton>
                    <h3 className="font-semibold text-gray-900">Choose Template</h3>
                  </div>

                  {issue && relevantTemplates.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        Recommended for "{issue.category}"
                      </h4>
                      <p className="text-xs text-blue-700">
                        These templates work well for your type of issue
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {(relevantTemplates.length > 0 ? relevantTemplates : templates).map(
                      (template) => (
                        <Card
                          key={template.id}
                          className="cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                {template.icon}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                  {template.title}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {template.description}
                                </p>

                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={getDifficultyColor(template.difficulty)}>
                                    {template.difficulty}
                                  </Badge>
                                  <Badge className="bg-gray-100 text-gray-600 text-xs">
                                    {template.estimatedTime}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>

                  <MobileButton
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStepChange('form')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Custom Instead
                  </MobileButton>
                </motion.div>
              )}

              {/* Step 3: Form Input */}
              {currentStep === 'form' && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    {!action && (
                      <MobileButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStepChange(selectedTemplate ? 'template' : 'method')}
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </MobileButton>
                    )}
                    <h3 className="font-semibold text-gray-900">
                      {selectedTemplate ? 'Customize Template' : 'Action Details'}
                    </h3>
                  </div>

                  {selectedTemplate && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          Template Applied: {selectedTemplate.title}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Action Title *
                      </label>
                      <MobileInput
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Schedule weekly budget meetings"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what needs to be done..."
                        className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Assigned To
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'both', label: 'Both', icon: <Users className="w-4 h-4" /> },
                          {
                            key: currentPartner.id,
                            label: 'Me',
                            icon: <User className="w-4 h-4" />,
                          },
                          {
                            key: otherPartner.id,
                            label: otherPartner.name,
                            icon: <User className="w-4 h-4" />,
                          },
                        ].map((option) => (
                          <MobileButton
                            key={option.key}
                            variant={
                              assignedTo === option.key || assignedToId === option.key
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            className="flex-col gap-1 h-auto py-3"
                            onClick={() => {
                              if (option.key === 'both') {
                                setAssignedTo('both');
                                setAssignedToId('');
                              } else {
                                setAssignedTo(
                                  option.key === currentPartner.id ? 'partner1' : 'partner2'
                                );
                                setAssignedToId(option.key);
                              }
                            }}
                          >
                            {option.icon}
                            <span className="text-xs">{option.label}</span>
                          </MobileButton>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Due Date (Optional)
                      </label>
                      <MobileInput
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <MobileButton
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      onClick={() => handleStepChange('review')}
                      disabled={!title.trim()}
                    >
                      Review Action
                    </MobileButton>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {currentStep === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <MobileButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStepChange('form')}
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </MobileButton>
                    <h3 className="font-semibold text-gray-900">Review & Create</h3>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {description && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Assigned To</h4>
                          <Badge className="bg-blue-100 text-blue-700">
                            {assignedTo === 'both'
                              ? 'Both Partners'
                              : assignedToId === currentPartner.id
                                ? 'Me'
                                : otherPartner.name}
                          </Badge>
                        </div>
                      </div>

                      {dueDate && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Due Date</h4>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {new Date(dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {issue && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Related Issue</h4>
                          <p className="text-sm text-gray-600">{issue.title}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <MobileButton
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleStepChange('form')}
                    >
                      Edit
                    </MobileButton>

                    <MobileButton
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={handleSubmit}
                    >
                      {action ? 'Update' : 'Create'} Action
                    </MobileButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </MobileDialogContent>
      </MobileDialog>

      {/* Template Detail Modal (if needed) */}
      <MobileDialog open={showTemplateDetail} onOpenChange={setShowTemplateDetail}>
        <MobileDialogContent className="max-w-sm">
          {selectedTemplate && (
            <>
              <MobileDialogHeader>
                <MobileDialogTitle>{selectedTemplate.title}</MobileDialogTitle>
              </MobileDialogHeader>

              <div className="p-4 space-y-4">
                <p className="text-sm text-gray-600">{selectedTemplate.description}</p>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {selectedTemplate.estimatedTime}
                    </div>
                    <div className="text-xs text-gray-600">Time Needed</div>
                  </div>

                  <div className="text-center">
                    <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                      {selectedTemplate.difficulty}
                    </Badge>
                    <div className="text-xs text-gray-600 mt-1">Difficulty</div>
                  </div>
                </div>

                <MobileButton
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => {
                    handleTemplateSelect(selectedTemplate);
                    setShowTemplateDetail(false);
                  }}
                >
                  Use This Template
                </MobileButton>
              </div>
            </>
          )}
        </MobileDialogContent>
      </MobileDialog>
    </>
  );
};

export default MobileActionDialog;
