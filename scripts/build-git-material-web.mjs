import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";

const ROOT = process.cwd();
const outFile = path.resolve(
  ROOT,
  "lht-cmn/vendor/material-web-outlined-text-field.bundle.js"
);

fs.mkdirSync(path.dirname(outFile), { recursive: true });

const require = createRequire(import.meta.url);
let hasMaterialWeb = true;
try {
  require.resolve("@material/web/package.json");
} catch {
  hasMaterialWeb = false;
}

if (!hasMaterialWeb) {
  if (fs.existsSync(outFile)) {
    console.warn(
      "[build:git:material] @material/web not found. Reusing existing vendor bundle."
    );
    process.exit(0);
  }
  console.error(
    "[build:git:material] @material/web not found and vendor bundle is missing."
  );
  process.exit(1);
}

await build({
  stdin: {
    contents: `
      import "@material/web/textfield/outlined-text-field.js";
      import "@material/web/select/outlined-select.js";
      import "@material/web/select/select-option.js";
      import "@material/web/menu/menu.js";
      import "@material/web/menu/menu-item.js";
      import "@material/web/iconbutton/icon-button.js";
      import "@material/web/button/filled-button.js";
      import "@material/web/switch/switch.js";
    `,
    resolveDir: ROOT,
    sourcefile: "material-web-git-entry.js",
    loader: "js"
  },
  outfile: outFile,
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  minify: true,
  legalComments: "none"
});

console.log("[build:git:material] generated lht-cmn/vendor/material-web-outlined-text-field.bundle.js");
