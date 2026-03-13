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
    <input id="repoUrl" value="" />
    <input id="branchA" value="feature-a" />
    <div id="branchBRow"></div>
    <input id="branchB" value="feature-b" />
    <input id="scopeA" type="checkbox" checked />
    <input id="scopeB" type="checkbox" checked />
    <input id="useHeadWork" type="checkbox" />
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
    <button id="saveToWorkBranchListBtn" type="button">save</button>
    <button id="openGitHubCompareBtn" type="button" disabled>github-compare</button>
    <button id="openRepoUrlBtn" type="button">open</button>
  `;

  const toast = document.getElementById("toast");
  toast.show = vi.fn();
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
  window.history.replaceState({}, "", "/docs/git/git-branch-diff.html");
  const instrumentedCode = `${mainCode}
window.__gitBranchDiffTest = {
  generateCommands,
  updateRemoteState,
  updateStatWidthState,
  applyQueryParams,
  saveToWorkBranchListAndOpen,
  updateWorkHeadState,
  buildGitHubCompareUrl,
  updateGitHubCompareButtonState
};`;
  new Function(instrumentedCode)();
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

describe("git-branch-diff main", () => {
  beforeEach(() => {
    installLocalStorageMock();
    localStorage.clear();
    document.body.innerHTML = "";
    window.__gitBranchDiffTest = undefined;
    window.alert = vi.fn();
    window.__LHT_NAVIGATE__ = vi.fn();
    window.open = vi.fn();
    window.history.replaceState({}, "", "/docs/git/git-branch-diff.html");
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

  it("uses HEAD as work side when HEAD switch is enabled", () => {
    bootPage();

    document.getElementById("useHeadWork").checked = true;
    window.__gitBranchDiffTest.updateWorkHeadState();
    window.__gitBranchDiffTest.generateCommands({ silent: true });

    expect(document.getElementById("branchBRow").classList.contains("md-hidden")).toBe(true);
    expect(document.getElementById("diffCmd").textContent).toBe(
      "git fetch origin\ngit diff origin/feature-a..HEAD"
    );
  });

  it("applies supported URL params and regenerates commands", () => {
    mountDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-branch-diff.html?baseBranch=devel&baseScope=remote&workBranch=feature-work&workScope=local&remoteName=upstream&useHeadWork=1"
    );
    const instrumentedCode = `${mainCode}
window.__gitBranchDiffTest = {
  generateCommands,
  updateRemoteState,
  updateStatWidthState,
  applyQueryParams,
  saveToWorkBranchListAndOpen
};`;
    new Function(instrumentedCode)();
    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(document.getElementById("branchA").value).toBe("devel");
    expect(document.getElementById("branchB").value).toBe("feature-work");
    expect(document.getElementById("branchBRow").classList.contains("md-hidden")).toBe(true);
    expect(document.getElementById("useHeadWork").checked).toBe(true);
    expect(document.getElementById("repoUrl").value).toBe("");
    expect(document.getElementById("repoUrl").readOnly).toBe(false);
    expect(document.getElementById("scopeA").checked).toBe(true);
    expect(document.getElementById("scopeB").checked).toBe(false);
    expect(document.getElementById("lockOrigin").checked).toBe(false);
    expect(document.getElementById("remoteName").value).toBe("upstream");
    expect(document.getElementById("diffCmd").textContent).toBe(
      "git fetch upstream\ngit diff upstream/devel..HEAD"
    );
  });

  it("adds current form state to git-work-list and navigates back", () => {
    mountDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-branch-diff.html?repoUrl=https%3A%2F%2Fexample.com%2Frepo-a"
    );
    const instrumentedCode = `${mainCode}
window.__gitBranchDiffTest = {
  generateCommands,
  updateRemoteState,
  updateStatWidthState,
  applyQueryParams,
  saveToWorkBranchListAndOpen
};`;
    new Function(instrumentedCode)();
    document.dispatchEvent(new Event("DOMContentLoaded"));

    document.getElementById("repoUrl").value = "https://example.com/repo-a";
    document.getElementById("branchA").value = "devel";
    document.getElementById("branchB").value = "feature/login";
    document.getElementById("scopeA").checked = true;
    document.getElementById("scopeB").checked = false;
    document.getElementById("lockOrigin").checked = false;
    document.getElementById("remoteName").value = "upstream";

    window.__gitBranchDiffTest.saveToWorkBranchListAndOpen();

    const savedEntries = getSavedJsonByKey("gitWorkList.entries");
    expect(savedEntries).toHaveLength(1);
    expect(savedEntries[0].repoUrl).toBe("https://example.com/repo-a");
    expect(savedEntries[0].baseBranch).toBe("devel");
    expect(savedEntries[0].compareBranch).toBe("feature/login");
    expect(savedEntries[0].baseScope).toBe("remote");
    expect(savedEntries[0].compareScope).toBe("local");
    expect(savedEntries[0].compareUseHead).toBe(false);
    expect(savedEntries[0].remoteName).toBe("upstream");
    expect(getSavedJsonByKey("gitWorkList.recentActions")).toEqual({
      "branch-diff": [savedEntries[0].id],
      "pseudo-squash": []
    });
    expect(window.__LHT_NAVIGATE__).toHaveBeenCalledWith("git-work-list.html");
  });

  it("locks repoUrl when it is supplied by URL params", () => {
    mountDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-branch-diff.html?repoUrl=https%3A%2F%2Fexample.com%2Frepo-a"
    );
    const instrumentedCode = `${mainCode}
window.__gitBranchDiffTest = {
  generateCommands,
  updateRemoteState,
  updateStatWidthState,
  applyQueryParams,
  saveToWorkBranchListAndOpen
};`;
    new Function(instrumentedCode)();
    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(document.getElementById("repoUrl").value).toBe("https://example.com/repo-a");
    expect(document.getElementById("repoUrl").readOnly).toBe(true);
  });

  it("opens repoUrl in a new tab from the URL action button", () => {
    bootPage();

    document.getElementById("repoUrl").value = "https://example.com/repo-a";
    document.getElementById("openRepoUrlBtn").click();

    expect(window.open).toHaveBeenCalledWith("https://example.com/repo-a", "_blank", "noopener,noreferrer");
  });

  it("saves HEAD comparison as a flag while keeping the work branch name", () => {
    mountDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-branch-diff.html?repoUrl=https%3A%2F%2Fexample.com%2Frepo-a&workBranch=feature/login&useHeadWork=1"
    );
    const instrumentedCode = `${mainCode}
window.__gitBranchDiffTest = {
  generateCommands,
  updateRemoteState,
  updateStatWidthState,
  applyQueryParams,
  saveToWorkBranchListAndOpen
};`;
    new Function(instrumentedCode)();
    document.dispatchEvent(new Event("DOMContentLoaded"));

    document.getElementById("repoUrl").value = "https://example.com/repo-a";
    document.getElementById("branchA").value = "devel";
    document.getElementById("branchB").value = "feature/login";

    window.__gitBranchDiffTest.saveToWorkBranchListAndOpen();

    const savedEntries = getSavedJsonByKey("gitWorkList.entries");
    expect(savedEntries[0].compareBranch).toBe("feature/login");
    expect(savedEntries[0].compareUseHead).toBe(true);
  });

  it("enables GitHub compare for GitHub-compatible remote comparisons", () => {
    bootPage();

    document.getElementById("repoUrl").value = "https://ghe.example.com/team/repo-a";
    document.getElementById("branchA").value = "devel";
    document.getElementById("branchB").value = "feature/login";
    document.getElementById("scopeA").checked = true;
    document.getElementById("scopeB").checked = true;
    document.getElementById("lockOrigin").checked = true;

    window.__gitBranchDiffTest.generateCommands({ silent: true });

    expect(window.__gitBranchDiffTest.buildGitHubCompareUrl()).toBe(
      "https://ghe.example.com/team/repo-a/compare/devel...feature%2Flogin"
    );
    expect(document.getElementById("openGitHubCompareBtn").disabled).toBe(false);

    document.getElementById("openGitHubCompareBtn").click();
    expect(window.open).toHaveBeenCalledWith(
      "https://ghe.example.com/team/repo-a/compare/devel...feature%2Flogin",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("normalizes GitHub-style pull URL and enables GitHub compare", () => {
    bootPage();

    document.getElementById("repoUrl").value = "https://ghe.example.com/team/repo-a/pull/191";
    window.__gitBranchDiffTest.generateCommands({ silent: true });

    expect(window.__gitBranchDiffTest.buildGitHubCompareUrl()).toBe(
      "https://ghe.example.com/team/repo-a/compare/feature-a...feature-b"
    );
    expect(document.getElementById("openGitHubCompareBtn").disabled).toBe(false);
  });

  it("disables GitHub compare when comparison conditions are not compatible", () => {
    bootPage();

    document.getElementById("repoUrl").value = "https://ghe.example.com/team/repo-a";
    document.getElementById("scopeB").checked = false;
    window.__gitBranchDiffTest.generateCommands({ silent: true });
    expect(document.getElementById("openGitHubCompareBtn").disabled).toBe(true);

    document.getElementById("scopeB").checked = true;
    document.getElementById("useHeadWork").checked = true;
    window.__gitBranchDiffTest.updateWorkHeadState();
    window.__gitBranchDiffTest.generateCommands({ silent: true });
    expect(document.getElementById("openGitHubCompareBtn").disabled).toBe(true);

    document.getElementById("useHeadWork").checked = false;
    window.__gitBranchDiffTest.updateWorkHeadState();
    document.getElementById("lockOrigin").checked = false;
    document.getElementById("remoteName").value = "upstream";
    window.__gitBranchDiffTest.updateRemoteState();
    window.__gitBranchDiffTest.generateCommands({ silent: true });
    expect(document.getElementById("openGitHubCompareBtn").disabled).toBe(true);
  });

  it("updates an existing work-branch-list entry when repoUrl and branch names match", () => {
    localStorage.setItem("gitWorkList.entries", JSON.stringify([
      {
        id: "existing-id",
        repoUrl: "https://example.com/repo-a",
        baseBranch: "devel",
        baseScope: "local",
        compareBranch: "feature/login",
        compareScope: "remote",
        locked: true,
        remoteName: "origin",
        updatedAt: 1
      }
    ]));

    mountDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-branch-diff.html?repoUrl=https%3A%2F%2Fexample.com%2Frepo-a"
    );
    const instrumentedCode = `${mainCode}
window.__gitBranchDiffTest = {
  generateCommands,
  updateRemoteState,
  updateStatWidthState,
  applyQueryParams,
  saveToWorkBranchListAndOpen
};`;
    new Function(instrumentedCode)();
    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(document.getElementById("repoUrl").value).toBe("https://example.com/repo-a");
    document.getElementById("branchA").value = "devel";
    document.getElementById("branchB").value = "feature/login";
    document.getElementById("scopeA").checked = true;
    document.getElementById("scopeB").checked = false;
    document.getElementById("lockOrigin").checked = false;
    document.getElementById("remoteName").value = "upstream";

    window.__gitBranchDiffTest.saveToWorkBranchListAndOpen();

    const savedEntries = getSavedJsonByKey("gitWorkList.entries");
    expect(savedEntries).toHaveLength(1);
    expect(savedEntries[0].id).toBe("existing-id");
    expect(savedEntries[0].baseScope).toBe("remote");
    expect(savedEntries[0].compareScope).toBe("local");
    expect(savedEntries[0].locked).toBe(true);
    expect(savedEntries[0].createdAt).toBe(1);
    expect(savedEntries[0].remoteName).toBe("upstream");
    expect(getSavedJsonByKey("gitWorkList.recentActions")).toEqual({
      "branch-diff": ["existing-id"],
      "pseudo-squash": []
    });
  });
});
