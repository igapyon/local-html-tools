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
  },
  {
    id: "url-memo",
    srcHtml: "docs/link/url-memo-src.html",
    outHtml: "docs/link/url-memo.html",
    tsOrder: [
      "src/url-memo/ts/main.ts"
    ]
  }
];

const tsModule = await loadTypeScriptModule();

for (const target of TARGETS) {
  transpileTypeScript(target, tsModule);
  const srcPath = path.resolve(ROOT, target.srcHtml);
  const outPath = path.resolve(ROOT, target.outHtml);
  const source = fs.readFileSync(srcPath, "utf8");
  const output = buildSingleHtmlFromSource(source, srcPath, ROOT);
  fs.writeFileSync(outPath, output, "utf8");
  console.log(`[build:link] generated ${target.outHtml}`);
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
  for (const relTsPath of target.tsOrder || []) {
    const tsPath = path.resolve(ROOT, "docs/link", relTsPath);
    const jsPath = path.resolve(
      ROOT,
      "docs/link",
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
          .filter((diagnostic) => diagnostic.category === tsModule.DiagnosticCategory.Error)
          .map((diagnostic) => tsModule.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
        if (errors.length > 0) {
          throw new Error(`TypeScript transpile error in ${relTsPath}:\n${errors.join("\n")}`);
        }
      }
      outputText = result.outputText;
    } else {
      console.warn(
        `[build:link] typescript not found. copied ${relTsPath} -> ${relTsPath.replace("/ts/", "/js/").replace(/\.ts$/, ".js")}`
      );
    }

    fs.mkdirSync(path.dirname(jsPath), { recursive: true });
    fs.writeFileSync(jsPath, outputText, "utf8");
  }
}
