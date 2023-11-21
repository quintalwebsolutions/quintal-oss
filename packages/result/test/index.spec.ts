import { describe, it, expect, expectTypeOf } from 'vitest';
import type { AsyncResult, Result } from '../src/index';
import {
  asyncRunResult,
  ok,
  err,
  resultWrap,
  asyncResultWrap,
  runResult,
} from '../src/index';

function throwSync(): boolean {
  throw new Error('This is an error');
}

function noThrowSync(): boolean {
  return false;
}

// eslint-disable-next-line @typescript-eslint/require-await -- This test requires the function to be async
async function throwAsync(): Promise<boolean> {
  throw new Error('This is an async error');
}

// eslint-disable-next-line @typescript-eslint/require-await -- This test requires the function to be async
async function noThrowAsync(): Promise<boolean> {
  return false;
}

describe('result', () => {
  it('uses type narrowing to extract the value', () => {
    const okResult = ok('value');
    expectTypeOf(okResult).toMatchTypeOf<Result<string, never>>();

    const errResult = err('error');
    expectTypeOf(errResult).toMatchTypeOf<Result<never, string>>();

    const unknownResult = resultWrap(throwSync);
    expectTypeOf(unknownResult).not.toMatchTypeOf<{ ok: true }>();
    expectTypeOf(unknownResult).not.toMatchTypeOf<{ ok: false }>();
    expectTypeOf(unknownResult).toMatchTypeOf<{ ok: boolean }>();

    if (unknownResult.ok) {
      expectTypeOf(unknownResult).toMatchTypeOf<{ value: boolean }>();
      expectTypeOf(unknownResult).not.toMatchTypeOf<{ error: unknown }>();
    } else {
      expectTypeOf(unknownResult).not.toMatchTypeOf<{ value: boolean }>();
      expectTypeOf(unknownResult).toMatchTypeOf<{ error: unknown }>();
    }
  });

  it('returns an error state from a wrapped throwing function', () => {
    const okResult = resultWrap(noThrowSync);
    expect(okResult.ok).toBeTruthy();
    if (okResult.ok) expect(okResult.value).toBe(false);

    const errResult = resultWrap(throwSync);
    expect(errResult.ok).toBe(false);
    if (!errResult.ok)
      expect(errResult.error).toStrictEqual(new Error('This is an error'));
  });

  it('returns an error state from a wrapped throwing async function', async () => {
    const okResult = await asyncResultWrap(noThrowAsync);
    expect(okResult.ok).toBeTruthy();
    if (okResult.ok) expect(okResult.value).toBe(false);

    const errResult = await asyncResultWrap(throwAsync);
    expect(errResult.ok).toBe(false);
    if (!errResult.ok)
      expect(errResult.error).toStrictEqual(
        new Error('This is an async error'),
      );
  });

  it('runs a result type only if it contains a value', () => {
    type R1 = Result<number, 'error1'>;
    type R2 = Result<boolean, 'error2'>;
    const okResult1 = ok(5) as R1;
    const errResult1 = err<'error1'>('error1') as R1;

    const transform = (value: number): R2 => ok(value === 5);

    const okResult2 = runResult(okResult1, transform);
    const errResult2 = runResult(errResult1, transform);

    expect(okResult2.ok).toBe(true);
    expect(errResult2.ok).toBe(false);

    expectTypeOf(okResult2).toEqualTypeOf<
      Result<boolean, 'error1' | 'error2'>
    >();
    expectTypeOf(errResult2).toEqualTypeOf<
      Result<boolean, 'error1' | 'error2'>
    >();
  });

  it('runs an async result type only if it contains a value', async () => {
    type R1 = Result<number, 'error1'>;
    type R2 = AsyncResult<boolean, 'error2'>;
    const okResult1 = ok(5) as R1;
    const errResult1 = err<'error1'>('error1') as R1;

    // eslint-disable-next-line @typescript-eslint/require-await -- This test requires the function to be async
    const transform = async (value: number): R2 => ok(value === 5);

    const okResult2 = await asyncRunResult(okResult1, transform);
    const errResult2 = await asyncRunResult(errResult1, transform);

    expect(okResult2.ok).toBe(true);
    expect(errResult2.ok).toBe(false);

    expectTypeOf(okResult2).toEqualTypeOf<
      Result<boolean, 'error1' | 'error2'>
    >();
    expectTypeOf(errResult2).toEqualTypeOf<
      Result<boolean, 'error1' | 'error2'>
    >();
  });
});
