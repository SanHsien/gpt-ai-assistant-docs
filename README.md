# GPT AI Assistant Docs

使用者文件站：<https://sanhsien.github.io/gpt-ai-assistant-docs/>

對應專案：[SanHsien/gpt-ai-assistant](https://github.com/SanHsien/gpt-ai-assistant)。

本文件站獨立維護，源自 [memochou1993/gpt-ai-assistant-docs](https://github.com/memochou1993/gpt-ai-assistant-docs)，並隨 SanHsien 版助理的功能與部署方式更新；原作者來源與致謝永久保留。

目前涵蓋 LINE/OpenAI 基礎、多模態、private Blob、Supabase durable queue、智慧日期／星期行程、到點提醒，以及 Google Calendar OAuth、同步重試與失敗行程復原。技術決策與完整 roadmap 仍以主 repo 的 [`docs/`](https://github.com/SanHsien/gpt-ai-assistant/tree/main/docs) 為準。

本機驗證：`npm ci && npm run build`。build 會在 VuePress 產生靜態站後檢查全部內部連結，避免 GitHub Pages 子路徑遺漏 `base` 而部署出 404。推送 `main` 後由 GitHub Pages workflow 發布。
