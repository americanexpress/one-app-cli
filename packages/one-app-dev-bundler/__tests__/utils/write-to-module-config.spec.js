import fs from 'node:fs';
import writeToModuleConfig from '../../utils/write-to-module-config';

jest.mock('node:fs', () => ({
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(() => JSON.stringify({})),
  existsSync: jest.fn(),
}));

jest.mock('read-pkg-up', () => ({
  readPackageUpSync: () => ({
    packageJson: {
      name: 'my-module-name',
      version: '1.2.3',
    },
  }),
}));

describe('write-to-module-config', () => {
  beforeAll(() => {
    process.cwd = () => '/mock-path';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('module-config.json does not exist', () => {
    beforeEach(() => {
      fs.existsSync.mockImplementation(() => false);
    });

    it('successfully writes to module config', () => {
      writeToModuleConfig({ my: 'module-config' });
      expect(fs.writeFileSync).toHaveBeenCalledWith('/mock-path/build/1.2.3/module-config.json', '{\n  "my": "module-config"\n}');
    });
  });

  describe('module-config.json exists', () => {
    beforeEach(() => {
      fs.existsSync.mockImplementation(() => true);
      fs.readFileSync.mockImplementation(() => JSON.stringify({
        hello: 'im here',
      }));
    });

    it('successfully writes to module config', () => {
      writeToModuleConfig({ my: 'module-config' });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/mock-path/build/1.2.3/module-config.json',
        '{\n  "hello": "im here",\n  "my": "module-config"\n}'
      );
    });
  });
});
