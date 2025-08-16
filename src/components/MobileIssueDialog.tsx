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
  Heart,
  Clock,
  Users,
  User,
  X,
  ArrowRight,
  Check,
  Camera,
} from '@/components/ui/InlineIcons';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Issue } from '@/App';
import { toast } from 'sonner';

interface MobileIssueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
  issues: Issue[];
  setIssues: (update: (current: Issue[]) => Issue[]) => void;
}

// Category configuration for mobile
const categories = [
  {
    id: 'communication' as const,
    label: 'Communication',
    icon: <span className="text-lg">💬</span>,
    color: 'bg-blue-100 text-blue-700',
    description: 'Talking, listening, understanding',
  },
  {
    id: 'intimacy' as const,
    label: 'Intimacy',
    icon: <Heart className="w-5 h-5" />,
    color: 'bg-pink-100 text-pink-700',
    description: 'Physical and emotional closeness',
  },
  {
    id: 'finance' as const,
    label: 'Finance',
    icon: <span className="text-lg">💰</span>,
    color: 'bg-green-100 text-green-700',
    description: 'Money, budget, financial goals',
  },
  {
    id: 'time' as const,
    label: 'Time Management',
    icon: <Clock className="w-5 h-5" />,
    color: 'bg-orange-100 text-orange-700',
    description: 'Scheduling, priorities, balance',
  },
  {
    id: 'family' as const,
    label: 'Family',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-700',
    description: 'Kids, relatives, family dynamics',
  },
  {
    id: 'personal-growth' as const,
    label: 'Personal Growth',
    icon: <User className="w-5 h-5" />,
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Individual development, goals',
  },
];

const priorities = [
  { id: 'low' as const, label: 'Low', color: 'bg-gray-100 text-gray-700', description: 'Can wait' },
  {
    id: 'medium' as const,
    label: 'Medium',
    color: 'bg-yellow-100 text-yellow-700',
    description: 'Important',
  },
  { id: 'high' as const, label: 'High', color: 'bg-red-100 text-red-700', description: 'Urgent' },
];

export const MobileIssueDialog = ({
  isOpen,
  onClose,
  issue,
  issues,
  setIssues,
}: MobileIssueDialogProps) => {
  const { triggerHaptic } = useHapticFeedback();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Issue['category']>('communication');
  const [priority, setPriority] = useState<Issue['priority']>('medium');
  const [connections, setConnections] = useState<string[]>([]);

  // UI state
  const [currentStep, setCurrentStep] = useState<
    'category' | 'details' | 'priority' | 'connections' | 'review'
  >('category');
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showPhotoOption, setShowPhotoOption] = useState(false);

  // Initialize form when editing
  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description);
      setCategory(issue.category);
      setPriority(issue.priority);
      setConnections(issue.connections);
      setCurrentStep('details'); // Skip category selection when editing
    } else {
      // Reset form for new issue
      setTitle('');
      setDescription('');
      setCategory('communication');
      setPriority('medium');
      setConnections([]);
      setCurrentStep('category');
    }
  }, [issue, isOpen]);

  // Handle step navigation
  const handleStepChange = (step: typeof currentStep) => {
    triggerHaptic('light');
    setCurrentStep(step);
  };

  // Handle category selection
  const handleCategorySelect = (selectedCategory: Issue['category']) => {
    setCategory(selectedCategory);
    triggerHaptic('medium');
    setCurrentStep('details');
  };

  // Handle priority selection
  const handlePrioritySelect = (selectedPriority: Issue['priority']) => {
    setPriority(selectedPriority);
    triggerHaptic('medium');
  };

  // Handle connection toggle
  const handleConnectionToggle = (issueId: string) => {
    triggerHaptic('light');
    setConnections((prev) =>
      prev.includes(issueId) ? prev.filter((id) => id !== issueId) : [...prev, issueId]
    );
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Please enter an issue title');
      return;
    }

    triggerHaptic('heavy');

    const issueData: Partial<Issue> = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      connections,
      createdAt: new Date().toISOString(),
      position: { x: 0, y: 0 }, // Default position
    };

    if (issue) {
      // Edit existing issue
      setIssues((current) => current.map((i) => (i.id === issue.id ? { ...i, ...issueData } : i)));
      toast.success('Issue updated successfully!');
    } else {
      // Create new issue
      const newIssue: Issue = {
        id: Date.now().toString(),
        ...issueData,
      } as Issue;

      setIssues((current) => [...current, newIssue]);
      toast.success('Issue created successfully!');
    }

    onClose();
  };

  // Get selected category info
  const selectedCategoryInfo = categories.find((cat) => cat.id === category);
  const selectedPriorityInfo = priorities.find((pri) => pri.id === priority);

  // Available connections (other issues)
  const availableConnections = issues.filter((i) => i.id !== issue?.id);

  return (
    <MobileDialog open={isOpen} onOpenChange={onClose}>
      <MobileDialogContent className="max-w-sm max-h-[90vh] flex flex-col">
        <MobileDialogHeader className="border-b border-gray-200">
          <MobileDialogTitle className="flex items-center justify-between">
            <span>{issue ? 'Edit Issue' : 'Report Issue'}</span>
            <MobileButton variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </MobileButton>
          </MobileDialogTitle>
        </MobileDialogHeader>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Category Selection */}
            {currentStep === 'category' && !issue && (
              <motion.div
                key="category"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 space-y-4"
              >
                <div className="text-center py-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What type of issue is this?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose the category that best describes your concern
                  </p>
                </div>

                <div className="space-y-3">
                  {categories.map((cat) => (
                    <Card
                      key={cat.id}
                      className="cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-2 border-transparent hover:border-blue-200"
                      onClick={() => handleCategorySelect(cat.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${cat.color}`}
                          >
                            {cat.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{cat.label}</h4>
                            <p className="text-sm text-gray-600">{cat.description}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Issue Details */}
            {currentStep === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 space-y-4"
              >
                <div className="flex items-center gap-3">
                  {!issue && (
                    <MobileButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStepChange('category')}
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </MobileButton>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">Issue Details</h3>
                    {selectedCategoryInfo && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={selectedCategoryInfo.color}>
                          {selectedCategoryInfo.label}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Issue Title *
                    </label>
                    <MobileInput
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Need better communication about finances"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Description
                    </label>
                    <div className="relative">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the issue in more detail..."
                        className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                      />

                      <div className="flex gap-2 mt-2">
                        <MobileButton
                          variant="outline"
                          size="sm"
                          onClick={() => setShowVoiceInput(!showVoiceInput)}
                          className="flex-1"
                        >
                          🎤 Voice Input
                        </MobileButton>

                        <MobileButton
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPhotoOption(!showPhotoOption)}
                          className="flex-1"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Add Photo
                        </MobileButton>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <MobileButton
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={() => handleStepChange('priority')}
                    disabled={!title.trim()}
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </MobileButton>
                </div>
              </motion.div>
            )}

            {/* Step 3: Priority Selection */}
            {currentStep === 'priority' && (
              <motion.div
                key="priority"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <MobileButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStepChange('details')}
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </MobileButton>
                  <h3 className="font-semibold text-gray-900">Set Priority</h3>
                </div>

                <div className="text-center py-2">
                  <p className="text-sm text-gray-600">
                    How urgent is this issue for your relationship?
                  </p>
                </div>

                <div className="space-y-3">
                  {priorities.map((pri) => (
                    <Card
                      key={pri.id}
                      className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-2 ${
                        priority === pri.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                      }`}
                      onClick={() => handlePrioritySelect(pri.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              priority === pri.id
                                ? 'border-blue-500 bg-blue-500 flex items-center justify-center'
                                : 'border-gray-300'
                            }`}
                          >
                            {priority === pri.id && <Check className="w-2 h-2 text-white" />}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {pri.label} Priority
                              </span>
                              <Badge className={pri.color}>{pri.label}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{pri.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <MobileButton
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={() =>
                      handleStepChange(availableConnections.length > 0 ? 'connections' : 'review')
                    }
                  >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </MobileButton>
                </div>
              </motion.div>
            )}

            {/* Step 4: Related Issues (Optional) */}
            {currentStep === 'connections' && availableConnections.length > 0 && (
              <motion.div
                key="connections"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <MobileButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStepChange('priority')}
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </MobileButton>
                  <h3 className="font-semibold text-gray-900">Related Issues</h3>
                </div>

                <div className="text-center py-2">
                  <p className="text-sm text-gray-600">
                    Is this issue connected to any existing ones? (Optional)
                  </p>
                </div>

                <div className="space-y-3">
                  {availableConnections.map((relatedIssue) => (
                    <Card
                      key={relatedIssue.id}
                      className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-2 ${
                        connections.includes(relatedIssue.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-transparent'
                      }`}
                      onClick={() => handleConnectionToggle(relatedIssue.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded border-2 ${
                              connections.includes(relatedIssue.id)
                                ? 'border-blue-500 bg-blue-500 flex items-center justify-center'
                                : 'border-gray-300'
                            }`}
                          >
                            {connections.includes(relatedIssue.id) && (
                              <Check className="w-2 h-2 text-white" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {relatedIssue.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="text-xs">{relatedIssue.category}</Badge>
                              <Badge
                                className={`text-xs ${
                                  relatedIssue.priority === 'high'
                                    ? 'bg-red-100 text-red-700'
                                    : relatedIssue.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {relatedIssue.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <MobileButton
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleStepChange('review')}
                    >
                      Skip
                    </MobileButton>

                    <MobileButton
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                      onClick={() => handleStepChange('review')}
                    >
                      Continue
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </MobileButton>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Review */}
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
                    onClick={() =>
                      handleStepChange(availableConnections.length > 0 ? 'connections' : 'priority')
                    }
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </MobileButton>
                  <h3 className="font-semibold text-gray-900">Review & Submit</h3>
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Category</h4>
                        {selectedCategoryInfo && (
                          <Badge className={selectedCategoryInfo.color}>
                            {selectedCategoryInfo.label}
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Priority</h4>
                        {selectedPriorityInfo && (
                          <Badge className={selectedPriorityInfo.color}>
                            {selectedPriorityInfo.label}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {connections.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Related Issues</h4>
                        <div className="space-y-1">
                          {connections.map((connectionId) => {
                            const relatedIssue = issues.find((i) => i.id === connectionId);
                            return relatedIssue ? (
                              <div
                                key={connectionId}
                                className="text-sm text-gray-600 flex items-center gap-2"
                              >
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                {relatedIssue.title}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <MobileButton
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleStepChange('details')}
                  >
                    Edit
                  </MobileButton>

                  <MobileButton
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={handleSubmit}
                  >
                    {issue ? 'Update' : 'Create'} Issue
                  </MobileButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </MobileDialogContent>
    </MobileDialog>
  );
};

export default MobileIssueDialog;
