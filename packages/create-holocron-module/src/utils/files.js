const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const { getFormatter } = require('./formatters');
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

const copyFile = (
  filePath, outputRootPath, templateOptions
) => {
  const dynamicFileName = renderDynamicFileName(path.basename(filePath), templateOptions);
  writeFile(
    path.join(outputRootPath, dynamicFileName),
    readFile(filePath)
  );
};

const renderAndWriteTemplateFile = (
  inputFilePath,
  outputRootPath,
  templateOptions
) => {
  const targetFileName = path.basename(inputFilePath, '.ejs');
  const output = ejs.render(readFile(inputFilePath), templateOptions.templateValues);
  const dynamicFileName = renderDynamicFileName(targetFileName, templateOptions);
  writeFile(
    path.join(outputRootPath, dynamicFileName),
    getFormatter(path.extname(targetFileName))(output)
  );
};

module.exports = {
  renderAndWriteTemplateFile,
  copyFile,
};
