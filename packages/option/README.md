# Option

A TypeScript optional value handling paradigm using an `Option` monad, inspired by [the Rust programming language](https://doc.rust-lang.org/std/option/).

The type `Option<T>` represents an optional value. It has the following variants:

- `some(value: T)`, representing the presence of a value;
- `none`, representing the absence of a value.

Functions return `Option` whenever the absence of a value is a normal, expected part of the function's behaviour. It signifies that having no value is a routine possibility, not necessarily a problem or error. For those cases, have a look at [@quintal/result](https://npmjs.com/package/@quintal/result). A function returning `Option` might be defined and used like so:

```ts
import { type Option, some, none } from '@quintal/option';

function safeDivide(numerator: number, denominator: number): Option<number> {
  if (denominator === 0) return none;
  else return some(numerator / denominator);
}

const res = safeDivide(2, 3);

// TODO use res
```

## Method Overview

`Option` comes with a wide variety of different convenience methods that make working with it more succinct.

### Querying the variant

- `isSome` and `isNone` are `true` if the `Option` is `some` or `none` respectively.

### Extracting the contained value

These methods extract the contained value from an `Option<T>` when it is the `some` variant. If the `Option` is `none`:

- `expect` throws the provided custom message.
- `unwrap` throws a generic error.
- `unwrapOr` returns the provided default value.
- `unwrapOrElse` returns the result of evaluating the provided function.

### Transforming contained values

- `okOr` transforms `Option<T>` into `Result<T, E>, mapping `some` to `ok` and `none` to `err` using the provided default `err` value.
- `okOrElse` transforms `Option<T>` into `Result<T, E>`, mapping `some` to `ok` and `none` to a value of `err` using the provided function. 
- `transpose` transforms an `Option` of a `Result` into a `Result` of an `Option`.
- `filter`
- `flatten`
- `map`
- `mapOr`
- `mapOrElse`
- `zip`
- `zipWith`

### Boolean operators

These methods treat the `Option` as a boolean value, where `some` acts like `true` and `none` acts like `false`.

- `and`, `or`, and `xor` take another `Option` as input, and produce an `Option` as output.
- `andThen` and `orElse` take a function as input, and only lazily evaluate the function when they need to produce a new value.

### Modifying an Option in-place

- `insert`
- `getOrInsert`
- `getOrInsertWith`
- `take`
- `replace`

## API

You can explore [the exposed functions and types on ts-docs](https://tsdocs.dev/docs/@quintal/option)
