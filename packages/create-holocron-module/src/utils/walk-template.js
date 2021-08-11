/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

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
