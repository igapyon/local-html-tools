import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const TARGETS = [
  {
    id: "mermaid-to-svg",
    baseDir: "docs/diagram",
    srcHtml: "docs/diagram/mermaid-to-svg-src.html",
    outHtml: "docs/diagram/mermaid-to-svg.html",
    cssOrder: [
      "../../lht-cmn/css/components.css",
      "src/mermaid-to-svg/css/app.css"
    ],
    jsOrder: [
      "mermaid.min.js",
      "../git/src/vendor/material-web-outlined-text-field.bundle.js",
      "../../lht-cmn/js/components.js",
      "src/mermaid-to-svg/js/main.js"
    ]
  },
  {
    id: "graphviz-dot-to-svg",
    baseDir: "docs/diagram",
    srcHtml: "docs/diagram/graphviz-dot-to-svg-src.html",
    outHtml: "docs/diagram/graphviz-dot-to-svg.html",
    cssOrder: [
      "../../lht-cmn/css/components.css",
      "src/graphviz-dot-to-svg/css/app.css"
    ],
    jsOrder: [
      "../git/src/vendor/material-web-outlined-text-field.bundle.js",
      "../../lht-cmn/js/components.js",
      "src/graphviz-dot-to-svg/js/main.js"
    ]
  }
];

for (const target of TARGETS) {
  buildTarget(target);
  console.log(`[build:diagram] generated ${target.outHtml}`);
}

function buildTarget(target) {
  const srcHtmlPath = path.resolve(ROOT, target.srcHtml);
  const outHtmlPath = path.resolve(ROOT, target.outHtml);
  const sourceHtml = fs.readFileSync(srcHtmlPath, "utf8");

  const cssRefs = [...sourceHtml.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"\s*\/?\s*>/g)].map((m) => m[1]);
  const jsRefs = [...sourceHtml.matchAll(/<script\s+src="([^"]+)"[^>]*><\/script>/g)].map((m) => m[1]);

  assertExactOrder(`${target.id} css`, cssRefs, target.cssOrder);
  assertExactOrder(`${target.id} js`, jsRefs, target.jsOrder);

  const cssText = target.cssOrder
    .map((relPath) => fs.readFileSync(path.resolve(ROOT, target.baseDir, relPath), "utf8").trimEnd())
    .join("\n\n");

  const jsBlocks = target.jsOrder.map((relPath) => {
    const scriptText = fs.readFileSync(path.resolve(ROOT, target.baseDir, relPath), "utf8").trimEnd();
    const inlineSafeScriptText = escapeScriptForInlineHtml(scriptText);
    return `  <script>\n${inlineSafeScriptText}\n  </script>`;
  });

  let output = sourceHtml;
  output = stripConfiguredCssLinks(output, target.cssOrder);
  output = stripConfiguredScriptTags(output, target.jsOrder);
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

function stripConfiguredCssLinks(html, cssOrder) {
  let result = html;
  for (const relPath of cssOrder) {
    const escaped = escapeRegExp(relPath);
    result = result.replace(new RegExp(`\\s*<link\\s+rel="stylesheet"\\s+href="${escaped}"\\s*\\/?>\\s*`, "g"), "\n");
  }
  return result;
}

function stripConfiguredScriptTags(html, jsOrder) {
  let result = html;
  for (const relPath of jsOrder) {
    const escaped = escapeRegExp(relPath);
    result = result.replace(new RegExp(`\\s*<script\\s+src="${escaped}"[^>]*><\\/script>\\s*`, "g"), "\n");
  }
  return result;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeScriptForInlineHtml(scriptText) {
  // Prevent accidental closing of the surrounding <script> tag when JS source
  // contains the literal string "</script>" (e.g. template strings in libraries).
  return scriptText.replace(/<\/script/gi, "<\\/script");
}
