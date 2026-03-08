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
const mainCode = readFileSync(
  path.resolve(__dirname, "../src/prompt-gen/js/main.js"),
  "utf8"
);

function defineElementIfNeeded(tagName) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, class extends HTMLElement {});
  }
}

function mountPromptDom() {
  document.body.innerHTML = `
    <input id="promptSearch" />
    <div id="promptCandidateArea"></div>
    <div id="commitInputSection" class="md-hidden"></div>
    <div id="promptOutputSection" class="md-hidden"></div>
    <input id="commitId" />
    <input id="includeLabelPrefix" type="checkbox" />
    <div id="promptOutput"></div>
  `;
}

async function bootPromptPage() {
  defineElementIfNeeded("lht-text-field-help");
  mountPromptDom();
  const promptOutputSection = document.getElementById("promptOutputSection");
  promptOutputSection.scrollIntoView = () => {};
  new Function(`${promptDefinitionsCode}\n${mainCode}`)();
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

    promptSearch.value = "pull request";
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

    promptSearch.value = "single-file web app";
    promptSearch.dispatchEvent(new Event("input"));

    expect(document.querySelectorAll(".md-chip-button")).toHaveLength(1);
    expect(commitInputSection.classList.contains("md-hidden")).toBe(true);
    expect(promptOutput.textContent).toBe(
      "このアプリは原則として Single-file Web App であるようにしてください。変更の過程でこれが崩れていることがたまにあります。ビルド後の html ファイルは、CDNや 別ファイルのcss/jsファイルを利用していないことを確認してください。"
    );

    includeLabelPrefix.checked = true;
    includeLabelPrefix.dispatchEvent(new Event("change"));

    expect(promptOutput.textContent).toBe(
      "[701: Single-file Web App の維持] このアプリは原則として Single-file Web App であるようにしてください。変更の過程でこれが崩れていることがたまにあります。ビルド後の html ファイルは、CDNや 別ファイルのcss/jsファイルを利用していないことを確認してください。"
    );
  });

  it("clears selected state and generated output when search query changes", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const commitId = document.getElementById("commitId");
    const promptOutput = document.getElementById("promptOutput");
    const commitInputSection = document.getElementById("commitInputSection");
    const promptOutputSection = document.getElementById("promptOutputSection");

    promptSearch.value = "pull request";
    promptSearch.dispatchEvent(new Event("input"));
    commitId.value = "abc1234";
    commitId.dispatchEvent(new Event("input"));
    expect(promptOutput.textContent).toContain("abc1234");

    promptSearch.value = "spec";
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
});
