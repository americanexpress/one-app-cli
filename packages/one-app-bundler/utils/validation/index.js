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
const Joi = require('@hapi/joi');

const externalsSchema = Joi.array().items(Joi.string().required()).messages({
  'array.base': 'Externals must be an array.',
  'array.includesRequiredUnknowns': 'Externals must have at least one entry.',
  'string.base': 'Externals must contain strings.',
});

const webpackConfigSchema = Joi.string().messages({
  'string.base': 'Webpack Configs must be a string.',
});

const performanceBudgetSchema = Joi.number();

const appSchema = Joi.object().keys({
  compatibility: Joi.string(),
});

const purgecssSchema = Joi.object({
  paths: Joi.array().items(Joi.string().required()),
  extractors: Joi.array().items(Joi.object().keys({
    extractor: Joi.string(),
    extensions: Joi.array().items(Joi.string().required()),
  }).required()),
  fontFace: Joi.boolean(),
  keyframes: Joi.boolean(),
  variables: Joi.boolean(),
  whitelist: Joi.array().items(Joi.string().required()),
  whitelistPatterns: Joi.array().items(Joi.string().required()),
  whitelistPatternsChildren: Joi.array().items(Joi.string().required()),
  disabled: Joi.boolean(),
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
});

function validateSchema(schema, validationTarget) {
  const { error, value, warning } = schema.validate(
    validationTarget
  );
  if (error) throw error;
  if (warning) {
    console.warn(warning);
  }
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
