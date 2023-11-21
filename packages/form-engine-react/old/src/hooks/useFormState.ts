import { useAsyncReducer } from '@quintal/use-async-reducer';
import type {
  AnyPlugin,
  Config,
  RuntimePlugin,
  FieldState,
  Values,
} from '../lib';

export type State<TValues extends Values> = {
  [FieldName in keyof TValues]: {
    field: RuntimePlugin<AnyPlugin, TValues>;
    internalValue: unknown; // TODO
    serializedValue: unknown; // TODO
    isTouched: boolean; // TODO many?
    errors: string[];
    state: FieldState;
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Very complex return type
export function useFormState<TValues extends Values>(
  config: Config<TValues>,
  state: State<TValues>,
) {
  return useAsyncReducer(state, {
    reset: ({ initialState }) => initialState,
    // TODO cannot handle nested fields
    addFields: (
      { currentState },
      fieldName: keyof TValues,
      ...initialValue: unknown[]
    ) => {
      if (!currentState[fieldName].field.options.many)
        throw new Error('You cannot call `addField` on a non-many input');

      return {
        ...currentState,
        [fieldName]: {
          ...currentState[fieldName],
          internalValue: [
            ...(currentState[fieldName].internalValue as unknown[]),
            ...initialValue,
          ],
          serializedValue: [
            ...(currentState[fieldName].serializedValue as unknown[]),
            ...initialValue.map(
              currentState[fieldName].field.plugin.serialize ??
                ((value) => value),
            ),
          ],
        },
      };
    },
    removeFields: (
      { currentState },
      fieldName: keyof TValues,
      index: number,
    ) => {
      if (!currentState[fieldName].field.options.many)
        throw new Error('You cannot call `removeField` on a non-many input');

      const internal = currentState[fieldName].internalValue as unknown[];
      const serialized = currentState[fieldName].serializedValue as unknown[];

      return {
        ...currentState,
        [fieldName]: {
          ...currentState[fieldName],
          internalValue: [
            ...internal.slice(0, index),
            ...internal.slice(index + 1),
          ],
          serializedValue: [
            ...serialized.slice(0, index),
            ...serialized.slice(index + 1),
          ],
        },
      };
    },
  });
}
