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
