# GPT AI Assistant Docs

使用者文件站：<https://sanhsien.github.io/gpt-ai-assistant-docs/>

對應主專案：[SanHsien/gpt-ai-assistant](https://github.com/SanHsien/gpt-ai-assistant)

本 repo 是 **GPT AI Assistant 的使用者文件站**，負責安裝、部署、設定、功能操作與疑難排解；主 repo 則負責程式碼、架構、資料庫 migration、開發決策與 release roadmap。

## 文件權責 / Source of truth

| 內容 | 權威來源 |
|---|---|
| 安裝、部署、環境變數、使用教學、操作流程 | **本 repo** |
| 程式實際行為、API／runtime contract、資料庫 migration | **主 repo** |
| 架構、開發決策、內部實作、release roadmap | **主 repo `docs/`** |
| 對外功能說明 | 本 repo；若與程式行為衝突，以主 repo 的實際程式與測試為準並修正文檔 |

原則很簡單：**程式行為不在兩個 repo 各自定義一次。** 本文件站負責把主 repo 已實作、已驗證的能力轉成使用者看得懂的文件。

## 維護流程

當主 repo 的變更影響以下任一項目時，應同步更新本文件站：

- 安裝或部署步驟
- 環境變數與必要服務
- 使用者可見指令、功能或限制
- Google Calendar／Tasks、Supabase、LINE 等整合流程
- 升級或 migration 前後的使用者操作

文件變更完成後執行：

```bash
npm ci
npm run build
```

`build` 會建立 VuePress 靜態站並檢查內部連結，避免 GitHub Pages 子路徑或失效連結造成 404。

## 專案來源

本文件站源自 [memochou1993/gpt-ai-assistant-docs](https://github.com/memochou1993/gpt-ai-assistant-docs)，並隨 SanHsien 版 GPT AI Assistant 獨立維護；原作者來源與致謝保留。
