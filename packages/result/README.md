# @quintal/result

A TypeScript error handling paradigm using a `Result` monad, inspired by the
Rust programming language. For an amazing explanation on Monads,
[check this video by Studying With Alex](https://www.youtube.com/watch?v=C2w45qRc3aU)

Instead of returning a value from a function that can error, you return a
`Result<T, E>` value, which represents either a value of type `T` if the
function did not error, or an error of type `E` if it did.

As an example, this would be some error-prone code:

```ts
async function checkUserPassword(
  username: string,
  password: string,
): Promise<boolean> {
  // This could throw an unexpected error if something goes wrong with the database connection.
  const users = await db
    .select(users)
    .where({ username: eq(users.username, username) });

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
import {
  type AsyncResult,
  ok,
  err,
  asyncResultWrap,
  runResult,
} from '@quintal/result';

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
performant code.

An added benefit is that the result type is serializable, so it can be used in
client-server communication aswell!
