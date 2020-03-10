const parrot = require('parrot-middleware');
const scenarios = require('./mock/scenarios');

module.exports = (app) => app.use(parrot(scenarios));
