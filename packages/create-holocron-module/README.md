# Create Holocron Module

A Holocron module generator.

# Install this tool globally

```bash
npm install -g create-holocron-module
```

# Generate a project from a template

`create-holocron-module <template-package-name>`

For example, generating a holocron module.

`create-holocron-module holocron-module-template`

This will create a new folder in the current directory. The folder will take the name from the `moduleName` prompt.

# Authoring Templates

A template is any npm package whose default export follows the below API.

```js
module.exports = {
  getTemplatePaths,
  getTemplateOptions,
};
```

## `getTemplatePaths`
`() => ([...'path'])`

### return
getTemplatePaths should return an array of paths to your templates.

Each template will be processed left to right, with latter templates overwriting files written by earier ones.

In most cases it will be sufficient to simply have one template path.

The files in a template path will be recursively walked.

If the file name has the .ejs suffix then this suffix will be removed, and this file will be executed by ejs with the `templateValues` returned by `getTemplateOptions`(see below).

Directory structures will be copied exactly, and files will be placed in the same directory in the output as they were in the template.

It is possible to define dynamic file names, and ignore files, based upon user input (see `getTemplateOptions` below)

## `getTemplateOptions`
`async (baseData, prompts) => ({templateValues[, dynamicFileNames, ignoredFileNames]})`

getTemplateOptions will be called to allow your template to configure its dynamic values.

### Parameters
getTemplateOptions will be passed 2 parameters

#### `baseData`
baseData is an object containing the values received from the base prompts.

At this time the only peice of base data is `moduleName`

#### `prompts`
prompts is a reference to the `prompts` library. Your template should call this to promt the user for any dynamic values you need.

You should merge baseData with the result of the prompts your template needs, and return this under the `templateValues` key


### return
getTemplateOptions should return an object. `templateValues` is the only required key.

#### `templateValues` object, required
The combination of baseData and the result from your call to `prompts`. This is the object that will be passed to your EJS template files, so you must make sure that all the keys you expect are present in this object

for example, if you wished to ask the user if they want to include an eslint config, you would return the following object:

```js
let templateValues = {
    ...baseData,
    ...await prompts([
      {
        type: 'text',
        name: 'eslint',
        message: 'Do you want an eslint config (y/n)',
        initial: '',
      },
    ]),
  };
```

#### `dynamicFileNames` object<string, string>, optional
When the generator is ready to write a file to the users project, it will first check this object for a key matching the fileName it is to use. If the key is present, it will instead use the value against that key as the file name.

For example, if you have a file in your template called `RootComponent.jsx.ejs` that you wanted to dynamically rewrite to `{baseData.moduleName}.jsx` you would return the following object:
```jsx
const dynamicFileNames = {
  'RootComponent.jsx': `${baseData.moduleName}.jsx`
}
```
Note that the key doesnt contain the .ejs suffix, as this will always be removed by the generator

#### `ignoredFileNames` array<string>, optional
When the generator is ready to read a file from your template, it will first check this array for a string matching the fileName it is to use. If the key is string, it will entirely skip this file.

For example, if you have a file in your template called `.eslintrc.json.ejs` that you only want to write if the user has asked for eslint you would return
```jsx
const ignoredFileNames = [];

if (templateValues.eslint !== 'y') {
  ignoredFiles.push('.eslintrc.json.ejs');
}
```
Note that the string does contain the .ejs suffix, since the ignore applies when reading the file, the string should exactly match the name of the file in your template.
