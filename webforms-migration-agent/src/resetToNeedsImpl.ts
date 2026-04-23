/**
 * One-time manifest migration: reset all "done" pages to "needs-impl"
 * because the contract phase only produced scaffolding (stubs).
 *
 * Run: npx tsx src/resetToNeedsImpl.ts
 */
import { readManifest, writeManifest, stamp } from "./state.js";

async function main() {
  const manifest = await readManifest();
  let count = 0;

  for (const page of manifest.pages) {
    if (page.status === "done") {
      page.status = "needs-impl";
      page.implAttempts = 0;
      page.notes = `reset from done → needs-impl (contract was scaffold-only)`;
      stamp(page);
      count++;
      console.log(`  reset: ${page.id}`);
    }
  }

  await writeManifest(manifest);
  console.log(`\nReset ${count} pages from "done" to "needs-impl".`);
}

main().catch(err => {
  console.error("fatal:", err);
  process.exit(1);
});
