const fetch = require('node-fetch');

const waitForOK = ({
  url,
  timeout,
}) => new Promise((resolve) => {
  let timeoutHandle; // to clear timeout if fetch resolves to true
  console.log(timeoutHandle);
  const interval = setInterval(async () => {
    try {
      console.count('setInterval');
      const status = (await fetch(url)).ok;

      clearInterval(interval);
      clearTimeout(timeoutHandle);
      resolve(status);
    } catch (e) { // do nothing, the below timeout will break the loop
    }
  }, 1000);

  timeoutHandle = setTimeout(() => {
    console.count('TimeoutHandle');
    clearInterval(interval);
    resolve(false);
  }, timeout);
});

module.exports = {
  waitForOK,
};
