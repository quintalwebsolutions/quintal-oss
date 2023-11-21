import type { AnyPlugin } from '../../old2/src/lib/plugin';

type TaggedValue<TValue = unknown, TTag extends string = string> = {
  value: TValue;
  tag: TTag;
};

export type Many<T> = TaggedValue<T, '__many__'>;
export type Optional<T> = TaggedValue<T, '__optional__'>;

type AnyPluginInAnyFields =
  | AnyPlugin
  | Optional<AnyPlugin>
  | Many<AnyPlugin>
  | Optional<Many<AnyPlugin>>
  | Many<Optional<AnyPlugin>>
  | Optional<Many<Optional<AnyPlugin>>>;

type AnyNestedFields<T = never> = Record<string, AnyPluginInAnyFields | T>;
type MaybeMany<T> = T | Many<T>;

export type AnyFields = AnyNestedFields<
  MaybeMany<AnyNestedFields<MaybeMany<AnyNestedFields>>>
>;

export type DefineFields<TFields extends AnyFields> = TFields;
