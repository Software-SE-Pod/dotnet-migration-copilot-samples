import { promises as fs } from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import schema from "../.migration/manifest.schema.json" with { type: "json" };

export type PhaseKey =
  | "solution" | "identity" | "data" | "secrets" | "storage" | "adapters";

export const PHASE_ORDER: PhaseKey[] =
  ["solution", "identity", "data", "secrets", "storage", "adapters"];

export type PhaseStatus = "pending" | "in-progress" | "done" | "failed";
export type PageStatus  =
  | "pending" | "contract-open" | "impl-open" | "review-open"
  | "done" | "failed" | "blocked" | "needs-human";
export type Scenario    = "form" | "grid" | "report" | "wizard" | "dashboard" | "auth" | "unknown";

export const MAX_PHASE_ATTEMPTS = 3;
export const MAX_PAGE_ATTEMPTS  = 3;

export interface PhaseState {
  status: PhaseStatus;
  pr?: number;
  attempts?: number;
  lastUpdated?: string;
  notes?: string;
}

export interface PageEntry {
  id: string;
  aspxPath: string;
  scenario: Scenario;
  risk?: "low" | "medium" | "high";
  status: PageStatus;
  contractPr?: number;
  implPr?: number;
  attempts?: number;
  notes?: string;
  blockedReason?: string;
  lastUpdated?: string;
}

export interface Budget {
  premiumRequestsUsed: number;
  premiumRequestsCap: number;
}

export interface Manifest {
  version: 1;
  bootstrap: Record<PhaseKey, PhaseState>;
  pages: PageEntry[];
  budget?: Budget;
  defaultBranch?: string;
}

const ajv = new Ajv({ allErrors: true, strict: false, validateFormats: false });
const validate = ajv.compile<Manifest>(schema as object);

export const MANIFEST_PATH = path.resolve(".migration/manifest.json");

/** Default empty manifest used on first run or when file is missing. */
export function createDefaultManifest(): Manifest {
  return {
    version: 1,
    bootstrap: {
      solution:  { status: "pending", attempts: 0 },
      identity:  { status: "pending", attempts: 0 },
      data:      { status: "pending", attempts: 0 },
      secrets:   { status: "pending", attempts: 0 },
      storage:   { status: "pending", attempts: 0 },
      adapters:  { status: "pending", attempts: 0 },
    },
    pages: [],
    budget: { premiumRequestsUsed: 0, premiumRequestsCap: 2000 },
  };
}

/**
 * Read manifest from disk. If the file is missing (first run), create and
 * persist a default manifest so all downstream code can rely on it existing.
 */
export async function readManifest(): Promise<Manifest> {
  let raw: string;
  try {
    raw = await fs.readFile(MANIFEST_PATH, "utf8");
  } catch {
    console.log("[state] manifest.json missing — initializing default.");
    const m = createDefaultManifest();
    await writeManifest(m);
    return m;
  }
  const parsed = JSON.parse(raw);
  if (!validate(parsed)) {
    throw new Error(
      `manifest.json failed schema validation:\n${JSON.stringify(validate.errors, null, 2)}`
    );
  }
  return parsed;
}

export async function writeManifest(m: Manifest): Promise<void> {
  if (!validate(m)) {
    throw new Error(
      `refusing to write invalid manifest:\n${JSON.stringify(validate.errors, null, 2)}`
    );
  }
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(m, null, 2) + "\n", "utf8");
}

export function stamp(p: Partial<PhaseState> | Partial<PageEntry>): void {
  (p as { lastUpdated?: string }).lastUpdated = new Date().toISOString();
}

export function addBudgetUsage(m: Manifest, requests: number): void {
  if (!m.budget) m.budget = { premiumRequestsUsed: 0, premiumRequestsCap: 2000 };
  m.budget.premiumRequestsUsed += requests;
}

export function budgetExhausted(m: Manifest): boolean {
  if (!m.budget) return false;
  return m.budget.premiumRequestsUsed >= m.budget.premiumRequestsCap;
}

export function nextPendingPhase(m: Manifest): PhaseKey | null {
  for (const k of PHASE_ORDER) {
    const s = m.bootstrap[k];
    if (s.status === "done") continue;
    if (s.status === "failed" && (s.attempts ?? 0) >= MAX_PHASE_ATTEMPTS) return null;
    return k;
  }
  return null;
}

export function bootstrapComplete(m: Manifest): boolean {
  return Object.values(m.bootstrap).every(p => p.status === "done");
}

export function nextPendingPage(m: Manifest): PageEntry | null {
  const byRisk = (p: PageEntry) =>
    p.risk === "low" ? 0 : p.risk === "medium" ? 1 : p.risk === "high" ? 2 : 3;
  const candidates = m.pages
    .filter(p => p.status === "pending")
    .sort((a, b) => byRisk(a) - byRisk(b));
  return candidates[0] ?? null;
}

export function openPrCount(m: Manifest): number {
  const phasePrs = Object.values(m.bootstrap).filter(p =>
    p.status === "in-progress" && typeof p.pr === "number").length;
  const pagePrs = m.pages.filter(p =>
    (p.status === "contract-open" || p.status === "impl-open")).length;
  return phasePrs + pagePrs;
}

/** Escalate a page to needs-human after exceeding retry cap. */
export function escalatePage(page: PageEntry, reason: string): void {
  page.status = "needs-human";
  page.notes = reason;
  stamp(page);
}

/** Escalate a bootstrap phase after exceeding retry cap. */
export function escalatePhase(state: PhaseState, reason: string): void {
  state.status = "failed";
  state.notes = `ESCALATED: ${reason}`;
  stamp(state);
}
