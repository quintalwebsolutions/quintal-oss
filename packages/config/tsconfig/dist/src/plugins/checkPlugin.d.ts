import type { Plugin, PluginObject, PluginValue } from '../lib';
export type CheckPlugin = Plugin<boolean | 'indeterminate', {
    emptyValue: false;
}>;
export type CheckPluginValue = PluginValue<CheckPlugin>;
export declare const checkPlugin: PluginObject<CheckPlugin>;
//# sourceMappingURL=checkPlugin.d.ts.map