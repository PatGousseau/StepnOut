-- track who a reply is directed at (while keeping a single thread level)

alter table public.comments
  add column if not exists reply_to_comment_id integer;

alter table public.comments
  add constraint comments_reply_to_comment_id_fkey
  foreign key (reply_to_comment_id)
  references public.comments(id)
  on delete set null;

create index if not exists comments_reply_to_comment_id_idx
  on public.comments(reply_to_comment_id);
