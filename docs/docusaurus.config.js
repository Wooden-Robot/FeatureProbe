// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const math = require('remark-math');
const katex = require('rehype-katex');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'FeatureProbe',
  tagline: 'An open source feature management service',
  url: 'https://docs.featureprobe.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  deploymentBranch: 'gh-pages',
  staticDirectories: ['pictures', 'static'],

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'FeatureProbe', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-CN'],
    localeConfigs: {
      en: {
        label: 'English',
      },
      'zh-CN': {
        label: '中文（中国）',
      },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          editUrl: 'https://github.com/FeatureProbe/FeatureProbe/blob/main/docs',
          editLocalizedFiles: true,
          showLastUpdateTime: true,
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },
        blog: {
          blogSidebarCount: 'ALL',
          showReadingTime: true,
          editUrl: 'https://github.com/FeatureProbe/FeatureProbe/blob/main/docs',
          editLocalizedFiles: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      })
    ],
  ],

  stylesheets: [
    {
      href: '/katex.min.css',
      type: 'text/css',
    },
  ],

  plugins: [
    [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: 'G-XYQX3NRB1Q',
        anonymizeIP: true,
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: '',
        logo: {
          alt: 'FeatureProbe Logo',
          src: 'img/logo.svg',
          srcDark: 'img/logo-light.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'introduction/index',
            position: 'left',
            label: 'Docs',
          },
          {
            to: '/blog',
            label: 'Blog',
            position: 'left'
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/FeatureProbe',
            label: 'GitHub',
            position: 'right',
          },
          {
            href: 'https://gitee.com/featureprobe',
            label: 'Gitee',
            position: 'right',
          },
          {
            href: 'https://featureprobe.io',
            label: 'Demo',
            position: 'right',
          },
          {
            type: 'search',
            position: 'right',
            className: 'abc',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Product',
            items: [
              {
                label: 'Docs',
                to: '/',
              },
              {
                label: 'Demo',
                href: 'https://featureprobe.io',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Slack',
                href: 'https://join.slack.com/t/featureprobe/shared_invite/zt-1b5qd120x-R~dDbpgL85GgCLTtfNDj0Q',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/featureprobe',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/FeatureProbe/FeatureProbe',
              },
              {
                label: 'Gitee',
                href: 'https://gitee.com/featureprobe',
              },
            ],
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['java','rust','swift','objectivec','kotlin', 'nginx'],
      },
      algolia: {
        appId: '9IORHFLQAF',
        apiKey: 'e7716f20a6d9f16f2151380dfdbb33c4',
        indexName: 'featureprobe',
      },
    }),
  themes: ['@docusaurus/theme-live-codeblock'],
};

module.exports = config;
