import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const IDS = [
  "ffmpeg-audio-convert-cmdline-gen",
  "ffmpeg-concat-cmdline-gen",
  "ffmpeg-loudnorm-cmdline-gen",
  "ffmpeg-mp4-to-wav-gen",
  "ffmpeg-replace-audio-with-wav-gen",
  "ffmpeg-silence-detect-gen",
  "ffmpeg-trim-cmdline-gen",
  "ffmpeg-youtube-mkv-gen"
];

const TARGETS = IDS.map((id) => ({
  id,
  baseDir: "docs/ffmpeg",
  srcHtml: `docs/ffmpeg/${id}-src.html`,
  outHtml: `docs/ffmpeg/${id}.html`,
  cssOrder: [
    "../../lht-cmn/css/components.css",
    `src/${id}/css/app.css`
  ],
  jsOrder: [
    "../git/src/vendor/material-web-outlined-text-field.bundle.js",
    "../../lht-cmn/js/components.js",
    `src/${id}/js/main.js`
  ]
}));

for (const target of TARGETS) {
  buildTarget(target);
  console.log(`[build:ffmpeg] generated ${target.outHtml}`);
}

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
    result = result.replace(new RegExp(`\\s*<script\\s+src="${escaped}"\\s*><\\/script>\\s*`, "g"), "\n");
  }
  return result;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeScriptForInlineHtml(scriptText) {
  return scriptText.replace(/<\/script/gi, "<\\/script");
}
