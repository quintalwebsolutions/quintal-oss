import type { Config, State, Values } from '../lib';
import { useAsyncReducer } from './useAsyncReducer';

export function useFormState<TValues extends Values>(
  config: Config<TValues>,
  initialState: State<TValues>,
) {
  return useAsyncReducer(initialState, {});
}
