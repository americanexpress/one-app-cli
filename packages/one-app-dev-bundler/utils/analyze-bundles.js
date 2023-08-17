/*
 * Copyright 2022 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import fs from 'node:fs';
import ms from 'ms';
import path from 'node:path';
import chalk from 'chalk';
import filesize from 'filesize';

const BUNDLE_ENVS = ['browser', 'node'];
const BUNDLERS = ['webpack', 'esbuild'];

const readStatsFile = async (fileName) => {
  try {
    const content = await fs.promises.readFile(path.resolve(process.cwd(), fileName), 'utf-8');

    return content;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File "${fileName}" not found. This file is required in order to properly collect bundle data for analysis.`);
    }

    throw error;
  }
};

// eslint-disable-next-line consistent-return -- default case it not a possible case
const extractStats = (bundler, content) => {
  // eslint-disable-next-line default-case -- default case it not a possible case
  switch (bundler) {
    case 'webpack': {
      const data = content.assets[0]; // Note: This bundler only accepts one file at the moment

      return {
        bytes: data.size,
        time: content.time,
      };
    }
    case 'esbuild': {
      // TODO: Filter out map file
      // Note: This bundler only accepts one file at the moment
      const data = content[Object.keys(content)[0]];

      return {
        bytes: data.bytes,
        time: content.durationMs,
      };
    }
  }
};

const saveReport = async (stats) => {
  const fileName = '.bundler-report.json';

  try {
    fs.promises.writeFile(fileName, JSON.stringify(stats.map((obj) => ({
      ...obj,
      data: obj.data ? obj.data.map((dataObj, index) => ({
        bundler: BUNDLERS[index],
        ...dataObj,
      })) : undefined,
    })), null, 2));

    console.log(chalk.bold.green(`Report saved in ${fileName}`));
  } catch (error) {
    console.log(chalk.bold.redBright(`There was an error trying to save the report into ${fileName}`));
    console.error(error);
  }
};

const printReport = (stats) => {
  console.log(chalk.bold.bgCyanBright.black('   BUNDLE ANALYSIS   '));
  console.log('\n');

  stats.forEach(({ env, error, data }) => {
    console.log(chalk.bold.bgWhite.black(env.toUpperCase()));

    if (error) {
      console.log(chalk.bold.redBright(error));
    } else {
      const [webpackStats, esbuildStats] = data;
      const isEsbuildSmaller = esbuildStats.bytes < webpackStats.bytes;
      const isEsbuildFaster = esbuildStats.time < webpackStats.time;
      const percentageSmaller = (isEsbuildSmaller
        ? ((webpackStats.bytes - esbuildStats.bytes) * 100) / webpackStats.bytes
        : ((esbuildStats.bytes - webpackStats.bytes) * 100) / esbuildStats.bytes
      ).toFixed(0);
      const percentageFaster = (isEsbuildFaster
        ? ((webpackStats.time - esbuildStats.time) * 100) / webpackStats.time
        : ((esbuildStats.time - webpackStats.time) * 100) / esbuildStats.time
      ).toFixed(0);

      console.log(
        'Webpack Size',
        !isEsbuildSmaller
          ? chalk.bold.greenBright(filesize(webpackStats.bytes))
          : chalk.bold.redBright(filesize(webpackStats.bytes)),
        '-',
        'Took',
        !isEsbuildFaster
          ? chalk.bold.greenBright(ms(webpackStats.time))
          : chalk.bold.redBright(ms(webpackStats.time))
      );
      console.log(
        'Esbuild Size',
        isEsbuildSmaller
          ? chalk.bold.greenBright(filesize(esbuildStats.bytes))
          : chalk.bold.redBright(filesize(esbuildStats.bytes)),
        '-',
        'Took',
        isEsbuildFaster
          ? chalk.bold.greenBright(ms(esbuildStats.time))
          : chalk.bold.redBright(ms(esbuildStats.time))
      );

      console.log('');

      console.log(`${chalk.underline.greenBright(isEsbuildSmaller ? 'Esbuild' : 'Webpack')} is ${percentageSmaller}% smaller`);
      console.log(`${chalk.underline.greenBright(isEsbuildFaster ? 'Esbuild' : 'Webpack')} is ${percentageFaster}% faster`);

      console.log('\n');
    }
  });
};

const analyzeBundles = async () => {
  const result = await Promise.all(BUNDLE_ENVS.map(async (bundleEnv) => {
    try {
      return {
        env: bundleEnv,
        data: await Promise.all(
          BUNDLERS.map(
            async (bundler) => extractStats(
              bundler,
              JSON.parse(
                await readStatsFile(
                  `.${bundler}-stats.${bundleEnv}.json`
                )
              )
            )
          )
        ),
      };
    } catch (error) {
      return {
        env: bundleEnv,
        error: error.message,
      };
    }
  }));

  console.log(chalk.bold('NOTE: Bundle Analysis requires stats from Webpack and ESBuild. Please build your module with the One App Bundler as well with the Experimental One App Bundler first to generate the required stats (in production mode).'));

  printReport(result);
  await saveReport(result);
};

export default analyzeBundles;
