-- add comment replies (threaded comments)

alter table public.comments
  add column if not exists parent_comment_id integer;

alter table public.comments
  add constraint comments_parent_comment_id_fkey
  foreign key (parent_comment_id)
  references public.comments(id)
  on delete cascade;

create index if not exists comments_post_id_parent_comment_id_idx
  on public.comments(post_id, parent_comment_id);

create index if not exists comments_parent_comment_id_idx
  on public.comments(parent_comment_id);
