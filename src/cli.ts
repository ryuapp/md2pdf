#!/usr/bin/env -S deno run

import { Spinner } from "@std/cli/spinner";
import { parseArgs } from "@std/cli/parse-args";
import { underline } from "@std/fmt/colors";
import { exists } from "@std/fs/exists";
import { mdToPdf } from "./md-to-pdf.ts";
import { getFilename } from "./utils/filename.ts";

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

(async () => {
  for (let i = 0; i < paths.length; i++) {
    spinner.start();
    spinner.message = " generating PDF from " + underline(paths[i]);
    const pdfName = getFilename(paths[i]) + ".pdf";
    await mdToPdf(paths[i]).then(
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
})();
