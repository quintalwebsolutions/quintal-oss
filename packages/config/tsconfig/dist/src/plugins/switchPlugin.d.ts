import type { Plugin, PluginObject, PluginValue } from '../lib';
export type SwitchPlugin = Plugin<boolean, {
    emptyValue: false;
}>;
export type SwitchPluginValue = PluginValue<SwitchPlugin>;
export declare const switchPlugin: PluginObject<SwitchPlugin>;
//# sourceMappingURL=switchPlugin.d.ts.map