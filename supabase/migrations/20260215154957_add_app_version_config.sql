-- app version config (used to show update-available banner)

create table if not exists public.app_version_config (
  platform text primary key check (platform in ('ios', 'android')),
  latest_build integer not null,
  min_supported_build integer not null default 0,
  store_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_version_config enable row level security;

drop policy if exists "app_version_config_select_authenticated" on public.app_version_config;

create policy "app_version_config_select_authenticated"
  on public.app_version_config for select
  to authenticated
  using (true);

-- initial rows (update builds in production when you ship)
insert into public.app_version_config (platform, latest_build, min_supported_build, store_url)
values
  ('ios', 0, 0, 'https://apps.apple.com/ca/app/stepn-out/id6739888631'),
  ('android', 0, 0, 'https://play.google.com/store/apps/details?id=com.patrickgousseau.stepnout&hl=en_CA')
on conflict (platform) do nothing;
