// biome-ignore lint/performance/noBarrelFile: Entrypoint for Result monad
export { AsyncResult } from './AsyncResult.ts';
export { asyncErr, err } from './constructors/err.ts';
export { resultFromResults } from './constructors/from-results.ts';
export { asyncResultFromSerialized, resultFromSerialized } from './constructors/from-serialized.ts';
export { asyncResultFromThrowable, resultFromThrowable } from './constructors/from-throwable.ts';
export { asyncOk, ok } from './constructors/ok.ts';
export { Err } from './Err.ts';
export { Ok } from './Ok.ts';
export type {
  AnyAsyncErr,
  AnyAsyncOk,
  AnyAsyncResult,
  AnyErr,
  AnyOk,
  AnyResult,
  AnySerializedResult,
  AnySyncResult,
  AsyncErr,
  AsyncOk,
  Result,
  ResultFromResults,
  ResultFromSerialized,
  ResultMatch,
  SerializedErr,
  SerializedOk,
  SerializedResult,
  ValueFromErr,
  ValueFromOk,
} from './types.ts';
export { isAnyAsyncResult, isAnyResult, isAnySyncResult } from './types.ts';
