import { describe, expect, expectTypeOf, it } from 'vitest';
import { err, ok, result } from '../src';

function throwSync(): boolean {
  throw new Error('This is an error');
}

function noThrowSync(): boolean {
  return true;
}

async function throwAsync(): Promise<boolean> {
  throw new Error('This is an async error');
}

async function noThrowAsync(): Promise<boolean> {
  return true;
}

describe('Result', () => {
  it('Allows to create type-safe `ok` and `err` values', () => {
    const okValue = ok('value');
    const errValue = err('error' as const);
    const resultValue = result(noThrowSync);

    expectTypeOf(okValue.isOk).toEqualTypeOf<true>();
    expect(okValue.isOk).toBe(true);
    expectTypeOf(okValue.isErr).toEqualTypeOf<false>();
    expect(okValue.isErr).toBe(false);

    expectTypeOf(errValue.isOk).toEqualTypeOf<false>();
    expect(errValue.isOk).toBe(false);
    expectTypeOf(errValue.isErr).toEqualTypeOf<true>();
    expect(errValue.isErr).toBe(true);

    expectTypeOf(resultValue.isOk).toEqualTypeOf<boolean>();
    expect(errValue.isOk).toBe(false);
    expectTypeOf(errValue.isErr).toEqualTypeOf<true>();
    expect(errValue.isErr).toBe(true);
  });

  it('Allows to unwrap the value in the `Result` monad if present', async () => {
    const okUnwrap = ok(42).unwrap;
    expectTypeOf(okUnwrap).returns.toEqualTypeOf<number>();
    expect(okUnwrap()).toEqual(42);

    const errUnwrap = err('error').unwrap;
    expectTypeOf(errUnwrap).returns.toEqualTypeOf<never>();
    expect(errUnwrap).toThrow('error');

    const syncOkResultUnwrap = result(noThrowSync).unwrap;
    expectTypeOf<
      ReturnType<typeof syncOkResultUnwrap>
    >().toEqualTypeOf<boolean>();
    expect(syncOkResultUnwrap()).toEqual(true);

    const syncErrResultUnwrap = result(throwSync).unwrap;
    expectTypeOf<
      ReturnType<typeof syncErrResultUnwrap>
    >().toEqualTypeOf<boolean>();
    expect(syncErrResultUnwrap).toThrow('This is an error');

    const asyncOkResultUnwrap = result(noThrowAsync).unwrap;
    expectTypeOf<ReturnType<typeof asyncOkResultUnwrap>>().toEqualTypeOf<
      Promise<boolean>
    >();
    expect(await asyncOkResultUnwrap()).toBe(true);

    const asyncErrResultUnwrap = result(throwAsync).unwrap;
    expectTypeOf<ReturnType<typeof asyncErrResultUnwrap>>().toEqualTypeOf<
      Promise<boolean>
    >();
    expect(asyncErrResultUnwrap).rejects.toThrow('This is an async error');
  });

  it('Allows to type-narrow a generic result type', () => {
    const unknownResult = result(noThrowSync);
    expectTypeOf<ReturnType<typeof unknownResult.map>>()
      .toHaveProperty('isOk')
      .toEqualTypeOf<boolean>();

    if (unknownResult.isOk) {
      expectTypeOf(unknownResult.map)
        .returns.toHaveProperty('isOk')
        .toEqualTypeOf<true>();
    } else {
      expectTypeOf(unknownResult.map)
        .returns.toHaveProperty('isOk')
        .toEqualTypeOf<false>();
    }
  });

  it('Maps a result by applying a functino to a contained ok value, leaving an err value untouched', () => {
    const okValue = ok(42).map((v) => {
      expectTypeOf(v).toEqualTypeOf<number>();
      return (v * 2).toString();
    });
    const errValue = err('error').map((v) => {
      expectTypeOf(v).toEqualTypeOf<never>();
      return (v * 2).toString();
    });
    const okResultValue = result(noThrowSync).map((v) => {
      expectTypeOf(v).toEqualTypeOf<boolean>();
      return !v;
    });
    const errResultValue = result(throwSync).map((v) => {
      expectTypeOf(v).toEqualTypeOf<boolean>();
      return !v;
    });

    expectTypeOf(okValue.isOk).toEqualTypeOf<true>();
    expect(okValue.isOk).toBe(true);
    expectTypeOf(okValue.isErr).toEqualTypeOf<false>();
    expect(okValue.isErr).toBe(false);
    expect(okValue.unwrap()).toBe('84');

    expectTypeOf(errValue.isOk).toEqualTypeOf<false>();
    expect(errValue.isOk).toBe(false);
    expectTypeOf(errValue.isErr).toEqualTypeOf<true>();
    expect(errValue.isErr).toBe(true);
    expect(errValue.unwrap).toThrow('error');

    expectTypeOf(okResultValue.isOk).toEqualTypeOf<boolean>();
    expect(okResultValue.isOk).toBe(true);
    expectTypeOf(okResultValue.isErr).toEqualTypeOf<boolean>();
    expect(okResultValue.isErr).toBe(false);
    expect(okResultValue.unwrap()).toBe(false);

    expectTypeOf(errResultValue.isOk).toEqualTypeOf<boolean>();
    expect(errResultValue.isOk).toBe(false);
    expectTypeOf(errResultValue.isErr).toEqualTypeOf<boolean>();
    expect(errResultValue.isErr).toBe(true);
    expect(errResultValue.unwrap).toThrow('This is an error');
  });
});
