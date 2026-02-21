import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const TARGET = {
  id: "password-gen",
  baseDir: "docs/password",
  srcHtml: "docs/password/password-gen-src.html",
  outHtml: "docs/password/password-gen.html",
  cssOrder: [
    "../../lht-cmn/css/components.css",
    "src/password-gen/css/app.css"
  ],
  jsOrder: [
    "../git/src/vendor/material-web-outlined-text-field.bundle.js",
    "../../lht-cmn/js/components.js",
    "src/password-gen/js/main.js"
  ]
};

buildTarget(TARGET);
console.log(`[build:password] generated ${TARGET.outHtml}`);

function buildTarget(target) {
  const srcHtmlPath = path.resolve(ROOT, target.srcHtml);
  const outHtmlPath = path.resolve(ROOT, target.outHtml);
  const sourceHtml = fs.readFileSync(srcHtmlPath, "utf8");

  const cssRefs = [...sourceHtml.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"\s*\/?\s*>/g)].map((m) => m[1]);
  const jsRefs = [...sourceHtml.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)].map((m) => m[1]);

  assertExactOrder(`${target.id} css`, cssRefs, target.cssOrder);
  assertExactOrder(`${target.id} js`, jsRefs, target.jsOrder);

  const cssText = target.cssOrder
    .map((relPath) => fs.readFileSync(path.resolve(ROOT, target.baseDir, relPath), "utf8").trimEnd())
    .join("\n\n");

  const jsBlocks = target.jsOrder.map((relPath) => {
    const scriptText = fs.readFileSync(path.resolve(ROOT, target.baseDir, relPath), "utf8").trimEnd();
    return `  <script>\n${scriptText}\n  </script>`;
  });

  let output = sourceHtml;
  output = output.replace(/<link\s+rel="stylesheet"\s+href="[^"]+"\s*\/?\s*>/g, "");
  output = output.replace(/<script\s+src="[^"]+"\s*><\/script>/g, "");
  output = output.replace(/<\/head>/, () => `  <style>\n${cssText}\n  </style>\n</head>`);
  output = output.replace(/<\/body>/, () => `${jsBlocks.join("\n\n")}\n</body>`);

  fs.writeFileSync(outHtmlPath, output, "utf8");
}

function assertExactOrder(label, actual, expected) {
  if (actual.length !== expected.length) {
    throw new Error(`${label} count mismatch: actual=${actual.length} expected=${expected.length}`);
  }
  for (let i = 0; i < expected.length; i += 1) {
    if (actual[i] !== expected[i]) {
      throw new Error(`${label} order mismatch at ${i + 1}: actual=${actual[i]} expected=${expected[i]}`);
    }
  }
}
