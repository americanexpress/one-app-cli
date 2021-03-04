# New Generator

## Usage

### Basic

> The basic usage would default to a child module with no childRoutes.jsx

```sh
create-one-app-module

// or

npx create-one-app-module
```

#### Basic with Module Name

```sh
create-one-app-module my-module

// or

npx create-one-app-module my-module
```

### Use an Example

> Examples would be in either a dedicated examples repo OR an examples folder
> within `one-app-cli`

`create-one-app-module` comes with the following options:

- **-e, --example [name]|[github-url]** - An example to bootstrap the module
  with. You can use an example name from one of our example modules or a GitHub
  URL. The URL can use any branch and/or subdirectory.
- **--example-path &lt;path-to-example&gt;** - In a rare case, your GitHub URL
  might contain a branch name with a slash (e.g. bug/fix-1) and the path to the
  example (e.g. foo/bar). In this case, you must specify the path to the example
  separately: `--example-path foo/bar`

```sh
create-one-app-module -e fetchye-example my-module

// or

npx create-one-app-module -e fetchye-example my-module
```

## What Is Needed

- Ideally 0 actual dependencies.
  - This would allow initializing a module to be done in seconds.
- Offline support
  - Detect that the user is offline and use local package cache
    - This would allow users to generate a module even without being connected
      to internet
- Some sort of script for modifying an example repo that is provided.
  - Modify the `name` in the `package.json` with the folder name that provide

## What Is Not Needed

- If we have examples, we should be able to do away with having to ask all the
  questions that are currently asked in our generator.
  - The reasoning behind this is that asking all these questions isn't _needed_
    in the OSS world and it takes up valuable time for a developer. We could add
    a message at the end potentially (not my preferred way) or add empty keys in
    the internal examples for them to filled in.
  - Removing these questions but having two different examples (external and
    internal) would allow a single generator to be used and maintained.
- Our current generator is overly complex because we try to account for a bunch
  of use cases. With this approach of examples and just creating a base module,
  our generator would be less complex and easy to maintain.
- GitHub templates
  - I think using templates pollutes our repos and you lose track of maintaining
    them all. Furthermore, it restricts people from contributing since not
    everyone can create a repo. However, everyone can make a pull request.

## Pros

- Right now we maintain 3 generators (OSS, One App v4, One App v5), this would
  cut down our maintaining of generators to 1.
- The only changes that we make to the generator(s) right now is to the
  templates which is causing unnecessary (in my opinion) releases. This would
  cut down the number of releases as we would just make adjustments to the
  example repos vs the default template.
- Due to there being 0 actual deps, makes creating a module a lot faster.
- This moves us more inline with how `create-react-app` and `create-next-app`
  allow users to create apps and would (hopefully) be more intuitive for our
  users.
- Having examples allows our end users to contribute more examples that they
  would like to see.
  - I have seen questions of "How do I integrate xyz in a module?", this would
    allow people to contribute an example module that integrates xyz in a
    module.
- Would allow the use of either yarn or npm
  - Generator would determine if user has yarn installed on their machine and
    use that (or we default to npm instead)

## Cons

- Internally we would lose the questions that are asked by the current
  generator.
  - This would rely on our users to manually fill them in if they do not use an
    internal example.
- We need to build out our examples
  - This could take awhile, however, it would allow users to contribute to our
    examples.

## What Remains the Same Between Old and New Generator?

- Still fills a directory with a pre-written module
- Does not need to be installed locally to work
- If user does not provide a module name while running
  `npx create-one-app-module` we would ask `What is your module's name?`

## What Changes Between Old and New Generator?

- The new generator would allow for different examples (not just the ones the
  One App team comes up with)
  - This allows greater flexibility since users can now just point to a URL
    instead.
- The new generator would be faster
- The new generator would not have the survey of questions that are asked in the
  current generator

## What Needs to Be Figured Out?

- Dealing with proxies
  - How can someone internally use an external example
- Do we want to have some sort of meta data file that allows users to customize
  - What would we allow them to customize?
  - What _needs_ customization that a template couldn't cover?

## Current Generator

<!-- prettier-ignore -->
| Pros      | Cons |
| ----------- | ----------- |
| Has questions for explorer      | Answering the questions feels like a survey       |
|    | Takes anywhere between 15-50 minutes to generate a module        |
|    | Stuck with as many templates as we add (increasing the size of the generator)      |
|    | Overly complicated      |
|    | Need to release new version when a small change to the template is made      |
|    | Maintaining 3 separate generators      |

## Create One App Module Generator

<!-- prettier-ignore -->
| Pros      | Cons |
| ----------- | ----------- |
| Quick to generate a module (1m 26s in my test)     | Default module is pretty bare |
| Would use a template/examples folder for different examples   | Would have to create a second generator to use internal examples |
|  Easy to maintain  | Potentially having to maintain 2 generators |
|  Releases of the generator would only come for actual code changes to the default template or the generator itself  |     |
|  Having templates/examples could allow us to spread best practices easier  |  |
|  Having templates/examples could allow OSS contribution  |  |
|  We could setup Dependabot to update template/example deps at the end of every month which would take care of [one-app-cli #29](https://github.com/americanexpress/one-app-cli/issues/29)  | |
