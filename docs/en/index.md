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
    details: Use text, voice messages, desktop audio files, images, and groups in normal LINE conversations.
  - title: Multimodal AI
    details: Chat, search, image generation, transcription, vision, tasks, Google Calendar events, reminders, and weather.
  - title: Self-hosted cost control
    details: Bring your own LINE, OpenAI, Supabase, and optional-service settings; disable capabilities independently.
footer: Independently maintained · based on memochou1993/gpt-ai-assistant · MIT
---

This documentation covers the independently maintained [SanHsien/gpt-ai-assistant](https://github.com/SanHsien/gpt-ai-assistant) **v6.0.1**.

The project includes durable event creation from **text or voice**, recurring/multiple reminders, Google Calendar/Tasks synchronization, weather, and sourced search-to-event confirmation. `6.0.0` accepts LINE desktop audio attachments, preserves the actual MP3/WAV/M4A/WebM format from the Content API response, and tolerates common Chinese homophones at the start of spoken schedule commands. Centralized LINE/Supabase/Google acceptance is complete.

> An OpenAI Platform API key is required. ChatGPT Plus or Pro does not include API usage and cannot replace the server-side API key through subscription OAuth.

## Documentation

- [Getting started](./getting-started.md)
- [Features and commands](./features.md)
- [Configuration](./configuration.md)
- [Troubleshooting](./troubleshooting.md)

Maintainer documentation, the technical roadmap, and decision records live in the [application repository](https://github.com/SanHsien/gpt-ai-assistant/tree/main/docs).
