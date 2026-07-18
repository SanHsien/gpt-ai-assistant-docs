---
title: Troubleshooting
---

# Troubleshooting

## The bot does not reply

- Confirm **Use webhook** is enabled and the URL ends in `/webhook`.
- Confirm LINE/OpenAI, Supabase durable runtime, and enabled-capability credentials are configured. Default-on search requires `SERPAPI_API_KEY`.
- Disable LINE Auto-reply and Greeting messages.
- Mention the bot in groups when mention gating is enabled.

## Webhook returns 403, 500, or 503

403 normally means the LINE signature does not match. Version 6.0 intentionally fails closed when runtime configuration, the database, `webhookEventId`, or migration `0018_durable_sources.sql` is unavailable. Run `npm run db:migrate`, `npm run db:preflight`, and redeploy.

## The same message is answered repeatedly

Version 6.0 atomically deduplicates both delivery and redelivery in Postgres. Confirm the deployment is `v6.0.0-rc.1` or later, migrations reach `0018`, disable LINE Auto-reply, and ensure only one deployment receives the webhook. Repeated events can consume paid API usage, so disable the affected capability while investigating.

## Quick replies or the rich menu look incomplete

Quick replies are feature-aware, capped at 13, and rendered by LINE as one horizontally scrollable row; old buttons disappear when a new message arrives. Send `Command` for the complete grouped text list and examples. A four-button maintenance template means the deployment predates `v6.0.0-rc.2`.

Rich menus appear only on iOS/Android LINE, not Windows/macOS. Check the Manager display period/default state and whether a Messaging API per-user/default rich menu overrides it. If tapping an item triggers two replies, remove the matching keyword Auto-reply from LINE Official Account Manager and leave only the text action sent to the webhook bot.

## `The model 'dall-e-3' does not exist`

Remove the stale model override or set:

```dotenv
OPENAI_IMAGE_GENERATION_MODEL=gpt-image-2
OPENAI_IMAGE_GENERATION_QUALITY=low
```

Redeploy after changing variables.

## Private Blob errors

`Cannot use public access on a private store` indicates an old deployment. v4.12.3 uploads privately and creates signed URLs.

For `No blob credentials found`, connect a Vercel Blob store first. If OIDC still fails, set `BLOB_READ_WRITE_TOKEN`.

## API errors

OpenAI 400 errors commonly mean an unavailable model, unsupported parameters, missing account access, or invalid image options. Remove custom model overrides and test the repository defaults first.

429 means a rate or quota limit. Check OpenAI API billing/project limits, LINE quotas, and SerpAPI usage. Do not add unlimited automatic retries.

## A Google Calendar connect command gets a normal chat answer

Deploy commit `cd50dad` or later. It routes compact Chinese input such as `連結Google行事曆` and common connect/bind/authorize variants directly to OAuth. Redeploy, then send the connect command again instead of using Continue on the earlier chat response.

## The bot says an event was created, but Google Calendar is empty

Since v4.13.1, the bot no longer reports a transitional local success; it says synced only after Google actually accepts the event. An unauthorized or older path stores the confirmed event in Supabase `events`; Vercel does not store event records. Check:

1. `ENABLE_SCHEDULE=true` and `ENABLE_GOOGLE_CALENDAR=true`, followed by a redeploy.
2. Supabase migration `0004_google_calendar.sql` is applied.
3. Calendar API is enabled and the authorized redirect URI exactly matches `GOOGLE_OAUTH_REDIRECT_URI`.
4. If the OAuth app is Testing, the authorizing account is a test user. For persistent access, publish it as In Production so refresh tokens do not expire after seven days. An unverified personal app requires continuing through the warning screen on first authorization.
5. The LINE authorization button completed without a Google error page.
6. `REMINDER_CRON_SECRET` matches Supabase Vault and `npm run db:configure-reminders` created the per-minute Cron, which also drives Calendar retries.

## What happens after final Google sync failure?

The default is three attempts. Internal backoff is 5 then 10 seconds, but without another webhook the per-minute Cron wakes retries, so all three usually complete in about two minutes. Intermediate failures stay silent. The final message offers:

- **Retry sync**: starts a fresh three-attempt cycle.
- **Not now**: keeps the Supabase event, stops prompting, and never deletes it automatically.
- **Delete event**: deletes only after this explicit action, including the Google event when a provider mapping exists.

Use `Failed syncs` later to list preserved records, then retry or delete one. Direct commands are `Retry sync <ID>`, `Not now <ID>`, and `Delete event <ID>`. Administrators can inspect `jobs.status='dead'` and `events.sync_status='error'`; do not clear the whole `events` table.

## Ambiguous time is not clarified, or Edit event fails

Confirm the deployment is v4.20.2 or newer and Supabase migration `0006_schedule_workflows.sql` is applied. v4.20.1 could schedule “tomorrow afternoon” as today at 15:00 across a UTC day boundary; v4.20.2 preserves the correct local tomorrow date and asks for the exact time. A clarification resumes from its structured draft only within the configured TTL. Editing lists only bot-managed events with a local Supabase mapping; Google-only events are not yet imported for editing.

## An event reached its time but no reminder arrived

Check that migration `0005_reminders_and_completion.sql` is applied, Vercel has `ENABLE_REMINDERS=true` plus a 32-character-or-longer `REMINDER_CRON_SECRET` and was redeployed, `npm run db:configure-reminders` succeeded, and Supabase Cron History shows `gpt-ai-assistant-reminders` every minute. The `jobs` table should contain `kind='line-reminder'`; a dead job's `last_error` identifies permanent LINE errors, quota, or target problems. Reminder delivery uses quota-counted LINE Push.

For quiet hours, pause, or resume, also apply `0009_reminder_prefs.sql`. Reminders due while paused are skipped and not backfilled; quiet hours defer delivery until the window ends.

## Tasks or weather report that the feature is disabled

Confirm the deployment is v5.13.0 and was redeployed. Tasks require `0007_tasks.sql`, `0008_task_metadata.sql`, and `ENABLE_TASKS=true`; weather requires `ENABLE_WEATHER=true`. `My tasks today` includes only today's due range; use the overdue filter for older tasks.

## Why does a task not appear in Google Calendar?

This is expected: assistant tasks never create Google Calendar events. Supabase is authoritative. To synchronize Google Tasks on 6.0, apply through migration `0018`, enable `ENABLE_GOOGLE_TASKS` and optionally `ENABLE_GOOGLE_TASKS_INBOUND`, then run "Connect Google Calendar" again to grant the Tasks scope. The callback backfills existing unsynced tasks. Google Tasks keeps only a due date; use an event for exact calendar times.

## Which week does a Chinese weekday phrase select?

A bare `星期五` or `週五` selects the next matching weekday. `本週`, `這週`, or `這個星期` stays in the current week, while `下週` or `下個星期` selects the next week. An explicit current-week date remains literal even when it has already passed; verify the date on the confirmation card before confirming.

Never post OAuth codes, client secrets, database URLs, or tokens in a public issue.

## Can a ChatGPT subscription replace the API key?

No. ChatGPT subscriptions and OpenAI API usage are billed separately.

## Reporting an issue

Open an issue at [SanHsien/gpt-ai-assistant](https://github.com/SanHsien/gpt-ai-assistant/issues) with the version, reproduction steps, sanitized error, and deployment environment. Never post API keys, LINE credentials, complete user IDs, or private conversations.
