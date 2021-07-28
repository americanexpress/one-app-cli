const fs = require('fs');
const path = require('path');
const { copyFile, renderAndWriteTemplateFile } = require('./fileRenderers');
const { isDirectory } = require('./directory');

const walkTemplate = (
  templateRootPath, outputRootPath, templateOptions
) => {
  fs.readdirSync(templateRootPath).forEach((fileName) => {
    const filePath = path.join(templateRootPath, fileName);

    if (isDirectory(filePath)) {
      walkTemplate(
        filePath,
        path.join(outputRootPath, fileName),
        templateOptions
      );
      return;
    }

    if (templateOptions.ignoredFileNames.indexOf(fileName) > -1) {
      return;
    }

    if (path.extname(fileName) === '.ejs') {
      renderAndWriteTemplateFile(
        filePath, outputRootPath, templateOptions
      );
      return;
    }

    copyFile(
      filePath, outputRootPath, templateOptions
    );
  });
};

module.exports = walkTemplate;
