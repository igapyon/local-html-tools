async function initializePromptPage() {
    if (window.customElements && window.customElements.whenDefined) {
        await window.customElements.whenDefined("lht-text-field-help");
    }
    const promptSearch = document.getElementById("promptSearch");
    const promptCandidateArea = document.getElementById("promptCandidateArea");
    const commitInputSection = document.getElementById("commitInputSection");
    const promptOutputSection = document.getElementById("promptOutputSection");
    const commitIdInput = document.getElementById("commitId");
    const includeLabelPrefix = document.getElementById("includeLabelPrefix");
    const promptOutput = document.getElementById("promptOutput");
    if (!promptSearch || !commitIdInput || !includeLabelPrefix || !promptOutput || !promptCandidateArea || !commitInputSection || !promptOutputSection) {
        return;
    }
    function applyLatinInputHints(field, enterKeyHint) {
        field.setAttribute("inputmode", "latin");
        field.setAttribute("autocapitalize", "off");
        field.setAttribute("autocorrect", "off");
        field.setAttribute("spellcheck", "false");
        if (enterKeyHint) {
            field.setAttribute("enterkeyhint", enterKeyHint);
        }
    }
    applyLatinInputHints(promptSearch, "search");
    applyLatinInputHints(commitIdInput, "done");
    let selectedPrompt = "";
    let lastSearchQuery = "";
    const kanaToRomajiMap = new Map([
        ["きゃ", "kya"], ["きゅ", "kyu"], ["きょ", "kyo"],
        ["しゃ", "sha"], ["しゅ", "shu"], ["しょ", "sho"],
        ["ちゃ", "cha"], ["ちゅ", "chu"], ["ちょ", "cho"],
        ["にゃ", "nya"], ["にゅ", "nyu"], ["にょ", "nyo"],
        ["ひゃ", "hya"], ["ひゅ", "hyu"], ["ひょ", "hyo"],
        ["みゃ", "mya"], ["みゅ", "myu"], ["みょ", "myo"],
        ["りゃ", "rya"], ["りゅ", "ryu"], ["りょ", "ryo"],
        ["ぎゃ", "gya"], ["ぎゅ", "gyu"], ["ぎょ", "gyo"],
        ["じゃ", "ja"], ["じゅ", "ju"], ["じょ", "jo"],
        ["びゃ", "bya"], ["びゅ", "byu"], ["びょ", "byo"],
        ["ぴゃ", "pya"], ["ぴゅ", "pyu"], ["ぴょ", "pyo"],
        ["ゔぁ", "va"], ["ゔぃ", "vi"], ["ゔ", "vu"], ["ゔぇ", "ve"], ["ゔぉ", "vo"],
        ["あ", "a"], ["い", "i"], ["う", "u"], ["え", "e"], ["お", "o"],
        ["か", "ka"], ["き", "ki"], ["く", "ku"], ["け", "ke"], ["こ", "ko"],
        ["さ", "sa"], ["し", "shi"], ["す", "su"], ["せ", "se"], ["そ", "so"],
        ["た", "ta"], ["ち", "chi"], ["つ", "tsu"], ["て", "te"], ["と", "to"],
        ["な", "na"], ["に", "ni"], ["ぬ", "nu"], ["ね", "ne"], ["の", "no"],
        ["は", "ha"], ["ひ", "hi"], ["ふ", "fu"], ["へ", "he"], ["ほ", "ho"],
        ["ま", "ma"], ["み", "mi"], ["む", "mu"], ["め", "me"], ["も", "mo"],
        ["や", "ya"], ["ゆ", "yu"], ["よ", "yo"],
        ["ら", "ra"], ["り", "ri"], ["る", "ru"], ["れ", "re"], ["ろ", "ro"],
        ["わ", "wa"], ["を", "wo"], ["ん", "n"],
        ["が", "ga"], ["ぎ", "gi"], ["ぐ", "gu"], ["げ", "ge"], ["ご", "go"],
        ["ざ", "za"], ["じ", "ji"], ["ず", "zu"], ["ぜ", "ze"], ["ぞ", "zo"],
        ["だ", "da"], ["ぢ", "ji"], ["づ", "zu"], ["で", "de"], ["ど", "do"],
        ["ば", "ba"], ["び", "bi"], ["ぶ", "bu"], ["べ", "be"], ["ぼ", "bo"],
        ["ぱ", "pa"], ["ぴ", "pi"], ["ぷ", "pu"], ["ぺ", "pe"], ["ぽ", "po"]
    ]);
    function toHiragana(text) {
        return String(text || "").replace(/[\u30A1-\u30F6]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
    }
    function toKatakana(text) {
        return String(text || "").replace(/[\u3041-\u3096]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60));
    }
    function isKanaText(text) {
        return /^[\u3041-\u3096ー]+$/.test(text);
    }
    function kanaToRomaji(text) {
        const hiragana = toHiragana(text);
        if (!hiragana || !isKanaText(hiragana)) {
            return "";
        }
        let result = "";
        for (let index = 0; index < hiragana.length; index += 1) {
            const current = hiragana[index];
            const next = hiragana[index + 1] || "";
            const pair = current + next;
            if (current === "っ") {
                const nextPair = hiragana.slice(index + 1, index + 3);
                const nextRomaji = kanaToRomajiMap.get(nextPair) ||
                    kanaToRomajiMap.get(next) ||
                    "";
                if (nextRomaji) {
                    result += nextRomaji[0];
                }
                continue;
            }
            if (current === "ー") {
                const lastChar = result[result.length - 1] || "";
                if (/[aeiou]/.test(lastChar)) {
                    result += lastChar;
                }
                continue;
            }
            if (kanaToRomajiMap.has(pair)) {
                result += kanaToRomajiMap.get(pair);
                index += 1;
                continue;
            }
            if (kanaToRomajiMap.has(current)) {
                result += kanaToRomajiMap.get(current);
                continue;
            }
            return "";
        }
        return result;
    }
    function buildExpandedForms(token) {
        const tokens = new Set();
        const normalizedToken = String(token || "").toLowerCase().trim();
        if (!normalizedToken) {
            return [];
        }
        tokens.add(normalizedToken);
        for (const part of normalizedToken.split(/\s+/).filter(Boolean)) {
            tokens.add(part);
        }
        for (const current of Array.from(tokens)) {
            const hiragana = toHiragana(current);
            const katakana = toKatakana(current);
            const romaji = kanaToRomaji(current);
            if (hiragana !== current) {
                tokens.add(hiragana);
            }
            if (katakana !== current) {
                tokens.add(katakana);
            }
            if (romaji) {
                tokens.add(romaji);
            }
        }
        return Array.from(tokens);
    }
    function buildLabelTokens(definition) {
        const tokens = new Set();
        const label = (definition.label || "").toLowerCase().trim();
        if (!label) {
            return [];
        }
        tokens.add(label);
        for (const part of label.split(/\s+/).filter(Boolean)) {
            tokens.add(part);
        }
        return Array.from(tokens);
    }
    function buildKeywordTokens(definition) {
        const tokens = new Set();
        const keywords = Array.isArray(definition.keywords) ? definition.keywords : [];
        for (const keyword of keywords) {
            const normalizedKeyword = String(keyword || "").toLowerCase().trim();
            if (!normalizedKeyword) {
                continue;
            }
            tokens.add(normalizedKeyword);
            for (const part of normalizedKeyword.split(/\s+/).filter(Boolean)) {
                tokens.add(part);
            }
        }
        return Array.from(tokens);
    }
    function buildExpandedTokens(definition) {
        const tokens = new Set();
        for (const token of buildLabelTokens(definition)) {
            for (const expanded of buildExpandedForms(token)) {
                tokens.add(expanded);
            }
        }
        for (const token of buildKeywordTokens(definition)) {
            for (const expanded of buildExpandedForms(token)) {
                tokens.add(expanded);
            }
        }
        for (const token of buildLabelTokens(definition)) {
            tokens.delete(token);
        }
        for (const token of buildKeywordTokens(definition)) {
            tokens.delete(token);
        }
        return Array.from(tokens);
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
    function sortDefinitions(definitions) {
        return [...definitions].sort((left, right) => {
            if (left.label < right.label)
                return -1;
            if (left.label > right.label)
                return 1;
            return 0;
        });
    }
    function sortDefinitionsByScore(definitions, terms, tokenBuilder) {
        return [...definitions].sort((left, right) => {
            const rightScore = calculateMatchScore(tokenBuilder(right), terms);
            const leftScore = calculateMatchScore(tokenBuilder(left), terms);
            if (rightScore !== leftScore) {
                return rightScore - leftScore;
            }
            if (left.label < right.label)
                return -1;
            if (left.label > right.label)
                return 1;
            return 0;
        });
    }
    function mergeDefinitionGroups(groups) {
        const merged = [];
        const seenIds = new Set();
        for (const group of groups) {
            for (const definition of group) {
                if (seenIds.has(definition.id)) {
                    continue;
                }
                seenIds.add(definition.id);
                merged.push(definition);
            }
        }
        return merged;
    }
    function buildDisplayKeywords(definition) {
        const tokens = new Set();
        const label = (definition.label || "").trim();
        const keywords = Array.isArray(definition.keywords) ? definition.keywords : [];
        if (label) {
            tokens.add(label);
        }
        for (const keyword of keywords) {
            const normalizedKeyword = String(keyword || "").trim();
            if (!normalizedKeyword) {
                continue;
            }
            tokens.add(normalizedKeyword);
        }
        return Array.from(tokens);
    }
    function createCandidateButton(definition) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "md-chip-button";
        button.dataset.promptId = definition.id;
        button.addEventListener("click", () => {
            void selectPrompt(definition.id, button, { autoCopy: true });
        });
        const label = document.createElement("span");
        label.className = "md-chip-label";
        label.textContent = definition.label;
        button.appendChild(label);
        const help = document.createElement("lht-help-tooltip");
        help.setAttribute("label", "キーワード");
        help.setAttribute("placement", "bottom");
        help.innerHTML = buildDisplayKeywords(definition).join(", ");
        help.addEventListener("click", (event) => {
            event.stopPropagation();
        });
        help.addEventListener("mousedown", (event) => {
            event.stopPropagation();
        });
        button.appendChild(help);
        return button;
    }
    function revealOutputSection(options) {
        promptOutputSection.classList.remove("md-hidden");
        if (!(options === null || options === void 0 ? void 0 : options.scrollIntoView)) {
            return;
        }
        requestAnimationFrame(() => {
            promptOutputSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }
    async function copyText(text) {
        if (!text) {
            return false;
        }
        try {
            if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
                await navigator.clipboard.writeText(text);
            }
            else {
                const helper = document.createElement("textarea");
                helper.value = text;
                helper.setAttribute("readonly", "");
                helper.style.position = "fixed";
                helper.style.opacity = "0";
                document.body.appendChild(helper);
                helper.select();
                document.execCommand("copy");
                helper.remove();
            }
            if (typeof window.showToast === "function") {
                window.showToast("コピーしました");
            }
            return true;
        }
        catch (_error) {
            if (typeof window.showToast === "function") {
                window.showToast("コピーに失敗しました");
            }
            return false;
        }
    }
    function renderCandidates() {
        const query = (promptSearch.value || "").trim().toLowerCase();
        const queryChanged = query !== lastSearchQuery;
        lastSearchQuery = query;
        promptCandidateArea.innerHTML = "";
        if (queryChanged) {
            selectedPrompt = "";
            commitInputSection.classList.add("md-hidden");
            promptOutputSection.classList.add("md-hidden");
            commitIdInput.value = "";
            promptOutput.textContent = "";
        }
        const terms = query ? query.split(/\s+/).filter(Boolean) : [];
        const labelMatches = query
            ? sortDefinitions(promptDefinitions.filter((definition) => matchesAllTerms(buildLabelTokens(definition), terms)))
            : sortDefinitions(promptDefinitions);
        const keywordMatches = query
            ? sortDefinitionsByScore(promptDefinitions.filter((definition) => matchesAllTerms(buildKeywordTokens(definition), terms)), terms, buildKeywordTokens)
            : [];
        const expandedMatches = query
            ? sortDefinitionsByScore(promptDefinitions.filter((definition) => matchesAllTerms(buildExpandedTokens(definition), terms)), terms, buildExpandedTokens)
            : [];
        const matchedDefinitions = query
            ? mergeDefinitionGroups([labelMatches, keywordMatches, expandedMatches])
            : labelMatches;
        if (matchedDefinitions.length === 0) {
            if (selectedPrompt) {
                selectedPrompt = "";
                commitInputSection.classList.add("md-hidden");
                promptOutputSection.classList.add("md-hidden");
                updateOutput();
            }
            return;
        }
        const prioritizedSingleDefinition = labelMatches.length === 1
            ? labelMatches[0]
            : labelMatches.length === 0 && keywordMatches.length === 1
                ? keywordMatches[0]
                : labelMatches.length === 0 && keywordMatches.length === 0 && expandedMatches.length === 1
                    ? expandedMatches[0]
                    : null;
        if (prioritizedSingleDefinition) {
            selectedPrompt = prioritizedSingleDefinition.id;
        }
        else if (selectedPrompt &&
            !matchedDefinitions.some((definition) => definition.id === selectedPrompt)) {
            selectedPrompt = "";
        }
        for (const definition of matchedDefinitions) {
            const button = createCandidateButton(definition);
            if (prioritizedSingleDefinition && selectedPrompt === definition.id) {
                button.classList.add("is-active");
            }
            promptCandidateArea.appendChild(button);
        }
        if (prioritizedSingleDefinition && selectedPrompt === prioritizedSingleDefinition.id) {
            const selectedDefinition = prioritizedSingleDefinition;
            if (selectedDefinition.requiresCommitId) {
                commitInputSection.classList.remove("md-hidden");
            }
            else {
                commitInputSection.classList.add("md-hidden");
            }
            revealOutputSection({
                scrollIntoView: queryChanged && query.length > 0
            });
            updateOutput();
        }
    }
    async function selectPrompt(id, button, options) {
        selectedPrompt = id;
        for (const element of promptCandidateArea.querySelectorAll(".md-chip-button")) {
            element.classList.remove("is-active");
        }
        button.classList.add("is-active");
        revealOutputSection({ scrollIntoView: true });
        const selectedDefinition = promptDefinitions.find((definition) => definition.id === id);
        if (selectedDefinition === null || selectedDefinition === void 0 ? void 0 : selectedDefinition.requiresCommitId) {
            commitInputSection.classList.remove("md-hidden");
            commitIdInput.focus();
        }
        else {
            commitInputSection.classList.add("md-hidden");
        }
        updateOutput();
        if ((options === null || options === void 0 ? void 0 : options.autoCopy) && selectedDefinition && !selectedDefinition.requiresCommitId) {
            await copyText(promptOutput.textContent || "");
        }
    }
    function buildPromptText() {
        if (!selectedPrompt) {
            return "";
        }
        const selectedDefinition = promptDefinitions.find((definition) => definition.id === selectedPrompt);
        const label = selectedDefinition ? selectedDefinition.label : "";
        const commitId = (commitIdInput.value || "").trim();
        const body = selectedDefinition ? selectedDefinition.buildBody(commitId) : "";
        if (!body || !label) {
            return "";
        }
        return includeLabelPrefix.checked ? `[${label}] ${body}` : body;
    }
    function updateOutput() {
        const text = buildPromptText();
        promptOutput.textContent = text;
    }
    promptSearch.addEventListener("input", renderCandidates);
    commitIdInput.addEventListener("input", updateOutput);
    includeLabelPrefix.addEventListener("change", updateOutput);
    renderCandidates();
    updateOutput();
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePromptPage, { once: true });
}
else {
    initializePromptPage();
}
