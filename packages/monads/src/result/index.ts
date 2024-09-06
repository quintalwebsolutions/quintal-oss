export { type AnyResult, isAnyResult } from './util';
export {
  type Result,
  Ok,
  Err,
  resultFromSerialized,
  resultFromThrowable,
  ok,
  err,
} from './result';

export {
  AsyncResult,
  type AsyncOk,
  type AsyncErr,
  asyncResultFromThrowable,
  asyncResultFromSerialized,
  asyncOk,
  asyncErr,
} from './async-result';
