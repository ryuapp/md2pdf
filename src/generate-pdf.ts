import { join } from "@std/path";
import { brightRed, green, underline } from "@std/fmt/colors";
import { mdToPdf } from "./md-to-pdf.ts";
import { getFilename } from "./utils/filename.ts";
import type { MdToPdfOptions } from "./types.ts";

export async function generatePdfFromMarkdown(
  path: string,
  options?: MdToPdfOptions,
) {
  const pdfName = getFilename(path) + ".pdf";

  await mdToPdf(path, options).then(
    (pdf) => {
      Deno.writeFileSync(
        pdfName,
        pdf,
      );
      console.log(green("✓") + " generated " + underline(pdfName));
    },
  );
}

export async function generatePdfFromStdin(options?: MdToPdfOptions) {
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
