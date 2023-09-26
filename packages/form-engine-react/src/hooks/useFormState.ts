import { useAsyncReducer } from '@quintal/use-async-reducer';
import type { Config, State, Values } from '../lib';

export function useFormState<TValues extends Values>(
  config: Config<TValues>,
  initialState: State<TValues>,
) {
  return useAsyncReducer(initialState, {});
}
