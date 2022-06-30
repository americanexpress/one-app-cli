# Disallows appConfig details from being included in client bundles. (no-app-config-on-client)

## Rule Details

A Holocron module has the ability to pass a configuration object (`appConfig`)
which is received by Holocron and passed to its module load validator function.

Various runtime validations can be performed based on this configuration object
(whether needed environment variables exist, etc...).

This configuration object should not be added to client bundles because it can unnecessarily
increase bundle sizes and/or expose details that are not meant to be exposed to the internet.

This rule makes sure that if a `appConfig` is added to a Holocron module
it is only accessible on the server and thus excluded from client bundles:

Examples of **incorrect** code for this rule:

```js
MyHolocronModule.appConfig = {
  // ...
};
```

Examples of **correct** code for this rule:

```js
if (!global.BROWSER) {
  MyHolocronModule.appConfig = {
    // ...
  };
}
```
