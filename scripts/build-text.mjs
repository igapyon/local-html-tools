import fs from "node:fs";
import path from "node:path";
import { buildSingleHtmlFromSource } from "./lib/single-html.mjs";

const ROOT = process.cwd();

const TARGETS = [
  {
    id: "file-rename-cmdline-gen",
    srcHtml: "docs/text/file-rename-cmdline-gen-src.html",
    outHtml: "docs/text/file-rename-cmdline-gen.html"
  },
  {
    id: "japanese-romaji-guide",
    srcHtml: "docs/text/japanese-romaji-guide-src.html",
    outHtml: "docs/text/japanese-romaji-guide.html"
  },
  {
    id: "text-processing",
    srcHtml: "docs/text/text-processing-src.html",
    outHtml: "docs/text/text-processing.html"
  },
  {
    id: "text-viewer",
    srcHtml: "docs/text/text-viewer-src.html",
    outHtml: "docs/text/text-viewer.html"
  }
];

for (const target of TARGETS) {
  const srcPath = path.resolve(ROOT, target.srcHtml);
  const outPath = path.resolve(ROOT, target.outHtml);
  const source = fs.readFileSync(srcPath, "utf8");
  const output = buildSingleHtmlFromSource(source, srcPath, ROOT);
  fs.writeFileSync(outPath, output, "utf8");
  console.log(`[build:text] generated ${target.outHtml}`);
}
