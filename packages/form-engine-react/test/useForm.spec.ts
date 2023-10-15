import { renderHook } from '@testing-library/react';
import { describe, it } from 'vitest';
import { useForm } from '../src';

describe('useForm', () => {
  it('', () => {
    const { result } = renderHook(() => useForm());
  });
});
