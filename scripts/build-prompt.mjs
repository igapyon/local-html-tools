import fs from "node:fs";
import path from "node:path";
import { buildSingleHtmlFromSource } from "./lib/single-html.mjs";

const ROOT = process.cwd();

const TARGETS = [
  {
    id: "prompt-gen",
    srcHtml: "docs/prompt/prompt-gen-src.html",
    outHtml: "docs/prompt/prompt-gen.html"
  }
];

for (const target of TARGETS) {
  const srcPath = path.resolve(ROOT, target.srcHtml);
  const outPath = path.resolve(ROOT, target.outHtml);
  const source = fs.readFileSync(srcPath, "utf8");
  const output = buildSingleHtmlFromSource(source, srcPath, ROOT);
  fs.writeFileSync(outPath, output, "utf8");
  console.log(`[build:prompt] generated ${target.outHtml}`);
}
