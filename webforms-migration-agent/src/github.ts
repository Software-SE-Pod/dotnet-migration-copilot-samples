import { Octokit } from "@octokit/rest";
import { execSync } from "node:child_process";

/**
 * GitHub + Git helpers. Keeps orchestrator code free of shell plumbing.
 * All functions are safe when MIGRATION_DRY_RUN=1 (they no-op where destructive).
 */

const dry = () => process.env.MIGRATION_DRY_RUN === "1";
const repoSlug = () => {
  const r = process.env.GITHUB_REPOSITORY;
  if (!r) throw new Error("GITHUB_REPOSITORY env var required (owner/repo).");
  const [owner, repo] = r.split("/");
  if (!owner || !repo) throw new Error(`bad GITHUB_REPOSITORY: ${r}`);
  return { owner, repo };
};

export function octokit(): Octokit {
  const auth = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!auth) throw new Error("GH_TOKEN or GITHUB_TOKEN required.");
  return new Octokit({ auth });
}

export function sh(cmd: string, opts: { cwd?: string } = {}): string {
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], cwd: opts.cwd }).trim();
}

// --- Default branch resolution (cached) ---
let _defaultBranch: string | null = null;

/** Resolve the repo's default branch from the remote (cached for the run). */
export async function getDefaultBranch(): Promise<string> {
  if (_defaultBranch) return _defaultBranch;
  if (dry()) { _defaultBranch = "main"; return "main"; }
  try {
    const gh = octokit();
    const { owner, repo } = repoSlug();
    const { data } = await gh.repos.get({ owner, repo });
    _defaultBranch = data.default_branch;
  } catch {
    // Fallback: try local git
    try {
      const ref = sh("git symbolic-ref refs/remotes/origin/HEAD").replace("refs/remotes/origin/", "");
      _defaultBranch = ref || "main";
    } catch {
      _defaultBranch = "main";
    }
  }
  console.log(`[github] default branch: ${_defaultBranch}`);
  return _defaultBranch;
}

/** Reset to default branch, pulling latest. */
export async function checkoutDefaultBranch(): Promise<void> {
  const base = await getDefaultBranch();
  if (dry()) { console.log(`[dry-run] git checkout ${base}`); return; }
  sh(`git fetch origin ${base}`);
  sh(`git checkout ${base}`);
  sh(`git reset --hard origin/${base}`);
}

export async function createBranch(name: string, base?: string): Promise<void> {
  const b = base ?? await getDefaultBranch();
  if (dry()) { console.log(`[dry-run] git checkout -b ${name} ${b}`); return; }
  sh(`git fetch origin ${b}`);
  sh(`git checkout -B ${name} origin/${b}`);
}

export function commitAll(message: string): boolean {
  if (dry()) { console.log(`[dry-run] git commit -m "${message}"`); return true; }
  sh(`git add -A`);
  const status = sh(`git status --porcelain`);
  if (!status) return false;
  sh(`git -c user.name="webforms-migration-bot" -c user.email="bot@users.noreply.github.com" commit -m ${JSON.stringify(message)}`);
  return true;
}

export function pushBranch(name: string): void {
  if (dry()) { console.log(`[dry-run] git push -u origin ${name}`); return; }
  sh(`git push -u origin ${name} --force-with-lease`);
}

export async function openPr(params: {
  title: string;
  body: string;
  head: string;
  base?: string;
  labels?: string[];
  assignCopilot?: boolean;
}): Promise<number> {
  const base = params.base ?? await getDefaultBranch();
  if (dry()) { console.log(`[dry-run] gh pr create ${params.head} -> ${base}`); return 0; }
  const { owner, repo } = repoSlug();
  const gh = octokit();

  // Check if a PR already exists for this head branch.
  const existing = await gh.pulls.list({ owner, repo, state: "open", head: `${owner}:${params.head}`, per_page: 1 });
  if (existing.data.length > 0) {
    console.log(`[github] PR already open for ${params.head}: #${existing.data[0]!.number}`);
    return existing.data[0]!.number;
  }

  const pr = await gh.pulls.create({
    owner, repo,
    title: params.title,
    body: params.body,
    head: params.head,
    base,
  });
  if (params.labels?.length) {
    await gh.issues.addLabels({ owner, repo, issue_number: pr.data.number, labels: params.labels });
  }
  if (params.assignCopilot) {
    await assignCopilot(pr.data.node_id).catch(err => {
      console.warn(`[github] failed to assign @copilot (non-fatal): ${err}`);
    });
  }
  return pr.data.number;
}

/** Copilot (the bot) is assigned via GraphQL because REST rejects bot logins. */
export async function assignCopilot(assignableNodeId: string): Promise<void> {
  if (dry()) { console.log("[dry-run] assign @copilot"); return; }
  const gh = octokit();
  const { owner, repo } = repoSlug();

  const q = `
    query($owner:String!,$repo:String!) {
      repository(owner:$owner,name:$repo) {
        suggestedActors(capabilities:[CAN_BE_ASSIGNED], first:30) {
          nodes { __typename ... on Bot { id login } ... on User { id login } }
        }
      }
    }`;
  const res: {
    repository: { suggestedActors: { nodes: Array<{ __typename: string; id: string; login: string }> } };
  } = await gh.graphql(q, { owner, repo });
  const bot = res.repository.suggestedActors.nodes.find(
    n => n.__typename === "Bot" && /copilot/i.test(n.login)
  );
  if (!bot) {
    console.warn("[github] Copilot bot not found in suggestedActors — skipping assign.");
    return;
  }
  await gh.graphql(
    `mutation($assignable:ID!, $actor:ID!) {
       replaceActorsForAssignable(input:{assignableId:$assignable, actorIds:[$actor]}) {
         clientMutationId
       }
     }`,
    { assignable: assignableNodeId, actor: bot.id }
  );
  console.log("[github] assigned @copilot successfully.");
}

export type PrInfo = {
  number: number;
  title: string;
  head: string;
  merged: boolean;
  state: "open" | "closed";
};

export async function listOpenPrs(): Promise<PrInfo[]> {
  if (dry()) return [];
  const gh = octokit();
  const { owner, repo } = repoSlug();
  const { data } = await gh.pulls.list({ owner, repo, state: "open", per_page: 100 });
  return data.map(p => ({
    number: p.number,
    title: p.title,
    head: p.head.ref,
    merged: false,
    state: "open" as const,
  }));
}

export async function getPrState(num: number): Promise<PrInfo> {
  if (dry()) return { number: num, title: "", head: "", merged: false, state: "open" };
  const gh = octokit();
  const { owner, repo } = repoSlug();
  const { data } = await gh.pulls.get({ owner, repo, pull_number: num });
  return {
    number: data.number,
    title: data.title,
    head: data.head.ref,
    merged: data.merged,
    state: data.state as "open" | "closed",
  };
}

export async function prIsGreen(num: number): Promise<boolean> {
  if (dry()) return true;
  const gh = octokit();
  const { owner, repo } = repoSlug();
  const pr = await gh.pulls.get({ owner, repo, pull_number: num });
  if (pr.data.state !== "open") return false;
  const sha = pr.data.head.sha;
  const { data } = await gh.checks.listForRef({ owner, repo, ref: sha });
  if (data.total_count === 0) return false;
  return data.check_runs.every(cr =>
    cr.conclusion === "success" || cr.conclusion === "skipped" || cr.conclusion === "neutral"
  );
}

export async function mergePr(num: number): Promise<boolean> {
  if (dry()) { console.log(`[dry-run] merge PR #${num}`); return true; }
  const gh = octokit();
  const { owner, repo } = repoSlug();
  try {
    await gh.pulls.merge({ owner, repo, pull_number: num, merge_method: "squash" });
    console.log(`[github] merged PR #${num}`);
    return true;
  } catch (err) {
    console.warn(`[github] failed to merge PR #${num}: ${err}`);
    return false;
  }
}

/** Fetch the unified diff for a PR. Returns the diff as a string. */
export async function getPrDiff(num: number): Promise<string> {
  if (dry()) return "[dry-run] diff placeholder for PR #" + num;
  const gh = octokit();
  const { owner, repo } = repoSlug();
  const { data } = await gh.pulls.get({
    owner, repo, pull_number: num,
    mediaType: { format: "diff" },
  });
  // Octokit returns raw diff as a string when format=diff
  return data as unknown as string;
}

/** Post a review comment on a PR. */
export async function postPrReview(
  num: number,
  body: string,
  event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT" = "COMMENT",
): Promise<void> {
  if (dry()) {
    console.log(`[dry-run] post review on PR #${num}: ${event} (${body.length} chars)`);
    return;
  }
  const gh = octokit();
  const { owner, repo } = repoSlug();
  await gh.pulls.createReview({ owner, repo, pull_number: num, body, event });
  console.log(`[github] posted ${event} review on PR #${num}`);
}
