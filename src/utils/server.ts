import { Hono } from "@hono/hono/tiny";
import { LinearRouter } from "@hono/hono/router/linear-router";
import { init as initMd4w, mdToHtml } from "md4w";

export const DEFAULT_PORT = 33433;

await initMd4w("small");

/**
 * Launch a HTTP server for serving converted markdown to HTML.
 *
 * @param path a markdown file path
 */
export function launchHttpServer(
  path: string,
): Deno.HttpServer<Deno.NetAddr> {
  const decoder = new TextDecoder("utf-8");
  const app = new Hono({ router: new LinearRouter() });
  app.get("/", async (c) => {
    const content = mdToHtml(
      decoder.decode(await Deno.readFile(path)),
    );
    return c.html(
      `<html>
          <head>
          </head>
          <body>
            ${content}
          </body>
        </html>`,
    );
  });
  return Deno.serve({ onListen: () => "", port: DEFAULT_PORT }, app.fetch);
}
