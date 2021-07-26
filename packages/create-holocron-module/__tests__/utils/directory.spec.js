const fs = require('fs');
const { ensureDirectoryPathExists, isDirectory } = require('../../src/utils/directory');

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(() => true),
  lstatSync: jest.fn(() => ({
    isDirectory: jest.fn(() => 'isDirectoryMock'),
  })),
}));

describe('directory utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('ensureDirectoryPathExists', () => {
    it('should not call mkdirSync if existsSync returns trur', () => {
      ensureDirectoryPathExists('pathMock');
      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(fs.existsSync).toHaveBeenNthCalledWith(1, 'pathMock');
      expect(fs.mkdirSync).toHaveBeenCalledTimes(0);
    });
    it('should call mkdirSync if existsSync returns false', () => {
      fs.existsSync.mockImplementation(() => false);
      ensureDirectoryPathExists('pathMock');
      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(fs.existsSync).toHaveBeenNthCalledWith(1, 'pathMock');
      expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
      expect(fs.mkdirSync).toHaveBeenNthCalledWith(1, 'pathMock', { recursive: true, mode: 0o777 });
    });
  });
  describe('isDirectory', () => {
    it('should return the same value as returned from `isDirectory` called on the response from lstatSync', () => {
      expect(isDirectory('pathMock')).toBe('isDirectoryMock');
      expect(fs.lstatSync).toHaveBeenCalledTimes(1);
      expect(fs.lstatSync).toHaveBeenNthCalledWith(1, 'pathMock');
    });
  });
});
