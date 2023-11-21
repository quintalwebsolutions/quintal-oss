export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
export type AsyncResult<T, E> = Promise<Result<T, E>>;

export function ok<T>(value: T): Result<T, never>;
export function ok(): Result<void, never>;
export function ok<T>(value?: T): Result<T | undefined, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function resultWrap<T>(func: () => T): Result<T, unknown> {
  try {
    const value = func();
    return ok(value);
  } catch (e) {
    return err(e);
  }
}

export async function asyncResultWrap<T>(
  func: () => Promise<T>,
): AsyncResult<T, unknown> {
  try {
    const value = await func();
    return ok(value);
  } catch (e) {
    return err(e);
  }
}

export function runResult<T1, T2, E1, E2>(
  result: Result<T1, E1>,
  run: (value: T1) => Result<T2, E2>,
): Result<T2, E1 | E2> {
  if (!result.ok) return result;
  return run(result.value);
}

export async function asyncRunResult<T1, T2, E1, E2>(
  result: Result<T1, E1>,
  run: (value: T1) => AsyncResult<T2, E2>,
): AsyncResult<T2, E1 | E2> {
  if (!result.ok) return result;
  return run(result.value);
}
