# md2pdf

[![JSR](https://jsr.io/badges/@ryu/md2pdf)](https://jsr.io/@ryu/md2pdf)

A simple CLI tool for converting markdown to PDF.\
It uses `md4w` to convert markdown to HTML and `playwright-core` (headless Chrome) to further convert the HTML to PDF. It also uses `shiki` for code highlighting.

## Installation

To run it, you need to have [Google Chrome](https://www.google.com/chrome/) installed separately from the CLI.

```sh
deno install -grA jsr:@ryu/md2pdf/cli
```

Note: If you want to update the CLI, please reinstall with `-f` flag.

## Usage

```sh
md2pdf: A simple CLI tool for converting markdown to PDF.

Usage: md2pdf [OPTION]... [FILE]...

Options:
  -w, --watch    Watch for file changes.
  -h, --help     Print help.
  -v, --version  Print version.
  --stylesheet   Set CSS file path used for rendering.
```

The pdf is generated into the same directory as the markdown file and uses the same filename (with `.pdf` extension):

```sh
md2pdf file.md
```

Convert multiple markdown files:

```sh
md2pdf file1.md file2.md file3.md
```

### Watch mode

Watch for file changes and automatically regenerate PDF when the markdown file is modified:

```sh
md2pdf --watch file.md
```

This is useful for continuous development where you want to see PDF updates in real-time as you edit your markdown.

### `stdin` / `stdout` Support

md2pdf supports reading from `stdin` and writing to `stdout`.\
You can pipe markdown content directly to md2pdf, making it easy to integrate with other CLI tools:

```sh
# Convert piped input to PDF
cat file.md | md2pdf > path/to/output.pdf

# Use with curl to convert remote markdown
curl -s https://raw.githubusercontent.com/ryuapp/md2pdf/main/README.md | md2pdf > README.pdf
```

## Front matter (Experimental)

We can specify CSS file used in the front matter of markdown.

```md
---
stylesheet: ./github.css
---

# Hello World
```

## Related

- [md-to-pdf](https://github.com/simonhaenisch/md-to-pdf) - Markdown to PDF CLI
  for Node.js.
