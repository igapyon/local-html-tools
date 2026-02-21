const CHARSET = {
  upper: "ADEFHMNRTY",
  lower: "adefhmnrty",
  digits: "0123456789",
  symbols: "@#$"
};

function getToggleSelected(id, fallbackValue = false) {
  const element = document.getElementById(id);
  if (!element) return !!fallbackValue;
  if ("selected" in element) return !!element.selected;
  return !!element.checked;
}

function secureRandomInt(max) {
  const maxUint = 0xffffffff;
  const limit = Math.floor(maxUint / max) * max;
  const buffer = new Uint32Array(1);
  let value = 0;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % max;
}

function pickAndRemove(arr) {
  const index = secureRandomInt(arr.length);
  return arr.splice(index, 1)[0];
}

function removeChar(arr, char) {
  const index = arr.indexOf(char);
  if (index !== -1) arr.splice(index, 1);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function buildGroups() {
  return [
    { key: "upper", label: "英大文字", enabled: getToggleSelected("useUpper", true), chars: CHARSET.upper.split("") },
    { key: "lower", label: "英小文字", enabled: getToggleSelected("useLower", true), chars: CHARSET.lower.split("") },
    { key: "digits", label: "数字", enabled: getToggleSelected("useDigits", true), chars: CHARSET.digits.split("") },
    { key: "symbols", label: "記号", enabled: getToggleSelected("useSymbols", true), chars: CHARSET.symbols.split("") }
  ];
}

function generatePassword({ silent = false } = {}) {
  const length = Number(document.getElementById("lengthInput").value);
  const output = document.getElementById("passwordOutput");

  if (!Number.isInteger(length) || length <= 0) {
    if (!silent) alert("文字数は1以上の整数で入力してください。");
    output.textContent = "";
    return;
  }

  const groups = buildGroups().filter((group) => group.enabled);
  if (groups.length === 0) {
    if (!silent) alert("文字種を1つ以上選択してください。");
    output.textContent = "";
    return;
  }

  const letterGroups = groups.filter((group) => group.key === "upper" || group.key === "lower");
  if (letterGroups.length === 0) {
    if (!silent) alert("英大文字または英小文字を選択してください。");
    output.textContent = "";
    return;
  }

  if (length < groups.length) {
    if (!silent) alert("選択した文字種の数より文字数が少ないため生成できません。");
    output.textContent = "";
    return;
  }

  const totalUnique = groups.reduce((sum, group) => sum + group.chars.length, 0);
  const allowDuplicates = length > totalUnique;

  const remainingByGroup = new Map();
  groups.forEach((group) => {
    remainingByGroup.set(group.key, group.chars.slice());
  });
  const remainingAll = groups.flatMap((group) => group.chars.slice());
  const allChars = groups.flatMap((group) => group.chars.slice());

  const passwordChars = [];

  const firstGroup = letterGroups[secureRandomInt(letterGroups.length)];
  const firstPool = remainingByGroup.get(firstGroup.key);
  const firstChar = pickAndRemove(firstPool);
  removeChar(remainingAll, firstChar);
  passwordChars.push(firstChar);

  groups.forEach((group) => {
    if (group.key === firstGroup.key) return;
    const pool = remainingByGroup.get(group.key);
    if (pool.length === 0) return;
    const char = pickAndRemove(pool);
    removeChar(remainingAll, char);
    passwordChars.push(char);
  });

  while (passwordChars.length < length) {
    if (remainingAll.length > 0) {
      const char = pickAndRemove(remainingAll);
      for (const pool of remainingByGroup.values()) {
        removeChar(pool, char);
      }
      passwordChars.push(char);
      continue;
    }

    if (!allowDuplicates) break;

    const char = allChars[secureRandomInt(allChars.length)];
    passwordChars.push(char);
  }

  if (passwordChars.length < length) {
    if (!silent) alert("条件を満たす文字が不足しています。文字数を減らすか文字種を増やしてください。");
    output.textContent = "";
    return;
  }

  const head = passwordChars[0];
  const tail = passwordChars.slice(1);
  shuffleArray(tail);
  const password = [head, ...tail].join("");

  output.textContent = password;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("md-visible");
  setTimeout(() => {
    toast.classList.remove("md-visible");
  }, 2000);
}

function setupAutoUpdate() {
  const handler = () => generatePassword({ silent: true });
  ["useUpper", "useLower", "useDigits", "useSymbols", "lengthInput"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", handler);
    el.addEventListener("change", handler);
  });
}

setupAutoUpdate();
generatePassword({ silent: true });
