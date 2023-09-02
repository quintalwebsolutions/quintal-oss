import { describe, it, expect } from "vitest";
import { ok, err, resultWrap, asyncResultWrap, Result } from "../src/index";
import { expectTypeOf } from "expect-type";

function throws(): boolean {
  throw new Error("This is an error");
  return false;
}

function noThrow(): boolean {
  return false;
}

async function throwsAsync(): Promise<boolean> {
  throw new Error("This is an async error");
  return false;
}

async function noThrowAsync(): Promise<boolean> {
  return false;
}

describe("result", () => {
  it("uses type narrowing to extract the value", () => {
    const okResult = ok("value");
    expectTypeOf(okResult).toMatchTypeOf<Result<string, never>>();

    const errResult = err("error");
    expectTypeOf(errResult).toMatchTypeOf<Result<never, string>>();

    const unknownResult = resultWrap(throws);
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

  it("returns an error state from a throwing function", () => {
    const okResult = resultWrap(noThrow);
    expect(okResult.ok).toBeTruthy();
    if (okResult.ok) expect(okResult.value).toBeFalsy();

    const errResult = resultWrap(throws);
    expect(errResult.ok).toBeFalsy();
    if (!errResult.ok)
      expect(errResult.error).toStrictEqual(new Error("This is an error"));
  });

  it("returns an error state from a throwing async function", async () => {
    const okResult = await asyncResultWrap(noThrowAsync);
    expect(okResult.ok).toBeTruthy();
    if (okResult.ok) expect(okResult.value).toBeFalsy();

    const errResult = await asyncResultWrap(throwsAsync);
    expect(errResult.ok).toBeFalsy();
    if (!errResult.ok)
      expect(errResult.error).toStrictEqual(
        new Error("This is an async error")
      );
  });
});
