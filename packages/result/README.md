# Result

A TypeScript error handling paradigm using a `Result` monad, inspired by [the Rust programming language](https://doc.rust-lang.org/std/result/). For an amazing introduction to Monads, [watch this video by Studying With Alex](https://www.youtube.com/watch?v=C2w45qRc3aU)

`Result<T, E>` is a type used for returning and propagating errors. It has the following variants:

- `ok(value: T)`, representing success;
- `err(error: E)`, representing error.

Functions return `Result` whenever errors are expected and recoverable. A simple function returning `Result`` might be defined and used like so:

// TODO add example

<!-- ## Results must be used -->

<!-- TODO write a section like https://doc.rust-lang.org/std/result/#results-must-be-used -->

## Method Overview

`Result` comes with a wide variety of different convenience methods that make working with it more succinct.

### Querying contained values

- `isOk` and `isErr` are `true` if the `Result` is `ok` or `err`, respectively.
- `isOkAnd` and `isErrAnd` return `true` if the `Result` is `ok` or `err`, respectively, and the value inside of it matches a predicate.
- `inspect` and `inspectErr` peek into the `Result` if it is `ok` or `err`, respectively.

### Extracting a contained value

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

<!-- TODO auto-generate API section from typedoc -->

<!-- ```ts
async function checkUserPassword(username: string, password: string): Promise<boolean> {
  // This could throw an unexpected error if something goes wrong with the database connection.
  const users = await db.select(users).where({ username: eq(users.username, username) });

  if (users.length === 0) {
    // Explicity throw error, making for an unpredictable control flow.
    throw new Error('username unknown');
  }

  const user = user[0]!;

  // Etc.
}
```

Rewriting this code to use the `Result` monad would look something like this:

```ts
import { type AsyncResult, ok, err, asyncResultWrap, runResult } from '@quintal/result';

enum CheckUserPasswordError {
  UNKNOWN_USERNAME,
}

async function checkUserPassword(
  username: string,
  password: string,
): AsyncResult<boolean, CheckUserPasswordError> {
  // Wrap the dangerous db call with `asyncResultWrap` to catch the error if it's thrown.
  // Users is now of type Result<User[], unknown>
  const usersResult = await asyncResultWrap(() =>
    db.select(users).where({ username: eq(users.username, username) }),
  );

  // Assume that `users` is a value, not an error.
  // If users is an error, this function will not run and just return this same error.
  const user = runResult(usersResult, (users) => {
    // We no longer throw, we return `err()`, which wraps the given error in the `Result` monad.
    if (users.length === 0) return err(CheckUserPasswordError.UNKNOWN_USERNAME);
    return ok(user[0]!);
  });

  // Etc.
}
```

Not only did we, with a very minor code overhead, make the first code snippet a
lot safer (we anticipate that the database may throw an unexpected error), we
don't disrupt the control flow by explicitly throwing an error, making for more
performant code. -->
