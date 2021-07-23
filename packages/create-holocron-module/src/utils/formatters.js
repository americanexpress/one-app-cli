const prettier = require('prettier');

const formatJSX = (string) => prettier.format(string, {
  semi: true, parser: 'babel', jsxSingleQuote: true, singleQuote: true,
});
const formatJSON = (string) => JSON.stringify(JSON.parse(string), null, 2);

const getFormatter = (fileExtension) => {
  switch (fileExtension) {
    case '.jsx':
      return formatJSX;
    case '.json':
      return formatJSON;
    default:
      return (string) => string;
  }
};

module.exports = {
  getFormatter,
};
