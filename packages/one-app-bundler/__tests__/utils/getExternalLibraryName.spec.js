const getExternalLibraryName = require('../../utils/getExternalLibraryName');

describe('getExternalLibraryName', () => {
  it('outputs the external library name', () => {
    expect(getExternalLibraryName('my-external', '1.2.3')).toBe('__holocron_external__my_external__1_2_3');
  });
});
