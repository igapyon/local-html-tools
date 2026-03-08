// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeEach, describe, expect, it, vi } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainCode = readFileSync(
  path.resolve(__dirname, "../src/git-branch-diff/js/main.js"),
  "utf8"
);

function mountDom() {
  document.body.innerHTML = `
    <input id="branchA" value="feature-a" />
    <input id="branchB" value="feature-b" />
    <input id="scopeA" type="checkbox" checked />
    <input id="scopeB" type="checkbox" checked />
    <input id="lockOrigin" type="checkbox" checked />
    <div id="remoteNameBlock" class="md-hidden"></div>
    <input id="remoteName" value="origin" />
    <select id="diffMode">
      <option value="" selected>(none)</option>
      <option value="--stat">--stat</option>
      <option value="--name-only">--name-only</option>
    </select>
    <input id="useStat200" type="checkbox" />
    <input id="useTripleDot" type="checkbox" />
    <div id="statWidthBlock" class="md-hidden"></div>
    <div id="diffCmd"></div>
    <div id="toast"></div>
  `;

  const toast = document.getElementById("toast");
  toast.show = vi.fn();
}

function bootPage() {
  mountDom();
  const instrumentedCode = `${mainCode}
window.__gitBranchDiffTest = {
  generateCommands,
  updateRemoteState,
  updateStatWidthState
};`;
  new Function(instrumentedCode)();
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

describe("git-branch-diff main", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    window.__gitBranchDiffTest = undefined;
    window.alert = vi.fn();
  });

  it("generates fetch and remote diff commands by default", () => {
    bootPage();

    window.__gitBranchDiffTest.generateCommands({ silent: true });

    expect(document.getElementById("diffCmd").textContent).toBe(
      "git fetch origin\ngit diff origin/feature-a..origin/feature-b"
    );
  });

  it("uses triple dot and --stat=200 when those options are enabled", () => {
    bootPage();

    document.getElementById("diffMode").value = "--stat";
    document.getElementById("useStat200").checked = true;
    document.getElementById("useTripleDot").checked = true;

    window.__gitBranchDiffTest.generateCommands({ silent: true });

    expect(document.getElementById("diffCmd").textContent).toBe(
      "git fetch origin\ngit diff --stat=200 origin/feature-a...origin/feature-b"
    );
  });

  it("uses a custom remote name when origin lock is disabled", () => {
    bootPage();

    document.getElementById("lockOrigin").checked = false;
    document.getElementById("remoteName").value = "upstream";
    window.__gitBranchDiffTest.updateRemoteState();

    window.__gitBranchDiffTest.generateCommands({ silent: true });

    expect(document.getElementById("remoteName").disabled).toBe(false);
    expect(document.getElementById("diffCmd").textContent).toBe(
      "git fetch upstream\ngit diff upstream/feature-a..upstream/feature-b"
    );
  });
});
