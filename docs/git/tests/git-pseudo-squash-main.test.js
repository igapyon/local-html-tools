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
    <div id="plannedDiffCmd"></div>
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

function bootGitPseudoSquashPage() {
  mountGitPseudoSquashDom();
  const instrumentedCode = `${mainCode}
window.__gitPseudoSquashTest = {
  normalizeCommitMessageForPr,
  regenerateAllCommands,
  getUseCurrentBranchSelected,
  toggleOriginLock,
  clearUiPreferences
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

  it("updates push and planned diff commands when current branch mode is toggled", () => {
    bootGitPseudoSquashPage();

    const useCurrentBranch = document.getElementById("useCurrentBranch");
    const commitMessage = document.getElementById("commitMessage");
    const pushCmd = document.getElementById("pushCmd");
    const plannedDiffCmd = document.getElementById("plannedDiffCmd");

    commitMessage.value = "コミットメッセージ";
    commitMessage.dispatchEvent(new Event("input"));

    expect(pushCmd.textContent).toContain("git push --force-with-lease origin HEAD");
    expect(plannedDiffCmd.textContent).toContain("git diff origin/devel..HEAD");

    useCurrentBranch.checked = false;
    useCurrentBranch.dispatchEvent(new Event("change"));

    expect(pushCmd.textContent).toContain("git push --force-with-lease origin tiga0309iaq");
    expect(plannedDiffCmd.textContent).toContain("git diff origin/devel..tiga0309iaq");
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
});
