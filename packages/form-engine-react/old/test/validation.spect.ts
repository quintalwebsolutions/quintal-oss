import { act, renderHook } from '@testing-library/react';
import { it, describe, expect } from 'vitest';
import { textPlugin, useForm } from '../src';
import { ValidationMode } from '../src/lib/validation';

describe('validation', () => {
  it('exposes validation different options per plugin', () => {});

  it('validates the given input based on the plugin used', () => {});

  it('respects the given global or local validation mode', () => {
    type Values = {
      globalValidationMode: string;
      afterBlur: string;
      onChange: string;
      onBlur: string;
      onSubmit: string;
    };

    const { result } = renderHook(() =>
      useForm<Values>({
        fields: {
          globalValidationMode: textPlugin({
            validation: {
              length: { lt: 1, getMessage: () => 'error' },
            },
          }),
          afterBlur: textPlugin({
            validation: {
              length: { lt: 1, getMessage: () => 'error' },
              mode: ValidationMode.AFTER_BLUR,
            },
          }),
          onChange: textPlugin({
            validation: {
              length: { lt: 1, getMessage: () => 'error' },
              mode: ValidationMode.ON_CHANGE,
            },
          }),
          onBlur: textPlugin({
            validation: {
              length: { lt: 1, getMessage: () => 'error' },
              mode: ValidationMode.ON_BLUR,
            },
          }),
          onSubmit: textPlugin({
            validation: {
              length: { lt: 1, getMessage: () => 'error' },
              mode: ValidationMode.ON_SUBMIT,
            },
          }),
        },
        validation: {
          mode: ValidationMode.ON_BLUR,
        },
      }),
    );

    expect(result.current.fields.globalValidationMode.errors).toHaveLength(0);
    expect(result.current.fields.afterBlur.errors).toHaveLength(0);
    expect(result.current.fields.onChange.errors).toHaveLength(0);
    expect(result.current.fields.onBlur.errors).toHaveLength(0);
    expect(result.current.fields.onSubmit.errors).toHaveLength(0);

    act(() => {
      result.current.fields.globalValidationMode.onBlur();
      result.current.fields.afterBlur.onBlur();
      result.current.fields.onChange.onBlur();
      result.current.fields.onBlur.onBlur();
      result.current.fields.onSubmit.onBlur();
    });

    expect(result.current.fields.globalValidationMode.errors).toHaveLength(1);
    expect(result.current.fields.afterBlur.errors).toHaveLength(0);
    expect(result.current.fields.onChange.errors).toHaveLength(0);
    expect(result.current.fields.onBlur.errors).toHaveLength(1);
    expect(result.current.fields.onSubmit.errors).toHaveLength(0);

    act(() => {
      result.current.form.onReset();
      result.current.fields.globalValidationMode.onChange('target');
      result.current.fields.afterBlur.onChange('target');
      result.current.fields.onChange.onChange('target');
      result.current.fields.onBlur.onChange('target');
      result.current.fields.onSubmit.onChange('target');
    });

    expect(result.current.fields.globalValidationMode.errors).toHaveLength(0);
    expect(result.current.fields.afterBlur.errors).toHaveLength(0);
    expect(result.current.fields.onChange.errors).toHaveLength(1);
    expect(result.current.fields.onBlur.errors).toHaveLength(0);
    expect(result.current.fields.onSubmit.errors).toHaveLength(0);

    act(() => {
      result.current.fields.globalValidationMode.onBlur();
      result.current.fields.afterBlur.onBlur();
      result.current.fields.onChange.onBlur();
      result.current.fields.onBlur.onBlur();
      result.current.fields.onSubmit.onBlur();
    });

    expect(result.current.fields.globalValidationMode.errors).toHaveLength(1);
    expect(result.current.fields.afterBlur.errors).toHaveLength(1);
    expect(result.current.fields.onChange.errors).toHaveLength(1);
    expect(result.current.fields.onBlur.errors).toHaveLength(1);
    expect(result.current.fields.onSubmit.errors).toHaveLength(0);

    act(() => {
      result.current.form.onReset();
      result.current.form.onSubmit();
    });

    expect(result.current.fields.globalValidationMode.errors).toHaveLength(1);
    expect(result.current.fields.afterBlur.errors).toHaveLength(1);
    expect(result.current.fields.onChange.errors).toHaveLength(1);
    expect(result.current.fields.onBlur.errors).toHaveLength(1);
    expect(result.current.fields.onSubmit.errors).toHaveLength(1);
  });
});
