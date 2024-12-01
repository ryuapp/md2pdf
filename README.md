# md2pdf

A simple CLI tool for converting markdown to PDF.

## Installation

```sh
deno install -grA jsr:@ryu/md2pdf/cli
```

Note: If you want to update the CLI, please reinstall with `-f` flag.

## Command

```sh
md2pdf: A simple CLI tool for converting markdown to PDF.

Usage: md2pdf [OPTION]... [FILE]...

Options:
  -w, --watch    Watch for file changes.
  -h, --help     Print help.
  --css          Set CSS file used for rendering.
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
