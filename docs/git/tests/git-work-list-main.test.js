// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeEach, describe, expect, it, vi } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainCode = readFileSync(
  path.resolve(__dirname, "../src/git-work-list/js/main.js"),
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
      <option value="remote">remote</option>
      <option value="local" selected>local</option>
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

function getSavedJsonByKey(key) {
  const call = localStorage.setItem.mock.calls.findLast(([savedKey]) => savedKey === key);
  return call ? JSON.parse(call[1]) : null;
}

function bootPage() {
  mountDom();
  const instrumentedCode = `${mainCode}
window.__gitWorkListTest = {
  buildDisplayName,
  buildBranchDiffUrl,
  buildPseudoSquashUrl,
  openCreateDialog,
  openEditDialog,
  saveCurrentEntry,
  renderEntries,
  loadEntries,
  toggleEntryLock
};`;
  new Function(instrumentedCode)();
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

describe("git-work-list main", () => {
  beforeEach(() => {
    installLocalStorageMock();
    localStorage.clear();
    document.body.innerHTML = "";
    window.__gitWorkListTest = undefined;
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
    window.open = vi.fn();
  });

  it("saves an entry from the form and renders it to the list", () => {
    bootPage();

    document.getElementById("repoUrl").value = "https://github.com/igapyon/local-html-tools";
    document.getElementById("baseBranch").value = "main";
    document.getElementById("compareBranch").value = "feature/work-board";

    window.__gitWorkListTest.saveCurrentEntry();

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
    document.getElementById("repoUrl").readOnly = true;
    window.__gitWorkListTest.openCreateDialog();

    expect(document.getElementById("entryDialog").open).toBe(true);
    expect(document.getElementById("repoUrl").value).toBe("");
    expect(document.getElementById("repoUrl").readOnly).toBe(false);
    expect(document.getElementById("compareScope").value).toBe("local");
    expect(document.getElementById("entryDialogTitle").textContent).toBe("登録");
  });

  it("removes add primary emphasis once entries exist", () => {
    bootPage();

    const addButton = document.getElementById("openCreateDialogBtn");
    expect(addButton.classList.contains("md-button--primary")).toBe(true);

    document.getElementById("repoUrl").value = "https://example.com/repo-a";
    document.getElementById("baseBranch").value = "main";
    document.getElementById("compareBranch").value = "feature-a";
    window.__gitWorkListTest.saveCurrentEntry();

    expect(addButton.classList.contains("md-button--surface")).toBe(true);
    const squashButton = document.querySelector('[data-action="open-pseudo-squash"]');
    expect(squashButton.classList.contains("md-button--surface")).toBe(true);
  });

  it("locks repoUrl in edit dialog when an existing URL is loaded", () => {
    bootPage();

    window.__gitWorkListTest.openEditDialog({
      id: "entry-1",
      repoUrl: "https://example.com/repo-a",
      baseBranch: "main",
      baseScope: "remote",
      compareBranch: "feature-a",
      compareScope: "remote",
      remoteName: "origin"
    });

    expect(document.getElementById("repoUrl").value).toBe("https://example.com/repo-a");
    expect(document.getElementById("repoUrl").readOnly).toBe(true);
    expect(document.getElementById("entryDialogTitle").textContent).toBe("更新");
  });

  it("derives display name from repository URL", () => {
    bootPage();

    expect(window.__gitWorkListTest.buildDisplayName({
      repoUrl: "https://github.com/igapyon/local-html-tools"
    })).toBe("local-html-tools");
    expect(window.__gitWorkListTest.buildDisplayName({
      repoUrl: "git@github.com:igapyon/local-html-tools.git"
    })).toBe("local-html-tools");
  });

  it("builds git-branch-diff URL params from an entry", () => {
    bootPage();

    expect(window.__gitWorkListTest.buildBranchDiffUrl({
      repoUrl: "https://example.com/repo-a",
      baseBranch: "devel",
      baseScope: "remote",
      compareBranch: "feature/login",
      compareScope: "local",
      compareUseHead: true,
      remoteName: "origin"
    })).toBe("git-branch-diff.html?repoUrl=https%3A%2F%2Fexample.com%2Frepo-a&baseBranch=devel&baseScope=remote&workBranch=feature%2Flogin&workScope=local&remoteName=origin&useHeadWork=1");
  });

  it("builds git-pseudo-squash URL params from an entry", () => {
    bootPage();

    expect(window.__gitWorkListTest.buildPseudoSquashUrl({
      repoUrl: "https://example.com/repo-a",
      baseBranch: "devel",
      baseScope: "remote",
      compareBranch: "feature/login",
      compareScope: "local",
      compareUseHead: true,
      remoteName: "origin"
    })).toBe("git-pseudo-squash.html?repoUrl=https%3A%2F%2Fexample.com%2Frepo-a&baseBranch=devel&baseScope=remote&workBranch=feature%2Flogin&remoteName=origin&useHeadWork=1");
  });

  it("renders stored entries in reverse created order", () => {
    localStorage.setItem("gitWorkList.entries", JSON.stringify([
      {
        id: "a",
        repoUrl: "https://example.com/repo-a",
        baseBranch: "main",
        baseScope: "remote",
        compareBranch: "feature-a",
        compareScope: "remote",
        remoteName: "origin",
        createdAt: 1
      },
      {
        id: "b",
        repoUrl: "https://example.com/repo-b",
        baseBranch: "devel",
        baseScope: "local",
        compareBranch: "feature-b",
        compareScope: "local",
        remoteName: "origin",
        createdAt: 2
      }
    ]));

    bootPage();
    window.__gitWorkListTest.renderEntries();

    const entriesHtml = document.getElementById("entriesList").textContent;
    expect(entriesHtml).toContain("repo-a");
    expect(entriesHtml).toContain("repo-b");
    expect(entriesHtml.indexOf("repo-b")).toBeLessThan(entriesHtml.indexOf("repo-a"));
    expect(entriesHtml).toContain("比較");
    expect(entriesHtml).toContain("squash");
    expect(entriesHtml).toContain("ロック");
  });

  it("groups entries by repoUrl and base branch for display", () => {
    localStorage.setItem("gitWorkList.entries", JSON.stringify([
      {
        id: "a",
        repoUrl: "https://example.com/repo-a",
        baseBranch: "devel",
        baseScope: "remote",
        compareBranch: "feature-a",
        compareScope: "local",
        remoteName: "origin",
        createdAt: 1
      },
      {
        id: "b",
        repoUrl: "https://example.com/repo-a",
        baseBranch: "devel",
        baseScope: "remote",
        compareBranch: "feature-b",
        compareScope: "local",
        remoteName: "origin",
        createdAt: 2
      }
    ]));

    bootPage();

    expect(document.querySelectorAll(".md-entry-group")).toHaveLength(1);
    expect(document.querySelectorAll('[data-entry-id="a"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-entry-id="b"]')).toHaveLength(1);
    expect(document.querySelectorAll(".md-entry-title")).toHaveLength(1);
    expect(document.getElementById("entriesList").textContent).toContain("feature-a");
    expect(document.getElementById("entriesList").textContent).toContain("feature-b");
  });

  it("shows a newly added entry at the top of the list", () => {
    localStorage.setItem("gitWorkList.entries", JSON.stringify([
      {
        id: "a",
        repoUrl: "https://example.com/repo-a",
        baseBranch: "main",
        baseScope: "remote",
        compareBranch: "feature-a",
        compareScope: "remote",
        remoteName: "origin",
        createdAt: 1
      }
    ]));

    bootPage();

    document.getElementById("repoUrl").value = "https://example.com/repo-b";
    document.getElementById("baseBranch").value = "devel";
    document.getElementById("compareBranch").value = "feature-b";
    window.__gitWorkListTest.saveCurrentEntry();

    const entriesHtml = document.getElementById("entriesList").textContent;
    expect(entriesHtml.indexOf("repo-b")).toBeLessThan(entriesHtml.indexOf("repo-a"));
  });

  it("keeps list order when an existing entry is updated", () => {
    localStorage.setItem("gitWorkList.entries", JSON.stringify([
      {
        id: "a",
        repoUrl: "https://example.com/repo-a",
        baseBranch: "main",
        baseScope: "remote",
        compareBranch: "feature-a",
        compareScope: "remote",
        remoteName: "origin",
        createdAt: 1
      },
      {
        id: "b",
        repoUrl: "https://example.com/repo-b",
        baseBranch: "devel",
        baseScope: "local",
        compareBranch: "feature-b",
        compareScope: "local",
        remoteName: "origin",
        createdAt: 2
      }
    ]));

    bootPage();
    window.__gitWorkListTest.openEditDialog({
      id: "a",
      repoUrl: "https://example.com/repo-a",
      baseBranch: "main",
      baseScope: "remote",
      compareBranch: "feature-a",
      compareScope: "remote",
      remoteName: "origin",
      createdAt: 1
    });

    document.getElementById("compareBranch").value = "feature-a2";
    window.__gitWorkListTest.saveCurrentEntry();

    const entriesHtml = document.getElementById("entriesList").textContent;
    expect(entriesHtml.indexOf("repo-b")).toBeLessThan(entriesHtml.indexOf("repo-a"));
  });

  it("colors squash and compare buttons from recent tool history", () => {
    localStorage.setItem("gitWorkList.entries", JSON.stringify([
      {
        id: "a",
        repoUrl: "https://example.com/repo-a",
        baseBranch: "main",
        baseScope: "remote",
        compareBranch: "feature-a",
        compareScope: "remote",
        remoteName: "origin"
      }
    ]));
    localStorage.setItem("gitWorkList.recentActions", JSON.stringify({
      "branch-diff": ["a"],
      "pseudo-squash": ["a"]
    }));

    bootPage();

    const card = document.querySelector('[data-entry-id="a"]');
    const squashButton = card.querySelector('[data-action="open-pseudo-squash"]');
    const compareButton = card.querySelector('[data-action="open-branch-diff"]');

    expect(compareButton.classList.contains("md-button--primary")).toBe(true);
    expect(squashButton.classList.contains("md-button--primary")).toBe(true);
  });

  it("marks compare as most recent when its button is pressed", () => {
    localStorage.setItem("gitWorkList.entries", JSON.stringify([
      {
        id: "a",
        repoUrl: "https://example.com/repo-a",
        baseBranch: "main",
        baseScope: "remote",
        compareBranch: "feature-a",
        compareScope: "remote",
        remoteName: "origin"
      }
    ]));
    localStorage.setItem("gitWorkList.recentActions", JSON.stringify({
      "branch-diff": [],
      "pseudo-squash": ["a"]
    }));

    bootPage();
    delete window.location;
    window.location = { href: "" };

    const compareButton = document.querySelector('[data-action="open-branch-diff"]');
    compareButton.click();

    const savedActions = getSavedJsonByKey("gitWorkList.recentActions");
    expect(savedActions).toEqual({
      "branch-diff": ["a"],
      "pseudo-squash": ["a"]
    });
  });

  it("keeps at most 100 recent tool history items", () => {
    localStorage.setItem("gitWorkList.entries", JSON.stringify([
      {
        id: "a",
        repoUrl: "https://example.com/repo-a",
        baseBranch: "main",
        baseScope: "remote",
        compareBranch: "feature-a",
        compareScope: "remote",
        remoteName: "origin"
      }
    ]));
    localStorage.setItem("gitWorkList.recentActions", JSON.stringify({
      "branch-diff": Array.from({ length: 100 }, (_, index) => `entry-${index}`),
      "pseudo-squash": []
    }));

    bootPage();
    delete window.location;
    window.location = { href: "" };

    const compareButton = document.querySelector('[data-action="open-branch-diff"]');
    compareButton.click();

    const savedActions = getSavedJsonByKey("gitWorkList.recentActions");
    expect(savedActions["branch-diff"]).toHaveLength(100);
    expect(savedActions["branch-diff"][0]).toBe("a");
  });

  it("tracks squash and compare emphasis independently", () => {
    localStorage.setItem("gitWorkList.entries", JSON.stringify([
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
        baseScope: "remote",
        compareBranch: "feature-b",
        compareScope: "remote",
        remoteName: "origin"
      }
    ]));
    localStorage.setItem("gitWorkList.recentActions", JSON.stringify({
      "branch-diff": ["b", "a"],
      "pseudo-squash": ["a", "b"]
    }));

    bootPage();

    const cardA = document.querySelector('[data-entry-id="a"]');
    const cardB = document.querySelector('[data-entry-id="b"]');
    expect(cardA.querySelector('[data-action="open-pseudo-squash"]').classList.contains("md-button--primary")).toBe(true);
    expect(cardB.querySelector('[data-action="open-pseudo-squash"]').classList.contains("md-button--secondary")).toBe(true);
    expect(cardB.querySelector('[data-action="open-branch-diff"]').classList.contains("md-button--primary")).toBe(true);
    expect(cardA.querySelector('[data-action="open-branch-diff"]').classList.contains("md-button--secondary")).toBe(true);
  });

  it("toggles lock state and persists it", () => {
    localStorage.setItem("gitWorkList.entries", JSON.stringify([
      {
        id: "a",
        repoUrl: "https://example.com/repo-a",
        baseBranch: "main",
        baseScope: "remote",
        compareBranch: "feature-a",
        compareScope: "remote",
        remoteName: "origin",
        locked: false
      }
    ]));

    bootPage();
    window.__gitWorkListTest.toggleEntryLock("a");

    const savedEntries = JSON.parse(localStorage.setItem.mock.calls.at(-1)[1]);
    expect(savedEntries).toHaveLength(1);
    expect(savedEntries[0].locked).toBe(true);
    expect(document.getElementById("entriesList").textContent).toContain("解除");
  });

  it("disables edit and delete buttons for locked entries", () => {
    localStorage.setItem("gitWorkList.entries", JSON.stringify([
      {
        id: "a",
        repoUrl: "https://example.com/repo-a",
        baseBranch: "main",
        baseScope: "remote",
        compareBranch: "feature-a",
        compareScope: "remote",
        remoteName: "origin",
        locked: true
      }
    ]));

    bootPage();
    window.__gitWorkListTest.renderEntries();

    const card = document.querySelector('[data-entry-id="a"]');
    const editButton = card.querySelector('[data-action="edit-entry"]');
    const deleteButton = card.querySelector('[data-action="delete-entry"]');

    expect(editButton.disabled).toBe(true);
    expect(deleteButton.disabled).toBe(true);
  });

  it("opens repoUrl in a new tab from the URL row action", () => {
    localStorage.setItem("gitWorkList.entries", JSON.stringify([
      {
        id: "a",
        repoUrl: "https://example.com/repo-a",
        baseBranch: "main",
        baseScope: "remote",
        compareBranch: "feature-a",
        compareScope: "remote",
        remoteName: "origin"
      }
    ]));

    bootPage();
    const openButton = document.querySelector('[data-action="open-repo-url"]');
    openButton.click();

    expect(window.open).toHaveBeenCalledWith("https://example.com/repo-a", "_blank", "noopener,noreferrer");
  });
});
