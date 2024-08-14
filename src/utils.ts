/**
 * Get a filename from path.
 *
 * @param path
 */
export function getFilename(path: string): string {
  return path.substring(path.lastIndexOf("/") + 1).split(".").slice(0, -1).join(
    ".",
  );
}
