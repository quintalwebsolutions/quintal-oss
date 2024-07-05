<<<<<<< HEAD
<!--
THIS FILE IS (PARTIALLY) AUTO-GENERATED USING `pnpm generate`.
TO EDIT THE CONTENT, PLEASE MODIFY `/workspace.ts` OR `/scripts/generate.ts`
-->

# Quintal React Form Engine

[![NPM version](https://img.shields.io/npm/v/@quintal/form-engine-react?style=flat-square)](https://npmjs.com/@quintal/form-engine-react)
[![NPM downloads](https://img.shields.io/npm/dt/@quintal/form-engine-react?style=flat-square)](https://npmjs.com/@quintal/form-engine-react)
[![License](https://img.shields.io/npm/l/@quintal/form-engine-react?style=flat-square)](https://github.com/quintalwebsolutions/quintal-oss/blob/main/LICENSE)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@quintal/form-engine-react?style=flat-square)](https://bundlephobia.com/package/@quintal/form-engine-react)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@quintal/form-engine-react?style=flat-square)](https://libraries.io/npm/%40quintal%2Fform-engine-react/)
[![Code coverage](https://img.shields.io/codecov/c/github/quintalwebsolutions/quintal-oss?style=flat-square&token=3ORY9UP6H7&flag=form-engine-react&logo=codecov)](https://codecov.io/gh/quintalwebsolutions/quintal-oss)
[![Pull requests welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/quintalwebsolutions/quintal-oss/blob/main/CONTRIBUTING.md)

A headless, declarative, lightweight form engine for React apps with first-class TypeScript support.

You can explore [the exposed functions and types on ts-docs](https://tsdocs.dev/docs/@quintal/form-engine-react)

## Table of Contents

- [Getting Started](#getting-started)

## Getting Started

```sh
pnpm add @quintal/form-engine-react
# or
bun add @quintal/form-engine-react
# or
yarn add @quintal/form-engine-react
# or
npm install @quintal/form-engine-react
```

<!-- END AUTO-GENERATED: Add custom documentation after this comment -->

## Roadmap

- Support for popular schema validation libraries:
  - [Zod](https://zod.dev/)
  - [Valibot](https://github.com/fabian-hiller/valibot)
  - [Ajv.JS](https://ajv.js.org/)
  - [Joi](https://joi.dev/)
  - [Yup](https://github.com/jquense/yup)

## Paradigms

This form engine supports multiple form use cases and applies them intelligently
when and where necessary, even allowing to mix paradigms within the same form.

### Tracked, Controlled Form Elements

Form elements that have a `value` and `onChange` prop to capture changes and
keep the field value in sync with the internal state.

- Pros: Instant validation hints as the user types, ability to control input
  value as the user types (adding hyphens in phone numbers, auto-formatting a
  postal code, etc.)
- Cons: All controlled inputs in the form rerender all at once for every single
  change and blur event

You are opted into this paradigm when you pass a `transform` function
configuration option to a form field, since this is the only reason you would
want to use this paradigm.

### Tracked, Uncontrolled Form Elements

Form elements that have an `onChange` prop, but no `value` prop. Their value is
tracked, but it cannot be programmatically updated.

- Pros: Instant validation hints as the user types, not rerendered when a
  controlled input changes.
- Cons: Still rerenders all controlled form elements on every change event, no
  control over the input value.

This is the default paradigm.

### Untracked, Uncontrolled Form Elements

Form elements that have neither an `onChange`, nor a `value` prop. They are
completely at the mercy of the HTML gods.

- Pros: An input is only rendered once, and it enables progressive enhancement
  if the entire form is untracked & uncontrolled. Editing a form input doesn't
  affect the rest of the form.
- Cons: Can only validate after a server round trip, no way to programmatically
  react to the input value changing.
