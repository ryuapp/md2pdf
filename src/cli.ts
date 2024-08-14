#!/usr/bin/env -S deno run

/**
 * A simple CLI tool for converting markdown to PDF.
 *
 * @example
 * ```sh
 * md2pdf [FILE]...
 * ```
 *
 * @module
 */

import { Spinner } from "@std/cli/spinner";
import { parseArgs } from "@std/cli/parse-args";
import { bgBlue, underline } from "@std/fmt/colors";
import { exists } from "@std/fs/exists";
import { mdToPdf } from "./md-to-pdf.ts";
import { getFilename } from "./utils/filename.ts";

async function generatePdfFromMarkdown(path: string) {
  const pdfName = getFilename(path) + ".pdf";

  spinner.message = " generating PDF from " + underline(path);
  spinner.start();
  await mdToPdf(path).then(
    (pdf) => {
      Deno.writeFileSync(
        pdfName,
        pdf,
      );
      spinner.stop();
      console.log("✅ generated " + underline(pdfName));
    },
  );
}

const args = await parseArgs(Deno.args);
const spinner = new Spinner({
  message: "Loading...",
  color: "yellow",
  interval: 50,
});

const paths: Array<string> = [];
if (args._) {
  for await (const path of args._) {
    if (typeof path !== "string") continue;
    if (await exists(path, { isFile: true })) {
      paths.push(path);
    } else {
      if (await exists(path)) {
        console.error("md2pdf: " + path + ": Is not a file");
      } else {
        console.error("md2pdf: " + path + ": Not found");
      }
    }
  }
}

await (async () => {
  for (let i = 0; i < paths.length; i++) {
    await generatePdfFromMarkdown(paths[i]);
  }
})();

if (args.w || args.watch) {
  console.log("\n" + bgBlue(" watching for changes ") + "\n");

  let pastRealPath: string | undefined;
  let pastMTime: string | undefined;
  const watcher = Deno.watchFs(paths, { recursive: false });
  for await (const event of watcher) {
    for (let i = 0; i < paths.length; i++) {
      const realPath = await Deno.realPath(paths[i]);
      const stat = await Deno.stat(event.paths[i]);
      if (
        realPath === event.paths[0] &&
        (!pastRealPath ||
          !(stat.mtime?.toString() === pastMTime && realPath === pastRealPath))
      ) {
        pastRealPath = realPath;
        pastMTime = stat.mtime?.toString();
        await generatePdfFromMarkdown(paths[0]);
      }
    }
  }
  watcher.close();
}
