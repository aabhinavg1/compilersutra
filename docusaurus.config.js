// @ts-check
/** @type {import('@docusaurus/types').Config} */
const SOCIAL_IMAGE_VERSION = '20260328-og-refresh';

const config = {
  title: 'CompilerSutra',
  tagline: 'From source code to real hardware — free guided paths in LLVM and compilers.',
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
          tags: false,
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
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            // trailingSlash:true — only one `from` form; both slash variants write the same file and EEXIST on Vercel
            to: '/docs/project/cpp-project-ideas/',
            from: '/docs/project/Project/',
          },
          { to: '/docs/c++/advanced/', from: ['/docs/c++/advance/', '/docs/c++/advance/index', '/docs/c++/advance/intro'] },
          {
            to: '/docs/dsa/foundations/data/',
            from: ['/dsa/foundations/data/'],
          },
          {
            to: '/docs/dsa/foundations/algorithm/',
            from: ['/dsa/foundations/algorithm/'],
          },
          {
            to: '/docs/dsa/foundations/arrays/',
            from: ['/dsa/foundations/arrays/'],
          },
          {
            to: '/docs/dsa/foundations/strings/',
            from: ['/dsa/foundations/strings/'],
          },
          {
            to: '/docs/dsa/foundations/searching/',
            from: ['/dsa/foundations/searching/'],
          },
          {
            to: '/docs/dsa/foundations/sorting/',
            from: ['/dsa/foundations/sorting/'],
          },
          {
            to: '/docs/dsa/foundations/stack-and-queue/',
            from: ['/dsa/foundations/stack-and-queue/'],
          },
          {
            to: '/docs/dsa/foundations/connected-data/',
            from: ['/dsa/foundations/connected-data/'],
          },
          {
            to: '/docs/dsa/foundations/hash-map-and-complexity/',
            from: ['/dsa/foundations/hash-map-and-complexity/'],
          },
          {
            to: '/docs/compilers/clang-vs-gcc-vs-llvm/',
            from: [
              '/docs/compilers/gcc_vs_llvm/',
              '/docs/compilers/gcc_vs_llvm_2/',
            ],
          },
          {
            // Only trailing-slash forms: site has trailingSlash:true, and listing
            // both /path and /path/ writes the same index.html (EEXIST on build).
            to: '/docs/compilers/intro/',
            from: [
              '/docs/compilers/IntroductionToCompilers/',
              '/docs/compilers/inside-a-compiler/',
              '/docs/compilers/inside-a-compiler-source-to-assembly/',
            ],
          },
        ],
      },
    ],
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
        defaultMode: 'light',
        respectPrefersColorScheme: false,
      },
      metadata: [
        // { name: 'google-adsense-account', content: 'ca-pub-3213090090375658' },
        { name: 'theme-color', content: '#f6f9fd' },
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
            label: 'Learn',
            position: 'left',
            items: [
              { label: 'All Learning Tracks', to: '/docs/tracks/' },
              { label: 'Compiler Fundamentals', to: '/docs/tracks/compiler-fundamentals' },
              { label: 'LLVM and IR', to: '/docs/tracks/llvm-and-ir' },
              { label: 'GPU Compilers', to: '/docs/tracks/gpu-compilers' },
              { label: 'ML Compilers', to: '/docs/tracks/ml-compilers' },
              { label: 'C++', to: '/docs/c++' },
              { label: 'Computer Architecture', to: '/docs/coa' },
              { label: 'Basic Terminology', to: '/docs/basic-terminology/' },
              {
                type: 'html',
                value: '<hr style="margin:0.4rem 0.75rem;opacity:0.35;" />',
              },
              { label: 'Compilers Hub', to: '/docs/compilers/compiler' },
              { label: 'LLVM Tutorials', to: '/docs/llvm/intro-to-llvm' },
              { label: 'MLIR', to: '/docs/MLIR/intro' },
              { label: 'TVM', to: '/docs/tvm/intro-to-tvm' },
              { label: 'OpenCL / GPU', to: '/docs/gpu/opencl' },
              { label: 'Parallel Programming', to: '/docs/parallel-computing/' },
              { label: 'Linux', to: '/docs/linux/intro_to_linux' },
              { label: 'AI Systems', to: '/docs/AI' },
            ],
          },
          {
            type: 'dropdown',
            label: 'Tools',
            position: 'left',
            items: [
              { label: 'Tools Hub', to: '/docs/tools' },
              { label: 'Clang Flags Explorer', to: '/tools/clang-flags/' },
              { label: 'ABI Explorer', to: '/abi/' },
              { label: 'LLVM Pass Tracker', to: '/docs/llvm/llvm_pass_tracker/llvm_pass' },
            ],
          },
          {
            type: 'dropdown',
            label: 'Practice',
            position: 'left',
            items: [
              { label: 'DSA Academy', to: '/dsa' },
              { label: 'Labs', to: '/docs/labs' },
              { label: 'MCQ Hub', to: '/docs/mcq' },
              { label: 'C++ MCQs', to: '/docs/mcq/cpp_mcqs' },
              { label: 'Interview Q&A (C++)', to: '/docs/mcq/interview_question/cpp_interview_mcqs' },
              { label: 'Domain MCQs', to: '/docs/mcq/questions/domain' },
              { label: 'Daily Mixed MCQs', to: '/docs/mcq/daily' },
            ],
          },
          {
            type: 'dropdown',
            label: 'Read',
            position: 'left',
            items: [
              { label: 'All Articles', to: '/docs/articles' },
              { label: 'Benchmarks', to: '/docs/articles/gcc_vs_clang_real_benchmarks_2026_reporter' },
              { label: 'Compiler Blog', to: '/docs/compilers/techblog/' },
              { label: 'How-To Guides', to: '/docs/how-about' },
              { label: 'Paper Library', to: '/library' },
              { label: 'Books', to: '/books' },
            ],
          },
          {
            type: 'docSidebar',
            sidebarId: 'projectSidebar',
            position: 'left',
            label: 'Projects',
          },
          {
            type: 'dropdown',
            label: 'More',
            position: 'left',
            items: [
              { label: 'Live Classes', to: '/docs/linux/live' },
              {
                label: 'YouTube Tech Talks',
                href: 'https://www.youtube.com/@compilersutra/live',
              },
              {
                label: 'Q&A Forum',
                href: 'https://compilersutra.quora.com',
              },
              { label: 'Support Us', to: '/support' },
            ],
          },

          {
            href: 'https://www.youtube.com/@compilersutra',
            position: 'right',
            className: 'header-icon-link header-youtube-link',
            'aria-label': 'CompilerSutra YouTube channel',
          },
          {
            href: 'https://chat.whatsapp.com/C5lBzje4CjvLTZBhS0O92x',
            position: 'right',
            className: 'header-icon-link header-whatsapp-link',
            'aria-label': 'Join CompilerSutra WhatsApp community',
          },
          {
            to: '/support',
            label: 'Support',
            position: 'right',
          },
        ],
      },

      footer: {
        style: 'dark',
        links: [
          {
            title: 'Start',
            items: [
              { label: 'Start Here', to: '/docs/start-here' },
              { label: 'Learning Tracks', to: '/docs/tracks/' },
              { label: 'Basic Terminology', to: '/docs/basic-terminology/' },
              { label: 'Compiler Fundamentals', to: '/docs/tracks/compiler-fundamentals' },
            ],
          },
          {
            title: 'Learn',
            items: [
              { label: 'LLVM Tutorials', to: '/docs/llvm/intro-to-llvm' },
              { label: 'Compilers', to: '/docs/compilers/compiler' },
              { label: 'C++ Tutorials', to: '/docs/c++' },
              { label: 'GPU / OpenCL', to: '/docs/gpu/opencl' },
              { label: 'Linux', to: '/docs/linux/intro_to_linux' },
            ],
          },
          {
            title: 'Practice & Tools',
            items: [
              { label: 'DSA Academy', to: '/dsa' },
              { label: 'Labs', to: '/docs/labs' },
              { label: 'MCQs', to: '/docs/mcq' },
              { label: 'Tools', to: '/docs/tools' },
              { label: 'Clang Flags', to: '/tools/clang-flags/' },
            ],
          },
          {
            title: 'Community',
            items: [
              { label: 'WhatsApp Community', href: 'https://chat.whatsapp.com/C5lBzje4CjvLTZBhS0O92x' },
              { label: 'YouTube Channel', href: 'https://www.youtube.com/@compilersutra' },
              { label: 'GitHub', href: 'https://github.com/aabhinavg1/FixIt' },
              { label: 'Support Us', to: '/support' },
              { label: 'About Us', href: 'https://www.compilersutra.com/about_us/' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} CompilerSutra.`,
      },
    }),

  customFields: {
    // adsenseClient: 'ca-pub-3213090090375658',
  },
};

module.exports = config;
