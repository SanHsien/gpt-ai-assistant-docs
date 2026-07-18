---
title: 更新摘要
---

# 更新摘要

## v6.0.0-rc.7（2026-07-18）

- 進階提醒實機送達時發現 Google Calendar inbound 偶發拖滿 Vercel 60 秒；Google token／API 呼叫現在預設 10 秒 timeout。
- Cron drain 預設最多執行 45 秒，剩餘 durable jobs 延到下一分鐘，避免慢 provider 阻塞提醒。

## v6.0.0-rc.6（2026-07-18）

- 修正週期行程的明確鐘點可能被重複套用 UTC offset；數字與中文鐘點都依使用者時區鎖定，當日已過則從次日開始。
- `每天／每週／每月／每年` 開頭可直接進行程流程；確認摘要明列重複頻率、間隔、次數與截止日。

## v6.0.0-rc.5（2026-07-18）

- 真實 LINE／Google Tasks 驗收確認：OAuth Tasks scope 不會自動啟用 Google Tasks API；部署文件、設定與疑難排解現在都把「在同一 Google Cloud project 另行啟用 Tasks API」列為必要前置。
- 修復永久設定錯誤排除後無法重試同一 Tasks sync job：重新連結 Google 時可安全重排相同 idempotency key 的 dead job，不建立任務複本。

## v6.0.0-rc.4（2026-07-18）

- 升級 Express 5.2、Jest 30.4 與 ESLint 10 flat config，完整 71 suites／497 tests 通過。
- `bot-sources` 改為明確注入 repository；production 不再含 `APP_ENV === 'test'` 記憶體分支。
- Docker／Compose 在缺少或空白 `APP_PORT` 時使用 `3000`，新增 `/health/live`、image healthcheck 與 CI production image build/run smoke。
- 本版不改 LINE 指令或 durable 資料契約；正式 `6.0.0` 的 LINE／Google 集中驗收範圍不因此增加。

## v6.0.0-rc.3（2026-07-18）

- 主程式 repo 的公開 Git 歷史以目前獨立維護快照重新初始化為單一 root commit；MIT、原作者 attribution 與產品 CHANGELOG 持續保留。
- Google OAuth 完成／錯誤頁會跟隨 `APP_LANG`；補齊英／日殘留翻譯與日文上限錯置訊息。
- Runtime 與 Docker 統一 Node 24，容器改以 production dependencies 及非 root 使用者執行，並修正 Compose 未注入 `.env` 的缺口。
- 更新既有 major 內相依套件，維持 0 個高風險漏洞；破壞性 major 更新留待 6.x 分批遷移。
- 啟用獨立 repo 的 Issues 並補齊問題範本，讓 bot 的「回報」入口可實際使用。

## v6.0.0-rc.2（2026-07-18）

- 一般訊息改為依已啟用功能顯示最多 13 個常用 Quick Reply；LINE 以單列橫向捲動呈現。
- 「指令」改為實際分組完整清單、輸入格式與範例，不再只顯示四個維護按鈕。
- 補上選用 3×2 LINE 圖文選單的完整設定、手機／PC 限制、顯示優先序與避免重複自動回覆的注意事項。
- 明確標示 `zh_TW` 為正式支援語系，`en`／`ja` 為實驗性，`zh_CN` 目前仍共用繁體字串。

## v6.0.0-rc.1（2026-07-18）

- 6.0 固定使用 Supabase durable queue，移除同步 fail-open、process-memory redelivery filter、Vercel env storage 與 `APP_WEBHOOK_QUEUE`。
- 新增 `0018_durable_sources.sql`、runtime config／migration preflight 與 `npm run db:preflight`；DB、必要 key 或 migration 不可用時 webhook 回 `5xx` 讓 LINE 重送。
- Google Calendar／Tasks scopes、能力與 inbound 衝突政策收斂為可測 contract；全天 Calendar inbound、recurrence exception、Google-origin 建立與 Tasks due 回收仍不支援。
- `SERPAPI_API_KEY` 已納入預設搜尋的正式前置條件；本維護者 Production 已設為 Sensitive env，並已套用 `0018`、核對 checksum 與確認 `bot_sources` RLS 啟用。
- Production RC health、`5.13.0` ↔ RC 回滾往返與 Supabase 每分鐘 Cron／HTTP 200 已實際通過；正式版只剩集中 LINE／Google 驗收。

## v5.13.0（2026-07-17）

- 修正 Google Tasks inbound 先推進水位造成失敗時間窗永久漏同步；改成 API 全部成功後才提交，worker crash 會由 claim lease 到期後重抓。
- 到點、提前與週期提醒統一由同一排程服務建立／取消。Google 端改時間會重排全部提醒，關閉提醒旗標後修改也會清舊 job；月底／閏年 recurrence 改用 RFC 5545 `rrule`。
- `天氣 嘉義`／`天氣 新竹` 可確實選市或縣；provider 找不到其他地點時提示改用「鄉鎮＋縣市／國家」或附近城市，不猜座標。
- Schema 最新為 `0017`；5.x 繼續相容改善，`6.0.0` 只留給 durable-only 等 breaking 架構收斂。
- 專案與文件站改為獨立維護 repository，但永久保留原作者、MIT 與來源致謝。

## v5.12.0（2026-07-17）

- 週期行程現在**每個 occurrence 都提醒**：「每週一開會」等週期行程，每次到期都會提醒，觸發後自動排下一次（受重複次數／結束日期收斂）。修正了先前開啟通知去重後、週期行程只有第一次有提醒的缺口。修改週期行程會清掉舊的整串提醒再重排。

## v5.11.0（2026-07-17）

- 多重（提前）提醒：以 `REMINDER_OFFSETS`（如 `60,1440`＝提前 1 小時與 1 天）在到點提醒外，額外於多個提前時刻各提醒一次，訊息會標示提前量。預設關閉＝維持單一到點提醒。

## v5.10.0（2026-07-17）

- 從搜尋建立行程：搜尋答案含日期／時間時，答案下方會多一顆「📅 建立行程」，點下去把內容送進行程草稿流程，確認後才建立（不自動寫入、不繞過確認）。需開啟行程功能。

## v5.9.0（2026-07-17）

- Google Tasks 反向同步（`ENABLE_GOOGLE_TASKS_INBOUND`，預設關）：在 Google Tasks 端對 bot 建立的任務所做的完成／重開、刪除、標題、備註，會回收到助理待辦；期限（due）不回收，精確時間以本地為準。

## v5.8.1（2026-07-17）

- 修正 Google Tasks 期限因 UTC 跨日提早一天，現在依任務時區取當地日期。
- 重新授權 Tasks scope 後自動回填既有未同步任務；Tasks／Calendar 同步、完成與刪除補上 row lock。Google Tasks notes 另帶穩定同步標記並在新增前查重，避免遠端已建立但本機尚未存回 ID 時重試產生重複任務。
- Calendar inbound 維持 `singleEvents=true` 並保留省略的原時區；每日天氣跨 DST 仍在指定當地鐘點推播。

## v5.8.0（2026-07-17）

- Google Calendar 外部通知去重：開啟 LINE 提醒時，寫入 Google 的行程不再觸發 Google 自身的預設通知，LINE 提醒成為單一通知源，避免同一行程雙重提醒。未開 LINE 提醒則保留 Google 預設通知。

## v5.7.0（2026-07-17）

- 語音建立行程：用 LINE 語音說「記行程 …」，轉錄後走與文字相同的草稿確認流程；確認卡多一行「🎤 我聽到：…」讓你核對轉錄是否正確。
- 圖片（海報／票券）建行程確定不做，圖片維持看圖聊天。

## v5.6.0（2026-07-17）

- 加入 run trace 觀測：每次 AI 執行記錄能力／模型／token／估算成本／耗時／狀態（不含對話內容或憑證），成本可用 `OPENAI_PRICE_PER_1K_*` 估算。
- 補齊備份／還原與 worker 崩潰恢復演練文件，可靠性基礎（Phase 0）全項完成。

## v5.5.0（2026-07-17）

- Google Calendar 反向同步（修改）：在 Google 端改動 bot 建立的「非週期、有時刻」行程（時間／標題／地點／備註）會回收到本地並依新時間重排提醒。若你剛用 bot 改過同一筆、尚未推上去，則以 bot 的版本為準。

## v5.4.0（2026-07-17）

- Google Calendar 反向同步（刪除，`ENABLE_GOOGLE_CALENDAR_INBOUND`，預設關）：在 Google 刪除 bot 建立的行程會回收到本地並一併停掉提醒。以 sync token 每分鐘輪詢，重用既有排程。

## v5.3.0（2026-07-17）

- Google Tasks 單向同步（`ENABLE_GOOGLE_TASKS`，預設關）：新增／完成／重開／刪除任務同步到 Google Tasks，與 Google Calendar 共用 OAuth（既有使用者重新「連結 Google 行事曆」以加上 tasks 權限）。同步失敗保留本機任務。

## v5.2.0（2026-07-17）

- 搜尋結果附「📎 來源」清單（標題／來源站／時間／連結）。來源只顯示、不進 prompt，區分來源事實與模型整理。

## v5.1.0（2026-07-17）

- 每日天氣訂閱推播（`ENABLE_WEATHER_PUSH`，預設關）：`每日天氣 台北 8` 訂閱每天指定時刻推播、`取消每日天氣`、`我的天氣訂閱`。重用既有排程，不另建 cron。

## v5.0.2 / v5.0.1（2026-07-17）

- 天氣自然語句路由：`今天天氣 嘉義`、`台北天氣如何` 也能命中天氣查詢。
- 同名地點追問：`天氣 嘉義` 等同名不同區時回傳座標選項讓你點選，不再靜默選第一筆。

## v5.0.0（2026-07-17）

- Phase 1 行程、Phase 2 任務與 Phase 3 提醒均完成真實 LINE 閉環，正式達成 M1 個人助理里程碑。
- 任務新增與重開會明示目前只儲存在助理待辦，尚未同步 Google Tasks，也不會建立 Google 日曆行程。
- Google Tasks 同步保留為下一個獨立 5.x 版本；週期／批次行程、多重提醒與 Google inbound sync 也不冒充本次已完成範圍。

## v4.20.5（2026-07-17）

- 修正 `行程 <內容>` 未進入結構化行程流程、誤落一般對話；`行程 5分鐘後的測試通知` 現在會先顯示草稿，確認後建立行程並沿用到點提醒。
- 記錄上游 `d84c806` 已包含在本 fork，以及目前不安排回貢低活躍上游的決策。

## v4.20.4（2026-07-17）

- `我的任務 明天／明日` 改為使用者時區的真正明日範圍；今天／今日維持當日範圍。
- 本週固定週一開始、週日結束；新增本星期／下星期等清單別名，只有本週／下週而沒有星期幾的新增任務，期限固定為對應週日 09:00。未知篩選不再退回全部任務。
- 修正 LINE 句尾標點被存進 `#標籤`；查詢相容既有帶句號資料。
- Google Calendar 解除連結與重新授權均通過真實 LINE 驗收。
- 參考資料補上 Toki（前身 Dola）現行官網、官方更新、品牌演進、Dola note 與 LINE VOOM 入口。

## v4.20.3（2026-07-17）

- 行程／任務清單點選第 N 筆操作時，LINE 可見回覆會帶當次列表序號；內部 ID 仍不顯示。
- 任務的「今天／明天／後天」期限改用使用者時區做確定性校正，避免 UTC 跨日錯一天。
- `天氣 台北` 這類台灣常用縣市簡稱會自動補足行政區與國家後重試，回覆地名也正規化為「臺北市、臺灣」。

## v4.20.2（2026-07-17）

- 「明天」改為依使用者 IANA 時區先算出確切日期，避免 UTC 跨日時排成當天。
- 只說「下午／晚上／上午」而沒有鐘點時，bot 必須追問幾點，不再接受模型擅自補的 15:00 等時間。

## v4.20.1（2026-07-16）

- 修正任務「今天／本週」篩選會夾帶舊過期任務的問題，並讓 `TASK_LIST_LIMIT` 實際生效。
- 天氣回覆新增 Open-Meteo attribution。
- Production 已套用 `0007`–`0009`，M1 基線進入真實 LINE 驗收；`5.0.0` 待行程、任務、提醒閉環通過後再發布。

## v4.15.0–v4.20.0（2026-07-15–16）

- Phase 2 任務：新增、分頁列表、期限／優先度／標籤／狀態篩選、完成／重開／刪除。
- Phase 3 偏好：安靜時段、暫停／恢復、過期提醒跳過。
- Google Calendar 解除連結／token revocation。
- Phase 6 查詢基線：Open-Meteo 現況、1–7 日預報與短期 cache。

## v4.14.0（2026-07-15）

- 模糊時間改為 durable 結構化追問；下一句可繼續草稿，不存原始對話。
- 新增 `修改行程`、確認後套用、optimistic version 防過時覆蓋與行程重疊警告。
- 修改 bot 管理的行程後會重排提醒，並以 durable Google Calendar PATCH 回寫。
- 新增 `0006_schedule_workflows.sql`；同一使用者的 webhook batch 改為保持事件順序。

## v4.13.2（2026-07-15）

- 修正提醒的完成按鈕把 Google event id 當 PostgreSQL UUID，導致完成失敗且無法回寫 Google Calendar 的問題。
- 行程確認、完成、刪除與同步處理按鈕改用 LINE postback；聊天畫面不再顯示 confirmation token、Supabase UUID 或 Google event id。
- 帶 `<ID>` 的純文字指令保留為排錯備援，postback 內部資料不寫入對話 history。

## v4.13.1（2026-07-15）

- 建立 Google Calendar 行程時不再發過渡訊息；Google 實際同步成功後才通知。
- Supabase 每分鐘 worker 新增 Calendar 同步與狀態 jobs，三次嘗試不再需等新 webhook 唤醒。
- 最終失敗提供「重試同步／暫不處理／刪除行程」。暫不處理保留 Supabase 資料且不再詢問；可從「同步失敗行程」稍後重試或刪除。

## v4.13.0（2026-07-15）

- Supabase Postgres durable queue、跨 instance webhook 冪等與 AI／LINE delivery checkpoints。
- 自然語言行程草稿、確認／取消、個人時區、查詢與一鍵刪除。
- Google Calendar Web OAuth、最小 `calendar.events.owned` scope、加密 token、單向新增及直接查詢／刪除。
- `連結Google行事曆` 等無空格及常見變體會直接進 OAuth，不再誤用一般 OpenAI 對話。
- 日期開頭敘述會直接進行程；星期／週先由程式決定本週或下週，不交給模型猜。
- 新增完成行程、Google 完成 metadata，以及 Supabase Cron 驅動的到點 LINE 提醒；Push retry key 防止重複送達。
- 維護者的 External OAuth app 已發布為 In Production，避免 Testing 模式的 refresh token 7 天到期；目前仍是少於 100 位使用者的未驗證個人用途。

## v4.12.3

- GPT Image 使用 private Vercel Blob upload 與限時 signed URL。
- LINE redelivery 與重複 `webhookEventId` 只處理一次，避免重複付費與回覆。

## v4.12.2

- 生圖預設改為 `gpt-image-2`、`low`。
- Image API timeout 與 Vercel function duration 調整為適合 GPT Image。
- 網址摘要改用 HTML parser，修正 CodeQL alerts。

## v4.11.0

- 新增預設關閉的網址摘要功能與 SSRF 防護。

## v4.10.x

- 升級對話與語音模型。
- 新增 feature flags、對話 TTL、群組 mention policy、Push fallback、CodeQL、CI 與多項 production 修正。

完整、逐版本紀錄見 [主 repo CHANGELOG](https://github.com/SanHsien/gpt-ai-assistant/blob/main/CHANGELOG.md)。
