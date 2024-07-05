type TaggedValue<TValue = unknown, TTag extends string = string> = {
  value: TValue;
  tag: TTag;
};

export type Many<T> = TaggedValue<T, '__many__'>;
export type Optional<T> = TaggedValue<T, '__optional__'>;

type ValueArgs = {
  /** Optional: What the internal value serializes to. Default: TInternalValue */
  serialized?: unknown;
  /** Optional: How a empty internal value should be represented. Default: null */
  empty?: unknown;
};

export type Value<TInternal, TValueArgs extends ValueArgs = Record<never, unknown>> = {
  __internal__: TInternal;
  __serialized__: 'serialized' extends keyof TValueArgs ? TValueArgs['serialized'] : TInternal;
  __empty__: 'empty' extends keyof TValueArgs ? TValueArgs['empty'] : null;
};

export type AnyValue = {
  __internal__: unknown;
  __serialized__: unknown;
  __empty__: unknown;
};

type ValueFlag = 'serialized' | 'optional';
export type UnwrapValue<T, TValueFlag extends ValueFlag = never> = T extends Value<
  infer TValue,
  infer _TValueArgs
>
  ? [TValueFlag] extends [never]
    ? TValue
    : 'serialized' extends TValueFlag
      ? T['__serialized__']
      : 'optional' extends TValueFlag
        ? T['__internal__'] | T['__empty__']
        : never
  : T extends Optional<infer TValue>
    ? 'serialized' extends TValueFlag
      ? UnwrapValue<TValue, 'serialized'>
      : UnwrapValue<TValue, 'optional'>
    : T extends Many<infer TValue>
      ? [TValueFlag] extends [never]
        ? UnwrapValue<TValue>[]
        : 'serialized' extends TValueFlag
          ? UnwrapValue<TValue, 'serialized'>
          : 'optional' extends TValueFlag
            ? UnwrapValue<TValue>[] | null
            : never
      : T extends Record<string, unknown>
        ? [TValueFlag] extends [never]
          ? { [TKey in keyof T]: UnwrapValue<T[TKey], TValueFlag> }
          : 'serialized' extends TValueFlag
            ? { [TKey in keyof T]: UnwrapValue<T[TKey], 'serialized'> }
            : 'optional' extends TValueFlag
              ? { [TKey in keyof T]: UnwrapValue<T[TKey]> } | null
              : never
        : 'serialized' extends TValueFlag
          ? T
          : 'optional' extends TValueFlag
            ? T | null
            : T;

export type Values = Record<string, unknown>;

export type UnwrapValues<TValues extends Values, TValueFlag extends ValueFlag = never> = {
  [TFieldName in keyof TValues]: UnwrapValue<TValues[TFieldName], TValueFlag>;
};
