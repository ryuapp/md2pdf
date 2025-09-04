import * as playwright from "playwright-core";
import { launchHttpServer } from "./utils/server.ts";
import type { MdToPdfOptions } from "./types.ts";

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
export async function mdToPdf(
  path: string,
  options?: MdToPdfOptions,
): Promise<Uint8Array> {
  const server = launchHttpServer(path, options);

  const browser = await playwright.chromium.launch({ channel: "chrome" });
  const page = await browser.newPage();
  await page.goto(`http://localhost:${server.addr.port}`);
  await page.waitForLoadState("domcontentloaded");

  const pdf = await page.pdf({ printBackground: true });
  // Close the browser and the server
  await browser.close();
  await server.shutdown();
  return pdf;
}
