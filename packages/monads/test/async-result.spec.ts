async function throwAsync(): Promise<'value'> {
  throw new Error('error');
}

async function noThrowAsync(): Promise<'value'> {
  return 'value';
}
