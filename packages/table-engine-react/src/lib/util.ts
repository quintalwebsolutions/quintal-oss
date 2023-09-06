import type { PluginObject, TransformFn, Plugins, Row } from '../types';

export function serializeValue<TRow extends Row>(
  value: TRow[keyof TRow],
  row: TRow,
  serializeFunction?: (value: TRow[keyof TRow], row: TRow) => string,
): string {
  if (serializeFunction) return serializeFunction(value, row);
  if (typeof value === 'object')
    return value === null ? '' : JSON.stringify(value);
  if (typeof value === 'undefined') return '';
  return String(value);
}

export function getEntries<TObj extends object, K extends keyof TObj>(
  obj: TObj,
): [K, TObj[K]][] {
  // TODO look into this typing
  // @ts-expect-error This should pass by definition.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- Typing is hard
  return Object.entries(obj);
}

type TransformKeys<T> = keyof {
  [K in keyof T as K extends string
    ? K extends `transform${string}`
      ? K
      : never
    : never]: T[K];
};

export function applyPlugins<
  TRow extends Row,
  TPlugins extends Plugins,
  TObject extends PluginObject<TRow, TPlugins> = PluginObject<TRow, TPlugins>,
  TKey extends TransformKeys<TObject> = TransformKeys<TObject>,
  // @ts-expect-error idk why this errors lol it works in practice
  TFn extends TransformFn<TPlugins> = NonNullable<TObject[TKey]>,
>(
  plugins: TObject[],
  pluginFnName: TKey,
  ...args: Parameters<TFn>
): ReturnType<TFn> {
  const [obj, state, setState, meta] = args;
  let result: unknown;
  // TODO deep clone?
  if (typeof obj === 'object') {
    if (obj === null) result = null;
    else result = { ...obj };
  } else result = obj;
  for (const plugin of plugins) {
    const pluginFn = plugin[pluginFnName] as TransformFn<TPlugins> | undefined;
    if (pluginFn) {
      result = pluginFn(result, state, setState, meta);
    }
  }
  return result as ReturnType<TFn>;
}
