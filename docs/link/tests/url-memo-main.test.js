// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeEach, describe, expect, it, vi } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainCode = readFileSync(
  path.resolve(__dirname, "../src/url-memo/js/main.js"),
  "utf8"
);

function mountDom() {
  document.body.innerHTML = `
    <input id="searchInput" value="" />
    <button id="openCreateDialogBtn" type="button">追加</button>
    <button id="exportEntriesBtn" type="button">Export</button>
    <button id="importEntriesBtn" type="button">Import</button>
    <button id="clearEntriesBtn" type="button">全削除</button>
    <input id="importEntriesInput" type="file" />
    <div id="resultsMeta"></div>
    <div id="emptyGuide" hidden></div>
    <div id="entriesList"></div>

    <dialog id="entryDialog"></dialog>
    <div id="entryDialogTitle"></div>
    <input id="urlInput" value="" />
    <input id="titleInput" value="" />
    <input id="keywordsInput" value="" />
    <textarea id="memoInput"></textarea>
    <button id="saveEntryBtn" type="button">保存</button>
    <button id="closeEntryDialogBtn" type="button">閉じる</button>

    <dialog id="detailDialog"></dialog>
    <div id="detailDialogTitle"></div>
    <input id="detailUrl" value="" />
    <input id="detailTitle" value="" />
    <div id="detailKeywords"></div>
    <textarea id="detailMemo"></textarea>
    <button id="closeDetailDialogBtn" type="button">閉じる</button>
    <button id="openUrlBtn" type="button">URLを開く</button>
    <button id="openUrlInlineBtn" type="button">URLを開く</button>
    <button id="editEntryBtn" type="button">編集</button>
    <button id="deleteEntryBtn" type="button">削除</button>

    <div id="toast"></div>
  `;

  const entryDialog = document.getElementById("entryDialog");
  entryDialog.showModal = vi.fn(() => {
    entryDialog.open = true;
  });
  entryDialog.close = vi.fn(() => {
    entryDialog.open = false;
  });

  const detailDialog = document.getElementById("detailDialog");
  detailDialog.showModal = vi.fn(() => {
    detailDialog.open = true;
  });
  detailDialog.close = vi.fn(() => {
    detailDialog.open = false;
  });

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

function bootPage() {
  mountDom();
  new Function(mainCode)();
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

function getSavedEntries() {
  const call = localStorage.setItem.mock.calls.findLast(([key]) => key === "urlMemo.entries");
  return call ? JSON.parse(call[1]) : null;
}

function getRenderedEntryTitles() {
  return Array.from(document.querySelectorAll("#entriesList button .md-chip-label"))
    .map((node) => node.textContent);
}

describe("url-memo main", () => {
  beforeEach(() => {
    installLocalStorageMock();
    localStorage.clear();
    document.body.innerHTML = "";
    window.__urlMemoTest = undefined;
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
    window.open = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      value: vi.fn(() => "blob:mock"),
      configurable: true
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: vi.fn(),
      configurable: true
    });
  });

  it("loads default entries and renders registered count", () => {
    bootPage();

    expect(document.getElementById("resultsMeta").textContent).toBe("31 件登録");
    expect(document.getElementById("entriesList").textContent).toContain("ChatGPT");
    expect(document.getElementById("emptyGuide").hidden).toBe(true);
  });

  it("saves a new entry from the form and makes it searchable by keyword", () => {
    bootPage();

    document.getElementById("urlInput").value = "https://example.com/docs";
    document.getElementById("titleInput").value = "Example Docs";
    document.getElementById("keywordsInput").value = "example, docs";
    document.getElementById("memoInput").value = "example memo";

    document.getElementById("saveEntryBtn").click();

    const savedEntries = getSavedEntries();
    expect(savedEntries[0].title).toBe("Example Docs");
    expect(savedEntries[0].keywords).toEqual(["example", "docs"]);

    document.getElementById("searchInput").value = "docs";
    document.getElementById("searchInput").dispatchEvent(new Event("input"));

    expect(document.getElementById("entriesList").textContent).toContain("Example Docs");
  });

  it("clicking a keyword chip applies the keyword to search", () => {
    bootPage();

    const entryButton = Array.from(document.querySelectorAll("#entriesList button"))
      .find((button) => button.textContent.includes("ChatGPT"));
    entryButton.click();

    const keywordChip = Array.from(document.querySelectorAll("#detailKeywords button"))
      .find((button) => button.textContent === "openai");
    keywordChip.click();

    expect(document.getElementById("searchInput").value).toBe("openai");
    expect(document.getElementById("detailDialog").open).toBe(false);
    expect(document.getElementById("entriesList").textContent).toContain("ChatGPT");
  });

  it("matches hiragana query against katakana keywords and titles", () => {
    bootPage();

    document.getElementById("searchInput").value = "さうんどはうす";
    document.getElementById("searchInput").dispatchEvent(new Event("input"));

    expect(document.getElementById("entriesList").textContent).toContain("サウンドハウス");
    expect(document.getElementById("resultsMeta").textContent).toBe("1 件ヒット");
  });

  it("matches hiragana query against anime keyword", () => {
    bootPage();

    document.getElementById("searchInput").value = "あにめ";
    document.getElementById("searchInput").dispatchEvent(new Event("input"));

    expect(document.getElementById("entriesList").textContent).toContain("dアニメストア");
    expect(document.getElementById("resultsMeta").textContent).toBe("1 件ヒット");
  });

  it("orders matches by title, keyword, memo, then url", () => {
    localStorage.setItem("urlMemo.entries", JSON.stringify([
      {
        id: "title-match",
        title: "alpha title",
        url: "https://example.com/one",
        memo: "",
        keywords: [],
        createdAt: 1,
        lastAccessedAt: 1
      },
      {
        id: "keyword-match",
        title: "keyword only",
        url: "https://example.com/two",
        memo: "",
        keywords: ["alpha"],
        createdAt: 2,
        lastAccessedAt: 2
      },
      {
        id: "memo-match",
        title: "memo only",
        url: "https://example.com/three",
        memo: "alpha note",
        keywords: [],
        createdAt: 3,
        lastAccessedAt: 3
      },
      {
        id: "url-match",
        title: "url only",
        url: "https://alpha.example.com/four",
        memo: "",
        keywords: [],
        createdAt: 4,
        lastAccessedAt: 4
      }
    ]));

    bootPage();

    document.getElementById("searchInput").value = "alpha";
    document.getElementById("searchInput").dispatchEvent(new Event("input"));

    expect(getRenderedEntryTitles()).toEqual([
      "alpha title",
      "keyword only",
      "memo only",
      "url only"
    ]);
  });

  it("imports entries from json and replaces the list", async () => {
    bootPage();

    const importInput = document.getElementById("importEntriesInput");
    const file = new File([
      JSON.stringify({
        version: 1,
        exportedAt: "2026-03-16T00:00:00.000Z",
        entries: [
          {
            id: "imported-1",
            title: "Imported Entry",
            url: "https://imported.example.com",
            memo: "from import",
            keywords: ["imported"],
            createdAt: 10,
            lastAccessedAt: 20
          }
        ]
      })
    ], "url-memo.json", { type: "application/json" });
    Object.defineProperty(file, "text", {
      configurable: true,
      value: () => Promise.resolve(JSON.stringify({
        version: 1,
        exportedAt: "2026-03-16T00:00:00.000Z",
        entries: [
          {
            id: "imported-1",
            title: "Imported Entry",
            url: "https://imported.example.com",
            memo: "from import",
            keywords: ["imported"],
            createdAt: 10,
            lastAccessedAt: 20
          }
        ]
      }))
    });

    Object.defineProperty(importInput, "files", {
      configurable: true,
      value: [file]
    });

    importInput.dispatchEvent(new Event("change"));
    await Promise.resolve();
    await Promise.resolve();

    expect(document.getElementById("entriesList").textContent).toContain("Imported Entry");
    expect(document.getElementById("resultsMeta").textContent).toBe("1 件登録");
    expect(getSavedEntries()).toEqual([
      {
        id: "imported-1",
        title: "Imported Entry",
        url: "https://imported.example.com",
        memo: "from import",
        keywords: ["imported"],
        createdAt: 10,
        lastAccessedAt: 20
      }
    ]);
  });

  it("imports empty entries json and falls back to default entries", async () => {
    bootPage();

    const importInput = document.getElementById("importEntriesInput");
    const file = new File([
      JSON.stringify({
        version: 1,
        exportedAt: "2026-03-16T00:00:00.000Z",
        entries: []
      })
    ], "empty.json", { type: "application/json" });
    Object.defineProperty(file, "text", {
      configurable: true,
      value: () => Promise.resolve(JSON.stringify({
        version: 1,
        exportedAt: "2026-03-16T00:00:00.000Z",
        entries: []
      }))
    });

    Object.defineProperty(importInput, "files", {
      configurable: true,
      value: [file]
    });

    importInput.dispatchEvent(new Event("change"));
    await Promise.resolve();
    await Promise.resolve();

    expect(document.getElementById("resultsMeta").textContent).toBe("31 件登録");
    expect(document.getElementById("entriesList").textContent).toContain("ChatGPT");
  });

  it("clears all entries and shows the empty state", () => {
    bootPage();

    document.getElementById("clearEntriesBtn").click();

    expect(document.getElementById("emptyGuide").hidden).toBe(false);
    expect(document.getElementById("emptyGuide").textContent).toContain("まだ登録がありません");
    expect(document.getElementById("entriesList").textContent).toBe("");
    expect(getSavedEntries()).toEqual([]);
  });
});
