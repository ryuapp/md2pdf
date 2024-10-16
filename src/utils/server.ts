import { Hono } from "@hono/hono/tiny";
import { LinearRouter } from "@hono/hono/router/linear-router";
import { init as initMd4w, mdToHtml } from "md4w";
import type { MdToPdfOptions } from "../types.ts";

export const DEFAULT_PORT = 33433;

await initMd4w("small");

/**
 * Launch a HTTP server for serving converted markdown to HTML.
 *
 * @param path a markdown file path
 */
export function launchHttpServer(
  path: string,
  options?: MdToPdfOptions,
): Deno.HttpServer<Deno.NetAddr> {
  const decoder = new TextDecoder("utf-8");
  const app = new Hono({ router: new LinearRouter() });
  app.get("/", async (c) => {
    const css = options?.css
      ? await decoder.decode(await Deno.readFile(options?.css))
      : "";
    const content = mdToHtml(
      decoder.decode(await Deno.readFile(path)),
    );
    return c.html(
      `<html>
          <head>
          <style>${css}</style>
          </head>
          <body>
            ${content}
          </body>
        </html>`,
    );
  });
  return Deno.serve({ onListen: () => "", port: DEFAULT_PORT }, app.fetch);
}
