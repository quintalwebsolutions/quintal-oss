# Monads

## Result

A TypeScript error handling paradigm using a `Result` monad, inspired by [the Rust programming language](https://doc.rust-lang.org/std/result/).

The type `Result<T, E>` is used for returning and propagating errors. It has the following variants:

- `ok(value: T)`, representing success;
- `err(error: E)`, representing error.

Functions return `Result` whenever errors are expected and recoverable. It signifies that the absence of a value is due to an error or an exceptional situation that the caller needs to handle specifically. For cases where having no value is expected, have a look at [@quintal/option](https://npmjs.com/package/@quintal/option). A function returning `Result` might be defined like so:

```ts
import { type AsyncResult, asyncResult, err, ok } from '@quintal/result';

// Type-safe error handling
enum AuthenticateUserError {
  DATABASE_ERROR,
  UNKNOWN_USERNAME,
  USER_NOT_UNIQUE,
  INCORRECT_PASSWORD,
}

// `Result` is an explicit part of the function declaration, making it clear to the
// user that this function may error and what kind of errors it might return.
async function authenticateUser(
  username: string,
  password: string,
): AsyncResult<User, AuthenticateUserError> {
  // Wrap the dangerous db call with `asyncResult` to catch the error if it's thrown.
  // `usersResult` is of type `Result<User[], unknown>`.
  const usersResult = await asyncResult(() =>
    db.select().from(users).where({ username: eq(users.username, username) }),
  );

  // If there was an error, log it and replace with our own error type.
  // If it was a success, this fuction will not run.
  // `usersDbResult` is of type `Result<User[], AuthenticateUserError>`.
  const usersDbResult = usersResult.mapErr((error) => {
    console.error(error);
    // You can differentiate between different kinds of DB errors here
    return AuthenticateUserError.DATABASE_ERROR;
  });

  // If it was a success, extract the unique user from the returned list of users.
  // If there was an error, this function will not run.
  // `userResult` is of type `Result<User, AuthenticateUserError>`.
  const userResult = usersResult.andThen((users) => {
    // We do not throw, we return `err()`, allowing for a more straightforward control flow
    if (users.length === 0) return err(AuthenticateUserError.UNKNOWN_USERNAME);
    if (users.length > 1) return err(AuthenticateUserError.USER_NOT_UNIQUE);
    return ok(users[0]!);
  });

  const authenticatedUserResult = userResult.andThen((user) => {
    // TODO check if this supports async functions in `andThen`
    const passwordMatches = compareSync(password, user.password);
    if (!passwordMatches) return err(AuthenticateUserError.INCORRECT_PASSWORD);
    return ok(user);
  });

  return authenticatedUserResult;
}
```

Or, shortened:

```ts
import { type AsyncResult, asyncResult, err, ok } from '@quintal/result';

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
  return (await asyncResult(() =>
      db.select().from(users).where({ username: eq(users.username, username) })
  ))
    .mapErr((error) => {
      console.error(error);
      return AuthenticateUserError.DATABASE_ERROR;
    })
    .andThen((users) => {
      if (users.length === 0) return err(AuthenticateUserError.UNKNOWN_USERNAME);
      if (users.length > 1) return err(AuthenticateUserError.USER_NOT_UNIQUE);
      return ok(users[0]!);
    })
    .andThen((user) => {
      const passwordMatches = compareSync(password, user.password);
      if (!passwordMatches) return err(AuthenticateUserError.INCORRECT_PASSWORD);
      return ok(user);
    });
}

```

<!-- ### Results must be used -->

<!-- TODO write a section like https://doc.rust-lang.org/std/result/#results-must-be-used -->

### Method Overview

`Result` comes with a wide variety of different convenience methods that make working with it more succinct.

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

### API

You can explore [the exposed functions and types on ts-docs](https://tsdocs.dev/docs/@quintal/result)

## Option

A TypeScript optional value handling paradigm using an `Option` monad, inspired by [the Rust programming language](https://doc.rust-lang.org/std/option/).

The type `Option<T>` represents an optional value. It has the following variants:

- `some(value: T)`, representing the presence of a value;
- `none`, representing the absence of a value.

Functions return `Option` whenever the absence of a value is a normal, expected part of the function's behaviour. It signifies that having no value is a routine possibility, not necessarily a problem or error. For those cases, have a look at [@quintal/result](https://npmjs.com/package/@quintal/result). A function returning `Option` might be defined like so:

```ts
import { type Option, some, none } from '@quintal/option';

function safeDivide(numerator: number, denominator: number): Option<number> {
  if (denominator === 0) return none;
  else return some(numerator / denominator);
}
```

### Method Overview

`Option` comes with a wide variety of different convenience methods that make working with it more succinct.

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

- `okOr` transforms `Option<T>` into `Result<T, E>, mapping `some(value)` to `ok(value)` and `none` to `err` using the provided default `err` value.
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

<!-- TODO figure out how to do this -->
<!-- #### Modifying an Option in-place

- `insert` inserts a value, dropping any old contents.
- `getOrInsert` gets the current value, inserting a provided default value if it is `none`.
- `getOrInsertWith` gets the current value, inserting a default lazily computed by the provided function if it is `none`.
- `take` gets the current value and, if any, replaces the `Option` with `none`.
- `takeIf` gets the current value and, if any, replaces the `Option` with `none` if the provided predicate function on the current value evaluates to `true`. 
- `replace` gets the current value and, if any, replaces the `Option` with `some(value)`. -->

### API

You can explore [the exposed functions and types on ts-docs](https://tsdocs.dev/docs/@quintal/option)
