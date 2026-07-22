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
    details: 文字、語音訊息、桌面音訊檔、圖片與群組都在熟悉的 LINE 對話中完成。
  - title: 多模態 AI
    details: 支援對話、搜尋、生圖、語音、圖片理解、任務、Google Calendar 行程、提醒與天氣。
  - title: 自架與成本控制
    details: 使用自己的 LINE、OpenAI、Supabase 與選用服務，各能力可獨立關閉。
footer: Independently maintained · based on memochou1993/gpt-ai-assistant · MIT
---

目前文件對應獨立維護的 [SanHsien/gpt-ai-assistant](https://github.com/SanHsien/gpt-ai-assistant) **v6.0.0**。

本專案已上線 Supabase durable queue、文字與**語音**建行程、週期／多重提醒、Google Calendar／Tasks 同步、天氣與從搜尋建立行程。`6.0.0` 支援 LINE 桌面音訊附件、依 Content API 回應保留實際 MP3／WAV／M4A／WebM 格式，並容忍「記行程」常見同音辨識；集中 LINE／Supabase／Google 驗收已完成。

> 本專案需要 OpenAI API key。ChatGPT Plus／Pro 訂閱不包含 API 用量，也不能用訂閱 OAuth 取代 server-side API key。

## 文件入口

- [開始使用](./getting-started.md)：Vercel 部署、LINE webhook 與本機執行。
- [功能與指令](./features.md)：目前能力、成本開關與未來方向。
- [設定](./configuration.md)：必要及常用環境變數。
- [疑難排解](./troubleshooting.md)：無回覆、重複回覆、生圖與 Blob 錯誤。

維護者文件、技術 roadmap 與決策紀錄放在[程式 repo](https://github.com/SanHsien/gpt-ai-assistant/tree/main/docs)，不再複製到使用者文件站。
