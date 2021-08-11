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
