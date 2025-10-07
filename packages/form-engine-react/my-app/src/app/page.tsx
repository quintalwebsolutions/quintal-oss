'use client';

import { type FormEvent, useCallback, useState } from 'react';

export default function Home() {
  const [values, setValues] = useState<{
    one: string | null;
    two: string | null;
    three: string | null;
  }>({ one: null, two: null, three: null });

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      console.log(values);
    },
    [values],
  );

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col w-96">
        <input
          type="text"
          className="mb-4"
          onChange={(e) => setValues({ ...values, one: e.target.value })}
          value={values.one ?? ''}
        />
        <input type="text" className="mb-4" />
        <input type="text" className="mb-4" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
