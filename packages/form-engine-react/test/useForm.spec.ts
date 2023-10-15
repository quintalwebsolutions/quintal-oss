import { renderHook } from '@testing-library/react';
import { describe, it } from 'vitest';
import { useForm, createForm } from '../src';


describe('useForm', () => {
  it('works! :)', () => {
    const form = createForm();
    const { result } = renderHook(() => useForm());
  });
});
