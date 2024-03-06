import type { ComponentProps } from 'react';
type MaybeDomEvent = (e?: {
    preventDefault: () => void;
}) => void;
type FormComponentProps<TNativeKey extends keyof React.JSX.IntrinsicElements, TNativeProps extends ComponentProps<TNativeKey>, TRawProps> = {
    register: TNativeProps;
} & TRawProps;
export type FormProps = FormComponentProps<'form', {
    onSubmit: MaybeDomEvent;
    onReset: MaybeDomEvent;
}, {
    onSubmit: MaybeDomEvent;
    onReset: MaybeDomEvent;
    errors: string[];
    isLoading: boolean;
}>;
export type ButtonProps = FormComponentProps<'button', {
    children: string;
    disabled: boolean;
    type: 'submit' | 'reset' | 'button';
    onClick: MaybeDomEvent;
}, {
    label: string;
    isDisabled: boolean;
    isLoading: boolean;
    type: 'submit' | 'reset' | 'button';
    onClick: MaybeDomEvent;
}>;
export {};
//# sourceMappingURL=props.d.ts.map