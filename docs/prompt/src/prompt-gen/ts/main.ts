type PromptDefinition = {
  id: string;
  label: string;
  keywords: string[];
  requiresCommitId: boolean;
  buildBody: (commitId: string) => string;
};

declare const promptDefinitions: PromptDefinition[];

async function initializePromptPage() {
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

  function applyLatinInputHints(field: HTMLInputElement, enterKeyHint: string) {
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

  function buildSearchTokens(definition: PromptDefinition) {
    const tokens = new Set<string>();
    const label = (definition.label || "").toLowerCase();
    const keywords = Array.isArray(definition.keywords) ? definition.keywords : [];

    if (label) {
      tokens.add(label);
      for (const part of label.split(/\s+/).filter(Boolean)) {
        tokens.add(part);
        const hiraganaPart = toHiragana(part);
        const katakanaPart = toKatakana(part);
        if (hiraganaPart !== part) {
          tokens.add(hiraganaPart);
        }
        if (katakanaPart !== part) {
          tokens.add(katakanaPart);
        }
        const romaji = kanaToRomaji(part);
        if (romaji) {
          tokens.add(romaji);
        }
      }
    }

    for (const keyword of keywords) {
      const normalizedKeyword = String(keyword || "").toLowerCase().trim();
      if (!normalizedKeyword) {
        continue;
      }
      tokens.add(normalizedKeyword);
      const hiraganaKeyword = toHiragana(normalizedKeyword);
      const katakanaKeyword = toKatakana(normalizedKeyword);
      if (hiraganaKeyword !== normalizedKeyword) {
        tokens.add(hiraganaKeyword);
      }
      if (katakanaKeyword !== normalizedKeyword) {
        tokens.add(katakanaKeyword);
      }
      const romajiKeyword = kanaToRomaji(normalizedKeyword);
      if (romajiKeyword) {
        tokens.add(romajiKeyword);
      }
      for (const part of normalizedKeyword.split(/\s+/).filter(Boolean)) {
        tokens.add(part);
        const hiraganaPart = toHiragana(part);
        const katakanaPart = toKatakana(part);
        if (hiraganaPart !== part) {
          tokens.add(hiraganaPart);
        }
        if (katakanaPart !== part) {
          tokens.add(katakanaPart);
        }
        const romaji = kanaToRomaji(part);
        if (romaji) {
          tokens.add(romaji);
        }
      }
    }

    return Array.from(tokens);
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

  function createCandidateButton(definition: PromptDefinition) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "md-chip-button";
    button.dataset.promptId = definition.id;
    button.addEventListener("click", () => selectPrompt(definition.id, button));

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
    const matchedDefinitions = query
      ? promptDefinitions.filter((definition) =>
          terms.every((term) =>
            buildSearchTokens(definition).some((token) => token.includes(term))
          )
        )
      : promptDefinitions;
    matchedDefinitions.sort((left, right) => {
      if (left.label < right.label) return -1;
      if (left.label > right.label) return 1;
      return 0;
    });

    if (matchedDefinitions.length === 0) {
      if (selectedPrompt) {
        selectedPrompt = "";
        commitInputSection.classList.add("md-hidden");
        promptOutputSection.classList.add("md-hidden");
        updateOutput();
      }
      return;
    }

    const hasSingleMatch = matchedDefinitions.length === 1;

    if (hasSingleMatch && !selectedPrompt) {
      selectedPrompt = matchedDefinitions[0].id;
    } else if (
      !hasSingleMatch &&
      selectedPrompt &&
      !matchedDefinitions.some((definition) => definition.id === selectedPrompt)
    ) {
      selectedPrompt = "";
    }

    for (const definition of matchedDefinitions) {
      const button = createCandidateButton(definition);
      if (hasSingleMatch && selectedPrompt === definition.id) {
        button.classList.add("is-active");
      }
      promptCandidateArea.appendChild(button);
    }

    if (hasSingleMatch && selectedPrompt === matchedDefinitions[0].id) {
      const selectedDefinition = matchedDefinitions[0];
      if (selectedDefinition.requiresCommitId) {
        commitInputSection.classList.remove("md-hidden");
      } else {
        commitInputSection.classList.add("md-hidden");
      }
      promptOutputSection.classList.remove("md-hidden");
      updateOutput();
    }
  }

  function selectPrompt(id: string, button: HTMLButtonElement) {
    selectedPrompt = id;
    for (const element of promptCandidateArea.querySelectorAll(".md-chip-button")) {
      element.classList.remove("is-active");
    }
    button.classList.add("is-active");

    promptOutputSection.classList.remove("md-hidden");

    const selectedDefinition = promptDefinitions.find((definition) => definition.id === id);
    if (selectedDefinition?.requiresCommitId) {
      commitInputSection.classList.remove("md-hidden");
      commitIdInput.focus();
    } else {
      commitInputSection.classList.add("md-hidden");
    }

    updateOutput();
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
} else {
  initializePromptPage();
}
