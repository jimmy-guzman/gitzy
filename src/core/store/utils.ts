import os from "node:os";
import path from "node:path";

/**
 * Constructs gitzy's store path based on the OS's temp directory and current directory
 *
 * @example
 * const path = gitzyStorePath()
 * console.log(path) // /var/folders/17/{tmpdir}/T/gitzy/v7/gitzy-store.json
 */
export const gitzyStorePath = () =>
  `${os.tmpdir()}/gitzy/v7/${path.basename(process.cwd())}-store.json`;
