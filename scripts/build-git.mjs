import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const TARGETS = [
  {
    id: "git-config-setup",
    baseDir: "docs/git",
    srcHtml: "docs/git/git-config-setup-src.html",
    outHtml: "docs/git/git-config-setup.html",
    cssOrder: [
      "../../lht-cmn/css/components.css",
      "src/git-config-setup/css/app.css"
    ],
    jsOrder: [
      "../../lht-cmn/vendor/material-web-outlined-text-field.bundle.js",
      "../../lht-cmn/js/components.js",
      "src/git-config-setup/js/main.js"
    ]
  },
  {
    id: "git-config-advanced-setup",
    baseDir: "docs/git",
    srcHtml: "docs/git/git-config-advanced-setup-src.html",
    outHtml: "docs/git/git-config-advanced-setup.html",
    cssOrder: [
      "../../lht-cmn/css/components.css",
      "src/git-config-advanced-setup/css/app.css"
    ],
    jsOrder: [
      "../../lht-cmn/vendor/material-web-outlined-text-field.bundle.js",
      "../../lht-cmn/js/components.js",
      "src/git-config-advanced-setup/js/main.js"
    ]
  },
  {
    id: "git-branch-diff",
    baseDir: "docs/git",
    srcHtml: "docs/git/git-branch-diff-src.html",
    outHtml: "docs/git/git-branch-diff.html",
    cssOrder: [
      "../../lht-cmn/css/components.css",
      "src/git-branch-diff/css/app.css"
    ],
    jsOrder: [
      "../../lht-cmn/vendor/material-web-outlined-text-field.bundle.js",
      "../../lht-cmn/js/components.js",
      "src/git-branch-diff/js/main.js"
    ]
  },
  {
    id: "git-pseudo-squash",
    baseDir: "docs/git",
    srcHtml: "docs/git/git-pseudo-squash-src.html",
    outHtml: "docs/git/git-pseudo-squash.html",
    cssOrder: [
      "../../lht-cmn/css/components.css",
      "src/git-pseudo-squash/css/app.css"
    ],
    jsOrder: [
      "../../lht-cmn/vendor/material-web-outlined-text-field.bundle.js",
      "../../lht-cmn/js/components.js",
      "src/git-pseudo-squash/js/main.js"
    ]
  }
];

for (const target of TARGETS) {
  buildTarget(target);
  console.log(`[build:git] generated ${target.outHtml}`);
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
    return `  <script>\n${scriptText}\n  </script>`;
  });

  let output = sourceHtml;

  output = output.replace(
    /<link\s+rel="stylesheet"\s+href="[^"]+"\s*\/?\s*>/g,
    ""
  );

  output = output.replace(
    /<script\s+src="[^"]+"[^>]*><\/script>/g,
    ""
  );

  output = output.replace(
    /<\/head>/,
    () => `  <style>\n${cssText}\n  </style>\n</head>`
  );

  output = output.replace(/<\/body>/, () => `${jsBlocks.join("\n\n")}\n</body>`);

  fs.writeFileSync(outHtmlPath, output, "utf8");
}

function assertExactOrder(label, actual, expected) {
  if (actual.length !== expected.length) {
    throw new Error(`${label} count mismatch: actual=${actual.length} expected=${expected.length}`);
  }

  for (let i = 0; i < expected.length; i += 1) {
    if (actual[i] !== expected[i]) {
      throw new Error(
        `${label} order mismatch at ${i + 1}: actual=${actual[i]} expected=${expected[i]}`
      );
    }
  }
}
