import { renderHook } from '@testing-library/react';
import { describe, it } from 'vitest';
// import z from 'zod';
import { useForm, createForm } from '../src';
import type { DefineFields } from '../old2/src';

describe('useForm', () => {
  it('works! :)', () => {
    // const schema = z.object({
    //   address: z.object({
    //     street: z.string(),
    //     houseNumber: z.number(),
    //   }),
    //   termsAndServices: z.boolean({}),
    // });

    // const obj = schema.parse({});

    // TODO createZodForm, createYupForm, etc...
    // Schema that can be used to validate the form payload server-side
    type Fields = DefineFields<{
      address: {
        street: string;
        houseNumber: number;
      }
      personalizedAds: Optional<boolean>;
      termsAndServices: boolean;
    }>

    const form = createForm<Fields>({
      
    });

    const { result } = renderHook(() => useForm(form));
  });
});
