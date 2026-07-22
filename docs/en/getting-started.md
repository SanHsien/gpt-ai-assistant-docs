---
title: Getting Started
---

# Getting Started

## Requirements

- GitHub and Vercel accounts.
- A LINE Developers Messaging API channel.
- An OpenAI Platform API key with API billing.
- SerpAPI for default-on search (or set `ENABLE_SEARCH=false`) and an optional Vercel Blob store for GPT Image.
- Required in 6.0: Supabase Postgres; Google Calendar/Tasks also need a Google Cloud project and OAuth client.

## Deploy to Vercel

1. Fork [SanHsien/gpt-ai-assistant](https://github.com/SanHsien/gpt-ai-assistant).
2. Import the fork into Vercel.
3. Add at least these environment variables:

```dotenv
APP_DEBUG=false
OPENAI_API_KEY=...
LINE_CHANNEL_ACCESS_TOKEN=...
LINE_CHANNEL_SECRET=...
```

4. Set the LINE webhook URL to your stable Vercel domain plus `/webhook`.
5. Enable **Use webhook** and disable LINE Auto-reply and Greeting messages.
6. Verify the webhook and test a text message.

`LINE_CHANNEL_SECRET` must not be empty. The service intentionally fails closed when it is missing.

## Optional LINE rich menu

Quick replies appear with bot messages as one horizontally scrollable row. For a persistent two-row launcher on mobile, create a large 3×2 rich menu manually in [LINE Official Account Manager](https://manager.line.biz/). This is optional channel configuration and needs no environment variable.

| Top left | Top center | Top right | Bottom left | Bottom center | Bottom right |
| --- | --- | --- | --- | --- | --- |
| Add event<br>`Schedule` | My events<br>`My events` | Weather<br>`Weather` | Add task<br>`Add task` | My tasks<br>`My tasks` | More<br>`Command` |

Use text actions for all six areas. Keep it collapsed by default for chat-first use or expanded for newcomer discovery. Do not configure matching keyword Auto-replies, which may reply alongside the webhook bot. Rich menus appear only on iOS/Android LINE, not Windows/macOS; a Messaging API per-user/default rich menu can also override the Manager default. See LINE's [quick-reply guide](https://developers.line.biz/en/docs/messaging-api/using-quick-reply/), [rich-menu overview](https://developers.line.biz/en/docs/messaging-api/rich-menus-overview/), and [rich-menu API reference](https://developers.line.biz/en/reference/messaging-api/#rich-menu).

## Enable image generation

The default `gpt-image-2` model returns base64 data:

1. Connect a **private Vercel Blob store** to the project.
2. Vercel normally injects `BLOB_STORE_ID` and uses OIDC.
3. If logs report `No blob credentials found`, add `BLOB_READ_WRITE_TOKEN` as a fallback.

The application uploads privately and gives LINE a temporary signed URL. Do not change the store to public.

## Configure the durable-only runtime and events

1. Create Supabase Postgres and use its serverless transaction-pooler URL.
2. Add `DATABASE_URL`, `DATABASE_SSL_CA`, and `DATA_ENCRYPTION_KEY` to Vercel Production as Sensitive variables.
3. Put those three values in the fork's untracked local `.env`, then run `npm ci` and `npm run db:migrate` from the repository root.
4. Run `npm run db:preflight`, then verify that `schema_migrations` ends at `0019_calendar_sync_query_version.sql`. The runner records SHA-256 checksums and safely skips matching migrations.
5. Enable `ENABLE_SCHEDULE=true`, `ENABLE_TASKS=true`, and `ENABLE_WEATHER=true` as needed, then **redeploy**. Version 6.0 always uses the durable queue and has no `APP_WEBHOOK_QUEUE` flag.

Migration `0010` adds weather subscriptions, `0011` Google Tasks outbound, `0012`/`0013` Calendar inbound, `0014`/`0016` Tasks inbound, `0015`/`0017` consolidate reminder indexes, `0018` moves bot-source activation to Postgres, and `0019` versions Calendar inbound for non-expanded series sync. Apply migrations before deploying 6.0.

Before enabling `ENABLE_GOOGLE_TASKS=true`, enable **Google Tasks API** in the same Google Cloud project that owns the Web OAuth client; granting the Tasks scope does not enable the API. Existing Calendar-only users must run "Connect Google Calendar" again to grant the scope. If sync previously failed because the API was disabled, enable it and reconnect; `rc.5` safely revives the same dead sync job without creating another task.

## Enable the per-minute worker and due reminders

1. Generate a random `REMINDER_CRON_SECRET` of at least 32 characters and store it as a Vercel Production Sensitive variable.
2. Temporarily set the same secret, database settings, and `REMINDER_CRON_URL=https://your-production-domain/cron/reminders` locally.
3. Run `npm run db:configure-reminders`. It stores the URL and secret in Supabase Vault and schedules a per-minute Cron call. The worker drains reminders, Google Calendar retries, and final status delivery.
4. Set `ENABLE_REMINDERS=true` and redeploy. Timed events remind at their start; all-day events remind at 09:00.
5. In Supabase Cron Jobs/History, verify that `gpt-ai-assistant-reminders` is active and successfully calls Production every minute.

Reminder delivery uses LINE Push and counts against the monthly quota. Never paste the secret into SQL, documentation, issues, or chat.

Reminder preferences include the localized commands for pause, resume, and quiet hours such as `22:00-07:00`. Reminders due while paused are skipped rather than backfilled; resuming affects future due reminders.

## Enable Google Calendar

1. In the Google Cloud project that owns the Web OAuth client, enable **Google Calendar API** and separately enable **Google Tasks API** when task synchronization is wanted. Verify both under Enabled APIs and services. Configure an External OAuth consent screen. Testing can use an allowlisted test user, but Calendar grants and refresh tokens expire after seven days. Publish a persistent deployment as **In Production**. A personal-use app with fewer than 100 users may remain unverified, with an unverified-app warning and a 100-new-user cap.
2. Create a **Web application** OAuth client. Set the authorized redirect URI to `https://your-production-domain/oauth/google/callback`.
3. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_OAUTH_REDIRECT_URI` to Vercel Production as Sensitive variables.
4. Verify `0004_google_calendar.sql`; Tasks outbound additionally needs `0011`, Tasks inbound needs `0014`/`0016`, and Calendar inbound needs `0012`/`0013`/`0019`.
5. Set `ENABLE_GOOGLE_CALENDAR=true`; optionally set `ENABLE_GOOGLE_TASKS=true` and `ENABLE_GOOGLE_CALENDAR_INBOUND=true`, then redeploy.
6. Send `Connect Google Calendar` in LINE and use the authorization button. Reconnect whenever a new scope is enabled so Tasks authorization and backfill can run.
7. Keep the per-minute worker enabled for retries, final status delivery, and Calendar inbound polling. Inbound changes normally appear within about five to six minutes.

Never put real keys, client secrets, database URLs, CAs, encryption keys, or tokens in docs, issues, commits, or chat transcripts.

## Production checklist

1. The stable root URL returns `200` with the expected version.
2. LINE webhook verification succeeds and a text message receives one reply.
3. `schema_migrations` ends at the repository's latest migration, and Supabase Cron History succeeds every minute.
4. Production was redeployed after every environment change, with no DB TLS, OAuth, or cron `401`/`503` errors.
5. Reconnect Google in LINE, then create one test event and one test task; verify exactly one item in Google Calendar and Google Tasks respectively.

## AI-operated LINE PC acceptance

The maintainer may explicitly authorize an AI agent to operate the LINE Windows client for the final Production round trip. This is supervised desktop acceptance, not a fixed macro suitable for blind CI replay: every action must rediscover and activate the single intended LINE window, locate controls from a fresh screen capture, send one message, and verify the bot response before the next state transition.

Create an acceptance manifest first with the time window, unique prefixes, local audio paths, and resulting data IDs. Cross-check LINE results in Google Calendar/Tasks, Supabase jobs, and Vercel logs. After release, review the entire release cycle rather than only the last successful batch: remove precisely identified events, tasks, confirmations, related jobs/runs/processed events, and local temporary audio, then check for pending reminders whose event no longer exists. Preserve recurring inbound cron/cursor history, real data, and platform-controlled logs, and never claim that uncontrollable traces were erased.

See the authoritative [`docs/DEVELOPMENT.md` runbook](https://github.com/SanHsien/gpt-ai-assistant/blob/main/docs/DEVELOPMENT.md#ai-%E6%93%8D%E4%BD%9C-line-pc-%E7%9A%84%E6%AD%A3%E5%BC%8F%E9%A9%97%E6%94%B6%E6%B5%81%E7%A8%8B).

## Local development

Node.js 24 is required to match CI, Vercel, and the Docker image.

```bash
git clone https://github.com/SanHsien/gpt-ai-assistant.git
cd gpt-ai-assistant
npm ci
cp .env.example .env
npm run dev
```

Expose port 3000 through an HTTPS tunnel for LINE webhook testing. Before submitting changes, run:

```bash
npx eslint .
npm test
```

The repository includes a Node 24 Dockerfile and Compose setup. Create an untracked `.env` from `.env.example`, fill every required value, then run `docker compose up --build --detach`; Compose injects that file and defaults a missing or blank `APP_PORT` to `3000`. The image installs production dependencies only, runs as a non-root user, and includes a `/health/live` healthcheck. Confirm `healthy` with `docker compose ps`, then open `http://127.0.0.1:3000/health/live`. `restart: unless-stopped` only restarts an exited main process; it does not recycle a container solely because it is `unhealthy`, so automatic recovery requires platform/orchestrator monitoring. Containers still require a public HTTPS webhook, Supabase, and the same LINE/OpenAI credentials.

## Updates

Vercel redeploys when the connected `main` branch is pushed. Review the [application changelog](https://github.com/SanHsien/gpt-ai-assistant/blob/main/CHANGELOG.md) and redeploy after changing environment variables.
