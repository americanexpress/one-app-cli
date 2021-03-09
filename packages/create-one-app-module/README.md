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
