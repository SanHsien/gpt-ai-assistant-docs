---
home: true
title: GPT AI Assistant
heroText: GPT AI Assistant
tagline: 自架的 LINE × OpenAI 多模態助理
actions:
  - text: 開始安裝
    link: /getting-started.html
    type: primary
  - text: 查看功能
    link: /features.html
    type: secondary
features:
  - title: LINE 原生使用
    details: 文字、語音、圖片與群組都在熟悉的 LINE 對話中完成。
  - title: 多模態 AI
    details: 支援對話、搜尋、生圖、語音、圖片理解、任務、Google Calendar 行程、提醒與天氣。
  - title: 自架與成本控制
    details: 使用自己的 LINE、OpenAI、Supabase 與選用服務，各能力可獨立關閉。
footer: Independently maintained · based on memochou1993/gpt-ai-assistant · MIT
---

目前文件對應獨立維護的 [SanHsien/gpt-ai-assistant](https://github.com/SanHsien/gpt-ai-assistant) **v6.0.0-rc.4**。

本專案已上線 Supabase durable queue、文字與**語音**建行程、週期／多重提醒、Google Calendar／Tasks 同步、天氣與從搜尋建立行程。`6.0.0-rc.4` 另完成最多 13 個 feature-aware Quick Reply、分組完整「指令」清單、Google OAuth 語系化、Node 24 container healthcheck，以及 Express 5／Jest 30／ESLint 10 維護基線；Production 升級、Cron 與回滾往返已通過，正式 `6.0.0` 只剩集中 LINE／Google 驗收。

> 本專案需要 OpenAI API key。ChatGPT Plus／Pro 訂閱不包含 API 用量，也不能用訂閱 OAuth 取代 server-side API key。

## 文件入口

- [開始使用](./getting-started.md)：Vercel 部署、LINE webhook 與本機執行。
- [功能與指令](./features.md)：目前能力、成本開關與未來方向。
- [設定](./configuration.md)：必要及常用環境變數。
- [疑難排解](./troubleshooting.md)：無回覆、重複回覆、生圖與 Blob 錯誤。

維護者文件、技術 roadmap 與決策紀錄放在[程式 repo](https://github.com/SanHsien/gpt-ai-assistant/tree/main/docs)，不再複製到使用者文件站。
