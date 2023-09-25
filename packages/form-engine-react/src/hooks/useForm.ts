import type {
  ButtonProps,
  FormProps,
  Config,
  Values,
  FieldProps,
  UnwrapValue,
} from '../lib';

type Form<TValues extends Values> = {
  form: FormProps;
  submitButton: ButtonProps;
  resetButton: ButtonProps;
  fields: {
    [FieldName in keyof TValues]: FieldProps<
      UnwrapValue<TValues[FieldName], 'serialized'>
    >;
  };
};

export function useForm(
  // config: Config,
): null {
  // console.log(config);
  return null;
}
