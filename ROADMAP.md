# 路線圖

> 本 repo 後續工作的單一真相源。做完一項，就在同一個 commit 刪掉那一列；新工作只加在這裡。
> 現況段的數字是 2026-10-29 依 `main` `22cc65ef7620` 查的快照，開工前先重查 GitHub。

## 現況
`SanHsien/gpt-ai-assistant` 的 VuePress 使用者文件站（GitHub Pages），只管安裝、部署、設定與操作說明；產品功能的路線圖在主 repo 的 `docs/ROADMAP.md`，不在這裡（`AGENTS.md`「Source of truth」）。2026-10-29 查 `main`：open PR 0、Dependabot 與 code scanning open alert 皆 0，docs／CodeQL／依賴新鮮度檢查最近一次 success；issues 已停用，問題一律開在主 repo，open issue 數因此「未查到」（查法：`gh pr list -R SanHsien/gpt-ai-assistant-docs`、`gh run list -R SanHsien/gpt-ai-assistant-docs -b main`）。
文件已同步到主 repo `v6.1.0` 之後的使用者可見變更（`ec11776`、`72a54fe` 的預設逾時與優先序）。

## 近期：可以直接動手
| 項目 | 為什麼 | 驗收方式 | 建議執行者 | 證據 |
| --- | --- | --- | --- | --- |

## 中期：等條件成立再做
| 項目 | 觸發條件 | 驗收方式 | 建議執行者 | 證據 |
| --- | --- | --- | --- | --- |
| 同步主 repo 下一個 release 的 `changelog.md` | 主 repo 發出 `v6.1.0` 之後的下一個 release（`gh release list -R SanHsien/gpt-ai-assistant`） | 中英文 `changelog.md` 各多一節對應版本；`npm run build` 綠 | Claude Sonnet | `docs/changelog.md` |
| VuePress 從 rc 升到 2.0 正式版 | `vuepress`、`@vuepress/bundler-vite`、`@vuepress/theme-default` 發出 2.x 正式版，且 `npm view vuepress dist-tags` 的 `latest` 指向 2.x | 先讀 release notes；`package.json` 改正式版，`npm ci && npm run build`（含內部連結檢查）與 `npm test` 綠；新鮮度檢查不再出現「已超前 dist-tag latest」 | Codex | `package.json` devDependencies（`2.0.0-rc.30`／`rc.132`）；`AGENTS.md`「維護排程」VuePress rc 說明 |

## 刻意不做
| 不做什麼 | 理由 | 什麼情況下重新考慮 |
| --- | --- | --- |
| 在本站寫產品路線圖、規劃中功能或架構決策 | 只文件化已存在的能力；roadmap 與決策的權威來源是主 repo `docs/`（`AGENTS.md`「修改原則」第 2 條、「Source of truth」） | 不重新考慮（權責邊界） |
| 把進階調校旋鈕（`DATABASE_POOL_MAX`、`CALENDAR_INBOUND_PAGE_SIZE`、`TASKS_INBOUND_*`、`REMINDER_STALE_MINUTES`、`OPENAI_COMPLETION_TEMPERATURE` 等）逐一寫進設定頁 | 屬開發細節，`AGENTS.md` 要求不複製開發文件；需要時連到主 repo `docs/DEVELOPMENT.md` | 使用者在主 repo 回報需要調整某個旋鈕 |
| 開啟本 repo 的 issues | 問題集中在主 repo；本 repo 的維護訊號用 workflow 紅燈（`AGENTS.md`「維護排程」） | 文件站本身出現需要獨立追蹤的長期問題 |
| 把主 repo `[Unreleased]` 的項目先寫進本站 `changelog.md` | 本站只列已發布版本，未發版的行為可能再改 | 不重新考慮；改為在中期表「同步下一個 release」處理 |

## 維護方式
主 repo 發版後同步一次影響使用者的內容（安裝、環境變數、指令、限制、升級步驟），改完 `npm ci && npm run build`。依賴：Dependabot 每週一＋每月 1 日新鮮度檢查；要延後就寫 `.github/dependency-deferrals.json`（含 `deferredLatest`），不要放寬範圍；合併任何 PR 前先 `gh pr diff` 讀過。
