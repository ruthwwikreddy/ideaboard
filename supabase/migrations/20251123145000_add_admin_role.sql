-- Add is_admin column to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Set your email as admin (Note: corrected email spelling)
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'akkenapally.reddy@gmail.com';

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE email = user_email AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
