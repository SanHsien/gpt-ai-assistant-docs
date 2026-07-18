---
title: Configuration
---

# Configuration

All settings use environment variables. The repository [`.env.example`](https://github.com/SanHsien/gpt-ai-assistant/blob/main/.env.example) is authoritative.

## Required

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI Platform API key |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API token |
| `LINE_CHANNEL_SECRET` | LINE signature secret; missing values fail closed |

Keep `APP_DEBUG=false` in production. `APP_LANG` accepts `zh_TW`, `zh`, `zh_CN`, `en`, and `ja`; unknown values fail with an actionable startup error. Only `zh_TW` is fully production-supported. `zh`/`zh_CN` currently reuse Traditional Chinese. English and Japanese include the main commands and Google OAuth pages, but remain experimental because weather formatting and natural-language date/intent parsing are Chinese-oriented. The English docs do not imply that the bot localization has passed full English E2E. Other common settings include `APP_WEBHOOK_PATH` (`/webhook`), `APP_API_TIMEOUT` (9000 ms), prompt message/token limits, and `APP_MAX_PROMPT_AGE` (0 disables expiration).

## Model defaults

| Variable | Default |
| --- | --- |
| `OPENAI_COMPLETION_MODEL` | `gpt-4o-mini` |
| `OPENAI_VISION_MODEL` | `gpt-4o` |
| `OPENAI_TRANSCRIPTION_MODEL` | `gpt-4o-mini-transcribe` |
| `OPENAI_IMAGE_GENERATION_MODEL` | `gpt-image-2` |
| `OPENAI_IMAGE_GENERATION_SIZE` | `1024x1024` |
| `OPENAI_IMAGE_GENERATION_QUALITY` | `low` |
| `OPENAI_IMAGE_GENERATION_TIMEOUT` | 55000 ms |

`OPENAI_BASE_URL` can target a compatible endpoint, but the tested default remains the direct OpenAI API.

## Feature flags

| Variable | Default |
| --- | --- |
| `ENABLE_IMAGE_GENERATION` | true |
| `ENABLE_TRANSCRIPTION` | true |
| `ENABLE_VISION` | true |
| `ENABLE_SEARCH` | true |
| `ENABLE_URL_SUMMARY` | false |
| `GROUP_REPLY_REQUIRES_MENTION` | false |
| `ENABLE_SCHEDULE` | false |
| `ENABLE_REMINDERS` | false |
| `ENABLE_GOOGLE_CALENDAR` | false |
| `ENABLE_GOOGLE_CALENDAR_INBOUND` | false |
| `ENABLE_TASKS` | false |
| `ENABLE_GOOGLE_TASKS` | false |
| `ENABLE_WEATHER` | false |
| `ENABLE_WEATHER_PUSH` | false |

Search requires `SERPAPI_API_KEY`. Vercel Blob normally uses OIDC; `BLOB_READ_WRITE_TOKEN` is a fallback. The deploy command requires `VERCEL_DEPLOY_HOOK_URL`.

URL summarization has timeout and size limits, but fetched pages can still contain prompt injection; keep it disabled unless needed.

## Supabase, queue, and scheduling

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Supabase Postgres transaction-pooler URI; required by the 6.0 runtime |
| `DATABASE_SSL_CA` | Supabase CA PEM; Supabase connections fail closed when it is missing |
| `DATA_ENCRYPTION_KEY` | 32-byte base64 key for encrypted jobs, OAuth tokens, reminder LINE targets, and HMAC-derived user IDs |
| `WORKER_MAX_JOBS` / `WORKER_LEASE_SECONDS` / `WORKER_MAX_ATTEMPTS` | Durable worker limits, lease, and retries |
| `SCHEDULE_DEFAULT_TIMEZONE` | IANA timezone used before a user sets one; default `Asia/Taipei` |
| `SCHEDULE_MAX_TOKENS` / `SCHEDULE_CONFIRM_TTL` | Structured-event token budget and confirmation TTL |
| `REMINDER_CRON_SECRET` | At least 32 random characters; shared by reminder and Google sync workers, and identical in Vercel Sensitive env and Supabase Vault |
| `REMINDER_WORKER_MAX_JOBS` | Maximum reminder/Calendar sync/status jobs per Cron call; default 20 |
| `REMINDER_CRON_URL` | Production HTTPS `/cron/reminders` URL used only by `npm run db:configure-reminders` |
| `TASK_LIST_LIMIT` | Tasks per page, clamped to 1–6; default 6 |
| `WEATHER_FORECAST_DAYS` / `WEATHER_CACHE_TTL` | Forecast day count (1–7) and cache TTL |
| `WEATHER_DAILY_DEFAULT_HOUR` / `WEATHER_DAILY_MAX_PER_RUN` | Default daily-weather push hour and per-run cap |
| `CALENDAR_INBOUND_INTERVAL` / `CALENDAR_INBOUND_MAX_PER_RUN` | Inbound poll per-account throttle (seconds) and per-run account cap |
| `GOOGLE_TASKS_LIST_ID` | Google Tasks sync target list, default `@default` |
| `OPENAI_PRICE_PER_1K_PROMPT` / `OPENAI_PRICE_PER_1K_COMPLETION` | Optional; run trace estimates `cost_usd` only when both are set |

Apply repository migrations `0001`–`0018` in order, then run `npm run db:preflight`. Migration `0017` completes reminder-index consolidation and `0018` moves bot-source activation into Postgres. Environment-variable changes do not run migrations automatically and require a redeploy. The per-minute Cron drains due reminders, Google Calendar retries and final status delivery, daily weather subscriptions, and provider inbound polling; these LINE pushes count against the Messaging API quota.

Google Tasks shares the Calendar OAuth. After enabling it, reconnect Google to grant the `tasks` scope; the successful callback backfills existing unsynced tasks. Supabase remains authoritative. Outbound sync is controlled by `ENABLE_GOOGLE_TASKS`; optional inbound title, notes, status, and deletion sync uses `ENABLE_GOOGLE_TASKS_INBOUND`, while exact due time stays local.

Apply migrations first, configure Cron/OAuth second, then enable flags and redeploy. Version 6.0 always uses durable webhook processing and requires migrations through `0018`; scheduling/reminders need `0002`, `0005`, `0006`, and per-minute Cron; Tasks needs `0007`/`0008`; Google Tasks outbound needs `0011`, inbound needs `0014`/`0016`, the Google Tasks API, renewed OAuth, and per-minute Cron; Calendar inbound needs `0012`/`0013` and per-minute Cron; daily weather needs `0010` and per-minute Cron. Every Vercel environment change requires a redeploy.

## Google Calendar OAuth

| Variable | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Web application OAuth client; Sensitive env only |
| `GOOGLE_OAUTH_REDIRECT_URI` | Full HTTPS callback; must exactly match the authorized redirect URI |
| `GOOGLE_CALENDAR_ID` | Default `primary`; a configured calendar must be user-owned |
| `GOOGLE_OAUTH_STATE_TTL` | One-time state/PKCE-verifier TTL; default 600 seconds |

Calendar requests only `calendar.events.owned`; enabling `ENABLE_GOOGLE_TASKS` additionally requests the `tasks` scope. Never commit or publish client secrets, database URLs, CAs, encryption keys, or Google tokens.

## Storage boundary

Activation state, events, tasks, reminder preferences, OAuth state, encrypted credentials, processed events, and jobs all use Supabase Postgres as the sole durable authority. `bot_sources` stores only HMAC keys, never raw LINE IDs or names; raw conversation context remains ephemeral.
