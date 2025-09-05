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
import { join } from "@std/path";
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
import denoJson from "../deno.json" with { type: "json" };

function printHelp(): void {
  const help = `md2pdf: ${
    green("A simple CLI tool for converting markdown to PDF.")
  }

${gray("Usage:")} ${green("md2pdf [OPTION]... [FILE]...")}
${gray("       cat FILE.md | md2pdf > output.pdf")}

${yellow("Options:")}
  ${green("-w, --watch")}    Watch for file changes.
  ${green("-h, --help")}     Print help.
  ${green("--stylesheet")}   Set CSS file path used for rendering.

${yellow("Examples:")}
  ${
    green("md2pdf README.md")
  }                     Convert README.md to README.pdf
  ${
    green("cat README.md | md2pdf > README.pdf")
  }  Convert piped input to README.pdf`;
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

async function generatePdfFromStdin(options?: MdToPdfOptions) {
  const waveAnimation = createWaveAnimation("generating PDF from", "stdin");
  waveAnimation.start();

  // Read all stdin content at once - similar to get-stdin package
  const chunks: Uint8Array[] = [];
  const reader = Deno.stdin.readable.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const markdownContent = new TextDecoder().decode(
    new Uint8Array(
      chunks.reduce((acc, chunk) => [...acc, ...chunk], [] as number[]),
    ),
  );

  // Create temporary file using Deno's standard approach
  const tempDir = await Deno.makeTempDir();
  const tempPath = join(tempDir, "stdin.md");
  // Cleanup
  const cleanupTempDir = () => {
    waveAnimation.stop();
    try {
      Deno.removeSync(tempDir, { recursive: true });
    } catch (error) {
      console.error(
        `${brightRed("warning")}: Failed to cleanup temp directory: ${error}`,
      );
    }
  };
  // Setup cleanup on SIGINT (Ctrl+C) and SIGBREAK (Ctrl + Break)
  const signalHandler = () => {
    console.debug("Called Signal Handler");
    cleanupTempDir();
    Deno.exit(1);
  };

  Deno.addSignalListener("SIGINT", signalHandler);
  Deno.addSignalListener("SIGBREAK", signalHandler);
  await Deno.writeTextFile(tempPath, markdownContent);

  try {
    await mdToPdf(tempPath, options).then(
      (pdf) => {
        Deno.stdout.writeSync(pdf);
      },
    );
  } finally {
    Deno.removeSignalListener("SIGINT", signalHandler);
    Deno.removeSignalListener("SIGBREAK", signalHandler);
    cleanupTempDir();
  }
}

// Inline

const args = parseArgs(Deno.args, {
  boolean: ["w", "watch", "h", "help", "v", "version"],
  string: ["stylesheet"],
});

if (args.v || args.version) {
  console.log("md2pdf " + denoJson.version);
  Deno.exit(0);
}

if (args.h || args.help) {
  printHelp();
  Deno.exit(0);
}

// Check if input is piped
if (!Deno.stdin.isTerminal()) {
  // Handle piped input - output to stdout
  await generatePdfFromStdin(args);
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
      "      e.g.) cat README.md | md2pdf\n",
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
