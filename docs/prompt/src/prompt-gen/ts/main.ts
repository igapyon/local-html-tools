type PromptDefinition = {
  id: string;
  label: string;
  keywords: string[];
  requiresCommitId?: boolean;
  requiresSubject?: boolean;
  subjectLabel?: string;
  subjectPlaceholder?: string;
  subjectHelpText?: string;
  subjectDefaultValue?: string;
  args?: PromptArgumentDefinition[];
  hallucinationGuard?: "none" | "low" | "high" | boolean;
  outputMarkdown?: boolean;
  buildBody: (commitId: string, subject?: string) => string;
};

type PromptArgumentDefinition = {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  inputMode?: "text" | "latin";
};

type PromptOutputOptionDefaults = {
  hallucinationGuard: "none" | "low" | "high";
  outputMarkdown: boolean;
  outputTone: "unspecified" | "desumasu" | "dearu";
  selfReview: "unspecified" | "internal" | "report";
  minimalDiffReview: "unspecified" | "report";
  misleadingExpressionReview: "unspecified" | "internal" | "report";
  considerationRiskReview: "unspecified" | "internal" | "report";
  discomfortRiskReview: "unspecified" | "internal" | "report";
  aggressiveExpressionReview: "unspecified" | "internal" | "report";
  sensitiveExpressionReview: "unspecified" | "internal" | "report";
  legalComplianceReview: "unspecified" | "internal" | "report";
  publicOrderReview: "unspecified" | "internal" | "report";
};

type CustomPromptState = {
  id: string;
  label: string;
  keywords: string[];
  promptText: string;
};

type PromptPageStateExportPayload = {
  version: number;
  exportedAt: string;
  isSample: boolean;
  note?: string;
  state: {
    query: string;
    selectedPromptId: string;
    selectedPromptCode?: string;
    argumentValues: Record<string, string>;
    outputOptions: {
      hallucinationGuardLevel: "none" | "low" | "high";
      outputMarkdownEnabled: boolean;
      outputTone: "unspecified" | "desumasu" | "dearu";
      selfReview: "unspecified" | "internal" | "report";
      minimalDiffReview: "unspecified" | "report";
      misleadingExpressionReview: "unspecified" | "internal" | "report";
      considerationRiskReview: "unspecified" | "internal" | "report";
      discomfortRiskReview: "unspecified" | "internal" | "report";
      aggressiveExpressionReview: "unspecified" | "internal" | "report";
      sensitiveExpressionReview: "unspecified" | "internal" | "report";
      legalComplianceReview: "unspecified" | "internal" | "report";
      publicOrderReview: "unspecified" | "internal" | "report";
    };
    seriesVisibilitySettings: {
      showA: boolean;
      showX: boolean;
      showS: boolean;
      showP: boolean;
    };
    customPrompt: CustomPromptState | null;
  };
};

type PromptSearchIndex = {
  definition: PromptDefinition;
  labelTokens: string[];
  keywordTokens: string[];
  expandedTokens: string[];
};

type PromptMatchGrade = "strong" | "medium" | "weak";

declare const promptDefinitions: PromptDefinition[];
declare const aiExpansionPromptDefinitions: PromptDefinition[];
declare const aiSuggestPromptDefinitions: PromptDefinition[];
declare const popularPromptDefinitions: PromptDefinition[];

async function initializePromptPage() {
  const SERIES_VISIBILITY_STORAGE_KEY = "promptGenSeriesVisibility";
  const CUSTOM_PROMPT_STORAGE_KEY = "promptGenCustomPrompt";
  const CUSTOM_PROMPT_EXPORT_VERSION = 1;

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
    await window.customElements.whenDefined("lht-select-help");
  }

  async function waitForElementById<T extends HTMLElement>(id: string, maxFrames = 4): Promise<T | null> {
    for (let index = 0; index < maxFrames; index += 1) {
      const element = document.getElementById(id) as T | null;
      if (element) {
        return element;
      }
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    }
    return document.getElementById(id) as T | null;
  }

  const promptSearch = document.getElementById("promptSearch") as HTMLInputElement | null;
  const promptCandidateArea = document.getElementById("promptCandidateArea") as HTMLDivElement | null;
  const promptArgsSection = document.getElementById("promptArgsSection") as HTMLElement | null;
  const promptArgsContainer = document.getElementById("promptArgsContainer") as HTMLDivElement | null;
  const promptOutputSection = document.getElementById("promptOutputSection") as HTMLElement | null;
  const promptOutputTitle = document.getElementById("promptOutputTitle") as HTMLElement | null;
  const promptOutputHelp = document.getElementById("promptOutputHelp") as HTMLDivElement | null;
  const gitPseudoSquashLink = document.getElementById("gitPseudoSquashLink") as HTMLAnchorElement | null;
  const outputTone =
    (document.getElementById("outputTone") as HTMLSelectElement | null) ||
    (await waitForElementById<HTMLSelectElement>("outputTone"));
  const selfReview =
    (document.getElementById("selfReview") as HTMLSelectElement | null) ||
    (await waitForElementById<HTMLSelectElement>("selfReview"));
  const minimalDiffReview =
    (document.getElementById("minimalDiffReview") as HTMLSelectElement | null) ||
    (await waitForElementById<HTMLSelectElement>("minimalDiffReview"));
  const misleadingExpressionReview =
    (document.getElementById("misleadingExpressionReview") as HTMLSelectElement | null) ||
    (await waitForElementById<HTMLSelectElement>("misleadingExpressionReview"));
  const considerationRiskReview =
    (document.getElementById("considerationRiskReview") as HTMLSelectElement | null) ||
    (await waitForElementById<HTMLSelectElement>("considerationRiskReview"));
  const discomfortRiskReview =
    (document.getElementById("discomfortRiskReview") as HTMLSelectElement | null) ||
    (await waitForElementById<HTMLSelectElement>("discomfortRiskReview"));
  const aggressiveExpressionReview =
    (document.getElementById("aggressiveExpressionReview") as HTMLSelectElement | null) ||
    (await waitForElementById<HTMLSelectElement>("aggressiveExpressionReview"));
  const sensitiveExpressionReview =
    (document.getElementById("sensitiveExpressionReview") as HTMLSelectElement | null) ||
    (await waitForElementById<HTMLSelectElement>("sensitiveExpressionReview"));
  const legalComplianceReview =
    (document.getElementById("legalComplianceReview") as HTMLSelectElement | null) ||
    (await waitForElementById<HTMLSelectElement>("legalComplianceReview"));
  const publicOrderReview =
    (document.getElementById("publicOrderReview") as HTMLSelectElement | null) ||
    (await waitForElementById<HTMLSelectElement>("publicOrderReview"));
  const hallucinationGuard =
    (document.getElementById("hallucinationGuard") as HTMLSelectElement | null) ||
    (await waitForElementById<HTMLSelectElement>("hallucinationGuard"));
  const outputMarkdown = document.getElementById("outputMarkdown") as HTMLInputElement | null;
  const customPromptImportInput = document.getElementById("customPromptImportInput") as HTMLInputElement | null;
  const copyShareLinkButton = document.getElementById("copyShareLinkButton") as HTMLButtonElement | null;
  const promptOutput = document.getElementById("promptOutput") as HTMLElement | null;

  if (!promptSearch || !outputTone || !selfReview || !minimalDiffReview || !misleadingExpressionReview || !considerationRiskReview || !discomfortRiskReview || !aggressiveExpressionReview || !sensitiveExpressionReview || !legalComplianceReview || !publicOrderReview || !hallucinationGuard || !outputMarkdown || !customPromptImportInput || !copyShareLinkButton || !promptOutput || !promptCandidateArea || !promptArgsSection || !promptArgsContainer || !promptOutputSection || !promptOutputTitle || !promptOutputHelp) {
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
      if (typeof parsed?.promptText !== "string" || !parsed.promptText.trim()) {
        return null;
      }
      const normalizedKeywords = Array.isArray(parsed?.keywords)
        ? parsed.keywords.map((keyword: unknown) => String(keyword || "").trim()).filter(Boolean)
        : [];
      return {
        id: typeof parsed?.id === "string" && parsed.id.trim() ? parsed.id.trim() : "custom-imported-prompt",
        label: typeof parsed?.label === "string" && parsed.label.trim()
          ? parsed.label.trim()
          : typeof parsed?.promptName === "string" && parsed.promptName.trim()
            ? parsed.promptName.trim()
            : "カスタムプロンプト",
        keywords: normalizedKeywords,
        promptText: parsed.promptText.trim()
      } as CustomPromptState;
    } catch (_error) {
      return null;
    }
  }

  function saveImportedCustomPrompt(prompt: CustomPromptState) {
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

  function getLegacyPromptArguments(definition: PromptDefinition): PromptArgumentDefinition[] {
    const args: PromptArgumentDefinition[] = [];

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

  function normalizePromptDefinition(definition: PromptDefinition): PromptDefinition {
    return {
      ...definition,
      args: Array.isArray(definition.args) ? definition.args : getLegacyPromptArguments(definition)
    };
  }

  function createCustomPromptDefinition(prompt: CustomPromptState | null): PromptDefinition | null {
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
  const MAX_EMBED_INPUT_LENGTH = 1024;
  let activeArgumentDefinitions: PromptArgumentDefinition[] = [];
  let promptArgumentInputs = new Map<string, HTMLInputElement>();

  function sanitizePromptVariableInput(value: string) {
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

  function getSelectedPromptArguments(definition: PromptDefinition | null): PromptArgumentDefinition[] {
    return Array.isArray(definition?.args) ? definition.args : [];
  }

  function getArgumentInput(argumentId: string) {
    return promptArgumentInputs.get(argumentId) || null;
  }

  function getArgumentDomId(argumentId: string) {
    if (argumentId === "subject") {
      return "subjectInput";
    }
    return argumentId;
  }

  function getArgumentValue(argumentId: string) {
    return getArgumentInput(argumentId)?.value || "";
  }

  function getArgumentQueryParamName(argumentId: string) {
    if (argumentId === "commitId") {
      return "commit";
    }
    if (argumentId === "subject") {
      return "subject";
    }
    return `arg_${argumentId}`;
  }

  function getPromptArgumentValues() {
    const values: Record<string, string> = {};
    for (const argumentDefinition of activeArgumentDefinitions) {
      values[argumentDefinition.id] = getArgumentValue(argumentDefinition.id);
    }
    return values;
  }

  function setPromptArgumentValues(values: Record<string, string>) {
    for (const argumentDefinition of activeArgumentDefinitions) {
      const input = getArgumentInput(argumentDefinition.id);
      if (!input) {
        continue;
      }
      input.value = values[argumentDefinition.id] || "";
    }
  }

  function refreshArgumentInputReferences(definition: PromptDefinition | null) {
    promptArgumentInputs = new Map();
    for (const argumentDefinition of getSelectedPromptArguments(definition)) {
      const input = document.getElementById(getArgumentDomId(argumentDefinition.id)) as HTMLInputElement | null;
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

  function renderArgumentFields(definition: PromptDefinition | null) {
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

  function applyDefaultArgumentValues(selectedDefinition: PromptDefinition | null) {
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

  function syncInputSections(selectedDefinition: PromptDefinition | null) {
    if (getSelectedPromptArguments(selectedDefinition).length > 0) {
      promptArgsSection.classList.remove("md-hidden");
    } else {
      promptArgsSection.classList.add("md-hidden");
    }
  }

  let selectedPrompt = "";
  let lastSearchQuery = "";
  let pendingInitialPromptCode = "";
  let pendingInitialPromptId = "";
  let suppressSearchResetOnce = false;
  let customPromptState: CustomPromptState | null = loadImportedCustomPrompt();
  const promptOutputOptionDefaultsById = new Map<string, PromptOutputOptionDefaults>();

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
    const definitionMatchGrades = new Map<string, PromptMatchGrade>();

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

    const prioritizedSingleDefinition =
      labelMatches.length === 1
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

  function createCandidateButton(definition: PromptDefinition, grade: PromptMatchGrade) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "md-chip-button";
    button.dataset.promptId = definition.id;
    button.dataset.matchGrade = grade;
    button.classList.add(`md-chip-button--${grade}`);
    button.addEventListener("click", () => {
      const wasActive = selectedPrompt === definition.id && button.classList.contains("is-active");
      if (wasActive) {
        searchPromptGroup(definition);
        return;
      }
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
      hallucinationGuardLevel: ((hallucinationGuard.value || "none") as "none" | "low" | "high"),
      outputMarkdownEnabled: outputMarkdown.checked,
      outputTone: ((outputTone.value || "unspecified") as "unspecified" | "desumasu" | "dearu"),
      selfReview: ((selfReview.value || "unspecified") as "unspecified" | "internal" | "report"),
      minimalDiffReview: ((minimalDiffReview.value || "unspecified") as "unspecified" | "report"),
      misleadingExpressionReview: ((misleadingExpressionReview.value || "unspecified") as "unspecified" | "internal" | "report"),
      considerationRiskReview: ((considerationRiskReview.value || "unspecified") as "unspecified" | "internal" | "report"),
      discomfortRiskReview: ((discomfortRiskReview.value || "unspecified") as "unspecified" | "internal" | "report"),
      aggressiveExpressionReview: ((aggressiveExpressionReview.value || "unspecified") as "unspecified" | "internal" | "report"),
      sensitiveExpressionReview: ((sensitiveExpressionReview.value || "unspecified") as "unspecified" | "internal" | "report"),
      legalComplianceReview: ((legalComplianceReview.value || "unspecified") as "unspecified" | "internal" | "report"),
      publicOrderReview: ((publicOrderReview.value || "unspecified") as "unspecified" | "internal" | "report")
    };
  }

  function inferPromptOutputOptionDefaults(definition: PromptDefinition | null): PromptOutputOptionDefaults {
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
    const argsForInference: Record<string, string> = {};
    for (const argumentDefinition of getSelectedPromptArguments(definition)) {
      const rawValue = getArgumentValue(argumentDefinition.id) || argumentDefinition.defaultValue || `dummy-${argumentDefinition.id}`;
      argsForInference[argumentDefinition.id] = rawValue;
    }
    const body = definition.buildBody(
      sanitizePromptVariableInput(argsForInference.commitId || ""),
      sanitizePromptVariableInput(argsForInference.subject || "")
    );
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

  function applyPromptOutputOptionDefaults(definition: PromptDefinition | null) {
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
    gitPseudoSquashLink?.classList.add("md-hidden");

    if (!selectedDefinition) {
      promptOutputTitle.textContent = "生成結果";
      return;
    }

    promptOutputTitle.textContent = selectedDefinition.label;
    if (getDefinitionLabelCode(selectedDefinition) === "A501") {
      gitPseudoSquashLink?.classList.remove("md-hidden");
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
      if (suppressSearchResetOnce) {
        suppressSearchResetOnce = false;
      } else {
        selectedPrompt = "";
        syncInputSections(null);
        renderArgumentFields(null);
        promptOutputSection.classList.add("md-hidden");
        applyPromptOutputOptionDefaults(null);
        promptOutput.textContent = "";
      }
    }

    const {
      definitionMatchGrades,
      matchedDefinitions,
      prioritizedSingleDefinition
    } = searchPromptDefinitions(query, promptSearchIndexes, promptSearchIndexById);

    if (pendingInitialPromptId) {
      const pendingDefinition = matchedDefinitions.find((definition) => definition.id === pendingInitialPromptId);
      if (pendingDefinition) {
        selectedPrompt = pendingDefinition.id;
      }
      pendingInitialPromptId = "";
    } else if (pendingInitialPromptCode) {
      const pendingDefinition = matchedDefinitions.find((definition) =>
        getDefinitionLabelCode(definition) === pendingInitialPromptCode
      );
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
    } else if (
      selectedPrompt &&
      !matchedDefinitions.some((definition) => definition.id === selectedPrompt)
    ) {
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

  async function selectPrompt(id: string, button: HTMLButtonElement, options?: { autoCopy?: boolean }) {
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
      getArgumentInput(firstArgument.id)?.focus();
    }

    updateOutput();

    if (options?.autoCopy && selectedDefinition && getSelectedPromptArguments(selectedDefinition).length === 0) {
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
    const rawBody =
      customPromptState && selectedDefinition.id === customPromptState.id
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
    const body = appendPromptOutputInstructions(
      stripPromptOutputInstructions(rawBody),
      currentOptions,
      instructionProfile.hallucinationGuardMode || "high"
    );

    if (!body) {
      return "";
    }

    return body.trim().replace(/\n{3,}/g, "\n\n");
  }

  function getDefinitionLabelCode(definition: PromptDefinition | null) {
    const label = String(definition?.label || "");
    const match = label.match(/^([^:]+):/);
    return match ? match[1] : "";
  }

  function getDefinitionSearchSeed(definition: PromptDefinition | null) {
    const labelCode = getDefinitionLabelCode(definition);
    const match = labelCode.match(/^[A-Z](\d+)/);
    return match ? match[1] : "";
  }

  function getDefinitionSearchGroup(definition: PromptDefinition | null) {
    const labelCode = getDefinitionLabelCode(definition);
    const pSeriesMatch = labelCode.match(/^P\d+-\d+$/);
    if (pSeriesMatch) {
      return labelCode;
    }
    const match = labelCode.match(/^([A-Z]\d+)/);
    return match ? match[1] : "";
  }

  function searchPromptGroup(definition: PromptDefinition | null) {
    const searchGroup = getDefinitionSearchGroup(definition);
    if (!searchGroup) {
      return;
    }
    selectedPrompt = "";
    promptSearch.value = searchGroup;
    promptSearch.dispatchEvent(new Event("input"));
    promptSearch.focus();
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
    if (selectedDefinition?.id) {
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

  function createSamplePageStateExportPayload(): PromptPageStateExportPayload {
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

  function setPromptOutputOptions(options: {
    hallucinationGuardLevel: "none" | "low" | "high";
    outputMarkdownEnabled: boolean;
    outputTone: "unspecified" | "desumasu" | "dearu";
    selfReview: "unspecified" | "internal" | "report";
    minimalDiffReview: "unspecified" | "report";
    misleadingExpressionReview: "unspecified" | "internal" | "report";
    considerationRiskReview: "unspecified" | "internal" | "report";
    discomfortRiskReview: "unspecified" | "internal" | "report";
    aggressiveExpressionReview: "unspecified" | "internal" | "report";
    sensitiveExpressionReview: "unspecified" | "internal" | "report";
    legalComplianceReview: "unspecified" | "internal" | "report";
    publicOrderReview: "unspecified" | "internal" | "report";
  }) {
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

  function createPageStateExportPayload(): PromptPageStateExportPayload {
    const currentState: PromptPageStateExportPayload = {
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

    const hasMeaningfulState =
      currentState.state.query ||
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

  function downloadTextFile(text: string, filename: string, contentType: string) {
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

  function normalizeImportedPageStatePayload(rawPayload: unknown) {
    if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
      return null;
    }
    const payload = rawPayload as Partial<PromptPageStateExportPayload> & {
      version?: unknown;
      exportedAt?: unknown;
    };
    if (Number(payload.version) !== CUSTOM_PROMPT_EXPORT_VERSION) {
      return null;
    }
    if (typeof payload.exportedAt !== "string" || !payload.exportedAt.trim()) {
      return null;
    }
    if (!payload.state || typeof payload.state !== "object" || Array.isArray(payload.state)) {
      return null;
    }

    const state = payload.state as PromptPageStateExportPayload["state"];

    return {
      query: typeof state.query === "string" ? state.query.trim() : "",
      selectedPromptId: typeof state.selectedPromptId === "string" ? state.selectedPromptId.trim() : "",
      selectedPromptCode: typeof state.selectedPromptCode === "string" ? state.selectedPromptCode.trim() : "",
      argumentValues: state.argumentValues && typeof state.argumentValues === "object" && !Array.isArray(state.argumentValues)
        ? Object.fromEntries(
            Object.entries(state.argumentValues).map(([key, value]) => [key, typeof value === "string" ? value : ""])
          )
        : {},
      outputOptions: {
        hallucinationGuardLevel: state.outputOptions?.hallucinationGuardLevel === "low" || state.outputOptions?.hallucinationGuardLevel === "high"
          ? state.outputOptions.hallucinationGuardLevel
          : "none",
        outputMarkdownEnabled: state.outputOptions?.outputMarkdownEnabled === true,
        outputTone: state.outputOptions?.outputTone === "desumasu" || state.outputOptions?.outputTone === "dearu"
          ? state.outputOptions.outputTone
          : "unspecified",
        selfReview: state.outputOptions?.selfReview === "internal" || state.outputOptions?.selfReview === "report"
          ? state.outputOptions.selfReview
          : "unspecified",
        minimalDiffReview: state.outputOptions?.minimalDiffReview === "report"
          ? state.outputOptions.minimalDiffReview
          : "unspecified",
        misleadingExpressionReview: state.outputOptions?.misleadingExpressionReview === "internal" || state.outputOptions?.misleadingExpressionReview === "report"
          ? state.outputOptions.misleadingExpressionReview
          : "unspecified",
        considerationRiskReview: state.outputOptions?.considerationRiskReview === "internal" || state.outputOptions?.considerationRiskReview === "report"
          ? state.outputOptions.considerationRiskReview
          : "unspecified",
        discomfortRiskReview: state.outputOptions?.discomfortRiskReview === "internal" || state.outputOptions?.discomfortRiskReview === "report"
          ? state.outputOptions.discomfortRiskReview
          : "unspecified",
        aggressiveExpressionReview: state.outputOptions?.aggressiveExpressionReview === "internal" || state.outputOptions?.aggressiveExpressionReview === "report"
          ? state.outputOptions.aggressiveExpressionReview
          : "unspecified",
        sensitiveExpressionReview: state.outputOptions?.sensitiveExpressionReview === "internal" || state.outputOptions?.sensitiveExpressionReview === "report"
          ? state.outputOptions.sensitiveExpressionReview
          : "unspecified",
        legalComplianceReview: state.outputOptions?.legalComplianceReview === "internal" || state.outputOptions?.legalComplianceReview === "report"
          ? state.outputOptions.legalComplianceReview
          : "unspecified",
        publicOrderReview: state.outputOptions?.publicOrderReview === "internal" || state.outputOptions?.publicOrderReview === "report"
          ? state.outputOptions.publicOrderReview
          : "unspecified"
      },
      seriesVisibilitySettings: {
        showA: state.seriesVisibilitySettings?.showA !== false,
        showX: state.seriesVisibilitySettings?.showX !== false,
        showS: state.seriesVisibilitySettings?.showS !== false,
        showP: state.seriesVisibilitySettings?.showP !== false
      },
      customPrompt:
        state.customPrompt &&
        typeof state.customPrompt === "object" &&
        typeof state.customPrompt.promptText === "string" &&
        state.customPrompt.promptText.trim()
          ? {
              id: typeof state.customPrompt.id === "string" && state.customPrompt.id.trim()
                ? state.customPrompt.id.trim()
                : "custom-imported-prompt",
              label: typeof state.customPrompt.label === "string" && state.customPrompt.label.trim()
                ? state.customPrompt.label.trim()
                : typeof (state.customPrompt as { promptName?: string }).promptName === "string" &&
                    String((state.customPrompt as { promptName?: string }).promptName || "").trim()
                  ? String((state.customPrompt as { promptName?: string }).promptName || "").trim()
                  : "カスタムプロンプト",
              keywords: Array.isArray(state.customPrompt.keywords)
                ? state.customPrompt.keywords.map((keyword) => String(keyword || "").trim()).filter(Boolean)
                : [],
              promptText: state.customPrompt.promptText.trim()
            }
          : null
    };
  }

  async function importCustomPromptFile(file: File | null) {
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
      } else {
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
    } catch (_error) {
      if (typeof window.showToast === "function") {
        window.showToast("JSON の読み込みに失敗しました");
      }
    } finally {
      customPromptImportInput.value = "";
    }
  }

  function exportCustomPrompt() {
    const payload = createPageStateExportPayload();
    downloadTextFile(
      `${JSON.stringify(payload, null, 2)}\n`,
      buildCustomPromptExportFilename(),
      "application/json;charset=utf-8"
    );
    if (typeof window.showToast === "function") {
      window.showToast(
        payload.isSample
          ? "データが空のためサンプルJSONを出力しました"
          : "画面状態を JSON でエクスポートしました"
      );
    }
  }

  function createSeriesVisibilityMenu() {
    const menuPanel = document.querySelector("lht-page-menu .md-menu-panel") as HTMLDivElement | null;
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
      clearImportedCustomPromptStorage();
      customPromptState = null;
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
    void importCustomPromptFile(customPromptImportInput.files?.[0] || null);
  });
  copyShareLinkButton.addEventListener("click", () => {
    void copyText(buildShareLink());
  });

  let initialQuery = "";
  let initialPromptCode = "";
  let initialPromptId = "";
  const initialArgumentValues: Record<string, string> = {};
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
  } catch (_error) {
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
} else {
  initializePromptPage();
}
