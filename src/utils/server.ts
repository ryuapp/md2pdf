import { init as initMd4w, mdToHtml } from "md4w";
import type { MdToPdfOptions } from "../types.ts";
import { getFilename } from "./filename.ts";
import { extract } from "@std/front-matter/yaml";
import { parse } from "@std/yaml/parse";
import { join, resolve } from "@std/path";

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
  const handler: Deno.ServeHandler = async (req) => {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      const decoder = new TextDecoder("utf-8");
      const fileContent = decoder.decode(await Deno.readFile(path));

      let markdown = "";
      let css = "";
      // Front matter
      try {
        const file = extract(fileContent);
        const frontMatter = parse(file.frontMatter) as {
          css?: string;
        };
        markdown = file.body;
        if (frontMatter && frontMatter.css) {
          const cssPath = resolve(join(path, "..", frontMatter.css));
          css = decoder.decode(await Deno.readFile(cssPath));
        }
      } catch (_e) {
        markdown = fileContent;
      }
      css = options?.css
        ? decoder.decode(await Deno.readFile(options?.css))
        : css;

      const content = mdToHtml(markdown);
      const title = getFilename(path.split("/").at(-1) || "") || "Untitled";
      return new Response(
        `<html>
            <head>
            <title>${title}</title>
            <style>${css}</style>
            </head>
            <body>
              ${content}
            </body>
          </html>`,
        { headers: { "Content-Type": "text/html" } },
      );
    } else {
      const filePath = "." + decodeURI(url.pathname);
      try {
        const fileInfo = await Deno.lstat(filePath);
        if (fileInfo.isFile) {
          const file = await Deno.open(filePath);
          return new Response(file.readable);
        }
      } catch (_e) {
        return notFound();
      }
    }
    return notFound();
  };

  return Deno.serve({ onListen: () => "", port: DEFAULT_PORT }, handler);
}

/**
 * A response for 404 Not Found.
 * @internal
 */
function notFound(): Response {
  return new Response("Not Found", { status: 404 });
}
