// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeEach, describe, expect, it, vi } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainCode = readFileSync(
  path.resolve(__dirname, "../src/git-config-advanced-setup/js/main.js"),
  "utf8"
);

function mountDom() {
  document.body.innerHTML = `
    <input id="enableAutocrlf" type="checkbox" />
    <div id="autocrlfOptions">
      <input id="autocrlf-true" type="radio" name="autocrlf" value="true" checked />
      <input id="autocrlf-input" type="radio" name="autocrlf" value="input" />
      <input id="autocrlf-false" type="radio" name="autocrlf" value="false" />
    </div>
    <input id="enablePushDefault" type="checkbox" />
    <div id="pushDefaultOptions">
      <input id="pushdefault-simple" type="radio" name="pushdefault" value="simple" checked />
      <input id="pushdefault-current" type="radio" name="pushdefault" value="current" />
      <input id="pushdefault-upstream" type="radio" name="pushdefault" value="upstream" />
      <input id="pushdefault-matching" type="radio" name="pushdefault" value="matching" />
    </div>
    <div id="checkCmd"></div>
    <div id="configCmd"></div>
    <div id="toast"></div>
  `;

  const toast = document.getElementById("toast");
  toast.show = vi.fn();
}

function bootPage() {
  mountDom();
  const instrumentedCode = `${mainCode}
window.__gitConfigAdvancedSetupTest = {
  generateConfigCommand,
  toggleAutocrlfOptions,
  togglePushDefaultOptions
};`;
  new Function(instrumentedCode)();
}

describe("git-config-advanced-setup main", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    window.__gitConfigAdvancedSetupTest = undefined;
    window.alert = vi.fn();
  });

  it("leaves config command empty when no setting is selected in silent mode", () => {
    bootPage();

    window.__gitConfigAdvancedSetupTest.generateConfigCommand({ silent: true });

    expect(document.getElementById("configCmd").textContent).toBe("");
    expect(window.alert).not.toHaveBeenCalled();
  });

  it("generates core.autocrlf command when autocrlf is enabled", () => {
    bootPage();

    document.getElementById("enableAutocrlf").checked = true;
    document.getElementById("autocrlf-input").checked = true;

    window.__gitConfigAdvancedSetupTest.generateConfigCommand({ silent: true });

    expect(document.getElementById("configCmd").textContent).toBe(
      "git config --global core.autocrlf input"
    );
  });

  it("generates both commands when autocrlf and push.default are enabled", () => {
    bootPage();

    document.getElementById("enableAutocrlf").checked = true;
    document.getElementById("autocrlf-false").checked = true;
    document.getElementById("enablePushDefault").checked = true;
    document.getElementById("pushdefault-current").checked = true;

    window.__gitConfigAdvancedSetupTest.generateConfigCommand({ silent: true });

    expect(document.getElementById("configCmd").textContent).toBe(
      "git config --global core.autocrlf false\n" +
      "git config --global push.default current"
    );
  });
});
