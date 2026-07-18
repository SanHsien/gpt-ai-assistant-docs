---
title: 開始使用
---

# 開始使用

## 準備項目

1. GitHub 與 Vercel 帳號。
2. LINE Developers 的 Messaging API channel。
3. OpenAI Platform API key 與 API billing。
4. SerpAPI key（預設搜尋開啟；不使用時設 `ENABLE_SEARCH=false`）、選用 Vercel Blob store（GPT Image 生圖）。
5. 6.0 必要：Supabase Postgres；Google Calendar／Tasks 另需 Google Cloud 專案與 OAuth client。

## 部署到 Vercel

1. Fork [SanHsien/gpt-ai-assistant](https://github.com/SanHsien/gpt-ai-assistant)。
2. 在 Vercel 匯入 fork，Framework Preset 維持自動偵測。
3. 在 **Settings → Environment Variables** 至少設定：

```dotenv
APP_DEBUG=false
OPENAI_API_KEY=...
LINE_CHANNEL_ACCESS_TOKEN=...
LINE_CHANNEL_SECRET=...
```

4. 部署後取得穩定網域，例如 `https://your-project.vercel.app`。
5. 在 LINE Developers → Messaging API 設定 webhook：

```text
https://your-project.vercel.app/webhook
```

6. 開啟 **Use webhook**，關閉 LINE 官方的 Auto-reply 與 Greeting messages。
7. 使用 **Verify** 確認 webhook 可達，再加 bot 好友實測文字對話。

`LINE_CHANNEL_SECRET` 不可留空；缺少時服務會 fail closed，不接受 webhook。

## LINE 圖文選單（選用）

Quick Reply 會隨 bot 回覆出現、由 LINE 排成單列橫向捲動；若希望手機版一直有兩列常用入口，可在 [LINE Official Account Manager](https://manager.line.biz/) 手動建立大型 3×2 圖文選單。這不是部署前置條件，也不需要新增環境變數。

| 上左 | 上中 | 上右 | 下左 | 下中 | 下右 |
| --- | --- | --- | --- | --- | --- |
| 新增行程<br>`記行程` | 我的行程<br>`我的行程` | 天氣<br>`天氣` | 新增任務<br>`新增任務` | 我的任務<br>`我的任務` | 更多功能<br>`指令` |

六區的動作類型都選「文字」，傳送上表反引號內的內容。聊天優先可將選單預設收合，新手導覽可預設展開。不要再建立同名的「關鍵字自動回應」，否則可能和 webhook bot 同時回覆。Rich menu 只在 iOS／Android LINE 顯示，不支援 Windows／macOS；若未顯示，也要檢查 Messaging API 建立的 per-user／default rich menu 是否蓋過後台選單。詳細限制見 [LINE Quick Reply](https://developers.line.biz/en/docs/messaging-api/using-quick-reply/)、[Rich menus overview](https://developers.line.biz/en/docs/messaging-api/rich-menus-overview/) 與[台灣圖文選單手冊](https://tw.linebiz.com/manual/line-official-account/oa-manager-richmenu/)。

## 啟用生圖

`gpt-image-2` 回傳 base64 圖片，必須轉成 LINE 可讀的 HTTPS URL：

1. 在 Vercel 專案連結一個 **private Vercel Blob store**。
2. 新版 Vercel 會注入 `BLOB_STORE_ID` 並使用 OIDC，不一定需要靜態 token。
3. 若 log 顯示 `No blob credentials found`，再設定 `BLOB_READ_WRITE_TOKEN`。
4. 預設模型 `gpt-image-2`、品質 `low`；可在環境變數調整。

程式會 private upload，再產生限時 signed URL 給 LINE；不要把 store 改成 public。

## 設定 durable-only runtime 與行程

1. 建立 Supabase Postgres，使用 serverless transaction pooler URL。
2. 在 Vercel Production 以 Sensitive env 設定 `DATABASE_URL`、`DATABASE_SSL_CA`、`DATA_ENCRYPTION_KEY`。
3. 在 fork 的本機目錄把上述三個值放進未追蹤的 `.env`，執行 `npm ci` 與 `npm run db:migrate`。
4. 執行 `npm run db:preflight`，再到 Supabase SQL Editor 查 `schema_migrations`，確認最後一筆是 `0018_durable_sources.sql`。migration runner 會保存 SHA-256；不要只貼 DDL 而漏掉 migration 紀錄。
5. 在 Vercel Production 依需要啟用 `ENABLE_SCHEDULE=true`、`ENABLE_TASKS=true` 與 `ENABLE_WEATHER=true`，然後 **Redeploy**。6.0 固定使用 durable queue，沒有 `APP_WEBHOOK_QUEUE`。

`0010` 是天氣訂閱、`0011` 是 Google Tasks outbound、`0012`／`0013` 是 Calendar inbound、`0014`／`0016` 是 Tasks inbound，`0015`／`0017` 收斂提醒索引，`0018` 將 bot source 啟停狀態移入 Postgres。必須先套用 migration，再部署 6.0。

若啟用 `ENABLE_GOOGLE_TASKS=true`，既有僅授權 Calendar 的帳號必須重新傳送「連結 Google 行事曆」授予 Tasks scope；callback 會自動回填既有未同步任務。

## 啟用每分鐘 worker 與到點提醒

1. 產生至少 32 字元的隨機 `REMINDER_CRON_SECRET`，放入 Vercel Production Sensitive env。
2. 在本機暫時設定相同 secret、`DATABASE_URL`／`DATABASE_SSL_CA`，以及 `REMINDER_CRON_URL=https://你的正式網域/cron/reminders`。
3. 執行 `npm run db:configure-reminders`；URL 與 secret 會加密保存在 Supabase Vault，Cron 每分鐘觸發一次。此 worker 同時處理提醒、Google Calendar 同步重試與最終狀態通知。
4. 設 `ENABLE_REMINDERS=true` 並 Redeploy。行程有時間時在開始時間提醒；整天行程在當日 09:00 提醒。
5. 到 Supabase Cron Jobs／History 確認 `gpt-ai-assistant-reminders` 為 active，而且每分鐘成功呼叫正式 `/cron/reminders`；只看到 job 存在不等於 worker 已成功執行。

提醒使用 LINE Push API，會計入月額度。不要把 secret 貼進 SQL、文件、issue 或聊天。

提醒偏好指令包含 `暫停提醒`、`恢復提醒`與 `安靜時段 22:00-07:00`。暫停期間到點的提醒不補發；恢復只影響之後到點的新提醒。

## 啟用 Google Calendar

1. 在 Google Cloud 啟用 **Google Calendar API**；要同步任務時也啟用 **Google Tasks API**。設定 External OAuth consent screen。短期測試可加入 test user；長期 Calendar 存取應發布為 **In Production**，否則授權與 refresh token 會在 7 天後到期。少於 100 位使用者的個人用途可暫不送驗證，但首次授權會顯示警告且有 100 位新使用者上限。
2. 建立 **Web application** OAuth client，Authorized redirect URI 設為 `https://你的正式網域/oauth/google/callback`。
3. 在 Vercel Production 設定 `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`、`GOOGLE_OAUTH_REDIRECT_URI`；全部使用 Sensitive env。
4. 確認 `0004_google_calendar.sql` 已套用；Tasks outbound 另需 `0011`，Tasks inbound 需 `0014`／`0016`，Calendar inbound 另需 `0012`／`0013`。
5. 設 `ENABLE_GOOGLE_CALENDAR=true`；需要 Tasks outbound 設 `ENABLE_GOOGLE_TASKS=true`，需要 Tasks inbound 再設 `ENABLE_GOOGLE_TASKS_INBOUND=true`；Calendar timed inbound 則設 `ENABLE_GOOGLE_CALENDAR_INBOUND=true`，然後 Redeploy。6.0 部署前 migration 必須到 `0018`。
6. 在 LINE 傳 `連結 Google 行事曆` 或 `連結Google行事曆`，按「前往 Google 授權」。每次新增 scope（例如首次開 Tasks）都必須重新連結；callback 會回填既有未同步任務。授權完成後，新增、`修改行程`、`我的行程`、完成與刪除才會操作 Google Calendar。
7. 確認每分鐘 worker 已依上一節完成設定。Google 同步預設最多 3 次，成功後才回覆；最終失敗才顯示重試、暫不處理與刪除。Calendar inbound 預設最多需等待約 5–6 分鐘才會在 LINE 查詢反映。

不要把任何真實 key、client secret、Database URL、CA、encryption key 或 token 貼入文件、issue、commit 或聊天記錄。

## Production 上線檢查

1. 正式根網址回 `200`，且顯示預期版本。
2. LINE Developers 的 webhook Verify 成功，文字對話只回覆一次。
3. Supabase `schema_migrations` 最後一筆等於 repo 最新 migration，Cron History 每分鐘成功。
4. Vercel 改過任何 env 後已 Redeploy，Function Logs 沒有 DB TLS、OAuth 或 cron `401`／`503`。
5. 在 LINE 重新連結 Google，建立一筆測試行程與一筆測試任務，分別確認 Google Calendar 與 Google Tasks 各只有一筆。

## 本機開發

需要 Node.js 24（與 CI、Vercel 及 Docker image 一致）。

```bash
git clone https://github.com/SanHsien/gpt-ai-assistant.git
cd gpt-ai-assistant
npm ci
cp .env.example .env
npm run dev
```

本機 webhook 需要公開 HTTPS，可用 ngrok 或 cloudflared 暫時轉送 `APP_PORT`（預設 3000）。

修改後至少執行：

```bash
npx eslint .
npm test
```

## Docker

Repo 保留 Node 24 `Dockerfile` 與 `docker-compose.yaml`。先從 `.env.example` 建立不納入 Git 的 `.env` 並填完必要值，再執行 `docker compose up --build`；Compose 會把 `.env` 注入 container，`APP_PORT` 未設定時使用 `3000`。image 只安裝 production dependencies 並以非 root 使用者執行。Docker 並不免除公開 HTTPS webhook、Supabase、LINE credentials 與 OpenAI API key 的需求。

## 更新

Vercel 連結 GitHub `main` 後，每次 push 會自動部署。更新前先查看 [CHANGELOG](https://github.com/SanHsien/gpt-ai-assistant/blob/main/CHANGELOG.md)，並確認新增的環境變數；修改環境變數後需 Redeploy 才生效。
