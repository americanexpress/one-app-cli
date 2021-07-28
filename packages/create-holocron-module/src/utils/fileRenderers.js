const ejs = require('ejs');
const path = require('path');
const { readFile, writeFile, renderDynamicFileName } = require('./files');
const { getFormatter } = require('./formatters');

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
