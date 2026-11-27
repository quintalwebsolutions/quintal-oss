# @quintal/monads

## 0.7.0

### Minor Changes

- c2639b6: Ship as ESM-only and bundle with tsdown

## 0.6.0

### Minor Changes

- 9fa5552: Add an optional `mapError` argument to `resultFromThrowable` and `asyncResultFromThrowable`, so the caught error can be mapped to a typed error instead of `unknown`
- aa3f1f9: `inspect` and `inspectErr` now never let a failing callback affect the result: errors thrown (or rejected) inside the callback are silently swallowed. `inspect` and `inspectErr` now also follow the same pattern as `map` and `mapErr` for async callbacks: if the callback returns a promise, the result becomes an `AsyncResult` that resolves once the callback has finished. For example `ok(1).inspect(async () => {})` is now an `AsyncOk<number>` instead of an `Ok<number>`.
- 1b6e491: Add the `AsyncResultOf<TValue, TError>` type alias as shorthand for `AsyncResult<Result<TValue, TError>>`

### Patch Changes

- d001f5e: Simplify the return types of `AsyncResult`'s `map`, `mapErr`, `inspect`, `inspectErr`, `ok`, `err`, `flatten` and `transpose` for results that can be either `ok` or `err`.
- 24741f3: Fix `asyncResultFromThrowable` throwing instead of returning an `Err` when the given function throws synchronously (e.g. a non-async function, or before its first `await`)

## 0.5.0

### Minor Changes

- 294bbde: Expose ResultFromResults, ResultFromSerialized, and ResultMatch internal types

### Patch Changes

- e290a5c: Chore: bump dependencies and update config files

## 0.4.0

### Minor Changes

- fee979b: Improve docs for AsyncResult and constructor utility functions
- fee979b: Allow to pass a promise to andThen and orElse to create an AsyncResult
- f8809ad: Add "resultFromResults" utility function for merging multiple results into one

### Patch Changes

- 2bbc6fe: Expose serialized result types

## 0.3.2

### Patch Changes

- fd3eb1d: Make match statement more type-flexible
- fd3eb1d: Fix typo resultFromTrowable => resultfromThrowable

## 0.3.1

### Patch Changes

- 0cfdcef: No longer require `as const` for inferring simple ok and err types
- 2731baa: Fix codecov link in README

## 0.3.0

### Minor Changes

- cdbf54a: Add fromSerialized function to easily parse serialized monads back to their original form

### Patch Changes

- 782dc4c: Update all packages and pipelines

## 0.2.0

### Minor Changes

- 963217e: Add serialize function for passing a result over the network

## 0.1.0

### Minor Changes

- b021795: All `Result` functions can now handle async callbacks
- 52b1be6: Add match function to monads

### Patch Changes

- 52b1be6: Improve docs for both monads
- 52b1be6: Rewrite monads as classes for better memory performance and code readability
- c7b80d9: Only add dist directory in npm bundle

## 0.0.1

### Patch Changes

- c8b6a3f: Init package
