const fetch = require('node-fetch');

const waitForOK = ({
  url,
  timeout,
}) => new Promise((resolve) => {
  let timeoutHandle; // to clear timeout if fetch resolves to true
  const interval = setInterval(async () => {
    try {
      const status = (await fetch(url)).ok;
      clearInterval(interval);
      clearTimeout(timeoutHandle);
      resolve(status);
    } catch (e) { // do nothing, the below timeout will break the loop
    }
  }, 1000);

  timeoutHandle = setTimeout(() => {
    clearInterval(interval);
    resolve(false);
  }, timeout);

  setTimeout(async () => {
    try {
      const status = (await fetch(url)).ok;
      clearInterval(interval);
      clearTimeout(timeoutHandle);
      resolve(status);
    } catch (e) {
      // do nothing, The function is already polling
    }
  }, 0);
});

module.exports = {
  waitForOK,
};
