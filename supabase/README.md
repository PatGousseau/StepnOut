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
# Local (iOS Simulator)
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321

# Local (Android Emulator) - use 10.0.2.2 instead of localhost
EXPO_PUBLIC_SUPABASE_URL=http://10.0.2.2:54321

# Production
EXPO_PUBLIC_SUPABASE_URL=https://kiplxlahalqyahstmmjg.supabase.co
```

Restart Expo after switching.

## Migrations

### Option 1: Write SQL manually
```bash
npm run db:new -- my_feature_name
# Edit the created file in supabase/migrations/
```

### Option 2: Use the UI, then generate migration
```bash
# 1. Make changes in local Studio (http://127.0.0.1:54323)
#    Add tables, columns, RLS policies, etc.

# 2. Generate migration from your changes
npm run db:diff -- my_feature_name
```

### Running migrations
```bash
npm run db:up           # Run pending migrations locally (keeps data)
npm run db:reset        # Reset local DB + migrations + seed (loses data)
npm run db:push         # Push migrations to production (careful!)
```

## Common Commands

```bash
npm run db:start   # Start local Supabase
npm run db:stop    # Stop local Supabase
npm run db:reset   # Reset DB + migrations + seed
npm run db:up      # Run pending migrations
npm run db:new -- name   # Create new migration
npm run db:diff -- name  # Generate migration from UI changes
npm run db:push    # Push to production
supabase status    # Show services and credentials
```
