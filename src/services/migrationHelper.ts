// Working Migration Utility for Couple Connect
// This utility helps you migrate from localStorage to database (or between database systems)

import { db } from './database';
import { clearDatabase, exportDatabase } from './initializeData';

// Interface for the old data format (from localStorage)
interface OldPartner {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

interface OldIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  position: { x: number; y: number };
  connections: string[];
}

interface OldAction {
  id: string;
  issueId: string;
  title: string;
  description: string;
  assignedTo: 'partner1' | 'partner2' | 'both';
  assignedToId?: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  createdBy: string;
  completedAt?: string;
  completedBy?: string;
  notes: string[];
}

// Migration state tracking
interface MigrationResult {
  success: boolean;
  usersCreated: number;
  couplesCreated: number;
  issuesMigrated: number;
  actionsMigrated: number;
  errors: string[];
  backupKey: string;
}

// Create backup of current data
export function createBackup(): string {
  const backupKey = `migration_backup_${Date.now()}`;
  const backup = {
    timestamp: new Date().toISOString(),
    data: exportDatabase(),
    oldLocalStorageData: {
      currentPartner: localStorage.getItem('current-partner'),
      otherPartner: localStorage.getItem('other-partner'),
      issues: localStorage.getItem('relationship-issues'),
      actions: localStorage.getItem('relationship-actions'),
      health: localStorage.getItem('relationship-health'),
    },
  };

  localStorage.setItem(backupKey, JSON.stringify(backup));
  return backupKey;
}

// Restore from backup
export function restoreFromBackup(backupKey: string): boolean {
  try {
    const backup = localStorage.getItem(backupKey);
    if (!backup) {
      console.error('Backup not found:', backupKey);
      return false;
    }

    const { oldLocalStorageData } = JSON.parse(backup);

    // Clear current database
    clearDatabase();

    // Restore old localStorage format
    Object.entries(oldLocalStorageData).forEach(([key, value]) => {
      if (value) {
        const storageKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        localStorage.setItem(storageKey, value as string);
      }
    });

    console.warn('Successfully restored from backup');
    return true;
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    return false;
  }
}

// Main migration function
export async function migrateFromOldFormat(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    usersCreated: 0,
    couplesCreated: 0,
    issuesMigrated: 0,
    actionsMigrated: 0,
    errors: [],
    backupKey: '',
  };

  try {
    // Create backup first
    result.backupKey = createBackup();
    console.warn('Created backup with key:', result.backupKey);

    // Get old data
    const currentPartnerData = localStorage.getItem('current-partner');
    const otherPartnerData = localStorage.getItem('other-partner');
    const issuesData = localStorage.getItem('relationship-issues');
    const actionsData = localStorage.getItem('relationship-actions');

    if (!currentPartnerData || !otherPartnerData) {
      result.errors.push('No partner data found to migrate');
      return result;
    }

    const currentPartner: OldPartner = JSON.parse(currentPartnerData);
    const otherPartner: OldPartner = JSON.parse(otherPartnerData);
    const issues: OldIssue[] = issuesData ? JSON.parse(issuesData) : [];
    const actions: OldAction[] = actionsData ? JSON.parse(actionsData) : [];

    // Step 1: Create users
    console.warn('Creating users...');

    const user1 = await db.createUser({
      name: currentPartner.name,
      email:
        currentPartner.email ||
        `${currentPartner.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      avatar_url: currentPartner.avatar,
    });
    result.usersCreated++;

    const user2 = await db.createUser({
      name: otherPartner.name,
      email:
        otherPartner.email || `${otherPartner.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      avatar_url: otherPartner.avatar,
    });
    result.usersCreated++;

    // Step 2: Create couple
    console.warn('Creating couple relationship...');

    const couple = await db.createCouple({
      user1_id: user1.id,
      user2_id: user2.id,
      relationship_name: `${user1.name} & ${user2.name}`,
      status: 'active',
    });
    result.couplesCreated++;

    // Step 3: Migrate issues
    console.warn('Migrating issues...');

    const issueIdMap = new Map<string, string>();

    for (const oldIssue of issues) {
      try {
        const newIssue = await db.createIssue({
          couple_id: couple.id,
          title: oldIssue.title,
          description: oldIssue.description,
          category_id: oldIssue.category,
          priority: oldIssue.priority,
          status: 'identified',
          position_x: oldIssue.position?.x || 0,
          position_y: oldIssue.position?.y || 0,
          created_by: user1.id,
        });

        issueIdMap.set(oldIssue.id, newIssue.id);
        result.issuesMigrated++;
      } catch (error) {
        result.errors.push(`Failed to migrate issue "${oldIssue.title}": ${error}`);
      }
    }

    // Step 4: Migrate actions
    console.warn('Migrating actions...');

    for (const oldAction of actions) {
      try {
        // Map assignment
        let assignedTo = 'both';
        if (oldAction.assignedTo === 'partner1') assignedTo = user1.id;
        if (oldAction.assignedTo === 'partner2') assignedTo = user2.id;

        const newIssueId = issueIdMap.get(oldAction.issueId);

        await db.createAction({
          couple_id: couple.id,
          issue_id: newIssueId,
          title: oldAction.title,
          description: oldAction.description,
          assigned_to: assignedTo,
          status:
            oldAction.status === 'in-progress'
              ? 'in_progress'
              : (oldAction.status as 'pending' | 'completed'),
          priority: 'medium',
          due_date: oldAction.dueDate,
          completed_at: oldAction.completedAt,
          notes: oldAction.notes?.join('\n') || '',
          created_by: oldAction.createdBy === currentPartner.id ? user1.id : user2.id,
        });

        result.actionsMigrated++;
      } catch (error) {
        result.errors.push(`Failed to migrate action "${oldAction.title}": ${error}`);
      }
    }

    // Step 5: Set current user for new system
    localStorage.setItem('current_user_id', user1.id);

    result.success = true;
    console.warn('Migration completed successfully!');
    console.warn(`Created ${result.usersCreated} users, ${result.couplesCreated} couples`);
    console.warn(`Migrated ${result.issuesMigrated} issues, ${result.actionsMigrated} actions`);

    if (result.errors.length > 0) {
      console.warn('Migration completed with some errors:', result.errors);
    }
  } catch (error) {
    result.errors.push(`Migration failed: ${error}`);
    console.error('Migration failed:', error);
  }

  return result;
}

// Utility to check if migration is needed
export function checkMigrationNeeded(): boolean {
  const hasOldData = !!(
    localStorage.getItem('current-partner') ||
    localStorage.getItem('other-partner') ||
    localStorage.getItem('relationship-issues') ||
    localStorage.getItem('relationship-actions')
  );

  const hasNewData = !!(
    localStorage.getItem('current_user_id') ||
    Object.keys(localStorage).some((key) => key.startsWith('cc_'))
  );

  return hasOldData && !hasNewData;
}

// Get migration status
export function getMigrationStatus() {
  const backupKeys = Object.keys(localStorage)
    .filter((key) => key.startsWith('migration_backup_'))
    .map((key) => ({
      key,
      timestamp: new Date(parseInt(key.split('_')[2])).toLocaleString(),
    }));

  return {
    migrationNeeded: checkMigrationNeeded(),
    hasOldData: !!localStorage.getItem('current-partner'),
    hasNewData: !!localStorage.getItem('current_user_id'),
    backups: backupKeys,
  };
}

// Clean up old data after successful migration
export function cleanupOldData(): void {
  const oldKeys = [
    'current-partner',
    'other-partner',
    'relationship-issues',
    'relationship-actions',
    'relationship-health',
  ];

  oldKeys.forEach((key) => localStorage.removeItem(key));
  console.warn('Cleaned up old localStorage data');
}

// Example usage:
/*
// Check if migration is needed
const status = getMigrationStatus();
console.log('Migration status:', status);

// Run migration if needed
if (status.migrationNeeded) {
  const result = await migrateFromOldFormat();
  console.log('Migration result:', result);

  if (result.success) {
    // Optionally clean up old data
    cleanupOldData();
  } else {
    // Restore from backup if migration failed
    restoreFromBackup(result.backupKey);
  }
}
*/
