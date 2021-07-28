const mkdirp = require('mkdirp');
const mkdirpPromisified = require('../../src/mkdirp');

jest.mock('mkdirp', () => jest.fn()
);

const flushPromises = () => new Promise(setImmediate);

describe('mkdirp', () => {
  let resolvedWith;
  let rejectedWith;
  beforeEach(() => {
    resolvedWith = undefined;
    rejectedWith = undefined;
    jest.clearAllMocks();
  });
  it('should resolve as a promise if the callback is not passed an error', async () => {
    mkdirp.mockImplementation((_1, _2, callback) => callback(null, 'madeMock'));
    mkdirpPromisified('dirMocks', 'optsMocks')
      .then((val) => { resolvedWith = val; })
      .catch((err) => { rejectedWith = err; });

    await flushPromises();

    expect(mkdirp).toHaveBeenCalledTimes(1);
    expect(mkdirp).toHaveBeenNthCalledWith(1, 'dirMocks', 'optsMocks', expect.any(Function));

    expect(resolvedWith).toBe('madeMock');
    expect(rejectedWith).toBe(undefined);
  });
  it('should reject as a promise if the callback is passed an error', async () => {
    mkdirp.mockImplementation((_1, _2, callback) => callback('errMock', 'madeMock'));
    mkdirpPromisified('dirMocks', 'optsMocks')
      .then((val) => { resolvedWith = val; })
      .catch((err) => { rejectedWith = err; });

    await flushPromises();

    expect(mkdirp).toHaveBeenCalledTimes(1);
    expect(mkdirp).toHaveBeenNthCalledWith(1, 'dirMocks', 'optsMocks', expect.any(Function));

    expect(resolvedWith).toBe(undefined);
    expect(rejectedWith).toBe('errMock');
  });
});
