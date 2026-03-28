/*
 * Copyright 2026 Toshiki Iga
 * SPDX-License-Identifier: Apache-2.0
 */
(() => {
    const STORAGE_KEY = "urlMemo.entries";
    const EXPORT_VERSION = 1;
    const DEFAULT_ENTRIES_PAYLOAD = {
        version: 1,
        exportedAt: "2026-03-16T12:16:31.448Z",
        entries: [
            {
                id: "urlmemo-1773652733420-mu6zre",
                title: "instagram",
                url: "https://www.instagram.com/toshikiiga/",
                memo: "インスタグラム",
                keywords: [
                    "instagram",
                    "igapyon"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-1773652689762-rumm80",
                title: "github",
                url: "https://github.com/igapyon?tab=repositories",
                memo: "GitHub リポジトリ一覧",
                keywords: [
                    "github",
                    "igapyon",
                    "いがぴょん",
                    "repository",
                    "リポジトリ"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-1773652636580-ye6ael",
                title: "日記ウェブページv3",
                url: "https://www.igapyon.jp/igapyon/diary/",
                memo: "いがぴょんの日記ウェブページv3。",
                keywords: [
                    "igapyon",
                    "blog",
                    "いがぴょん",
                    "伊賀敏樹",
                    "日記",
                    "v3"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-1773652554462-yf33jq",
                title: "igapyon",
                url: "https://www.igapyon.jp/",
                memo: "igapyon のホームページトップ",
                keywords: [
                    "igapyon",
                    "いがぴょん",
                    "伊賀敏樹"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-local-html-tools",
                title: "local-html-tools",
                url: "https://igapyon.github.io/local-html-tools/",
                memo: "ローカルHTMLツール集 (Single-file Web App)",
                keywords: [
                    "local-html-tools",
                    "LLM",
                    "prompt"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-mikuscore",
                title: "mikuscore",
                url: "https://igapyon.github.io/mikuscore/mikuscore.html",
                memo: "MusicXML 中心の譜面フォーマット変換ソフト (Single-file Web App)",
                keywords: [
                    "mikuscore",
                    "musicxml",
                    "midi",
                    "abc"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-starship-sim",
                title: "starship-sim",
                url: "https://igapyon.github.io/starship-sim/",
                memo: "2次元宇宙戦闘シミュレーション (Single-file Web App)",
                keywords: [
                    "starship-sim"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-klondike",
                title: "Klondike",
                url: "https://www.igapyon.jp/apps/klondike.html",
                memo: "ソリティア/クロンダイク (Single-file Web App)",
                keywords: [
                    "Klondike",
                    "solitaire"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-analogclocket",
                title: "AnalogClocket",
                url: "https://igapyon.github.io/AnalogClocket/",
                memo: "シンプルで実用的なアナログ時計 (Single-file Web App)",
                keywords: [
                    "analog",
                    "clock"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-sql-formatter",
                title: "sql-formatter",
                url: "https://igapyon.github.io/sql-formatter/",
                memo: "SQLフォーマッター (Single-file Web App)",
                keywords: [
                    "sql",
                    "formatter",
                    "ansi"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-svg-part-editor",
                title: "svg-part-editor",
                url: "https://igapyon.github.io/svg-part-editor/",
                memo: "ミニマルな SVG エディタ。開発中  (Single-file Web App)",
                keywords: [
                    "svg",
                    "part",
                    "editor"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-remindy",
                title: "Remindy",
                url: "https://github.com/igapyon/remindy",
                memo: "Windows 11向けのデスクトップ用リマインダーツール。",
                keywords: [
                    "remind"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-scheduly",
                title: "Scheduly",
                url: "https://github.com/igapyon/scheduly",
                memo: "iCalendar連携のスケジュール調整アプリ。BETA公開中。",
                keywords: [
                    "schedule",
                    "ical"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-chatgpt",
                title: "ChatGPT",
                url: "https://chatgpt.com/",
                memo: "チャットジーピーティー",
                keywords: [
                    "chatgpt",
                    "openai",
                    "ai",
                    "gpt"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-claude",
                title: "Claude",
                url: "https://claude.ai/",
                memo: "",
                keywords: [
                    "claude",
                    "anthropic",
                    "ai",
                    "クロード",
                    "クロコ"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-gemini",
                title: "Google Gemini",
                url: "https://gemini.google.com/",
                memo: "",
                keywords: [
                    "gemini",
                    "google",
                    "ai",
                    "ジェミニ"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-perplexity",
                title: "Perplexity",
                url: "https://www.perplexity.ai/",
                memo: "",
                keywords: [
                    "perplexity",
                    "ai",
                    "search",
                    "パープレ"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-google",
                title: "Google",
                url: "https://www.google.com/",
                memo: "",
                keywords: [
                    "google",
                    "search",
                    "グーグル",
                    "検索",
                    "ぐぐる"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-gmail",
                title: "Gmail",
                url: "https://mail.google.com/",
                memo: "",
                keywords: [
                    "gmail",
                    "google",
                    "mail",
                    "email",
                    "ジーメール"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-google-calendar",
                title: "Google Calendar",
                url: "https://calendar.google.com/",
                memo: "",
                keywords: [
                    "google",
                    "calendar",
                    "schedule",
                    "グーグル",
                    "カレンダー"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-youtube",
                title: "YouTube",
                url: "https://www.youtube.com/",
                memo: "",
                keywords: [
                    "youtube",
                    "video",
                    "google",
                    "ユーチューブ"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-amazon-jp",
                title: "amazon",
                url: "https://www.amazon.co.jp/",
                memo: "",
                keywords: [
                    "amazon",
                    "shopping",
                    "ec",
                    "アマゾン",
                    "密林"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-soundhouse",
                title: "サウンドハウス",
                url: "https://www.soundhouse.co.jp/",
                memo: "",
                keywords: [
                    "サウンドハウス",
                    "楽器",
                    "音響",
                    "dtm",
                    "soundhouse"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-twitter",
                title: "X (Twitter)",
                url: "https://www.twitter.com/",
                memo: "",
                keywords: [
                    "x",
                    "twitter",
                    "sns",
                    "エックス",
                    "ツイッター"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-facebook",
                title: "facebook",
                url: "https://www.facebook.com/",
                memo: "",
                keywords: [
                    "facebook",
                    "sns",
                    "meta",
                    "フェースブック",
                    "顔本"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-musicxml40",
                title: "MusicXML 4.0",
                url: "https://www.w3.org/2021/06/musicxml40/",
                memo: "",
                keywords: [
                    "musicxml",
                    "w3c",
                    "楽譜",
                    "仕様"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-certum",
                title: "Certum",
                url: "https://www.certum.eu/en/",
                memo: "",
                keywords: [
                    "certum",
                    "ssl",
                    "code signing",
                    "electronic signature"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-danime",
                title: "dアニメストア",
                url: "https://animestore.docomo.ne.jp/",
                memo: "",
                keywords: [
                    "dアニメストア",
                    "アニメ",
                    "docomo",
                    "配信"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-nhk",
                title: "NHK",
                url: "https://www.nhk.or.jp/",
                memo: "",
                keywords: [
                    "nhk",
                    "日本放送協会",
                    "放送",
                    "エヌエッチケー"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-ekitan",
                title: "駅探",
                url: "https://ekitan.com/",
                memo: "",
                keywords: [
                    "駅探",
                    "乗り換え",
                    "時刻表",
                    "交通",
                    "えきたん"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            },
            {
                id: "urlmemo-default-tenkijp",
                title: "tenki",
                url: "https://tenki.jp/",
                memo: "",
                keywords: [
                    "tenki.jp",
                    "天気",
                    "地震",
                    "台風"
                ],
                createdAt: 1773500400000,
                lastAccessedAt: 1773500400000
            }
        ]
    };
    let entries = [];
    let editingId = "";
    let selectedId = "";
    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element not found: ${id}`);
        }
        return element;
    }
    function getDialog(id) {
        return getElement(id);
    }
    function getInput(id) {
        return getElement(id);
    }
    function getTextArea(id) {
        return getElement(id);
    }
    function showToast(message) {
        const toast = document.getElementById("toast");
        const toastWithShow = toast;
        if (toastWithShow && typeof toastWithShow.show === "function") {
            toastWithShow.show(message, 2200);
        }
    }
    function createId() {
        return `urlmemo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
    function normalizeUrl(url) {
        return String(url || "").trim();
    }
    function parseKeywords(value) {
        if (Array.isArray(value)) {
            return value.map((item) => String(item || "").trim()).filter(Boolean);
        }
        return String(value || "")
            .split(/[,\n]/)
            .map((item) => item.trim())
            .filter(Boolean);
    }
    function escapeHtml(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
    function normalizeEntry(raw) {
        const now = Date.now();
        return {
            id: raw && raw.id ? String(raw.id) : createId(),
            title: String((raw === null || raw === void 0 ? void 0 : raw.title) || "").trim(),
            url: normalizeUrl(raw === null || raw === void 0 ? void 0 : raw.url),
            memo: String((raw === null || raw === void 0 ? void 0 : raw.memo) || "").trim(),
            keywords: parseKeywords(raw === null || raw === void 0 ? void 0 : raw.keywords),
            createdAt: Number((raw === null || raw === void 0 ? void 0 : raw.createdAt) || now),
            lastAccessedAt: Number((raw === null || raw === void 0 ? void 0 : raw.lastAccessedAt) || 0)
        };
    }
    function createDefaultEntries() {
        const seenUrls = new Set();
        return DEFAULT_ENTRIES_PAYLOAD.entries
            .map(normalizeEntry)
            .filter(isValidEntry)
            .filter((entry) => {
            const normalizedUrl = normalizeUrl(entry.url);
            if (seenUrls.has(normalizedUrl)) {
                return false;
            }
            seenUrls.add(normalizedUrl);
            return true;
        });
    }
    function isValidEntry(entry) {
        return !!(entry && entry.title && entry.url);
    }
    function loadEntries() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw)
                return createDefaultEntries();
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed))
                return createDefaultEntries();
            const loadedEntries = parsed.map((entry) => normalizeEntry(entry)).filter(isValidEntry);
            return loadedEntries.length > 0 ? loadedEntries : createDefaultEntries();
        }
        catch (_) {
            return createDefaultEntries();
        }
    }
    function saveEntries() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
    function normalizeKanaForSearch(value) {
        return value.replace(/[\u3041-\u3096]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60));
    }
    function normalizeToken(value) {
        return normalizeKanaForSearch(String(value || ""))
            .normalize("NFKC")
            .trim()
            .toLowerCase();
    }
    function buildSearchIndex(entry) {
        const titleTokens = [entry.title].map(normalizeToken).filter(Boolean);
        const keywordTokens = entry.keywords.map(normalizeToken).filter(Boolean);
        const memoTokens = entry.memo.split(/\s+/).map(normalizeToken).filter(Boolean);
        const urlTokens = [entry.url].map(normalizeToken).filter(Boolean);
        return {
            entry,
            titleTokens,
            keywordTokens,
            memoTokens,
            urlTokens
        };
    }
    function matchesAllTerms(tokens, terms) {
        if (terms.length === 0) {
            return true;
        }
        return terms.every((term) => tokens.some((token) => token.includes(term)));
    }
    function calculateMatchScore(tokens, terms) {
        if (terms.length === 0) {
            return 0;
        }
        let score = 0;
        for (const term of terms) {
            let bestScoreForTerm = 0;
            for (const token of tokens) {
                if (!token.includes(term) || token.length === 0) {
                    continue;
                }
                const currentScore = term.length / token.length;
                if (currentScore > bestScoreForTerm) {
                    bestScoreForTerm = currentScore;
                }
            }
            score += bestScoreForTerm;
        }
        return score;
    }
    function sortByLastAccessedDesc(items) {
        return [...items].sort((left, right) => {
            const rightLast = Number(right.lastAccessedAt || 0);
            const leftLast = Number(left.lastAccessedAt || 0);
            if (rightLast !== leftLast) {
                return rightLast - leftLast;
            }
            return Number(right.createdAt || 0) - Number(left.createdAt || 0);
        });
    }
    function sortByScore(items, terms, tokenBuilder) {
        return [...items].sort((left, right) => {
            const rightScore = calculateMatchScore(tokenBuilder(right), terms);
            const leftScore = calculateMatchScore(tokenBuilder(left), terms);
            if (rightScore !== leftScore) {
                return rightScore - leftScore;
            }
            const rightLast = Number(right.lastAccessedAt || 0);
            const leftLast = Number(left.lastAccessedAt || 0);
            if (rightLast !== leftLast) {
                return rightLast - leftLast;
            }
            return String(left.title).localeCompare(String(right.title), "ja");
        });
    }
    function mergeEntryGroups(groups) {
        const merged = [];
        const seenIds = new Set();
        for (const group of groups) {
            for (const entry of group) {
                if (seenIds.has(entry.id)) {
                    continue;
                }
                seenIds.add(entry.id);
                merged.push(entry);
            }
        }
        return merged;
    }
    function searchEntries(query) {
        const searchIndexes = entries.map(buildSearchIndex);
        const terms = String(query || "")
            .trim()
            .split(/\s+/)
            .map(normalizeToken)
            .filter(Boolean);
        if (terms.length === 0) {
            const sorted = sortByLastAccessedDesc(entries);
            return {
                matchedEntries: sorted,
                matchGrades: new Map(sorted.map((entry) => [entry.id, "medium"])),
                terms
            };
        }
        const titleMatches = sortByScore(searchIndexes.filter((index) => matchesAllTerms(index.titleTokens, terms)).map((index) => index.entry), terms, (entry) => buildSearchIndex(entry).titleTokens);
        const keywordMatches = sortByScore(searchIndexes.filter((index) => matchesAllTerms(index.keywordTokens, terms)).map((index) => index.entry), terms, (entry) => buildSearchIndex(entry).keywordTokens);
        const memoMatches = sortByScore(searchIndexes.filter((index) => matchesAllTerms(index.memoTokens, terms)).map((index) => index.entry), terms, (entry) => buildSearchIndex(entry).memoTokens);
        const urlMatches = sortByScore(searchIndexes.filter((index) => matchesAllTerms(index.urlTokens, terms)).map((index) => index.entry), terms, (entry) => buildSearchIndex(entry).urlTokens);
        const matchedEntries = mergeEntryGroups([titleMatches, keywordMatches, memoMatches, urlMatches]);
        const matchGrades = new Map();
        for (const entry of urlMatches) {
            matchGrades.set(entry.id, "weak");
        }
        for (const entry of memoMatches) {
            matchGrades.set(entry.id, "weak");
        }
        for (const entry of keywordMatches) {
            matchGrades.set(entry.id, "medium");
        }
        for (const entry of titleMatches) {
            matchGrades.set(entry.id, "strong");
        }
        return { matchedEntries, matchGrades, terms };
    }
    function renderEntries() {
        const list = getElement("entriesList");
        const emptyGuide = getElement("emptyGuide");
        const resultsMeta = getElement("resultsMeta");
        const query = getInput("searchInput").value || "";
        const { matchedEntries, matchGrades, terms } = searchEntries(query);
        if (resultsMeta) {
            resultsMeta.textContent = terms.length > 0
                ? `${matchedEntries.length} 件ヒット`
                : `${entries.length} 件登録`;
        }
        list.innerHTML = "";
        if (entries.length === 0) {
            emptyGuide.hidden = false;
            emptyGuide.textContent = "まだ登録がありません。追加ボタンから登録してください。";
            return;
        }
        if (matchedEntries.length === 0) {
            emptyGuide.hidden = false;
            emptyGuide.textContent = "一致する項目がありません。検索語を調整してください。";
            return;
        }
        emptyGuide.hidden = true;
        matchedEntries.forEach((entry) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `md-chip-button md-chip-button--${matchGrades.get(entry.id) || "weak"}`;
            button.dataset.entryId = entry.id;
            button.innerHTML = `<span class="md-chip-label">${escapeHtml(entry.title)}</span>`;
            button.addEventListener("click", () => openDetailDialog(entry.id));
            list.appendChild(button);
        });
    }
    function openDialog(dialog) {
        if (dialog && typeof dialog.showModal === "function") {
            dialog.showModal();
        }
    }
    function closeDialog(dialog) {
        if (dialog && dialog.open && typeof dialog.close === "function") {
            dialog.close();
        }
    }
    function resetEntryForm() {
        editingId = "";
        getElement("entryDialogTitle").textContent = "URLメモを追加";
        getInput("titleInput").value = "";
        getInput("urlInput").value = "";
        getInput("keywordsInput").value = "";
        getTextArea("memoInput").value = "";
    }
    function openCreateDialog() {
        resetEntryForm();
        openDialog(getDialog("entryDialog"));
    }
    function openEditDialog(entryId) {
        const entry = entries.find((item) => item.id === entryId);
        if (!entry)
            return;
        editingId = entry.id;
        getElement("entryDialogTitle").textContent = "URLメモを更新";
        getInput("titleInput").value = entry.title;
        getInput("urlInput").value = entry.url;
        getInput("keywordsInput").value = entry.keywords.join(", ");
        getTextArea("memoInput").value = entry.memo;
        openDialog(getDialog("entryDialog"));
    }
    function saveCurrentEntry() {
        const title = String(getInput("titleInput").value || "").trim();
        const url = normalizeUrl(getInput("urlInput").value || "");
        const keywords = parseKeywords(getInput("keywordsInput").value || "");
        const memo = String(getTextArea("memoInput").value || "").trim();
        if (!title) {
            alert("タイトルを入力してください。");
            return;
        }
        if (!url) {
            alert("URL を入力してください。");
            return;
        }
        if (editingId) {
            entries = entries.map((entry) => (entry.id === editingId
                ? { ...entry, title, url, keywords, memo }
                : entry));
            showToast("URLメモを更新しました");
        }
        else {
            entries.unshift({
                id: createId(),
                title,
                url,
                keywords,
                memo,
                createdAt: Date.now(),
                lastAccessedAt: 0
            });
            showToast("URLメモを追加しました");
        }
        saveEntries();
        renderEntries();
        closeDialog(getDialog("entryDialog"));
    }
    function openDetailDialog(entryId) {
        const entry = entries.find((item) => item.id === entryId);
        if (!entry)
            return;
        selectedId = entry.id;
        getElement("detailDialogTitle").textContent = entry.title;
        getInput("detailTitle").value = entry.title;
        getInput("detailUrl").value = entry.url;
        getTextArea("detailMemo").value = entry.memo || "未記入";
        const keywordsNode = getElement("detailKeywords");
        keywordsNode.innerHTML = "";
        if (entry.keywords.length === 0) {
            keywordsNode.textContent = "未設定";
        }
        else {
            entry.keywords.forEach((keyword) => {
                const chip = document.createElement("button");
                chip.type = "button";
                chip.className = "md-keyword-chip";
                chip.textContent = keyword;
                chip.addEventListener("click", () => applyKeywordSearch(keyword));
                keywordsNode.appendChild(chip);
            });
        }
        openDialog(getDialog("detailDialog"));
    }
    function applyKeywordSearch(keyword) {
        const searchInput = getInput("searchInput");
        searchInput.value = String(keyword || "").trim();
        closeDialog(getDialog("detailDialog"));
        renderEntries();
        searchInput.focus();
    }
    function markAccessed(entryId) {
        entries = entries.map((entry) => (entry.id === entryId
            ? { ...entry, lastAccessedAt: Date.now() }
            : entry));
        saveEntries();
    }
    function openSelectedUrl() {
        const entry = entries.find((item) => item.id === selectedId);
        if (!entry)
            return;
        markAccessed(entry.id);
        renderEntries();
        window.open(entry.url, "_blank", "noopener,noreferrer");
        openDetailDialog(entry.id);
    }
    function deleteSelectedEntry() {
        const entry = entries.find((item) => item.id === selectedId);
        if (!entry)
            return;
        if (!window.confirm(`「${entry.title}」を削除しますか？`)) {
            return;
        }
        entries = entries.filter((item) => item.id !== entry.id);
        saveEntries();
        renderEntries();
        closeDialog(getDialog("detailDialog"));
        showToast("URLメモを削除しました");
    }
    function exportEntries() {
        const payload = {
            version: EXPORT_VERSION,
            exportedAt: new Date().toISOString(),
            entries
        };
        const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json;charset=utf-8" });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const now = new Date();
        const stamp = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0"),
            "-",
            String(now.getHours()).padStart(2, "0"),
            String(now.getMinutes()).padStart(2, "0"),
            String(now.getSeconds()).padStart(2, "0")
        ].join("");
        link.href = objectUrl;
        link.download = `url-memo-export-${stamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
        showToast("一覧を JSON でエクスポートしました");
    }
    async function importEntriesFromFile(file) {
        if (!file)
            return;
        try {
            const parsed = JSON.parse(await file.text());
            if (!parsed || Number(parsed.version) !== EXPORT_VERSION || !Array.isArray(parsed.entries)) {
                showToast("JSON の読み込みに失敗しました");
                return;
            }
            const importedEntries = parsed.entries.map((entry) => normalizeEntry(entry)).filter(isValidEntry);
            entries = importedEntries.length > 0 ? importedEntries : createDefaultEntries();
            saveEntries();
            renderEntries();
            showToast("一覧を JSON から取り込みました");
        }
        catch (_) {
            showToast("JSON の読み込みに失敗しました");
        }
    }
    function clearAllEntries() {
        if (!window.confirm("URLメモをすべて削除しますか？")) {
            return;
        }
        entries = [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        selectedId = "";
        renderEntries();
        showToast("URLメモをすべて削除しました");
    }
    function bindEvents() {
        getInput("searchInput").addEventListener("input", renderEntries);
        getElement("openCreateDialogBtn").addEventListener("click", openCreateDialog);
        getElement("saveEntryBtn").addEventListener("click", saveCurrentEntry);
        getElement("closeEntryDialogBtn").addEventListener("click", () => closeDialog(getDialog("entryDialog")));
        getElement("closeDetailDialogBtn").addEventListener("click", () => closeDialog(getDialog("detailDialog")));
        getElement("editEntryBtn").addEventListener("click", () => {
            closeDialog(getDialog("detailDialog"));
            openEditDialog(selectedId);
        });
        getElement("deleteEntryBtn").addEventListener("click", deleteSelectedEntry);
        getElement("openUrlBtn").addEventListener("click", openSelectedUrl);
        getElement("openUrlInlineBtn").addEventListener("click", openSelectedUrl);
        getElement("exportEntriesBtn").addEventListener("click", exportEntries);
        getElement("importEntriesBtn").addEventListener("click", () => getInput("importEntriesInput").click());
        getElement("clearEntriesBtn").addEventListener("click", clearAllEntries);
        getInput("importEntriesInput").addEventListener("change", async (event) => {
            const input = event.target;
            const file = (input === null || input === void 0 ? void 0 : input.files) && input.files[0];
            await importEntriesFromFile(file);
            if (input) {
                input.value = "";
            }
        });
        const entryDialog = getDialog("entryDialog");
        const detailDialog = getDialog("detailDialog");
        [entryDialog, detailDialog].forEach((dialog) => {
            dialog.addEventListener("click", (event) => {
                if (event.target === dialog) {
                    closeDialog(dialog);
                }
            });
        });
    }
    function initialize() {
        entries = loadEntries();
        bindEvents();
        renderEntries();
    }
    document.addEventListener("DOMContentLoaded", initialize);
})();
