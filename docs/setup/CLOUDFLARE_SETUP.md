# 🚀 Complete Database Setup & Migration Guide

This guide walks you through setting up Cloudflare D1 for production and migrating your existing data.

## 📋 Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install globally
   ```bash
   npm install -g wrangler
   ```
3. **Authentication**: Login to Cloudflare
   ```bash
   wrangler login
   ```

## 🏗️ Database Setup Options

### Option 1: Automated Setup (Recommended)

```bash
# Create database, apply schema, and insert seed data
npm run db:setup
```

### Option 2: Step-by-Step Setup

```bash
# 1. Create the database
npm run db:create

# 2. Copy the database_id from output and update wrangler.toml:
# Replace "your-database-id-here" with the actual ID

# 3. Apply schema
npm run db:schema

# 4. Insert seed data
npm run db:seed
```

### Option 3: Local Development with D1

```bash
# Set up local D1 database for development
npm run db:dev
```

## 📝 Updating Configuration

After creating your database, update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "couple-connect-db"
database_id = "your-actual-database-id"  # Replace with ID from db:create
```

## 🔄 Data Migration

### 1. Backup Current Data (Recommended)

Before migrating, backup your localStorage data:

```javascript
// Run this in your browser console on your app:
const backup = {};
const keys = [
  'current-partner',
  'other-partner',
  'relationship-issues',
  'relationship-actions',
  'relationship-health',
];

keys.forEach((key) => {
  const data = localStorage.getItem(key);
  if (data) backup[key] = JSON.parse(data);
});

console.log('Backup Data:', JSON.stringify(backup, null, 2));
// Copy this output and save it somewhere safe
```

### 2. Run Migration

In your app (once D1 is set up):

```javascript
import { migrateFromLocalStorage } from './services/migration';

// Migrate your localStorage data to the database
const result = await migrateFromLocalStorage();
console.log('Migration result:', result);
```

### 3. Verify Migration

Check that your data was migrated correctly:

```javascript
import { useIssues, useActions, useCurrentCouple } from './hooks/useDatabase';

// In a React component:
const { issues } = useIssues();
const { actions } = useActions();
const { couple } = useCurrentCouple();

console.log('Migrated issues:', issues);
console.log('Migrated actions:', actions);
console.log('Couple:', couple);
```

### 4. Rollback (If Needed)

If something goes wrong, restore from backup:

```javascript
import { restoreFromBackup } from './services/migration';
restoreFromBackup();
```

## 🚀 Production Deployment

### 1. Deploy to Cloudflare Pages

```bash
npm run deploy
```

### 2. Verify Database Connection

After deployment, your app will automatically use D1 in production and localStorage in development.

## 🧪 Testing Your Setup

### Local Testing

```bash
npm run dev
# App runs with localStorage database
```

### Production Testing

```bash
npm run preview
# Test your built app locally
```

### Database Commands

```bash
# List your databases
wrangler d1 list

# Execute custom SQL
wrangler d1 execute couple-connect-db --command="SELECT COUNT(*) FROM issues"

# Browse your data
wrangler d1 execute couple-connect-db --command="SELECT * FROM issues LIMIT 5"
```

## 📊 Database Schema Overview

Your database includes these tables:

- **`users`** - Individual user profiles
- **`couples`** - Relationship connections
- **`issues`** - Relationship problems/concerns
- **`actions`** - Tasks to address issues
- **`action_templates`** - Expert-backed strategies
- **`issue_categories`** - Organization categories
- **`achievements`** - Gamification rewards
- **`gamification_stats`** - Points, streaks, progress
- **`activity_log`** - Complete audit trail

## 🔧 Troubleshooting

### Database Creation Issues

```bash
# Check if you're authenticated
wrangler whoami

# Re-authenticate if needed
wrangler login

# Check your account limits
wrangler d1 list
```

### Migration Issues

- **No partner data**: Make sure you have set up partners in your app first
- **Permission errors**: Ensure you're authenticated with Cloudflare
- **Data conflicts**: The migration handles duplicate data automatically

### Schema Issues

```bash
# If schema fails, try dropping and recreating
wrangler d1 execute couple-connect-db --command="DROP TABLE IF EXISTS users"
npm run db:schema
```

## 🎯 What's Next?

1. **✅ Database Setup Complete**
   - Your D1 database is ready
   - Schema and seed data applied
   - wrangler.toml configured

2. **🔄 Migration Ready**
   - Backup your current data
   - Run migration when ready
   - Verify all data transferred

3. **🚀 Production Ready**
   - Deploy with `npm run deploy`
   - Monitor with Cloudflare dashboard
   - Scale automatically with D1

## 📞 Support

- **Cloudflare D1 Docs**: https://developers.cloudflare.com/d1/
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Database Schema**: See `database/schema.sql`
- **Migration Code**: See `src/services/migration.ts`

Your Couple Connect app now has enterprise-grade database persistence! 🎉
