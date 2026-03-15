async function initializePromptPage() {
    const SERIES_VISIBILITY_STORAGE_KEY = "promptGenSeriesVisibility";
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
    const includeLabelPrefix = document.getElementById("includeLabelPrefix");
    const outputTone = document.getElementById("outputTone") ||
        (await waitForElementById("outputTone"));
    const hallucinationGuard = document.getElementById("hallucinationGuard") ||
        (await waitForElementById("hallucinationGuard"));
    const outputMarkdown = document.getElementById("outputMarkdown");
    const copyShareLinkButton = document.getElementById("copyShareLinkButton");
    const promptOutput = document.getElementById("promptOutput");
    if (!promptSearch || !includeLabelPrefix || !outputTone || !hallucinationGuard || !outputMarkdown || !copyShareLinkButton || !promptOutput || !promptCandidateArea || !promptArgsSection || !promptArgsContainer || !promptOutputSection || !promptOutputTitle || !promptOutputHelp) {
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
    function getVisiblePromptDefinitions() {
        return [
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
    let suppressSearchResetOnce = false;
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
            outputTone: (outputTone.value || "unspecified")
        };
    }
    function inferPromptOutputOptionDefaults(definition) {
        if (!definition) {
            return {
                hallucinationGuard: "none",
                outputMarkdown: false,
                outputTone: "unspecified"
            };
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
                outputTone: "unspecified"
            };
            promptOutputOptionDefaultsById.set(definition.id, explicitDefaults);
            return explicitDefaults;
        }
        const originalOptions = getPromptOutputOptions();
        setPromptOutputOptions({
            hallucinationGuardLevel: "high",
            outputMarkdownEnabled: true,
            outputTone: "unspecified"
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
            outputTone: instructionProfile.outputTone
        };
        promptOutputOptionDefaultsById.set(definition.id, defaults);
        return defaults;
    }
    function applyPromptOutputOptionDefaults(definition) {
        const defaults = inferPromptOutputOptionDefaults(definition);
        hallucinationGuard.value = defaults.hallucinationGuard;
        outputMarkdown.checked = defaults.outputMarkdown;
        outputTone.value = defaults.outputTone;
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
        if (pendingInitialPromptCode) {
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
        const label = selectedDefinition ? selectedDefinition.label : "";
        const argumentValues = getPromptArgumentValues();
        const commitId = sanitizePromptVariableInput(argumentValues.commitId || "");
        const subject = sanitizePromptVariableInput(argumentValues.subject || "");
        const currentOptions = getPromptOutputOptions();
        setPromptOutputOptions({
            hallucinationGuardLevel: "high",
            outputMarkdownEnabled: true,
            outputTone: "unspecified"
        });
        const rawBody = selectedDefinition ? selectedDefinition.buildBody(commitId, subject) : "";
        setPromptOutputOptions(currentOptions);
        const instructionProfile = inferPromptOutputInstructionProfile(rawBody);
        const body = appendPromptOutputInstructions(stripPromptOutputInstructions(rawBody), currentOptions, instructionProfile.hallucinationGuardMode || "high");
        if (!body || !label) {
            return "";
        }
        const normalizedBody = body.trim().replace(/\n{3,}/g, "\n\n");
        return includeLabelPrefix.checked ? `[${label}] ${normalizedBody}` : normalizedBody;
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
    function createSeriesVisibilityMenu() {
        const menuPanel = document.querySelector("lht-page-menu .md-menu-panel");
        if (!menuPanel) {
            return;
        }
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
    includeLabelPrefix.addEventListener("change", updateOutput);
    outputTone.addEventListener("change", updateOutput);
    hallucinationGuard.addEventListener("change", updateOutput);
    outputMarkdown.addEventListener("change", updateOutput);
    copyShareLinkButton.addEventListener("click", () => {
        void copyText(buildShareLink());
    });
    let initialQuery = "";
    let initialPromptCode = "";
    const initialArgumentValues = {};
    try {
        const url = new URL(window.location.href);
        initialQuery = (url.searchParams.get("q") || "").trim();
        initialPromptCode = (url.searchParams.get("id") || "").trim();
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
