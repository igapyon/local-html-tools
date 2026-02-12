const xmlInput = document.getElementById("xmlInput");
    const fileInput = document.getElementById("fileInput");
    const defaultTitleInput = document.getElementById("defaultTitleInput");
    const defaultComposerInput = document.getElementById("defaultComposerInput");
    const defaultLengthSelect = document.getElementById("defaultLengthSelect");
    const convertBtn = document.getElementById("convertBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const copyBtn = document.getElementById("copyBtn");
    const previewText = document.getElementById("previewText");
    const abcOutput = document.getElementById("abcOutput");
    const errorText = document.getElementById("errorText");
    const warningText = document.getElementById("warningText");
    const toast = document.getElementById("toast");
    const menuPanel = document.getElementById("menuPanel");

    const SETTINGS_KEY = "musicxml-to-abc-settings";

    let lastAbc = "";

    restoreSettings();

    convertBtn.addEventListener("click", convertMusicXml);
    downloadBtn.addEventListener("click", downloadAbc);
    copyBtn.addEventListener("click", copyAbc);
    fileInput.addEventListener("change", loadXmlFile);
    defaultTitleInput.addEventListener("change", persistSettings);
    defaultComposerInput.addEventListener("change", persistSettings);
    defaultLengthSelect.addEventListener("change", persistSettings);
    document.addEventListener("click", handleDocumentClick);

    convertMusicXml();

    function loadXmlFile(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        xmlInput.value = String(reader.result || "");
        showToast("MusicXMLを読み込みました。");
      };
      reader.onerror = () => {
        setError("ファイルの読み込みに失敗しました。");
      };
      reader.readAsText(file, "utf-8");
    }

    function convertMusicXml() {
      const source = normalizeSource(xmlInput.value);
      if (!source) {
        setError("MusicXMLソースを入力してください。");
        resetOutput();
        return;
      }

      clearError();
      clearWarning();

      try {
        const result = parseMusicXml(source, {
          defaultTitle: defaultTitleInput.value.trim() || "Untitled",
          defaultComposer: defaultComposerInput.value.trim() || "Unknown",
          defaultLength: parseFraction(defaultLengthSelect.value)
        });

        lastAbc = result.abc;
        abcOutput.textContent = result.abc;
        previewText.textContent = [
          "title: " + result.meta.title,
          "composer: " + result.meta.composer,
          "meter: " + result.meta.meter,
          "unit length: " + result.meta.defaultLengthText,
          "key: " + result.meta.key,
          "measures: " + result.meta.measureCount,
          "notes/rests: " + result.meta.noteCount
        ].join("\n");

        downloadBtn.disabled = false;

        if (result.warnings.length > 0) {
          warningText.textContent = "警告:\n" + result.warnings.join("\n");
          warningText.classList.remove("md-hidden");
        }

        showToast("ABCを生成しました。");
      } catch (error) {
        resetOutput();
        const message = error && error.message ? error.message : String(error);
        setError("変換に失敗しました: " + message);
      }
    }

    function parseMusicXml(source, settings) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(source, "application/xml");
      const parseErr = xmlDoc.querySelector("parsererror");
      if (parseErr) {
        throw new Error("XMLの構文解釈に失敗しました。");
      }

      const root = xmlDoc.documentElement;
      if (!root || root.nodeName !== "score-partwise") {
        throw new Error("score-partwise 形式のMusicXMLに対応しています。");
      }

      const warnings = [];
      const part = root.querySelector("part");
      if (!part) {
        throw new Error("part が見つかりません。");
      }

      const title = textOrFallback(
        root.querySelector("work > work-title") || root.querySelector("movement-title"),
        settings.defaultTitle
      );
      const composer = textOrFallback(
        root.querySelector('identification > creator[type="composer"]') || root.querySelector("identification > creator"),
        settings.defaultComposer
      );

      let divisions = 1;
      let meter = { beats: 4, beatType: 4 };
      let key = "C";
      let noteCount = 0;
      const measures = [];

      const measureNodes = Array.from(part.children).filter((node) => node.nodeType === 1 && node.nodeName === "measure");
      if (measureNodes.length === 0) {
        throw new Error("measure が見つかりません。");
      }

      let warnedBackup = false;
      let warnedForward = false;
      let warnedChord = false;
      let warnedTie = false;

      for (const measureNode of measureNodes) {
        const measureNo = measureNode.getAttribute("number") || String(measures.length + 1);
        const attrNode = measureNode.querySelector(":scope > attributes");
        if (attrNode) {
          const divText = getChildText(attrNode, "divisions");
          if (divText) {
            const divVal = Number.parseInt(divText, 10);
            if (Number.isFinite(divVal) && divVal > 0) {
              divisions = divVal;
            }
          }

          const beatsText = getChildText(attrNode.querySelector("time"), "beats");
          const beatTypeText = getChildText(attrNode.querySelector("time"), "beat-type");
          if (beatsText && beatTypeText) {
            const beatsVal = Number.parseInt(beatsText, 10);
            const beatTypeVal = Number.parseInt(beatTypeText, 10);
            if (beatsVal > 0 && beatTypeVal > 0) {
              meter = { beats: beatsVal, beatType: beatTypeVal };
            }
          }

          const fifthsText = getChildText(attrNode.querySelector("key"), "fifths");
          const modeText = getChildText(attrNode.querySelector("key"), "mode") || "major";
          if (fifthsText !== "") {
            const fifthsVal = Number.parseInt(fifthsText, 10);
            if (Number.isFinite(fifthsVal)) {
              key = keyFromFifths(fifthsVal, modeText);
            }
          }
        }

        const tokens = [];

        for (const child of Array.from(measureNode.children)) {
          const name = child.nodeName;
          if (name === "note") {
            const noteToken = noteToAbc(child, divisions, settings.defaultLength, warnings, measureNo);
            if (noteToken.skipped) {
              if (noteToken.reason === "chord" && !warnedChord) {
                warnings.push("和音（<chord/>）は先頭音のみ扱います。");
                warnedChord = true;
              }
              continue;
            }
            tokens.push(noteToken.token);
            if (noteToken.reason === "tie" && !warnedTie) {
              warnings.push("タイ/スラーは出力していません。");
              warnedTie = true;
            }
            noteCount += 1;
          } else if (name === "backup") {
            if (!warnedBackup) {
              warnings.push("backup 要素（複数声部）はMVPでは非対応です。");
              warnedBackup = true;
            }
          } else if (name === "forward") {
            if (!warnedForward) {
              warnings.push("forward 要素（複数声部）はMVPでは非対応です。");
              warnedForward = true;
            }
          }
        }

        if (tokens.length === 0) {
          tokens.push("z");
          warnings.push("measure " + measureNo + ": 要素が空のため休符 z を補完しました。");
        }

        measures.push(tokens.join(" "));
      }

      if (noteCount === 0) {
        throw new Error("変換対象の note/rest が見つかりませんでした。");
      }

      const meterText = meter.beats + "/" + meter.beatType;
      const defaultLengthText = settings.defaultLength.num + "/" + settings.defaultLength.den;
      const body = measures.join(" | ") + " |";
      const abcLines = [
        "X:1",
        "T:" + title,
        "C:" + composer,
        "M:" + meterText,
        "L:" + defaultLengthText,
        "K:" + key,
        body
      ];

      return {
        abc: abcLines.join("\n"),
        meta: {
          title,
          composer,
          meter: meterText,
          defaultLengthText,
          key,
          measureCount: measures.length,
          noteCount
        },
        warnings
      };
    }

    function noteToAbc(noteNode, divisions, defaultLength, warnings, measureNo) {
      if (noteNode.querySelector(":scope > grace")) {
        warnings.push("measure " + measureNo + ": grace note はスキップしました。");
        return { skipped: true, reason: "grace" };
      }
      if (noteNode.querySelector(":scope > chord")) {
        return { skipped: true, reason: "chord" };
      }

      const durationText = getChildText(noteNode, "duration");
      if (!durationText) {
        warnings.push("measure " + measureNo + ": duration が無い note をスキップしました。");
        return { skipped: true, reason: "duration" };
      }
      const durationVal = Number.parseInt(durationText, 10);
      if (!Number.isFinite(durationVal) || durationVal <= 0) {
        warnings.push("measure " + measureNo + ": duration が不正な note をスキップしました。");
        return { skipped: true, reason: "duration" };
      }

      const ratio = divideFractions(reduceFraction(durationVal, divisions * 4), defaultLength);
      const lengthToken = abcLengthToken(ratio);

      if (noteNode.querySelector(":scope > rest")) {
        return { skipped: false, token: "z" + lengthToken };
      }

      const step = getChildText(noteNode.querySelector(":scope > pitch"), "step");
      const octaveText = getChildText(noteNode.querySelector(":scope > pitch"), "octave");
      if (!step || !octaveText) {
        warnings.push("measure " + measureNo + ": pitch 情報が不完全な note をスキップしました。");
        return { skipped: true, reason: "pitch" };
      }

      const octave = Number.parseInt(octaveText, 10);
      if (!Number.isFinite(octave)) {
        warnings.push("measure " + measureNo + ": octave が不正な note をスキップしました。");
        return { skipped: true, reason: "octave" };
      }

      const alterText = getChildText(noteNode.querySelector(":scope > pitch"), "alter");
      const alter = alterText === "" ? 0 : Number.parseInt(alterText, 10);
      const accidental = accidentalFromAlter(Number.isFinite(alter) ? alter : 0);

      if (noteNode.querySelector(":scope > tie") || noteNode.querySelector(":scope > notations > tied")) {
        return {
          skipped: false,
          reason: "tie",
          token: accidental + abcPitch(step, octave) + lengthToken
        };
      }

      return {
        skipped: false,
        token: accidental + abcPitch(step, octave) + lengthToken
      };
    }

    function abcPitch(step, octave) {
      const upperStep = step.toUpperCase();
      if (!/^[A-G]$/.test(upperStep)) {
        return "C";
      }

      if (octave >= 5) {
        return upperStep.toLowerCase() + "'".repeat(octave - 5);
      }
      return upperStep + ",".repeat(Math.max(0, 4 - octave));
    }

    function accidentalFromAlter(alter) {
      if (alter === 0) {
        return "";
      }
      if (alter > 0) {
        return "^".repeat(Math.min(2, alter));
      }
      return "_".repeat(Math.min(2, Math.abs(alter)));
    }

    function abcLengthToken(ratio) {
      const reduced = reduceFraction(ratio.num, ratio.den);
      if (reduced.num === reduced.den) {
        return "";
      }
      if (reduced.den === 1) {
        return String(reduced.num);
      }
      if (reduced.num === 1 && reduced.den === 2) {
        return "/";
      }
      if (reduced.num === 1) {
        return "/" + reduced.den;
      }
      return reduced.num + "/" + reduced.den;
    }

    function keyFromFifths(fifths, mode) {
      const major = ["Cb", "Gb", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#"];
      const minor = ["Abm", "Ebm", "Bbm", "Fm", "Cm", "Gm", "Dm", "Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "A#m"];
      const idx = fifths + 7;
      if (idx < 0 || idx >= major.length) {
        return "C";
      }
      const lowerMode = String(mode || "").toLowerCase();
      if (lowerMode === "minor") {
        return minor[idx];
      }
      return major[idx];
    }

    function getChildText(parent, tagName) {
      if (!parent) {
        return "";
      }
      const node = parent.querySelector(":scope > " + tagName);
      return node ? node.textContent.trim() : "";
    }

    function textOrFallback(node, fallback) {
      if (!node) {
        return fallback;
      }
      const text = node.textContent ? node.textContent.trim() : "";
      return text || fallback;
    }

    function parseFraction(text) {
      const m = String(text || "").match(/^\s*(\d+)\/(\d+)\s*$/);
      if (!m) {
        return { num: 1, den: 8 };
      }
      const num = Number.parseInt(m[1], 10);
      const den = Number.parseInt(m[2], 10);
      if (!num || !den) {
        return { num: 1, den: 8 };
      }
      return reduceFraction(num, den);
    }

    function divideFractions(a, b) {
      return reduceFraction(a.num * b.den, a.den * b.num);
    }

    function reduceFraction(num, den) {
      if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
        return { num: 1, den: 1 };
      }
      const sign = den < 0 ? -1 : 1;
      const n = num * sign;
      const d = den * sign;
      const g = gcd(Math.abs(n), Math.abs(d));
      return { num: n / g, den: d / g };
    }

    function gcd(a, b) {
      let x = a || 1;
      let y = b || 1;
      while (y !== 0) {
        const t = x % y;
        x = y;
        y = t;
      }
      return x || 1;
    }

    function normalizeSource(rawText) {
      if (!rawText) {
        return "";
      }

      const lines = rawText.split("\n");
      let first = 0;
      let last = lines.length - 1;

      while (first <= last && lines[first].trim() === "") {
        first += 1;
      }
      while (last >= first && lines[last].trim() === "") {
        last -= 1;
      }
      if (first > last) {
        return "";
      }

      const firstLine = lines[first].trim();
      const lastLine = lines[last].trim();
      const hasCodeFencePair = /^```.*$/.test(firstLine) && /^```\s*$/.test(lastLine);
      if (hasCodeFencePair) {
        return lines.slice(first + 1, last).join("\n").trim();
      }

      return lines.slice(first, last + 1).join("\n").trim();
    }

    function resetOutput() {
      lastAbc = "";
      abcOutput.textContent = "";
      previewText.textContent = "未変換";
      downloadBtn.disabled = true;
    }

    function downloadAbc() {
      if (!lastAbc) {
        setError("先に変換してください。");
        return;
      }
      const blob = new Blob([lastAbc], { type: "text/plain;charset=utf-8" });
      downloadBlob(blob, "score.abc");
      showToast("ABCを保存しました。");
    }

    function copyAbc() {
      if (!lastAbc) {
        setError("先に変換してください。");
        return;
      }
      navigator.clipboard.writeText(lastAbc).then(() => {
        clearError();
        showToast("ABCをコピーしました。");
      }).catch((error) => {
        setError("コピーに失敗しました: " + (error && error.message ? error.message : String(error)));
      });
    }

    function setError(message) {
      errorText.textContent = message;
      errorText.classList.remove("md-hidden");
    }

    function clearError() {
      errorText.textContent = "";
      errorText.classList.add("md-hidden");
    }

    function clearWarning() {
      warningText.textContent = "";
      warningText.classList.add("md-hidden");
    }

    function showToast(message) {
      toast.textContent = message;
      toast.classList.remove("md-hidden");
      toast.classList.add("md-visible");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => {
        toast.classList.remove("md-visible");
        toast.classList.add("md-hidden");
      }, 1400);
    }

    function toggleMenu() {
      menuPanel.classList.toggle("md-hidden");
    }

    function handleDocumentClick(event) {
      const menuButton = event.target.closest(".md-menu-button");
      if (menuButton) {
        return;
      }
      if (!event.target.closest("#menuPanel")) {
        menuPanel.classList.add("md-hidden");
      }
    }

    function downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function persistSettings() {
      const payload = {
        defaultTitle: defaultTitleInput.value,
        defaultComposer: defaultComposerInput.value,
        defaultLength: defaultLengthSelect.value
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
    }

    function restoreSettings() {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        return;
      }
      try {
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          if (typeof data.defaultTitle === "string") {
            defaultTitleInput.value = data.defaultTitle;
          }
          if (typeof data.defaultComposer === "string") {
            defaultComposerInput.value = data.defaultComposer;
          }
          if (typeof data.defaultLength === "string") {
            defaultLengthSelect.value = data.defaultLength;
          }
        }
      } catch (_error) {
        // ignore broken localStorage
      }
    }
