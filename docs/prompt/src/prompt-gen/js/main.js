async function initializePromptPage() {
    const SERIES_VISIBILITY_STORAGE_KEY = "promptGenSeriesVisibility";
    const CUSTOM_PROMPT_STORAGE_KEY = "promptGenCustomPrompt";
    const CUSTOM_PROMPT_EXPORT_VERSION = 1;
    const defaultSeriesVisibilitySettings = {
        showA: true,
        showX: true,
        showS: true,
        showP: true
    };
    function decorateBasePromptDefinition(definition) {
        const label = String(definition.label || "");
        const labelMatch = label.match(/^(\d{3}):(.*)$/);
        if (!labelMatch) {
            return definition;
        }
        const labelCode = labelMatch[1];
        const labelSuffix = labelMatch[2] || "";
        const prefixedCode = `A${labelCode}`;
        const prefixedLabel = `${prefixedCode}:${labelSuffix}`;
        const nextKeywords = Array.isArray(definition.keywords) ? [...definition.keywords] : [];
        if (!nextKeywords.includes(prefixedCode)) {
            nextKeywords.unshift(prefixedCode);
        }
        return {
            ...definition,
            id: definition.id.startsWith("a-") ? definition.id : `a-${definition.id}`,
            label: prefixedLabel,
            keywords: nextKeywords
        };
    }
    const basePromptDefinitions = promptDefinitions.map(decorateBasePromptDefinition);
    const expansionDefinitions = Array.isArray(aiExpansionPromptDefinitions) ? aiExpansionPromptDefinitions : [];
    const suggestDefinitions = Array.isArray(aiSuggestPromptDefinitions) ? aiSuggestPromptDefinitions : [];
    const popularDefinitions = Array.isArray(popularPromptDefinitions) ? popularPromptDefinitions : [];
    if (window.customElements && window.customElements.whenDefined) {
        await window.customElements.whenDefined("lht-text-field-help");
        await window.customElements.whenDefined("lht-select-help");
    }
    async function waitForElementById(id, maxFrames = 4) {
        for (let index = 0; index < maxFrames; index += 1) {
            const element = document.getElementById(id);
            if (element) {
                return element;
            }
            await new Promise((resolve) => {
                requestAnimationFrame(() => resolve());
            });
        }
        return document.getElementById(id);
    }
    const promptSearch = document.getElementById("promptSearch");
    const promptCandidateArea = document.getElementById("promptCandidateArea");
    const promptArgsSection = document.getElementById("promptArgsSection");
    const promptArgsContainer = document.getElementById("promptArgsContainer");
    const promptOutputSection = document.getElementById("promptOutputSection");
    const promptOutputTitle = document.getElementById("promptOutputTitle");
    const promptOutputHelp = document.getElementById("promptOutputHelp");
    const gitPseudoSquashLink = document.getElementById("gitPseudoSquashLink");
    const outputTone = document.getElementById("outputTone") ||
        (await waitForElementById("outputTone"));
    const selfReview = document.getElementById("selfReview") ||
        (await waitForElementById("selfReview"));
    const minimalDiffReview = document.getElementById("minimalDiffReview") ||
        (await waitForElementById("minimalDiffReview"));
    const misleadingExpressionReview = document.getElementById("misleadingExpressionReview") ||
        (await waitForElementById("misleadingExpressionReview"));
    const considerationRiskReview = document.getElementById("considerationRiskReview") ||
        (await waitForElementById("considerationRiskReview"));
    const discomfortRiskReview = document.getElementById("discomfortRiskReview") ||
        (await waitForElementById("discomfortRiskReview"));
    const aggressiveExpressionReview = document.getElementById("aggressiveExpressionReview") ||
        (await waitForElementById("aggressiveExpressionReview"));
    const sensitiveExpressionReview = document.getElementById("sensitiveExpressionReview") ||
        (await waitForElementById("sensitiveExpressionReview"));
    const legalComplianceReview = document.getElementById("legalComplianceReview") ||
        (await waitForElementById("legalComplianceReview"));
    const publicOrderReview = document.getElementById("publicOrderReview") ||
        (await waitForElementById("publicOrderReview"));
    const hallucinationGuard = document.getElementById("hallucinationGuard") ||
        (await waitForElementById("hallucinationGuard"));
    const outputMarkdown = document.getElementById("outputMarkdown");
    const customPromptImportInput = document.getElementById("customPromptImportInput");
    const copyShareLinkButton = document.getElementById("copyShareLinkButton");
    const promptOutput = document.getElementById("promptOutput");
    if (!promptSearch || !outputTone || !selfReview || !minimalDiffReview || !misleadingExpressionReview || !considerationRiskReview || !discomfortRiskReview || !aggressiveExpressionReview || !sensitiveExpressionReview || !legalComplianceReview || !publicOrderReview || !hallucinationGuard || !outputMarkdown || !customPromptImportInput || !copyShareLinkButton || !promptOutput || !promptCandidateArea || !promptArgsSection || !promptArgsContainer || !promptOutputSection || !promptOutputTitle || !promptOutputHelp) {
        return;
    }
    function loadSeriesVisibilitySettings() {
        try {
            const storage = window.localStorage;
            if (!storage || typeof storage.getItem !== "function") {
                return { ...defaultSeriesVisibilitySettings };
            }
            const raw = storage.getItem(SERIES_VISIBILITY_STORAGE_KEY);
            if (!raw) {
                return { ...defaultSeriesVisibilitySettings };
            }
            const parsed = JSON.parse(raw);
            return {
                showA: (parsed === null || parsed === void 0 ? void 0 : parsed.showA) !== false,
                showX: (parsed === null || parsed === void 0 ? void 0 : parsed.showX) !== false,
                showS: (parsed === null || parsed === void 0 ? void 0 : parsed.showS) !== false,
                showP: (parsed === null || parsed === void 0 ? void 0 : parsed.showP) !== false
            };
        }
        catch (_error) {
            return { ...defaultSeriesVisibilitySettings };
        }
    }
    function saveSeriesVisibilitySettings(settings) {
        const storage = window.localStorage;
        if (!storage || typeof storage.setItem !== "function") {
            return;
        }
        storage.setItem(SERIES_VISIBILITY_STORAGE_KEY, JSON.stringify(settings));
    }
    function clearSeriesVisibilitySettings() {
        const storage = window.localStorage;
        if (!storage || typeof storage.removeItem !== "function") {
            return;
        }
        storage.removeItem(SERIES_VISIBILITY_STORAGE_KEY);
    }
    function loadImportedCustomPrompt() {
        try {
            const storage = window.localStorage;
            if (!storage || typeof storage.getItem !== "function") {
                return null;
            }
            const raw = storage.getItem(CUSTOM_PROMPT_STORAGE_KEY);
            if (!raw) {
                return null;
            }
            const parsed = JSON.parse(raw);
            if (typeof (parsed === null || parsed === void 0 ? void 0 : parsed.promptText) !== "string" || !parsed.promptText.trim()) {
                return null;
            }
            const normalizedKeywords = Array.isArray(parsed === null || parsed === void 0 ? void 0 : parsed.keywords)
                ? parsed.keywords.map((keyword) => String(keyword || "").trim()).filter(Boolean)
                : [];
            return {
                id: typeof (parsed === null || parsed === void 0 ? void 0 : parsed.id) === "string" && parsed.id.trim() ? parsed.id.trim() : "custom-imported-prompt",
                label: typeof (parsed === null || parsed === void 0 ? void 0 : parsed.label) === "string" && parsed.label.trim()
                    ? parsed.label.trim()
                    : typeof (parsed === null || parsed === void 0 ? void 0 : parsed.promptName) === "string" && parsed.promptName.trim()
                        ? parsed.promptName.trim()
                        : "カスタムプロンプト",
                keywords: normalizedKeywords,
                promptText: parsed.promptText.trim()
            };
        }
        catch (_error) {
            return null;
        }
    }
    function saveImportedCustomPrompt(prompt) {
        const storage = window.localStorage;
        if (!storage || typeof storage.setItem !== "function") {
            return;
        }
        storage.setItem(CUSTOM_PROMPT_STORAGE_KEY, JSON.stringify(prompt));
    }
    function clearImportedCustomPromptStorage() {
        const storage = window.localStorage;
        if (!storage || typeof storage.removeItem !== "function") {
            return;
        }
        storage.removeItem(CUSTOM_PROMPT_STORAGE_KEY);
    }
    let seriesVisibilitySettings = loadSeriesVisibilitySettings();
    function getLegacyPromptArguments(definition) {
        const args = [];
        if (definition.requiresCommitId) {
            args.push({
                id: "commitId",
                label: "コミットID",
                required: true,
                placeholder: "例: abc1234",
                helpText: "PR 文面の作成対象にしたいコミット ID を入力します。短縮 SHA でも構いません。",
                inputMode: "latin"
            });
        }
        if (definition.requiresSubject) {
            args.push({
                id: "subject",
                label: definition.subjectLabel || "subject",
                required: true,
                placeholder: definition.subjectPlaceholder || "例: a small fox",
                helpText: definition.subjectHelpText || "プロンプト内の [subject] に差し込む対象を入力します。英語でも日本語でも構いません。",
                defaultValue: definition.subjectDefaultValue,
                inputMode: "text"
            });
        }
        return args;
    }
    function normalizePromptDefinition(definition) {
        return {
            ...definition,
            args: Array.isArray(definition.args) ? definition.args : getLegacyPromptArguments(definition)
        };
    }
    function createCustomPromptDefinition(prompt) {
        if (!prompt || !prompt.promptText.trim()) {
            return null;
        }
        return normalizePromptDefinition({
            id: prompt.id,
            label: prompt.label,
            keywords: prompt.keywords,
            buildBody: () => prompt.promptText
        });
    }
    function getVisiblePromptDefinitions() {
        const customPromptDefinition = createCustomPromptDefinition(customPromptState);
        return [
            ...(customPromptDefinition ? [customPromptDefinition] : []),
            ...(seriesVisibilitySettings.showA ? basePromptDefinitions : []),
            ...(seriesVisibilitySettings.showX ? expansionDefinitions : []),
            ...(seriesVisibilitySettings.showS ? suggestDefinitions : []),
            ...(seriesVisibilitySettings.showP ? popularDefinitions : [])
        ].map(normalizePromptDefinition);
    }
    let visiblePromptDefinitions = [];
    let promptSearchIndexes = [];
    let promptSearchIndexById = new Map();
    function applyLatinInputHints(field, enterKeyHint) {
        field.setAttribute("inputmode", "latin");
        field.setAttribute("lang", "en");
        field.setAttribute("autocapitalize", "off");
        field.setAttribute("autocorrect", "off");
        field.setAttribute("spellcheck", "false");
        field.style.imeMode = "inactive";
        if (enterKeyHint) {
            field.setAttribute("enterkeyhint", enterKeyHint);
        }
    }
    applyLatinInputHints(promptSearch, "search");
    const MAX_EMBED_INPUT_LENGTH = 1024;
    let activeArgumentDefinitions = [];
    let promptArgumentInputs = new Map();
    function sanitizePromptVariableInput(value) {
        const normalizedWhitespace = String(value || "")
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
            .replace(/[\u200B-\u200D\u2060\uFEFF]/g, " ");
        const trimmedValue = normalizedWhitespace.trim();
        if (!trimmedValue) {
            return "";
        }
        const truncatedValue = trimmedValue.slice(0, MAX_EMBED_INPUT_LENGTH);
        const normalizedQuotes = truncatedValue.replace(/`/g, "'");
        return `\`${normalizedQuotes}\``;
    }
    function handleArgumentInput() {
        updateOutput();
    }
    function getSelectedPromptArguments(definition) {
        return Array.isArray(definition === null || definition === void 0 ? void 0 : definition.args) ? definition.args : [];
    }
    function getArgumentInput(argumentId) {
        return promptArgumentInputs.get(argumentId) || null;
    }
    function getArgumentDomId(argumentId) {
        if (argumentId === "subject") {
            return "subjectInput";
        }
        return argumentId;
    }
    function getArgumentValue(argumentId) {
        var _a;
        return ((_a = getArgumentInput(argumentId)) === null || _a === void 0 ? void 0 : _a.value) || "";
    }
    function getArgumentQueryParamName(argumentId) {
        if (argumentId === "commitId") {
            return "commit";
        }
        if (argumentId === "subject") {
            return "subject";
        }
        return `arg_${argumentId}`;
    }
    function getPromptArgumentValues() {
        const values = {};
        for (const argumentDefinition of activeArgumentDefinitions) {
            values[argumentDefinition.id] = getArgumentValue(argumentDefinition.id);
        }
        return values;
    }
    function setPromptArgumentValues(values) {
        for (const argumentDefinition of activeArgumentDefinitions) {
            const input = getArgumentInput(argumentDefinition.id);
            if (!input) {
                continue;
            }
            input.value = values[argumentDefinition.id] || "";
        }
    }
    function refreshArgumentInputReferences(definition) {
        promptArgumentInputs = new Map();
        for (const argumentDefinition of getSelectedPromptArguments(definition)) {
            const input = document.getElementById(getArgumentDomId(argumentDefinition.id));
            if (!input) {
                continue;
            }
            promptArgumentInputs.set(argumentDefinition.id, input);
            input.addEventListener("input", handleArgumentInput);
            if (argumentDefinition.inputMode === "latin") {
                applyLatinInputHints(input, "done");
            }
        }
    }
    function renderArgumentFields(definition) {
        const currentValues = getPromptArgumentValues();
        activeArgumentDefinitions = getSelectedPromptArguments(definition).map((argumentDefinition) => ({ ...argumentDefinition }));
        promptArgsContainer.innerHTML = "";
        for (const argumentDefinition of activeArgumentDefinitions) {
            const field = document.createElement("lht-text-field-help");
            field.id = `${getArgumentDomId(argumentDefinition.id)}Field`;
            field.setAttribute("field-id", getArgumentDomId(argumentDefinition.id));
            field.setAttribute("label", argumentDefinition.label);
            if (argumentDefinition.placeholder) {
                field.setAttribute("placeholder", argumentDefinition.placeholder);
            }
            if (argumentDefinition.helpText) {
                field.setAttribute("help-text", argumentDefinition.helpText);
            }
            if (argumentDefinition.required !== false) {
                field.setAttribute("required", "");
            }
            promptArgsContainer.appendChild(field);
        }
        refreshArgumentInputReferences(definition);
        setPromptArgumentValues(currentValues);
    }
    function applyDefaultArgumentValues(selectedDefinition) {
        if (!selectedDefinition) {
            return;
        }
        for (const argumentDefinition of getSelectedPromptArguments(selectedDefinition)) {
            const input = getArgumentInput(argumentDefinition.id);
            if (!input) {
                continue;
            }
            if ((input.value || "").trim()) {
                continue;
            }
            if (!argumentDefinition.defaultValue) {
                continue;
            }
            input.value = argumentDefinition.defaultValue;
        }
    }
    function syncInputSections(selectedDefinition) {
        if (getSelectedPromptArguments(selectedDefinition).length > 0) {
            promptArgsSection.classList.remove("md-hidden");
        }
        else {
            promptArgsSection.classList.add("md-hidden");
        }
    }
    let selectedPrompt = "";
    let lastSearchQuery = "";
    let pendingInitialPromptCode = "";
    let pendingInitialPromptId = "";
    let suppressSearchResetOnce = false;
    let customPromptState = loadImportedCustomPrompt();
    const promptOutputOptionDefaultsById = new Map();
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
    function buildExpandedTokensFromBaseTokens(labelTokens, keywordTokens) {
        const tokens = new Set();
        for (const token of labelTokens) {
            for (const expanded of buildExpandedForms(token)) {
                tokens.add(expanded);
            }
        }
        for (const token of keywordTokens) {
            for (const expanded of buildExpandedForms(token)) {
                tokens.add(expanded);
            }
        }
        for (const token of labelTokens) {
            tokens.delete(token);
        }
        for (const token of keywordTokens) {
            tokens.delete(token);
        }
        return Array.from(tokens);
    }
    function buildExpandedTokens(definition) {
        return buildExpandedTokensFromBaseTokens(buildLabelTokens(definition), buildKeywordTokens(definition));
    }
    function buildSearchIndex(definition) {
        const labelTokens = buildLabelTokens(definition);
        const keywordTokens = buildKeywordTokens(definition);
        return {
            definition,
            labelTokens,
            keywordTokens,
            expandedTokens: buildExpandedTokensFromBaseTokens(labelTokens, keywordTokens)
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
    function searchPromptDefinitions(query, searchIndexes, searchIndexById) {
        const terms = query ? query.split(/\s+/).filter(Boolean) : [];
        const labelMatches = query
            ? sortDefinitions(searchIndexes
                .filter((searchIndex) => matchesAllTerms(searchIndex.labelTokens, terms))
                .map((searchIndex) => searchIndex.definition))
            : sortDefinitions(searchIndexes.map((searchIndex) => searchIndex.definition));
        const keywordMatches = query
            ? sortDefinitionsByScore(searchIndexes
                .filter((searchIndex) => matchesAllTerms(searchIndex.keywordTokens, terms))
                .map((searchIndex) => searchIndex.definition), terms, (definition) => {
                const searchIndex = searchIndexById.get(definition.id);
                return searchIndex ? searchIndex.keywordTokens : [];
            })
            : [];
        const expandedMatches = query
            ? sortDefinitionsByScore(searchIndexes
                .filter((searchIndex) => matchesAllTerms(searchIndex.expandedTokens, terms))
                .map((searchIndex) => searchIndex.definition), terms, (definition) => {
                const searchIndex = searchIndexById.get(definition.id);
                return searchIndex ? searchIndex.expandedTokens : [];
            })
            : [];
        const matchedDefinitions = query
            ? mergeDefinitionGroups([labelMatches, keywordMatches, expandedMatches])
            : labelMatches;
        const definitionMatchGrades = new Map();
        for (const definition of expandedMatches) {
            definitionMatchGrades.set(definition.id, "weak");
        }
        for (const definition of keywordMatches) {
            definitionMatchGrades.set(definition.id, "medium");
        }
        for (const definition of labelMatches) {
            definitionMatchGrades.set(definition.id, "strong");
        }
        if (!query) {
            for (const definition of matchedDefinitions) {
                definitionMatchGrades.set(definition.id, "medium");
            }
        }
        const prioritizedSingleDefinition = labelMatches.length === 1
            ? labelMatches[0]
            : labelMatches.length === 0 && keywordMatches.length === 1
                ? keywordMatches[0]
                : labelMatches.length === 0 && keywordMatches.length === 0 && expandedMatches.length === 1
                    ? expandedMatches[0]
                    : null;
        return {
            definitionMatchGrades,
            matchedDefinitions,
            prioritizedSingleDefinition
        };
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
    function rebuildVisiblePromptIndexes() {
        visiblePromptDefinitions = getVisiblePromptDefinitions();
        promptSearchIndexes = visiblePromptDefinitions.map(buildSearchIndex);
        promptSearchIndexById = new Map(promptSearchIndexes.map((searchIndex) => [searchIndex.definition.id, searchIndex]));
    }
    rebuildVisiblePromptIndexes();
    function createCandidateButton(definition, grade) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "md-chip-button";
        button.dataset.promptId = definition.id;
        button.dataset.matchGrade = grade;
        button.classList.add(`md-chip-button--${grade}`);
        button.addEventListener("click", () => {
            void selectPrompt(definition.id, button, { autoCopy: true });
        });
        const label = document.createElement("span");
        label.className = "md-chip-label";
        label.textContent = definition.label;
        button.appendChild(label);
        return button;
    }
    function getSelectedPromptDefinition() {
        if (!selectedPrompt) {
            return null;
        }
        return visiblePromptDefinitions.find((definition) => definition.id === selectedPrompt) || null;
    }
    function getPromptOutputOptions() {
        return {
            hallucinationGuardLevel: (hallucinationGuard.value || "none"),
            outputMarkdownEnabled: outputMarkdown.checked,
            outputTone: (outputTone.value || "unspecified"),
            selfReview: (selfReview.value || "unspecified"),
            minimalDiffReview: (minimalDiffReview.value || "unspecified"),
            misleadingExpressionReview: (misleadingExpressionReview.value || "unspecified"),
            considerationRiskReview: (considerationRiskReview.value || "unspecified"),
            discomfortRiskReview: (discomfortRiskReview.value || "unspecified"),
            aggressiveExpressionReview: (aggressiveExpressionReview.value || "unspecified"),
            sensitiveExpressionReview: (sensitiveExpressionReview.value || "unspecified"),
            legalComplianceReview: (legalComplianceReview.value || "unspecified"),
            publicOrderReview: (publicOrderReview.value || "unspecified")
        };
    }
    function inferPromptOutputOptionDefaults(definition) {
        if (!definition) {
            return {
                hallucinationGuard: "none",
                outputMarkdown: false,
                outputTone: "unspecified",
                selfReview: "unspecified",
                minimalDiffReview: "unspecified",
                misleadingExpressionReview: "unspecified",
                considerationRiskReview: "unspecified",
                discomfortRiskReview: "unspecified",
                aggressiveExpressionReview: "unspecified",
                sensitiveExpressionReview: "unspecified",
                legalComplianceReview: "unspecified",
                publicOrderReview: "unspecified"
            };
        }
        if (definition.preserveOutputInstructions) {
            const preservedDefaults = {
                hallucinationGuard: "none",
                outputMarkdown: false,
                outputTone: "unspecified",
                selfReview: "unspecified",
                minimalDiffReview: "unspecified",
                misleadingExpressionReview: "unspecified",
                considerationRiskReview: "unspecified",
                discomfortRiskReview: "unspecified",
                aggressiveExpressionReview: "unspecified",
                sensitiveExpressionReview: "unspecified",
                legalComplianceReview: "unspecified",
                publicOrderReview: "unspecified"
            };
            promptOutputOptionDefaultsById.set(definition.id, preservedDefaults);
            return preservedDefaults;
        }
        const cached = promptOutputOptionDefaultsById.get(definition.id);
        if (cached) {
            return cached;
        }
        if (typeof definition.hallucinationGuard === "string" || typeof definition.hallucinationGuard === "boolean" || typeof definition.outputMarkdown === "boolean") {
            const explicitDefaults = {
                hallucinationGuard: typeof definition.hallucinationGuard === "string"
                    ? definition.hallucinationGuard
                    : definition.hallucinationGuard === true
                        ? "high"
                        : "none",
                outputMarkdown: definition.outputMarkdown === true,
                outputTone: "unspecified",
                selfReview: "unspecified",
                minimalDiffReview: "unspecified",
                misleadingExpressionReview: "unspecified",
                considerationRiskReview: "unspecified",
                discomfortRiskReview: "unspecified",
                aggressiveExpressionReview: "unspecified",
                sensitiveExpressionReview: "unspecified",
                legalComplianceReview: "unspecified",
                publicOrderReview: "unspecified"
            };
            promptOutputOptionDefaultsById.set(definition.id, explicitDefaults);
            return explicitDefaults;
        }
        const originalOptions = getPromptOutputOptions();
        setPromptOutputOptions({
            hallucinationGuardLevel: "high",
            outputMarkdownEnabled: true,
            outputTone: "unspecified",
            selfReview: "unspecified",
            minimalDiffReview: "unspecified",
            misleadingExpressionReview: "unspecified",
            considerationRiskReview: "unspecified",
            discomfortRiskReview: "unspecified",
            aggressiveExpressionReview: "unspecified",
            sensitiveExpressionReview: "unspecified",
            legalComplianceReview: "unspecified",
            publicOrderReview: "unspecified"
        });
        const argsForInference = {};
        for (const argumentDefinition of getSelectedPromptArguments(definition)) {
            const rawValue = getArgumentValue(argumentDefinition.id) || argumentDefinition.defaultValue || `dummy-${argumentDefinition.id}`;
            argsForInference[argumentDefinition.id] = rawValue;
        }
        const body = definition.buildBody(sanitizePromptVariableInput(argsForInference.commitId || ""), sanitizePromptVariableInput(argsForInference.subject || ""));
        setPromptOutputOptions(originalOptions);
        const instructionProfile = inferPromptOutputInstructionProfile(body);
        const defaults = {
            hallucinationGuard: instructionProfile.hallucinationGuardMode,
            outputMarkdown: instructionProfile.outputMarkdown,
            outputTone: instructionProfile.outputTone,
            selfReview: instructionProfile.selfReview,
            minimalDiffReview: instructionProfile.minimalDiffReview,
            misleadingExpressionReview: instructionProfile.misleadingExpressionReview,
            considerationRiskReview: instructionProfile.considerationRiskReview,
            discomfortRiskReview: instructionProfile.discomfortRiskReview,
            aggressiveExpressionReview: instructionProfile.aggressiveExpressionReview,
            sensitiveExpressionReview: instructionProfile.sensitiveExpressionReview,
            legalComplianceReview: instructionProfile.legalComplianceReview,
            publicOrderReview: instructionProfile.publicOrderReview
        };
        promptOutputOptionDefaultsById.set(definition.id, defaults);
        return defaults;
    }
    function applyPromptOutputOptionDefaults(definition) {
        const defaults = inferPromptOutputOptionDefaults(definition);
        hallucinationGuard.value = defaults.hallucinationGuard;
        outputMarkdown.checked = defaults.outputMarkdown;
        outputTone.value = defaults.outputTone;
        selfReview.value = defaults.selfReview;
        minimalDiffReview.value = defaults.minimalDiffReview;
        misleadingExpressionReview.value = defaults.misleadingExpressionReview;
        considerationRiskReview.value = defaults.considerationRiskReview;
        discomfortRiskReview.value = defaults.discomfortRiskReview;
        aggressiveExpressionReview.value = defaults.aggressiveExpressionReview;
        sensitiveExpressionReview.value = defaults.sensitiveExpressionReview;
        legalComplianceReview.value = defaults.legalComplianceReview;
        publicOrderReview.value = defaults.publicOrderReview;
    }
    function renderSelectedPromptHelp() {
        const selectedDefinition = getSelectedPromptDefinition();
        promptOutputHelp.innerHTML = "";
        gitPseudoSquashLink === null || gitPseudoSquashLink === void 0 ? void 0 : gitPseudoSquashLink.classList.add("md-hidden");
        if (!selectedDefinition) {
            promptOutputTitle.textContent = "生成結果";
            return;
        }
        promptOutputTitle.textContent = selectedDefinition.label;
        if (getDefinitionLabelCode(selectedDefinition) === "A501") {
            gitPseudoSquashLink === null || gitPseudoSquashLink === void 0 ? void 0 : gitPseudoSquashLink.classList.remove("md-hidden");
        }
        const help = document.createElement("lht-help-tooltip");
        help.setAttribute("label", "キーワード");
        help.setAttribute("placement", "right");
        help.innerHTML = buildDisplayKeywords(selectedDefinition).join(", ");
        promptOutputHelp.appendChild(help);
    }
    function revealOutputSection() {
        promptOutputSection.classList.remove("md-hidden");
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
            if (suppressSearchResetOnce) {
                suppressSearchResetOnce = false;
            }
            else {
                selectedPrompt = "";
                syncInputSections(null);
                renderArgumentFields(null);
                promptOutputSection.classList.add("md-hidden");
                applyPromptOutputOptionDefaults(null);
                promptOutput.textContent = "";
            }
        }
        const { definitionMatchGrades, matchedDefinitions, prioritizedSingleDefinition } = searchPromptDefinitions(query, promptSearchIndexes, promptSearchIndexById);
        if (pendingInitialPromptId) {
            const pendingDefinition = matchedDefinitions.find((definition) => definition.id === pendingInitialPromptId);
            if (pendingDefinition) {
                selectedPrompt = pendingDefinition.id;
            }
            pendingInitialPromptId = "";
        }
        else if (pendingInitialPromptCode) {
            const pendingDefinition = matchedDefinitions.find((definition) => getDefinitionLabelCode(definition) === pendingInitialPromptCode);
            if (pendingDefinition) {
                selectedPrompt = pendingDefinition.id;
            }
            pendingInitialPromptCode = "";
        }
        if (matchedDefinitions.length === 0) {
            if (selectedPrompt) {
                selectedPrompt = "";
                promptArgsSection.classList.add("md-hidden");
                promptOutputSection.classList.add("md-hidden");
                updateOutput();
            }
            return;
        }
        if (prioritizedSingleDefinition) {
            selectedPrompt = prioritizedSingleDefinition.id;
        }
        else if (selectedPrompt &&
            !matchedDefinitions.some((definition) => definition.id === selectedPrompt)) {
            selectedPrompt = "";
        }
        for (const definition of matchedDefinitions) {
            const button = createCandidateButton(definition, definitionMatchGrades.get(definition.id) || "weak");
            if (selectedPrompt === definition.id) {
                button.classList.add("is-active");
            }
            promptCandidateArea.appendChild(button);
        }
        const selectedDefinition = matchedDefinitions.find((definition) => definition.id === selectedPrompt) || null;
        if (selectedDefinition) {
            const selectedButton = promptCandidateArea.querySelector(`[data-prompt-id="${selectedDefinition.id}"]`);
            if (selectedButton) {
                selectedButton.classList.add("is-active");
            }
            renderArgumentFields(selectedDefinition);
            syncInputSections(selectedDefinition);
            applyDefaultArgumentValues(selectedDefinition);
            applyPromptOutputOptionDefaults(selectedDefinition);
            revealOutputSection();
            updateOutput();
        }
    }
    async function selectPrompt(id, button, options) {
        var _a;
        selectedPrompt = id;
        for (const element of promptCandidateArea.querySelectorAll(".md-chip-button")) {
            element.classList.remove("is-active");
        }
        button.classList.add("is-active");
        revealOutputSection();
        const selectedDefinition = visiblePromptDefinitions.find((definition) => definition.id === id);
        if (selectedDefinition && !(promptSearch.value || "").trim()) {
            const searchSeed = getDefinitionSearchSeed(selectedDefinition);
            if (searchSeed) {
                suppressSearchResetOnce = true;
                promptSearch.value = searchSeed;
                promptSearch.dispatchEvent(new Event("input"));
            }
        }
        syncInputSections(selectedDefinition || null);
        renderArgumentFields(selectedDefinition || null);
        applyDefaultArgumentValues(selectedDefinition || null);
        applyPromptOutputOptionDefaults(selectedDefinition || null);
        const firstArgument = getSelectedPromptArguments(selectedDefinition || null)[0];
        if (firstArgument) {
            (_a = getArgumentInput(firstArgument.id)) === null || _a === void 0 ? void 0 : _a.focus();
        }
        updateOutput();
        if ((options === null || options === void 0 ? void 0 : options.autoCopy) && selectedDefinition && getSelectedPromptArguments(selectedDefinition).length === 0) {
            await copyText(promptOutput.textContent || "");
        }
    }
    function buildPromptText() {
        const selectedDefinition = getSelectedPromptDefinition();
        if (!selectedDefinition) {
            return "";
        }
        const argumentValues = getPromptArgumentValues();
        const commitId = sanitizePromptVariableInput(argumentValues.commitId || "");
        const subject = sanitizePromptVariableInput(argumentValues.subject || "");
        const currentOptions = getPromptOutputOptions();
        setPromptOutputOptions({
            hallucinationGuardLevel: "high",
            outputMarkdownEnabled: true,
            outputTone: "unspecified",
            selfReview: "unspecified",
            misleadingExpressionReview: "unspecified",
            considerationRiskReview: "unspecified",
            discomfortRiskReview: "unspecified",
            aggressiveExpressionReview: "unspecified",
            sensitiveExpressionReview: "unspecified",
            legalComplianceReview: "unspecified",
            publicOrderReview: "unspecified"
        });
        const rawBody = customPromptState && selectedDefinition.id === customPromptState.id
            ? customPromptState.promptText
            : selectedDefinition
                ? selectedDefinition.buildBody(commitId, subject)
                : "";
        setPromptOutputOptions(currentOptions);
        if (selectedDefinition.preserveOutputInstructions) {
            const body = appendPromptOutputInstructions(rawBody, currentOptions, "high");
            return body ? body.trim().replace(/\n{3,}/g, "\n\n") : "";
        }
        const instructionProfile = inferPromptOutputInstructionProfile(rawBody);
        const body = appendPromptOutputInstructions(stripPromptOutputInstructions(rawBody), currentOptions, instructionProfile.hallucinationGuardMode || "high");
        if (!body) {
            return "";
        }
        return body.trim().replace(/\n{3,}/g, "\n\n");
    }
    function getDefinitionLabelCode(definition) {
        const label = String((definition === null || definition === void 0 ? void 0 : definition.label) || "");
        const match = label.match(/^([^:]+):/);
        return match ? match[1] : "";
    }
    function getDefinitionSearchSeed(definition) {
        const labelCode = getDefinitionLabelCode(definition);
        const match = labelCode.match(/^[A-Z](\d+)/);
        return match ? match[1] : "";
    }
    function buildShareLink() {
        const url = new URL(window.location.href);
        url.search = "";
        const query = (promptSearch.value || "").trim();
        const selectedDefinition = getSelectedPromptDefinition();
        const selectedDefinitionCode = getDefinitionLabelCode(selectedDefinition);
        if (query) {
            url.searchParams.set("q", query);
        }
        if (selectedDefinition === null || selectedDefinition === void 0 ? void 0 : selectedDefinition.id) {
            url.searchParams.set("promptId", selectedDefinition.id);
        }
        if (selectedDefinitionCode) {
            url.searchParams.set("id", selectedDefinitionCode);
        }
        for (const argumentDefinition of activeArgumentDefinitions) {
            const value = getArgumentValue(argumentDefinition.id);
            if (!value) {
                continue;
            }
            url.searchParams.set(getArgumentQueryParamName(argumentDefinition.id), value);
        }
        return url.toString();
    }
    function updateOutput() {
        renderSelectedPromptHelp();
        const text = buildPromptText();
        promptOutput.textContent = text;
    }
    function createSamplePageStateExportPayload() {
        return {
            version: CUSTOM_PROMPT_EXPORT_VERSION,
            exportedAt: new Date().toISOString(),
            isSample: true,
            note: "0件だったためサンプルを出力",
            state: {
                query: "",
                selectedPromptId: "custom-sample-prompt",
                selectedPromptCode: "",
                argumentValues: {},
                outputOptions: {
                    hallucinationGuardLevel: "none",
                    outputMarkdownEnabled: false,
                    outputTone: "unspecified",
                    selfReview: "unspecified",
                    minimalDiffReview: "unspecified",
                    misleadingExpressionReview: "unspecified",
                    considerationRiskReview: "unspecified",
                    discomfortRiskReview: "unspecified",
                    aggressiveExpressionReview: "unspecified",
                    sensitiveExpressionReview: "unspecified",
                    legalComplianceReview: "unspecified",
                    publicOrderReview: "unspecified"
                },
                seriesVisibilitySettings: { ...defaultSeriesVisibilitySettings },
                customPrompt: {
                    id: "custom-sample-prompt",
                    label: "サンプル",
                    keywords: ["sample", "summary", "要約"],
                    promptText: "以下の文章を、要点がひと目で分かるように3点で要約してください。専門用語はできるだけ平易な表現に言い換えてください。"
                }
            }
        };
    }
    function setPromptOutputOptions(options) {
        hallucinationGuard.value = options.hallucinationGuardLevel;
        outputMarkdown.checked = options.outputMarkdownEnabled;
        outputTone.value = options.outputTone;
        selfReview.value = options.selfReview;
        minimalDiffReview.value = options.minimalDiffReview;
        misleadingExpressionReview.value = options.misleadingExpressionReview;
        considerationRiskReview.value = options.considerationRiskReview;
        discomfortRiskReview.value = options.discomfortRiskReview;
        aggressiveExpressionReview.value = options.aggressiveExpressionReview;
        sensitiveExpressionReview.value = options.sensitiveExpressionReview;
        legalComplianceReview.value = options.legalComplianceReview;
        publicOrderReview.value = options.publicOrderReview;
    }
    function createPageStateExportPayload() {
        const currentState = {
            version: CUSTOM_PROMPT_EXPORT_VERSION,
            exportedAt: new Date().toISOString(),
            isSample: false,
            state: {
                query: (promptSearch.value || "").trim(),
                selectedPromptId: selectedPrompt || "",
                selectedPromptCode: getDefinitionLabelCode(getSelectedPromptDefinition()),
                argumentValues: getPromptArgumentValues(),
                outputOptions: getPromptOutputOptions(),
                seriesVisibilitySettings: { ...seriesVisibilitySettings },
                customPrompt: customPromptState ? { ...customPromptState } : null
            }
        };
        const hasMeaningfulState = currentState.state.query ||
            currentState.state.selectedPromptId ||
            Object.values(currentState.state.argumentValues).some((value) => String(value || "").trim()) ||
            currentState.state.customPrompt ||
            currentState.state.outputOptions.hallucinationGuardLevel !== "none" ||
            currentState.state.outputOptions.outputMarkdownEnabled ||
            currentState.state.outputOptions.outputTone !== "unspecified" ||
            currentState.state.outputOptions.selfReview !== "unspecified" ||
            currentState.state.outputOptions.minimalDiffReview !== "unspecified" ||
            currentState.state.outputOptions.misleadingExpressionReview !== "unspecified" ||
            currentState.state.outputOptions.considerationRiskReview !== "unspecified" ||
            currentState.state.outputOptions.discomfortRiskReview !== "unspecified" ||
            currentState.state.outputOptions.aggressiveExpressionReview !== "unspecified" ||
            currentState.state.outputOptions.sensitiveExpressionReview !== "unspecified" ||
            currentState.state.outputOptions.legalComplianceReview !== "unspecified" ||
            currentState.state.outputOptions.publicOrderReview !== "unspecified" ||
            JSON.stringify(currentState.state.seriesVisibilitySettings) !== JSON.stringify(defaultSeriesVisibilitySettings);
        if (!hasMeaningfulState) {
            return createSamplePageStateExportPayload();
        }
        return currentState;
    }
    function buildCustomPromptExportFilename() {
        const now = new Date();
        const yyyy = String(now.getFullYear());
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const mi = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");
        return `prompt-gen-export-${yyyy}${mm}${dd}-${hh}${mi}${ss}.json`;
    }
    function downloadTextFile(text, filename, contentType) {
        const blob = new Blob([text], { type: contentType });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.setTimeout(() => {
            URL.revokeObjectURL(objectUrl);
        }, 0);
    }
    function normalizeImportedPageStatePayload(rawPayload) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
        if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
            return null;
        }
        const payload = rawPayload;
        if (Number(payload.version) !== CUSTOM_PROMPT_EXPORT_VERSION) {
            return null;
        }
        if (typeof payload.exportedAt !== "string" || !payload.exportedAt.trim()) {
            return null;
        }
        if (!payload.state || typeof payload.state !== "object" || Array.isArray(payload.state)) {
            return null;
        }
        const state = payload.state;
        return {
            query: typeof state.query === "string" ? state.query.trim() : "",
            selectedPromptId: typeof state.selectedPromptId === "string" ? state.selectedPromptId.trim() : "",
            selectedPromptCode: typeof state.selectedPromptCode === "string" ? state.selectedPromptCode.trim() : "",
            argumentValues: state.argumentValues && typeof state.argumentValues === "object" && !Array.isArray(state.argumentValues)
                ? Object.fromEntries(Object.entries(state.argumentValues).map(([key, value]) => [key, typeof value === "string" ? value : ""]))
                : {},
            outputOptions: {
                hallucinationGuardLevel: ((_a = state.outputOptions) === null || _a === void 0 ? void 0 : _a.hallucinationGuardLevel) === "low" || ((_b = state.outputOptions) === null || _b === void 0 ? void 0 : _b.hallucinationGuardLevel) === "high"
                    ? state.outputOptions.hallucinationGuardLevel
                    : "none",
                outputMarkdownEnabled: ((_c = state.outputOptions) === null || _c === void 0 ? void 0 : _c.outputMarkdownEnabled) === true,
                outputTone: ((_d = state.outputOptions) === null || _d === void 0 ? void 0 : _d.outputTone) === "desumasu" || ((_e = state.outputOptions) === null || _e === void 0 ? void 0 : _e.outputTone) === "dearu"
                    ? state.outputOptions.outputTone
                    : "unspecified",
                selfReview: ((_f = state.outputOptions) === null || _f === void 0 ? void 0 : _f.selfReview) === "internal" || ((_g = state.outputOptions) === null || _g === void 0 ? void 0 : _g.selfReview) === "report"
                    ? state.outputOptions.selfReview
                    : "unspecified",
                minimalDiffReview: ((_h = state.outputOptions) === null || _h === void 0 ? void 0 : _h.minimalDiffReview) === "report"
                    ? state.outputOptions.minimalDiffReview
                    : "unspecified",
                misleadingExpressionReview: ((_j = state.outputOptions) === null || _j === void 0 ? void 0 : _j.misleadingExpressionReview) === "internal" || ((_k = state.outputOptions) === null || _k === void 0 ? void 0 : _k.misleadingExpressionReview) === "report"
                    ? state.outputOptions.misleadingExpressionReview
                    : "unspecified",
                considerationRiskReview: ((_l = state.outputOptions) === null || _l === void 0 ? void 0 : _l.considerationRiskReview) === "internal" || ((_m = state.outputOptions) === null || _m === void 0 ? void 0 : _m.considerationRiskReview) === "report"
                    ? state.outputOptions.considerationRiskReview
                    : "unspecified",
                discomfortRiskReview: ((_o = state.outputOptions) === null || _o === void 0 ? void 0 : _o.discomfortRiskReview) === "internal" || ((_p = state.outputOptions) === null || _p === void 0 ? void 0 : _p.discomfortRiskReview) === "report"
                    ? state.outputOptions.discomfortRiskReview
                    : "unspecified",
                aggressiveExpressionReview: ((_q = state.outputOptions) === null || _q === void 0 ? void 0 : _q.aggressiveExpressionReview) === "internal" || ((_r = state.outputOptions) === null || _r === void 0 ? void 0 : _r.aggressiveExpressionReview) === "report"
                    ? state.outputOptions.aggressiveExpressionReview
                    : "unspecified",
                sensitiveExpressionReview: ((_s = state.outputOptions) === null || _s === void 0 ? void 0 : _s.sensitiveExpressionReview) === "internal" || ((_t = state.outputOptions) === null || _t === void 0 ? void 0 : _t.sensitiveExpressionReview) === "report"
                    ? state.outputOptions.sensitiveExpressionReview
                    : "unspecified",
                legalComplianceReview: ((_u = state.outputOptions) === null || _u === void 0 ? void 0 : _u.legalComplianceReview) === "internal" || ((_v = state.outputOptions) === null || _v === void 0 ? void 0 : _v.legalComplianceReview) === "report"
                    ? state.outputOptions.legalComplianceReview
                    : "unspecified",
                publicOrderReview: ((_w = state.outputOptions) === null || _w === void 0 ? void 0 : _w.publicOrderReview) === "internal" || ((_x = state.outputOptions) === null || _x === void 0 ? void 0 : _x.publicOrderReview) === "report"
                    ? state.outputOptions.publicOrderReview
                    : "unspecified"
            },
            seriesVisibilitySettings: {
                showA: ((_y = state.seriesVisibilitySettings) === null || _y === void 0 ? void 0 : _y.showA) !== false,
                showX: ((_z = state.seriesVisibilitySettings) === null || _z === void 0 ? void 0 : _z.showX) !== false,
                showS: ((_0 = state.seriesVisibilitySettings) === null || _0 === void 0 ? void 0 : _0.showS) !== false,
                showP: ((_1 = state.seriesVisibilitySettings) === null || _1 === void 0 ? void 0 : _1.showP) !== false
            },
            customPrompt: state.customPrompt &&
                typeof state.customPrompt === "object" &&
                typeof state.customPrompt.promptText === "string" &&
                state.customPrompt.promptText.trim()
                ? {
                    id: typeof state.customPrompt.id === "string" && state.customPrompt.id.trim()
                        ? state.customPrompt.id.trim()
                        : "custom-imported-prompt",
                    label: typeof state.customPrompt.label === "string" && state.customPrompt.label.trim()
                        ? state.customPrompt.label.trim()
                        : typeof state.customPrompt.promptName === "string" &&
                            String(state.customPrompt.promptName || "").trim()
                            ? String(state.customPrompt.promptName || "").trim()
                            : "カスタムプロンプト",
                    keywords: Array.isArray(state.customPrompt.keywords)
                        ? state.customPrompt.keywords.map((keyword) => String(keyword || "").trim()).filter(Boolean)
                        : [],
                    promptText: state.customPrompt.promptText.trim()
                }
                : null
        };
    }
    async function importCustomPromptFile(file) {
        if (!file) {
            return;
        }
        try {
            const rawText = await file.text();
            const parsed = JSON.parse(rawText);
            const normalized = normalizeImportedPageStatePayload(parsed);
            if (!normalized) {
                if (typeof window.showToast === "function") {
                    window.showToast("JSON の読み込みに失敗しました");
                }
                return;
            }
            customPromptState = normalized.customPrompt;
            if (customPromptState) {
                saveImportedCustomPrompt(customPromptState);
            }
            else {
                clearImportedCustomPromptStorage();
            }
            seriesVisibilitySettings = { ...normalized.seriesVisibilitySettings };
            saveSeriesVisibilitySettings(seriesVisibilitySettings);
            rebuildVisiblePromptIndexes();
            pendingInitialPromptId = normalized.selectedPromptId;
            pendingInitialPromptCode = normalized.selectedPromptCode;
            lastSearchQuery = "";
            promptSearch.value = normalized.query;
            selectedPrompt = "";
            activeArgumentDefinitions = [];
            renderCandidates();
            setPromptArgumentValues(normalized.argumentValues);
            applyDefaultArgumentValues(getSelectedPromptDefinition());
            setPromptOutputOptions(normalized.outputOptions);
            revealOutputSection();
            updateOutput();
            if (typeof window.showToast === "function") {
                window.showToast("画面状態を JSON から取り込みました");
            }
        }
        catch (_error) {
            if (typeof window.showToast === "function") {
                window.showToast("JSON の読み込みに失敗しました");
            }
        }
        finally {
            customPromptImportInput.value = "";
        }
    }
    function exportCustomPrompt() {
        const payload = createPageStateExportPayload();
        downloadTextFile(`${JSON.stringify(payload, null, 2)}\n`, buildCustomPromptExportFilename(), "application/json;charset=utf-8");
        if (typeof window.showToast === "function") {
            window.showToast(payload.isSample
                ? "データが空のためサンプルJSONを出力しました"
                : "画面状態を JSON でエクスポートしました");
        }
    }
    function createSeriesVisibilityMenu() {
        const menuPanel = document.querySelector("lht-page-menu .md-menu-panel");
        if (!menuPanel) {
            return;
        }
        const exportButton = document.createElement("a");
        exportButton.id = "exportCustomPromptButton";
        exportButton.className = "md-menu-link";
        exportButton.href = "#";
        exportButton.textContent = "Export";
        exportButton.addEventListener("click", (event) => {
            event.preventDefault();
            exportCustomPrompt();
        });
        menuPanel.appendChild(exportButton);
        const importButton = document.createElement("a");
        importButton.id = "importCustomPromptButton";
        importButton.className = "md-menu-link";
        importButton.href = "#";
        importButton.textContent = "Import";
        importButton.addEventListener("click", (event) => {
            event.preventDefault();
            customPromptImportInput.value = "";
            customPromptImportInput.click();
        });
        menuPanel.appendChild(importButton);
        const separator = document.createElement("div");
        separator.className = "md-menu-separator";
        menuPanel.appendChild(separator);
        const section = document.createElement("div");
        section.className = "md-menu-settings";
        const title = document.createElement("p");
        title.className = "md-menu-settings__title";
        title.textContent = "系列表示設定";
        section.appendChild(title);
        menuPanel.appendChild(section);
        const seriesOptions = [
            { key: "showA", label: "A系列を表示", switchId: "menuShowASeries" },
            { key: "showX", label: "X系列を表示", switchId: "menuShowXSeries" },
            { key: "showS", label: "S系列を表示", switchId: "menuShowSSeries" },
            { key: "showP", label: "P系列を表示", switchId: "menuShowPSeries" }
        ];
        for (const option of seriesOptions) {
            const switchHelp = document.createElement("lht-switch-help");
            switchHelp.className = "md-menu-settings__switch";
            switchHelp.setAttribute("switch-id", option.switchId);
            switchHelp.setAttribute("label", option.label);
            if (seriesVisibilitySettings[option.key]) {
                switchHelp.setAttribute("checked", "");
            }
            section.appendChild(switchHelp);
            const checkbox = switchHelp.querySelector("input, md-switch") ||
                document.getElementById(option.switchId);
            if (!checkbox) {
                continue;
            }
            checkbox.addEventListener("change", () => {
                seriesVisibilitySettings = {
                    ...seriesVisibilitySettings,
                    [option.key]: checkbox.checked
                };
                saveSeriesVisibilitySettings(seriesVisibilitySettings);
                rebuildVisiblePromptIndexes();
                renderCandidates();
                updateOutput();
            });
        }
        const resetButton = document.createElement("button");
        resetButton.type = "button";
        resetButton.className = "md-menu-settings__reset";
        resetButton.innerHTML = '<svg viewBox="0 0 24 24" class="md-menu-settings__reset-icon" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><use href="#md-icon-trash" xlink:href="#md-icon-trash"></use></svg><span>設定を初期化</span>';
        resetButton.addEventListener("click", () => {
            clearImportedCustomPromptStorage();
            customPromptState = null;
            clearSeriesVisibilitySettings();
            seriesVisibilitySettings = { ...defaultSeriesVisibilitySettings };
            for (const option of seriesOptions) {
                const input = document.getElementById(option.switchId);
                if (input) {
                    input.checked = seriesVisibilitySettings[option.key];
                }
            }
            rebuildVisiblePromptIndexes();
            renderCandidates();
            updateOutput();
        });
        section.appendChild(resetButton);
    }
    promptSearch.addEventListener("input", renderCandidates);
    outputTone.addEventListener("change", updateOutput);
    selfReview.addEventListener("change", updateOutput);
    minimalDiffReview.addEventListener("change", updateOutput);
    misleadingExpressionReview.addEventListener("change", updateOutput);
    considerationRiskReview.addEventListener("change", updateOutput);
    discomfortRiskReview.addEventListener("change", updateOutput);
    aggressiveExpressionReview.addEventListener("change", updateOutput);
    sensitiveExpressionReview.addEventListener("change", updateOutput);
    legalComplianceReview.addEventListener("change", updateOutput);
    publicOrderReview.addEventListener("change", updateOutput);
    hallucinationGuard.addEventListener("change", updateOutput);
    outputMarkdown.addEventListener("change", updateOutput);
    customPromptImportInput.addEventListener("change", () => {
        var _a;
        void importCustomPromptFile(((_a = customPromptImportInput.files) === null || _a === void 0 ? void 0 : _a[0]) || null);
    });
    copyShareLinkButton.addEventListener("click", () => {
        void copyText(buildShareLink());
    });
    let initialQuery = "";
    let initialPromptCode = "";
    let initialPromptId = "";
    const initialArgumentValues = {};
    try {
        const url = new URL(window.location.href);
        initialQuery = (url.searchParams.get("q") || "").trim();
        initialPromptCode = (url.searchParams.get("id") || "").trim();
        initialPromptId = (url.searchParams.get("promptId") || "").trim();
        initialArgumentValues.subject = url.searchParams.get("subject") || "";
        initialArgumentValues.commitId = url.searchParams.get("commit") || "";
        for (const [key, value] of url.searchParams.entries()) {
            if (key.startsWith("arg_")) {
                initialArgumentValues[key.slice(4)] = value;
            }
        }
        if (initialQuery) {
            promptSearch.value = initialQuery;
        }
    }
    catch (_error) {
        // Ignore invalid or unavailable location values.
    }
    applyPromptOutputOptionDefaults(null);
    createSeriesVisibilityMenu();
    renderArgumentFields(null);
    if (initialPromptId) {
        pendingInitialPromptId = initialPromptId;
    }
    if (initialPromptCode) {
        pendingInitialPromptCode = initialPromptCode;
    }
    renderCandidates();
    setPromptArgumentValues(initialArgumentValues);
    applyDefaultArgumentValues(getSelectedPromptDefinition());
    updateOutput();
    requestAnimationFrame(() => {
        promptSearch.focus();
    });
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePromptPage, { once: true });
}
else {
    initializePromptPage();
}
