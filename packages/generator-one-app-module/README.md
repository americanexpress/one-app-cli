# @americanexpress/generator-one-app-module

> yeoman generator for a bare-bones [One App](https://github.com/americanexpress/one-app#modules) `holocron` Module

## 🤹‍ Usage

Assuming you have [npx installed](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) (comes with `npm` on versions 5.2.0 and above):

```bash
npx -p yo -p @americanexpress/generator-one-app-module -- yo @americanexpress/one-app-module
```

## 🏆 Contributing

After making changes to the generator, test your changes locally:
1. Install yeoman globally: `npm install --global yo`
2. Link your local generator module so it is used instead of the repo version: `npm link`
3. Switch to a temp directory and run: `yo one-app-module`
4. When you are done, unlink the local module : `npm unlink`

Please see our [contributing guide](../../CONTRIBUTING.md) for more details.
