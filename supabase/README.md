# Local Supabase Development

## Prerequisites
- Docker (must be running)
- Supabase CLI: `brew install supabase/tap/supabase`

## Setup

```bash
# 1. Start local Supabase
npm run db:start

# 2. Reset DB (runs migrations + seed data + uploads images)
npm run db:reset

# 3. Copy env file and use local credentials
cp .env.example .env
# Uncomment the LOCAL lines, comment out PRODUCTION lines

# 4. Start the app
npm start
```

## Test Accounts

After running seed, these accounts are available (password: `password123`):

| Email | Username | Role |
|-------|----------|------|
| alice@test.com | alice | User |
| bob@test.com | bob | User |
| charlie@test.com | charlie | User |
| admin@test.com | admin | Admin |

Local dashboard: http://127.0.0.1:54323

## Switch Between Local/Production

Edit `.env`:
```bash
# Local
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321

# Production
EXPO_PUBLIC_SUPABASE_URL=https://kiplxlahalqyahstmmjg.supabase.co
```

Restart Expo after switching.

## Migrations

### Option 1: Write SQL manually
```bash
supabase migration new my_feature_name
# Edit the created file in supabase/migrations/
```

### Option 2: Use the UI, then generate migration
```bash
# 1. Make changes in local Studio (http://127.0.0.1:54323)
#    Add tables, columns, RLS policies, etc.

# 2. Generate migration from your changes
supabase db diff -f my_feature_name
```

### Running migrations
```bash
supabase migration up   # Run pending migrations (keeps data)
supabase db reset       # Reset DB and run all migrations (loses data)
supabase db push        # Push migrations to production
```

## Common Commands

```bash
supabase start     # Start local Supabase
supabase stop      # Stop local Supabase
supabase status    # Show services and credentials
supabase db diff   # Show schema differences
```
