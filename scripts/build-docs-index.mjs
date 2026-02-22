import fs from "node:fs";
import path from "node:path";
import { buildSingleHtmlFromSource } from "./lib/single-html.mjs";

const ROOT = process.cwd();

const TARGETS = [
  {
    id: "index",
    srcHtml: "docs/index-src.html",
    outHtml: "docs/index.html"
  }
];

for (const target of TARGETS) {
  const srcPath = path.resolve(ROOT, target.srcHtml);
  const outPath = path.resolve(ROOT, target.outHtml);
  const source = fs.readFileSync(srcPath, "utf8");
  const output = buildSingleHtmlFromSource(source, srcPath, ROOT);
  fs.writeFileSync(outPath, output, "utf8");
  console.log(`[build:docs] generated ${target.outHtml}`);
}
