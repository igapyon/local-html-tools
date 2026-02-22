import fs from "node:fs";
import path from "node:path";

function getAttr(tagText, attrName) {
  const escaped = attrName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const attrRegex = new RegExp(`${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>\\\`]+))`, "i");
  const match = tagText.match(attrRegex);
  if (!match) return "";
  return match[1] ?? match[2] ?? match[3] ?? "";
}

function isLocalAssetRef(ref) {
  if (!ref) return false;
  return !/^(?:[a-z]+:)?\/\//i.test(ref) && !/^data:/i.test(ref);
}

function escapeScriptForInlineHtml(scriptText) {
  return scriptText.replace(/<\/script/gi, "<\\/script");
}

export function buildSingleHtmlFromSource(sourceHtml, srcHtmlPath) {
  const srcDir = path.dirname(srcHtmlPath);

  const cssBlocks = [];
  const jsBlocks = [];

  let output = sourceHtml;

  output = output.replace(/<link\b[^>]*>/gi, (tag) => {
    const rel = getAttr(tag, "rel").toLowerCase();
    if (rel !== "stylesheet") return tag;
    const href = getAttr(tag, "href");
    if (!isLocalAssetRef(href)) return tag;
    const assetPath = path.resolve(srcDir, href);
    const cssText = fs.readFileSync(assetPath, "utf8").trimEnd();
    cssBlocks.push(cssText);
    return "";
  });

  output = output.replace(/<script\b[^>]*\bsrc=(["'])([^"']+)\1[^>]*>\s*<\/script>/gi, (_full, _q, src) => {
    if (!isLocalAssetRef(src)) return _full;
    const assetPath = path.resolve(srcDir, src);
    const scriptText = fs.readFileSync(assetPath, "utf8").trimEnd();
    jsBlocks.push(escapeScriptForInlineHtml(scriptText));
    return "";
  });

  if (cssBlocks.length > 0) {
    output = output.replace(/<\/head>/i, () => `  <style>\n${cssBlocks.join("\n\n")}\n  </style>\n</head>`);
  }

  if (jsBlocks.length > 0) {
    const scriptTags = jsBlocks.map((text) => `  <script>\n${text}\n  </script>`).join("\n\n");
    output = output.replace(/<\/body>/i, () => `${scriptTags}\n</body>`);
  }

  return output;
}
