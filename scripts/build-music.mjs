import fs from "node:fs";
import path from "node:path";
const ROOT = process.cwd();

const TARGETS = [
  {
    id: "musicxml-to-midi",
    srcHtml: "docs/music/musicxml-to-midi-src.html",
    outHtml: "docs/music/musicxml-to-midi.html",
    cssOrder: ["src/musicxml-to-midi/css/app.css"],
    jsOrder: [
      "src/musicxml-to-midi/js/midi-writer.js",
      "src/common/js/musicxml-common.js",
      "src/common/js/music-synth-common.js",
      "src/musicxml-to-midi/js/main.js"
    ],
    tsOrder: [
      "src/common/ts/musicxml-common.ts",
      "src/common/ts/music-synth-common.ts",
      "src/musicxml-to-midi/ts/main.ts"
    ]
  },
  {
    id: "midi-to-musicxml",
    srcHtml: "docs/music/midi-to-musicxml-src.html",
    outHtml: "docs/music/midi-to-musicxml.html",
    cssOrder: ["src/midi-to-musicxml/css/app.css"],
    jsOrder: [
      "src/common/js/musicxml-writer-common.js",
      "src/midi-to-musicxml/js/main.js"
    ],
    tsOrder: [
      "src/common/ts/musicxml-writer-common.ts",
      "src/midi-to-musicxml/ts/main.ts"
    ]
  },
  {
    id: "musicxml-to-abc",
    srcHtml: "docs/music/musicxml-to-abc-src.html",
    outHtml: "docs/music/musicxml-to-abc.html",
    cssOrder: ["src/musicxml-to-abc/css/app.css"],
    jsOrder: [
      "src/common/js/musicxml-common.js",
      "src/common/js/musicxml-synth-schedule-common.js",
      "src/common/js/music-synth-common.js",
      "src/common/js/abc-common.js",
      "src/musicxml-to-abc/js/main.js"
    ],
    tsOrder: [
      "src/common/ts/musicxml-common.ts",
      "src/common/ts/musicxml-synth-schedule-common.ts",
      "src/common/ts/music-synth-common.ts",
      "src/common/ts/abc-common.ts",
      "src/musicxml-to-abc/ts/main.ts"
    ]
  },
  {
    id: "abc-to-musicxml",
    srcHtml: "docs/music/abc-to-musicxml-src.html",
    outHtml: "docs/music/abc-to-musicxml.html",
    cssOrder: ["src/abc-to-musicxml/css/app.css"],
    jsOrder: [
      "src/common/js/abc-common.js",
      "src/common/js/musicxml-common.js",
      "src/common/js/musicxml-synth-schedule-common.js",
      "src/common/js/music-synth-common.js",
      "src/common/js/musicxml-writer-common.js",
      "src/common/js/abc-compat-parser.js",
      "src/abc-to-musicxml/js/main.js"
    ],
    tsOrder: [
      "src/common/ts/abc-common.ts",
      "src/common/ts/musicxml-common.ts",
      "src/common/ts/musicxml-synth-schedule-common.ts",
      "src/common/ts/music-synth-common.ts",
      "src/common/ts/musicxml-writer-common.ts",
      "src/common/ts/abc-compat-parser.ts",
      "src/abc-to-musicxml/ts/main.ts"
    ]
  },
  {
    id: "musicxml-to-svg",
    srcHtml: "docs/music/musicxml-to-svg-src.html",
    outHtml: "docs/music/musicxml-to-svg.html",
    cssOrder: ["src/musicxml-to-svg/css/app.css"],
    jsOrder: [
      "src/musicxml-to-svg/js/verovio.js",
      "src/musicxml-to-svg/js/jszip.js",
      "src/common/js/musicxml-common.js",
      "src/common/js/musicxml-synth-schedule-common.js",
      "src/common/js/music-synth-common.js",
      "src/musicxml-to-svg/js/main.js"
    ],
    tsOrder: [
      "src/common/ts/musicxml-common.ts",
      "src/common/ts/musicxml-synth-schedule-common.ts",
      "src/common/ts/music-synth-common.ts",
      "src/musicxml-to-svg/ts/main.ts"
    ]
  }
];

const tsModule = await loadTypeScriptModule();

for (const target of TARGETS) {
  transpileTypeScript(target, tsModule);
  buildTarget(target);
  console.log(`[build:music] generated ${target.outHtml}`);
}

async function loadTypeScriptModule() {
  try {
    const module = await import("typescript");
    return module.default || module;
  } catch (_error) {
    return null;
  }
}

function transpileTypeScript(target, tsModule) {
  for (const relTsPath of target.tsOrder) {
    const tsPath = path.resolve(ROOT, "docs/music", relTsPath);
    const jsPath = path.resolve(
      ROOT,
      "docs/music",
      relTsPath.replace("/ts/", "/js/").replace(/\.ts$/, ".js")
    );

    const source = fs.readFileSync(tsPath, "utf8");
    let outputText = source;
    if (tsModule) {
      const result = tsModule.transpileModule(source, {
        compilerOptions: {
          target: tsModule.ScriptTarget.ES2019,
          module: tsModule.ModuleKind.None,
          lib: ["ES2020", "DOM"],
          strict: false,
          skipLibCheck: true
        },
        reportDiagnostics: true,
        fileName: tsPath
      });

      if (result.diagnostics && result.diagnostics.length > 0) {
        const errors = result.diagnostics
          .filter((d) => d.category === tsModule.DiagnosticCategory.Error)
          .map((d) => tsModule.flattenDiagnosticMessageText(d.messageText, "\n"));
        if (errors.length > 0) {
          throw new Error(`TypeScript transpile error in ${relTsPath}:\n${errors.join("\n")}`);
        }
      }
      outputText = result.outputText;
    } else {
      console.warn(
        `[build:music] typescript not found. copied ${relTsPath} -> ${relTsPath.replace("/ts/", "/js/").replace(/\.ts$/, ".js")}`
      );
    }

    fs.mkdirSync(path.dirname(jsPath), { recursive: true });
    fs.writeFileSync(jsPath, outputText, "utf8");
  }
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
    .map((relPath) => fs.readFileSync(path.resolve(ROOT, "docs/music", relPath), "utf8").trimEnd())
    .join("\n\n");

  const jsBlocks = target.jsOrder.map((relPath) => {
    const scriptText = fs.readFileSync(path.resolve(ROOT, "docs/music", relPath), "utf8").trimEnd();
    return `  <script>\n${scriptText}\n  </script>`;
  });

  let output = sourceHtml;

  output = output.replace(
    /<link\s+rel="stylesheet"\s+href="[^"]+"\s*\/?\s*>/g,
    ""
  );

  output = output.replace(
    /<script\s+src="[^"]+"\s*><\/script>/g,
    ""
  );

  output = output.replace(
    /<\/head>/,
    `  <style>\n${cssText}\n  </style>\n</head>`
  );

  output = output.replace(/<\/body>/, `${jsBlocks.join("\n\n")}\n</body>`);

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
