---
title: Features and Commands
---

# Features and Commands

## Current capabilities

| Category | Capabilities |
| --- | --- |
| Chat | Conversation, continue, retry, clear context |
| Text | Summaries, advice, analysis, English/Japanese translation |
| Search | SerpAPI web search with a "📎 Sources" list (title/source/date/link; shown only, never fed into the prompt) |
| Multimodal | LINE mobile voice-message and desktop audio-file transcription, vision, GPT Image generation |
| URLs | Optional SSRF-guarded URL summarization |
| Groups | Activate/deactivate and optional mention gating |
| Events | Date-led input, deterministic weekday resolution, durable clarification, confirmed edits, overlap warnings, list, complete, and delete; **voice-created events** (mobile voice messages or desktop audio files use the same transcription and confirmation flow) |
| Reminders | Due-time LINE Push; all-day events at 09:00, durable retry-key dedup; quiet hours, pause/resume |
| Google Calendar | OAuth, idempotent durable create/update, per-minute retries, final status delivery, direct list/complete/delete; **bidirectional sync**: inbound sync-token polling reclaims Google-side deletions and timed edits, with reminder dedup to avoid double notifications |
| Google Tasks | Outbound create/complete/reopen/delete with `ENABLE_GOOGLE_TASKS`; inbound title, notes, status, and deletion with `ENABLE_GOOGLE_TASKS_INBOUND` (shares Calendar OAuth) |
| Tasks | Stored in the Supabase assistant task list; natural-language due dates, priority, tags, pagination, filters, complete/reopen/delete |
| Weather | Open-Meteo current conditions and 1–7 day forecasts, Taiwan place-shorthand completion, same-name place disambiguation, and daily subscription push |
| Observability | Run trace records each AI run's capability/model/tokens/estimated cost/duration/status (no conversation content or credentials) |
| System | Command list, version, issue report, docs, Vercel redeploy |

Send `Command` to receive a grouped list and examples generated from the capabilities enabled on that deployment. It replaces the old four-button maintenance template. General replies also attach up to 13 feature-aware quick replies: `Schedule`, `My events`, `Add task`, `My tasks`, `Weather`, `Daily weather`, `Search`, `Draw`, `Link Google Calendar`, `Pause reminders`, `Resume reminders`, `Forget`, and `Command`. LINE renders one horizontally scrollable row; use the optional 3×2 rich menu in [Getting Started](./getting-started.md#optional-line-rich-menu) when a persistent two-row mobile launcher is preferred.

Send the localized equivalent of “commands” in LINE for the authoritative trigger list. Event commands include `Schedule ...`, date-led statements, `My events`, completion, timezone setup, `Connect Google Calendar`, `Failed syncs`, `Retry sync <ID>`, `Not now <ID>`, and `Delete event <ID>`. Not now preserves the local Supabase event and stops prompting; deletion is always explicit. Chinese weekday input uses the next matching weekday unless it explicitly says this week or next week, including `這個星期` and `下個星期`. Trigger words remain authoritative in `app/commands/` and `locales/`.

Event confirmation, cancellation, completion, deletion, and sync-recovery buttons use LINE postbacks. List selections show natural text with the current row number, such as `Edit event 2`, `Complete event 2`, or `Delete event 2`; confirmation tokens, Supabase UUIDs, and Google event ids remain in hidden postback data.

Ambiguous dates or times create a durable structured draft and ask one focused follow-up without storing raw conversation text. Date-only statements are all-day events. `Edit event` lists bot-managed events, accepts a natural-language change, warns about overlaps, and confirms before applying it. Optimistic versions prevent stale drafts from overwriting a newer edit; mapped Google events are updated through the durable sync worker.

Recurring event phrases such as `Every day at 22:40 routine check` enter scheduling directly. Explicit wall-clock times are resolved in the user's IANA timezone rather than trusting model offset arithmetic, and the confirmation summary shows frequency, interval, count, or end date before creation.

Task commands include `Add task tomorrow submit report #work`, `My tasks`, and filters such as `today`, `tomorrow`, `this week`, `next week`, `overdue`, `completed`, or `#work`. Complete, reopen, and delete use list buttons. Tasks are stored in the assistant task list and do not create Google Calendar events; with outbound and inbound Google Tasks flags enabled they synchronize supported changes in both directions, while exact due time remains locally authoritative and sync failure never deletes the local task. Weeks run Monday through Sunday. A broad this-week deadline without a weekday resolves to Sunday at 09:00; next week resolves to the following Sunday. Trailing sentence punctuation is excluded from tags. Unknown filters return usage instead of silently listing all tasks. Reminder preferences include `Quiet hours 22-8`, `Quiet hours off`, `Pause reminders`, and `Resume reminders`; reminders due while paused are skipped rather than backfilled.

Weather: use `Weather Taipei` for current conditions and forecasts; unambiguous Taiwan place shorthand is completed automatically, and natural phrases like `Today's weather in Chiayi` are also recognized (weather intent at the start or end of a message, gated on `ENABLE_WEATHER`). Subscribe to a daily push with `Daily weather Taipei 8`, cancel with `Cancel daily weather`, and list with `My weather subscriptions` (requires `ENABLE_WEATHER_PUSH`). For same-name places (e.g. Chiayi City vs County), the bot returns coordinate-bound options to tap instead of silently picking the first match. Known city/county collisions use deterministic administrative-center fallbacks; otherwise an unavailable provider result asks for a township plus county/country or a nearby city.

Voice-created events: on mobile, send a LINE voice message such as "Schedule doctor visit tomorrow at 3pm". Because LINE desktop does not provide native voice recording, attach a supported `.mp3`, `.mp4`, `.mpeg`, `.mpga`, `.m4a`, `.wav`, or `.webm` file instead. LINE may emit a desktop attachment as an `audio` webhook; the bot uses the Content API header or file magic bytes to preserve its real format and also accepts an unchanged `file` webhook. Both inputs use the same transcription and draft/confirm flow. `TRANSCRIPTION_MAX_BYTES` defaults to 25 MiB.

## Default models

| Capability | Default |
| --- | --- |
| Chat | `gpt-4o-mini` |
| Vision | `gpt-4o` |
| Transcription | `gpt-4o-mini-transcribe` |
| Image generation | `gpt-image-2`, `low` |
| Search | SerpAPI |

Capability flags include `ENABLE_IMAGE_GENERATION`, `ENABLE_TRANSCRIPTION`, `ENABLE_VISION`, and `ENABLE_SEARCH`. URL summarization and group mention gating are off by default.

`ENABLE_SCHEDULE`, `ENABLE_REMINDERS`, `ENABLE_GOOGLE_CALENDAR`, `ENABLE_GOOGLE_CALENDAR_INBOUND`, `ENABLE_TASKS`, `ENABLE_GOOGLE_TASKS`, `ENABLE_GOOGLE_TASKS_INBOUND`, `ENABLE_WEATHER`, and `ENABLE_WEATHER_PUSH` are opt-in code defaults and require their database/Cron/OAuth setup. `REMINDER_OFFSETS` optionally adds up to five lead reminders. Version 6.0 always uses Postgres durable deduplication.

## Roadmap

`6.0.0-rc.11` implements the durable-only runtime, Google provider contract, feature-aware quick replies, grouped `Command`, Node 24/Express 5/Jest 30/ESLint 10, dead Tasks job recovery, deterministic recurring local-time confirmation, bounded Google request/Cron drain times, non-expanded Calendar series sync, correctly typed desktop audio transcription, and spoken Chinese schedule-prefix normalization. Calendar all-day/recurrence-exception inbound, Google-origin creation, and Tasks due-date inbound remain unsupported; final `6.0.0` waits for the remaining LINE/Google acceptance checks.

Real reminder validation confirmed one delivery at the due time, no delivery or backfill while paused, and normal one-time delivery for a new reminder after resuming.

Real task-reopen validation passed: the selected completed task returned to the open list and disappeared from the completed list. Another task with the same title remained unchanged because it was a separate row, confirming that one action updates only the selected task.

## Product and architecture references

- [Toki (formerly Dola)](https://toki.com/en) informs product behavior for natural-language scheduling and tasks, adaptive reminders, completion, multi-calendar coordination, conflict suggestions, multimodal capture, weather, and proactive tracking. Public research sources include [Toki Updates](https://toki.com/updates), the official [brand history](https://toki.com/brand), the legacy [Dola note article](https://note.com/dola_ai/n/nc457877a6b09), and the [LINE VOOM account](https://linevoom.line.me/user/_deGOEUAnNSgP1QW6kUVOtnQRZ3lnRXY7A0ukxwQ?=).
- [memochou1993/fermi](https://github.com/memochou1993/fermi) is the successor explicitly named by the original author in upstream [`d84c806`](https://github.com/memochou1993/gpt-ai-assistant/commit/d84c806b8368ded9d790067235827cdac32a23ab). It informs Supabase, durable-worker, and run-trace architecture; its FSL-1.1-MIT source is not merged directly. This project uses that upstream commit as its base.

Upstream is not archived, but its latest merged PR remains dated July 9, 2024. This project is now independently maintained and does not plan upstream contributions. Leaving GitHub's fork network does not remove the permanent MIT attribution.

Commercial references inform independently implemented behavior only. No proprietary code, branding, copy, screens, or assets are reused. See the repository [ROADMAP.md](https://github.com/SanHsien/gpt-ai-assistant/blob/main/docs/ROADMAP.md) for the full reference and licensing boundary.

## Google Tasks sync

With `ENABLE_GOOGLE_TASKS`, create/complete/reopen/delete is synced outbound to Google Tasks, sharing Google OAuth. The Google Tasks API must also be enabled separately in the OAuth project's Google Cloud API library. `rc.5` safely revives the same dead sync job after a permanent setup error is fixed and Google is reconnected. With `ENABLE_GOOGLE_TASKS_INBOUND`, Google-side completion/reopen, deletion, title, and notes are reclaimed after a successful incremental poll. Failures never delete the local task; due remains locally authoritative.

Google Tasks due dates preserve the task's local date; exact time remains in Supabase or reminder delivery.

See the engineering [ROADMAP.md](https://github.com/SanHsien/gpt-ai-assistant/blob/main/docs/ROADMAP.md).

Version policy: compatible improvements stay in 5.x. `6.0.0` is published only when breaking architecture convergence has an upgrade and rollback path.
