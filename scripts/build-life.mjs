import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const TARGETS = [
  {
    id: "forgot-items-check",
    srcHtml: "docs/life/forgot-items-check-src.html",
    outHtml: "docs/life/forgot-items-check.html"
  },
  {
    id: "japan-weather",
    srcHtml: "docs/life/japan-weather-src.html",
    outHtml: "docs/life/japan-weather.html"
  }
];

for (const target of TARGETS) {
  const srcPath = path.resolve(ROOT, target.srcHtml);
  const outPath = path.resolve(ROOT, target.outHtml);
  const source = fs.readFileSync(srcPath, "utf8");
  fs.writeFileSync(outPath, source, "utf8");
  console.log(`[build:life] generated ${target.outHtml}`);
}
