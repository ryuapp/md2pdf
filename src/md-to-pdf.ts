import { Hono } from "@hono/hono/tiny";
import { LinearRouter } from "@hono/hono/router/linear-router";
import { launch } from "@astral/astral";
import { init as initMd4w, mdToHtml } from "md4w";

const DEFAULT_PORT = 33433;

await initMd4w("fast");
/**
 * Launch a HTTP server for serving converted markdown to HTML.
 *
 * @param path a markdown file path
 */
function launchHttpServer(path: string): Deno.HttpServer<Deno.NetAddr> {
  const app = new Hono({ router: new LinearRouter() });
  const decoder = new TextDecoder("utf-8");
  app.get("/", async (c) => {
    const content = mdToHtml(decoder.decode(await Deno.readFile(path)));
    return c.html(content);
  });
  return Deno.serve({ onListen: () => "", port: DEFAULT_PORT }, app.fetch);
}

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
