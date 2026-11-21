English · [繁體中文](README.md)

# GPT AI Assistant Docs

User documentation site: <https://sanhsien.github.io/gpt-ai-assistant-docs/>

Main project: [SanHsien/gpt-ai-assistant](https://github.com/SanHsien/gpt-ai-assistant)

This repo is **the user documentation site for GPT AI Assistant**. It covers installation, deployment, configuration, feature usage, and troubleshooting. The main repo owns the code, architecture, database migrations, development decisions, and release roadmap.

## Source of truth

| Content | Authoritative source |
|---|---|
| Installation, deployment, environment variables, tutorials, operating procedures | **This repo** |
| Actual program behaviour, API / runtime contract, database migrations | **Main repo** |
| Architecture, development decisions, internal implementation, release roadmap | **Main repo `docs/`** |
| Public feature descriptions | This repo; when they conflict with program behaviour, the main repo's actual code and tests win, and the documentation is corrected |

The principle is simple: **program behaviour is not defined once in each repo.** This documentation site turns capabilities that the main repo has implemented and verified into documentation users can follow.

## Maintenance workflow

Update this documentation site when a change in the main repo affects any of the following:

- Installation or deployment steps
- Environment variables and required services
- User-visible commands, features, or limits
- Integration flows such as Google Calendar / Tasks, Supabase, and LINE
- What users must do before and after an upgrade or migration

After changing the documentation, run:

```bash
npm ci
npm run build
```

`build` generates the VuePress static site and checks internal links, so that the GitHub Pages sub-path or a broken link does not cause a 404.

## Origin

This documentation site derives from [memochou1993/gpt-ai-assistant-docs](https://github.com/memochou1993/gpt-ai-assistant-docs) and is maintained independently alongside the SanHsien edition of GPT AI Assistant. Attribution and acknowledgement of the original author are kept.
