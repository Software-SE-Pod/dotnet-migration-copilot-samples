import { promises as fs } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { sh } from "./github.js";

/**
 * Thin helpers around the OpenAPI YAML that is the single source of truth
 * and the NSwag codegen that produces the .NET + TS artifacts from it.
 *
 * We expect the target repo to contain:
 *   contracts/openapi.yaml                         (the SoT)
 *   dotnet/ApiContracts/ApiContracts.csproj        (holds generated DTOs + abstract controllers)
 *   web/src/api/generated/                         (holds generated TS client)
 *   tools/nswag.json                               (driver)
 */

export const OPENAPI_PATH = "contracts/openapi.yaml";
export const NSWAG_CONFIG = "tools/nswag.json";

export async function readOpenApi(repo: string): Promise<Record<string, unknown>> {
  const p = path.join(repo, OPENAPI_PATH);
  const raw = await fs.readFile(p, "utf8");
  return yaml.load(raw) as Record<string, unknown>;
}

export async function writeOpenApi(repo: string, doc: Record<string, unknown>): Promise<void> {
  const p = path.join(repo, OPENAPI_PATH);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, yaml.dump(doc, { lineWidth: 120, noRefs: true }), "utf8");
}

/**
 * Invokes NSwag to regenerate:
 *   - dotnet/ApiContracts/Generated/*.cs     (DTOs + abstract controllers)
 *   - web/src/api/generated/client.ts        (typed fetch client + types)
 *
 * Tries the global `nswag` command first (installed via `dotnet tool install --global`),
 * then falls back to a local `tools/nswag` binary.
 */
export function runNswag(repo: string): void {
  if (process.env.MIGRATION_DRY_RUN === "1") {
    console.log(`[dry-run] nswag run ${NSWAG_CONFIG}`);
    return;
  }
  const configPath = path.join(repo, NSWAG_CONFIG);
  try {
    // Prefer global install (GH Actions installs it globally).
    sh(`nswag run "${configPath}"`, { cwd: repo });
  } catch {
    // Fallback: local tool-path install.
    const localNswag = path.join(repo, "tools", "nswag");
    sh(`"${localNswag}" run "${configPath}"`, { cwd: repo });
  }
  console.log("[openapi] NSwag codegen complete.");
}

/**
 * Returns `true` when the generated files under `dotnet/ApiContracts/Generated`
 * or `web/src/api/generated` differ from HEAD (i.e. the YAML changed the output).
 */
export function codegenIsDirty(repo: string): boolean {
  try {
    const status = sh(
      `git status --porcelain dotnet/ApiContracts/Generated web/src/api/generated contracts/openapi.yaml`,
      { cwd: repo }
    );
    return status.length > 0;
  } catch {
    // If the paths don't exist yet, nothing is dirty.
    return false;
  }
}

/**
 * Validate that running NSwag produces no diff from what's committed.
 * If there's a mismatch, it means someone (or the SDK) hand-edited generated files.
 */
export function validateCodegenConsistency(repo: string): boolean {
  if (process.env.MIGRATION_DRY_RUN === "1") return true;
  try {
    runNswag(repo);
    return !codegenIsDirty(repo);
  } catch (err) {
    console.warn(`[openapi] NSwag consistency check failed: ${err}`);
    return false;
  }
}

/**
 * Produce a new operationId from a scenario + page id, following the convention
 * used across the project so the Copilot SDK doesn't invent divergent names.
 */
export function operationId(pageId: string, op: "get" | "list" | "submit" | "update" | "delete"): string {
  const pascal = pageId.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");
  return `${op}${pascal}`;
}
