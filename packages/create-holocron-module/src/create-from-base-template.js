const path = require('path');
const fs = require('fs-extra');

const createFromBaseTemplate = async ({ modulePath }) => {
  const templatePath = path.resolve(__dirname, '../templates/default');
  fs.copySync(templatePath, modulePath);
};

module.exports = createFromBaseTemplate;
