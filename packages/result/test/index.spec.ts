import { describe, it, expect, expectTypeOf } from 'vitest';
import type { Result } from '../src/index';
import { ok, err, resultWrap, asyncResultWrap } from '../src/index';

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

  it('returns an error state from a throwing function', () => {
    const okResult = resultWrap(noThrowSync);
    expect(okResult.ok).toBeTruthy();
    if (okResult.ok) expect(okResult.value).toBeFalsy();

    const errResult = resultWrap(throwSync);
    expect(errResult.ok).toBeFalsy();
    if (!errResult.ok)
      expect(errResult.error).toStrictEqual(new Error('This is an error'));
  });

  it('returns an error state from a throwing async function', async () => {
    const okResult = await asyncResultWrap(noThrowAsync);
    expect(okResult.ok).toBeTruthy();
    if (okResult.ok) expect(okResult.value).toBeFalsy();

    const errResult = await asyncResultWrap(throwAsync);
    expect(errResult.ok).toBeFalsy();
    if (!errResult.ok)
      expect(errResult.error).toStrictEqual(
        new Error('This is an async error'),
      );
  });
});
