# @quintal/use-async-reducer

[![NPM version](https://img.shields.io/npm/v/@quintal/use-async-reducer?style=flat-square)](https://npmjs.com/@quintal/use-async-reducer)
[![NPM downloads](https://img.shields.io/npm/dt/@quintal/use-async-reducer?style=flat-square)](https://npmjs.com/@quintal/use-async-reducer)
[![License](https://img.shields.io/npm/l/@quintal/use-async-reducer?style=flat-square)](https://github.com/quintal/quintal-oss/blob/main/LICENSE)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@quintal/use-async-reducer?style=flat-square)](https://bundlephobia.com/package/@quintal/use-async-reducer)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@quintal/use-async-reducer?style=flat-square)](https://libraries.io/npm/%quintal%2Fuse-async-reducer/)
[![Code coverage](https://img.shields.io/codecov/c/github/quintal/quintal-oss?style=flat-square&flag=react-use&logo=codecov&token=62N8FTE2CV)](https://codecov.io/gh/quintal/quintal-oss)
[![Pull requests welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/quintal/quintal-oss/blob/main/README.md) 
<!-- CONTRIBUTION.md instead of README.md -->

A collection of tiny, useful, type-safe React hooks.

## Features

- ⚖️ Incredibly lightweight,
- 🌳 Tree-shakable, only include in the bundle what is necessary,
- 👍 A sophisticated type system powering developer productivity,
- ✔️ 100% test coverage,
- 0️⃣ 0 dependencies.

## Table of Contents

- [Getting Started](#getting-started)
  * [Install](#install)
  * [Actions](#actions)
  * [Queue](#queue)
  * [Error handling](#error-handling)

## Getting Started

### Install

```sh
pnpm add @quintal/use-async-reducer
# or
yarn add @quintal/use-async-reducer
# or
npm install @quintal/use-async-reducer
```

<!-- END AUTO-GENERATED: Add custom documentation after this comment -->

## useAsyncReducer

The `useAsyncReducer` hook is a variation of React's core useReducer hook. Not a fork, but heavily inspired by [@bitovi/use-simple-reducer](https://github.com/bitovi/use-simple-reducer).

`useAsyncReducer` takes an initial state object (or (async) factory) and an object of actions that would modify the state, and returns a boolean `isInitialised` indicating if the initial state is ready to be used, an object containing the current state, the actions that may be performed on the state, a boolean `isLoading` indicating if an action is processing, and an error object for if one of the actions threw an error. All of this with full type-safety.

### Actions

Actions are sync or async functions that accept a state and additional parameters, and return the next state.

```tsx
import { useAsyncReducer } from '@quintal/use-async-reducer';
import { ReactElement } from 'react';

export default function IncrementButtons(): ReactElement {
  const { state, actions } = useAsyncReducer(
    { count: 0 },
    {
      reset: ({ initialState }) => initialState,
      increment: ({ currentState }) => ({ count: currentState.count + 1 }),
      add: async ({ currentState }, n: number) => ({ count: currentState.count + n }),
    },
  );

  return (
    <>
      <button onClick={actions.increment}>increment</button>
      <button onClick={() => actions.add(5)}>add 5</button>
    </>
  );
}
```

Even though `add` was defined as an async function, it is called as a sync function with the predefined parameters (all type-safe). You can add as many parameters as you'd like and they can be of any type.

### Queue

If async functions are called after each other, they are added to a queue and are executed one after another. During this execution, the `isLoading` boolean will be `true`.

### Error handling

Any errors thrown within actions are caught and returned using the `error` object, which is `null` as long as there hasn't been an error.

```ts
const { error } = useAsyncReducer(
  { count: 0 },
  {
    error: () => {
      throw Error('Something went horribly wrong');
    },
  },
);
```

If an error has occurred, the `error` object looks like this:

```ts
interface Error<State> {
  message: string;
  action: Action<State>;
  pendingActions: Action<State>[];
  runFailedAction: () => void;
  runPendingActions: () => void;
  runAllActions: () => void;
}
```
