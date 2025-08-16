import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, User, MagicWand, MagnifyingGlass } from '@/components/ui/InlineIcons';
import { ActionTemplate, getTemplatesByCategory, searchTemplates } from '@/data/actionTemplates';

interface ActionTemplatePickerProps {
  onSelectTemplate: (template: ActionTemplate) => void;
  selectedCategory?:
    | 'communication'
    | 'intimacy'
    | 'finance'
    | 'time'
    | 'family'
    | 'personal-growth'
    | 'other';
}

export default function ActionTemplatePicker({
  onSelectTemplate,
  selectedCategory,
}: ActionTemplatePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'communication');

  const filteredTemplates = searchQuery
    ? searchTemplates(searchQuery)
    : getTemplatesByCategory(activeCategory);

  const categories = [
    { id: 'communication', label: 'Communication', icon: '💬' },
    { id: 'intimacy', label: 'Intimacy', icon: '💕' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'time', label: 'Time', icon: '⏰' },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { id: 'personal-growth', label: 'Growth', icon: '🌱' },
  ] as const;

  const getDifficultyColor = (difficulty: ActionTemplate['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getAssignmentIcon = (assignment: ActionTemplate['suggestedAssignment']) => {
    switch (assignment) {
      case 'both':
        return <Users size={14} />;
      case 'partner1':
      case 'partner2':
        return <User size={14} />;
    }
  };

  const TemplateCard = ({ template }: { template: ActionTemplate }) => (
    <Card
      key={template.id}
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group"
      onClick={() => onSelectTemplate(template)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base group-hover:text-primary transition-colors">
              {template.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {template.description}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Use This
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {getAssignmentIcon(template.suggestedAssignment)}
            <span>{template.suggestedAssignment === 'both' ? 'Both partners' : 'One partner'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{template.suggestedDuration} days</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
            {template.difficulty}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <MagicWand className="text-primary" size={24} />
        <div>
          <h3 className="font-medium">Choose from Templates</h3>
          <p className="text-sm text-muted-foreground">
            Start with proven action plans for common relationship challenges
          </p>
        </div>
      </div>

      <div className="relative">
        <MagnifyingGlass
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          size={16}
        />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {!searchQuery ? (
        <Tabs
          value={activeCategory}
          onValueChange={(value) =>
            setActiveCategory(
              value as
                | 'communication'
                | 'intimacy'
                | 'finance'
                | 'time'
                | 'family'
                | 'personal-growth'
            )
          }
        >
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-xs flex items-center gap-1"
              >
                <span className="hidden sm:inline">{category.icon}</span>
                <span>{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {getTemplatesByCategory(
                  category.id as
                    | 'communication'
                    | 'intimacy'
                    | 'finance'
                    | 'time'
                    | 'family'
                    | 'personal-growth'
                ).map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}

      {filteredTemplates.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No templates found for "{searchQuery}"</p>
          <Button variant="ghost" onClick={() => setSearchQuery('')} className="mt-2">
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}
