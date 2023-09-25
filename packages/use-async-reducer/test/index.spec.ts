import { describe, expect, expectTypeOf, it } from 'vitest';
import { act as actSync, renderHook, waitFor } from '@testing-library/react';
import { useAsyncReducer } from '../src';

const act: <T = void>(callback: () => T) => Promise<T> = actSync;

describe('useAsyncReducer', () => {
  it('generates typescript errors on incorrect or missing action types', () => {
    const state = { hi: 'mom' };
    renderHook(() =>
      useAsyncReducer(state, {
        // @ts-expect-error Missing return type
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- test
        missingReturn: () => {},
        // @ts-expect-error Missing return key
        missingReturnKey: () => ({}),
        // @ts-expect-error Incorrect return key
        incorrectReturnKey: () => ({ hey: 'mom' }),
        // @ts-expect-error Incorrect return value
        incorrectReturnValue: () => ({ hi: 10 }),
        // @ts-expect-error Incorrect state parameter type
        incorrectParameter: (s: string) => ({ hi: s }),
        // @ts-expect-error Incorrect state key
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test
        incorrectStateType: (s) => ({ hi: 'mom', test: s.currentState.hey }),
        correctNoState: () => ({ hi: 'mom' }),
        correctWithState: ({ currentState }) => ({ hi: currentState.hi }),
        correctWithParam: ({ currentState }, str: string) => ({
          hi: currentState.hi + str,
        }),
      }),
    );
  });

  it('generates type-safe `actions` and `state` objects', () => {
    const state = { count: 0 };
    const { result } = renderHook(() =>
      useAsyncReducer(state, {
        // eslint-disable-next-line @typescript-eslint/require-await -- test
        add: async ({ currentState }, n: number) => ({
          count: currentState.count + n,
        }),
        addSync: ({ currentState }, n: number) => ({
          count: currentState.count + n,
        }),
      }),
    );

    expectTypeOf(result.current.actions.add).returns.toBeVoid();
    expectTypeOf(result.current.actions.addSync).returns.toBeVoid();
    expectTypeOf(result.current).not.toHaveProperty('state');

    if (result.current.isInitialized) {
      expectTypeOf(result.current).toHaveProperty('state');
      expectTypeOf(result.current.state).not.toHaveProperty('random');
      expectTypeOf(result.current.actions).not.toHaveProperty('reset');
    }

    if (false as boolean) {
      // @ts-expect-error Missing parameter type
      result.current.actions.add();
      // @ts-expect-error Incorrect parameter type
      result.current.actions.add('hi');
      // @ts-expect-error Too many parameters
      result.current.actions.add(1, 2);
    }
  });

  it('mutates the state as expected', async () => {
    const state = { count: 0 };
    const { result } = renderHook(() =>
      useAsyncReducer(state, {
        reset: ({ initialState }) => initialState,
        add: ({ currentState }, n?: number) => ({
          count: currentState.count + (n ?? 1),
        }),
        // eslint-disable-next-line @typescript-eslint/require-await -- test
        addAsync: async ({ currentState }, n?: number) => ({
          count: currentState.count + (n ?? 1),
        }),
        divide: ({ currentState }, n?: number) => ({
          count: currentState.count / (n ?? 1),
        }),
      }),
    );

    expect(result.current.isInitialized).toBeFalsy();
    await waitFor(() => expect(result.current.isInitialized).toBeTruthy());

    if (result.current.isInitialized) {
      await act(() => {
        result.current.actions.add(1);
        result.current.actions.add(2);
      });
      expect(result.current.state.count).toBe(3);

      await act(() => {
        result.current.actions.addAsync(3);
        result.current.actions.divide(3);
      });
      expect(result.current.state.count).toBe(2);
    }
  });

  it('exposes functionality to rerun action queue after a failed action', async () => {
    let shouldFail = true;
    const state = { count: 0 };

    const { result } = renderHook(() =>
      useAsyncReducer(state, {
        // eslint-disable-next-line @typescript-eslint/require-await -- test
        increment: async ({ currentState }) => ({
          count: currentState.count + 1,
        }),
        decrement: ({ currentState }) => {
          if (shouldFail) throw Error('Decrement error');
          return { count: currentState.count - 1 };
        },
        // eslint-disable-next-line @typescript-eslint/require-await -- test
        set: async (_state, n: number) => {
          if (shouldFail) throw Error('Set error');
          return { count: n };
        },
      }),
    );

    await waitFor(() => expect(result.current.isInitialized).toBeTruthy());
    if (result.current.isInitialized) {
      await act(() => {
        result.current.actions.increment();
        result.current.actions.increment();
        result.current.actions.set(10);
        result.current.actions.increment();
        result.current.actions.decrement();
        result.current.actions.increment();
        result.current.actions.increment();
      });

      // Expect the queue to have halted after the first error
      expect(result.current.state.count).toBe(2);
      expect(result.current.error?.message).toBe('Error: Set error');
      expect(result.current.error?.pendingActions).toHaveLength(4);
      expect(result.current.error?.action.name).toBe('set');
      expect(result.current.error?.action.args).toHaveLength(1);
      expect(result.current.error?.action.args[0]).toBe(10);

      shouldFail = false;
      await act(() => {
        result.current.error?.runFailedAction();
      });

      // Expect only the failed action to have run
      expect(result.current.state.count).toBe(10);

      shouldFail = true;
      await act(() => {
        result.current.error?.runPendingActions();
      });

      // Expect the queue to have halted after the second error
      expect(result.current.state.count).toBe(11);
      expect(result.current.error?.message).toBe('Error: Decrement error');
      expect(result.current.error?.pendingActions).toHaveLength(2);
      expect(result.current.error?.action.name).toBe('decrement');
      expect(result.current.error?.action.args).toHaveLength(0);

      shouldFail = false;
      await act(() => {
        result.current.error?.runAllActions();
      });

      // Expect all pending actions to have run
      expect(result.current.state.count).toBe(12);
    }
  });

  it('allows the inital state to be an object, a promise, a sync factory, and an async factory', async () => {
    type State = { hi: string };
    const objectStateFactory = (): State => ({ hi: 'mom' });
    const objectState = objectStateFactory();
    // eslint-disable-next-line @typescript-eslint/require-await -- test
    const promiseStateFactory: () => Promise<State> = async () => ({
      hi: 'mom',
    });
    const promiseState = promiseStateFactory();

    const { result: objectResult } = renderHook(() =>
      useAsyncReducer(objectState, {
        reset: ({ currentState, initialState }) => {
          expectTypeOf(currentState).toEqualTypeOf<State>();
          expectTypeOf(initialState).toEqualTypeOf<State>();
          expect(currentState.hi).toBe('mom');
          return initialState;
        },
      }),
    );

    const { result: promiseResult } = renderHook(() =>
      useAsyncReducer(promiseState, {
        reset: ({ currentState, initialState }) => {
          expectTypeOf(currentState).toEqualTypeOf<State>();
          expectTypeOf(initialState).toEqualTypeOf<State>();
          expect(currentState.hi).toBe('mom');
          return initialState;
        },
      }),
    );

    const { result: factoryResult } = renderHook(() =>
      useAsyncReducer(objectStateFactory, {
        reset: ({ currentState, initialState }) => {
          expectTypeOf(currentState).toEqualTypeOf<State>();
          expectTypeOf(initialState).toEqualTypeOf<State>();
          expect(currentState.hi).toBe('mom');
          return initialState;
        },
      }),
    );

    const { result: asyncFactoryResult } = renderHook(() =>
      useAsyncReducer(promiseStateFactory, {
        reset: ({ currentState, initialState }) => {
          expectTypeOf(currentState).toEqualTypeOf<State>();
          expectTypeOf(initialState).toEqualTypeOf<State>();
          expect(currentState.hi).toBe('mom');
          return initialState;
        },
      }),
    );

    await waitFor(() => {
      expect(objectResult.current.isInitialized).toBeTruthy();
      expect(promiseResult.current.isInitialized).toBeTruthy();
      expect(factoryResult.current.isInitialized).toBeTruthy();
      expect(asyncFactoryResult.current.isInitialized).toBeTruthy();
    });

    if (
      objectResult.current.isInitialized &&
      promiseResult.current.isInitialized &&
      factoryResult.current.isInitialized &&
      asyncFactoryResult.current.isInitialized
    ) {
      expectTypeOf(objectResult.current.state).toEqualTypeOf<State>();
      expectTypeOf(promiseResult.current.state).toEqualTypeOf<State>();
      expectTypeOf(factoryResult.current.state).toEqualTypeOf<State>();
      expectTypeOf(asyncFactoryResult.current.state).toEqualTypeOf<State>();

      expect(objectResult.current.state.hi).toBe('mom');
      expect(promiseResult.current.state.hi).toBe('mom');
      expect(factoryResult.current.state.hi).toBe('mom');
      expect(asyncFactoryResult.current.state.hi).toBe('mom');

      objectResult.current.actions.reset();
      promiseResult.current.actions.reset();
      factoryResult.current.actions.reset();
      asyncFactoryResult.current.actions.reset();
    }
  });
});
