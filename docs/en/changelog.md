---
title: Changelog
---

# Changelog

## v6.0.1 (2026-07-22)

- Fixed pending reminder jobs surviving a LINE or Google Calendar event deletion; event deletion and reminder cancellation are now one atomic database operation.
- Expanded the supervised AI-operated LINE PC acceptance runbook with a test manifest, step-by-step screen relocation, cross-service verification, and release-cycle-wide cleanup of precisely identified database and local artifacts.

## v6.0.0 (2026-07-22)

- Completed centralized LINE/Supabase/Google acceptance for the durable-only runtime, Google Calendar/Tasks contract, reminders, recurrence, search, weather, and desktop audio.
- The final rc.11 desktop-audio check produced a visible raw transcript and correct-time draft; confirmation returned a LINE sync-success message and exactly one matching Google Calendar event.

## v6.0.0-rc.11 (2026-07-22)

- A real LINE Windows check showed that rc.10 could still transcribe the opening `記行程` as a homophone and fall through to general chat. rc.11 normalizes common spoken Chinese homophones and the polite `請幫我` prefix only at the start of audio schedule commands.
- The raw transcript remains visible for confirmation, and typed text is not rewritten.

## v6.0.0-rc.10 (2026-07-19)

- Real LINE Windows acceptance showed that desktop WAV/MP3 attachments can be emitted as `audio` webhooks; the old audio path always uploaded them to OpenAI with an `.m4a` name, causing a format mismatch and bad transcription.
- Audio downloads now choose `.mp3`, `.m4a`, `.wav`, or `.webm` from the LINE Content API `Content-Type`, with magic-byte fallback; the existing `file` allowlist remains supported.

## v6.0.0-rc.9 (2026-07-18)

- LINE desktop can attach a supported audio file when native voice recording is unavailable; it uses the same transcription, draft, and confirmation flow as a mobile voice message.
- Added an audio-extension allowlist and `TRANSCRIPTION_MAX_BYTES`, checking both LINE metadata and the downloaded payload before OpenAI transcription.
- Documented a repeatable AI-operated LINE PC acceptance workflow and its cleanup boundary.

## v6.0.0-rc.8 (2026-07-18)

- Production logs proved that rc.7 request/drain budgets were not the full fix: Calendar inbound with `singleEvents=true` expanded an open-ended recurrence into many instances.
- Inbound now syncs recurring series, ignores recurrence instances, and filters to bot-managed events; page size increases to 2500 to reduce accumulated serverless API round trips.
- Migration `0019_calendar_sync_query_version.sql` rebuilds each legacy v1 cursor once without deleting events.

## v6.0.0-rc.7 (2026-07-18)

- Live advanced-reminder acceptance exposed an occasional 60-second Google Calendar inbound hang; Google token/API calls now default to a 10-second timeout.
- Cron drain defaults to a 45-second budget and defers remaining durable jobs to the next minute so a slow provider cannot block reminders.

## v6.0.0-rc.6 (2026-07-18)

- Fixed explicit recurring times being shifted when a model double-applied the UTC offset; numeric and Chinese wall-clock forms are now locked to the user's timezone, starting tomorrow when today's occurrence has passed.
- Daily/weekly/monthly/yearly phrases can enter scheduling directly, and confirmation summaries show recurrence frequency, interval, count, and end date.

## v6.0.0-rc.5 (2026-07-18)

- Real LINE/Google Tasks acceptance confirmed that granting the Tasks OAuth scope does not enable Google Tasks API. Deployment, configuration, and troubleshooting docs now make the API enablement step explicit.
- Reconnecting Google after a permanent setup error can safely revive the same dead Tasks sync job without creating a duplicate task.

## v6.0.0-rc.4 (2026-07-18)

- Upgraded to Express 5.2, Jest 30.4, and ESLint 10 flat config; all 71 suites and 497 tests pass.
- `bot-sources` now uses explicit repository injection; production no longer contains an `APP_ENV === 'test'` memory branch.
- Docker and Compose default a missing or blank `APP_PORT` to `3000`, with `/health/live`, an image healthcheck, and a CI production-image build/run smoke test.
- LINE commands and durable data contracts are unchanged, so this release does not expand final LINE/Google acceptance scope.

## v6.0.0-rc.3 (2026-07-18)

- The application repository's public Git history was reinitialized from the current independent snapshot as one root commit; its MIT license, upstream attribution, and product changelog remain intact.
- Google OAuth completion/error pages now follow `APP_LANG`; remaining English/Japanese translations and swapped Japanese limit messages were fixed.
- Runtime and Docker now share a Node 24 baseline, with production-only dependencies, a non-root container user, and correct `.env` injection through Compose.
- Compatible dependency updates retain zero high-severity vulnerabilities; breaking majors remain staged 6.x migrations.
- Issues and structured templates are enabled on the independent repository, so the bot's report action has a working destination.

## v6.0.0-rc.2 (2026-07-18)

- General replies now attach up to 13 feature-aware quick replies in LINE's horizontally scrollable row.
- `Command` now returns the actual grouped list, formats, and examples instead of a four-button maintenance template.
- Added an optional 3×2 LINE rich-menu plan, mobile/desktop limitations, priority behavior, and duplicate Auto-reply warning.
- Documented `zh_TW` as production-supported, English/Japanese as experimental, and `zh_CN` as currently reusing Traditional Chinese.

## v6.0.0-rc.1 (2026-07-18)

- Version 6.0 always uses the Supabase durable queue and removes synchronous fail-open, process-memory redelivery filtering, Vercel-environment storage, and `APP_WEBHOOK_QUEUE`.
- Added migration `0018_durable_sources.sql`, runtime configuration/migration preflight, and `npm run db:preflight`; unavailable durable prerequisites return `5xx` for LINE redelivery.
- Google Calendar/Tasks scopes, capabilities, and inbound conflicts now share a tested contract. Calendar all-day inbound, recurrence exceptions, Google-origin creation, and Tasks due inbound remain unsupported.
- `SERPAPI_API_KEY` is a required prerequisite for default-on search. The maintainer's Production deployment now has it as a Sensitive env, and migration `0018`, its checksum, and `bot_sources` RLS were verified.
- Production RC health, the `5.13.0` to RC rollback round trip, and per-minute Supabase Cron/HTTP 200 were verified live. Only consolidated LINE/Google acceptance remains before the final release.

## v5.13.0 (2026-07-17)

- Google Tasks inbound now commits its watermark only after a complete successful pull; an expired claim lease replays the old window after worker failure.
- At-time, lead, and recurring reminders share one scheduler. Calendar inbound edits reschedule every reminder, stale jobs are cancelled even when reminders are disabled, and RFC 5545 `rrule` handles month-end/leap-year recurrence.
- Chiayi/Hsinchu city-county choices are deterministic. Unknown places ask for "town + region/country" or a nearby city instead of guessing coordinates.
- The latest schema is `0017`. Compatible work remains in 5.x; `6.0.0` is reserved for breaking durable-only convergence.
- The application and documentation are independently maintained repositories while permanently retaining original MIT attribution.

## v5.12.0 (2026-07-17)

- Recurring events now remind for **every occurrence**: a weekly meeting reminds each time and automatically schedules the next (bounded by count/until). Fixes the gap where, after enabling notification dedup, a recurring event only reminded once. Editing a recurring event clears the whole prior reminder chain and reschedules.

## v5.11.0 (2026-07-17)

- Multiple (lead) reminders: `REMINDER_OFFSETS` (e.g. `60,1440` = 1 hour and 1 day ahead) adds reminders at each lead time besides the at-start one; the message labels how far ahead it is. Off by default = single at-start reminder.

## v5.10.0 (2026-07-17)

- Create an event from a search result: when the answer contains a date/time, a "📅 Create event" quick-reply appears; tapping it runs the content through the event draft flow and creates it only after confirmation. Requires scheduling to be enabled.

## v5.9.0 (2026-07-17)

- Google Tasks inbound sync (`ENABLE_GOOGLE_TASKS_INBOUND`, off by default): Google-side completion/reopen, deletion, title, and notes on bot-created tasks are reclaimed into the assistant list; due dates are not reclaimed (the precise deadline stays authoritative locally).

## v5.8.1 (2026-07-17)

- Fixed Google Tasks due-date shifts at UTC day boundaries by using each task's local timezone.
- Reauthorization now backfills existing unsynced tasks; Tasks and Calendar sync/complete/delete paths use row locks. Google Tasks notes carry a stable sync marker and inserts look it up first, preventing duplicate tasks after an ambiguous remote success.
- Calendar inbound keeps `singleEvents=true` and the existing timezone when Google omits it; daily weather keeps its local hour across DST.

## v5.8.0 (2026-07-17)

- Google Calendar notification dedup: with LINE reminders enabled, events written to Google no longer trigger Google's own default notifications, so the LINE reminder is the single source and there is no double alert. With LINE reminders off, Google's default notifications are kept.

## v5.7.0 (2026-07-17)

- Voice-created events: say "Schedule ..." as a LINE voice message; it is transcribed and runs the same draft/confirm flow, with the confirmation card echoing "🎤 Heard: ..." to verify the transcription.
- Image-to-event (posters/tickets) is explicitly not planned; images keep working for vision chat.

## v5.6.0 (2026-07-17)

- Added run trace: each AI run records capability/model/tokens/estimated cost/duration/status (no conversation content or credentials); cost is estimated from `OPENAI_PRICE_PER_1K_*`.
- Documented backup/restore and worker-crash recovery drills; the Phase 0 reliability baseline is complete.

## v5.5.0 (2026-07-17)

- Google Calendar inbound sync (edits): editing a bot-created non-recurring timed event on the Google side is reclaimed locally and the reminder is rescheduled. A pending local edit made via the bot takes precedence.

## v5.4.0 (2026-07-17)

- Google Calendar inbound sync (deletions, `ENABLE_GOOGLE_CALENDAR_INBOUND`, off by default): deleting a bot-created event on the Google side reclaims it locally and cancels its reminder. Uses per-minute sync-token polling on the existing schedule.

## v5.3.0 (2026-07-17)

- Google Tasks one-way sync (`ENABLE_GOOGLE_TASKS`, off by default): create/complete/reopen/delete are synced to Google Tasks, sharing the Google Calendar OAuth (existing users re-run "Connect Google Calendar" to add the tasks scope). Sync failures keep the local task.

## v5.2.0 (2026-07-17)

- Search replies append a "📎 Sources" list (title/source/date/link). Sources are shown only and never fed into the prompt.

## v5.1.0 (2026-07-17)

- Daily weather subscription push (`ENABLE_WEATHER_PUSH`, off by default): `Daily weather Taipei 8`, `Cancel daily weather`, `My weather subscriptions`. Reuses the existing scheduler.

## v5.0.2 / v5.0.1 (2026-07-17)

- Weather natural-phrase routing: `Today's weather in Chiayi` and similar now match weather lookup.
- Same-name place disambiguation: ambiguous places return coordinate-bound options to tap instead of silently picking the first match.

## v5.0.0 (2026-07-17)

- Completed the real LINE M1 loop for Phase 1 events, Phase 2 assistant tasks, and Phase 3 reminders.
- Task creation and reopening now state that the item is stored only in the assistant task list, is not yet synced to Google Tasks, and does not create a Google Calendar event.
- Google Tasks sync remains the next standalone 5.x release; recurring/batch events, multiple reminders, and inbound Google sync are also outside this milestone.

## v4.20.5 (2026-07-17)

- Fixed the concise `行程 <details>` prefix so it enters structured scheduling instead of general chat; `行程 5分鐘後的測試通知` now produces a confirmation draft and uses the existing due reminder.
- Recorded that upstream `d84c806` is included in this fork and that no contributions to the low-activity upstream are currently planned.

## v4.20.4 (2026-07-17)

- `My tasks tomorrow` now applies a real next-day range in the user's timezone; today aliases remain bounded to today.
- Weeks run Monday through Sunday; this-week/next-week filters and aliases are supported, and broad due phrases resolve to the corresponding Sunday at 09:00. Unknown filters no longer fall back to all tasks.
- Trailing sentence punctuation is no longer stored in tags; existing punctuated tags remain searchable.
- Google Calendar unlink and reauthorization passed real LINE validation.
- Reference documentation now links Toki (formerly Dola), its official updates and brand history, the legacy Dola note article, and LINE VOOM.

## v4.20.3 (2026-07-17)

- Event and task list actions now show the selected row number in LINE while internal ids remain hidden in postback data.
- Relative task due dates are deterministically aligned to the user's timezone, preventing UTC day-boundary errors.
- Common Taiwan place shorthand such as `Weather Taipei` is retried with administrative and country context, and provider labels are normalized to `Taipei City, Taiwan`.

## v4.20.2 (2026-07-17)

- Relative dates such as tomorrow are now resolved from the user's IANA timezone before model parsing, preventing UTC day-boundary errors.
- Broad periods such as afternoon or evening without a clock time always trigger clarification; model-invented defaults such as 15:00 are discarded.

## v4.20.1 (2026-07-16)

- Fixed task `today`/`this week` ranges so they do not include older overdue tasks, and made `TASK_LIST_LIMIT` effective.
- Added Open-Meteo attribution to every weather response.
- Applied production migrations `0007`–`0009`; the M1 baseline now awaits real LINE validation before `5.0.0`.

## v4.15.0–v4.20.0 (2026-07-15–16)

- Phase 2 tasks: create, paginated list, due/priority/tag/status filters, complete, reopen, and delete.
- Phase 3 preferences: quiet hours, pause/resume, and stale-reminder policy.
- Google Calendar unlink/token revocation.
- Phase 6 lookup baseline: Open-Meteo current conditions, 1–7 day forecasts, and short-term cache.

## v4.14.0 (2026-07-15)

- Added durable structured clarification without storing raw conversation text.
- Added confirmed event editing, optimistic version protection, and overlap warnings.
- Bot-managed edits reschedule reminders and PATCH mapped Google Calendar events through durable sync.
- Added migration `0006_schedule_workflows.sql` and preserved per-user event order within webhook batches.

## v4.13.2 (2026-07-15)

- Fixed reminder completion treating a Google event id as a PostgreSQL UUID, which prevented completion from syncing back to Google Calendar.
- Event confirmation, completion, deletion, and sync-recovery buttons now use LINE postbacks, keeping confirmation tokens and event ids out of visible chat messages.
- Text commands containing `<ID>` remain available for troubleshooting, while internal postback data is excluded from conversation history.

## v4.13.1 (2026-07-15)

- Google Calendar creation no longer announces a transitional local success; the bot reports only after Google sync actually succeeds.
- The per-minute Supabase worker now drains Calendar sync and final-status jobs, so all three attempts run without waiting for another webhook.
- Final failure offers Retry sync, Not now, and Delete event. Not now preserves Supabase data and stops prompting; Failed syncs can recover it later.

## v4.13.0 (2026-07-15)

- Supabase Postgres durable queue, cross-instance webhook idempotency, and AI/LINE delivery checkpoints.
- Natural-language event drafts, confirmation/cancel, per-user timezone, list, and one-tap delete.
- Google Calendar Web OAuth with minimal `calendar.events.owned` scope, encrypted tokens, one-way creation, and direct list/delete.
- Compact Google Calendar connect commands route to OAuth instead of general OpenAI chat.
- Date-led statements route to event capture; weekday phrases are resolved before the model chooses a date.
- Event completion, Google completion metadata, and Supabase-Cron-driven due reminders with LINE retry-key deduplication.
- The maintainer's External OAuth app is now In Production to avoid seven-day Testing refresh-token expiry; it remains an unverified personal-use deployment below the 100-user cap.

## v4.12.3

- Private Vercel Blob uploads with temporary signed URLs for GPT Image.
- LINE redelivery and repeated event IDs are processed once.

## v4.12.2

- Default image model changed to `gpt-image-2` with `low` quality.
- Timeouts updated for GPT Image.
- URL HTML parsing fixed CodeQL alerts.

## v4.11.0

- Optional SSRF-guarded URL summarization.

## v4.10.x

- Updated chat and transcription models.
- Feature flags, prompt TTL, group mention policy, Push fallback, CodeQL, CI, and production fixes.

See the complete [application changelog](https://github.com/SanHsien/gpt-ai-assistant/blob/main/CHANGELOG.md).
