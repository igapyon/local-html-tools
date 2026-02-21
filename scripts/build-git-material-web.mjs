import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

const ROOT = process.cwd();
const outFile = path.resolve(
  ROOT,
  "docs/git/src/vendor/material-web-outlined-text-field.bundle.js"
);

fs.mkdirSync(path.dirname(outFile), { recursive: true });

await build({
  stdin: {
    contents: `
      import "@material/web/textfield/outlined-text-field.js";
      import "@material/web/select/outlined-select.js";
      import "@material/web/select/select-option.js";
      import "@material/web/menu/menu.js";
      import "@material/web/menu/menu-item.js";
      import "@material/web/iconbutton/icon-button.js";
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

console.log("[build:git:material] generated docs/git/src/vendor/material-web-outlined-text-field.bundle.js");
