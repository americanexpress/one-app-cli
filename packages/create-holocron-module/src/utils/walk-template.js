const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { ensureDirectoryPathExists, isDirectory } = require('./directory');
const { getFormatter } = require('./formatters');

const compileTemplate = (templatePath, rootPath) => ejs.compile(fs.readFileSync(templatePath, 'utf8'), {
  root: rootPath,
});

const renderDynamicFileName = (fileNameTemplate, dynamicFileNames) => {
  if (fileNameTemplate in dynamicFileNames) {
    return dynamicFileNames[fileNameTemplate];
  }
  return fileNameTemplate;
};

const writeFile = (filePath, fileName, fileContent) => {
  fs.writeFileSync(`${filePath}/${fileName}`, fileContent);
};

const renderAndWriteTemplateFile = ({
  templateRootPath,
  fileName,
  dynamicFileNames,
  templateData,
  outputRootPath,
}) => {
  const targetFileName = path.basename(fileName, '.ejs');
  const output = compileTemplate(`${templateRootPath}/${fileName}`, templateRootPath)(templateData);
  ensureDirectoryPathExists(outputRootPath);
  writeFile(
    outputRootPath,
    renderDynamicFileName(targetFileName, dynamicFileNames),
    getFormatter(path.extname(targetFileName))(output)
  );
};

const copyFile = (templateRootPath, fileName, dynamicFileNames, outputRootPath) => {
  ensureDirectoryPathExists(outputRootPath);
  writeFile(outputRootPath, renderDynamicFileName(fileName, dynamicFileNames), fs.readFileSync(`${templateRootPath}/${fileName}`, 'utf8'));
};

const walkTemplate = ({
  templateRootPath, ignoredFileNames, dynamicFileNames, templateData, outputRootPath,
}) => {
  const files = fs.readdirSync(templateRootPath);
  files.forEach((filePath) => {
    if (ignoredFileNames.indexOf(filePath) > -1) {
      return;
    }

    if (path.extname(filePath) === '.ejs') {
      renderAndWriteTemplateFile({
        templateRootPath, fileName: filePath, dynamicFileNames, templateData, outputRootPath,
      });
      return;
    }

    if (isDirectory(`${templateRootPath}/${filePath}`)) {
      walkTemplate({
        templateRootPath: `${templateRootPath}/${filePath}`,
        ignoredFileNames,
        dynamicFileNames,
        templateData,
        outputRootPath: `${outputRootPath}/${filePath}`,
      });
      return;
    }

    copyFile(templateRootPath, filePath, dynamicFileNames, outputRootPath);
  });
};

module.exports = walkTemplate;
