// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptDefinitionsCode = readFileSync(
  path.resolve(__dirname, "../src/prompt-gen/js/prompt-definitions.js"),
  "utf8"
);
const promptDefinitionsAiExpansionCode = readFileSync(
  path.resolve(__dirname, "../src/prompt-gen/js/prompt-definitions-ai-expansion.js"),
  "utf8"
);
const promptDefinitionsAiSuggestCode = readFileSync(
  path.resolve(__dirname, "../src/prompt-gen/js/prompt-definitions-ai-suggest.js"),
  "utf8"
);
const promptDefinitionsPopularCode = readFileSync(
  path.resolve(__dirname, "../src/prompt-gen/js/prompt-definitions-popular.js"),
  "utf8"
);
const mainCode = readFileSync(
  path.resolve(__dirname, "../src/prompt-gen/js/main.js"),
  "utf8"
);

function defineElementIfNeeded(tagName) {
  if (!customElements.get(tagName)) {
    if (tagName === "lht-switch-help") {
      customElements.define(tagName, class extends HTMLElement {
        connectedCallback() {
          if (this.dataset.initialized === "true") return;
          this.dataset.initialized = "true";
          const switchId = (this.getAttribute("switch-id") || "").trim();
          const labelText = (this.getAttribute("label") || "").trim();
          const isChecked = this.hasAttribute("checked");
          this.textContent = "";
          const label = document.createElement("label");
          const input = document.createElement("input");
          input.type = "checkbox";
          input.id = switchId;
          input.checked = isChecked;
          const span = document.createElement("span");
          span.textContent = labelText;
          label.appendChild(input);
          label.appendChild(span);
          this.appendChild(label);
        }
      });
      return;
    }
    customElements.define(tagName, class extends HTMLElement {});
  }
}

function mountPromptDom() {
  document.body.innerHTML = `
    <lht-page-menu><div class="md-menu-panel"></div></lht-page-menu>
    <input id="promptSearch" />
    <div id="promptCandidateArea"></div>
    <div id="commitInputSection" class="md-hidden"></div>
    <div id="promptOutputSection" class="md-hidden"></div>
    <input id="commitId" />
    <input id="includeLabelPrefix" type="checkbox" />
    <div id="promptOutput"></div>
  `;
}

function ensureLocalStorageMock() {
  const backingStore = new Map();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem(key) {
        return backingStore.has(key) ? backingStore.get(key) : null;
      },
      setItem(key, value) {
        backingStore.set(String(key), String(value));
      },
      removeItem(key) {
        backingStore.delete(String(key));
      },
      clear() {
        backingStore.clear();
      }
    }
  });
}

async function bootPromptPage() {
  defineElementIfNeeded("lht-text-field-help");
  defineElementIfNeeded("lht-switch-help");
  ensureLocalStorageMock();
  window.localStorage.clear();
  mountPromptDom();
  const promptOutputSection = document.getElementById("promptOutputSection");
  promptOutputSection.scrollIntoView = () => {};
  new Function(`${promptDefinitionsCode}\n${promptDefinitionsAiExpansionCode}\n${promptDefinitionsAiSuggestCode}\n${promptDefinitionsPopularCode}\n${mainCode}`)();
  document.dispatchEvent(new Event("DOMContentLoaded"));
  await Promise.resolve();
  await Promise.resolve();
}

describe("prompt-gen main", () => {
  it("generates PR prompt text after unique match and commit id input", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const commitId = document.getElementById("commitId");
    const commitInputSection = document.getElementById("commitInputSection");
    const promptOutputSection = document.getElementById("promptOutputSection");
    const promptOutput = document.getElementById("promptOutput");

    promptSearch.value = "A501";
    promptSearch.dispatchEvent(new Event("input"));

    const buttons = [...document.querySelectorAll(".md-chip-button")];
    expect(buttons).toHaveLength(1);
    expect(buttons[0].querySelector(".md-chip-label").textContent).toContain("GitHub PR 文面の作成");
    expect(buttons[0].classList.contains("is-active")).toBe(true);
    expect(commitInputSection.classList.contains("md-hidden")).toBe(false);
    expect(promptOutputSection.classList.contains("md-hidden")).toBe(false);
    expect(promptOutput.textContent).toBe("");

    commitId.value = "abc1234";
    commitId.dispatchEvent(new Event("input"));

    expect(promptOutput.textContent).toContain("対象コミット abc1234 における変更内容について");
    expect(promptOutput.textContent).toContain("PRタイトルとPR本文");
  });

  it("adds label prefix for fixed prompt when switch is enabled", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const includeLabelPrefix = document.getElementById("includeLabelPrefix");
    const commitInputSection = document.getElementById("commitInputSection");
    const promptOutput = document.getElementById("promptOutput");

    promptSearch.value = "A701";
    promptSearch.dispatchEvent(new Event("input"));

    expect(document.querySelectorAll(".md-chip-button")).toHaveLength(1);
    expect(commitInputSection.classList.contains("md-hidden")).toBe(true);
    expect(promptOutput.textContent).toBe(
      "このアプリは原則として Single-file Web App であるようにしてください。変更の過程でこれが崩れていることがたまにあります。ビルド後の html ファイルは、CDN や別ファイルの CSS / JS ファイルを利用していないことを確認してください。"
    );

    includeLabelPrefix.checked = true;
    includeLabelPrefix.dispatchEvent(new Event("change"));

    expect(promptOutput.textContent).toBe(
      "[A701: Single-file Web App の維持] このアプリは原則として Single-file Web App であるようにしてください。変更の過程でこれが崩れていることがたまにあります。ビルド後の html ファイルは、CDN や別ファイルの CSS / JS ファイルを利用していないことを確認してください。"
    );
  });

  it("clears selected state and generated output when search query changes", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const commitId = document.getElementById("commitId");
    const promptOutput = document.getElementById("promptOutput");
    const commitInputSection = document.getElementById("commitInputSection");
    const promptOutputSection = document.getElementById("promptOutputSection");

    promptSearch.value = "A501";
    promptSearch.dispatchEvent(new Event("input"));
    commitId.value = "abc1234";
    commitId.dispatchEvent(new Event("input"));
    expect(promptOutput.textContent).toContain("abc1234");

    promptSearch.value = "A703";
    promptSearch.dispatchEvent(new Event("input"));

    expect(commitId.value).toBe("");
    expect(promptOutput.textContent).not.toContain("abc1234");
    expect(promptOutput.textContent).toContain("今からの作業は仕様の検討です。");
    expect(commitInputSection.classList.contains("md-hidden")).toBe(true);
    expect(promptOutputSection.classList.contains("md-hidden")).toBe(false);
    expect(document.querySelectorAll(".md-chip-button")).toHaveLength(1);
  });

  it("uses a label-derived unique match as the primary selection", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    promptSearch.value = "離席";
    promptSearch.dispatchEvent(new Event("input"));

    const buttons = [...document.querySelectorAll(".md-chip-button")];
    expect(buttons).toHaveLength(1);

    const activeButtons = buttons.filter((button) => button.classList.contains("is-active"));
    expect(activeButtons).toHaveLength(1);
    expect(activeButtons[0].querySelector(".md-chip-label").textContent).toContain("310: 直近の作業状況を確認");
  });

  it("toggles A/X/S/P visibility in the menu and persists to localStorage", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const menuPanel = document.querySelector("lht-page-menu .md-menu-panel");
    const checkboxes = [...menuPanel.querySelectorAll("input[type='checkbox']")];
    const resetButton = menuPanel.querySelector(".md-menu-settings__reset");

    expect(checkboxes).toHaveLength(4);

    promptSearch.value = "A701";
    promptSearch.dispatchEvent(new Event("input"));
    expect(document.querySelectorAll(".md-chip-button")).toHaveLength(1);

    const aCheckbox = checkboxes[0];
    aCheckbox.checked = false;
    aCheckbox.dispatchEvent(new Event("change"));

    expect(JSON.parse(window.localStorage.getItem("promptGenSeriesVisibility"))).toMatchObject({
      showA: false,
      showX: true,
      showS: true,
      showP: true
    });
    expect(document.querySelectorAll(".md-chip-button")).toHaveLength(0);

    resetButton.dispatchEvent(new Event("click"));

    expect(window.localStorage.getItem("promptGenSeriesVisibility")).toBe(null);
    expect(document.querySelectorAll(".md-chip-button")).toHaveLength(1);
  });
});
