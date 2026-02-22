import fs from "node:fs";
import path from "node:path";
import { buildSingleHtmlFromSource } from "./lib/single-html.mjs";

const ROOT = process.cwd();
const BUILD_DATE_PLACEHOLDER = "{{BUILD_DATE}}";

function formatBuildDate(date = new Date()) {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

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
  const sourceWithBuildDate = source.replaceAll(BUILD_DATE_PLACEHOLDER, formatBuildDate());
  const output = buildSingleHtmlFromSource(sourceWithBuildDate, srcPath, ROOT);
  fs.writeFileSync(outPath, output, "utf8");
  console.log(`[build:docs] generated ${target.outHtml}`);
}
