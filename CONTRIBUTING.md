# Contributing to Quintal Open Source Software

If you're reading this, you're probably thinking of contributing to this open source project. That's great! Your input is very welcome 🎉

Contributing to the project can be done in multiple ways:

- Reporting bugs or other issues
- Proposing new features
- Implementing bug fixes or features

## Reporting Bugs or Feature Requests

1. Before submitting an issue, please look through [the existing issues](https://github.com/quintalwebsolutions/quintal-oss/issues) to see if your idea is something new.
2. Comment on an existing issue that you would like to help solve, or [create a new issue](https://github.com/quintalwebsolutions/quintal-oss/issues/new/choose). It's usually best to get some feedback before proceeding to write code.
3. Please make sure that you are comfortable with [our code of conduct](https://github.com/quintalwebsolutions/quintal-oss/blob/main/CODE_OF_CONDUCT.md).

## Implementing Bug Fixes or Features

1. Fork the repo and clone it.
2. Create a new branch from main with the naming convention (feat|fix|chore)/descriptive-branch-name (e.g. `git switch -c feature/add-arguments`).
3. In the root directory (at the same level as this guide), run `pnpm i`.
4. You can use the commands `pnpm lint`, `pnpm test`, and `pnpm dev` during development. The commmand `pnpm dev` runs tests in watch mode, because we practice test-driven development.
5. Run `pnpm changeset` for each implemented change that should be added to the changelog.
6. When you're done implementing your code, please make sure that `pnpm lint`, `pnpm test` and `pnpm build` pass without unexpected warnings or errors.
7. Create a new pull request and select the branch in your forked repo as the "compare branch".
