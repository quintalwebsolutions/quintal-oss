import type { Plugin, ValueFromPlugin } from '../lib';
import { textPlugin } from './textPlugin';

export type TextAreaPlugin = Plugin<string>;

export type TextAreaPluginValue = ValueFromPlugin<TextAreaPlugin>;

export const textAreaPlugin = textPlugin;
