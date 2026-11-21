import { COMPOSIO_MULTI_EXECUTE_TOOL } from "./composio-batch.js";

/** One connected account a session pins, with every name the model may use for it. */
export type ComposioAccountRef = {
  /** Canonical toolkit slug, e.g. SLACK. */
  toolkit: string;
  /** Composio connected-account id (`ca_…`), what the session pins. */
  id: string;
  /** Composio's readable id (`slack_nappy-lim`), what its tool results show the model. */
  wordId?: string;
  /** Composio alias, when the account has one. */
  alias?: string;
  /** The names the user gave the connection here (the plugin names). */
  names: string[];
};

export type ComposioAccountResolution = { id: string } | { error: string } | undefined;

const MASK = /…|\.{3}/;

function key(value: string): string {
  return value.trim().toLowerCase();
}

function slugKey(value: string): string {
  return value.trim().toUpperCase();
}

/** Accounts of the toolkit that owns `toolSlug` (the longest matching toolkit prefix). */
export function accountsForTool(
  toolSlug: string | undefined,
  refs: ComposioAccountRef[],
): ComposioAccountRef[] {
  if (!toolSlug) return [];
  const tool = slugKey(toolSlug);
  let best = "";
  for (const ref of refs) {
    const toolkit = slugKey(ref.toolkit);
    if (tool.startsWith(`${toolkit}_`) && toolkit.length > best.length) best = toolkit;
  }
  return best ? refs.filter((ref) => slugKey(ref.toolkit) === best) : [];
}

/** What the model can pass for an account, e.g. `"workstackos" (slack_nappy-lim)`. */
export function composioAccountLabel(ref: ComposioAccountRef): string {
  const shown = ref.wordId || ref.id;
  const names = [...new Set([...ref.names, ...(ref.alias ? [ref.alias] : [])])]
    .filter((name) => key(name) !== key(shown))
    .map((name) => JSON.stringify(name));
  return names.length > 0 ? `${names.join(" / ")} (${shown})` : shown;
}

export function composioAccountList(refs: ComposioAccountRef[]): string {
  return refs.map(composioAccountLabel).join(", ");
}

/**
 * Turn whatever the model passed as `account` into the connected-account id the session pins:
 * the account id, Composio's readable id or alias, the connection's name here, or a shortened
 * form such as `sla…-lim`. Undefined when there is nothing to resolve against.
 */
export function resolveComposioAccount(
  value: string,
  candidates: ComposioAccountRef[],
): ComposioAccountResolution {
  const wanted = key(value);
  if (!wanted || candidates.length === 0) return undefined;
  const unique = (matches: ComposioAccountRef[]) => [...new Set(matches.map((ref) => ref.id))];

  const exact = unique(
    candidates.filter((ref) =>
      [ref.id, ref.wordId, ref.alias].some((id) => id !== undefined && key(id) === wanted),
    ),
  );
  if (exact.length === 1) return { id: exact[0]! };

  const named = unique(candidates.filter((ref) => ref.names.some((name) => key(name) === wanted)));
  if (named.length === 1) return { id: named[0]! };
  if (named.length > 1) {
    return {
      error: `More than one connected account is named "${value}". Pass one of: ${composioAccountList(candidates)}.`,
    };
  }

  if (MASK.test(wanted)) {
    const [prefix = "", ...rest] = wanted.split(MASK);
    const suffix = rest.join("");
    if (prefix || suffix) {
      const masked = unique(
        candidates.filter((ref) =>
          [ref.id, ref.wordId].some(
            (id) => id !== undefined && key(id).startsWith(prefix) && key(id).endsWith(suffix),
          ),
        ),
      );
      if (masked.length === 1) return { id: masked[0]! };
    }
  }

  return {
    error: `No connected account matches "${value}". Pass one of: ${composioAccountList(candidates)}.`,
  };
}

/**
 * Resolve every `account` the call names. Items without an account are left alone, so the
 * session's default account serves them.
 */
export function resolveCallAccounts(
  tool: string,
  args: Record<string, unknown>,
  account: string | undefined,
  refs: ComposioAccountRef[],
): { args: Record<string, unknown>; account?: string } | { error: string } {
  if (tool === COMPOSIO_MULTI_EXECUTE_TOOL && Array.isArray(args.tools)) {
    const tools: unknown[] = [];
    for (const item of args.tools) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        tools.push(item);
        continue;
      }
      const record = item as Record<string, unknown>;
      if (typeof record.account !== "string" || !record.account.trim()) {
        tools.push(item);
        continue;
      }
      const slug = typeof record.tool_slug === "string" ? record.tool_slug : undefined;
      const resolved = resolveComposioAccount(record.account, accountsForTool(slug, refs));
      if (resolved && "error" in resolved) return { error: `${slug ?? tool}: ${resolved.error}` };
      tools.push(resolved ? { ...record, account: resolved.id } : item);
    }
    return { args: { ...args, tools }, ...(account ? { account } : {}) };
  }
  if (!account) return { args };
  const resolved = resolveComposioAccount(account, accountsForTool(tool, refs));
  if (resolved && "error" in resolved) return { error: `${tool}: ${resolved.error}` };
  return { args, account: resolved ? resolved.id : account };
}

/** Toolkits with more than one account, listed for the model so it can name the one to use. */
export function composioAccountsHint(refs: ComposioAccountRef[]): string | undefined {
  const byToolkit = new Map<string, ComposioAccountRef[]>();
  for (const ref of refs) {
    const list = byToolkit.get(slugKey(ref.toolkit)) ?? [];
    if (!list.some((item) => item.id === ref.id)) list.push(ref);
    byToolkit.set(slugKey(ref.toolkit), list);
  }
  const lines = [...byToolkit]
    .filter(([, list]) => list.length > 1)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([toolkit, list]) => `- ${toolkit}: ${composioAccountList(list)}`);
  if (lines.length === 0) return undefined;
  return [
    "Connected accounts (set `account` on each tool to any name or id shown; without it the default account is used):",
    ...lines,
  ].join("\n");
}
