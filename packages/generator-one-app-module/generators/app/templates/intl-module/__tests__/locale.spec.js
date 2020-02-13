import path from 'path';
import { promisify } from 'util';

const glob = promisify(require('glob'));

const localeDir = path.join(__dirname, '../locale');

const schema = {
  properties: {
    loading: {
      type: 'string',
    },
    placeholder: {
      type: 'string',
    },
  },
  required: ['loading', 'placeholder'],
  additionalProperties: false,
};

describe('Language packs', () => {
  let locales = null;
  beforeAll(() => glob('*', { cwd: localeDir }).then((result) => {
    locales = result;
    return locales;
  }));

  it('should have the correct schema in each copy file', (done) => {
    const failures = [];
    locales.forEach((localeFile) => {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      const copy = require(path.join(localeDir, localeFile));
      try {
        expect(copy).toMatchSchema(schema, localeFile);
      } catch (error) {
        failures.push(error);
      }
    });

    if (failures.length > 0) {
      done.fail(failures);
    } else {
      done();
    }
  });
});
