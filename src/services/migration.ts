// Example migration utility to move from localStorage to database
// This demonstrates how to transition your existing localStorage data to the new database structure

import { db } from './database';
import type { User, Couple, Issue } from './types';

// Migration utility for your existing data
export async function migrateFromLocalStorage() {
  try {
    console.warn('Starting migration from localStorage to database...');

    // Step 1: Create users from partner data
    const currentPartner = JSON.parse(localStorage.getItem('current-partner') || 'null');
    const otherPartner = JSON.parse(localStorage.getItem('other-partner') || 'null');

    if (!currentPartner || !otherPartner) {
      console.warn('No partner data found to migrate');
      return;
    }

    // Create users
    const user1: User = await db.createUser({
      name: currentPartner.name,
      email: currentPartner.email || `${currentPartner.name.toLowerCase()}@example.com`,
      avatar_url: currentPartner.avatar,
    });

    const user2: User = await db.createUser({
      name: otherPartner.name,
      email: otherPartner.email || `${otherPartner.name.toLowerCase()}@example.com`,
      avatar_url: otherPartner.avatar,
    });

    // Create couple relationship
    const couple: Couple = await db.createCouple({
      user1_id: user1.id,
      user2_id: user2.id,
      relationship_name: `${user1.name} & ${user2.name}`,
      status: 'active',
    });

    // Step 2: Migrate issues
    const existingIssues = JSON.parse(localStorage.getItem('relationship-issues') || '[]');
    const issueIdMap = new Map<string, string>(); // old ID -> new ID

    for (const oldIssue of existingIssues) {
      const newIssue: Issue = await db.createIssue({
        couple_id: couple.id,
        title: oldIssue.title,
        description: oldIssue.description,
        category_id: oldIssue.category,
        priority: oldIssue.priority,
        status: 'identified',
        position_x: oldIssue.position?.x || 0,
        position_y: oldIssue.position?.y || 0,
        created_by: user1.id, // Assume current partner created it
      });

      issueIdMap.set(oldIssue.id, newIssue.id);
    }

    // Step 3: Migrate actions
    const existingActions = JSON.parse(localStorage.getItem('relationship-actions') || '[]');

    for (const oldAction of existingActions) {
      // Map old assigned_to values to new format
      let assignedTo = 'both';
      if (oldAction.assignedTo === 'partner1') assignedTo = user1.id;
      if (oldAction.assignedTo === 'partner2') assignedTo = user2.id;

      const newIssueId = issueIdMap.get(oldAction.issueId);

      await db.createAction({
        couple_id: couple.id,
        issue_id: newIssueId, // Might be undefined if issue not found
        title: oldAction.title,
        description: oldAction.description,
        assigned_to: assignedTo,
        status: oldAction.status,
        priority: 'medium', // Default priority
        due_date: oldAction.dueDate,
        started_at: oldAction.status !== 'pending' ? oldAction.createdAt : undefined,
        completed_at: oldAction.completedAt,
        notes: oldAction.notes?.join('\n') || '',
        created_by: oldAction.createdBy === currentPartner.id ? user1.id : user2.id,
      });
    }

    // Step 4: Set current user in localStorage for the new system
    localStorage.setItem('current_user_id', user1.id);

    // Step 5: Backup old data before cleaning up
    const backup = {
      currentPartner,
      otherPartner,
      issues: existingIssues,
      actions: existingActions,
      healthScore: JSON.parse(localStorage.getItem('relationship-health') || '{}'),
      migrationDate: new Date().toISOString(),
    };

    localStorage.setItem('migration_backup', JSON.stringify(backup));

    console.warn('Migration completed successfully!');
    console.warn('Old data backed up to localStorage key: migration_backup');
    console.warn(`Created users: ${user1.name} (${user1.id}), ${user2.name} (${user2.id})`);
    console.warn(`Created couple: ${couple.id}`);
    console.warn(`Migrated ${existingIssues.length} issues and ${existingActions.length} actions`);

    return {
      user1,
      user2,
      couple,
      migratedIssues: existingIssues.length,
      migratedActions: existingActions.length,
    };
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Utility to restore from backup if needed
export function restoreFromBackup() {
  const backup = localStorage.getItem('migration_backup');
  if (!backup) {
    console.warn('No backup found');
    return;
  }

  const data = JSON.parse(backup);

  // Restore original localStorage data
  localStorage.setItem('current-partner', JSON.stringify(data.currentPartner));
  localStorage.setItem('other-partner', JSON.stringify(data.otherPartner));
  localStorage.setItem('relationship-issues', JSON.stringify(data.issues));
  localStorage.setItem('relationship-actions', JSON.stringify(data.actions));
  localStorage.setItem('relationship-health', JSON.stringify(data.healthScore));

  console.warn('Restored from backup created at:', data.migrationDate);
}

// Example usage:
//
// To migrate existing data:
// import { migrateFromLocalStorage } from '@/services/migration';
// const result = await migrateFromLocalStorage();
//
// To restore if something goes wrong:
// import { restoreFromBackup } from '@/services/migration';
// restoreFromBackup();
