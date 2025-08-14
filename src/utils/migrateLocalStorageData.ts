import { db } from '../services/database';

// Simple migration utility to help users transition localStorage data to database
export async function migrateLocalStorageData() {
  try {
    console.warn('Starting localStorage to database migration...');

    // Check if there's existing data in localStorage
    const currentPartner = localStorage.getItem('current-partner');
    const otherPartner = localStorage.getItem('other-partner');
    const issues = localStorage.getItem('relationship-issues');
    const actions = localStorage.getItem('relationship-actions');

    if (!currentPartner || !otherPartner) {
      console.warn('No partner data found in localStorage');
      return { success: false, message: 'No partner data to migrate' };
    }

    const currentPartnerData = JSON.parse(currentPartner);
    const otherPartnerData = JSON.parse(otherPartner);

    // Create users in database
    const user1 = await db.createUser({
      name: currentPartnerData.name,
      email: currentPartnerData.email || `${currentPartnerData.name.toLowerCase()}@example.com`,
    });

    const user2 = await db.createUser({
      name: otherPartnerData.name,
      email: otherPartnerData.email || `${otherPartnerData.name.toLowerCase()}@example.com`,
    });

    // Create couple relationship
    const couple = await db.createCouple({
      user1_id: user1.id,
      user2_id: user2.id,
      relationship_name: `${user1.name} & ${user2.name}`,
      status: 'active',
    });

    // Store current user ID for session
    localStorage.setItem('current_user_id', user1.id);

    let issueCount = 0;
    let actionCount = 0;

    // Migrate issues if they exist
    if (issues) {
      const issuesData = JSON.parse(issues);
      for (const issue of issuesData) {
        const newIssue = await db.createIssue({
          couple_id: couple.id,
          title: issue.title,
          description: issue.description,
          priority: issue.priority === 'urgent' ? 'high' : issue.priority,
          status: 'identified',
          position_x: issue.position?.x || 0,
          position_y: issue.position?.y || 0,
          created_by: user1.id,
        });
        issueCount++;

        // Migrate related actions
        if (actions) {
          const actionsData = JSON.parse(actions);
          const relatedActions = actionsData.filter(
            (action: { issueId: string }) => action.issueId === issue.id
          );

          for (const action of relatedActions) {
            await db.createAction({
              couple_id: couple.id,
              issue_id: newIssue.id,
              title: action.title,
              description: action.description,
              assigned_to:
                action.assignedTo === 'partner1'
                  ? user1.id
                  : action.assignedTo === 'partner2'
                    ? user2.id
                    : 'both',
              status: action.status === 'in-progress' ? 'in_progress' : action.status,
              priority: 'medium',
              due_date: action.dueDate,
              notes: action.notes?.join('\n') || '',
              created_by: user1.id,
              completed_at: action.completedAt || null,
            });
            actionCount++;
          }
        }
      }
    }

    console.warn(`Migration completed: ${issueCount} issues, ${actionCount} actions migrated`);

    return {
      success: true,
      message: `Successfully migrated ${issueCount} issues and ${actionCount} actions`,
      users: [user1, user2],
      couple,
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Helper function to check if migration is needed
export function shouldMigrate(): boolean {
  const hasLocalStorageData =
    localStorage.getItem('current-partner') && localStorage.getItem('other-partner');
  const hasUserSession = localStorage.getItem('current_user_id');

  return !!hasLocalStorageData && !hasUserSession;
}
