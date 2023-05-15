# Creating a `one-app-cli` new release

1. Create, checkout and push a new release branch
2. Fetch tags `git fetch --tags`
3. Run `yarn lerna:version` locally from your release branch. This will push your release changes(changelog and tags) to the branch on github.
4. Ensure that correctly formatted tags have been created for each package being versioned. Tag needs to be in the format of `@americanexpress/[package-name]@x.x.x` for example`@americanexpress/one-app-bundler@6.0.0`. This can impact future releases.
5. Create a pull request from your branch to the `main` branch with your changes.
6. When merging try to ensure that commit does not get squashed as this will cause the tags be against missing commits.
7. Once merged run the [manually publish](https://github.com/americanexpress/one-app-cli/actions/workflows/publish.yml) github action workflow.

One App Cli is currently not setup for pre-releases.
In theory, if one is required, using [--conventional-prerelease](https://github.com/lerna/lerna/tree/main/commands/version#--conventional-prerelease) in step two should work. For example: `yarn lerna:version --conventional-prerelease`