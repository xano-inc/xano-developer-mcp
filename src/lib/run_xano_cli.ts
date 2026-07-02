/**
 * Shared helper for invoking the `xano` CLI as a subprocess.
 *
 * Uses execFile (not exec) so argv entries are never shell-interpolated —
 * user-supplied values like workspace/branch/name/file must stay as discrete
 * argv entries to avoid command injection.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Run `xano <args>` and return trimmed stdout.
 * Throws an Error with a useful message on non-zero exit, timeout, or a
 * missing `xano` binary.
 */
export async function runXanoCli(args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync("xano", args, {
      maxBuffer: 10 * 1024 * 1024,
    });
    return stdout.trim();
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException & { stderr?: string };
    if (err.code === "ENOENT") {
      throw new Error(
        "Xano CLI not found on PATH. Install or update the xano CLI to use this tool."
      );
    }
    const stderr = typeof err.stderr === "string" ? err.stderr.trim() : "";
    throw new Error(stderr || err.message || String(error));
  }
}
