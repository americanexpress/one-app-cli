const fetch = require('node-fetch');
const waitForOK = require('../../utils/waitForOK');

jest.mock('node-fetch');

describe('waitForOk', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should resolve to true if the URL quickly returns an OK status', async () => {
    expect.assertions(1);
    fetch
      .mockClear()
      .mockImplementation(() => Promise.resolve({ ok: true }));
    const waitingPromise = waitForOK({ url: 'http://mockurl.com', timeout: 3000 });
    jest.advanceTimersByTime(0);
    await expect(waitingPromise).resolves.toBe(true);
  });

  it('should resolve to true if the URL returns an OK status before the timeout', async () => {
    expect.assertions(1);
    fetch
      .mockClear()
      .mockImplementationOnce(() => Promise.reject(new Error('connection mock refused')))
      .mockImplementationOnce(() => Promise.reject(new Error('connection mock refused')))
      .mockImplementation(() => Promise.resolve({ ok: true }));
    const waitingPromise = waitForOK({ url: 'http://mockurl.com', timeout: 3000 });
    jest.advanceTimersByTime(2500);
    await expect(waitingPromise).resolves.toBe(true);
  });

  it('should reject if the URL does not return an OK status by the timeout', async () => {
    expect.assertions(1);
    fetch
      .mockClear()
      .mockImplementation(() => Promise.reject(new Error('connection mock refused')));
    const waitingPromise = waitForOK({ url: 'http://mockurl.com', timeout: 1500 });
    jest.advanceTimersByTime(2500);
    await expect(waitingPromise).rejects.toMatchInlineSnapshot('[Error: timed out after 1500ms]');
  });

  it('should reject if the abort controller signal triggers before polling gets an OK status', async () => {
    expect.assertions(1);

    fetch
      .mockClear()
      .mockImplementation(() => Promise.reject(new Error('connection mock refused')));

    const abortController = new AbortController();
    const waitingPromise = waitForOK({ url: 'http://mockurl.com', timeout: 3000, signal: abortController.signal });
    jest.advanceTimersByTime(2000);
    abortController.abort();
    await expect(waitingPromise).rejects.toMatchInlineSnapshot('[Error: AbortError: This operation was aborted]');
  });
});
