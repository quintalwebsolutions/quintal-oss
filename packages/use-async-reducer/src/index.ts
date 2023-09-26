import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type MaybePromise<T> = T | Promise<T>;
type InitialStateFactory<TState> =
  | MaybePromise<TState>
  | (() => MaybePromise<TState>);

function isPromise<T>(obj: MaybePromise<T>): obj is Promise<T> {
  return typeof obj !== 'string' && String(obj) === '[object Promise]';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any is applicable here
type Args = any[];

type ActionState<TState> = { currentState: TState; initialState: TState };

/** Object used to define the reducer's actions. The first argument is the current state and all following arguments are user-defined. */
export type InputActions<TState> = Record<
  string,
  (state: ActionState<TState>, ...args: Args) => MaybePromise<TState>
>;

/** Object used to consume the reducer's actions. The parameters are inferred from the input actions object, dropping the first argument (current state). */
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

/** Internal object that represents an action that is (pending to be) executed. */
export type Action<TState> = {
  name: string;
  execute: (...args: Args) => MaybePromise<TState>;
  args: Args;
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

/** State object returned from hook */
export type State<TState, TActions extends InputActions<TState>> = {
  actions: OutputActions<TState, TActions>;
  isLoading: boolean;
  error: Error<TState> | null;
} & ({ isInitialized: true; state: TState } | { isInitialized: false });

export function useAsyncReducer<
  TState,
  TActions extends InputActions<TState> = InputActions<TState>,
>(
  initialStateFactory: InitialStateFactory<TState>,
  inputActions: TActions,
): State<TState, TActions> {
  const initialStateMaybePromise: MaybePromise<TState> = useMemo(
    () =>
      typeof initialStateFactory === 'function'
        ? (initialStateFactory as () => MaybePromise<TState>)()
        : initialStateFactory,
    [initialStateFactory],
  );

  const initialState: TState | null = useMemo(
    () =>
      isPromise(initialStateMaybePromise) ? null : initialStateMaybePromise,
    [],
  );

  const [state, setState] = useState<TState | null>(initialState);
  const [isInitialized, setIsInitialized] = useState<boolean>(
    initialState !== null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error<TState> | null>(null);

  const initialStateRef = useRef<TState | null>(initialState);
  const stateRef = useRef<TState | null>(initialState);
  const actionQueueRef = useRef<Action<TState>[]>([]);
  const isLoadingRef = useRef<boolean>(false);

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
        (prev, [actionKey, execute]) => {
          prev[actionKey as keyof TActions] = (...args) => {
            const action: Action<TState> = { name: actionKey, execute, args };
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

  if (isInitialized)
    return {
      isInitialized,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the `null` annotation only exists to represent an uninitialized state
      state: state!,
      actions,
      isLoading,
      error,
    };
  return { isInitialized, actions, isLoading, error };
}
