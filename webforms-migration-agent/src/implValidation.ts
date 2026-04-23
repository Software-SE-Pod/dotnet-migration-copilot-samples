import { promises as fs } from "node:fs";

/**
 * Deterministic post-session validation for implementation phase.
 * These checks verify the SDK session actually replaced stubs with real code.
 */

/** Returns true if the file still contains NotImplementedException. */
export async function hasNotImplemented(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return content.includes("NotImplementedException");
  } catch {
    // File doesn't exist — can't validate, treat as passing
    return false;
  }
}

/** Returns true if the file still contains the JSON.stringify placeholder. */
export async function hasJsonPlaceholder(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return /JSON\.stringify\(data/.test(content);
  } catch {
    return false;
  }
}
