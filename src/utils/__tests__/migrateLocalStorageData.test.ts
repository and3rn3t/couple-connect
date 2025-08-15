import { describe, it, expect, vi, beforeEach } from 'vitest';
import { migrateLocalStorageData, shouldMigrate } from '../migrateLocalStorageData';
import { mockDb, resetMocks } from '../../test/mocks';

// Mock the database module
vi.mock('../../services/database', () => ({
  db: mockDb,
}));

describe('migrateLocalStorageData', () => {
  beforeEach(() => {
    resetMocks();
    localStorage.clear();
  });

  it('should return false when no partner data exists', async () => {
    const result = await migrateLocalStorageData();

    expect(result.success).toBe(false);
    expect(result.message).toBe('No partner data to migrate');
  });

  it('should migrate partner data successfully when localStorage has data', async () => {
    // Setup localStorage with test data
    localStorage.setItem(
      'current-partner',
      JSON.stringify({
        name: 'Alice',
        email: 'alice@example.com',
      })
    );

    localStorage.setItem(
      'other-partner',
      JSON.stringify({
        name: 'Bob',
        email: 'bob@example.com',
      })
    );

    // Mock successful database operations
    mockDb.createUser
      .mockResolvedValueOnce({
        id: 'user1',
        name: 'Alice',
        email: 'alice@example.com',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      })
      .mockResolvedValueOnce({
        id: 'user2',
        name: 'Bob',
        email: 'bob@example.com',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      });

    mockDb.createCouple.mockResolvedValueOnce({
      id: 'couple1',
      user1_id: 'user1',
      user2_id: 'user2',
      status: 'active',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    });

    const result = await migrateLocalStorageData();

    expect(result.success).toBe(true);
    expect(mockDb.createUser).toHaveBeenCalledTimes(2);
    expect(mockDb.createCouple).toHaveBeenCalledTimes(1);
  });

  it('should handle migration errors gracefully', async () => {
    localStorage.setItem(
      'current-partner',
      JSON.stringify({
        name: 'Alice',
        email: 'alice@example.com',
      })
    );

    localStorage.setItem(
      'other-partner',
      JSON.stringify({
        name: 'Bob',
        email: 'bob@example.com',
      })
    );

    // Mock database error
    mockDb.createUser.mockRejectedValueOnce(new Error('Database error'));

    const result = await migrateLocalStorageData();

    expect(result.success).toBe(false);
    expect(result.message).toContain('Database error');
  });
});

describe('shouldMigrate', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return true when localStorage has data but database is empty', () => {
    localStorage.setItem('current-partner', JSON.stringify({ name: 'Alice' }));
    localStorage.setItem('other-partner', JSON.stringify({ name: 'Bob' }));

    const result = shouldMigrate();
    expect(result).toBe(true);
  });

  it('should return false when localStorage is empty', () => {
    const result = shouldMigrate();
    expect(result).toBe(false);
  });

  it('should return false when migration has already been completed', () => {
    localStorage.setItem('migration-completed', 'true');

    const result = shouldMigrate();
    expect(result).toBe(false);
  });
});
