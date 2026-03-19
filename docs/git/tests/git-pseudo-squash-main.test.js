// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeEach, describe, expect, it, vi } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainCode = readFileSync(
  path.resolve(__dirname, "../src/git-pseudo-squash/js/main.js"),
  "utf8"
);

function mountGitPseudoSquashDom() {
  document.body.innerHTML = `
    <input id="repoUrl" value="" data-help-text="help" />
    <input id="squashBaseBranch" value="devel" data-help-text="help" />
    <div id="baseBranchMenu"></div>
    <input id="workBranch" value="tiga0309iaq" data-help-text="help" />
    <input id="shellEnvPowerShell" type="checkbox" />
    <input id="lockOrigin" type="checkbox" checked />
    <select id="squashBaseScope">
      <option value="remote" selected>remote</option>
      <option value="local">local</option>
    </select>
    <div id="baseRemoteRow"></div>
    <input id="baseRemote" value="origin" data-help-text="help" />
    <div id="squashRemoteRow"></div>
    <input id="squashRemote" value="origin" data-help-text="help" />
    <textarea id="commitMessage" data-help-text="help"></textarea>
    <input id="useCurrentBranch" type="checkbox" checked />
    <div id="createBranchCmd"></div>
    <div id="rebaseCmd"></div>
    <div id="pushCmd"></div>
    <button id="openBranchDiffBtn" type="button">compare</button>
    <button id="saveToWorkBranchListBtn" type="button">save</button>
    <button id="openRepoUrlBtn" type="button">open</button>
    <button id="copyGitCurrentDirBtn" type="button" class="md-hidden">copy dir</button>
    <div id="toast"></div>
    <dialog id="normalizeDiffDialog"></dialog>
    <div id="normalizeDiffBefore"></div>
    <div id="normalizeDiffAfter"></div>
  `;

  const menu = document.getElementById("baseBranchMenu");
  menu.show = vi.fn(() => {
    menu.open = true;
  });
  menu.close = vi.fn(() => {
    menu.open = false;
  });
  menu.open = false;

  const toast = document.getElementById("toast");
  toast.show = vi.fn();

  const dialog = document.getElementById("normalizeDiffDialog");
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

function bootGitPseudoSquashPage() {
  mountGitPseudoSquashDom();
  window.history.replaceState({}, "", "/docs/git/git-pseudo-squash.html");
  const instrumentedCode = `${mainCode}
window.__gitPseudoSquashTest = {
  normalizeCommitMessageForPr,
  regenerateAllCommands,
  getUseCurrentBranchSelected,
  toggleOriginLock,
  clearUiPreferences,
  saveToWorkBranchListAndOpen,
  applyQueryParams,
  buildBranchDiffUrlFromPlannedDiff
};`;
  new Function(instrumentedCode)();
}

describe("git-pseudo-squash main", () => {
  beforeEach(() => {
    installLocalStorageMock();
    localStorage.clear();
    document.body.innerHTML = "";
    window.__gitPseudoSquashTest = undefined;
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();
    window.__LHT_NAVIGATE__ = vi.fn();
    window.open = vi.fn();
    document.execCommand = vi.fn(() => true);
    window.history.replaceState({}, "", "/docs/git/git-pseudo-squash.html");
  });

  it("does not include git switch in rebase command when current branch mode is enabled", () => {
    bootGitPseudoSquashPage();

    const commitMessage = document.getElementById("commitMessage");
    const rebaseCmd = document.getElementById("rebaseCmd");
    commitMessage.value = "prompt-gen の GitHub 導線追加と git-pseudo-squash の PR整形を簡素化";
    commitMessage.dispatchEvent(new Event("input"));

    expect(window.__gitPseudoSquashTest.getUseCurrentBranchSelected()).toBe(true);
    expect(rebaseCmd.textContent).toContain("git fetch origin");
    expect(rebaseCmd.textContent).toContain("git reset --soft origin/devel");
    expect(rebaseCmd.textContent).not.toContain("git switch tiga0309iaq");
  });

  it("includes git switch in rebase command when current branch mode is disabled", () => {
    bootGitPseudoSquashPage();

    const useCurrentBranch = document.getElementById("useCurrentBranch");
    const commitMessage = document.getElementById("commitMessage");
    const rebaseCmd = document.getElementById("rebaseCmd");

    useCurrentBranch.checked = false;
    useCurrentBranch.dispatchEvent(new Event("change"));
    commitMessage.value = "コミットメッセージ";
    commitMessage.dispatchEvent(new Event("input"));

    expect(window.__gitPseudoSquashTest.getUseCurrentBranchSelected()).toBe(false);
    expect(rebaseCmd.textContent).toContain("git switch tiga0309iaq");
  });

  it("forces both remotes to origin and hides remote rows when lockOrigin is enabled", () => {
    bootGitPseudoSquashPage();

    const lockOrigin = document.getElementById("lockOrigin");
    const baseRemote = document.getElementById("baseRemote");
    const squashRemote = document.getElementById("squashRemote");
    const baseRemoteRow = document.getElementById("baseRemoteRow");
    const squashRemoteRow = document.getElementById("squashRemoteRow");

    localStorage.setItem("gitPseudoSquash.ui.baseRemote", "upstream");
    localStorage.setItem("gitPseudoSquash.ui.squashRemote", "backup");

    lockOrigin.checked = false;
    window.__gitPseudoSquashTest.toggleOriginLock();
    expect(baseRemote.disabled).toBe(false);
    expect(squashRemote.disabled).toBe(false);

    lockOrigin.checked = true;
    window.__gitPseudoSquashTest.toggleOriginLock();

    expect(baseRemote.value).toBe("origin");
    expect(squashRemote.value).toBe("origin");
    expect(baseRemote.disabled).toBe(true);
    expect(squashRemote.disabled).toBe(true);
    expect(baseRemoteRow.classList.contains("md-hidden")).toBe(true);
    expect(squashRemoteRow.classList.contains("md-hidden")).toBe(true);
  });

  it("normalizes prompt-gen style PR text by removing headings and outer tilde fences", () => {
    bootGitPseudoSquashPage();

    const commitMessage = document.getElementById("commitMessage");
    const rebaseCmd = document.getElementById("rebaseCmd");
    commitMessage.value = `~~~~
## PRタイトル

prompt-gen の GitHub 導線追加と git-pseudo-squash の PR整形を簡素化

## PR本文

### 概要
変更内容です。
~~~~`;

    window.__gitPseudoSquashTest.normalizeCommitMessageForPr();

    expect(commitMessage.value).toBe(`prompt-gen の GitHub 導線追加と git-pseudo-squash の PR整形を簡素化

### 概要
変更内容です。`);
    expect(rebaseCmd.textContent).toContain("prompt-gen の GitHub 導線追加と git-pseudo-squash の PR整形を簡素化");
    expect(rebaseCmd.textContent).not.toContain("## PR本文");
    expect(rebaseCmd.textContent).not.toContain("~~~~");
    expect(rebaseCmd.textContent).not.toContain("git switch tiga0309iaq");
  });

  it("normalizes label-style PR text by removing PRタイトル: and PR本文: lines", () => {
    bootGitPseudoSquashPage();

    const commitMessage = document.getElementById("commitMessage");
    const rebaseCmd = document.getElementById("rebaseCmd");
    commitMessage.value = `PRタイトル:

\`prompt-gen の GitHub 導線追加\`

PR本文:

変更内容です。
補足です。`;

    window.__gitPseudoSquashTest.normalizeCommitMessageForPr();

    expect(commitMessage.value).toBe(`prompt-gen の GitHub 導線追加

変更内容です。
補足です。`);
    expect(rebaseCmd.textContent).toContain("prompt-gen の GitHub 導線追加");
    expect(rebaseCmd.textContent).toContain("変更内容です。");
    expect(rebaseCmd.textContent).not.toContain("PRタイトル:");
    expect(rebaseCmd.textContent).not.toContain("PR本文:");
  });

  it("generates PowerShell rebase command with here-string and no git switch in current branch mode", () => {
    bootGitPseudoSquashPage();

    const shellEnvPowerShell = document.getElementById("shellEnvPowerShell");
    const commitMessage = document.getElementById("commitMessage");
    const rebaseCmd = document.getElementById("rebaseCmd");

    shellEnvPowerShell.checked = true;
    shellEnvPowerShell.dispatchEvent(new Event("change"));
    commitMessage.value = "PowerShell 用コミットメッセージ";
    commitMessage.dispatchEvent(new Event("input"));

    expect(rebaseCmd.textContent).toContain("$CommitMsgFile = New-TemporaryFile");
    expect(rebaseCmd.textContent).toContain("'@ | Set-Content -Path $CommitMsgFile -Encoding UTF8");
    expect(rebaseCmd.textContent).toContain("git commit -F $CommitMsgFile");
    expect(rebaseCmd.textContent).not.toContain('COMMIT_MSG_FILE=$(mktemp)');
    expect(rebaseCmd.textContent).not.toContain("git switch tiga0309iaq");
  });

  it("generates PowerShell rebase command with git switch when current branch mode is disabled", () => {
    bootGitPseudoSquashPage();

    const shellEnvPowerShell = document.getElementById("shellEnvPowerShell");
    const useCurrentBranch = document.getElementById("useCurrentBranch");
    const commitMessage = document.getElementById("commitMessage");
    const rebaseCmd = document.getElementById("rebaseCmd");

    shellEnvPowerShell.checked = true;
    shellEnvPowerShell.dispatchEvent(new Event("change"));
    useCurrentBranch.checked = false;
    useCurrentBranch.dispatchEvent(new Event("change"));
    commitMessage.value = "PowerShell で別ブランチ利用";
    commitMessage.dispatchEvent(new Event("input"));

    expect(rebaseCmd.textContent).toContain("git switch tiga0309iaq");
    expect(rebaseCmd.textContent).toContain("$CommitMsgFile = New-TemporaryFile");
  });

  it("updates push command when current branch mode is toggled", () => {
    bootGitPseudoSquashPage();

    const useCurrentBranch = document.getElementById("useCurrentBranch");
    const commitMessage = document.getElementById("commitMessage");
    const pushCmd = document.getElementById("pushCmd");

    commitMessage.value = "コミットメッセージ";
    commitMessage.dispatchEvent(new Event("input"));

    expect(pushCmd.textContent).toContain("git push --force-with-lease origin HEAD");

    useCurrentBranch.checked = false;
    useCurrentBranch.dispatchEvent(new Event("change"));

    expect(pushCmd.textContent).toContain("git push --force-with-lease origin tiga0309iaq");
  });

  it("clears persisted settings and restores default UI values", () => {
    bootGitPseudoSquashPage();

    localStorage.setItem("gitPseudoSquash.ui.shellEnvPowerShell", "true");
    localStorage.setItem("gitPseudoSquash.ui.lockOrigin", "false");
    localStorage.setItem("gitPseudoSquash.ui.squashBaseScope", "local");
    localStorage.setItem("gitPseudoSquash.ui.baseRemote", "upstream");
    localStorage.setItem("gitPseudoSquash.ui.squashRemote", "backup");
    localStorage.setItem("gitPseudoSquash.ui.useCurrentBranch", "false");
    localStorage.setItem("gitPseudoSquash.squashBaseBranchHistory", '["main","devel"]');

    document.getElementById("shellEnvPowerShell").checked = true;
    document.getElementById("lockOrigin").checked = false;
    document.getElementById("squashBaseScope").value = "local";
    document.getElementById("baseRemote").value = "upstream";
    document.getElementById("squashRemote").value = "backup";
    document.getElementById("useCurrentBranch").checked = false;
    document.getElementById("squashBaseBranch").value = "release";
    document.getElementById("workBranch").value = "topic-branch";
    document.getElementById("commitMessage").value = "残ってはいけない";

    window.__gitPseudoSquashTest.clearUiPreferences();

    expect(document.getElementById("shellEnvPowerShell").checked).toBe(false);
    expect(document.getElementById("lockOrigin").checked).toBe(true);
    expect(document.getElementById("squashBaseScope").value).toBe("remote");
    expect(document.getElementById("baseRemote").value).toBe("origin");
    expect(document.getElementById("squashRemote").value).toBe("origin");
    expect(window.__gitPseudoSquashTest.getUseCurrentBranchSelected()).toBe(true);
    expect(document.getElementById("squashBaseBranch").value).toBe("devel");
    expect(document.getElementById("commitMessage").value).toBe("");
    expect(document.getElementById("workBranch").value).toMatch(/^tiga\d{4}[a-z]{3}$/);
    expect(localStorage.removeItem).toHaveBeenCalledWith("gitPseudoSquash.ui.baseRemote");
    expect(localStorage.removeItem).toHaveBeenCalledWith("gitPseudoSquash.ui.squashRemote");
    expect(localStorage.removeItem).toHaveBeenCalledWith("gitPseudoSquash.ui.useCurrentBranch");
    expect(localStorage.removeItem).toHaveBeenCalledWith("gitPseudoSquash.squashBaseBranchHistory");
    expect(localStorage.setItem).toHaveBeenCalledWith("gitPseudoSquash.squashBaseBranch", "devel");
  });

  it("adds current pseudo-squash settings to git-work-list and navigates back", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1700000000000);
    bootGitPseudoSquashPage();

    document.getElementById("repoUrl").value = "https://example.com/repo-a";
    document.getElementById("squashBaseBranch").value = "devel";
    document.getElementById("workBranch").value = "feature-a";
    document.getElementById("squashBaseScope").value = "remote";
    document.getElementById("lockOrigin").checked = false;
    document.getElementById("baseRemote").value = "upstream";

    window.__gitPseudoSquashTest.saveToWorkBranchListAndOpen();

    const savedEntries = getSavedJsonByKey("gitWorkList.entries");
    expect(savedEntries).toHaveLength(1);
    expect(savedEntries[0].repoUrl).toBe("https://example.com/repo-a");
    expect(savedEntries[0].baseBranch).toBe("devel");
    expect(savedEntries[0].compareBranch).toBe("feature-a");
    expect(savedEntries[0].baseScope).toBe("remote");
    expect(savedEntries[0].compareScope).toBe("local");
    expect(savedEntries[0].compareUseHead).toBe(true);
    expect(savedEntries[0].remoteName).toBe("upstream");
    expect(savedEntries[0].lastOpenedAt).toBe(1700000000000);
    expect(getSavedJsonByKey("gitWorkList.recentActions")).toEqual({
      "branch-diff": [],
      "pseudo-squash": [savedEntries[0].id]
    });
    expect(window.__LHT_NAVIGATE__).toHaveBeenCalledWith("git-work-list.html");
    nowSpy.mockRestore();
  });

  it("keeps lock state when updating an existing work-branch-list entry", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1700000001234);
    localStorage.setItem("gitWorkList.entries", JSON.stringify([
      {
        id: "existing-id",
        repoUrl: "https://example.com/repo-a",
        baseBranch: "devel",
        baseScope: "remote",
        compareBranch: "feature-a",
        compareScope: "local",
        compareUseHead: false,
        locked: true,
        remoteName: "origin",
        updatedAt: 1,
        lastOpenedAt: 9
      }
    ]));

    bootGitPseudoSquashPage();

    document.getElementById("repoUrl").value = "https://example.com/repo-a";
    document.getElementById("squashBaseBranch").value = "devel";
    document.getElementById("workBranch").value = "feature-a";

    window.__gitPseudoSquashTest.saveToWorkBranchListAndOpen();

    const savedEntries = getSavedJsonByKey("gitWorkList.entries");
    expect(savedEntries).toHaveLength(1);
    expect(savedEntries[0].id).toBe("existing-id");
    expect(savedEntries[0].locked).toBe(true);
    expect(savedEntries[0].createdAt).toBe(1);
    expect(savedEntries[0].lastOpenedAt).toBe(1700000001234);
    expect(getSavedJsonByKey("gitWorkList.recentActions")).toEqual({
      "branch-diff": [],
      "pseudo-squash": ["existing-id"]
    });
    nowSpy.mockRestore();
  });

  it("applies repo, branch, scope, and remote from URL params", () => {
    mountGitPseudoSquashDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-pseudo-squash.html?repoUrl=https%3A%2F%2Fexample.com%2Frepo-a&baseBranch=devel&baseScope=remote&workBranch=feature-a&remoteName=upstream&defaultCommitMessage=hello+memo"
    );
    const instrumentedCode = `${mainCode}
window.__gitPseudoSquashTest = {
  normalizeCommitMessageForPr,
  regenerateAllCommands,
  getUseCurrentBranchSelected,
  toggleOriginLock,
  clearUiPreferences,
  saveToWorkBranchListAndOpen,
  applyQueryParams,
  buildBranchDiffUrlFromPlannedDiff
};`;
    new Function(instrumentedCode)();

    expect(document.getElementById("repoUrl").value).toBe("https://example.com/repo-a");
    expect(document.getElementById("repoUrl").readOnly).toBe(true);
    expect(document.getElementById("squashBaseBranch").value).toBe("devel");
    expect(document.getElementById("workBranch").value).toBe("feature-a");
    expect(document.getElementById("commitMessage").value).toBe("hello memo");
    expect(document.getElementById("squashBaseScope").value).toBe("remote");
    expect(document.getElementById("lockOrigin").checked).toBe(false);
    expect(document.getElementById("baseRemote").value).toBe("upstream");
    expect(document.getElementById("squashRemote").value).toBe("upstream");
  });

  it("turns on current-branch mode when useHeadWork is passed from the list", () => {
    mountGitPseudoSquashDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-pseudo-squash.html?baseBranch=devel&workBranch=feature-a&useHeadWork=1"
    );
    const instrumentedCode = `${mainCode}
window.__gitPseudoSquashTest = {
  normalizeCommitMessageForPr,
  regenerateAllCommands,
  getUseCurrentBranchSelected,
  toggleOriginLock,
  clearUiPreferences,
  saveToWorkBranchListAndOpen,
  applyQueryParams,
  buildBranchDiffUrlFromPlannedDiff
};`;
    new Function(instrumentedCode)();

    expect(document.getElementById("workBranch").value).toBe("feature-a");
    expect(window.__gitPseudoSquashTest.getUseCurrentBranchSelected()).toBe(true);
  });

  it("turns off current-branch mode when useCurrentBranch=false is passed from the list", () => {
    mountGitPseudoSquashDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-pseudo-squash.html?baseBranch=devel&workBranch=feature-a&useCurrentBranch=false"
    );
    const instrumentedCode = `${mainCode}
window.__gitPseudoSquashTest = {
  normalizeCommitMessageForPr,
  regenerateAllCommands,
  getUseCurrentBranchSelected,
  toggleOriginLock,
  clearUiPreferences,
  saveToWorkBranchListAndOpen,
  applyQueryParams,
  buildBranchDiffUrlFromPlannedDiff
};`;
    new Function(instrumentedCode)();

    expect(window.__gitPseudoSquashTest.getUseCurrentBranchSelected()).toBe(false);
  });

  it("prioritizes query useCurrentBranch=true over persisted current-branch preference", () => {
    installLocalStorageMock();
    localStorage.setItem("gitPseudoSquash.ui.useCurrentBranch", "false");
    mountGitPseudoSquashDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-pseudo-squash.html?baseBranch=devel&workBranch=feature-a&useCurrentBranch=true"
    );
    const instrumentedCode = `${mainCode}
window.__gitPseudoSquashTest = {
  normalizeCommitMessageForPr,
  regenerateAllCommands,
  getUseCurrentBranchSelected,
  toggleOriginLock,
  clearUiPreferences,
  saveToWorkBranchListAndOpen,
  applyQueryParams,
  buildBranchDiffUrlFromPlannedDiff
};`;
    new Function(instrumentedCode)();

    expect(window.__gitPseudoSquashTest.getUseCurrentBranchSelected()).toBe(true);
  });

  it("prioritizes query useCurrentBranch=false over persisted current-branch preference", () => {
    installLocalStorageMock();
    localStorage.setItem("gitPseudoSquash.ui.useCurrentBranch", "true");
    mountGitPseudoSquashDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-pseudo-squash.html?baseBranch=devel&workBranch=feature-a&useCurrentBranch=false"
    );
    const instrumentedCode = `${mainCode}
window.__gitPseudoSquashTest = {
  normalizeCommitMessageForPr,
  regenerateAllCommands,
  getUseCurrentBranchSelected,
  toggleOriginLock,
  clearUiPreferences,
  saveToWorkBranchListAndOpen,
  applyQueryParams,
  buildBranchDiffUrlFromPlannedDiff
};`;
    new Function(instrumentedCode)();

    expect(window.__gitPseudoSquashTest.getUseCurrentBranchSelected()).toBe(false);
  });

  it("keeps current-branch mode on by default when query and persisted value are both absent", () => {
    mountGitPseudoSquashDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-pseudo-squash.html?baseBranch=devel&workBranch=feature-a"
    );
    const instrumentedCode = `${mainCode}
window.__gitPseudoSquashTest = {
  normalizeCommitMessageForPr,
  regenerateAllCommands,
  getUseCurrentBranchSelected,
  toggleOriginLock,
  clearUiPreferences,
  saveToWorkBranchListAndOpen,
  applyQueryParams,
  buildBranchDiffUrlFromPlannedDiff
};`;
    new Function(instrumentedCode)();

    expect(window.__gitPseudoSquashTest.getUseCurrentBranchSelected()).toBe(true);
  });

  it("keeps current-branch mode on when persisted value is invalid", () => {
    installLocalStorageMock();
    localStorage.setItem("gitPseudoSquash.ui.useCurrentBranch", "broken");
    mountGitPseudoSquashDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-pseudo-squash.html?baseBranch=devel&workBranch=feature-a"
    );
    const instrumentedCode = `${mainCode}
window.__gitPseudoSquashTest = {
  normalizeCommitMessageForPr,
  regenerateAllCommands,
  getUseCurrentBranchSelected,
  toggleOriginLock,
  clearUiPreferences,
  saveToWorkBranchListAndOpen,
  applyQueryParams,
  buildBranchDiffUrlFromPlannedDiff
};`;
    new Function(instrumentedCode)();

    expect(window.__gitPseudoSquashTest.getUseCurrentBranchSelected()).toBe(true);
  });

  it("prioritizes query baseBranch over persisted base-branch history", () => {
    installLocalStorageMock();
    localStorage.setItem("gitPseudoSquash.squashBaseBranch", "devel");
    localStorage.setItem("gitPseudoSquash.squashBaseBranchHistory", '["devel","main"]');
    mountGitPseudoSquashDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-pseudo-squash.html?baseBranch=devel2&workBranch=feature-a"
    );
    const instrumentedCode = `${mainCode}
window.__gitPseudoSquashTest = {
  normalizeCommitMessageForPr,
  regenerateAllCommands,
  getUseCurrentBranchSelected,
  toggleOriginLock,
  clearUiPreferences,
  saveToWorkBranchListAndOpen,
  applyQueryParams,
  buildBranchDiffUrlFromPlannedDiff
};`;
    new Function(instrumentedCode)();

    expect(document.getElementById("squashBaseBranch").value).toBe("devel2");
  });

  it("builds branch-diff URL with HEAD when current branch mode is enabled", () => {
    bootGitPseudoSquashPage();

    document.getElementById("repoUrl").value = "https://example.com/repo-a";
    document.getElementById("squashBaseBranch").value = "devel";
    document.getElementById("squashBaseScope").value = "remote";
    document.getElementById("lockOrigin").checked = true;
    document.getElementById("workBranch").value = "feature-a";

    expect(window.__gitPseudoSquashTest.buildBranchDiffUrlFromPlannedDiff()).toBe(
      "git-branch-diff.html?repoUrl=https%3A%2F%2Fexample.com%2Frepo-a&baseBranch=devel&baseScope=remote&workBranch=feature-a&workScope=local&useHeadWork=1&remoteName=origin"
    );
  });

  it("builds branch-diff URL with workBranch when current branch mode is disabled", () => {
    bootGitPseudoSquashPage();

    document.getElementById("repoUrl").value = "https://example.com/repo-a";
    document.getElementById("squashBaseBranch").value = "devel";
    document.getElementById("squashBaseScope").value = "local";
    document.getElementById("useCurrentBranch").checked = false;
    document.getElementById("lockOrigin").checked = false;
    document.getElementById("baseRemote").value = "upstream";
    document.getElementById("workBranch").value = "feature-a";

    expect(window.__gitPseudoSquashTest.buildBranchDiffUrlFromPlannedDiff()).toBe(
      "git-branch-diff.html?repoUrl=https%3A%2F%2Fexample.com%2Frepo-a&baseBranch=devel&baseScope=local&workBranch=feature-a&workScope=local&remoteName=upstream"
    );
  });

  it("requires repoUrl only when saving to git-work-list", () => {
    bootGitPseudoSquashPage();

    document.getElementById("repoUrl").value = "";
    window.__gitPseudoSquashTest.saveToWorkBranchListAndOpen();

    expect(window.alert).toHaveBeenCalledWith("リポジトリ URL を入力してください。");
    expect(window.__LHT_NAVIGATE__).not.toHaveBeenCalled();
  });

  it("opens repoUrl in a new tab from the URL action button", () => {
    bootGitPseudoSquashPage();

    document.getElementById("repoUrl").value = "https://example.com/repo-a";
    document.getElementById("openRepoUrlBtn").click();

    expect(window.open).toHaveBeenCalledWith("https://example.com/repo-a", "_blank", "noopener,noreferrer");
  });

  it("shows git current directory copy button when saved in git-work-list memos", () => {
    installLocalStorageMock();
    localStorage.setItem("gitWorkList.memos", JSON.stringify({
      "https://example.com/repo-a::devel": {
        memo: "memo",
        gitCurrentDir: "/tmp/repo-a"
      }
    }));
    mountGitPseudoSquashDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-pseudo-squash.html?repoUrl=https%3A%2F%2Fexample.com%2Frepo-a&baseBranch=devel&workBranch=feature-a"
    );
    const instrumentedCode = `${mainCode}
window.__gitPseudoSquashTest = {
  normalizeCommitMessageForPr,
  regenerateAllCommands,
  getUseCurrentBranchSelected,
  toggleOriginLock,
  clearUiPreferences,
  saveToWorkBranchListAndOpen,
  applyQueryParams,
  buildBranchDiffUrlFromPlannedDiff
};`;
    new Function(instrumentedCode)();

    const copyButton = document.getElementById("copyGitCurrentDirBtn");
    expect(copyButton.classList.contains("md-hidden")).toBe(false);
    expect(copyButton.title).toBe("/tmp/repo-a");
  });

  it("copies git current directory from the URL row action button", () => {
    installLocalStorageMock();
    localStorage.setItem("gitWorkList.memos", JSON.stringify({
      "https://example.com/repo-a::devel": {
        memo: "memo",
        gitCurrentDir: "/tmp/repo-a"
      }
    }));
    mountGitPseudoSquashDom();
    window.history.replaceState(
      {},
      "",
      "/docs/git/git-pseudo-squash.html?repoUrl=https%3A%2F%2Fexample.com%2Frepo-a&baseBranch=devel&workBranch=feature-a"
    );
    const instrumentedCode = `${mainCode}
window.__gitPseudoSquashTest = {
  normalizeCommitMessageForPr,
  regenerateAllCommands,
  getUseCurrentBranchSelected,
  toggleOriginLock,
  clearUiPreferences,
  saveToWorkBranchListAndOpen,
  applyQueryParams,
  buildBranchDiffUrlFromPlannedDiff
};`;
    new Function(instrumentedCode)();

    document.getElementById("copyGitCurrentDirBtn").click();

    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(document.getElementById("toast").show).toHaveBeenCalledWith("git カレントディレクトリをコピーしました", 2200);
  });

  it("keeps git current directory copy button hidden when no saved path exists", () => {
    bootGitPseudoSquashPage();

    document.getElementById("repoUrl").value = "https://example.com/repo-a";
    document.getElementById("squashBaseBranch").value = "devel";
    document.getElementById("repoUrl").dispatchEvent(new Event("input"));

    expect(document.getElementById("copyGitCurrentDirBtn").classList.contains("md-hidden")).toBe(true);
  });
});
