# Quick Setup Guide - Admin & Test User

## What Was Added

1. **Admin User**: `akkenapally.reddy@gmail.com` - Unlimited usage
2. **Test User**: `test@example.com` (password: `ruthwikreddy`) - Normal user with limits

## How to Apply These Changes

### Step 1: Push Database Migrations

You need to apply the migrations to your Supabase database:

```bash
# Make sure you're logged into Supabase CLI
supabase login

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Push the migrations to your database
supabase db push
```

### Step 2: Deploy Updated Edge Function

```bash
# Deploy the updated analyze-idea function with admin check
supabase functions deploy analyze-idea
```

### Step 3: Verify Setup

**For Admin User (akkenapally.reddy@gmail.com)**:
1. Sign in to the app
2. Try generating multiple ideas (should have unlimited access)
3. No usage limit errors should appear

**For Test User (test@example.com)**:
1. Sign up or sign in with:
   - Email: `test@example.com`
   - Password: `ruthwikreddy`
2. Try generating ideas
3. Should see limits based on free plan (1/month)

## Alternative: Apply via Supabase Dashboard

If you prefer using the dashboard instead of CLI:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL from these migration files:
   - `supabase/migrations/20251123145000_add_admin_role.sql`
   - `supabase/migrations/20251123145100_create_test_user.sql`
4. Deploy the edge function via dashboard

## Test User Credentials

- **Email**: test@example.com
- **Password**: ruthwikreddy
- **Type**: Normal user (free plan limits apply)
- **Usage Limit**: 1 idea analysis per month

## Admin User

- **Email**: akkenapally.reddy@gmail.com
- **Type**: Admin
- **Usage Limit**: Unlimited ✨

---

**Note**: The test user account will be created automatically when you run the migrations. You can sign in immediately with the credentials above.
