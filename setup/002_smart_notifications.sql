-- ============================================================
-- 002_smart_notifications.sql
-- Adds scheduled_reminders + push_subscriptions tables
-- and a pg_cron job that fires the send-reminders edge function
-- ============================================================

-- 1. Push subscriptions — one per device per user
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  endpoint    text not null,                      -- Web Push endpoint URL
  p256dh      text not null,                      -- client public key
  auth        text not null,                      -- client auth secret
  user_agent  text,                               -- for debugging
  timezone    text default 'Australia/Sydney',     -- patient local tz for reminder times
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(user_id, endpoint)                        -- one subscription per endpoint per user
);

alter table public.push_subscriptions enable row level security;

create policy "Users manage own push subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Scheduled reminders — the core notification queue
create table if not exists public.scheduled_reminders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  visit_id      uuid references public.visits(id) on delete set null,
  source_type   text not null check (source_type in ('action_item', 'medication')),
  source_id     uuid,                              -- FK to action_items or medications
  title         text not null,                     -- notification title
  body          text not null,                     -- notification body
  remind_at     timestamptz not null,              -- exact fire time (UTC)
  recurrence    jsonb,                             -- { "type": "daily", "times": ["08:00","22:00"], "until": "2026-06-01" }
  status        text not null default 'pending'
                check (status in ('pending', 'sent', 'dismissed', 'completed', 'skipped')),
  sent_at       timestamptz,
  created_at    timestamptz default now()
);

create index idx_reminders_pending on public.scheduled_reminders (remind_at)
  where status = 'pending';

create index idx_reminders_user on public.scheduled_reminders (user_id, status);

create index idx_reminders_source on public.scheduled_reminders (source_type, source_id);

alter table public.scheduled_reminders enable row level security;

-- Patients can read & dismiss their own reminders
create policy "Users read own reminders"
  on public.scheduled_reminders for select
  using (auth.uid() = user_id);

create policy "Users update own reminders"
  on public.scheduled_reminders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role inserts (edge functions create reminders)
-- No insert policy for anon — only service_role can insert.

-- 3. Add notification_preferences to profiles (optional patient settings)
alter table public.profiles
  add column if not exists notification_preferences jsonb default '{
    "push_enabled": true,
    "email_enabled": true,
    "medication_reminders": true,
    "appointment_reminders": true,
    "quiet_hours_start": "22:00",
    "quiet_hours_end": "07:00"
  }'::jsonb;

-- 4. Function to auto-skip reminders when action items are completed
create or replace function public.auto_skip_reminders()
returns trigger as $$
begin
  if NEW.status = 'complete' and (OLD.status is null or OLD.status <> 'complete') then
    update public.scheduled_reminders
    set status = 'skipped'
    where source_type = 'action_item'
      and source_id = NEW.id
      and status = 'pending';
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_auto_skip_reminders on public.action_items;
create trigger trg_auto_skip_reminders
  after update on public.action_items
  for each row execute function public.auto_skip_reminders();

-- 5. Function to auto-skip medication reminders when medication is stopped
create or replace function public.auto_skip_med_reminders()
returns trigger as $$
begin
  if NEW.status in ('stopped', 'completed') and (OLD.status is null or OLD.status not in ('stopped', 'completed')) then
    update public.scheduled_reminders
    set status = 'skipped'
    where source_type = 'medication'
      and source_id = NEW.id
      and status = 'pending';
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_auto_skip_med_reminders on public.medications;
create trigger trg_auto_skip_med_reminders
  after update on public.medications
  for each row execute function public.auto_skip_med_reminders();

-- 6. pg_cron job to fire the send-reminders edge function every 5 minutes
-- NOTE: Requires the pg_cron extension to be enabled in Supabase dashboard:
--   Database → Extensions → pg_cron → Enable
-- Uncomment below after enabling pg_cron:
--
-- select cron.schedule(
--   'send-reminders-cron',
--   '*/5 * * * *',
--   $$
--   select net.http_post(
--     url := current_setting('app.settings.supabase_url') || '/functions/v1/send-reminders',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );
