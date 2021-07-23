const path = require('path');

const kebabToCC = (input) => {
  let str = input.replace(/-./g, (match) => match[1].toUpperCase());
  str = str[0].toUpperCase() + str.substring(1);
  return str;
};

const getDynamicFileNames = ({ camelCaseModuleName }) => ({
  // main component
  'RootComponent.jsx': `${camelCaseModuleName}.jsx`,
  // unit test for main component
  'RootComponent.spec.jsx': `${camelCaseModuleName}.spec.jsx`,
  // browser test for main component
  'RootComponent.spec.js': `${camelCaseModuleName}.spec.js`,
});

const createAdditionalTemplateData = (templateData) => ({
  camelCaseModuleName: kebabToCC(templateData.moduleName),
  rootModuleName: templateData.rootModuleName || templateData.moduleName,
  isRootModule: !templateData.rootModuleName,
});

const getIgnoredFileNames = (templateData) => {
  const ignoredFiles = [];

  if (!templateData.isRootModule) {
    ignoredFiles.push('appConfig.js');
    ignoredFiles.push('appConfig.spec.js');
    ignoredFiles.push('csp.js');
    ignoredFiles.push('childRoutes.jsx');
  }

  return ignoredFiles;
};

const getTemplateOptions = async (baseData, prompts) => {
  let templateData = {
    ...baseData,
    ...await prompts([
      {
        type: 'text',
        name: 'description',
        message: 'Enter module description:',
        initial: '',
      },
      {
        type: 'text',
        name: 'rootModuleName',
        message: 'Enter the name of your root module (leave blank for this module to be root):',
        initial: '',
      },
      {
        type: 'text',
        name: 'moduleMapUrl',
        message: 'Enter the url for your dev environment module map:',
        initial: '',
      },
    ]),
  };

  templateData = {
    ...templateData,
    ...createAdditionalTemplateData(templateData),
  };

  return {
    templateData,
    dynamicFileNames: getDynamicFileNames(templateData),
    ignoredFileNames: getIgnoredFileNames(templateData),
  };
};

const getTemplatePaths = () => [path.resolve(__dirname, './template')];

module.exports = {
  getTemplateOptions,
  getTemplatePaths,
};
