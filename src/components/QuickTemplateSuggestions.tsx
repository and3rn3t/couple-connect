import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ArrowRight } from '@phosphor-icons/react'
import { ActionTemplate, getTemplatesByCategory } from '@/data/actionTemplates'
import { Issue } from '@/App'

interface QuickTemplateSuggestionsProps {
  issue: Issue
  onSelectTemplate: (template: ActionTemplate) => void
}

export default function QuickTemplateSuggestions({ issue, onSelectTemplate }: QuickTemplateSuggestionsProps) {
  const relevantTemplates = getTemplatesByCategory(issue.category).slice(0, 3)

  if (relevantTemplates.length === 0) return null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-primary">
          <Sparkles size={16} />
          Quick Start Templates
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Proven action plans for {issue.category} issues
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {relevantTemplates.map(template => (
          <div 
            key={template.id}
            className="flex items-center justify-between p-2 rounded bg-background/50 hover:bg-background/80 transition-colors"
          >
            <div className="flex-1">
              <p className="text-sm font-medium">{template.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {template.difficulty}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {template.suggestedDuration} days
                </span>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onSelectTemplate(template)}
              className="shrink-0"
            >
              <ArrowRight size={14} />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}