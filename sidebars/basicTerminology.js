const basicTerminologySidebar = {
  basicTerminologySidebar: [
    {
      type: 'category',
      label: 'Basic Terminology',
      collapsed: false,
      items: [
        'basic-terminology/index',
        'basic-terminology/overview',
        {
          type: 'category',
          label: 'Core articles',
          collapsed: false,
          items: [
            'basic-terminology/what-is-a-computer-program',
            'basic-terminology/what-is-a-compiler',
            'basic-terminology/what-is-an-ast',
            'basic-terminology/what-is-ir',
          ],
        },
      ],
    },
  ],
};

module.exports = basicTerminologySidebar;
