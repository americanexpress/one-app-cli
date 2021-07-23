const fs = require('fs');

const ensureDirectoryPathExists = (pathToFolder) => {
  if (fs.existsSync(pathToFolder) === false) {
    // TODO: better folder permissions?
    fs.mkdirSync(pathToFolder, { recursive: true, mode: 0o777 });
  }
};

const isDirectory = (path) => fs.lstatSync(path).isDirectory();

module.exports = {
  ensureDirectoryPathExists,
  isDirectory,
};
