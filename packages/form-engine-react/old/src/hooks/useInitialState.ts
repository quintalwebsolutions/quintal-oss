import type { Config, Values } from '../lib';
import type { State } from './useFormState';

export function useInitialState<TValues extends Values>(
  config: Config<TValues>,
): State<TValues> {
  return null;
}
