/**
 * Get a filename without extname from path.
 *
 * @param path
 */
export function getFilename(path: string): string {
  return path.split(".").slice(0, -1).join(".");
}
