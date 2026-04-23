import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Thin wrapper over @github/copilot-sdk. Isolated so the orchestrator stays
 * readable and so the SDK surface can be swapped (e.g. BYOK) without ripple.
 *
 * Uses CopilotClient → start() → createSession({ mcpServers }) → sendAndWait()
 * per the official SDK API (technical preview, 2026).
 *
 * The Copilot CLI must be installed and in PATH. The SDK spawns it as a
 * subprocess in server mode and communicates via JSON-RPC over stdio.
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
  /** Hard ceiling for this session, in minutes. */
  timeoutMinutes?: number;
  /** Whether to attach the modernize-dotnet MCP server. */
  useMcpModernize?: boolean;
}

export interface SessionResult {
  ok: boolean;
  summary: string;
  premiumRequests?: number;
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

  const sdk = await import("@github/copilot-sdk").catch(() => null);
  if (!sdk) {
    throw new Error(
      "@github/copilot-sdk not installed. Run `npm install` or set MIGRATION_DRY_RUN=1."
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { CopilotClient } = sdk as any;
  if (!CopilotClient) throw new Error("@github/copilot-sdk missing CopilotClient export — update SDK.");

  // Approve all permission requests so the session can read/write files and run shell commands.
  // The SDK has no built-in "approveAll" — we provide our own handler.
  const approveAllPermissions = () => ({ kind: "approved" as const });

  const token = process.env.COPILOT_GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (!token) throw new Error("COPILOT_GITHUB_TOKEN or GH_TOKEN required for Copilot SDK.");

  const executionDirective = [
    "IMPORTANT: You are an autonomous coding agent. Do NOT just plan or summarize.",
    "You MUST immediately implement all changes by writing files and running commands.",
    "Do NOT ask questions. Do NOT wait for confirmation. Execute everything NOW.",
    "Use your tools to create/edit files, run shell commands, and verify the build.",
    "When done, ensure all changes are saved to disk in the working directory.",
    "",
    "---",
    "",
  ].join("\n");

  const fullPrompt = [executionDirective, input.prompt, ...(input.skills ?? [])].join("\n\n---\n\n");
  const started = Date.now();
  const timeoutMs = (input.timeoutMinutes ?? 60) * 60_000;

  const client = new CopilotClient({
    githubToken: token,
    cwd: input.cwd,
  });

  try {
    await client.start();

    // Build MCP server config if modernize-dotnet is requested.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mcpServers: Record<string, any> | undefined = input.useMcpModernize
      ? {
          Modernization: {
            type: "local" as const,
            command: "dnx",
            args: [
              "Microsoft.GitHubCopilot.Modernization.Mcp",
              "--prerelease",
              "--yes",
              "--ignore-failed-sources",
            ],
            cwd: process.env.HOME ?? process.env.USERPROFILE ?? "~",
            tools: ["*"],
            env: { APPMOD_CALLER_TYPE: "copilot-sdk" },
          },
        }
      : undefined;

    const session = await client.createSession({
      model: "gpt-4.1",
      onPermissionRequest: approveAllPermissions,
      workingDirectory: input.cwd,
      ...(mcpServers ? { mcpServers } : {}),
    });

    // Multi-turn loop: send the initial prompt, then follow up if the model
    // indicates it stopped before finishing (e.g. "proceeding to…", "next step").
    const MAX_TURNS = 4;
    let turnSummary = "";
    let totalPremium = 0;
    const elapsed = () => Date.now() - started;
    const remainingMs = () => Math.max(timeoutMs - elapsed(), 60_000); // at least 1min

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const prompt = turn === 0
        ? fullPrompt
        : [
            "You are NOT done yet. The previous turn left work incomplete.",
            "Continue implementing immediately — do NOT summarize or plan.",
            "Write the remaining files, run the build, fix any errors.",
            "Do NOT stop until every file is fully implemented.",
          ].join("\n");

      console.log(`[copilot] session ${input.id} — turn ${turn + 1}/${MAX_TURNS}`);
      const result = await session.sendAndWait({ prompt }, remainingMs());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyRes = result as any;
      turnSummary = typeof anyRes === "string" ? anyRes :
                      anyRes?.data?.content ?? anyRes?.summary ?? anyRes?.text ??
                      `(session ${input.id} turn ${turn + 1} completed)`;
      totalPremium += typeof anyRes?.premiumRequests === "number"
        ? anyRes.premiumRequests : 1;

      console.log(`[copilot] turn ${turn + 1} summary: ${turnSummary.slice(0, 200)}`);

      // If the summary doesn't hint at incomplete work, we're done.
      const incompletePhrases = [
        "next step", "proceeding to", "will implement", "as a follow-up",
        "remaining work", "todo", "to-do", "not yet", "still need",
      ];
      const lower = turnSummary.toLowerCase();
      const looksIncomplete = incompletePhrases.some(p => lower.includes(p));

      if (!looksIncomplete) {
        console.log(`[copilot] session ${input.id} looks complete after turn ${turn + 1}`);
        break;
      }

      if (elapsed() > timeoutMs - 60_000) {
        console.log(`[copilot] session ${input.id} — budget exhausted after turn ${turn + 1}`);
        break;
      }
    }

    const summary = turnSummary;
    const premiumRequests = totalPremium;

    await session.destroy();
    await client.stop();

    await appendAuditLog(input.id, started, true, summary);
    return { ok: true, summary, premiumRequests };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    try { await client.stop(); } catch { /* ignore */ }
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
