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

import { parseArgs } from "@std/cli/parse-args";
import {
  bgBlue,
  brightRed,
  gray,
  green,
  underline,
  yellow,
} from "@std/fmt/colors";
import { mdToPdf } from "./md-to-pdf.ts";
import { getFilename } from "./utils/filename.ts";
import { createWaveAnimation } from "./animation.ts";
import type { MdToPdfOptions } from "./types.ts";

function printHelp(): void {
  const help = `md2pdf: ${
    green("A simple CLI tool for converting markdown to PDF.")
  }

${gray("Usage:")} ${green("md2pdf [OPTION]... [FILE]...")}

${yellow("Options:")}
  ${green("-w, --watch")}    Watch for file changes.
  ${green("-h, --help")}     Print help.
  ${green("--stylesheet")}   Set CSS file path used for rendering.`;
  console.log(help);
}

async function generatePdfFromMarkdown(path: string, options?: MdToPdfOptions) {
  const pdfName = getFilename(path) + ".pdf";

  const waveAnimation = createWaveAnimation("generating PDF from", path);
  waveAnimation.start();
  await mdToPdf(path, options).then(
    (pdf) => {
      Deno.writeFileSync(
        pdfName,
        pdf,
      );
      waveAnimation.stop();
      console.log(green("✓") + " generated " + underline(pdfName));
    },
  );
}

// Inline

const args = await parseArgs(Deno.args, {
  boolean: ["w", "watch", "h", "help"],
  string: ["stylesheet"],
});

if (args.h || args.help) {
  printHelp();
  Deno.exit(0);
}

const paths: Array<string> = [];
if (args._) {
  for await (const path of args._) {
    if (typeof path !== "string") continue;
    try {
      await Deno.lstat(path);
      paths.push(path);
    } catch (e) {
      console.error(
        `${brightRed("error")}: ${e}`,
      );
    }
  }
}

if (paths.length < 1) {
  const exitCode = args._.length ? 1 : 0;
  if (exitCode) {
    console.error(
      `${
        brightRed("error")
      }: Set a valid markdown file path you wanna convert to PDF\n`,
      "      e.g.) md2pdf README.md\n",
    );
    console.error("For more information, try '--help'.");
  } else {
    printHelp();
  }
  Deno.exit(exitCode);
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
        await generatePdfFromMarkdown(paths[0], args);
      }
    }
  }
  watcher.close();
}
