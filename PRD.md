# Couples Accountability App

A collaborative relationship tool that helps couples identify, track, and resolve relationship issues through visual mapping and mutual accountability.

**Experience Qualities**:
1. **Supportive** - Creates a safe space for honest communication and growth without judgment
2. **Collaborative** - Emphasizes shared responsibility and teamwork in relationship building
3. **Purposeful** - Focuses on actionable progress rather than dwelling on problems

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple interconnected features (issue mapping, task tracking, progress monitoring) with persistent state management, but focused on a specific relationship domain rather than complex user management.

## Essential Features

### Issue Identification & Mapping
- **Functionality**: Visual mindmap-style interface for identifying and categorizing relationship issues
- **Purpose**: Helps couples externalize problems and see connections between different concerns
- **Trigger**: Partner adds new issue or explores existing issue clusters
- **Progression**: Click "Add Issue" → Choose category → Write description → Place on visual map → Connect to related issues → Save
- **Success criteria**: Issues are visually organized, categorized, and show relationships to each other

### Action Planning
- **Functionality**: Convert issues into specific, actionable tasks with ownership and deadlines
- **Purpose**: Transforms abstract problems into concrete steps both partners can take
- **Trigger**: Select an issue from the mindmap and choose "Create Action Plan"
- **Progression**: Select issue → Define specific action → Assign ownership (individual/shared) → Set timeline → Add accountability check-ins → Commit
- **Success criteria**: Clear action items exist for each issue with defined responsibility and timelines

### Progress Tracking
- **Functionality**: Dashboard showing completion status, upcoming deadlines, and relationship health metrics
- **Purpose**: Maintains momentum and celebrates progress while identifying areas needing attention
- **Trigger**: Regular check-ins or when completing actions
- **Progression**: View dashboard → Review pending actions → Mark complete/add progress notes → Schedule next check-in → Update relationship health score
- **Success criteria**: Clear visibility into what's working, what needs attention, and overall relationship trajectory

### Mutual Accountability
- **Functionality**: Partner check-ins, gentle reminders, and shared commitment tracking
- **Purpose**: Ensures both partners stay engaged and supportive of each other's growth
- **Trigger**: Scheduled check-ins or when partner requests accountability support
- **Progression**: Receive reminder → Review partner's progress → Provide encouragement/feedback → Discuss challenges → Adjust plans if needed
- **Success criteria**: Regular engagement from both partners with supportive communication

## Edge Case Handling
- **No issues identified**: Guided prompts for common relationship areas to explore
- **One partner disengaged**: Gentle reminders and ways to re-engage without pressure
- **Overwhelming number of issues**: Priority ranking and focus recommendations
- **Actions repeatedly missed**: Conversation starters about barriers and plan adjustments
- **Disagreement on issue importance**: Separate perspectives view and compromise tools

## Design Direction
The design should feel warm, supportive, and relationship-focused - more like a shared journal than a corporate task manager, with soft colors and organic shapes that emphasize connection and growth rather than rigid productivity.

## Color Selection
Analogous (adjacent colors on color wheel) - Using warm, nurturing tones that promote feelings of safety, growth, and connection.

- **Primary Color**: Soft sage green (oklch(0.75 0.08 140)) - communicates growth, harmony, and new beginnings
- **Secondary Colors**: Warm cream (oklch(0.92 0.02 85)) for backgrounds and soft lavender (oklch(0.78 0.06 290)) for accents - supporting calm and thoughtful reflection
- **Accent Color**: Gentle coral (oklch(0.72 0.12 25)) for CTAs and important elements - warm encouragement without aggression
- **Foreground/Background Pairings**: 
  - Background (Warm Cream oklch(0.92 0.02 85)): Dark charcoal text (oklch(0.25 0.02 180)) - Ratio 12.1:1 ✓
  - Card (Pure White oklch(1 0 0)): Dark charcoal text (oklch(0.25 0.02 180)) - Ratio 16.2:1 ✓
  - Primary (Sage Green oklch(0.75 0.08 140)): White text (oklch(1 0 0)) - Ratio 5.8:1 ✓
  - Secondary (Soft Lavender oklch(0.78 0.06 290)): Dark charcoal text (oklch(0.25 0.02 180)) - Ratio 7.2:1 ✓
  - Accent (Gentle Coral oklch(0.72 0.12 25)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓

## Font Selection
Typography should feel approachable and human - clean enough for readability but with subtle warmth that reinforces the supportive, personal nature of relationship work.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Medium/32px/normal letter spacing
  - H2 (Section Headers): Inter Medium/24px/normal letter spacing  
  - H3 (Issue Titles): Inter Medium/18px/normal letter spacing
  - Body (Descriptions): Inter Regular/16px/relaxed line height
  - Small (Metadata): Inter Regular/14px/normal letter spacing

## Animations
Gentle, organic animations that reinforce connection and growth - movements should feel natural and supportive rather than mechanical or rushed.

- **Purposeful Meaning**: Smooth transitions emphasize the journey of relationship growth, with subtle hover states that encourage interaction and gentle confirmation animations that celebrate progress
- **Hierarchy of Movement**: Issue connections animate smoothly when exploring relationships, action completions have satisfying but understated celebrations, navigation feels fluid and connected

## Component Selection
- **Components**: Cards for issues and actions, Dialog for detailed editing, Tabs for different views (mindmap/dashboard/actions), Form components for input, Progress indicators for tracking, Badge for categories and status, Button variants for different action types
- **Customizations**: Custom mindmap visualization component, relationship connection lines, progress celebration micro-interactions
- **States**: Buttons show clear hover/active states with gentle color shifts, inputs have soft focus indicators, completed items get subtle checkmark animations
- **Icon Selection**: Heart for relationship health, Target for goals, CheckCircle for completed actions, Users for shared tasks, TrendingUp for progress
- **Spacing**: Generous padding (p-6/p-8) for breathing room, consistent gap-4/gap-6 for related elements, larger gap-8/gap-12 between major sections
- **Mobile**: Stack mindmap vertically, collapsible action panels, touch-friendly interaction zones, simplified navigation with bottom tabs