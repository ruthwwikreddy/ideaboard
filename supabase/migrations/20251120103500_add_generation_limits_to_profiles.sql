ALTER TABLE public.profiles
ADD COLUMN generation_count INTEGER DEFAULT 0,
ADD COLUMN last_generation_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update handle_new_user function to initialize new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, generation_count, last_generation_reset)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    0,
    NOW()
  );
  RETURN NEW;
END;
$$;