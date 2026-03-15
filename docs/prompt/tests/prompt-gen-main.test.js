// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptMarkdownUtilCode = readFileSync(
  path.resolve(__dirname, "../src/prompt-gen/js/prompt-markdown-util.js"),
  "utf8"
);
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
    if (tagName === "lht-text-field-help") {
      customElements.define(tagName, class extends HTMLElement {
        connectedCallback() {
          if (this.dataset.initialized === "true") return;
          this.dataset.initialized = "true";
          const fieldId = (this.getAttribute("field-id") || "").trim();
          const labelText = (this.getAttribute("label") || "").trim();
          const placeholder = this.getAttribute("placeholder") || "";
          const helpText = this.getAttribute("help-text") || "";
          const isRequired = this.hasAttribute("required");
          this.textContent = "";
          const label = document.createElement("label");
          const span = document.createElement("span");
          span.textContent = labelText;
          const input = document.createElement("input");
          input.id = fieldId;
          input.placeholder = placeholder;
          input.title = helpText;
          input.required = isRequired;
          label.appendChild(span);
          label.appendChild(input);
          this.appendChild(label);
        }
      });
      return;
    }
    if (tagName === "lht-select-help") {
      customElements.define(tagName, class extends HTMLElement {
        connectedCallback() {
          if (this.dataset.initialized === "true") return;
          this.dataset.initialized = "true";
          const selectId = (this.getAttribute("select-id") || "").trim();
          const labelText = (this.getAttribute("label") || "").trim();
          const helpText = this.getAttribute("help-text") || "";
          const sourceOptions = Array.from(this.querySelectorAll("option")).map((option) => ({
            value: option.getAttribute("value") || "",
            label: option.textContent || "",
            selected: option.hasAttribute("selected")
          }));
          this.textContent = "";
          const label = document.createElement("label");
          const span = document.createElement("span");
          span.textContent = labelText;
          const select = document.createElement("select");
          select.id = selectId;
          select.title = helpText;
          for (const entry of sourceOptions) {
            const option = document.createElement("option");
            option.value = entry.value;
            option.textContent = entry.label;
            if (entry.selected) {
              option.selected = true;
            }
            select.appendChild(option);
          }
          label.appendChild(span);
          label.appendChild(select);
          this.appendChild(label);
        }
      });
      return;
    }
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
    <div id="promptArgsSection" class="md-hidden">
      <div id="promptArgsContainer"></div>
    </div>
    <div id="promptOutputSection" class="md-hidden">
      <p id="promptOutputTitle">生成結果</p>
      <div id="promptOutputHelp"></div>
    </div>
    <select id="outputTone">
      <option value="unspecified">無指定</option>
      <option value="desumasu">です・ます調</option>
      <option value="dearu">である調</option>
    </select>
    <select id="selfReview">
      <option value="unspecified">無指定</option>
      <option value="internal">内部レビュー</option>
      <option value="report">レビュー結果出力</option>
    </select>
    <select id="hallucinationGuard">
      <option value="none">無指定</option>
      <option value="low">弱</option>
      <option value="high">強</option>
    </select>
    <select id="misleadingExpressionReview">
      <option value="unspecified">無指定</option>
      <option value="internal">内部レビュー</option>
      <option value="report">レビュー結果出力</option>
    </select>
    <select id="considerationRiskReview">
      <option value="unspecified">無指定</option>
      <option value="internal">内部レビュー</option>
      <option value="report">レビュー結果出力</option>
    </select>
    <select id="discomfortRiskReview">
      <option value="unspecified">無指定</option>
      <option value="internal">内部レビュー</option>
      <option value="report">レビュー結果出力</option>
    </select>
    <select id="aggressiveExpressionReview">
      <option value="unspecified">無指定</option>
      <option value="internal">内部レビュー</option>
      <option value="report">レビュー結果出力</option>
    </select>
    <select id="sensitiveExpressionReview">
      <option value="unspecified">無指定</option>
      <option value="internal">内部レビュー</option>
      <option value="report">レビュー結果出力</option>
    </select>
    <input id="outputMarkdown" type="checkbox" />
    <button id="copyShareLinkButton" type="button"></button>
    <a id="gitPseudoSquashLink" class="md-hidden" href="../git/git-work-list.html"></a>
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

function setRawInputValue(element, value) {
  Object.defineProperty(element, "value", {
    configurable: true,
    get() {
      return value;
    },
    set() {}
  });
}

async function bootPromptPage(urlSearch = "") {
  defineElementIfNeeded("lht-text-field-help");
  defineElementIfNeeded("lht-select-help");
  defineElementIfNeeded("lht-switch-help");
  defineElementIfNeeded("lht-help-tooltip");
  ensureLocalStorageMock();
  window.localStorage.clear();
  window.history.replaceState({}, "", urlSearch ? `/${urlSearch.startsWith("?") ? urlSearch : `?${urlSearch}`}` : "/");
  mountPromptDom();
  const promptOutputSection = document.getElementById("promptOutputSection");
  promptOutputSection.scrollIntoView = () => {};
  new Function(`${promptMarkdownUtilCode}\n${promptDefinitionsCode}\n${promptDefinitionsAiExpansionCode}\n${promptDefinitionsAiSuggestCode}\n${promptDefinitionsPopularCode}\n${mainCode}`)();
  document.dispatchEvent(new Event("DOMContentLoaded"));
  await Promise.resolve();
  await Promise.resolve();
}

function ensureClipboardMock() {
  let copiedText = "";
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      async writeText(text) {
        copiedText = String(text);
      }
    }
  });
  return () => copiedText;
}

describe("prompt-gen main", () => {
  it("applies strong class to label matches", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    promptSearch.value = "A852";
    promptSearch.dispatchEvent(new Event("input"));

    const button = document.querySelector(".md-chip-button");
    expect(button.classList.contains("md-chip-button--strong")).toBe(true);
  });

  it("applies medium class to keyword matches", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    promptSearch.value = "washi collage";
    promptSearch.dispatchEvent(new Event("input"));

    const button = document.querySelector(".md-chip-button");
    expect(button.querySelector(".md-chip-label").textContent).toContain("A852: 和紙切絵作品");
    expect(button.classList.contains("md-chip-button--medium")).toBe(true);
  });

  it("applies weak class to expanded matches", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    promptSearch.value = "ワシ";
    promptSearch.dispatchEvent(new Event("input"));

    const button = document.querySelector(".md-chip-button");
    expect(button.querySelector(".md-chip-label").textContent).toContain("A852: 和紙切絵作品");
    expect(button.classList.contains("md-chip-button--weak")).toBe(true);
  });

  it("copies a share link with q, id, and subject parameters", async () => {
    const getCopiedText = ensureClipboardMock();
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const copyShareLinkButton = document.getElementById("copyShareLinkButton");

    promptSearch.value = "和";
    promptSearch.dispatchEvent(new Event("input"));
    const buttons = [...document.querySelectorAll(".md-chip-button")];
    const targetButton = buttons.find((button) =>
      button.querySelector(".md-chip-label").textContent.includes("A852: 和紙切絵作品")
    );
    targetButton.click();
    const subjectInput = document.getElementById("subjectInput");
    subjectInput.value = "a small fox";
    subjectInput.dispatchEvent(new Event("input"));
    copyShareLinkButton.click();
    await Promise.resolve();

    expect(getCopiedText()).toBe("http://localhost:3000/?q=%E5%92%8C&id=A852&subject=a+small+fox");
  });

  it("applies q query parameter to the search field on load", async () => {
    await bootPromptPage("?q=A852");

    const promptSearch = document.getElementById("promptSearch");
    const promptArgsSection = document.getElementById("promptArgsSection");
    const buttons = [...document.querySelectorAll(".md-chip-button")];

    expect(promptSearch.value).toBe("A852");
    expect(buttons).toHaveLength(1);
    expect(buttons[0].querySelector(".md-chip-label").textContent).toContain("和紙切絵作品");
    expect(promptArgsSection.classList.contains("md-hidden")).toBe(false);
  });

  it("applies subject query parameter and generates output on load", async () => {
    await bootPromptPage("?q=A852&subject=a%20small%20fox");

    const subjectInput = document.getElementById("subjectInput");
    const promptOutput = document.getElementById("promptOutput");

    expect(subjectInput.value).toBe("a small fox");
    expect(promptOutput.textContent).toContain("A simplified cute illustration of `a small fox`");
  });

  it("applies prompt defaults to output options", async () => {
    await bootPromptPage("?q=A501&commit=abc1234");

    const outputTone = document.getElementById("outputTone");
    const selfReview = document.getElementById("selfReview");
    const hallucinationGuard = document.getElementById("hallucinationGuard");
    const misleadingExpressionReview = document.getElementById("misleadingExpressionReview");
    const considerationRiskReview = document.getElementById("considerationRiskReview");
    const discomfortRiskReview = document.getElementById("discomfortRiskReview");
    const aggressiveExpressionReview = document.getElementById("aggressiveExpressionReview");
    const sensitiveExpressionReview = document.getElementById("sensitiveExpressionReview");
    const outputMarkdown = document.getElementById("outputMarkdown");
    const promptOutput = document.getElementById("promptOutput");

    expect(outputTone.value).toBe("unspecified");
    expect(selfReview.value).toBe("unspecified");
    expect(hallucinationGuard.value).toBe("high");
    expect(misleadingExpressionReview.value).toBe("unspecified");
    expect(considerationRiskReview.value).toBe("unspecified");
    expect(discomfortRiskReview.value).toBe("unspecified");
    expect(aggressiveExpressionReview.value).toBe("unspecified");
    expect(sensitiveExpressionReview.value).toBe("unspecified");
    expect(outputMarkdown.checked).toBe(true);
    expect(promptOutput.textContent).toContain("○ハルシネーション防止のため");
    expect(promptOutput.textContent).toContain("○最終的な回答は Markdown テキスト形式で出力し、さらに ~~~~ で囲まれた一塊として出力してください。");
  });

  it("updates output when output options are changed", async () => {
    await bootPromptPage("?q=A501&commit=abc1234");

    const outputTone = document.getElementById("outputTone");
    const selfReview = document.getElementById("selfReview");
    const hallucinationGuard = document.getElementById("hallucinationGuard");
    const misleadingExpressionReview = document.getElementById("misleadingExpressionReview");
    const considerationRiskReview = document.getElementById("considerationRiskReview");
    const discomfortRiskReview = document.getElementById("discomfortRiskReview");
    const aggressiveExpressionReview = document.getElementById("aggressiveExpressionReview");
    const sensitiveExpressionReview = document.getElementById("sensitiveExpressionReview");
    const outputMarkdown = document.getElementById("outputMarkdown");
    const promptOutput = document.getElementById("promptOutput");

    outputTone.value = "dearu";
    outputTone.dispatchEvent(new Event("change"));
    selfReview.value = "report";
    selfReview.dispatchEvent(new Event("change"));
    hallucinationGuard.value = "none";
    hallucinationGuard.dispatchEvent(new Event("change"));
    misleadingExpressionReview.value = "internal";
    misleadingExpressionReview.dispatchEvent(new Event("change"));
    considerationRiskReview.value = "report";
    considerationRiskReview.dispatchEvent(new Event("change"));
    discomfortRiskReview.value = "internal";
    discomfortRiskReview.dispatchEvent(new Event("change"));
    aggressiveExpressionReview.value = "report";
    aggressiveExpressionReview.dispatchEvent(new Event("change"));
    sensitiveExpressionReview.value = "internal";
    sensitiveExpressionReview.dispatchEvent(new Event("change"));
    outputMarkdown.checked = false;
    outputMarkdown.dispatchEvent(new Event("change"));

    expect(promptOutput.textContent).not.toContain("○ハルシネーション防止のため");
    expect(promptOutput.textContent).not.toContain("○最終的な回答は Markdown テキスト形式で出力し、さらに ~~~~ で囲まれた一塊として出力してください。");
    expect(promptOutput.textContent).toContain("○文体は、である調で統一してください。箇条書きは体言止めでも構いません。");
    expect(promptOutput.textContent).toContain("○回答案を作成したあと、第三者のレビューアの視点に切り替えて自己レビューしてください。");
    expect(promptOutput.textContent).toContain("`自己レビュー` セクション");
    expect(promptOutput.textContent).toContain("○回答案を作成したあと、誤解を招く表現がないかを観点として見直してください。");
    expect(promptOutput.textContent).toContain("`配慮不足レビュー` セクション");
    expect(promptOutput.textContent).toContain("○回答案を作成したあと、不快感リスクがないかを観点として見直してください。");
    expect(promptOutput.textContent).toContain("`攻撃性レビュー` セクション");
    expect(promptOutput.textContent).toContain("○回答案を作成したあと、センシティブな表現がないかを観点として見直してください。");
    expect(promptOutput.textContent.indexOf("○文体は、である調で統一してください。箇条書きは体言止めでも構いません。"))
      .toBeLessThan(promptOutput.textContent.indexOf("○回答案を作成したあと、第三者のレビューアの視点に切り替えて自己レビューしてください。"));
    expect(promptOutput.textContent.indexOf("○回答案を作成したあと、第三者のレビューアの視点に切り替えて自己レビューしてください。"))
      .toBeLessThan(promptOutput.textContent.indexOf("○回答案を作成したあと、誤解を招く表現がないかを観点として見直してください。"));
    expect(promptOutput.textContent.indexOf("○回答案を作成したあと、誤解を招く表現がないかを観点として見直してください。"))
      .toBeLessThan(promptOutput.textContent.indexOf("○回答案を作成したあと、配慮不足リスクがないかを観点として見直してください。"));
    expect(promptOutput.textContent.indexOf("○回答案を作成したあと、配慮不足リスクがないかを観点として見直してください。"))
      .toBeLessThan(promptOutput.textContent.indexOf("○回答案を作成したあと、不快感リスクがないかを観点として見直してください。"));
    expect(promptOutput.textContent.indexOf("○回答案を作成したあと、不快感リスクがないかを観点として見直してください。"))
      .toBeLessThan(promptOutput.textContent.indexOf("○回答案を作成したあと、攻撃的な表現がないかを観点として見直してください。"));
    expect(promptOutput.textContent.indexOf("○回答案を作成したあと、攻撃的な表現がないかを観点として見直してください。"))
      .toBeLessThan(promptOutput.textContent.indexOf("○回答案を作成したあと、センシティブな表現がないかを観点として見直してください。"));
  });

  it("resets output options to prompt defaults when switching prompts", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const outputTone = document.getElementById("outputTone");
    const selfReview = document.getElementById("selfReview");
    const hallucinationGuard = document.getElementById("hallucinationGuard");
    const misleadingExpressionReview = document.getElementById("misleadingExpressionReview");
    const considerationRiskReview = document.getElementById("considerationRiskReview");
    const discomfortRiskReview = document.getElementById("discomfortRiskReview");
    const aggressiveExpressionReview = document.getElementById("aggressiveExpressionReview");
    const sensitiveExpressionReview = document.getElementById("sensitiveExpressionReview");
    const outputMarkdown = document.getElementById("outputMarkdown");

    promptSearch.value = "A501";
    promptSearch.dispatchEvent(new Event("input"));
    outputTone.value = "desumasu";
    outputTone.dispatchEvent(new Event("change"));
    selfReview.value = "internal";
    selfReview.dispatchEvent(new Event("change"));
    hallucinationGuard.value = "none";
    hallucinationGuard.dispatchEvent(new Event("change"));
    misleadingExpressionReview.value = "internal";
    misleadingExpressionReview.dispatchEvent(new Event("change"));
    considerationRiskReview.value = "report";
    considerationRiskReview.dispatchEvent(new Event("change"));
    discomfortRiskReview.value = "internal";
    discomfortRiskReview.dispatchEvent(new Event("change"));
    aggressiveExpressionReview.value = "report";
    aggressiveExpressionReview.dispatchEvent(new Event("change"));
    sensitiveExpressionReview.value = "internal";
    sensitiveExpressionReview.dispatchEvent(new Event("change"));
    outputMarkdown.checked = false;
    outputMarkdown.dispatchEvent(new Event("change"));

    promptSearch.value = "A503";
    promptSearch.dispatchEvent(new Event("input"));
    promptSearch.value = "A501";
    promptSearch.dispatchEvent(new Event("input"));

    expect(outputTone.value).toBe("unspecified");
    expect(selfReview.value).toBe("unspecified");
    expect(hallucinationGuard.value).toBe("high");
    expect(misleadingExpressionReview.value).toBe("unspecified");
    expect(considerationRiskReview.value).toBe("unspecified");
    expect(discomfortRiskReview.value).toBe("unspecified");
    expect(aggressiveExpressionReview.value).toBe("unspecified");
    expect(sensitiveExpressionReview.value).toBe("unspecified");
    expect(outputMarkdown.checked).toBe(true);
  });

  it("applies output options to prompts without embedded instructions", async () => {
    await bootPromptPage("?q=P1803-004");

    const outputTone = document.getElementById("outputTone");
    const selfReview = document.getElementById("selfReview");
    const hallucinationGuard = document.getElementById("hallucinationGuard");
    const misleadingExpressionReview = document.getElementById("misleadingExpressionReview");
    const considerationRiskReview = document.getElementById("considerationRiskReview");
    const discomfortRiskReview = document.getElementById("discomfortRiskReview");
    const aggressiveExpressionReview = document.getElementById("aggressiveExpressionReview");
    const sensitiveExpressionReview = document.getElementById("sensitiveExpressionReview");
    const outputMarkdown = document.getElementById("outputMarkdown");
    const promptOutput = document.getElementById("promptOutput");

    expect(outputTone.value).toBe("unspecified");
    expect(selfReview.value).toBe("unspecified");
    expect(hallucinationGuard.value).toBe("none");
    expect(misleadingExpressionReview.value).toBe("unspecified");
    expect(considerationRiskReview.value).toBe("unspecified");
    expect(discomfortRiskReview.value).toBe("unspecified");
    expect(aggressiveExpressionReview.value).toBe("unspecified");
    expect(sensitiveExpressionReview.value).toBe("unspecified");
    expect(outputMarkdown.checked).toBe(false);
    expect(promptOutput.textContent).not.toContain("○ハルシネーション防止のため");
    expect(promptOutput.textContent).not.toContain("○最終的な回答は Markdown テキスト形式で出力し、さらに ~~~~ で囲まれた一塊として出力してください。");

    outputTone.value = "desumasu";
    outputTone.dispatchEvent(new Event("change"));
    selfReview.value = "internal";
    selfReview.dispatchEvent(new Event("change"));
    hallucinationGuard.value = "high";
    hallucinationGuard.dispatchEvent(new Event("change"));
    misleadingExpressionReview.value = "internal";
    misleadingExpressionReview.dispatchEvent(new Event("change"));
    considerationRiskReview.value = "internal";
    considerationRiskReview.dispatchEvent(new Event("change"));
    discomfortRiskReview.value = "internal";
    discomfortRiskReview.dispatchEvent(new Event("change"));
    aggressiveExpressionReview.value = "internal";
    aggressiveExpressionReview.dispatchEvent(new Event("change"));
    sensitiveExpressionReview.value = "internal";
    sensitiveExpressionReview.dispatchEvent(new Event("change"));
    outputMarkdown.checked = true;
    outputMarkdown.dispatchEvent(new Event("change"));

    expect(promptOutput.textContent).toContain("○ハルシネーション防止のため");
    expect(promptOutput.textContent).toContain("○最終的な回答は Markdown テキスト形式で出力し、さらに ~~~~ で囲まれた一塊として出力してください。");
    expect(promptOutput.textContent).toContain("○文体は、です・ます調で統一してください。箇条書きは体言止めでも構いません。");
    expect(promptOutput.textContent).toContain("○回答案を作成したあと、第三者のレビューアの視点に切り替えて自己レビューしてください。");
    expect(promptOutput.textContent).not.toContain("`自己レビュー` セクション");
    expect(promptOutput.textContent).toContain("○回答案を作成したあと、誤解を招く表現がないかを観点として見直してください。");
    expect(promptOutput.textContent).toContain("○回答案を作成したあと、配慮不足リスクがないかを観点として見直してください。");
    expect(promptOutput.textContent).toContain("○回答案を作成したあと、不快感リスクがないかを観点として見直してください。");
    expect(promptOutput.textContent).toContain("○回答案を作成したあと、攻撃的な表現がないかを観点として見直してください。");
    expect(promptOutput.textContent).toContain("○回答案を作成したあと、センシティブな表現がないかを観点として見直してください。");
    expect(promptOutput.textContent).not.toContain("`誤解表現レビュー` セクション");
    expect(promptOutput.textContent).not.toContain("`配慮不足レビュー` セクション");
    expect(promptOutput.textContent).not.toContain("`不快感レビュー` セクション");
    expect(promptOutput.textContent).not.toContain("`攻撃性レビュー` セクション");
    expect(promptOutput.textContent).not.toContain("`センシティブ表現レビュー` セクション");
  });

  it("uses docs as the default docs path for A150", async () => {
    await bootPromptPage("?q=A150");

    const subjectInput = document.getElementById("subjectInput");
    const promptOutput = document.getElementById("promptOutput");

    expect(subjectInput.value).toBe("docs");
    expect(promptOutput.textContent).toContain("create or update a `/docs` directory");
    expect(promptOutput.textContent).toContain("The `/docs` directory acts as the **persistent memory layer**");
  });

  it("updates A150 output when the docs path input changes", async () => {
    await bootPromptPage("?q=A150");

    const subjectInput = document.getElementById("subjectInput");
    const promptOutput = document.getElementById("promptOutput");

    subjectInput.value = "project-memory/docs";
    subjectInput.dispatchEvent(new Event("input"));

    expect(promptOutput.textContent).toContain("create or update a `/project-memory/docs` directory");
    expect(promptOutput.textContent).toContain("Summarize the `/project-memory/docs` structure.");
  });

  it("applies id query parameter to restore a selected prompt among multiple matches", async () => {
    await bootPromptPage("?q=%E5%92%8C&id=A852&subject=%E3%81%B6%E3%81%A9%E3%81%86");

    const activeButton = document.querySelector(".md-chip-button.is-active");
    const subjectInput = document.getElementById("subjectInput");
    const promptOutputTitle = document.getElementById("promptOutputTitle");
    const promptOutput = document.getElementById("promptOutput");

    expect(document.querySelectorAll(".md-chip-button")).toHaveLength(3);
    expect(activeButton.querySelector(".md-chip-label").textContent).toContain("A852: 和紙切絵作品");
    expect(subjectInput.value).toBe("ぶどう");
    expect(promptOutputTitle.textContent).toContain("A852: 和紙切絵作品");
    expect(promptOutput.textContent).toContain("A simplified cute illustration of `ぶどう`");
  });

  it("fills the empty search field with the parent numeric code when a candidate is clicked", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const promptOutputTitle = document.getElementById("promptOutputTitle");

    promptSearch.value = "";
    promptSearch.dispatchEvent(new Event("input"));
    const a321Button = [...document.querySelectorAll(".md-chip-button")].find((button) =>
      button.querySelector(".md-chip-label").textContent.includes("A321:")
    );
    a321Button.click();
    expect(promptSearch.value).toBe("321");
    expect([...document.querySelectorAll(".md-chip-button")].every((button) =>
      button.querySelector(".md-chip-label").textContent.includes("321")
    )).toBe(true);
    expect(promptOutputTitle.textContent).toContain("A321:");

    promptSearch.value = "";
    promptSearch.dispatchEvent(new Event("input"));
    const p1004Button = [...document.querySelectorAll(".md-chip-button")].find((button) =>
      button.querySelector(".md-chip-label").textContent.includes("P1004-003:")
    );
    p1004Button.click();
    expect(promptSearch.value).toBe("1004");
    expect([...document.querySelectorAll(".md-chip-button")].every((button) =>
      button.querySelector(".md-chip-label").textContent.includes("1004")
    )).toBe(true);
    expect(promptOutputTitle.textContent).toContain("P1004-003:");

    promptSearch.value = "A5";
    promptSearch.dispatchEvent(new Event("input"));
    const a501Button = [...document.querySelectorAll(".md-chip-button")].find((button) =>
      button.querySelector(".md-chip-label").textContent.includes("A501:")
    );
    a501Button.click();
    expect(promptSearch.value).toBe("A5");
  });

  it("applies commit query parameter and generates output on load", async () => {
    await bootPromptPage("?q=A501&commit=abc1234");

    const commitId = document.getElementById("commitId");
    const promptOutput = document.getElementById("promptOutput");

    expect(commitId.value).toBe("abc1234");
    expect(promptOutput.textContent).toContain("対象コミット `abc1234` における変更内容について");
  });

  it("generates PR prompt text after unique match and commit id input", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const promptArgsSection = document.getElementById("promptArgsSection");
    const promptOutputSection = document.getElementById("promptOutputSection");
    const promptOutput = document.getElementById("promptOutput");

    promptSearch.value = "A501";
    promptSearch.dispatchEvent(new Event("input"));

    const buttons = [...document.querySelectorAll(".md-chip-button")];
    expect(buttons).toHaveLength(1);
    expect(buttons[0].querySelector(".md-chip-label").textContent).toContain("GitHub PR 文面の作成");
    expect(buttons[0].classList.contains("is-active")).toBe(true);
    expect(promptArgsSection.classList.contains("md-hidden")).toBe(false);
    expect(promptOutputSection.classList.contains("md-hidden")).toBe(false);
    expect(promptOutput.textContent).toBe("");

    const commitId = document.getElementById("commitId");
    commitId.value = "abc1234";
    commitId.dispatchEvent(new Event("input"));

    expect(promptOutput.textContent).toContain("対象コミット `abc1234` における変更内容について");
    expect(promptOutput.textContent).toContain("PRタイトルとPR本文");
  });

  it("shows Git pseudo-squash link only for A501", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const gitPseudoSquashLink = document.getElementById("gitPseudoSquashLink");

    promptSearch.value = "A501";
    promptSearch.dispatchEvent(new Event("input"));

    expect(gitPseudoSquashLink.classList.contains("md-hidden")).toBe(false);
    expect(gitPseudoSquashLink.getAttribute("href")).toBe("../git/git-work-list.html");

    promptSearch.value = "A701";
    promptSearch.dispatchEvent(new Event("input"));

    expect(gitPseudoSquashLink.classList.contains("md-hidden")).toBe(true);
  });

  it("keeps fixed prompt output as body text without a label prefix option", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const promptArgsSection = document.getElementById("promptArgsSection");
    const promptOutput = document.getElementById("promptOutput");

    promptSearch.value = "A701";
    promptSearch.dispatchEvent(new Event("input"));

    expect(document.querySelectorAll(".md-chip-button")).toHaveLength(1);
    expect(promptArgsSection.classList.contains("md-hidden")).toBe(true);
    expect(promptOutput.textContent).toBe(
      "このアプリは原則として Single-file Web App であるようにしてください。変更の過程でこれが崩れていることがたまにあります。ビルド後の html ファイルは、CDN や別ファイルの CSS / JS ファイルを利用していないことを確認してください。"
    );
  });

  it("generates Washi Collage Whisper after subject input", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const promptArgsSection = document.getElementById("promptArgsSection");
    const promptOutput = document.getElementById("promptOutput");

    promptSearch.value = "A852";
    promptSearch.dispatchEvent(new Event("input"));

    expect(document.querySelectorAll(".md-chip-button")).toHaveLength(1);
    expect(promptArgsSection.classList.contains("md-hidden")).toBe(false);
    expect(promptOutput.textContent).toBe("");

    const subjectInput = document.getElementById("subjectInput");
    subjectInput.value = "a small fox";
    subjectInput.dispatchEvent(new Event("input"));

    expect(promptOutput.textContent).toContain("A simplified cute illustration of `a small fox`");
    expect(promptOutput.textContent).toContain("Washi Collage Whisper");
  });

  it("sanitizes commit id by replacing backticks and truncating before embedding", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const promptOutput = document.getElementById("promptOutput");

    promptSearch.value = "A501";
    promptSearch.dispatchEvent(new Event("input"));

    const commitId = document.getElementById("commitId");
    commitId.value = `ab\`cd${"x".repeat(1100)}`;
    commitId.dispatchEvent(new Event("input"));

    const embeddedCommitIdMatch = promptOutput.textContent.match(/対象コミット (`[^`]*`) における変更内容/);
    expect(embeddedCommitIdMatch).not.toBeNull();
    expect(embeddedCommitIdMatch[1].startsWith("`ab'cd")).toBe(true);
    expect(embeddedCommitIdMatch[1]).not.toContain("`cd");
    expect(embeddedCommitIdMatch[1].length).toBe(1026);
  });

  it("sanitizes subject by replacing backticks and truncating before embedding", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const promptOutput = document.getElementById("promptOutput");

    promptSearch.value = "A852";
    promptSearch.dispatchEvent(new Event("input"));

    const subjectInput = document.getElementById("subjectInput");
    subjectInput.value = `small \`fox\`${"y".repeat(1100)}`;
    subjectInput.dispatchEvent(new Event("input"));

    const embeddedSubjectMatch = promptOutput.textContent.match(/A simplified cute illustration of (`[^`]*`), created by assembling/);
    expect(embeddedSubjectMatch).not.toBeNull();
    expect(embeddedSubjectMatch[1].startsWith("`small 'fox'")).toBe(true);
    expect(embeddedSubjectMatch[1]).not.toContain("`fox");
    expect(embeddedSubjectMatch[1].length).toBe(1026);
  });

  it("sanitizes commit id by converting control and invisible characters to spaces", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const promptOutput = document.getElementById("promptOutput");

    promptSearch.value = "A501";
    promptSearch.dispatchEvent(new Event("input"));

    const commitId = document.getElementById("commitId");
    setRawInputValue(commitId, "ab\tcd\nef\u0000gh\u200Biz");
    commitId.dispatchEvent(new Event("input"));

    expect(promptOutput.textContent).toContain("対象コミット `ab cd ef gh iz` における変更内容について");
  });

  it("sanitizes subject by converting control and invisible characters to spaces", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const promptOutput = document.getElementById("promptOutput");

    promptSearch.value = "A852";
    promptSearch.dispatchEvent(new Event("input"));

    const subjectInput = document.getElementById("subjectInput");
    setRawInputValue(subjectInput, "small\tfox\nwith\u200Bhat");
    subjectInput.dispatchEvent(new Event("input"));

    expect(promptOutput.textContent).toContain("A simplified cute illustration of `small fox with hat`");
  });

  it("clears selected state and generated output when search query changes", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const promptOutput = document.getElementById("promptOutput");
    const promptArgsSection = document.getElementById("promptArgsSection");
    const promptOutputSection = document.getElementById("promptOutputSection");

    promptSearch.value = "A501";
    promptSearch.dispatchEvent(new Event("input"));
    const commitId = document.getElementById("commitId");
    commitId.value = "abc1234";
    commitId.dispatchEvent(new Event("input"));
    expect(promptOutput.textContent).toContain("abc1234");

    promptSearch.value = "A703";
    promptSearch.dispatchEvent(new Event("input"));

    expect(document.getElementById("commitId")).toBeNull();
    expect(promptOutput.textContent).not.toContain("abc1234");
    expect(promptOutput.textContent).toContain("今からの作業は仕様の検討です。");
    expect(promptArgsSection.classList.contains("md-hidden")).toBe(true);
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

  it("shows help only beside the selected output label, not on candidate buttons", async () => {
    await bootPromptPage();

    const promptSearch = document.getElementById("promptSearch");
    const promptOutputTitle = document.getElementById("promptOutputTitle");
    const promptOutputHelp = document.getElementById("promptOutputHelp");

    promptSearch.value = "A301";
    promptSearch.dispatchEvent(new Event("input"));

    const buttons = [...document.querySelectorAll(".md-chip-button")];
    expect(buttons).toHaveLength(1);
    expect(buttons[0].querySelector("lht-help-tooltip")).toBeNull();
    expect(promptOutputTitle.textContent).toContain("A301");

    const help = promptOutputHelp.querySelector("lht-help-tooltip");
    expect(help).not.toBeNull();
    expect(help.getAttribute("label")).toBe("キーワード");
    expect(help.textContent).toContain("A301");
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
