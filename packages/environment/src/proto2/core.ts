import { type ZodError, type ZodType, z } from 'zod';

// Normalized tree shared by the object-style designs (R1, R2).
export type Leaf = {
  kind: 'leaf';
  value: string | undefined;
  schema: ZodType;
  server: boolean;
  cases?: Record<string, Group>;
};
export type Group = { [key: string]: Leaf | Group };

export type Options = {
  isDisabled?: boolean;
  isServer?: boolean;
  onValidationError?: (error: ZodError) => never;
  onAccessError?: (variableName: string) => never;
};

const isLeaf = (n: Leaf | Group): n is Leaf => (n as Leaf).kind === 'leaf';

function rawOf(g: Group, withCases: boolean): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, n] of Object.entries(g)) {
    if (!isLeaf(n)) out[k] = rawOf(n, withCases);
    else {
      out[k] = n.value || undefined;
      if (withCases && n.cases)
        for (const c of Object.values(n.cases)) Object.assign(out, rawOf(c, withCases));
    }
  }
  return out;
}

// Pass 1 = this group's own leaves. The selected case (pass 2) runs inside a transform,
// which zod only executes when pass 1 succeeded, so nesting/recursion come for free.
function schemaOf(g: Group, isServer: boolean): ZodType {
  const shape: Record<string, ZodType> = {};
  let disc: [string, Record<string, Group>] | undefined;
  for (const [k, n] of Object.entries(g)) {
    if (!isLeaf(n)) shape[k] = schemaOf(n, isServer);
    else {
      if (!n.server || isServer) shape[k] = n.schema;
      if (n.cases) disc = [k, n.cases];
    }
  }
  const base = z.object(shape);
  if (!disc) return base;
  const [key, cases] = disc;
  const perCase = Object.fromEntries(
    Object.entries(cases).map(([v, c]) => [v, { schema: schemaOf(c, isServer), raw: rawOf(c, false) }]),
  );
  return base.transform((data, ctx) => {
    const c = perCase[(data as Record<string, string>)[key] as string];
    if (!c) return data;
    const r = c.schema.safeParse(c.raw);
    if (!r.success) {
      for (const issue of r.error.issues) ctx.addIssue(issue as never);
      return z.NEVER;
    }
    return { ...data, ...(r.data as object) };
  });
}

function lookup(g: Group, prop: string): Leaf | Group | undefined {
  if (prop in g) return g[prop];
  for (const n of Object.values(g))
    if (isLeaf(n) && n.cases)
      for (const c of Object.values(n.cases)) {
        const hit = lookup(c, prop);
        if (hit) return hit;
      }
  return undefined;
}

function proxify(
  data: Record<string, unknown>,
  g: Group,
  isServer: boolean,
  onAccessError: (name: string) => never,
  prefix?: string,
): unknown {
  return new Proxy(data, {
    get(target, prop) {
      if (typeof prop !== 'string') return undefined;
      const node = lookup(g, prop);
      if (!node) return undefined;
      const name = prefix ? `${prefix}.${prop}` : prop;
      if (!isLeaf(node))
        return proxify(target[prop] as Record<string, unknown>, node, isServer, onAccessError, name);
      if (node.server && !isServer) return onAccessError(name);
      return target[prop];
    },
  });
}

export function run(root: Group, opts: Options = {}): unknown {
  const isServer = opts.isServer ?? typeof window === 'undefined';
  const onValidationError =
    opts.onValidationError ??
    ((e) => {
      throw new Error(`❌ Invalid environment variables:\n${z.prettifyError(e)}`);
    });
  const onAccessError =
    opts.onAccessError ??
    ((name) => {
      throw new Error(
        `❌ Attempted to access server-side environment variable '${name}' on the client`,
      );
    });

  if (opts.isDisabled) return rawOf(root, true);
  const parsed = schemaOf(root, isServer).safeParse(rawOf(root, false));
  if (!parsed.success) return onValidationError(parsed.error);
  return proxify(parsed.data as Record<string, unknown>, root, isServer, onAccessError);
}
