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
import { bgBlue, gray, green, underline, yellow } from "@std/fmt/colors";
import { exists } from "@std/fs/exists";
import { mdToPdf } from "./md-to-pdf.ts";
import { getFilename } from "./utils/filename.ts";
import type { MdToPdfOptions } from "./types.ts";

function printHelp(): void {
  const help = `md2pdf: ${
    green("A simple CLI tool for converting markdown to PDF.")
  }

${gray("Usage:")} ${green("md2pdf [OPTION]... [FILE]...")}

${yellow("Options:")}
  ${green("-w, --watch")}    Watch for file changes.
  ${green("-h, --help")}     Print help.
  ${green("--css")}          Set CSS file used for rendering.`;
  console.log(help);
}

async function generatePdfFromMarkdown(path: string, options?: MdToPdfOptions) {
  const pdfName = getFilename(path) + ".pdf";

  spinner.message = " generating PDF from " + underline(path);
  spinner.start();
  await mdToPdf(path, options).then(
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

const args = await parseArgs(Deno.args, {
  boolean: ["w", "watch", "h", "help"],
  string: ["css"],
});

if (args.h || args.help) {
  printHelp();
  Deno.exit(0);
}

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

if (paths.length < 1) {
  printHelp();
  Deno.exit(0);
}

await (async () => {
  for (let i = 0; i < paths.length; i++) {
    await generatePdfFromMarkdown(paths[i], args);
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
