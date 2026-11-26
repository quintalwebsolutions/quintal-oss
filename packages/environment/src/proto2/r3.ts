import { type ZodError, type ZodString, type ZodType, z } from 'zod';

// The whole environment is just a zod schema. Leaves remember their raw value.
const leaves = new WeakMap<object, { value: string | undefined; server: boolean }>();
const SKIP = Symbol('skip-server-var-on-client');

export function env(value: string | undefined, schema?: undefined, opts?: { server?: boolean }): ZodString;
export function env<S extends ZodType>(value: string | undefined, schema: S, opts?: { server?: boolean }): S;
export function env(value: string | undefined, schema: ZodType = z.string(), opts?: { server?: boolean }): ZodType {
  const server = opts?.server ?? false;
  // server-only leaves are bypassed on the client (the walker feeds them SKIP there)
  const leaf = server
    ? z
        .custom((x) => x === SKIP)
        .or(schema)
        .transform((x) => (x === SKIP ? undefined : x))
    : schema.clone();
  leaves.set(leaf, { value, server });
  return leaf;
}

type Def = { type: string; [key: string]: unknown };

function merge(a: unknown, b: unknown): unknown {
  if (a && b && typeof a === 'object' && typeof b === 'object')
    return Object.fromEntries(
      [...new Set([...Object.keys(a), ...Object.keys(b)])].map((k) => [
        k,
        merge((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
      ]),
    );
  return a ?? b;
}

// Build the raw input tree from the schema (walks zod internals: object/union/intersection/wrappers).
function walk(s: ZodType, isServer: boolean, path: string[], servers: Set<string>): unknown {
  const leaf = leaves.get(s);
  if (leaf) {
    if (leaf.server) servers.add(path.join('.'));
    if (leaf.server && !isServer) return SKIP;
    return leaf.value || undefined;
  }
  const def = (s as unknown as { _zod: { def: Def } })._zod.def;
  const next = (c: ZodType, p = path) => walk(c, isServer, p, servers);
  switch (def.type) {
    case 'object':
      return Object.fromEntries(
        Object.entries(def.shape as Record<string, ZodType>).map(([k, c]) => [k, next(c, [...path, k])]),
      );
    case 'union':
      return (def.options as ZodType[]).map((o) => next(o)).reduce(merge, undefined);
    case 'intersection':
      return merge(next(def.left as ZodType), next(def.right as ZodType));
    case 'optional':
    case 'nullable':
    case 'default':
    case 'prefault':
    case 'readonly':
    case 'nonoptional':
      return next(def.innerType as ZodType);
    case 'pipe':
      return next(def.in as ZodType);
    case 'lazy':
      return next((def.getter as () => ZodType)());
    default:
      return undefined;
  }
}

function proxify(
  data: Record<string, unknown>,
  servers: Set<string>,
  isServer: boolean,
  onAccessError: (name: string) => never,
  prefix?: string,
): unknown {
  return new Proxy(data, {
    get(target, prop) {
      if (typeof prop !== 'string') return undefined;
      const name = prefix ? `${prefix}.${prop}` : prop;
      if (servers.has(name) && !isServer) return onAccessError(name);
      const value = target[prop];
      if (value && typeof value === 'object' && !Array.isArray(value))
        return proxify(value as Record<string, unknown>, servers, isServer, onAccessError, name);
      return value;
    },
  });
}

export function createEnvironment<S extends ZodType<Record<string, unknown>>>(
  root: S,
  opts: {
    isDisabled?: boolean;
    isServer?: boolean;
    onValidationError?: (error: ZodError) => never;
    onAccessError?: (variableName: string) => never;
  } = {},
): z.output<S> {
  const isServer = opts.isServer ?? typeof window === 'undefined';
  const onValidationError =
    opts.onValidationError ??
    ((e) => {
      throw new Error(`❌ Invalid environment variables:\n${z.prettifyError(e)}`);
    });
  const onAccessError =
    opts.onAccessError ??
    ((name) => {
      throw new Error(`❌ Attempted to access server-side environment variable '${name}' on the client`);
    });

  const servers = new Set<string>();
  if (opts.isDisabled) return walk(root, true, [], servers) as z.output<S>;
  const raw = walk(root, isServer, [], servers);
  const parsed = root.safeParse(raw);
  if (!parsed.success) return onValidationError(parsed.error);
  return proxify(parsed.data, servers, isServer, onAccessError) as z.output<S>;
}
