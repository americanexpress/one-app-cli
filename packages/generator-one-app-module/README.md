# @americanexpress/generator-one-app-module

> yeoman generator for a bare-bones [One App](https://github.com/americanexpress/one-app#modules) `holocron` Module

## 🤹‍ Usage

Assuming you have [npx installed](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) (comes with `npm` on versions 5.2.0 and above):

```bash
npx -p yo -p @americanexpress/generator-one-app-module -- yo @americanexpress/one-app-module
```

The generator will start up and prompt you with the following questions:
- What is the name of your module?
- Is this a [root module or child module](https://github.com/americanexpress/one-app/blob/main/docs/api/API.md#modules)?
- Generate with [Parrot Middleware](https://github.com/americanexpress/parrot)?
- Setup with [internationalization](https://github.com/americanexpress/one-app/blob/main/docs/api/modules/Internationalization.md)?

#### Optional Flags
##### --setupInternationalizationByDefault
If you'd like to include internationalization in your module without being prompted, you can pass in the `--setupInternationalizationByDefault` flag. Your command will look as follows:
```
yo @americanexpress/one-app-module --setupInternationalizationByDefault
```

Alternatively, if you choose to compose `generator-one-app-module` with another generator, you can pass the `setupInternationalizationByDefault` value in an object as the second argument to the Yeoman `ComposeWith` function, like so:

```
const CustomExtension = require.resolve('./path-to-custom-extension');

module.exports = class extends Generator {
  initializing() {
    this.composeWith(require.resolve('@americanexpress/generator-one-app-module/generators/app'), 
    { setupInternationalizationByDefault: true });
    this.composeWith(CustomExtension);
  }
};
```

Doing this, you're able to extend the `generator-one-app-module` generator, enable internationalization by default, and add additional prompts and logic in your custom extension.

[More on composing generators here](https://yeoman.io/authoring/composability.html).


### Bundling modules

For more information about what happens after bundling your module, read [Bundling modules](./docs/Bundling-Modules.md)

## 🏆 Contributing

After making changes to the generator, test your changes locally:
1. Install yeoman globally: `npm install --global yo`
2. Link your local generator module so it is used instead of the repo version: `npm link`
3. Switch to a temp directory and run: `yo @americanexpress/one-app-module`
4. When you are done, unlink the local module : `npm unlink`

Please see our [contributing guide](../../CONTRIBUTING.md) for more details.
