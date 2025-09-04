import type { MdToPdfOptions } from "../types.ts";
import { getFilename } from "./filename.ts";
import { extract } from "@std/front-matter/yaml";
import { parse } from "@std/yaml/parse";
import { fromFileUrl, join } from "@std/path";
import { markdownToHtml } from "./markdown-to-html.ts";

// Default StyleSheet
const defaultStylesheetPath = fromFileUrl(
  new URL("./markdown.css", import.meta.url),
);

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
      let stylesheet = "";
      // Front matter
      try {
        const file = extract(fileContent);
        const frontMatter = parse(file.frontMatter) as {
          stylesheet?: string;
        };
        markdown = file.body;
        if (frontMatter && frontMatter.stylesheet) {
          stylesheet = join(path, "..", frontMatter.stylesheet);
        }
      } catch (_e) {
        markdown = fileContent;
      }
      stylesheet = options?.stylesheet ?? stylesheet;

      const content = markdownToHtml(markdown);
      const title = getFilename(path.split("/").at(-1) || "") || "Untitled";
      return new Response(
        `<html>
            <head>
            <title>${title}</title>
            ${
          stylesheet
            ? `<link rel="stylesheet" href="${stylesheet}" />`
            : `<style>${await Deno.readTextFile(defaultStylesheetPath)}</style>`
        }
            </head>
            <body>
              ${content}
            </body>
          </html>`,
        { headers: { "Content-Type": "text/html;charset=UTF-8" } },
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

  return Deno.serve({ onListen: () => "", port: 0 }, handler);
}

/**
 * A response for 404 Not Found.
 * @internal
 */
function notFound(): Response {
  return new Response("Not Found", { status: 404 });
}
