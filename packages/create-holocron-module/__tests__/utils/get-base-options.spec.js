const prompts = require('prompts');
const getBaseOptions = require('../../src/utils/get-base-options');

jest.mock('prompts', () => jest.fn(() => 'promptsResponseMock'));

describe('getBaseOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should call prompts with the correct set of base options', () => {
    getBaseOptions();
    expect(prompts).toHaveBeenCalledTimes(1);
    // snapshot params as its a large array that will grow over time.
    expect(prompts.mock.calls[0]).toMatchSnapshot();
  });
});
