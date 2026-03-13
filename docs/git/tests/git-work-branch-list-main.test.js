// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeEach, describe, expect, it, vi } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainCode = readFileSync(
  path.resolve(__dirname, "../src/git-work-branch-list/js/main.js"),
  "utf8"
);

function mountDom() {
  document.body.innerHTML = `
    <button id="openCreateDialogBtn" type="button">open</button>
    <input id="repoUrl" value="" />
    <input id="baseBranch" value="" />
    <select id="baseScope">
      <option value="remote" selected>remote</option>
      <option value="local">local</option>
    </select>
    <input id="compareBranch" value="" />
    <select id="compareScope">
      <option value="remote" selected>remote</option>
      <option value="local">local</option>
    </select>
    <input id="remoteName" value="origin" />
    <button id="closeDialogBtn" type="button">close</button>
    <button id="saveEntryBtn" type="button">save</button>
    <div id="entriesList"></div>
    <div id="emptyGuide" hidden></div>
    <div id="toast"></div>
    <div id="entryDialogTitle"></div>
    <dialog id="entryDialog"></dialog>
  `;

  const toast = document.getElementById("toast");
  toast.show = vi.fn();
  const dialog = document.getElementById("entryDialog");
  dialog.showModal = vi.fn(() => {
    dialog.open = true;
  });
  dialog.close = vi.fn(() => {
    dialog.open = false;
  });
}

function installLocalStorageMock() {
  const store = new Map();
  const localStorageMock = {
    getItem: vi.fn((key) => (store.has(key) ? store.get(key) : null)),
    setItem: vi.fn((key, value) => {
      store.set(String(key), String(value));
    }),
    removeItem: vi.fn((key) => {
      store.delete(String(key));
    }),
    clear: vi.fn(() => {
      store.clear();
    })
  };
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    configurable: true
  });
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    configurable: true
  });
}

function bootPage() {
  mountDom();
  const instrumentedCode = `${mainCode}
window.__gitWorkBranchListTest = {
  buildDisplayName,
  buildBranchDiffUrl,
  buildPseudoSquashUrl,
  openCreateDialog,
  openEditDialog,
  saveCurrentEntry,
  renderEntries,
  loadEntries
};`;
  new Function(instrumentedCode)();
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

describe("git-work-branch-list main", () => {
  beforeEach(() => {
    installLocalStorageMock();
    localStorage.clear();
    document.body.innerHTML = "";
    window.__gitWorkBranchListTest = undefined;
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
  });

  it("saves an entry from the form and renders it to the list", () => {
    bootPage();

    document.getElementById("repoUrl").value = "https://github.com/igapyon/local-html-tools";
    document.getElementById("baseBranch").value = "main";
    document.getElementById("compareBranch").value = "feature/work-board";

    window.__gitWorkBranchListTest.saveCurrentEntry();

    const entriesHtml = document.getElementById("entriesList").textContent;
    expect(entriesHtml).toContain("local-html-tools");
    expect(entriesHtml).toContain("feature/work-board");
    expect(entriesHtml).not.toContain("diff をコピー");
    expect(document.getElementById("emptyGuide").hidden).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it("opens create dialog and resets form for new entry", () => {
    bootPage();

    document.getElementById("repoUrl").value = "https://example.com/old";
    window.__gitWorkBranchListTest.openCreateDialog();

    expect(document.getElementById("entryDialog").open).toBe(true);
    expect(document.getElementById("repoUrl").value).toBe("");
    expect(document.getElementById("entryDialogTitle").textContent).toBe("登録");
  });

  it("derives display name from repository URL", () => {
    bootPage();

    expect(window.__gitWorkBranchListTest.buildDisplayName({
      repoUrl: "https://github.com/igapyon/local-html-tools"
    })).toBe("local-html-tools");
    expect(window.__gitWorkBranchListTest.buildDisplayName({
      repoUrl: "git@github.com:igapyon/local-html-tools.git"
    })).toBe("local-html-tools");
  });

  it("builds git-branch-diff URL params from an entry", () => {
    bootPage();

    expect(window.__gitWorkBranchListTest.buildBranchDiffUrl({
      repoUrl: "https://example.com/repo-a",
      baseBranch: "devel",
      baseScope: "remote",
      compareBranch: "feature/login",
      compareScope: "local",
      remoteName: "origin"
    })).toBe("git-branch-diff.html?repoUrl=https%3A%2F%2Fexample.com%2Frepo-a&baseBranch=devel&baseScope=remote&branchWork=feature%2Flogin&scopeWork=local&remoteName=origin");
  });

  it("builds git-pseudo-squash URL params from an entry", () => {
    bootPage();

    expect(window.__gitWorkBranchListTest.buildPseudoSquashUrl({
      repoUrl: "https://example.com/repo-a",
      baseBranch: "devel",
      baseScope: "remote",
      compareBranch: "feature/login",
      compareScope: "local",
      remoteName: "origin"
    })).toBe("git-pseudo-squash.html?repoUrl=https%3A%2F%2Fexample.com%2Frepo-a&baseBranch=devel&baseScope=remote&branchWork=feature%2Flogin&remoteName=origin");
  });

  it("renders all stored entries in updated order", () => {
    localStorage.setItem("gitWorkBranchList.entries", JSON.stringify([
      {
        id: "a",
        repoUrl: "https://example.com/repo-a",
        baseBranch: "main",
        baseScope: "remote",
        compareBranch: "feature-a",
        compareScope: "remote",
        remoteName: "origin"
      },
      {
        id: "b",
        repoUrl: "https://example.com/repo-b",
        baseBranch: "devel",
        baseScope: "local",
        compareBranch: "feature-b",
        compareScope: "local",
        remoteName: "origin"
      }
    ]));

    bootPage();
    window.__gitWorkBranchListTest.renderEntries();

    const entriesHtml = document.getElementById("entriesList").textContent;
    expect(entriesHtml).toContain("repo-a");
    expect(entriesHtml).toContain("repo-b");
    expect(entriesHtml).toContain("比較");
    expect(entriesHtml).toContain("まとめる");
  });
});
