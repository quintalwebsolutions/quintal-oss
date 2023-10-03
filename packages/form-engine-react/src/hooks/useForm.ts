import type { Config, Values } from '../lib';
import type { Form } from './useFormProps';
import { useFormProps } from './useFormProps';
import { useFormState } from './useFormState';
import { useInitialState } from './useInitialState';

export function useForm<TValues extends Values>(
  config: Config<TValues>,
): Form<TValues> {
  const initialState = useInitialState(config);
  const formState = useFormState(config, initialState);
  return useFormProps(formState.isInitialized ? formState.state : initialState);
}
