import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** Represents a value that may or may not be a Promise */
type MaybePromise<T> = T | Promise<T>;

/** Convert from an initial state factory into the state type it generates */
export type UnwrapInitialStateFactory<T> = T extends Promise<infer TState>
  ? TState
  : T extends () => Promise<infer TState>
  ? TState
  : T extends () => infer TState
  ? TState
  : T;

/** Check whether or not the given MaybePromise is a Promise */
function isPromise<T>(obj: MaybePromise<T>): obj is Promise<T> {
  return typeof obj !== 'string' && String(obj) === '[object Promise]';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any is applicable here
type Args = any[];

type ActionState<TState> = {
  currentState: TState;
  initialState: TState;
};

/**
 * Object used to define the reducer's actions.
 * The first argument is the current internal state,
 * all following arguments are user-defined.
 */
export type InputActions<TState> = Record<
  string,
  (state: ActionState<TState>, ...args: Args) => MaybePromise<TState>
>;

/**
 * Object used to consume the reducer actions.
 * The parameters are inferred from the input actions object,
 * dropping the first argument (current internal state).
 */
export type OutputActions<TState, TActions extends InputActions<TState>> = {
  [TActionKey in keyof TActions]: (
    ...args: Parameters<TActions[TActionKey]> extends [
      ActionState<TState>,
      ...infer U,
    ]
      ? U
      : never
  ) => void;
};

/** Internal object that represents an action that may be pending to be executed. */
export type Action<TState> = {
  name: string;
  args: Args;
  execute: (...args: Args) => MaybePromise<TState>;
};

/** Object that returns an error that may have occurred during the execution of an action. */
export type Error<TState> = {
  message: string;
  action: Action<TState>;
  pendingActions: Action<TState>[];
  runFailedAction: () => void;
  runPendingActions: () => void;
  runAllActions: () => void;
};

type StateBase<TState, TActions extends InputActions<TState>> = {
  actions: OutputActions<TState, TActions>;
  isLoading: boolean;
  error: Error<TState> | null;
};
type StateInitialized<TState> = {
  isInitialized: true;
  state: TState;
};
type StateUninitialized = { isInitialized: false };

/**
 * State object returned from the hook.
 * When the initial state is a `Promise` or a `() => Promise`,
 * The returned state contains a check to see if the state object has initialized.
 */
export type UseAsyncReducerState<
  TInitialStateFactory,
  TActions extends InputActions<
    UnwrapInitialStateFactory<TInitialStateFactory>
  >,
> = StateBase<UnwrapInitialStateFactory<TInitialStateFactory>, TActions> &
  (
    | StateInitialized<UnwrapInitialStateFactory<TInitialStateFactory>>
    | (TInitialStateFactory extends Promise<unknown> | (() => Promise<unknown>)
        ? StateUninitialized
        : never)
  );

export function useAsyncReducer<
  TInitialStateFactory,
  TActions extends InputActions<
    UnwrapInitialStateFactory<TInitialStateFactory>
  >,
>(
  initialStateFactory: TInitialStateFactory,
  inputActions: TActions,
): UseAsyncReducerState<TInitialStateFactory, TActions> {
  type TState = UnwrapInitialStateFactory<TInitialStateFactory>;

  // Reduce `initialStateFactory` into something that is `MaybePromise<TState>`
  const initialStateMaybePromise: MaybePromise<TState> = useMemo(
    () =>
      typeof initialStateFactory === 'function'
        ? (initialStateFactory as () => MaybePromise<TState>)()
        : (initialStateFactory as MaybePromise<TState>),
    [initialStateFactory],
  );

  // Define the initial state on initial load, which is `null` if `initialStateMaybePromise` is a `Promise`
  const initialState = useMemo(
    () =>
      isPromise(initialStateMaybePromise) ? null : initialStateMaybePromise,
    [],
  );

  const [state, setState] = useState(initialState);
  const [isInitialized, setIsInitialized] = useState(initialState !== null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error<TState> | null>(null);

  const initialStateRef = useRef(initialState);
  const stateRef = useRef(initialState);
  const actionQueueRef = useRef<Action<TState>[]>([]);
  const isLoadingRef = useRef(false);

  /** Execute the next action from the queue */
  const popActionQueue = useCallback(() => {
    const currentAction = actionQueueRef.current.shift();

    const runActions = (newActions: Action<TState>[]): void => {
      actionQueueRef.current = [...newActions];
      popActionQueue();
    };

    const exit = <TError>(newError?: TError): void => {
      const pendingActions = [...actionQueueRef.current];
      if (currentAction && newError)
        setError({
          message: String(newError),
          action: currentAction,
          pendingActions,
          runFailedAction: () => {
            runActions([currentAction]);
          },
          runPendingActions: () => {
            runActions(pendingActions);
          },
          runAllActions: () => {
            runActions([currentAction, ...pendingActions]);
          },
        });
      actionQueueRef.current = [];
      isLoadingRef.current = false;
      setIsLoading(isLoadingRef.current);
    };

    const evaluate = (newState: TState): void => {
      stateRef.current = newState;
      setState(stateRef.current);
      if (actionQueueRef.current.length === 0) exit();
      else popActionQueue();
    };

    if (currentAction) {
      try {
        const returnValue = currentAction.execute(
          {
            currentState: stateRef.current,
            initialState: initialStateRef.current,
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- we allow it here
          ...currentAction.args,
        );
        if (isPromise(returnValue)) {
          isLoadingRef.current = true;
          setIsLoading(isLoadingRef.current);
          returnValue.then(evaluate).catch(exit);
        } else evaluate(returnValue);
      } catch (e) {
        exit(e);
      }
    }
  }, []);

  /** Push an action to the queue */
  const pushToActionQueue = useCallback(
    (action: Action<TState>) => {
      actionQueueRef.current.push(action);
      if (!isLoadingRef.current) popActionQueue();
    },
    [popActionQueue],
  );

  /** The actions object returned to the user that proxies the user-defined actions */
  const actions = useMemo<OutputActions<TState, TActions>>(
    () =>
      Object.entries(inputActions).reduce(
        (prev, [name, execute]) => {
          prev[name as keyof TActions] = (...args) => {
            const action: Action<TState> = { name, execute, args };
            pushToActionQueue(action);
          };
          return prev;
        },
        {} as OutputActions<TState, TActions>,
      ),
    [inputActions, pushToActionQueue],
  );

  /** If initial state is changed, reset the hook state */
  useEffect(() => {
    if (isPromise(initialStateMaybePromise))
      pushToActionQueue({
        name: 'Async Initialize / Reset',
        execute: async () => {
          initialStateRef.current = await initialStateMaybePromise;
          setIsInitialized(true);
          return initialStateRef.current;
        },
        args: [],
      });
    else
      pushToActionQueue({
        name: 'Initialize / Reset',
        execute: () => {
          initialStateRef.current = initialStateMaybePromise;
          return initialStateRef.current;
        },
        args: [],
      });
  }, [initialStateMaybePromise]);

  return {
    isInitialized,
    state,
    actions,
    isLoading,
    error,
    // TODO fix this lazy cast
  } as UseAsyncReducerState<TInitialStateFactory, TActions>;
}
