-- Add foreign key from post.user_id to profiles.id
-- This enables joining profiles directly in post queries

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'post_user_id_profiles_fkey'
    ) THEN
        ALTER TABLE public.post
        ADD CONSTRAINT post_user_id_profiles_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id)
        ON DELETE CASCADE;
    END IF;
END $$;
