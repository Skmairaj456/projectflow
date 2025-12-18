# Database Migration Instructions

## The Problem
- Connection pooler works for queries but NOT for migrations (DDL operations)
- Direct connection fails due to DNS/IPv6 issues
- Prisma migrations hang when using the pooler

## Solution: Manual SQL Migration

We'll run the SQL migration directly in Supabase SQL Editor, which bypasses both issues.

## Steps:

### 1. Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run the Migration SQL
1. Open the file: `prisma/manual-migration.sql`
2. Copy ALL the SQL code from that file
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### 3. Verify Tables Created
After running the SQL, verify the tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all these tables:
- User
- Account
- Session
- VerificationToken
- Workspace
- WorkspaceMember
- Project
- Column
- Task
- TaskAttachment
- Comment
- Activity
- Label
- TaskLabel

### 4. Mark Migration as Complete (Optional)
After successful migration, you can create a migration record:
```sql
CREATE TABLE "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP,
    "started_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
VALUES (
    gen_random_uuid()::text,
    'manual_migration',
    CURRENT_TIMESTAMP,
    '20241202000000_init',
    CURRENT_TIMESTAMP,
    1
);
```

### 5. Test the Connection
After migration, test that everything works:
```bash
node test-connection.js
```

### 6. Start the Development Server
```bash
npm run dev
```

## What This Does

The SQL migration creates:
- ✅ All database tables
- ✅ All indexes for performance
- ✅ All foreign key relationships
- ✅ All enums (WorkspaceRole, TaskStatus, etc.)

## Notes

- The pooler connection will work fine for normal app operations
- Only migrations need to be run manually through SQL Editor
- Future schema changes can also be done this way, or you can fix the DNS issue for direct connections

