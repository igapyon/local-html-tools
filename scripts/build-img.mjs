import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const TARGETS = [
  {
    id: "img2svg",
    srcHtml: "docs/img/img2svg-src.html",
    outHtml: "docs/img/img2svg.html"
  }
];

for (const target of TARGETS) {
  const srcPath = path.resolve(ROOT, target.srcHtml);
  const outPath = path.resolve(ROOT, target.outHtml);
  const source = fs.readFileSync(srcPath, "utf8");
  fs.writeFileSync(outPath, source, "utf8");
  console.log(`[build:img] generated ${target.outHtml}`);
}
