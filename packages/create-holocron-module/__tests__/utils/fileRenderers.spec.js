const ejs = require('ejs');
const { readFile, writeFile, renderDynamicFileName } = require('../../src/utils/files');
const { copyFile, renderAndWriteTemplateFile } = require('../../src/utils/fileRenderers');
const { getFormatter } = require('../../src/utils/formatters');

jest.mock('../../src/utils/files', () => ({
  readFile: jest.fn((filePath) => `fileContentFor(${filePath})`),
  writeFile: jest.fn(),
  renderDynamicFileName: jest.fn((filePath) => `dynamicNameFor(${filePath})`),
}));
jest.mock('../../src/utils/formatters', () => ({
  getFormatter: jest.fn(() => (content) => `formattedStringFor(${content})`),
}));
jest.mock('ejs', () => ({
  render: jest.fn((filePath, values) => `ejsRenderFor(${filePath})with(${values})`),
}));

describe('fileRenderers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('copyFile', () => {
    it('should render the dynamic name, then read and write the requested file', () => {
      copyFile('file/path/mock.js', 'output/path/mock', 'templateOptionsMock');

      expect(renderDynamicFileName).toHaveBeenCalledTimes(1);
      expect(renderDynamicFileName).toHaveBeenNthCalledWith(1, 'mock.js', 'templateOptionsMock');

      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenNthCalledWith(1, 'file/path/mock.js');

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(writeFile).toHaveBeenNthCalledWith(1, 'output/path/mock/dynamicNameFor(mock.js)', 'fileContentFor(file/path/mock.js)');
    });
  });
  describe('renderAndWriteTemplatefile', () => {
    it('should read the file and render it with ejs, format it, render the dynamic name, then write the file', () => {
      renderAndWriteTemplateFile('file/path/mock.js', 'output/path/mock', { templateValues: 'templateValuesMock' });

      expect(readFile).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenNthCalledWith(1, 'file/path/mock.js');

      expect(getFormatter).toHaveBeenCalledTimes(1);
      expect(getFormatter).toHaveBeenNthCalledWith(1, '.js');

      expect(ejs.render).toHaveBeenCalledTimes(1);
      expect(ejs.render).toHaveBeenNthCalledWith(1, 'fileContentFor(file/path/mock.js)', 'templateValuesMock');

      expect(renderDynamicFileName).toHaveBeenCalledTimes(1);
      expect(renderDynamicFileName).toHaveBeenNthCalledWith(1, 'mock.js', { templateValues: 'templateValuesMock' });

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(writeFile).toHaveBeenNthCalledWith(1, 'output/path/mock/dynamicNameFor(mock.js)', 'formattedStringFor(ejsRenderFor(fileContentFor(file/path/mock.js))with(templateValuesMock))');
    });
  });
});
