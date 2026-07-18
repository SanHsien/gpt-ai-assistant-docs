---
home: true
title: GPT AI Assistant
heroText: GPT AI Assistant
tagline: A self-hosted LINE × OpenAI multimodal assistant
actions:
  - text: Get Started
    link: /en/getting-started.html
    type: primary
  - text: Features
    link: /en/features.html
    type: secondary
features:
  - title: Native LINE experience
    details: Use text, voice, images, and groups in normal LINE conversations.
  - title: Multimodal AI
    details: Chat, search, image generation, transcription, vision, tasks, Google Calendar events, reminders, and weather.
  - title: Self-hosted cost control
    details: Bring your own LINE, OpenAI, Supabase, and optional-service settings; disable capabilities independently.
footer: Independently maintained · based on memochou1993/gpt-ai-assistant · MIT
---

This documentation covers the independently maintained [SanHsien/gpt-ai-assistant](https://github.com/SanHsien/gpt-ai-assistant) **v6.0.0-rc.3**.

The project includes durable event creation from **text or voice**, recurring/multiple reminders, Google Calendar/Tasks synchronization, weather, and sourced search-to-event confirmation. `6.0.0-rc.3` includes up to 13 feature-aware quick replies, the actual grouped `Command` list, localized Google OAuth pages, a Node 24 runtime baseline, and a working issue-report destination for this independent repository. Production migration, Cron, and the rollback round trip passed; final `6.0.0` now waits only for consolidated LINE/Google acceptance.

> An OpenAI Platform API key is required. ChatGPT Plus or Pro does not include API usage and cannot replace the server-side API key through subscription OAuth.

## Documentation

- [Getting started](./getting-started.md)
- [Features and commands](./features.md)
- [Configuration](./configuration.md)
- [Troubleshooting](./troubleshooting.md)

Maintainer documentation, the technical roadmap, and decision records live in the [application repository](https://github.com/SanHsien/gpt-ai-assistant/tree/main/docs).
