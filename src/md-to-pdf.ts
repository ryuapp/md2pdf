import { launch } from "@astral/astral";
import { DEFAULT_PORT, launchHttpServer } from "./server.ts";

/**
 * Convert a markdown file to PDF.
 *
 * @param path a markdown file path
 *
 * @example
 * ```ts
 * const pdf = await mdToPdf("./README.md");
 * Deno.writeFileSync("README.pdf", pdf);
 * ```
 */
export async function mdToPdf(path: string): Promise<Uint8Array> {
  const [browser, server] = await Promise.all([
    launch(),
    launchHttpServer(path),
  ]);

  const page = await browser.newPage(`http://localhost:${DEFAULT_PORT}`);
  const pdf = await page.pdf();

  // Close the browser and the server
  await browser.close();
  await server.shutdown();
  return pdf;
}
