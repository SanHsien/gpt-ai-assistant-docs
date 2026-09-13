---
title: 疑難排解
---

# 疑難排解

## Bot 完全沒有回覆

1. LINE Developers 的 **Use webhook** 是否開啟。
2. Webhook URL 是否為正式網域加 `/webhook`。
3. Vercel 是否有 LINE／OpenAI、`DATABASE_URL`、`DATABASE_SSL_CA`、`DATA_ENCRYPTION_KEY`，以及已啟用能力所需的 key（預設搜尋需 `SERPAPI_API_KEY`）。
4. 修改環境變數後是否 Redeploy。
5. LINE 官方 Auto-reply / Greeting 是否已關閉。
6. 群組若啟用 `GROUP_REPLY_REQUIRES_MENTION=true`，是否有 mention bot。

## Webhook 回 403

通常是 LINE signature 不符：確認 `LINE_CHANNEL_SECRET` 來自同一個 Messaging API channel，且沒有多餘空白。不要關閉簽章驗證。

## Webhook 回 500／503

6.0 會在必要設定缺失、DB 不可用、事件沒有 `webhookEventId` 或 migration 未到 `0018_durable_sources.sql` 時刻意 fail closed。執行 `npm run db:migrate`、`npm run db:preflight` 並 Redeploy；查 Vercel Function Logs 時不要貼 token 或完整對話。

## 同一則訊息一直重複回覆

6.0 會把原始 delivery／redelivery 都送進 Postgres，以 `webhookEventId` 唯一鍵原子去重；不使用 per-instance Set。若仍重複：

1. 確認部署版本為 v6.0.0-rc.1 以上且 `schema_migrations` 到 `0018`。
2. 關閉 LINE 官方 Auto-reply。
3. 確認只有一個 deployment 接收同一 channel webhook。
4. 查 log 是否為相同 event ID；不要反覆手動重送 webhook 測試。

重複事件可能重複消耗 OpenAI token 或生圖費用，應先停用相關 feature flag 再查。

## Quick Reply 或圖文選單沒有完整出現

Quick Reply 最多 13 個，會依目前啟用的功能縮減，並由 LINE client 顯示成單列橫向捲動；新訊息出現後舊按鈕也會消失。傳送 `指令` 才是完整功能入口，應收到依啟用功能分組的文字清單與範例，不是只有四個維護按鈕的舊選擇框。

圖文選單只支援 iOS／Android LINE，不會出現在 Windows／macOS。手機仍看不到時，確認 LINE Official Account Manager 的顯示期間與預設展開設定，並檢查是否有 Messaging API 建立的 per-user／default rich menu 蓋過後台選單。若點圖文選單後同時收到兩種回覆，關閉 LINE 後台同名的關鍵字 Auto-reply，只保留文字動作送到 webhook bot。

## `The model 'dall-e-3' does not exist`

舊模型設定覆蓋了新預設。移除或改成：

```dotenv
OPENAI_IMAGE_GENERATION_MODEL=gpt-image-2
OPENAI_IMAGE_GENERATION_QUALITY=low
```

重新部署後再測。

## `Cannot use public access on a private store`

目前程式使用 private upload，不應再出現此錯誤。確認版本至少 v4.12.3，Vercel 已連結 private Blob store，且沒有部署舊 commit。

## `No blob credentials found`

先確認 Vercel 專案已連結 Blob store（OIDC 路線）。仍失敗時產生 Read-Write Token，設定 `BLOB_READ_WRITE_TOKEN` 並 Redeploy。

## OpenAI 回 400

常見原因是模型不存在、帳號沒有權限、參數與模型不相容，或圖片尺寸／品質不支援。先移除自行覆寫的模型環境變數，回到 repo 預設，再依 OpenAI response body 查問題。

## OpenAI 或 LINE 回 429

表示 rate limit 或 quota。檢查 OpenAI API billing／project limit、LINE quota 與 SerpAPI 額度。可先關閉高成本能力，並避免自動重試無限循環。

## 「連結Google行事曆」卻回一般聊天內容

部署必須包含 `cd50dad` 或更新版本；該修正讓含／不含空格及「連接／綁定／授權」變體直接進 OAuth handler。更新後 Redeploy，再重新傳送 `連結Google行事曆`，不要用「繼續」延續先前誤進 OpenAI 的對話。

## Bot 說已建立，但 Google Calendar 看不到

v4.13.1 起不再先說「已建立，正在同步」；只有 Google 實際成功才回「已同步」。未授權或舊版路徑只會把確認後的 event 寫到 Supabase `events`；Vercel 不保存行程資料。依序檢查：

1. `ENABLE_SCHEDULE=true`、`ENABLE_GOOGLE_CALENDAR=true`，且變更後已 Redeploy。
2. Supabase 已套用 `0004_google_calendar.sql`。
3. Google Calendar API 已啟用，OAuth redirect URI 與 `GOOGLE_OAUTH_REDIRECT_URI` 完全一致。
4. OAuth app 若為 Testing，實際帳號已加入 test users；長期使用建議發布為 In Production，避免 refresh token 7 天到期。未驗證個人 app 首次授權需在警告頁展開「進階」後繼續。
5. LINE 的「前往 Google 授權」已完成，沒有停在 Google 錯誤頁。
6. `REMINDER_CRON_SECRET` 與 Supabase Vault 一致，`npm run db:configure-reminders` 已建立每分鐘 Cron；這個 worker 也負責 Calendar retry。

## Google 同步最終失敗後怎麼處理

預設最多 3 次。內部 backoff 是 5 秒、10 秒，但沒有新 webhook 時由每分鐘 Cron 唤醒，因此通常約 2 分鐘內完成三次。系統不會每次失敗都詢問；只在最終失敗發一則：

- **重試同步**：建立新的 3 次週期。
- **暫不處理**：保留 Supabase `events` 資料，不再詢問，不會自動刪除。
- **刪除行程**：只有明確選擇才刪；已有 Google 映射時也刪 Google 事件。

稍後可傳 `同步失敗行程` 找回保留資料，再點重試或刪除；也可手動傳 `重試同步 <ID>`、`暫不處理 <ID>` 或 `刪行程 <ID>`。`jobs.status='dead'` 與 `events.sync_status='error'` 可協助管理者查錯；不要直接刪整張 `events` 表。

## 沒有追問模糊時間，或「修改行程」失敗

確認版本是 v4.20.2 以上，且 Supabase 已套用 `0006_schedule_workflows.sql`。v4.20.1 在 UTC 跨日後可能把「明天下午」排成當天 15:00；v4.20.2 起應保留正確的明天日期並追問幾點。追問只保存結構化草稿，TTL 內的下一句會自動延續；若草稿過期就需重新輸入。修改只能選 bot 在 Supabase 有映射的行程；Google 中外部建立且未回收到本機的 event 尚不在可修改列表。

## 行程時間到了但沒有提醒

依序檢查：Supabase 已套用 `0005_reminders_and_completion.sql`、Vercel 已設 `ENABLE_REMINDERS=true` 與至少 32 字元的 `REMINDER_CRON_SECRET` 並 Redeploy、`npm run db:configure-reminders` 已成功，以及 Supabase Cron History 每分鐘有 `gpt-ai-assistant-reminders` 紀錄。`jobs` 應有 `kind='line-reminder'`；`dead` 的 `last_error` 可分辨 LINE 4xx、額度或 target 問題。提醒是 LINE Push，會計入月額度。

若使用 `安靜時段`、`暫停提醒`或 `恢復提醒`，還要確認 `0009_reminder_prefs.sql` 已套用。暫停期間到點的提醒會跳過且不補發；安靜時段會延後到時段結束。

## 任務或天氣回覆「此功能目前已停用」

確認已部署 v5.13.0 並 Redeploy。任務需 `0007_tasks.sql`、`0008_task_metadata.sql`與 `ENABLE_TASKS=true`；天氣需 `ENABLE_WEATHER=true`。`我的任務 今天／今日` 只列今天，`明天／明日` 只列明天，舊過期任務請用 `我的任務 逾期`。一週固定週一開始、週日結束，並支援本週與下週；未知篩選會顯示可用選項。

## 任務為什麼沒有出現在 Google 日曆

這是預期行為：任務不會建立 Google Calendar 行程。它以 Supabase 助理待辦為權威；開啟 `ENABLE_GOOGLE_TASKS`、套用 migrations 並重新授權 Tasks scope 後才會同步到 Google Tasks；另開 `ENABLE_GOOGLE_TASKS_INBOUND` 才回收 Google 端完成／重開、刪除、標題與備註。若要精確時間出現在日曆，請改用 `記行程` 或 `行程`；Google Tasks API 只保存期限日期。

若 LINE 顯示已排入 Google Tasks 同步，但 Tasks 一直沒有資料，先到 Google Cloud 同一個 OAuth project 的「API 和服務 → 已啟用的 API 和服務」確認 **Google Tasks API** 已啟用。OAuth 同意畫面有 Tasks 權限不代表 API 已啟用。若曾因此產生 `sync_status='error'`／dead job，啟用 API 後重新傳送 `連結 Google 行事曆`；`rc.5` 會安全重排同一 sync job，不會建立第二筆任務。

## 「星期五」被排到哪一週

裸 `星期五`／`週五` 取下一個尚未跨過的同名日；`本週`／`這週`／`這個星期` 固定本週，`下週`／`下個星期` 固定下一週。明確寫 `這週二` 時，即使週二已過也不會自動改到下週；確認卡會顯示實際日期，確認前請先核對。

不要用公開 issue 傳 OAuth code、Client Secret、Database URL 或 token。

## ChatGPT 訂閱可以取代 API key 嗎？

不可以。ChatGPT Plus／Pro 與 OpenAI API 分開計費；本 bot 必須使用 OpenAI Platform API key。

## 如何回報問題

到 [GitHub Issues](https://github.com/SanHsien/gpt-ai-assistant/issues) 提供：

- commit 或版本號；
- 觸發步驟；
- 已遮罩 secrets 與個資的錯誤訊息；
- Vercel / 本機執行環境；
- 是否只在 LINE 群組、語音、圖片或生圖發生。

不要貼 API key、LINE token、channel secret、完整 user ID 或私人對話。
