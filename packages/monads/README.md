# Quintal Monads

[![NPM version](https://img.shields.io/npm/v/@quintal/monads?style=flat-square)](https://npmjs.com/@quintal/monads)
[![NPM downloads](https://img.shields.io/npm/dt/@quintal/monads?style=flat-square)](https://npmjs.com/@quintal/monads)
[![License](https://img.shields.io/npm/l/@quintal/monads?style=flat-square)](https://github.com/quintalwebsolutions/quintal-oss/blob/main/LICENSE)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@quintal/monads?style=flat-square)](https://bundlephobia.com/package/@quintal/monads)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@quintal/monads?style=flat-square)](https://libraries.io/npm/%40quintal%2Fmonads/)
[![Code coverage](https://img.shields.io/codecov/c/github/quintalwebsolutions/quintal-oss?style=flat-square&token=3ORY9UP6H7&flag=monads&logo=codecov)](https://codecov.io/gh/quintalwebsolutions/quintal-oss)
[![Pull requests welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/quintalwebsolutions/quintal-oss/blob/main/CONTRIBUTING.md)

A collection of monads (Result, Option) for TypeScript, inspired by [the Rust programming language](https://doc.rust-lang.org/std/result/).

## Features

- 🦀 Implements all relevant methods from Rust,
- ✅ CommonJS and ES Modules support,
- 📖 Extensive documentation,
- ⚖️ Super lightweight (only ~1kb gzipped),
- 🙅 0 dependencies,
- 🧪 100% test coverage.

You can explore [the exposed functions and types on ts-docs](https://tsdocs.dev/docs/@quintal/monads)

## Roadmap

- [ ] Figure out a way to emulate [Rust's question mark syntax](https://doc.rust-lang.org/std/result/#the-question-mark-operator-)
- [ ] Serialize and deserialize monads for API usage
- [ ] Write docs on [Rust's must-use property](https://doc.rust-lang.org/std/result/#results-must-be-used)

## Table of Contents

- [Getting Started](#getting-started)
- [Result](#result)
  - [Method Overview](#method-overview)
    - [Querying the contained value](#querying-the-contained-value)
    - [Extracting the contained value](#extracting-the-contained-value)
    - [Transforming the contained value](#transforming-the-contained-value)
    - [Boolean operators](#boolean-operators)
    - [Rust syntax utilities](#rust-syntax-utilities)
- [Option](#option)
  - [Method Overview](#method-overview)
    - [Querying the contained value](#querying-the-contained-value)
    - [Extracting the contained value](#extracting-the-contained-value)
    - [Transforming the contained value](#transforming-the-contained-value)
    - [Boolean operators](#boolean-operators)
    - [Rust syntax utilities](#rust-syntax-utilities)
- [Acknowledgement](#acknowledgement)

## Getting Started

```sh
pnpm add @quintal/monads
# or
bun add @quintal/monads
# or
yarn add @quintal/monads
# or
npm install @quintal/monads
```
<!-- END AUTO-GENERATED: Add custom documentation after this comment -->

## Result

A TypeScript error handling paradigm using a `Result` monad.

The type `Result<T, E>` is used for returning and propagating errors. It has the following variants:

- `ok(value: T)`, representing success;
- `err(error: E)`, representing error.

Functions return `Result` whenever errors are expected and recoverable. It signifies that the absence of a return value is due to an error or an exceptional situation that the caller needs to handle specifically. For cases where having no value is expected, have a look at the `Option` type.

A simple function returning `Result` might be defined and used like so:

```ts
import { type Result, ok, err } from '@quintal/monads';

// Type-safe error handling
type GetUniqueItemError = 'no-items' | 'too-many-items';

// `Result` is an explicit part of the function declaration, making it clear to the
// consumer that this function may error and what kind of errors it might return.
function getUniqueItem<T>(items: T[]): Result<T, GetUniqueItemError> {
  // We do not throw, we return `err()`, allowing for a more straightforward control flow
  if (items.length === 0) return err('no-items');
  if (items.length > 1) return err('too-many-items');
  return ok(items[0]!);
}

// Pattern match the result, forcing the user to account for both the success and the error state.
const message = getUniqueItem(['item']).match({
  ok: (value) => `The value is ${value}`,
  err: (error) => {
    if (error === 'no-items') return 'There were no items found in the array';
    if (error === 'too-many-items') return 'There were too many items found in the array';
  },
});
```

A more advanced use case might look something like this:

```ts
import { type AsyncResult, asyncResult, err, ok } from '@quintal/monads';

enum AuthenticateUserError {
  DATABASE_ERROR,
  UNKNOWN_USERNAME,
  USER_NOT_UNIQUE,
  INCORRECT_PASSWORD,
}

async function authenticateUser(
  username: string,
  password: string,
  // AsyncResult allows to handle async functions in a Result context
): AsyncResult<User, AuthenticateUserError> {
  // Wrap the dangerous db call with `asyncResult` to catch the error if it's thrown.
  // `usersResult` is of type `AsyncResult<User[], unknown>`.
  const usersResult = asyncResult(() =>
    db
      .select()
      .from(users)
      .where({ username: eq(users.username, username) }),
  );

  // If there was an error, log it and replace with our own error type.
  // If it was a success, this fuction will not run.
  // `usersDbResult` is of type `AsyncResult<User[], AuthenticateUserError>`.
  const usersDbResult = usersResult.mapErr((error) => {
    console.error(error);
    // You can differentiate between different kinds of DB errors here
    return AuthenticateUserError.DATABASE_ERROR;
  });

  // If it was a success, extract the unique user from the returned list of users.
  // If there was an error, this function will not run.
  // `userResult` is of type `AsyncResult<User, AuthenticateUserError>`.
  const userResult = usersResult.andThen(getUniqueItem).mapErr((error) => {
    if (error === 'no-items') return AuthenticateUserError.UNKNOWN_USERNAME;
    if (error === 'too-many-items') return AuthenticateUserError.USER_NOT_UNIQUE;
    return error;
  });

  // It is possible to chain async functions on an `AsyncResult` (see API documentation)
  const authenticatedUserResult = userResult.andThen(async (user) => {
    const passwordMatches = await compare(password, user.password);
    if (!passwordMatches) return err(AuthenticateUserError.INCORRECT_PASSWORD);
    return ok(user);
  });

  return authenticatedUserResult;
}
```

Or, shortened:

```ts
import { type AsyncResult, asyncResult, err, ok } from '@quintal/monads';

enum AuthenticateUserError {
  DATABASE_ERROR,
  UNKNOWN_USERNAME,
  USER_NOT_UNIQUE,
  INCORRECT_PASSWORD,
}

async function authenticateUser(
  username: string,
  password: string,
): AsyncResult<User, AuthenticateUserError> {
  return asyncResult(() =>
      db.select().from(users).where({ username: eq(users.username, username) })
  )
    .mapErr((error) => {
      console.error(error);
      return AuthenticateUserError.DATABASE_ERROR;
    })
    .andThen(getUniqueItem)
    .mapErr((error) => {
      if (error === 'no-items') return AuthenticateUserError.UNKNOWN_USERNAME;
      if (error === 'too-many-items') return AuthenticateUserError.USER_NOT_UNIQUE;
      return error;
    });
    .andThen(async (user) => {
      const passwordMatches = await compare(password, user.password);
      if (!passwordMatches) return err(AuthenticateUserError.INCORRECT_PASSWORD);
      return ok(user);
    });
}
```

### Method Overview

`Result` comes with a wide variety of convenience methods that make working with it more succinct.

#### Querying the contained value

- `isOk` and `isErr` are `true` if the `Result` is `ok` or `err`, respectively.
- `isOkAnd` and `isErrAnd` return `true` if the `Result` is `ok` or `err`, respectively, and the value inside of it matches a predicate.
- `inspect` and `inspectErr` peek into the `Result` if it is `ok` or `err`, respectively.

#### Extracting the contained value

These methods extract the contained value from a `Result<T, E>` when it is the `ok` variant. If the `Result` is `err`:

- `expect` throws the provided custom message.
- `unwrap` throws a generic error.
- `unwrapOr` returns the provided default value.
- `unwrapOrElse` returns the result of evaluating the provided function.

These methods extract the contained value from a `Result<T, E>` when it is the `err` variant. If the `Result` is `ok`:

- `expectErr` throws the provided custom message.
- `unwrapErr` throws the success value.

#### Transforming the contained value

- `ok` transforms `Result<T, E>` into `Option<T>`, mapping `ok(value)` to `some(value)` and `err(error)` to `none`.
- `err` transforms `Result<T, E>` into `Option<E>`, mapping `err(error)` to `some(error)` and `ok(value)` to `none`.
- `transpose` transforms a `Result` of an `Option` into an `Option` of a `Result`
- `flatten` removes at most one level of nesting from a `Result<Result<T, E>, E>`.
- `map` transforms `Result<T, E>` into `Result<U, E>` by applying the provided function to the contained value of `ok` and leaving `err` values unchanged.
- `mapErr` transforms `Result<T, E>` into `Result<T, F>` by applying the provided function to the contained value of `err` and leaving `ok` values unchanged.
- `mapOr` transforms `Result<T, E>` into `U` by applying the provided function to the contained value of `ok`, or returns the provided default value if the `Result` is `err`.
- `mapOrElse` transforms a `Result<T, E>` into `U` by applying the provided function to the contained value of `ok`, or applies the provided default fallback function to the contained value of `err`.

#### Boolean operators

These methods treat the `Result` as a boolean value, where `ok` acts like `true` and `err` acts like `false`.

- `and` and `or` take another `Result` as input, and produce a `Result` as output.
- `andThen` and `orElse` take a function as input, and only lazily evaluate the function when they need to produce a new value.

#### Rust syntax utilities

Because we are not actually working with Rust, we are missing some essential syntax to work with the `Result` monad. These methods attempt to emulate some of this syntax.

- `match` allows you to pattern match on both variants of a `Result`.

> If you have an idea on how to approach emulating Rust's [question mark syntax](https://doc.rust-lang.org/std/result/#the-question-mark-operator-), [if let syntax](https://doc.rust-lang.org/rust-by-example/flow_control/if_let.html), or other Rust language features that are not easily achieved in Typescript, feel free to [open an issue](https://github.com/quintalwebsolutions/quintal-oss/issues/new).

## Option

A TypeScript optional value handling paradigm using an `Option` monad.

The type `Option<T>` represents an optional value. It has the following variants:

- `some(value: T)`, representing the presence of a value;
- `none`, representing the absence of a value.

Functions return `Option` whenever the absence of a value is a normal, expected part of the function's behaviour (e.g. initial values, optional function parameters, return values for functions that are not defined over their entire input range). It signifies that having no value is a routine possibility, not necessarily a problem or error. For those cases, have a look at the `Result` type.

A simple function returning `Option` might be defined like so:

```ts
import { type Option, some, none } from '@quintal/monads';

// `Option` is an explicit part of the function declaration, making it clear to the
// consumer that this function may return nothing.
function safeDivide(numerator: number, denominator: number): Option<number> {
  if (denominator === 0) return none;
  else return some(numerator / denominator);
}

// Pattern match the result, forcing the user to account for both the some and none state.
const message = safeDivide(10, 0).match({
  some: (value) => `The value is: ${value}`,
  none: () => 'Dividing by 0 is undefined',
});
```

### Method Overview

`Option` comes with a wide variety of convenience methods that make working with it more succinct.

#### Querying the contained value

- `isSome` and `isNone` are `true` if the `Option` is `some` or `none` respectively.
- `isSomeAnd` returns `true` if the `Option` is `some` and the value inside of it matches a predicate.
- `inspect` peeks into the `Option` if it is `some`.

#### Extracting the contained value

These methods extract the contained value from an `Option<T>` when it is the `some` variant. If the `Option` is `none`:

- `expect` throws the provided custom message.
- `unwrap` throws a generic error.
- `unwrapOr` returns the provided default value.
- `unwrapOrElse` returns the result of evaluating the provided function.

#### Transforming the contained value

- `okOr` transforms `Option<T>` into `Result<T, E>, mapping `some(value)`to`ok(value)`and`none`to`err`using the provided default`err` value.
- `okOrElse` transforms `Option<T>` into `Result<T, E>`, mapping `some(value)` to `ok(value)` and `none` to a value of `err` using the provided function.
- `transpose` transforms an `Option` of a `Result` into a `Result` of an `Option`.
- `flatten` removes at most one level of nesting from an `Option<Option<T>>`.
- `map` transforms `Option<T>` into `Option<U>` by applying the provided function to the contained value of `some` and leaving `none` values unchanged.
- `mapOr` transforms `Option<T>` into `U` by applying the provided function to the contained value of `some`, or returns the provided default value if the `Option` is `none`.
- `mapOrElse` transforms `Option<T>` into `U` by applying the provided function to the contained value of `some`, or returns the result of evaluating the provided fallback function if the `Option` is `none`.
- `filter` calls the provided predicate function on the contained value of `some`, and returns `some(value)` if the function returns `true`; otherwise, returns `none`.
- `zip` returns `some([s, o])` if it is `some(s)` and the provided `Option` value is `some(o)`; otherwise, returns `none`.
- `zipWith` calls the provided function `f` and returns `some(f(s, o))` if it is `some(s)` and the provided `Option` value is `some(o)`; otherwise, returns `none`.
- `unzip` "unzips" itself, meaning that if it is `some([a, b])`, this method returns `[some(a), some(b)]`, otherwise, `[none, none]` is returned.

#### Boolean operators

These methods treat the `Option` as a boolean value, where `some` acts like `true` and `none` acts like `false`.

- `and`, `or`, and `xor` take another `Option` as input, and produce an `Option` as output.
- `andThen` and `orElse` take a function as input, and only lazily evaluate the function when they need to produce a new value.

#### Rust syntax utilities

Because we are not actually working with Rust, we are missing some essential syntax to work with the `Option` monad. These methods attempt to emulate some of this syntax.

- `match` allows you to pattern match on both variants of an `Option`.

> If you have an idea on how to approach emulating Rust's [question mark syntax](https://doc.rust-lang.org/std/option/#the-question-mark-operator-), [if let syntax](https://doc.rust-lang.org/rust-by-example/flow_control/if_let.html), or other Rust language features that are not easily achieved in Typescript, feel free to [open an issue](https://github.com/quintalwebsolutions/quintal-oss/issues/new).

## Acknowledgement

Though this is not a fork, my implementation draws prior work from [Sniptt's `monads` package](https://github.com/sniptt-official/monads/) and [Supermacro's `neverthrow` package](https://github.com/supermacro/neverthrow/). I was very inspired by their work and the issues filed for their repositories.
