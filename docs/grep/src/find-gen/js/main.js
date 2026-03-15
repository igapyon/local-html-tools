function quoteIfNeeded(value) {
  if (!value) return value;
  if(/[\s"]/g.test(value)) {
    const escaped = value.replace(/"/g, '\\"');
    return `"${escaped}"`;
  }
  return value;
}

function quoteAlways(value) {
  if (!value) return value;
  const escaped = value.replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function normalizePattern(pattern) {
  if (!pattern) return "";
  if (/[*?\[]/.test(pattern)) return pattern;
  return `*${pattern}*`;
}

function getToggleSelected(id, fallbackValue = false) {
  const element = document.getElementById(id);
  if (!element) return !!fallbackValue;
  if ("selected" in element) return !!element.selected;
  return !!element.checked;
}

function generateFindCommand({ silent = false } = {}) {
  const basePath = document.getElementById("basePath").value.trim() || ".";
  const targetType = document.getElementById("targetType").value;
  const namePattern = document.getElementById("namePattern").value.trim();
  const extension = document.getElementById("extension").value.trim();
  const caseInsensitive = getToggleSelected("caseInsensitive", false);
  const sizeComparator = document.getElementById("sizeComparator").value;
  const sizeValue = document.getElementById("sizeValue").value.trim();
  const sizeUnit = document.getElementById("sizeUnit").value;
  const mtimeComparator = document.getElementById("mtimeComparator").value;
  const mtimeValue = document.getElementById("mtimeValue").value.trim();
  const minDepth = document.getElementById("minDepth").value.trim();
  const maxDepth = document.getElementById("maxDepth").value.trim();
  const contentPattern = document.getElementById("contentPattern").value.trim();
  const useRipgrep = getToggleSelected("useRipgrep", true);

  const parts = [];
  const nameFlag = caseInsensitive ? "-iname" : "-name";

  if (maxDepth) {
    const num = Number(maxDepth);
    if (!Number.isInteger(num) || num < 0) {
      if (!silent) alert("最大深さは0以上の整数で入力してください。");
      document.getElementById("findCmd").textContent = "";
      return;
    }
    parts.push(`-maxdepth ${num}`);
  }
  if (minDepth) {
    const num = Number(minDepth);
    if (!Number.isInteger(num) || num < 0) {
      if (!silent) alert("最小深さは0以上の整数で入力してください。");
      document.getElementById("findCmd").textContent = "";
      return;
    }
    parts.push(`-mindepth ${num}`);
  }
  if (minDepth && maxDepth && Number(minDepth) > Number(maxDepth)) {
    if (!silent) alert("最小深さが最大深さを超えています。");
    document.getElementById("findCmd").textContent = "";
    return;
  }

  if (targetType === "file") parts.push("-type f");
  if (targetType === "dir") parts.push("-type d");

  if (namePattern) {
    const pattern = normalizePattern(namePattern);
    parts.push(`${nameFlag} "${pattern}"`);
  }

  if (extension) {
    const cleaned = extension.replace(/^\./, "").trim();
    if (cleaned) {
      parts.push(`${nameFlag} "*.${cleaned}"`);
    }
  }

  if (sizeValue) {
    const num = Number(sizeValue);
    if (!Number.isFinite(num) || num <= 0) {
      if (!silent) alert("サイズは正の数で入力してください。");
      document.getElementById("findCmd").textContent = "";
      return;
    }
    const sign = sizeComparator === "min" ? "+" : "-";
    parts.push(`-size ${sign}${num}${sizeUnit}`);
  }

  if (mtimeValue) {
    const num = Number(mtimeValue);
    if (!Number.isFinite(num) || num < 0) {
      if (!silent) alert("更新日数は0以上の数で入力してください。");
      document.getElementById("findCmd").textContent = "";
      return;
    }
    const sign = mtimeComparator === "within" ? "-" : "+";
    parts.push(`-mtime ${sign}${Math.floor(num)}`);
  }

  let cmd = `find ${quoteIfNeeded(basePath)}${parts.length ? " " + parts.join(" ") : ""}`;
  if (contentPattern) {
    const tool = useRipgrep ? "rg" : "grep -nE";
    const quoted = quoteAlways(contentPattern);
    cmd += ` -print0 | xargs -0 ${tool} ${quoted}`;
  }
  document.getElementById("findCmd").textContent = cmd;
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
  const handler = () => generateFindCommand({ silent: true });
  const ids = [
    "basePath", "targetType", "namePattern", "extension", "caseInsensitive",
    "sizeComparator", "sizeValue", "sizeUnit", "mtimeComparator", "mtimeValue",
    "minDepth", "maxDepth", "contentPattern", "useRipgrep"
  ];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", handler);
    el.addEventListener("change", handler);
  });
}

setupAutoUpdate();
generateFindCommand({ silent: true });
