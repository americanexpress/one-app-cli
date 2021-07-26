const fs = require('fs');
const path = require('path');
const { copyFile, renderAndWriteTemplateFile } = require('./files');
const { isDirectory } = require('./directory');

const walkTemplate = (
  templateRootPath, outputRootPath, templateOptions
) => {
  fs.readdirSync(templateRootPath).forEach((fileName) => {
    if (templateOptions.ignoredFileNames.indexOf(fileName) > -1) {
      return;
    }

    const filePath = path.join(templateRootPath, fileName);

    if (path.extname(fileName) === '.ejs') {
      renderAndWriteTemplateFile(
        filePath, outputRootPath, templateOptions
      );
      return;
    }

    if (isDirectory(filePath)) {
      walkTemplate(
        filePath,
        path.join(outputRootPath, fileName),
        templateOptions
      );
      return;
    }

    copyFile(
      filePath, outputRootPath, templateOptions
    );
  });
};

module.exports = walkTemplate;
