---
"@quintal/monads": patch
---

Simplify the return types of `AsyncResult`'s `map`, `mapErr`, `inspect`, `inspectErr`, `ok`, `err`, `flatten` and `transpose` for results that can be either `ok` or `err`. They now resolve to a single `AsyncResult` (or `AsyncOption`) of the combined variants, for example `AsyncResultOf<TMapped, TError>` for `map`, instead of a union like `AsyncOk<TMapped> | AsyncErr<TError>`, so `unwrap()` and `unwrapErr()` resolve to `Promise<TValue>` and `Promise<TError>` instead of `Promise<TValue> | Promise<never>`.

This also fixes the type of `transpose` on an async result holding an optional value, which previously included incorrect `Some<Ok<never>>` and `Some<Result<…>>` members.
