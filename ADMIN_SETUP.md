# Admin User Setup Guide

## Overview
This guide explains how the admin system works in IdeaBoard and how to manage unlimited usage for admin users.

## Admin Features

Admin users have the following privileges:
- ✅ **Unlimited idea analysis** - No monthly generation limits
- ✅ **Bypass all usage restrictions** - Unlimited access to all features
- ✅ **Same quality as premium users** - Get advanced AI analysis without limits

## Current Admin User

**Email**: `akkenapally.reddy@gmail.com`  
**Status**: Admin with unlimited usage

## How It Works

### 1. Database Schema
The `profiles` table includes an `is_admin` column (boolean):
- `is_admin = TRUE` → Unlimited usage
- `is_admin = FALSE` (default) → Normal usage limits apply

### 2. Usage Limit Enforcement
In the `analyze-idea` Edge Function, the system:
1. Checks if the user is an admin (`profile.is_admin`)
2. If admin: **Skips** all usage limit checks
3. If not admin: Enforces monthly limits based on subscription plan:
   - Free: 1 generation/month
   - Basic: 5 generations/month
   - Premium: 10 generations/month

### 3. Code Implementation
```typescript
const isAdmin = profile.is_admin || false;

// Skip limit check for admin users
if (!isAdmin && generation_count >= limit) {
  return new Response(
    JSON.stringify({ error: `Limit reached...` }),
    { status: 403, ... }
  );
}
```

## How to Add More Admin Users

### Method 1: SQL Migration (Recommended)
Create a new migration file in `supabase/migrations/`:

```sql
-- Add another admin user
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'newemail@example.com';
```

Then run: `supabase db push`

### Method 2: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **profiles**
3. Find the user by email
4. Set `is_admin` column to `TRUE`
5. Save changes

### Method 3: SQL Editor in Dashboard
1. Go to **SQL Editor** in Supabase Dashboard
2. Run this query:
```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'youremail@example.com';
```

## Applying the Changes

### Step 1: Run the Migration
```bash
# Make sure you're in the project directory
cd /Users/ruthwikreddy/ideaboard-3

# Push the migration to Supabase
supabase db push
```

### Step 2: Deploy Edge Function
```bash
# Deploy the updated analyze-idea function
supabase functions deploy analyze-idea
```

### Step 3: Verify Admin Status
1. Sign in with your admin email
2. Try generating multiple ideas
3. You should NOT see any limit errors

## Checking Admin Status

### Via Supabase Dashboard
```sql
SELECT email, is_admin, generation_count
FROM profiles
WHERE is_admin = TRUE;
```

### Via Application Code
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('email, is_admin')
  .eq('id', userId)
  .single();

console.log('Is Admin:', profile?.is_admin);
```

## Troubleshooting

### Issue: Still seeing usage limits as admin
**Solutions**:
1. Verify `is_admin` is set to `TRUE` in the database
2. Redeploy the Edge Function: `supabase functions deploy analyze-idea`
3. Clear browser cache and sign out/in again
4. Check the Edge Function logs for errors

### Issue: Migration not applied
**Solutions**:
1. Run `supabase db push` to apply migrations
2. Check migration file syntax for errors
3. Verify database connection

## Files Modified

1. **Migration**: `/supabase/migrations/20251123145000_add_admin_role.sql`
   - Adds `is_admin` column to profiles table
   - Sets your email as admin

2. **Edge Function**: `/supabase/functions/analyze-idea/index.ts`
   - Added admin check logic
   - Bypasses limits for admin users

3. **TypeScript Types**: `/src/integrations/supabase/types.ts`
   - Added `is_admin` to profiles type definitions

## Security Notes

- ⚠️ Admin status is stored in the database, protected by Row Level Security (RLS)
- ⚠️ Only grant admin access to trusted users
- ⚠️ Admin users can consume significant API costs (OpenAI usage)
- ⚠️ Monitor admin usage through Supabase logs and OpenAI billing

## Next Steps

After setting up admin access:
1. Test unlimited idea generation
2. Monitor OpenAI API costs
3. Consider adding more granular permissions if needed
4. Set up usage monitoring/alerts for admin accounts

---

**Last Updated**: November 23, 2025  
**Admin Email**: akkenapally.reddy@gmail.com
