-- Create test user account
-- Email: test@example.com
-- Password: ruthwikreddy
-- Type: Normal user (not admin)

-- Note: This requires the auth.users table and password hashing
-- Run this with service role key or via dashboard

-- Insert test user into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('ruthwikreddy', gen_salt('bf')), -- Password: ruthwikreddy
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'test@example.com'
);

-- The profile will be created automatically via the handle_new_user trigger
-- But let's ensure it exists with correct settings
INSERT INTO public.profiles (id, email, full_name, generation_count, is_admin, last_generation_reset)
SELECT 
  id,
  'test@example.com',
  'Test User',
  0,
  FALSE, -- Normal user, not admin
  NOW()
FROM auth.users
WHERE email = 'test@example.com'
ON CONFLICT (id) DO UPDATE
SET 
  is_admin = FALSE, -- Ensure it's not admin
  generation_count = 0,
  last_generation_reset = NOW();
