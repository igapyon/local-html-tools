// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeEach, describe, expect, it, vi } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainCode = readFileSync(
  path.resolve(__dirname, "../src/git-config-setup/js/main.js"),
  "utf8"
);

function mountDom() {
  document.body.innerHTML = `
    <input id="userName" value="" />
    <input id="userEmail" value="" />
    <div id="checkCmd"></div>
    <div id="setupCmd"></div>
    <div id="toast"></div>
  `;

  const toast = document.getElementById("toast");
  toast.show = vi.fn();
}

function bootPage() {
  mountDom();
  const instrumentedCode = `${mainCode}
window.__gitConfigSetupTest = {
  generateCheckCommand,
  generateSetupCommand
};`;
  new Function(instrumentedCode)();
}

describe("git-config-setup main", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    window.__gitConfigSetupTest = undefined;
    window.alert = vi.fn();
  });

  it("generates the global config check command on bootstrap", () => {
    bootPage();

    expect(document.getElementById("checkCmd").textContent).toBe(
      "git config --global user.name\ngit config --global user.email"
    );
  });

  it("quotes user.name with spaces when generating setup commands", () => {
    bootPage();

    document.getElementById("userName").value = "Toshiki Iga";
    document.getElementById("userEmail").value = "iga@example.com";

    window.__gitConfigSetupTest.generateSetupCommand({ silent: true });

    expect(document.getElementById("setupCmd").textContent).toBe(
      'git config --global user.name "Toshiki Iga"\n' +
      "git config --global user.email iga@example.com"
    );
  });

  it("clears setup command when required fields are missing in silent mode", () => {
    bootPage();

    document.getElementById("userName").value = "Toshiki Iga";
    document.getElementById("userEmail").value = "";

    window.__gitConfigSetupTest.generateSetupCommand({ silent: true });

    expect(document.getElementById("setupCmd").textContent).toBe("");
    expect(window.alert).not.toHaveBeenCalled();
  });
});
