-- add media_id to comments to support voice memos (and other media)

alter table public.comments
  add column if not exists media_id bigint;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'comments_media_id_fkey'
  ) then
    alter table public.comments
      add constraint comments_media_id_fkey
      foreign key (media_id) references public.media(id) on delete set null;
  end if;
end $$;
