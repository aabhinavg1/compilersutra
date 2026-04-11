// @ts-check
/** @type {import('@docusaurus/types').Config} */
const SOCIAL_IMAGE_VERSION = '20260328-og-refresh';

const config = {
  title: 'CompilerSutra',
  tagline: 'Unleashing Compiler Power for Cutting-Edge Innovation!',
  favicon: 'img/favicon.ico',
  url: 'https://www.compilersutra.com',
  baseUrl: '/',
  organizationName: 'compilersutra',
  trailingSlash: true,
  projectName: 'FixIt',
  onBrokenLinks: 'ignore',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/aabhinavg1/FixIt/edit/main/',
        },
        sitemap: {
          ignorePatterns: [
            '/404',
            '/404/**',
            '/markdown-page',
            '/markdown-page/**',
            '/docs/tags',
            '/docs/tags/**',
          ],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-vercel-analytics',
      {
        debug: false,
        mode: 'auto',
      },
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */ ({
      mermaid: {
        theme: {
          light: 'neutral',
          dark: 'dark',
        },
      },
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: false,
      },
      metadata: [
        { name: 'google-adsense-account', content: 'ca-pub-3213090090375658' },
        { name: 'theme-color', content: '#0a0f1e' },
        { name: 'robots', content: 'index, follow, max-image-preview:large' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'author', content: 'CompilerSutra' },
        { name: 'keywords', content: 'LLVM, MLIR, TVM, compiler, C++, GPU programming, DSA, tutorials, compiler optimization' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'CompilerSutra' },
        { property: 'og:url', content: 'https://www.compilersutra.com' },
        { property: 'og:image', content: `https://www.compilersutra.com/img/og/master.png?v=${SOCIAL_IMAGE_VERSION}` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'CompilerSutra social preview' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@CompilerSutra' },
        { name: 'twitter:creator', content: '@CompilerSutra' },
        { name: 'twitter:image', content: `https://www.compilersutra.com/img/og/master.png?v=${SOCIAL_IMAGE_VERSION}` },
        { name: 'twitter:image:alt', content: 'CompilerSutra social preview' },
      ],

      navbar: {
        title: 'CompilerSutra',
        logo: {
          alt: 'CompilerSutra Logo',
          src: 'img/logo.svg',
        },

        items: [
          {
            to: '/docs/start-here',
            label: 'Start Here',
            position: 'left',
          },
          {
            type: 'dropdown',
            label: 'Tracks',
            position: 'left',
            items: [
              { label: 'Compiler Fundamentals', to: '/docs/tracks/compiler-fundamentals' },
              { label: 'LLVM and IR', to: '/docs/tracks/llvm-and-ir' },
              { label: 'GPU Compilers', to: '/docs/tracks/gpu-compilers' },
              { label: 'ML Compilers', to: '/docs/tracks/ml-compilers' },
              { label: 'C++', to: '/docs/c++' },
              {label: 'COA', to: '/docs/coa'},
            ],
          },
          {
            to: '/docs/tools',
            label: 'Tools',
            position: 'left',
          },
          {
            to: '/docs/labs',
            label: 'Labs',
            position: 'left',
          },
          {
            type: 'dropdown',
            label: 'Library',
            position: 'left',
            items: [
              { label: 'Library', to: '/library' },
              { label: 'Books', to: '/books' },
            ],
          },
          {
            type: 'dropdown',
            label: 'Articles',
            position: 'left',
            items: [
              { label: 'All Articles', to: '/docs/articles' },
              { label: 'Benchmarks', to: '/docs/articles/gcc_vs_clang_real_benchmarks_2026_reporter' },
              { label: 'Tech Blog', to: '/docs/AI/is_gpt_is_opensource' },
              { label: 'How-To Guides', to: '/docs/how-about' },
            ],
          },
          {
            type: 'dropdown',
            label: 'Topics',
            position: 'left',
            items: [
              { label: 'Compilers', to: '/docs/compilers/compiler' },
              { label: 'LLVM', to: '/docs/llvm/intro-to-llvm' },
              { label: 'MLIR', to: '/docs/MLIR/intro' },
              { label: 'ML Compilers', to: '/docs/ml-compilers' },
              { label: 'TVM', to: '/docs/tvm/intro-to-tvm' },
              { label: 'OpenCL', to: '/docs/gpu/opencl' },
              { label: 'GPU Programming', to: '/docs/gpu/gpu_programming/gpu_programming_toc' },
              { label: 'Linux', to: '/docs/linux/intro_to_linux' },
            ],
          },
          {
            type: 'dropdown',
            label: 'YouTube',
            position: 'left',
            items: [
              { label: 'Live Classes', to: '/docs/linux/live'},
              {
                label: 'Tech Talks ',
                href: 'https://www.youtube.com/@compilersutra/live',
              },
            ],
          },

          {
            type: 'docSidebar',
            sidebarId: 'projectSidebar',
            position: 'left',
            label: 'Project',
          },
          {
            type: 'docSidebar',
            sidebarId: 'LLVMPassSidebar',
            position: 'left',
            label: 'LLVM Pass Tracker',
          },

          {
            type: 'dropdown',
            label: 'MCQ',
            position: 'left',
            items: [
              { label: 'MCQ Hub', to: '/docs/mcq' },
              { label: 'Practice MCQ CPP', to: '/docs/mcq/cpp_mcqs' },
              {
                label: 'Practice Interview Question & Answers (CPP)',
                to: '/docs/mcq/interview_question/cpp_interview_mcqs',
              },
              {
                label: 'Domain Specific C++ MCQs',
                to: '/docs/mcq/cpp_mcqs#-domain-specific-c-mcqs',
              },
              { label: 'Compiler, Systems and GPU MCQ', to: '/docs/mcq' },
            ],
          },

          {
            href: 'https://www.youtube.com/@compilersutra',
            label: 'YouTube Channel',
            position: 'right',
          },
          {
            href: 'https://compilersutra.quora.com',
            label: 'Q&A',
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
              { label: 'Start Here', to: '/docs/start-here' },
              { label: 'Tracks', to: '/docs/tracks/compiler-fundamentals' },
              { label: 'Tools', to: '/docs/tools' },
              { label: 'Labs', to: '/docs/labs' },
              { label: 'LLVM Tutorials', to: '/docs/llvm/intro-to-llvm' },
              { label: 'Compilers', to: '/docs/compilers/compiler' },
              { label: 'C++ Tutorials', to: '/docs/c++' },
              { label: 'OpenCL', to: '/docs/gpu/opencl' },
              { label: 'Linux', to: '/docs/linux/intro_to_linux' },
            ],
          },
          {
            title: 'Community',
            items: [
              { label: 'LLVM Documentation', href: 'https://llvm.org/docs/' },
              { label: 'Twitter', href: 'https://twitter.com/CompilerSutra' },
            ],
          },
          {
            title: 'More',
            items: [
              { label: 'GitHub', href: 'https://github.com/aabhinavg1/FixIt' },
              { label: 'About us', href: 'https://www.compilersutra.com/about_us/' },
              { label: 'Sponsor Us', href: 'https://github.com/sponsors/aabhinavg1' },
              { label: 'Contact Us', href: 'https://www.linkedin.com/in/abhinavcompilerllvm/' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} CompilerSutra.`,
      },
    }),

  customFields: {
    adsenseClient: 'ca-pub-3213090090375658',
  },
};

module.exports = config;
