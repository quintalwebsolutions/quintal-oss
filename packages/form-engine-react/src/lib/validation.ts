/** Enum which defines when a form field is validated. */
export enum ValidationMode {
  /** Validate a field with every change */
  ON_CHANGE = 'ON_CHANGE',
  /** Validate the field every time the field is deselected (i.e. blurred) */
  ON_BLUR = 'ON_BLUR',
  /** Don't validate a field until it has been blurred once, then validate it on change */
  AFTER_BLUR = 'AFTER_BLUR',
  /** Only validate the field in the event of a form submission */
  ON_SUBMIT = 'ON_SUBMIT',
}
