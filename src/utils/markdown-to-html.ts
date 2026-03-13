import { parse } from "node-html-parser";
import { type bundledThemes, createHighlighter } from "shiki/bundle/web";
import { init as initMd4w, mdToHtml } from "md4w";

const theme = "github-dark-dimmed" satisfies keyof typeof bundledThemes;
const themes = [theme];
const langs = [
  "html",
  "css",
  "javascript",
  "typescript",
  "js",
  "ts",
  "jsx",
  "tsx",
  "astro",
  "vue",
  "svelte",
  "json",
  "md",
  "mdx",
  "markdown",
  "py",
  "python",
  "sql",
  "wasm",
  "xml",
  "yml",
  "yaml",
  "sh",
  "zsh",
  "shell",
  "bash",
];

await initMd4w("small");
const highlighter = await createHighlighter({ themes, langs });

/**
 * Convert markdown to HTML.
 *
 * @param markdown a markdown string
 *
 * @example Basic markdown
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const html = markdownToHtml("# Hello");
 * assertEquals(html, '<h1>Hello <a class="anchor" aria-hidden="true" id="hello" href="#hello"></a></h1>\n');
 * ```
 *
 * @example Code block with known language
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const ticks = "``" + "`";
 * const html = markdownToHtml(`${ticks}ts\nconst x = 1;\n${ticks}`);
 * assertEquals(html, '<pre class="shiki github-dark-dimmed" style="background-color:#22272e;color:#adbac7" tabindex="0"><code><span class="line"><span style="color:#F47067">const</span><span style="color:#6CB6FF"> x</span><span style="color:#F47067"> =</span><span style="color:#6CB6FF"> 1</span><span style="color:#ADBAC7">;</span></span>\n<span class="line"></span></code></pre>\n');
 * ```
 */
export function markdownToHtml(markdown: string): string {
  const dom = parse(mdToHtml(markdown));
  const codeBlocks = dom.querySelectorAll("pre");

  for (const codeBlock of codeBlocks) {
    const codeChild = codeBlock.childNodes.at(0);
    if (!codeChild) continue;

    const codeElement = parse(codeChild.toString());

    let lang = "text";
    if (codeChild.rawText.startsWith('<code class="language-')) {
      const extractedLang = codeChild.rawText.split("language-").at(1)?.split(
        '"',
      ).at(0);
      if (extractedLang && langs.includes(extractedLang)) lang = extractedLang;
    }

    const code = codeElement.textContent;
    const highlighted = highlighter.codeToHtml(code, { lang, theme });

    const newPreElement = parse(highlighted);
    codeBlock.replaceWith(newPreElement);
  }
  const content = dom.toString();
  return content;
}
