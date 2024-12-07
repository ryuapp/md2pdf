/**
 * Get a filename without extname from path.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(getFilename("README.md"), "README");
 * assertEquals(getFilename("/README.md"), "/README");
 * assertEquals(getFilename("./README.md"), "./README");
 * assertEquals(getFilename("../README.md"), "../README");
 * assertEquals(getFilename("README.2.md"), "README.2");
 * ```
 */
export function getFilename(path: string): string {
  return path.split(".").slice(0, -1).join(".");
}
