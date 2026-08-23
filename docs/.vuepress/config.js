import { defaultTheme } from '@vuepress/theme-default';
import { viteBundler } from '@vuepress/bundler-vite';

module.exports = {
  base: '/gpt-ai-assistant-docs/',
  title: 'GPT AI Assistant',
  locales: {
    '/': {
      lang: 'zh',
      description: 'GPT AI Assistant 是自架的 LINE × OpenAI 個人助理，支援多模態對話、Supabase durable queue 與 Google Calendar 行程。',
    },
    '/en/': {
      lang: 'en',
      description: 'GPT AI Assistant is a self-hosted LINE and OpenAI assistant with multimodal chat, a Supabase durable queue, and Google Calendar events.',
    },
  },
  displayAllHeaders: true,
  bundler: viteBundler(),
  theme: defaultTheme({
    repo: 'SanHsien/gpt-ai-assistant',
    docsRepo: 'SanHsien/gpt-ai-assistant-docs',
    docsDir: 'docs',
    locales: {
      '/': {
        selectLanguageName: '中文',
      },
      '/en/': {
        selectLanguageName: 'English',
      },
    },
    sidebar: {
      '/': [
        {
          text: '使用說明',
          children: [
            {
              text: '介紹',
              link: '/',
            },
            '/getting-started.html',
            '/features.html',
            '/configuration.html',
            '/troubleshooting.html',
            '/changelog.html',
          ],
        },
      ],
      '/en/': [
        {
          text: 'Documentation',
          children: [
            {
              text: 'Introduction',
              link: '/en/',
            },
            '/en/getting-started.html',
            '/en/features.html',
            '/en/configuration.html',
            '/en/troubleshooting.html',
            '/en/changelog.html',
          ],
        },
      ],
    },
  }),
};
