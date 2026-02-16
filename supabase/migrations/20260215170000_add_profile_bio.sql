-- add bio field to profiles

alter table public.profiles
add column if not exists bio text;
