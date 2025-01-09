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
