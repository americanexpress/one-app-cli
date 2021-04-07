# @americanexpress/eslint-plugin-one-app

[![npm](https://img.shields.io/npm/v/@americanexpress/eslint-plugin-one-app)](https://www.npmjs.com/package/@americanexpress/eslint-plugin-one-app)

> This package has [Eslint](https://eslint.org/) rules to be used by
[One App](https://github.com/americanexpress/one-app) modules.

## 📖 Table of Contents

* [Usage](#-packages)
* [Rules](#-rules)
  
## 🤹‍Usage

### Usage outside one-app

You'll first need to install [Eslint](https://eslint.org/) and this package using the below command.

`npm install --save-dev eslint @americanexpress/eslint-plugin-one-app`

Add `@americanexpress/one-app` to the plugins section of your `.eslintrc` configuration file. You
can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["@americanexpress/one-app"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "@americanexpress/one-app/no-app-config-on-client": "printError",
  }
}
```

See
[ESLint documentation](http://eslint.org/docs/user-guide/configuring#extending-configuration-files)
for more information about extending configuration files.

## 📜 Rules

| Rule                                                                                                                                 | Description                                                                            | Fixable |
|--------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|---------|
| [@americanexpress/one-app/no-app-config-on-client](./rules/no-app-config-on-client.docs.md)                              | Disallows `appConfig` details from being included in client bundles | false   |
