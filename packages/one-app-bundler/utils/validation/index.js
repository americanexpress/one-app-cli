/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
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
const Joi = require('joi');

const externalsSchema = Joi.array().items(Joi.string().required()).messages({
  'array.base': 'Externals must be an array',
  'array.includesRequiredUnknowns': 'Externals must have at least one entry',
  'string.base': 'Externals must contain strings',
});

const webpackConfigSchema = Joi.string().messages({
  'string.base': 'Webpack Configs must be a string',
});

const performanceBudgetSchema = Joi.number().strict();

const appSchema = Joi.object().keys({
  compatibility: Joi.string(),
});

const purgecssSchema = Joi.object({
  paths: Joi.array().items(Joi.string().required()),
  extractors: Joi.array().items(Joi.object().keys({
    extractor: Joi.string(),
    extensions: Joi.array().items(Joi.string().required()),
  }).required()),
  fontFace: Joi.boolean().strict(),
  keyframes: Joi.boolean().strict(),
  variables: Joi.boolean().strict(),
  /* eslint-disable inclusive-language/use-inclusive-words --
  config options for a third party library */
  whitelist: Joi.array().items(Joi.string().required()),
  whitelistPatterns: Joi.array().items(Joi.string().required()),
  whitelistPatternsChildren: Joi.array().items(Joi.string().required()),
  safelist: Joi.alternatives().try(Joi.array().items(Joi.string()),
    Joi.object().keys({
      standard: Joi.array().items(Joi.string()),
      deep: Joi.array().items(Joi.string()),
      greedy: Joi.array().items(Joi.string()),
      keyframes: Joi.boolean().strict(),
      variables: Joi.boolean().strict(),
    })),
  blocklist: Joi.array().items(Joi.string().required()),
  /* eslint-enable inclusive-language/use-inclusive-words -- disables require enables */
  disabled: Joi.boolean().strict(),
});

const optionsSchema = Joi.object({
  providedExternals: externalsSchema,
  requiredExternals: externalsSchema,
  performanceBudget: performanceBudgetSchema,
  app: appSchema,
  purgecss: purgecssSchema,
  webpackConfigPath: webpackConfigSchema,
  webpackClientConfigPath: webpackConfigSchema,
  webpackServerConfigPath: webpackConfigSchema,
  disableDevelopmentLegacyBundle: Joi.boolean(),
});

function validateSchema(schema, validationTarget) {
  const { error, value } = schema.validate(
    validationTarget,
    { abortEarly: false }
  );
  if (error) throw error;

  return value;
}

function validateBundler(options) {
  return validateSchema(optionsSchema, options);
}

module.exports = {
  externalsSchema,
  webpackConfigSchema,
  performanceBudgetSchema,
  appSchema,
  purgecssSchema,
  validateBundler,
};
