import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Thin wrapper over @github/copilot-sdk. Isolated so the orchestrator stays
 * readable and so the SDK surface can be swapped (e.g. BYOK) without ripple.
 *
 * NOTE: The Copilot SDK is in public preview; the exact client shape evolves.
 * We import it dynamically and adapt, so a minor-version bump doesn't break
 * the orchestrator at parse time.
 */

export interface SessionInput {
  /** Short stable id used for logs/telemetry, e.g. "page:Orders.aspx:contract". */
  id: string;
  /** Prompt markdown (file contents) that drives this session. */
  prompt: string;
  /** Additional skill markdown appended after the main prompt. */
  skills?: string[];
  /** Working directory = repo root of the target WebForms/migrated codebase. */
  cwd: string;
  /** Name of the Git branch the session should work on (pre-checked-out). */
  branch: string;
  /** Whether the session may use the network (default: true). */
  allowNetwork?: boolean;
  /** Hard ceiling for this session, in minutes. */
  timeoutMinutes?: number;
}

export interface SessionResult {
  ok: boolean;
  summary: string;
  premiumRequests?: number;
  /** Files changed by the session (from `git status --porcelain`, added by caller). */
  changedFiles?: string[];
  error?: string;
}

export async function runSession(input: SessionInput): Promise<SessionResult> {
  if (process.env.MIGRATION_DRY_RUN === "1") {
    console.log(`[dry-run] would run copilot session: ${input.id}`);
    console.log(`[dry-run] branch=${input.branch} cwd=${input.cwd}`);
    console.log(`[dry-run] prompt chars=${input.prompt.length}`);
    return { ok: true, summary: "dry-run", premiumRequests: 0, changedFiles: [] };
  }

  // Dynamic import keeps CI/dry-run working even if the SDK isn't installed yet.
  const sdk = await import("@github/copilot-sdk").catch(() => null);
  if (!sdk) {
    throw new Error(
      "@github/copilot-sdk not installed. Run `npm install` or set MIGRATION_DRY_RUN=1."
    );
  }

  // The public SDK exposes a `Copilot` client + a `session` factory. We probe
  // both common shapes so this keeps working across preview versions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SdkAny = sdk as any;
  const token = process.env.COPILOT_GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (!token) throw new Error("COPILOT_GITHUB_TOKEN or GH_TOKEN required for Copilot SDK.");

  const client =
    SdkAny.Copilot ? new SdkAny.Copilot({ token, cwd: input.cwd }) :
    SdkAny.createClient ? SdkAny.createClient({ token, cwd: input.cwd }) :
    SdkAny.default ? new SdkAny.default({ token, cwd: input.cwd }) :
    null;

  if (!client) throw new Error("Unrecognized @github/copilot-sdk shape — update copilot.ts.");

  const fullPrompt = [input.prompt, ...(input.skills ?? [])].join("\n\n---\n\n");
  const started = Date.now();
  const timeoutMs = (input.timeoutMinutes ?? 60) * 60_000;

  try {
    // Preferred path: a top-level `run` that creates a session, streams events,
    // and auto-commits on the current branch. Falls back to `session().ask(...)`.
    const runner = client.run ?? client.session ?? client.createSession;
    if (!runner) throw new Error("SDK client has no run/session method.");

    const promise: Promise<unknown> = client.run
      ? client.run({ prompt: fullPrompt, cwd: input.cwd, allowAll: true })
      : client.session({ cwd: input.cwd, allowAll: true }).ask(fullPrompt);

    const timed = Promise.race([
      promise,
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error(`session ${input.id} exceeded ${input.timeoutMinutes}m`)), timeoutMs)
      ),
    ]);

    const result = await timed;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyRes = result as any;
    const summary = typeof anyRes === "string" ? anyRes :
                    anyRes?.summary ?? anyRes?.text ?? `(session ${input.id} completed)`;
    const premiumRequests = typeof anyRes?.premiumRequests === "number"
      ? anyRes.premiumRequests : 1;

    await appendAuditLog(input.id, started, true, summary);
    return { ok: true, summary, premiumRequests };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await appendAuditLog(input.id, started, false, msg);
    return { ok: false, summary: "session failed", error: msg };
  }
}

async function appendAuditLog(id: string, started: number, ok: boolean, summary: string) {
  const line = JSON.stringify({
    at: new Date().toISOString(),
    id, ok,
    durationMs: Date.now() - started,
    summary: summary.slice(0, 400),
  }) + "\n";
  const p = path.resolve(".migration/audit.log");
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.appendFile(p, line, "utf8");
}
