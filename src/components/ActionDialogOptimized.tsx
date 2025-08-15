import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MagicWand, PencilSimple } from '@phosphor-icons/react';
import { Issue, Action } from '@/App';
import { Partner } from '@/components/PartnerSetup';
import { toast } from 'sonner';
import ActionTemplatePicker from '@/components/ActionTemplatePicker';
import QuickTemplateSuggestions from '@/components/QuickTemplateSuggestions';
import { ActionTemplate } from '@/data/actionTemplates';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { MobileInput, MobileTextarea, MobileSelect } from '@/components/ui/mobile-forms';
import { TouchButton } from '@/components/ui/touch-feedback';
import { MobileModal, MobileStack } from '@/components/ui/mobile-layout';

interface ActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
  actions: Action[];
  setActions: (update: (current: Action[]) => Action[]) => void;
  action?: Action | null;
  currentPartner: Partner;
  otherPartner: Partner;
}

export default function ActionDialog({
  isOpen,
  onClose,
  issue,
  actions: _actions,
  setActions,
  action,
  currentPartner,
  otherPartner,
}: ActionDialogProps) {
  const { isMobile } = useMobileDetection();
  const { triggerHaptic } = useHapticFeedback();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<Action['assignedTo']>('both');
  const [assignedToId, setAssignedToId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [activeTab, setActiveTab] = useState('templates');

  useEffect(() => {
    if (action) {
      setTitle(action.title);
      setDescription(action.description);
      setAssignedTo(action.assignedTo);
      setAssignedToId(action.assignedToId || '');
      setDueDate(action.dueDate ? action.dueDate.split('T')[0] : '');
      setActiveTab('custom'); // Go directly to custom form when editing
    } else {
      setTitle('');
      setDescription('');
      setAssignedTo('both');
      setAssignedToId('');
      setDueDate('');
      setActiveTab('templates'); // Start with templates for new actions
    }
  }, [action, isOpen]);

  const handleTemplateSelect = (template: ActionTemplate) => {
    triggerHaptic('selection');
    setTitle(template.title);
    setDescription(template.description);

    // Set suggested assignment
    if (template.suggestedAssignment === 'both') {
      setAssignedTo('both');
      setAssignedToId('');
    } else {
      setAssignedTo('partner1');
      setAssignedToId(currentPartner.id); // Default to current partner
    }

    // Set suggested due date
    const suggestedDueDate = new Date();
    suggestedDueDate.setDate(suggestedDueDate.getDate() + template.suggestedDuration);
    setDueDate(suggestedDueDate.toISOString().split('T')[0]);

    // Switch to custom tab for fine-tuning
    setActiveTab('custom');
    toast.success('Template applied! Customize as needed.');
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a title for the action');
      return;
    }

    if (!issue && !action) {
      toast.error('No issue selected');
      return;
    }

    const actionData: Partial<Action> = {
      id: action?.id || Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      assignedToId: assignedTo === 'both' ? '' : assignedToId,
      status: (action?.status || 'pending') as Action['status'],
      createdAt: action?.createdAt || new Date().toISOString(),
      issueId: issue?.id || action?.issueId || '',
      dueDate: dueDate || action?.dueDate,
      completedAt: action?.completedAt,
      completedBy: action?.completedBy,
    };

    if (action) {
      // Update existing action
      setActions((current) =>
        current.map((a) => (a.id === action.id ? ({ ...a, ...actionData } as Action) : a))
      );
      toast.success('Action updated successfully');
    } else {
      // Create new action
      setActions((current) => [
        ...current,
        {
          ...actionData,
          createdBy: currentPartner.id,
          notes: [],
        } as Action,
      ]);
      toast.success('Action created successfully');
    }

    triggerHaptic('medium');
    onClose();
  };

  const handleClose = () => {
    triggerHaptic('light');
    onClose();
  };

  const assignmentOptions = [
    { value: 'both', label: 'Both Partners' },
    { value: 'partner1', label: currentPartner.name },
    { value: 'partner2', label: otherPartner.name },
  ];

  // Mobile-specific rendering
  if (isMobile) {
    return (
      <MobileModal
        isOpen={isOpen}
        onClose={handleClose}
        title={action ? 'Edit Action' : 'Create Action'}
        size="full"
      >
        <MobileStack spacing="lg">
          {/* Mobile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <MagicWand size={16} />
                Templates
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <PencilSimple size={16} />
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              {issue && (
                <QuickTemplateSuggestions issue={issue} onSelectTemplate={handleTemplateSelect} />
              )}
              <ActionTemplatePicker onSelectTemplate={handleTemplateSelect} />
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <MobileStack spacing="md">
                <MobileInput
                  label="Action Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  variant="ios"
                />

                <MobileTextarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the action in detail..."
                  variant="ios"
                  autoResize
                />

                <MobileSelect
                  label="Assigned to"
                  options={assignmentOptions}
                  value={
                    assignedTo === 'both'
                      ? 'both'
                      : assignedTo === 'partner1'
                        ? 'partner1'
                        : 'partner2'
                  }
                  onValueChange={(value) => {
                    setAssignedTo(value as Action['assignedTo']);
                    if (value === 'partner1') {
                      setAssignedToId(currentPartner.id);
                    } else if (value === 'partner2') {
                      setAssignedToId(otherPartner.id);
                    } else {
                      setAssignedToId('');
                    }
                  }}
                />

                <MobileInput
                  label="Due Date (optional)"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  variant="ios"
                />
              </MobileStack>

              {/* Mobile Action Buttons */}
              <div className="flex flex-col gap-3 pt-6">
                <TouchButton
                  onPress={handleSave}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  hapticType="medium"
                >
                  {action ? 'Update Action' : 'Create Action'}
                </TouchButton>
                <TouchButton
                  onPress={handleClose}
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  hapticType="light"
                >
                  Cancel
                </TouchButton>
              </div>
            </TabsContent>
          </Tabs>
        </MobileStack>
      </MobileModal>
    );
  }

  // Desktop fallback - keep original dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action ? 'Edit Action' : 'Create Action'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <MagicWand size={16} />
              Templates
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <PencilSimple size={16} />
              Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            {issue && (
              <QuickTemplateSuggestions issue={issue} onSelectTemplate={handleTemplateSelect} />
            )}
            <ActionTemplatePicker onSelectTemplate={handleTemplateSelect} />
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Action Title
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="px-3 py-2 border rounded-md"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the action in detail..."
                  rows={3}
                  className="px-3 py-2 border rounded-md resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Assigned to</label>
                <select
                  value={
                    assignedTo === 'both'
                      ? 'both'
                      : assignedTo === 'partner1'
                        ? 'partner1'
                        : 'partner2'
                  }
                  onChange={(e) => {
                    const value = e.target.value as Action['assignedTo'];
                    setAssignedTo(value);
                    if (value === 'partner1') {
                      setAssignedToId(currentPartner.id);
                    } else if (value === 'partner2') {
                      setAssignedToId(otherPartner.id);
                    } else {
                      setAssignedToId('');
                    }
                  }}
                  className="px-3 py-2 border rounded-md"
                  aria-label="Assigned to"
                >
                  <option value="both">Both Partners</option>
                  <option value="partner1">{currentPartner.name}</option>
                  <option value="partner2">{otherPartner.name}</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="dueDate" className="text-sm font-medium">
                  Due Date (optional)
                </label>
                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                {action ? 'Update Action' : 'Create Action'}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
