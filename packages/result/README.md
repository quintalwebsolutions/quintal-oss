# Result

A TypeScript error handling paradigm using a `Result` monad, inspired by [the Rust programming language](https://doc.rust-lang.org/std/result/).

The type `Result<T, E>` is used for returning and propagating errors. It has the following variants:

- `ok(value: T)`, representing success;
- `err(error: E)`, representing error.

Functions return `Result` whenever errors are expected and recoverable. It signifies that the absence of a value is due to an error or an exceptional situation that the caller needs to handle specifically. For cases where having no value is expected, have a look at [@quintal/option](https://npmjs.com/package/@quintal/option). A function returning `Result` might be defined and used like so:

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

<!-- ## Results must be used -->

<!-- TODO write a section like https://doc.rust-lang.org/std/result/#results-must-be-used -->

## Method Overview

`Result` comes with a wide variety of different convenience methods that make working with it more succinct.

### Querying contained values

- `isOk` and `isErr` are `true` if the `Result` is `ok` or `err`, respectively.
- `isOkAnd` and `isErrAnd` return `true` if the `Result` is `ok` or `err`, respectively, and the value inside of it matches a predicate.
- `inspect` and `inspectErr` peek into the `Result` if it is `ok` or `err`, respectively.

### Extracting the contained value

These methods extract the contained value from a `Result<T, E>` when it is the `ok` variant. If the `Result` is `err`:

- `expect` throws the provided custom message.
- `unwrap` throws the error value.
- `unwrapOr` returns the provided default value.
- `unwrapOrElse` returns the result of evaluating the provided function.

These methods extract the contained value from a `Result<T, E>` when it is the `err` variant. If the `Result` is `ok`:

- `expectErr` throws the provided custom message.
- `unwrapErr` throws the success value.

### Transforming contained values

- `ok` transforms `Result<T, E>` into `Option<T>`, mapping `ok` to `some` and `err` to `none`.
- `err` transforms `Result<T, E>` into `Option<E>`, mapping `err` to `some` and `ok` to `none`.
- `flatten` transforms a `Result<Result<T, E>, E>` to a `Result<T, E>` with at most one level of `Result` nesting.
- `transpose` transforms a `Result` of an `Option` into an `Option` of a `Result`
- `map` transforms `Result<T, E>` into `Result<U, E>` by applying the provided function to the contained value of `ok` and leaving `err` values unchanged.
- `mapErr` transforms `Result<T, E>` into `Result<T, F>` by applying the provided function to the contained value of `err` and leaving `ok` values unchanged.
- `mapOr` transforms `Result<T, E>` into `U` by applying the provided function to the contained value of `ok`, or returns the provided default value if the `Result` is `err`.
- `mapOrElse` transforms a `Result<T, E>` into `U` by applying the provided function to the contained value of `ok`, or applies the provided default fallback function to the contained value of `err`.

### Boolean operators

These methods treat the `Result` as a boolean value, where `ok` acts like `true` and `err` acts like `false`.

- `and` and `or` take another `Result` as input, and produce a `Result` as output.
- `andThen` and `orElse` take a function as input, and only lazily evaluate the function when they need to produce a new value.

## API

You can explore [the exposed functions and types on ts-docs](https://tsdocs.dev/docs/@quintal/result)
