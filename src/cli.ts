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
import { createWaveAnimation } from "./animation.ts";
import {
  generatePdfFromMarkdown,
  generatePdfFromStdin,
} from "./generate-pdf.ts";
import { getFilename } from "./utils/filename.ts";
import denoJson from "../deno.json" with { type: "json" };

function printHelp(): void {
  const help = `md2pdf: ${
    green("A simple CLI tool for converting markdown to PDF.")
  }

${gray("Usage:")} ${green("md2pdf [OPTION]... [FILE]...")}

${yellow("Options:")}
  ${green("-w, --watch")}    Watch for file changes.
  ${green("-h, --help")}     Print help.
  ${green("-v, --version")}  Print version.
  ${green("--stylesheet")}   Set CSS file path used for rendering.`;
  console.log(help);
}

async function main(): Promise<void> {
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
    const waveAnimation = createWaveAnimation("generating PDF from", "stdin");
    waveAnimation.start();
    await generatePdfFromStdin(args);
    waveAnimation.stop();
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

  // Generate PDFs for all files
  for (let i = 0; i < paths.length; i++) {
    const pdfPath = getFilename(paths[i]) + ".pdf";
    const waveAnimation = createWaveAnimation("generating PDF from", paths[i]);
    waveAnimation.start();
    await generatePdfFromMarkdown(paths[i], pdfPath, args);
    waveAnimation.stop();
    console.log(green("✓") + " generated " + underline(pdfPath));
  }

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
            !(stat.mtime?.toString() === pastMTime &&
              realPath === pastRealPath))
        ) {
          pastRealPath = realPath;
          pastMTime = stat.mtime?.toString();
          const pdfPath = getFilename(paths[0]) + ".pdf";
          const waveAnimation = createWaveAnimation(
            "generating PDF from",
            paths[0],
          );
          waveAnimation.start();
          await generatePdfFromMarkdown(paths[0], pdfPath, args);
          waveAnimation.stop();
          console.log(green("✓") + " generated " + underline(pdfPath));
        }
      }
    }
    watcher.close();
  }
}

await main();
