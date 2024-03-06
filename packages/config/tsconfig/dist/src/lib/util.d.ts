import type { PluginObject, Plugins, Row, TransformFn } from '../types';
export declare function serializeValue<TRow extends Row>(value: TRow[keyof TRow], row: TRow, serializeFunction?: (value: TRow[keyof TRow], row: TRow) => string): string;
export declare function getEntries<TObj extends object, K extends keyof TObj>(obj: TObj): [K, TObj[K]][];
type TransformKeys<T> = keyof {
    [K in keyof T as K extends string ? K extends `transform${string}` ? K : never : never]: T[K];
};
export declare function applyPlugins<TRow extends Row, TPlugins extends Plugins, TObject extends PluginObject<TRow, TPlugins> = PluginObject<TRow, TPlugins>, TKey extends TransformKeys<TObject> = TransformKeys<TObject>, TFn extends TransformFn<TPlugins> = NonNullable<TObject[TKey]>>(plugins: TObject[], pluginFnName: TKey, ...args: Parameters<TFn>): ReturnType<TFn>;
export {};
//# sourceMappingURL=util.d.ts.map