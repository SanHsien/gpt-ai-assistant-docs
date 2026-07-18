---
title: 設定
---

# 設定

所有設定都透過環境變數，完整範本以 repo 的 [`.env.example`](https://github.com/SanHsien/gpt-ai-assistant/blob/main/.env.example) 為準。

## 必填

| 變數 | 說明 |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI Platform API key |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API channel access token |
| `LINE_CHANNEL_SECRET` | LINE channel secret；缺少時 webhook fail closed |

## 應用程式

| 變數 | 預設 | 說明 |
| --- | --- | --- |
| `APP_DEBUG` | `false` | 正式環境必須保持 false，避免 prompt 進 log |
| `APP_PORT` | 3000 | 本機 port |
| `APP_LANG` | `zh_TW` | `zh_TW`（正式支援）、`zh`、`zh_CN`、`en`、`ja` |
| `APP_WEBHOOK_PATH` | `/webhook` | webhook path |
| `APP_API_TIMEOUT` | 9000 ms | 一般 API timeout |
| `APP_MAX_GROUPS` / `APP_MAX_USERS` | 1000 | 自架容量限制 |
| `APP_MAX_PROMPT_MESSAGES` | 4 | 上下文訊息數 |
| `APP_MAX_PROMPT_TOKENS` | 256 | 回覆 token 上限 |
| `APP_MAX_PROMPT_AGE` | 0 | prompt TTL 秒數；0 表示停用 |
| `APP_INIT_PROMPT` | 空 | 額外系統 prompt |

`APP_LANG` 的可選值不代表相同支援等級。`zh_TW` 是唯一完成 Production 與 LINE 驗收的正式語系；`zh`／`zh_CN` 目前都共用繁體字串，沒有獨立簡體中文包；`en`／`ja` 可啟動，主要指令與 Google OAuth 頁面已有翻譯，但天氣格式與自然語言日期／意圖解析仍偏繁中，因此屬實驗性。未知值會在啟動時明確報錯。英文文件站是部署文件翻譯，不代表英文 bot 已完整驗收。

## 模型

| 變數 | 預設 |
| --- | --- |
| `OPENAI_COMPLETION_MODEL` | `gpt-4o-mini` |
| `OPENAI_VISION_MODEL` | `gpt-4o` |
| `OPENAI_TRANSCRIPTION_MODEL` | `gpt-4o-mini-transcribe` |
| `TRANSCRIPTION_MAX_BYTES` | 26214400（25 MiB） |
| `OPENAI_IMAGE_GENERATION_MODEL` | `gpt-image-2` |
| `OPENAI_IMAGE_GENERATION_SIZE` | `1024x1024` |
| `OPENAI_IMAGE_GENERATION_QUALITY` | `low` |
| `OPENAI_IMAGE_GENERATION_TIMEOUT` | 55000 ms |

`OPENAI_BASE_URL` 可用於相容 endpoint，但本 repo 的預設與測試目標仍是 OpenAI direct API。

## 功能開關

| 變數 | 預設 | 說明 |
| --- | --- | --- |
| `ENABLE_IMAGE_GENERATION` | true | 生圖 |
| `ENABLE_TRANSCRIPTION` | true | 語音轉錄 |
| `ENABLE_VISION` | true | 圖片理解 |
| `ENABLE_SEARCH` | true | SerpAPI 搜尋 |
| `ENABLE_URL_SUMMARY` | false | 抓取訊息中的網址作上下文 |
| `GROUP_REPLY_REQUIRES_MENTION` | false | 群組必須 mention 才回 |
| `ENABLE_SCHEDULE` | false | 自然語言行程、確認、查詢與刪除 |
| `ENABLE_REMINDERS` | false | 以 Supabase Cron 觸發行程到點提醒 |
| `REMINDER_OFFSETS` | 空 | 多重（提前）提醒的分鐘清單，如 `60,1440`＝提前 1 小時與 1 天；需開 `ENABLE_REMINDERS`。最多 5 個、每個最多一年；空＝只有到點提醒 |
| `ENABLE_GOOGLE_CALENDAR` | false | 以使用者授權的 Google Calendar 作行程操作面（outbound） |
| `ENABLE_GOOGLE_CALENDAR_INBOUND` | false | Google 端刪除／timed 修改回收到本地（sync token 輪詢）；需開 `ENABLE_GOOGLE_CALENDAR` |
| `ENABLE_TASKS` | false | 任務 CRUD、今天／明天／本週／下週期限、狀態與標籤篩選 |
| `ENABLE_GOOGLE_TASKS` | false | 任務同步到 Google Tasks（outbound）；與 Calendar 共用 OAuth，重新授權後回填既有任務 |
| `ENABLE_GOOGLE_TASKS_INBOUND` | false | Google 端完成／重開、刪除、標題、備註回收到本地（`updatedMin` 輪詢；`due` 不回收）；需開 `ENABLE_GOOGLE_TASKS` |
| `ENABLE_WEATHER` | false | Open-Meteo 現況與 1–7 日預報 |
| `ENABLE_WEATHER_PUSH` | false | 每日天氣訂閱推播（走 Push API、計 LINE 額度）；需開 `ENABLE_WEATHER` |

## 外部服務

| 變數 | 說明 |
| --- | --- |
| `SERPAPI_API_KEY` | 啟用搜尋所需 |
| `SERPAPI_LOCATION` | 預設 `tw` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob OIDC 無法使用時的 fallback |
| `VERCEL_DEPLOY_HOOK_URL` | 啟用「deploy」指令 |

網址摘要另有 `URL_FETCH_TIMEOUT`、`URL_FETCH_MAX_BYTES`、`URL_FETCH_MAX_CHARS`。它具 SSRF 與大小限制，但遠端內容仍可能包含 prompt injection，因此預設關閉。

## Supabase、queue 與行程

| 變數 | 說明 |
| --- | --- |
| `DATABASE_URL` | Supabase Postgres transaction pooler URI；6.0 runtime 必填 |
| `DATABASE_SSL_CA` | Supabase CA PEM；Supabase URL 缺少時連線 fail closed |
| `DATA_ENCRYPTION_KEY` | 32-byte base64 key，用於加密 job payload、OAuth token、提醒 LINE target 與 HMAC 化 user id |
| `WORKER_MAX_JOBS` / `WORKER_LEASE_SECONDS` / `WORKER_MAX_ATTEMPTS` | durable worker 上限、租約與重試控制 |
| `SCHEDULE_DEFAULT_TIMEZONE` | 未設定個人時區時的 IANA timezone，預設 `Asia/Taipei` |
| `SCHEDULE_MAX_TOKENS` / `SCHEDULE_CONFIRM_TTL` | 行程 JSON token 上限與草稿確認 TTL |
| `REMINDER_CRON_SECRET` | 至少 32 字元的 Bearer secret；提醒與 Google 同步 worker 共用，Vercel Sensitive env 與 Supabase Vault 必須相同 |
| `REMINDER_WORKER_MAX_JOBS` | 每次 Cron 最多處理提醒／Calendar 同步／狀態 jobs 數，預設 20 |
| `REMINDER_WORKER_TIME_BUDGET_MS` | 每次 Cron drain 總預算，預設 45000 毫秒；到期後剩餘 durable jobs 留到下一分鐘 |
| `REMINDER_CRON_URL` | 只供 `npm run db:configure-reminders` 使用的正式 `/cron/reminders` HTTPS URL |
| `TASK_LIST_LIMIT` | 「我的任務」每頁筆數，限 1–6，預設 6 |
| `WEATHER_FORECAST_DAYS` / `WEATHER_CACHE_TTL` | 天氣預報天數（1–7）與 cache TTL |
| `WEATHER_DAILY_DEFAULT_HOUR` / `WEATHER_DAILY_MAX_PER_RUN` | 每日天氣訂閱的預設推播時刻與每次 cron 上限 |
| `CALENDAR_INBOUND_INTERVAL` / `CALENDAR_INBOUND_MAX_PER_RUN` | inbound 輪詢的每帳號節流秒數與每次 cron 挑帳號上限 |
| `GOOGLE_REQUEST_TIMEOUT_MS` | Google token refresh 與 Calendar／Tasks API 單次 timeout，預設 10000 毫秒 |
| `GOOGLE_TASKS_LIST_ID` | Google Tasks 同步目標清單，預設 `@default` |
| `OPENAI_PRICE_PER_1K_PROMPT` / `OPENAI_PRICE_PER_1K_COMPLETION` | 選填；設定後 run trace 才估算 `cost_usd`，否則只記 token 數 |

先依序套用 repo 的 `db/migrations/0001`–`0019`；`0014`／`0016` 是 Google Tasks inbound 與安全水位，`0017` 移除提醒的重複索引，`0018` 將 bot source 啟停狀態移入 Postgres，`0019` 版本化 Calendar sync query 並讓既有 cursor 安全重建。再跑 `npm run db:preflight`；環境變數不會自動執行 migration，改完後必須 Redeploy。Supabase Cron 每分鐘同時處理到點／提前提醒、Google Calendar 同步重試與最終狀態通知、每日天氣訂閱、Calendar 與 Tasks inbound 輪詢；這些 LINE Push 計入 Messaging API 月額度。

Google Tasks 與 Calendar 共用 OAuth，但必須在 Web OAuth client 所屬的同一 Google Cloud project **另外啟用 Google Tasks API**；`tasks` scope 只代表使用者授權，不會啟用 API。開啟 `ENABLE_GOOGLE_TASKS` 後請重新連結 Google 帳號；成功 callback 會回填既有未同步任務。若先前因 API 未啟用而形成 dead job，`rc.5` 會在再次連結時安全重排同一 job。Supabase 是任務權威來源；`ENABLE_GOOGLE_TASKS_INBOUND` 另開後為雙向同步，但 Google 端改動的期限（`due`）不回收，精確期限以本地為準。

功能開關的前置條件與啟用順序如下；任何 Vercel env 變更後都必須 Redeploy：

| 功能 | 必要 migration／服務 |
| --- | --- |
| durable webhook | `0001`–`0019`、`DATABASE_URL`；6.0 固定啟用 |
| 行程／提醒 | `0002`、`0005`、`0006`、每分鐘 Supabase Cron、`ENABLE_SCHEDULE`／`ENABLE_REMINDERS` |
| 任務／Google Tasks | `0007`、`0008`、`0011`、`0014`、`0016`（安全 inbound 水位）、Google Tasks API、重新 OAuth、對應 flags |
| Google Calendar inbound | `0012`、`0013`、`0019`、每分鐘 Supabase Cron、`ENABLE_GOOGLE_CALENDAR`／`ENABLE_GOOGLE_CALENDAR_INBOUND` |
| 多重／週期提醒 | migrations 到 `0019`、`ENABLE_REMINDERS`、選填 `REMINDER_OFFSETS` |
| 每日天氣 | `0010`、每分鐘 Supabase Cron、`ENABLE_WEATHER`／`ENABLE_WEATHER_PUSH` |

先執行 `npm run db:migrate`，再設定 Cron／OAuth，最後開 flags 並 Redeploy。完整步驟見[開始使用](./getting-started.md)。

## Google Calendar OAuth

| 變數 | 說明 |
| --- | --- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Web application OAuth client；只放 Sensitive env |
| `GOOGLE_OAUTH_REDIRECT_URI` | 完整 HTTPS callback，必須與 Google Cloud Authorized redirect URI 完全一致 |
| `GOOGLE_CALENDAR_ID` | 預設 `primary`；指定日曆必須由使用者擁有 |
| `GOOGLE_OAUTH_STATE_TTL` | 一次性 state / PKCE verifier TTL，預設 600 秒 |

Calendar scope 僅為 `calendar.events.owned`；開啟 `ENABLE_GOOGLE_TASKS` 時才追加 `tasks` scope。Client secret、Database URL、CA、encryption key 與 Google token 不得提交到 Git、貼入 issue 或寫進文件。

## 狀態儲存邊界

6.0 的啟用狀態、行程、任務、提醒偏好、OAuth state、加密憑證、processed events 與 jobs 都以 Supabase Postgres 為唯一 durable authority。`bot_sources` 只存 HMAC key，不存原始 LINE id／名稱；原始對話仍只在短期 process memory。
