// Read the following to find out more:
// Configuring scenarios: https://github.com/americanexpress/parrot/blob/master/SCENARIOS.md

module.exports = {
  'hello world': [
    {
      request: '/hello',
      response: {
        data: 'hello world',
      },
    },
  ],
  'hello universe': [
    {
      request: '/hello',
      response: {
        data: 'hello universe',
      },
    },
  ],
};
