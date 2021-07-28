const fs = require('fs');
const path = require('path');
const { ensureDirectoryPathExists } = require('./directory');

const readFile = (filePath) => fs.readFileSync(filePath, 'utf8');

const writeFile = (filePath, fileContent) => {
  ensureDirectoryPathExists(path.dirname(filePath));
  fs.writeFileSync(filePath, fileContent);
};

const renderDynamicFileName = (fileNameTemplate, templateOptions) => {
  if (fileNameTemplate in templateOptions.dynamicFileNames) {
    return templateOptions.dynamicFileNames[fileNameTemplate];
  }
  return fileNameTemplate;
};

module.exports = {
  readFile,
  writeFile,
  renderDynamicFileName,
};
