/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

const fs = require('fs');

const mockFs = require('mock-fs');

const modulePath = __dirname.split('/__tests__')[0];
console.log(`Module path for test is ${modulePath}`);

jest.spyOn(process, 'cwd').mockImplementation(() => modulePath);

const compileModuleLocales = require('../../src/compileModuleLocales');

function expectFiles(list) {
  Object
    .keys(list)
    .forEach((filePath) => {
      expect(() => fs.readFileSync(filePath)).not.toThrow();
      expect(fs.readFileSync(filePath).toString()).toEqual(list[filePath]);
    });
}

function notExpectFiles(list) {
  list.forEach((filePath) => {
    expect(() => fs.readFileSync(filePath)).toThrow();
  });
}

describe('compileModuleLocales', () => {
  const pkgName = 'sample-thing';
  const pkgVersion = '0.1.0-post';
  const consoleLogSpy = jest.spyOn(console, 'log');

  beforeEach(jest.clearAllMocks);

  afterAll(mockFs.restore);

  it('builds locale that is a JSON file', () => {
    expect.assertions(8);
    mockFs({
      [`${process.cwd()}/package.json`]: JSON.stringify({
        name: pkgName,
        version: pkgVersion,
      }),
      [`${process.cwd()}/locale`]: {
        'sv-SE.json': JSON.stringify({
          hello: 'Hej',
          goodbye: 'Adjö',
        }),
      },
    });

    const compiled = JSON.stringify({
      locale: 'sv-SE',
      hello: 'Hej',
      goodbye: 'Adjö',
    });

    return compileModuleLocales(process.cwd())
      .then(() => {
        expectFiles({
          [`${process.cwd()}/build/${pkgVersion}/sv-se/${pkgName}.json`]: compiled,
          [`${process.cwd()}/build/${pkgVersion}/sv-se/qa.json`]: compiled,
          [`${process.cwd()}/build/${pkgVersion}/sv-se/integration.json`]: compiled,
        });
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith('Generated language packs for sv-SE');
      });
  });

  it('builds locale that is a dir with copy.json', () => {
    expect.assertions(8);
    mockFs({
      [`${process.cwd()}/package.json`]: JSON.stringify({
        name: pkgName,
        version: pkgVersion,
      }),
      [`${process.cwd()}/locale`]: {
        // directory w/o environments
        'es-ES': {
          'copy.json': JSON.stringify({
            hello: 'Hola',
            goodbye: 'Adiós',
          }),
        },
      },
    });

    const compiled = JSON.stringify({
      locale: 'es-ES',
      hello: 'Hola',
      goodbye: 'Adiós',
    });

    return compileModuleLocales(process.cwd())
      .then(() => {
        expectFiles({
          [`${process.cwd()}/build/${pkgVersion}/es-es/${pkgName}.json`]: compiled,
          [`${process.cwd()}/build/${pkgVersion}/es-es/qa.json`]: compiled,
          [`${process.cwd()}/build/${pkgVersion}/es-es/integration.json`]: compiled,
        });
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith('Generated language packs for es-ES');
      });
  });
  it('builds locale that has environment JSON', () => {
    expect.assertions(8);
    mockFs({
      [`${process.cwd()}/package.json`]: JSON.stringify({
        name: pkgName,
        version: pkgVersion,
      }),
      [`${process.cwd()}/locale`]: {
        // directory w/environments
        'nl-NL': {
          'copy.json': JSON.stringify({ hello: 'Hallo' }),
          goodbye: {
            'integration.json': JSON.stringify({ farewell: 'vaarwel' }),
            'qa.json': JSON.stringify({ farewell: 'Vaarwel' }),
            'production.json': JSON.stringify({ farewell: 'Vaarwel!' }),
          },
        },
      },
    });

    return compileModuleLocales(process.cwd())
      .then(() => {
        expectFiles({
          [`${process.cwd()}/build/${pkgVersion}/nl-nl/${pkgName}.json`]: JSON.stringify({
            locale: 'nl-NL',
            hello: 'Hallo',
            goodbye: {
              farewell: 'Vaarwel!',
            },
          }),
          [`${process.cwd()}/build/${pkgVersion}/nl-nl/qa.json`]: JSON.stringify({
            locale: 'nl-NL',
            hello: 'Hallo',
            goodbye: {
              farewell: 'Vaarwel',
            },
          }),
          [`${process.cwd()}/build/${pkgVersion}/nl-nl/integration.json`]: JSON.stringify({
            locale: 'nl-NL',
            hello: 'Hallo',
            goodbye: {
              farewell: 'vaarwel',
            },
          }),
        });
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith('Generated language packs for nl-NL');
      });
  });

  it('removes language packs from build that have been removed in source', () => {
    expect.assertions(11);
    mockFs({
      [`${process.cwd()}/package.json`]: JSON.stringify({
        name: pkgName,
        version: pkgVersion,
      }),
      [`${process.cwd()}/locale`]: {
        'sv-SE.json': JSON.stringify({
          hello: 'Hej',
          goodbye: 'Adjö',
        }),
      },
      [`${process.cwd()}/build/${pkgVersion}`]: {
        'en-us': {
          [`${pkgName}.json`]: JSON.stringify({}),
          'qa.json': JSON.stringify({}),
          'integration.json': JSON.stringify({}),
        },
      },
    });

    const compiled = JSON.stringify({
      locale: 'sv-SE',
      hello: 'Hej',
      goodbye: 'Adjö',
    });

    return compileModuleLocales(process.cwd())
      .then(() => {
        expectFiles({
          [`${process.cwd()}/build/${pkgVersion}/sv-se/${pkgName}.json`]: compiled,
          [`${process.cwd()}/build/${pkgVersion}/sv-se/qa.json`]: compiled,
          [`${process.cwd()}/build/${pkgVersion}/sv-se/integration.json`]: compiled,
        });
        notExpectFiles([
          `${process.cwd()}/build/${pkgVersion}/en-us/${pkgName}.json`,
          `${process.cwd()}/build/${pkgVersion}/en-us/qa.json`,
          `${process.cwd()}/build/${pkgVersion}/en-us/integration.json`,
        ]);
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith('Generated language packs for sv-SE');
      });
  });

  it('does not remove files that are not language packs', () => {
    expect.assertions(14);
    const module = (() => null).toString();

    mockFs({
      [`${process.cwd()}/package.json`]: JSON.stringify({
        name: pkgName,
        version: pkgVersion,
      }),
      [`${process.cwd()}/locale`]: {
        'sv-SE.json': JSON.stringify({
          hello: 'Hej',
          goodbye: 'Adjö',
        }),
      },
      [`${process.cwd()}/build/${pkgVersion}`]: {
        [`${pkgName}.client.js`]: module,
        [`${pkgName}.node.js`]: module,
        assets: {
          'someFile.json': JSON.stringify({}),
        },
      },
    });

    const compiled = JSON.stringify({
      locale: 'sv-SE',
      hello: 'Hej',
      goodbye: 'Adjö',
    });

    return compileModuleLocales(process.cwd())
      .then(() => {
        expectFiles({
          [`${process.cwd()}/build/${pkgVersion}/sv-se/${pkgName}.json`]: compiled,
          [`${process.cwd()}/build/${pkgVersion}/sv-se/qa.json`]: compiled,
          [`${process.cwd()}/build/${pkgVersion}/sv-se/integration.json`]: compiled,
          [`${process.cwd()}/build/${pkgVersion}/${pkgName}.client.js`]: module,
          [`${process.cwd()}/build/${pkgVersion}/${pkgName}.node.js`]: module,
          [`${process.cwd()}/build/${pkgVersion}/assets/someFile.json`]: JSON.stringify({}),
        });
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith('Generated language packs for sv-SE');
      });
  });

  it('handles a missing locale dir', () => {
    expect.assertions(2);

    mockFs({
      [`${process.cwd()}/package.json`]: JSON.stringify({
        name: pkgName,
        version: pkgVersion,
      }),
    });

    return compileModuleLocales(process.cwd())
      .then(() => {
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith('Generated 0 language packs.');
      });
  });
});
