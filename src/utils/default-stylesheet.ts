export const defaultStylesheet = `* {
  box-sizing: border-box;
}

html {
  font-size: 16px;
  line-height: 1.6;
}

body {
  font-family:
    "Helvetica Neue", Arial, "Noto Sans JP", "Hiragino Kaku Gothic ProN",
    "Hiragino Sans", Meiryo, sans-serif;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.25;
}

h1 {
  font-size: 2rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3rem;
}

p {
  margin-bottom: 1rem;
}

blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #666;
  font-style: italic;
}

code {
  background-color: #f6f8fa;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 85%;
}

pre {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

pre code {
  background: none;
  padding: 0;
}

ul, ol {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

li {
  margin-bottom: 0.25rem;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

th, td {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: left;
}

th {
  background-color: #f6f8fa;
  font-weight: 600;
}

a {
  color: #0366d6;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 2rem 0;
}

img {
  max-width: 100%;
  height: auto;
}
`;
