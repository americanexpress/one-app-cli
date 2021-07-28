const templateApi = require('..');

describe('Template public api', () => {
  describe('getTemplatePaths', () => {
    it('should exist, and return an array of strings', () => {
      expect(typeof templateApi.getTemplatePaths).toBe('function');

      const paths = templateApi.getTemplatePaths();
      expect(Array.isArray(paths)).toBe(true);
      paths.forEach((path) => expect(typeof path).toBe('string'));
    });
  });
  describe('getTemplateOptions', () => {
    const baseData = {
      moduleName: 'module-name-mock',
    };
    let promptsMock;
    beforeEach(() => {
      promptsMock = jest.fn((arr) => arr.reduce((prompt, acc) => ({ ...acc, [prompt.name]: `${prompt.name}Mock` }), {}));
    });
    it('should exist and return an object with 1 required key', async () => {
      expect(typeof templateApi.getTemplateOptions).toBe('function');

      const templateOptions = await templateApi.getTemplateOptions(baseData, promptsMock);
      expect(typeof templateOptions).toBe('object');
      expect(typeof templateOptions.templateValues).toBe('object');
    });
    describe('templateOptions.templateValues', () => {
      it('should match the snapshot', async () => {
        const templateOptions = await templateApi.getTemplateOptions(baseData, promptsMock);
        expect(templateOptions.templateValues).toMatchSnapshot();
      });
      it('should match the snapshot when the prompts are all black', async () => {
        promptsMock = jest.fn((arr) => arr.reduce((prompt, acc) => ({ ...acc, [prompt.name]: '' }), {}));
        const templateOptions = await templateApi.getTemplateOptions(baseData, promptsMock);
        expect(templateOptions.templateValues).toMatchSnapshot();
      });
      it('should call Prompts with the correct config', async () => {
        await templateApi.getTemplateOptions(baseData, promptsMock);
        expect(promptsMock.mock.calls[0][0]).toMatchSnapshot();
      });
    });
    describe('templateOptions.dynamicFileNames', () => {
      it('should if present, should match the snapshot', async () => {
        const templateOptions = await templateApi.getTemplateOptions(baseData, promptsMock);
        expect(templateOptions.dynamicFileNames).toMatchSnapshot();
      });
    });
    describe('templateOptions.ignoredFileNames', () => {
      it('should if present, should match the snapshot', async () => {
        const templateOptions = await templateApi.getTemplateOptions(baseData, promptsMock);
        expect(templateOptions.ignoredFileNames).toMatchSnapshot();
      });
    });
  });
});
