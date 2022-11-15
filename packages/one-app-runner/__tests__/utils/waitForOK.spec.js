const fetch = require('node-fetch');
const { waitForOK } = require('../../utils/waitForOK');

jest.mock('node-fetch', () => jest.fn(() => Promise.resolve({ ok: true })));

describe('waitForOk', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should resolve to true if the url already returns an OK status', async () => {
    expect.assertions(1);
    const waitingPromise = waitForOK({ url: 'http://mockurl.com', timeout: 3000 });
    jest.advanceTimersByTime(0);
    await expect(waitingPromise).resolves.toBe(true);
  });

  it('should resolve to true if the url returns an OK status before the timeout', async () => {
    expect.assertions(1);
    fetch.mockImplementationOnce(() => Promise.reject(new Error('connection mock refused')));
    fetch.mockImplementationOnce(() => Promise.reject(new Error('connection mock refused')));
    const waitingPromise = waitForOK({ url: 'http://mockurl.com', timeout: 3000 });
    jest.advanceTimersByTime(2500);
    await expect(waitingPromise).resolves.toBe(true);
  });

  it('should resolve to false if the url does not return an OK status by the timeout', async () => {
    expect.assertions(1);
    fetch.mockImplementationOnce(() => Promise.reject(new Error('connection mock refused')));
    fetch.mockImplementationOnce(() => Promise.reject(new Error('connection mock refused')));
    const waitingPromise = waitForOK({ url: 'http://mockurl.com', timeout: 1500 });
    jest.advanceTimersByTime(2500);
    await expect(waitingPromise).resolves.toBe(false);
  });
});
