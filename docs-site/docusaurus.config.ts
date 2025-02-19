import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '0xArc SDK',
  tagline: '0xArc SDK',
  favicon: '/favicon-32x32.png',

  // Set the production url of your site here
  url: 'https://sdk.0xarc.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: '0xArc', // Usually your GitHub org/user name.
  projectName: 'analytics-sdk', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // Set this to '/' to make docs the root
          sidebarPath: './sidebars.ts',
          sidebarCollapsible: true,
          sidebarCollapsed: true,
        },
        // blog: {
        //   showReadingTime: true,
        //   feedOptions: {
        //     type: ['rss', 'atom'],
        //     xslt: true,
        //   },
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        //   // Useful options to enforce blogging best practices
        //   onInlineTags: 'warn',
        //   onInlineAuthors: 'warn',
        //   onUntruncatedBlogPosts: 'warn',
        // },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    // image: '/docusaurus-social-card.jpg',
    navbar: {
      title: '0xArc SDK',
      logo: {
        alt: 'My Site Logo',
        src: '/logo.svg',
      },
      items: [
        {
          href: 'https://github.com/0xarc-io',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'SDK Documentation',
              to: '/',
            },
          ],
        },
        {
          title: 'Connect',
          items: [
            {
              label: 'X',
              href: 'https://x.com/0xarc_io',
            },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/company/0xarc/posts/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/0xarc-io/analytics-sdk',
            },
            {
              label: '0xArc App',
              href: 'https://www.0xarc.io/',
            },
          ],
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    sidebar: {
      autoCollapseCategories: true,
      hideable: true,
    }
  } satisfies Preset.ThemeConfig,
}

export default config
