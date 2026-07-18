---
title: 功能與指令
---

# 功能與指令

## 目前能力

| 類別 | 功能 |
| --- | --- |
| 對話 | 日常對話、續寫、重試、清除上下文 |
| 文字處理 | 摘要、建議、安慰、鼓勵、分析、翻譯英文／日文 |
| 搜尋 | SerpAPI 網路搜尋與結果整理，回覆附「📎 來源」清單（標題／來源站／時間／連結；只顯示、不進 prompt）；答案含日期時可一鍵「建立行程」（走草稿確認） |
| 多模態 | LINE 語音轉文字、圖片理解、GPT Image 生圖 |
| 網址 | 選用的 SSRF-safe 網址摘要 |
| 群組 | 群組啟用／停用，可設定必須 mention 才回覆 |
| 行程 | 日期開頭自然輸入、確定性星期判斷、模糊時間追問、確認後修改、重疊警告、查詢、完成與刪除；**語音建行程**（轉錄後同一流程，確認卡回顯聽到的原文）；**週期行程**（「每週一開會」等，建立、同步 Google 並每個 occurrence 提醒） |
| 提醒 | 行程開始時主動 LINE Push；整天行程於當日 09:00，durable retry key 防重複；安靜時段、暫停／恢復；**多重（提前）提醒**（`REMINDER_OFFSETS`，如提前 1 小時／1 天） |
| Google Calendar | OAuth 後以 durable job 冪等新增／更新，每分鐘重試、最終狀態通知，並直接查詢／完成／刪除；**雙向同步**：inbound 以 sync token 輪詢回收 Google 端的刪除與 timed 行程修改，並與 LINE 提醒去重（避免雙重通知） |
| Google Tasks | **雙向同步**：`ENABLE_GOOGLE_TASKS` 時新增／完成／重開／刪除同步到 Google Tasks；`ENABLE_GOOGLE_TASKS_INBOUND` 時 Google 端的完成／重開、刪除、標題、備註也回收到本地（`due` 不回收，精確期限以本地為準；與 Calendar 共用 OAuth） |
| 任務 | 獨立保存於 Supabase 助理待辦；支援自然語言期限與優先度、標籤、分頁、今天／明天／本週／下週／逾期／已完篩選、完成／重開／刪除 |
| 天氣 | Open-Meteo 現況與 1–7 日預報，含台灣縣市簡稱、市／縣座標追問、找不到時的精確地名提示，以及每日訂閱推播 |
| 觀測 | run trace 記錄每次 AI 執行的能力／模型／token／估算成本／耗時／狀態（不含對話內容或憑證） |
| 系統 | 指令列表、版本、問題回報、文件、Vercel redeploy |

在 LINE 傳送「指令」會依該部署已啟用的 feature flags，回覆對話、搜尋、生圖、看圖、語音、行程、任務、提醒、天氣、每日天氣、Google、文字處理、系統與維護等分組；每組列出可直接輸入的格式與範例，未啟用的功能不會假裝存在。這取代了過去只有四個維護按鈕的選擇框。

一般回覆下方另有最多 13 個 Quick Reply，完整啟用時依序為：`記行程`、`我的行程`、`新增任務`、`我的任務`、`天氣`、`每日天氣`、`查詢`、`請畫`、`連結 Google 行事曆`、`暫停提醒`、`恢復提醒`、`忘記`、`指令`。LINE 只會顯示單列橫向捲動，bot 無法強制排成兩列；需要固定兩列入口可依[開始使用](./getting-started.md#line-圖文選單選用)設定選用的 3×2 圖文選單。

常用操作包括：

- 「聊天」：切回一般對話。
- 「繼續」／「重試」／「忘記」：管理對話上下文。
- 「畫」加描述：產生圖片。
- 「搜尋」加問題：查詢網路。
- 「總結」／「分析」／「翻譯英文」／「翻譯日文」：處理文字。
- 「啟用」／「停用」：切換目前 user 或 group 的 bot 狀態。
- 「版本」／「回報」／「文件」：系統資訊。
- `記行程 明天下午三點看診`：解析後先顯示草稿，確認才建立。
- `行程 5分鐘後的測試通知`：`行程` 可作簡短前綴，確認後建立 Calendar event，既有 reminder 會在開始時間推送。
- `7/20 下午三點牙醫回診`：日期開頭的敘述可直接進行程流程。
- `每天 22:40 例行檢查`、`每週五下午三點整理週報`：週期開頭的非問句也可直接進行程流程；明確鐘點依個人時區鎖定，確認卡會顯示重複頻率、間隔、次數或截止日。
- `記行程 明天下午看診`：「下午」太模糊，bot 只追問幾點；下一句延續 durable 結構化草稿，不存原始對話。只有日期沒有時間則視為整天。
- `星期五`／`週五` 取下一個同名日；`這週二`／`這個星期二`、`下週日`／`下個星期日` 依字面固定，不由模型猜週次。
- `我的行程`：列出近期行程並附完成、刪除按鈕；提醒訊息也可直接標記完成。
- `修改行程`：選擇 bot 管理的行程，下一句說明變更，確認後才套用並回寫 Google。期間已被更新的版本不會被舊草稿覆蓋。
- `設定時區 Asia/Taipei`：設定個人 IANA timezone。
- `連結 Google 行事曆` 或 `連結Google行事曆`：開啟 Google 授權；也接受「連接／綁定／授權」常見寫法。
- `同步失敗行程`：列出同步失敗但仍保留在 Supabase 的行程，每筆可重試或刪除。
- `重試同步 <ID>`：開始新的最多 3 次同步週期；成功或最終失敗才回覆。
- `暫不處理 <ID>`：保留本機行程、停止自動詢問，不會刪除資料。
- `刪行程 <ID>`：只有使用者明確點選或輸入時才刪除；若已同步，同時刪除 Google 事件與本機映射。
- `新增任務 明天交報告 #工作`：新增有期限與標籤的任務。任務保存於助理待辦、不建立 Google 日曆行程；若開啟 Google Tasks outbound／inbound 並授權，可雙向同步支援的欄位（同步失敗不刪本機任務）。
- `我的任務`、`我的任務 今天／今日`、`我的任務 明天／明日`、`我的任務 本週／本周／這個星期`、`我的任務 下週／下周／下個星期`、`我的任務 逾期`、`我的任務 已完`、`我的任務 #工作`：列表與篩選；完成、重開、刪除用列表按鈕。未知篩選會回覆可用選項，不會列出全部任務造成假成功。

任務週界固定為週一開始、週日結束。新增語句只有「本週／這週」而沒有星期幾時，期限固定為本週日 09:00；「下週」固定為下週日 09:00。今天／今日、明天／明日均依個人時區確定日期。句尾標點不屬於標籤，`#工作。` 會保存及查詢為 `#工作`。
- `安靜時段 22-8`、`安靜時段 關閉`、`暫停提醒`、`恢復提醒`：設定提醒偏好；暫停期間到點的提醒不補發。
- `天氣 台北`：查詢現況與預報；無歧義的台灣常用縣市簡稱會自動補足行政區與國家，不必先手動改成「台北市」。`今天天氣 嘉義`、`台北天氣如何` 這類自然語句也能命中（天氣詞在句首或句尾時辨識為隱式天氣意圖，需開啟 `ENABLE_WEATHER`）。
- `每日天氣 台北 8`、`取消每日天氣`、`我的天氣訂閱`：訂閱每天指定時刻推播天氣（需 `ENABLE_WEATHER_PUSH`），重用同一 scheduler 與 delivery，不另建排程。
- 語音建行程：直接用 LINE 語音說「記行程 明天下午三點看診」，轉錄後走與文字相同的草稿確認流程；確認卡會多一行「🎤 我聽到：…」讓你核對轉錄是否正確。

地名有供應商限制：同名不同區（如 `嘉義` 分屬嘉義市／縣）時，bot 會回傳以座標綁定的選項讓你點選，不再靜默選第一筆。`5.13.0` 已以確定性行政中心 fallback 支援 `天氣 嘉義縣`；其他找不到的地點請改用「鄉鎮＋縣市／國家」或附近城市，例如 `天氣 民雄 嘉義縣`。

行程確認、取消、完成、刪除與同步處理按鈕使用 LINE postback。對話顯示「確認行程」或「修改行程 2」、「完成行程 2」、「刪除行程 2」等自然文字；清單操作帶當次序號，confirmation token、Supabase UUID 與 Google event id 仍留在不可見的 postback data。

實際觸發詞由 repo 的 `app/commands/` 與 `locales/` 決定；文件不另外維護第二份可能過期的完整清單。

## 預設模型

| 功能 | 預設 |
| --- | --- |
| 對話 | `gpt-4o-mini` |
| 圖片理解 | `gpt-4o` |
| 語音轉文字 | `gpt-4o-mini-transcribe` |
| 生圖 | `gpt-image-2`、`low` |
| 搜尋 | SerpAPI |

模型都可用環境變數覆寫。新模型名稱與參數可能變動，切換前應查 OpenAI 官方文件並做實際 smoke test。

## 成本與安全控制

- `ENABLE_IMAGE_GENERATION`
- `ENABLE_TRANSCRIPTION`
- `ENABLE_VISION`
- `ENABLE_SEARCH`
- `ENABLE_URL_SUMMARY`（預設關）
- `GROUP_REPLY_REQUIRES_MENTION`（預設關）
- `APP_MAX_PROMPT_AGE`（預設 0，不自動過期）
- `ENABLE_SCHEDULE`、`ENABLE_REMINDERS`、`ENABLE_GOOGLE_CALENDAR`、`ENABLE_GOOGLE_CALENDAR_INBOUND`、`ENABLE_TASKS`、`ENABLE_GOOGLE_TASKS`、`ENABLE_GOOGLE_TASKS_INBOUND`、`ENABLE_WEATHER`、`ENABLE_WEATHER_PUSH`（程式預設關閉，需完成對應資料庫／Cron／OAuth 前置設定；durable queue 在 6.0 固定啟用）
- `REMINDER_OFFSETS`（多重提前提醒的分鐘清單，如 `60,1440`；預設空＝只有到點提醒）
- `OPENAI_PRICE_PER_1K_PROMPT`／`OPENAI_PRICE_PER_1K_COMPLETION`（選填；設定後 run trace 才估算 `cost_usd`，否則只記 token 數）

6.0 固定以 Postgres 唯一鍵原子去重 LINE delivery／redelivery；AI 完成結果與 LINE 送達各有 checkpoint，delivery retry 不會重跑付費 AI。DB、必要設定或 migration 不可用時 fail closed，沒有 per-instance legacy fallback。

## 已完成與未來方向

`5.0.0` 完成行程、任務與提醒的 M1 真實 LINE 閉環。到 `5.13.0` 已接上 Google Tasks 雙向同步與授權回填、Google Calendar inbound 同步（刪除回收＋timed 修改＋提醒去重）、每日天氣訂閱、搜尋建行程、語音建行程、多重／週期提醒及 run trace；並修正 Tasks inbound 水位、跨 instance 同步競態、Tasks 跨日與天氣 DST 排程。

`6.0.0-rc.8` 已完成 durable-only runtime、Google provider contract、feature-aware Quick Reply、完整 `指令`、Node 24／Express 5／Jest 30／ESLint 10、Tasks dead job 恢復、週期行程當地鐘點校正、Google request／Cron drain time budget，以及 Calendar inbound 非展開系列同步。Calendar all-day／recurrence exception inbound、Google-origin 建立與 Tasks due 回收仍不支援；正式 `6.0.0` 只差剩餘集中 LINE／Google 驗收。完整清單見 [ROADMAP.md](https://github.com/SanHsien/gpt-ai-assistant/blob/main/docs/ROADMAP.md)。

提醒實機驗收已證明：正常到點只推播一次；暫停期間到點不推播，恢復後不補發；恢復後新建立的提醒正常送達。

任務重開實機驗收已通過：從 `我的任務 已完成` 選取一筆後，LINE 顯示「重開任務 1」及「已重新開啟任務」，目標資料回到待辦且不再出現在已完成列表。同名的另一筆任務是獨立資料列，不會被同一次操作一起重開。重開成功訊息也會重申它只存在助理待辦。

## 產品與架構參考

- [Toki（前身 Dola）](https://toki.com/zh-hant)：自然語言行程／任務、自適應提醒、完成、多日曆協調、衝突建議、多模態、天氣與主動追蹤的產品行為參考。研究資料包括 [Toki Updates](https://toki.com/zh-hant/updates)、[官方品牌演進](https://toki.com/brand)、[Dola note 文章](https://note.com/dola_ai/n/nc457877a6b09) 與 [LINE VOOM 帳號](https://linevoom.line.me/user/_deGOEUAnNSgP1QW6kUVOtnQRZ3lnRXY7A0ukxwQ?=)。
- [memochou1993/fermi](https://github.com/memochou1993/fermi)：原作者在上游 [`d84c806`](https://github.com/memochou1993/gpt-ai-assistant/commit/d84c806b8368ded9d790067235827cdac32a23ab) 明確指向的接班專案；Supabase、durable worker 與 run trace 作為架構參考，FSL-1.1-MIT 原始碼不直接合併。本專案以該上游 commit 為基底。

上游目前未封存，但最後一次 merged PR 停在 2024-07-09；本專案已決定獨立維護、不安排回貢。解除 GitHub fork network 不影響永久保留的 MIT attribution。完整判斷見 repo 的 [ROADMAP.md](https://github.com/SanHsien/gpt-ai-assistant/blob/main/docs/ROADMAP.md#上游活躍度與回貢決策)。

參考商業服務只吸收可驗證的產品行為，不複製私有程式碼、品牌、文案、畫面或素材。完整參考專案與授權邊界見 repo 的 [ROADMAP.md](https://github.com/SanHsien/gpt-ai-assistant/blob/main/docs/ROADMAP.md)。

## Google Tasks 同步（雙向）

`ENABLE_GOOGLE_TASKS`（outbound，`5.3.0`）開啟後，新增／完成／重開／刪除任務會同步到 Google Tasks，與 Google Calendar 共用同一 OAuth。部署者仍必須在同一 Google Cloud project 另行啟用 Google Tasks API；只有 scope 不夠。既有僅授權 Calendar 的使用者重新「連結 Google 行事曆」後，callback 會回填既有未同步任務；`rc.5` 也會在永久設定錯誤排除後安全重排相同 dead job。同步以 task row lock、durable job 與 notes 的穩定標記防止併發或結果不明確重試產生複本。失敗只記錄狀態、**本機任務一律保留**。

`ENABLE_GOOGLE_TASKS_INBOUND`（inbound，`5.9.0`）開啟後，在 Google Tasks 端對 bot 建立的任務所做的**完成／重開、刪除、標題、備註**會回收到 Supabase（以 `updatedMin` 增量輪詢，Google Tasks 無 sync token）。**期限（`due`）不回收**——Google Tasks 只有日期、對回本地會失去精確時間又有時區歧義，精確期限以本地為準。衝突政策對稱 Calendar inbound：本地剛用 bot 改過（尚未推）時讓 outbound 先贏。

版本政策：`5.0.0` 在 M1 真實 LINE 閉環全部通過後發布；後續每個增強（Google Tasks、inbound 同步、天氣訂閱、語音建行程等）逐版切出，功能旗標預設關閉、可獨立啟用與回滾。
