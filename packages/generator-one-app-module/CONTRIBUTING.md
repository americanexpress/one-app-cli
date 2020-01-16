# Contributing

The following guidelines must be followed by all contributors to this repository. Please review them carefully and do not hesitate to ask for help.

### Code of Conduct

* Review and test your code before submitting a pull request.
* Be kind and professional. Avoid assumptions; oversights happen.
* Be clear and concise when documenting code; focus on value.
* Don't commit commented code to the main repo (stash locally, if needed).

See [our code of conduct](./CODE_OF_CONDUCT) for more details.

We welcome contributions in the form of pull requests!

### Opening the PR

* [Fork the generator-one-app-module repository](https://github.com/americanexpress/one-app-cli/tree/master/packages/generator-one-app-module), open a PR to `master`, and follow the guidelines outlined in this document.

### Pull Request Guidelines

* Keep PRs small, there should be one change per pull request.

* All pull requests must have descriptions and a link to corresponding issue(s) if applicable.

* Keep [commit history clean](https://americanexpress.io/on-the-importance-of-commit-messages/). Follow commit message guidelines (see below) and squash commits as needed to keep a clean history. Remember that your git commit history should tell a story that should be easy to follow for anyone in the future.

* Before making substantial changes or changes to core functionality and/or architecture [open up an issue](hhttps://github.com/americanexpress/one-app-cli/tree/master/packages/generator-one-app-module/issues/new) to propose and discuss the changes.

* Be patient. The review process will be thorough. It must be kept in mind that changes to our repos are platform wide and thus are not taken lightly. Be prepared to defend every single line of code in your pull request. Attempting to rush changes in will not work.

* Write tests for your changes. A feature is not considered done until it has tests and/or a test plan. It does not matter if code coverage shows 100%, tests are expected for *all* changes.

To test your changes locally:
1. Install yeoman globally: `npm install --global yo`
2. Link your local generator module so it is used instead of the repo version: `npm link`
3. Switch to a temp directory and run: `yo one-app-module`
4. When you are done, unlink the local module : `npm unlink`

### Git Commit Guidelines

We follow precise rules for git commit message formatting. These rules make it easier to review commit logs and improve contextual understanding of code changes. This also allows us to auto-generate the CHANGELOG from commit messages and automatically version One App during releases.

For more information on the commit message guidelines we follow see [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).

