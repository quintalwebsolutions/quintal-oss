# @quintal/form-engine-react

This form engine supports multiple form use cases and applies them intelligently
when and where necessary, even mixing paradigms within the same form.

## Tracked, Controlled Form Elements

Form elements that have a `value` and `onChange` prop to capture changes and
keep the field value in sync with the internal state.

- Pros: Instant validation hints as the user types, ability to control input
  value as the user types (adding hyphens in phone numbers, auto-formatting a
  postal code, etc.)
- Cons: All controlled inputs in the form rerender all at once for every single
  change and blur event

You are opted into this paradigm when you pass a `transform` function
configuration option to a form field, since this is the only reason you would
want to use this paradigm.

## Tracked, Uncontrolled Form Elements

Form elements that have an `onChange` prop, but no `value` prop. Their value is
tracked, but it cannot be programmatically updated.

- Pros: Instant validation hints as the user types, not rerendered when a
  controlled input changes.
- Cons: Still rerenders all controlled form elements on every change event, no
  control over the input value.

This is the default paradigm.

## Untracked, Uncontrolled Form Elements

Form elements that have neither an `onChange`, nor a `value` prop. They are
completely at the mercy of the html gods.

- Pros: An input is only rendered once, and it enables progressive enhancement
  if the entire form is untracked & uncontrolled, doesn't affect the rest of the
  form.
- Cons: Can only validate after a server round trip, no way to programmatically
  react to the input value changing.

> NOTE: As of writing, right now this paradigm is not yet supported. We are
> working towards supporting it in the near future.
