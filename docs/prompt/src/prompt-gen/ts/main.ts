type PromptDefinition = {
  id: string;
  label: string;
  keywords: string[];
  requiresCommitId: boolean;
  buildBody: (commitId: string) => string;
};

type PromptSearchIndex = {
  definition: PromptDefinition;
  labelTokens: string[];
  keywordTokens: string[];
  expandedTokens: string[];
};

declare const promptDefinitions: PromptDefinition[];
declare const aiExpansionPromptDefinitions: PromptDefinition[];
declare const aiSuggestPromptDefinitions: PromptDefinition[];
declare const popularPromptDefinitions: PromptDefinition[];

async function initializePromptPage() {
  const SERIES_VISIBILITY_STORAGE_KEY = "promptGenSeriesVisibility";

  type SeriesVisibilitySettings = {
    showA: boolean;
    showX: boolean;
    showS: boolean;
    showP: boolean;
  };

  const defaultSeriesVisibilitySettings: SeriesVisibilitySettings = {
    showA: true,
    showX: true,
    showS: true,
    showP: true
  };

  function decorateBasePromptDefinition(definition: PromptDefinition): PromptDefinition {
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
  }

  const promptSearch = document.getElementById("promptSearch") as HTMLInputElement | null;
  const promptCandidateArea = document.getElementById("promptCandidateArea") as HTMLDivElement | null;
  const commitInputSection = document.getElementById("commitInputSection") as HTMLElement | null;
  const promptOutputSection = document.getElementById("promptOutputSection") as HTMLElement | null;
  const commitIdInput = document.getElementById("commitId") as HTMLInputElement | null;
  const includeLabelPrefix = document.getElementById("includeLabelPrefix") as HTMLInputElement | null;
  const promptOutput = document.getElementById("promptOutput") as HTMLElement | null;

  if (!promptSearch || !commitIdInput || !includeLabelPrefix || !promptOutput || !promptCandidateArea || !commitInputSection || !promptOutputSection) {
    return;
  }

  function loadSeriesVisibilitySettings(): SeriesVisibilitySettings {
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
        showA: parsed?.showA !== false,
        showX: parsed?.showX !== false,
        showS: parsed?.showS !== false,
        showP: parsed?.showP !== false
      };
    } catch (_error) {
      return { ...defaultSeriesVisibilitySettings };
    }
  }

  function saveSeriesVisibilitySettings(settings: SeriesVisibilitySettings) {
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

  function getVisiblePromptDefinitions() {
    return [
      ...(seriesVisibilitySettings.showA ? basePromptDefinitions : []),
      ...(seriesVisibilitySettings.showX ? expansionDefinitions : []),
      ...(seriesVisibilitySettings.showS ? suggestDefinitions : []),
      ...(seriesVisibilitySettings.showP ? popularDefinitions : [])
    ];
  }

  let visiblePromptDefinitions: PromptDefinition[] = [];
  let promptSearchIndexes: PromptSearchIndex[] = [];
  let promptSearchIndexById = new Map<string, PromptSearchIndex>();

  function applyLatinInputHints(field: HTMLInputElement, enterKeyHint: string) {
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
  applyLatinInputHints(commitIdInput, "done");

  let selectedPrompt = "";
  let lastSearchQuery = "";

  const kanaToRomajiMap = new Map<string, string>([
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

  function toHiragana(text: string) {
    return String(text || "").replace(/[\u30A1-\u30F6]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0x60)
    );
  }

  function toKatakana(text: string) {
    return String(text || "").replace(/[\u3041-\u3096]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) + 0x60)
    );
  }

  function isKanaText(text: string) {
    return /^[\u3041-\u3096ー]+$/.test(text);
  }

  function kanaToRomaji(text: string) {
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
        const nextRomaji =
          kanaToRomajiMap.get(nextPair) ||
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

  function buildExpandedForms(token: string) {
    const tokens = new Set<string>();
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

  function buildLabelTokens(definition: PromptDefinition) {
    const tokens = new Set<string>();
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

  function buildKeywordTokens(definition: PromptDefinition) {
    const tokens = new Set<string>();
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

  function buildExpandedTokensFromBaseTokens(labelTokens: string[], keywordTokens: string[]) {
    const tokens = new Set<string>();

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

  function buildExpandedTokens(definition: PromptDefinition) {
    return buildExpandedTokensFromBaseTokens(
      buildLabelTokens(definition),
      buildKeywordTokens(definition)
    );
  }

  function buildSearchIndex(definition: PromptDefinition): PromptSearchIndex {
    const labelTokens = buildLabelTokens(definition);
    const keywordTokens = buildKeywordTokens(definition);

    return {
      definition,
      labelTokens,
      keywordTokens,
      expandedTokens: buildExpandedTokensFromBaseTokens(labelTokens, keywordTokens)
    };
  }

  function matchesAllTerms(tokens: string[], terms: string[]) {
    if (terms.length === 0) {
      return true;
    }
    return terms.every((term) => tokens.some((token) => token.includes(term)));
  }

  function calculateMatchScore(tokens: string[], terms: string[]) {
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

  function sortDefinitions(definitions: PromptDefinition[]) {
    return [...definitions].sort((left, right) => {
      if (left.label < right.label) return -1;
      if (left.label > right.label) return 1;
      return 0;
    });
  }

  function sortDefinitionsByScore(definitions: PromptDefinition[], terms: string[], tokenBuilder: (definition: PromptDefinition) => string[]) {
    return [...definitions].sort((left, right) => {
      const rightScore = calculateMatchScore(tokenBuilder(right), terms);
      const leftScore = calculateMatchScore(tokenBuilder(left), terms);
      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }
      if (left.label < right.label) return -1;
      if (left.label > right.label) return 1;
      return 0;
    });
  }

  function mergeDefinitionGroups(groups: PromptDefinition[][]) {
    const merged: PromptDefinition[] = [];
    const seenIds = new Set<string>();

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

  function searchPromptDefinitions(query: string, searchIndexes: PromptSearchIndex[], searchIndexById: Map<string, PromptSearchIndex>) {
    const terms = query ? query.split(/\s+/).filter(Boolean) : [];
    const labelMatches = query
      ? sortDefinitions(
          searchIndexes
            .filter((searchIndex) => matchesAllTerms(searchIndex.labelTokens, terms))
            .map((searchIndex) => searchIndex.definition)
        )
      : sortDefinitions(searchIndexes.map((searchIndex) => searchIndex.definition));
    const keywordMatches = query
      ? sortDefinitionsByScore(
          searchIndexes
            .filter((searchIndex) => matchesAllTerms(searchIndex.keywordTokens, terms))
            .map((searchIndex) => searchIndex.definition),
          terms,
          (definition) => {
            const searchIndex = searchIndexById.get(definition.id);
            return searchIndex ? searchIndex.keywordTokens : [];
          }
        )
      : [];
    const expandedMatches = query
      ? sortDefinitionsByScore(
          searchIndexes
            .filter((searchIndex) => matchesAllTerms(searchIndex.expandedTokens, terms))
            .map((searchIndex) => searchIndex.definition),
          terms,
          (definition) => {
            const searchIndex = searchIndexById.get(definition.id);
            return searchIndex ? searchIndex.expandedTokens : [];
          }
        )
      : [];
    const matchedDefinitions = query
      ? mergeDefinitionGroups([labelMatches, keywordMatches, expandedMatches])
      : labelMatches;

    const prioritizedSingleDefinition =
      labelMatches.length === 1
        ? labelMatches[0]
        : labelMatches.length === 0 && keywordMatches.length === 1
          ? keywordMatches[0]
          : labelMatches.length === 0 && keywordMatches.length === 0 && expandedMatches.length === 1
            ? expandedMatches[0]
            : null;

    return {
      matchedDefinitions,
      prioritizedSingleDefinition
    };
  }

  function buildDisplayKeywords(definition: PromptDefinition) {
    const tokens = new Set<string>();
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
    promptSearchIndexById = new Map(
      promptSearchIndexes.map((searchIndex) => [searchIndex.definition.id, searchIndex] as const)
    );
  }

  rebuildVisiblePromptIndexes();

  function createCandidateButton(definition: PromptDefinition) {
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

  function revealOutputSection(options?: { scrollIntoView?: boolean }) {
    promptOutputSection.classList.remove("md-hidden");
    if (!options?.scrollIntoView) {
      return;
    }
    requestAnimationFrame(() => {
      promptOutputSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  async function copyText(text: string) {
    if (!text) {
      return false;
    }

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
      } else {
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
    } catch (_error) {
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

    const {
      matchedDefinitions,
      prioritizedSingleDefinition
    } = searchPromptDefinitions(query, promptSearchIndexes, promptSearchIndexById);

    if (matchedDefinitions.length === 0) {
      if (selectedPrompt) {
        selectedPrompt = "";
        commitInputSection.classList.add("md-hidden");
        promptOutputSection.classList.add("md-hidden");
        updateOutput();
      }
      return;
    }

    if (prioritizedSingleDefinition) {
      selectedPrompt = prioritizedSingleDefinition.id;
    } else if (
      selectedPrompt &&
      !matchedDefinitions.some((definition) => definition.id === selectedPrompt)
    ) {
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
      } else {
        commitInputSection.classList.add("md-hidden");
      }
      revealOutputSection({
        scrollIntoView: queryChanged && query.length > 0
      });
      updateOutput();
    }
  }

  async function selectPrompt(id: string, button: HTMLButtonElement, options?: { autoCopy?: boolean }) {
    selectedPrompt = id;
    for (const element of promptCandidateArea.querySelectorAll(".md-chip-button")) {
      element.classList.remove("is-active");
    }
    button.classList.add("is-active");

    revealOutputSection({ scrollIntoView: true });

    const selectedDefinition = visiblePromptDefinitions.find((definition) => definition.id === id);
    if (selectedDefinition?.requiresCommitId) {
      commitInputSection.classList.remove("md-hidden");
      commitIdInput.focus();
    } else {
      commitInputSection.classList.add("md-hidden");
    }

    updateOutput();

    if (options?.autoCopy && selectedDefinition && !selectedDefinition.requiresCommitId) {
      await copyText(promptOutput.textContent || "");
    }
  }

  function buildPromptText() {
    if (!selectedPrompt) {
      return "";
    }
    const selectedDefinition = visiblePromptDefinitions.find((definition) => definition.id === selectedPrompt);
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

  function createSeriesVisibilityMenu() {
    const menuPanel = document.querySelector("lht-page-menu .md-menu-panel") as HTMLDivElement | null;
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

    const seriesOptions: Array<{ key: keyof SeriesVisibilitySettings; label: string; switchId: string }> = [
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

      const checkbox =
        (switchHelp.querySelector("input, md-switch") as HTMLInputElement | null) ||
        (document.getElementById(option.switchId) as HTMLInputElement | null);
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
        const input = document.getElementById(option.switchId) as HTMLInputElement | null;
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
  commitIdInput.addEventListener("input", updateOutput);
  includeLabelPrefix.addEventListener("change", updateOutput);

  createSeriesVisibilityMenu();
  renderCandidates();
  updateOutput();

  requestAnimationFrame(() => {
    promptSearch.focus();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePromptPage, { once: true });
} else {
  initializePromptPage();
}
