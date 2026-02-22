import fs from "node:fs";
import path from "node:path";
import { buildSingleHtmlFromSource } from "./lib/single-html.mjs";

const ROOT = process.cwd();

const TARGETS = [
  {
    id: "amazon-dp-extract",
    srcHtml: "docs/link/amazon-dp-extract-src.html",
    outHtml: "docs/link/amazon-dp-extract.html"
  },
  {
    id: "facebook-fbclid-remove",
    srcHtml: "docs/link/facebook-fbclid-remove-src.html",
    outHtml: "docs/link/facebook-fbclid-remove.html"
  },
  {
    id: "mime-base64",
    srcHtml: "docs/link/mime-base64-src.html",
    outHtml: "docs/link/mime-base64.html"
  },
  {
    id: "url-encode-decode",
    srcHtml: "docs/link/url-encode-decode-src.html",
    outHtml: "docs/link/url-encode-decode.html"
  },
  {
    id: "utm-remove",
    srcHtml: "docs/link/utm-remove-src.html",
    outHtml: "docs/link/utm-remove.html"
  }
];

for (const target of TARGETS) {
  const srcPath = path.resolve(ROOT, target.srcHtml);
  const outPath = path.resolve(ROOT, target.outHtml);
  const source = fs.readFileSync(srcPath, "utf8");
  const output = buildSingleHtmlFromSource(source, srcPath, ROOT);
  fs.writeFileSync(outPath, output, "utf8");
  console.log(`[build:link] generated ${target.outHtml}`);
}
