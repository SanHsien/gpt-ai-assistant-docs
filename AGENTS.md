# AGENTS.md

本檔供 Claude Code、Codex、Gemini 等 AI coding agent 在此 repo 工作時使用。

## 專案定位

這是 `SanHsien/gpt-ai-assistant` 的**使用者文件站**。本 repo 負責安裝、部署、設定、使用教學與疑難排解；主 repo 負責程式碼、runtime contract、資料庫 migration、架構、開發決策與 release roadmap。

## Source of truth

修改文件前，先確認主 repo 的現行程式、README、`docs/` 與 migration，不要從本文件站反推產品行為。

- 使用者操作與部署說明：本 repo 維護。
- 程式實際行為、API/runtime contract、migration：主 repo 為權威來源。
- 架構、內部實作、開發決策、roadmap：主 repo `docs/` 為權威來源。
- 若兩邊描述衝突：不得自行選一個版本；以主 repo 的實際程式與測試確認後修正本文件站。

## 修改原則

1. **不要複製整份開發文件。** 使用者不需要的內部細節留在主 repo，必要時直接連結。
2. **只文件化已存在的能力。** 不把 roadmap、規劃中功能或推測寫成已支援。
3. **影響使用者時才同步。** 安裝、環境變數、指令、設定、限制、整合流程與 upgrade/migration 操作有變才需要更新本 repo。
4. **保持可執行。** 指令、檔名、環境變數與連結必須能從目前 release / main 驗證。
5. **修改後建置。** 執行 `npm ci && npm run build`；build failure 不可忽略。

## Review 紀錄

若本 repo 已有 `REVIEW.md` 且本次工作直接修復其中列出的問題，才回寫對應項目與修復 commit。一般文件調整不需要為了流程本身新增或擴充 `REVIEW.md`。

## 專案來源

本文件站源自 `memochou1993/gpt-ai-assistant-docs`，現隨 SanHsien 版助理獨立維護；原作者來源與致謝永久保留。

## 維護排程

- 一般變更直接推 `origin/main`，不開功能分支、不開維護 PR（2026-08-22 起，全庫一致）。只有在需要他人審查、或改動風險高到值得先讓 CI 在 PR 上跑一輪時，才退回 **branch → PR → CI**。
- Dependabot 每週一檢查 npm 與 GitHub Actions。
- `.github/workflows/dependency-freshness.yml` 每月 1 日另跑一次 `npm run check:dependencies`：把所有直接依賴的已安裝版、範圍內可用版、`npm latest` 與 `npm audit` 併同 open Dependabot PR 寫進 workflow summary。本 repo 停用 issues（問題一律開在主 repo），因此需要維護時以 workflow 紅燈通知，而非維護一張長期 issue。
- 依賴新鮮度紅了但**這次不該升**時，唯一的正當出口是 `.github/dependency-deferrals.json`：寫
  `{"deferredLatest": "<當時看到的版本>", "reason": "<為什麼這次不升>"}`。npm 一發出比它新的版本，
  延後自動失效、報告恢復提醒；沒有 `deferredLatest` 的條目直接忽略，因為那是永久靜音不是延後。
  **不要放寬 package.json 的範圍讓報告閉嘴**——範圍是相容性宣告，不是消音鍵。
- VuePress 2 以 rc 發布，其 `latest` dist-tag 仍指向 1.x，因此已安裝版**超前** dist-tag 是常態；檢查器把這種情況單獨標為「已超前 dist-tag latest」，不列為維護項目——否則四筆依賴每月會固定誤報三筆。
- `.github/workflows/ci.yml` 在**每個 PR** 上跑 `npm ci` + `npm run build`（含 `check:links`）。
  `docs.yaml` 只在 push 到 main 後建置並部署 Pages，所以沒有這支的話，Dependabot 的升版
  是合併後才知道站台還能不能建。CI 不碰 Pages、不部署。
- `.github/workflows/codeql.yml` 每週掃一次 JavaScript：兩支維護腳本分別處理 npm registry 的
  JSON 與建置後的 HTML，屬於測試問不到的失敗類型。
- 升級 VuePress 或 theme 前先讀 release notes，並以 `npm run build`（含 `check:links`）確認全部頁面與內部連結仍然成立。
- **合併任何 PR 前先讀 diff**（包含 Dependabot 開的）：`gh pr diff <編號>`。CI 綠燈證明的是「測試沒紅」，不是「改了什麼、該不該進 main」——lockfile 的連鎖升級、transitive major、跨出宣告範圍的變更，只有讀 diff 看得到。核准或合併訊息要寫出讀到什麼、為什麼可接受。
