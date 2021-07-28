/* eslint-disable newline-per-chained-call */
const fs = require('fs');
const walkTemplate = require('../../src/utils/walk-template');
const { renderAndWriteTemplateFile, copyFile } = require('../../src/utils/fileRenderers');
const { isDirectory } = require('../../src/utils/directory');

jest.mock('fs', () => ({
  readdirSync: jest.fn(),
}));
jest.mock('../../src/utils/fileRenderers', () => ({
  renderAndWriteTemplateFile: jest.fn(),
  copyFile: jest.fn(),
}));
jest.mock('../../src/utils/directory', () => ({
  isDirectory: jest.fn(() => false),
}));

describe('walkTemplate', () => {
  let filesMock = [];
  let templateOptionsMock;
  beforeEach(() => {
    jest.clearAllMocks();
    fs.readdirSync.mockImplementation(() => filesMock);

    templateOptionsMock = {
      templateValue: {},
      ignoredFileNames: [],
      dynamicFileNames: [],
    };
  });
  it('should call nothing if a file in that directory is ignored', () => {
    filesMock = ['ignored.html'];
    templateOptionsMock.ignoredFileNames = ['ignored.html'];
    walkTemplate('template/root/path/mock', 'output/root/path/mock', templateOptionsMock);

    expect(fs.readdirSync).toHaveBeenCalledTimes(1);
    expect(fs.readdirSync).toHaveBeenNthCalledWith(1, 'template/root/path/mock');

    expect(renderAndWriteTemplateFile).toHaveBeenCalledTimes(0);
    expect(copyFile).toHaveBeenCalledTimes(0);
  });
  it('should call renderAndWriteTemplateFile if a file in that directory has the .ejs extension', () => {
    filesMock = ['fileMock.html.ejs'];
    walkTemplate('template/root/path/mock', 'output/root/path/mock', templateOptionsMock);

    expect(fs.readdirSync).toHaveBeenCalledTimes(1);
    expect(fs.readdirSync).toHaveBeenNthCalledWith(1, 'template/root/path/mock');

    expect(renderAndWriteTemplateFile).toHaveBeenCalledTimes(1);
    expect(renderAndWriteTemplateFile).toHaveBeenNthCalledWith(1, 'template/root/path/mock/fileMock.html.ejs', 'output/root/path/mock', templateOptionsMock);

    expect(copyFile).toHaveBeenCalledTimes(0);
  });
  it('should recurse if a file in that directory is a directory', () => {
    isDirectory.mockImplementationOnce(() => true);
    fs.readdirSync.mockImplementationOnce(() => ['dirMock']).mockImplementationOnce(() => []);
    walkTemplate('template/root/path/mock', 'output/root/path/mock', templateOptionsMock);

    expect(fs.readdirSync).toHaveBeenCalledTimes(2);
    expect(fs.readdirSync).toHaveBeenNthCalledWith(1, 'template/root/path/mock');
    expect(fs.readdirSync).toHaveBeenNthCalledWith(2, 'template/root/path/mock/dirMock');

    expect(renderAndWriteTemplateFile).toHaveBeenCalledTimes(0);
    expect(copyFile).toHaveBeenCalledTimes(0);
  });
  it('should call copyFile if no other condition is true', () => {
    filesMock = ['copyFileMock.html'];
    walkTemplate('template/root/path/mock', 'output/root/path/mock', templateOptionsMock);

    expect(fs.readdirSync).toHaveBeenCalledTimes(1);
    expect(fs.readdirSync).toHaveBeenNthCalledWith(1, 'template/root/path/mock');

    expect(renderAndWriteTemplateFile).toHaveBeenCalledTimes(0);

    expect(copyFile).toHaveBeenCalledTimes(1);
    expect(copyFile).toHaveBeenNthCalledWith(1, 'template/root/path/mock/copyFileMock.html', 'output/root/path/mock', templateOptionsMock);
  });
  it('should call the correct combination of everything given a complex scenario', () => {
    // This test mimics this folder structure
    // folder1                -> recurse
    //    index.html          -> copyFile
    // folder2                -> recurse
    //    index.css.ejs       -> renderAndWriteTemplateFile
    //    index.js.ejs        -> renderAndWriteTemplateFile
    //    indexIgnore.js      -> ignore
    // root.html              -> copyFile
    // rootIgnore.html        -> ignore

    fs.readdirSync.mockImplementationOnce(
      () => ['folder1', 'folder2', 'root.html', 'rootIgnore.html']
    ).mockImplementationOnce(
      () => ['index.html']
    ).mockImplementationOnce(
      () => ['index.css.ejs', 'index.js.ejs', 'indexIgnore.js']
    );
    isDirectory.mockImplementationOnce(
      () => true // folder 1
    ).mockImplementationOnce(
      () => false // index.html
    ).mockImplementationOnce(
      () => true // folder 2
    ).mockImplementationOnce(
      () => false // index.css.ejs
    ).mockImplementationOnce(
      () => false // index.js.ejs
    ).mockImplementationOnce(
      () => false // indexIgnore.js
    ).mockImplementationOnce(
      () => false // root.html
    ).mockImplementationOnce(
      () => false // rootIgnore.html
    );

    templateOptionsMock.ignoredFileNames = ['indexIgnore.js', 'rootIgnore.html'];

    walkTemplate('template/root/path/mock', 'output/root/path/mock', templateOptionsMock);

    expect(fs.readdirSync).toHaveBeenCalledTimes(3);
    expect(fs.readdirSync).toHaveBeenNthCalledWith(1, 'template/root/path/mock');
    expect(fs.readdirSync).toHaveBeenNthCalledWith(2, 'template/root/path/mock/folder1');
    expect(fs.readdirSync).toHaveBeenNthCalledWith(3, 'template/root/path/mock/folder2');

    expect(renderAndWriteTemplateFile).toHaveBeenCalledTimes(2);
    expect(renderAndWriteTemplateFile).toHaveBeenNthCalledWith(1, 'template/root/path/mock/folder2/index.css.ejs', 'output/root/path/mock/folder2', templateOptionsMock);
    expect(renderAndWriteTemplateFile).toHaveBeenNthCalledWith(2, 'template/root/path/mock/folder2/index.js.ejs', 'output/root/path/mock/folder2', templateOptionsMock);

    expect(copyFile).toHaveBeenCalledTimes(2);
    expect(copyFile).toHaveBeenNthCalledWith(1, 'template/root/path/mock/folder1/index.html', 'output/root/path/mock/folder1', templateOptionsMock);
    expect(copyFile).toHaveBeenNthCalledWith(2, 'template/root/path/mock/root.html', 'output/root/path/mock', templateOptionsMock);
  });
});
