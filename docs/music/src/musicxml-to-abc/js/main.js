const musicXmlCommon = window["MusicXmlCommon"] || (typeof MusicXmlCommon !== "undefined" ? MusicXmlCommon : null);
const musicXmlSynthScheduleCommon = window["MusicXmlSynthScheduleCommon"] || (typeof MusicXmlSynthScheduleCommon !== "undefined" ? MusicXmlSynthScheduleCommon : null);
const musicSynthCommon = window["MusicSynthCommon"] || (typeof MusicSynthCommon !== "undefined" ? MusicSynthCommon : null);
const abcCommon = window["AbcCommon"] || (typeof AbcCommon !== "undefined" ? AbcCommon : null);
if (!musicXmlCommon) {
    throw new Error("MusicXmlCommon is not loaded.");
}
if (!musicXmlSynthScheduleCommon) {
    throw new Error("MusicXmlSynthScheduleCommon is not loaded.");
}
if (!musicSynthCommon) {
    throw new Error("MusicSynthCommon is not loaded.");
}
if (!abcCommon) {
    throw new Error("AbcCommon is not loaded.");
}
const xmlInput = document.getElementById("xmlInput");
const fileInput = document.getElementById("fileInput");
const inputModeSourceRadio = document.getElementById("inputModeSource");
const inputModeFileRadio = document.getElementById("inputModeFile");
const sourceInputBlock = document.getElementById("sourceInputBlock");
const fileInputBlock = document.getElementById("fileInputBlock");
const fileSelectBtn = document.getElementById("fileSelectBtn");
const fileNameText = document.getElementById("fileNameText");
const defaultTitleInput = document.getElementById("defaultTitleInput");
const defaultComposerInput = document.getElementById("defaultComposerInput");
const defaultLengthSelect = document.getElementById("defaultLengthSelect");
const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const playSineBtn = document.getElementById("playSineBtn");
const copyBtn = document.getElementById("copyBtn");
const previewText = document.getElementById("previewText");
const abcOutput = document.getElementById("abcOutput");
const errorText = document.getElementById("errorText");
const warningText = document.getElementById("warningText");
const toast = document.getElementById("toast");
const menuPanel = document.getElementById("menuPanel");
const SETTINGS_KEY = "musicxml-to-abc-settings";
const MIDI_TICKS_PER_QUARTER = 128;
let lastAbc = "";
let lastSynthSchedule = null;
const synthEngine = musicSynthCommon.createBasicWaveSynthEngine({
    ticksPerQuarter: MIDI_TICKS_PER_QUARTER
});
restoreSettings();
convertBtn.addEventListener("click", convertMusicXml);
downloadBtn.addEventListener("click", downloadAbc);
playSineBtn.addEventListener("click", playSine);
copyBtn.addEventListener("click", copyAbc);
fileInput.addEventListener("change", loadXmlFile);
fileSelectBtn.addEventListener("click", () => fileInput.click());
inputModeSourceRadio.addEventListener("change", applyInputMode);
inputModeFileRadio.addEventListener("change", applyInputMode);
defaultTitleInput.addEventListener("change", persistSettings);
defaultComposerInput.addEventListener("change", persistSettings);
defaultLengthSelect.addEventListener("change", persistSettings);
document.addEventListener("click", handleDocumentClick);
applyInputMode();
convertMusicXml();
function loadXmlFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
        updateFileName("");
        return;
    }
    inputModeFileRadio.checked = true;
    applyInputMode();
    updateFileName(file.name);
    musicXmlCommon.readTextFileUtf8(file, (text) => {
        xmlInput.value = text;
        showToast("MusicXMLを読み込みました。");
    }, () => {
        setError("ファイルの読み込みに失敗しました。");
    });
}
function updateFileName(name) {
    fileNameText.textContent = name || "未選択";
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
        lastSynthSchedule = musicXmlSynthScheduleCommon.buildSynthScheduleFromMusicXml(source, {
            ticksPerQuarter: MIDI_TICKS_PER_QUARTER
        });
        abcOutput.textContent = result.abc;
        previewText.textContent = [
            "title: " + result.meta.title,
            "composer: " + result.meta.composer,
            "meter: " + result.meta.meter,
            "unit length: " + result.meta.defaultLengthText,
            "key: " + result.meta.key,
            "voices: " + result.meta.voiceCount,
            "measures: " + result.meta.measureCount,
            "notes/rests: " + result.meta.noteCount
        ].join("\n");
        downloadBtn.disabled = false;
        playSineBtn.disabled = !lastSynthSchedule || lastSynthSchedule.events.length === 0;
        if (result.warnings.length > 0) {
            warningText.textContent = "警告:\n" + result.warnings.join("\n");
            warningText.classList.remove("md-hidden");
        }
        showToast("ABCを生成しました。");
    }
    catch (error) {
        resetOutput();
        const message = error && error.message ? error.message : String(error);
        setError("変換に失敗しました: " + message);
    }
}
function parseMusicXml(source, settings) {
    const xmlDoc = musicXmlCommon.parseScorePartwiseXml(source);
    const root = xmlDoc.documentElement;
    const warnings = [];
    const partNodes = Array.from(root.children).filter((node) => node.nodeType === 1 && node.nodeName === "part");
    if (partNodes.length === 0) {
        throw new Error("part が見つかりません。");
    }
    const partNameById = buildPartNameMap(root);
    const title = textOrFallback(root.querySelector("work > work-title") || root.querySelector("movement-title"), settings.defaultTitle);
    const composer = textOrFallback(root.querySelector('identification > creator[type="composer"]') || root.querySelector("identification > creator"), settings.defaultComposer);
    let divisions = 1;
    let meter = { beats: 4, beatType: 4 };
    let key = "C";
    let keyFifths = 0;
    let noteCount = 0;
    const voices = [];
    let warnedBackup = false;
    let warnedForward = false;
    let warnedChord = false;
    let warnedTie = false;
    for (let partIndex = 0; partIndex < partNodes.length; partIndex += 1) {
        const part = partNodes[partIndex];
        const partId = part.getAttribute("id") || ("P" + String(partIndex + 1));
        const voiceId = "V" + String(partIndex + 1);
        const originalPartName = partNameById[partId] || partId;
        let partName = originalPartName;
        let currentTransposeSemitones = 0;
        let currentWrittenFifths = 0;
        let currentWrittenMode = "major";
        let partTransposeApplied = false;
        const measures = [];
        const measureNodes = Array.from(part.children).filter((node) => node.nodeType === 1 && node.nodeName === "measure");
        if (measureNodes.length === 0) {
            warnings.push("part " + partName + ": measure が見つかりません。");
            continue;
        }
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
                let shouldRecalculateKey = false;
                const transposeNode = attrNode.querySelector(":scope > transpose");
                if (transposeNode) {
                    const chromaticText = getChildText(transposeNode, "chromatic");
                    const octaveChangeText = getChildText(transposeNode, "octave-change");
                    const chromatic = chromaticText ? Number.parseInt(chromaticText, 10) : 0;
                    const octaveChange = octaveChangeText ? Number.parseInt(octaveChangeText, 10) : 0;
                    currentTransposeSemitones =
                        (Number.isFinite(chromatic) ? chromatic : 0) +
                            ((Number.isFinite(octaveChange) ? octaveChange : 0) * 12);
                    if (currentTransposeSemitones !== 0) {
                        partTransposeApplied = true;
                    }
                    shouldRecalculateKey = true;
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
                        currentWrittenFifths = fifthsVal;
                        currentWrittenMode = modeText;
                        shouldRecalculateKey = true;
                    }
                }
                if (shouldRecalculateKey) {
                    const transposed = transposeKeyFromFifthsMode(currentWrittenFifths, currentWrittenMode, currentTransposeSemitones);
                    key = transposed.keyText;
                    keyFifths = transposed.fifths;
                }
            }
            const tokens = [];
            const measureAccidentals = {};
            for (const child of Array.from(measureNode.children)) {
                const name = child.nodeName;
                if (name === "note") {
                    const noteToken = noteToAbc(child, divisions, settings.defaultLength, warnings, measureNo, currentTransposeSemitones, keyFifths, measureAccidentals);
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
                }
                else if (name === "backup") {
                    if (!warnedBackup) {
                        warnings.push("backup 要素（複数声部）はMVPでは非対応です。");
                        warnedBackup = true;
                    }
                }
                else if (name === "forward") {
                    if (!warnedForward) {
                        warnings.push("forward 要素（複数声部）はMVPでは非対応です。");
                        warnedForward = true;
                    }
                }
            }
            if (tokens.length === 0) {
                tokens.push("z");
                warnings.push("part " + partName + " measure " + measureNo + ": 要素が空のため休符 z を補完しました。");
            }
            measures.push(tokens.join(" "));
        }
        voices.push({
            id: voiceId,
            name: normalizePartNameForAbc(partName, partTransposeApplied),
            measures
        });
    }
    if (noteCount === 0) {
        throw new Error("変換対象の note/rest が見つかりませんでした。");
    }
    const meterText = meter.beats + "/" + meter.beatType;
    const defaultLengthText = settings.defaultLength.num + "/" + settings.defaultLength.den;
    const abcLines = [
        "X:1",
        "T:" + title,
        "C:" + composer,
        "M:" + meterText,
        "L:" + defaultLengthText,
        "K:" + key
    ];
    if (voices.length > 1) {
        abcLines.push("%%score " + voices.map((voice) => "(" + voice.id + ")").join(" "));
    }
    for (const voice of voices) {
        if (voices.length > 1) {
            abcLines.push("V:" + voice.id + ' name="' + escapeAbcText(voice.name || voice.id) + '"');
        }
        abcLines.push(voice.measures.join(" | ") + " |");
    }
    const measureCount = voices.reduce((acc, voice) => Math.max(acc, voice.measures.length), 0);
    return {
        abc: abcLines.join("\n"),
        meta: {
            title,
            composer,
            meter: meterText,
            defaultLengthText,
            key,
            voiceCount: voices.length,
            measureCount,
            noteCount
        },
        warnings
    };
}
function noteToAbc(noteNode, divisions, defaultLength, warnings, measureNo, transposeSemitones, keyFifths, measureAccidentals) {
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
    const ratio = abcCommon.divideFractions(abcCommon.reduceFraction(durationVal, divisions * 4, { num: 1, den: 1 }), defaultLength, { num: 1, den: 1 });
    const lengthToken = abcCommon.abcLengthTokenFromFraction(ratio);
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
    const baseAlter = Number.isFinite(alter) ? alter : 0;
    const midiNumber = stepAlterOctaveToMidiNumber(step, baseAlter, octave) + (Number.isFinite(transposeSemitones) ? transposeSemitones : 0);
    if (midiNumber < 0 || midiNumber > 127) {
        warnings.push("measure " + measureNo + ": 移調後に音域外となる note をスキップしました。");
        return { skipped: true, reason: "transpose-range" };
    }
    const transposed = midiNumberToStepAlterOctave(midiNumber, keyFifths < 0);
    const outStep = transposed.step;
    const outOctave = transposed.octave;
    const outAlter = transposed.alter;
    const keySignature = keySignatureAlterByStep(keyFifths);
    const measureDefaultAlter = Object.prototype.hasOwnProperty.call(measureAccidentals, outStep)
        ? measureAccidentals[outStep]
        : (Object.prototype.hasOwnProperty.call(keySignature, outStep) ? keySignature[outStep] : 0);
    let accidental = "";
    if (outAlter !== measureDefaultAlter) {
        accidental = outAlter === 0 ? "=" : abcCommon.accidentalFromAlter(outAlter);
    }
    measureAccidentals[outStep] = outAlter;
    const pitchText = abcCommon.abcPitchFromStepOctave(outStep, outOctave);
    if (noteNode.querySelector(":scope > tie") || noteNode.querySelector(":scope > notations > tied")) {
        return {
            skipped: false,
            reason: "tie",
            token: accidental + pitchText + lengthToken
        };
    }
    return {
        skipped: false,
        token: accidental + pitchText + lengthToken
    };
}
function keyFromFifths(fifths, mode) {
    return abcCommon.keyFromFifthsMode(fifths, mode);
}
function transposeKeyFromFifthsMode(fifths, mode, transposeSemitones) {
    const normalizedMode = normalizeModeName(mode);
    const modeOffset = modeDegreeOffset(normalizedMode);
    const tonicPc = mod12((fifths * 7) + modeOffset);
    const transposedPc = mod12(tonicPc + transposeSemitones);
    const preferFlats = fifths < 0;
    const keyText = abcKeyFromPitchClassMode(transposedPc, normalizedMode, preferFlats);
    return {
        keyText,
        fifths: fifthsFromPitchClassMode(transposedPc, normalizedMode)
    };
}
function normalizeModeName(mode) {
    const normalized = String(mode || "major").trim().toLowerCase();
    if (normalized === "minor") {
        return "aeolian";
    }
    if (normalized === "major") {
        return "ionian";
    }
    return normalized;
}
function modeDegreeOffset(mode) {
    switch (mode) {
        case "ionian":
            return 0;
        case "dorian":
            return 2;
        case "phrygian":
            return 4;
        case "lydian":
            return 5;
        case "mixolydian":
            return 7;
        case "aeolian":
            return 9;
        case "locrian":
            return 11;
        default:
            return 0;
    }
}
function modeSuffix(mode) {
    switch (mode) {
        case "aeolian":
            return "m";
        case "dorian":
            return "dor";
        case "phrygian":
            return "phr";
        case "lydian":
            return "lyd";
        case "mixolydian":
            return "mix";
        case "locrian":
            return "loc";
        case "ionian":
        default:
            return "";
    }
}
function abcKeyFromPitchClassMode(pitchClass, mode, preferFlats) {
    const namesSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const namesFlat = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    const tonic = (preferFlats ? namesFlat : namesSharp)[mod12(pitchClass)];
    return tonic + modeSuffix(mode);
}
function fifthsFromPitchClassMode(pitchClass, mode) {
    const offset = modeDegreeOffset(mode);
    let best = 0;
    let bestAbs = Number.POSITIVE_INFINITY;
    for (let f = -7; f <= 7; f += 1) {
        if (mod12((f * 7) + offset) !== mod12(pitchClass)) {
            continue;
        }
        const abs = Math.abs(f);
        if (abs < bestAbs) {
            bestAbs = abs;
            best = f;
        }
    }
    return Number.isFinite(bestAbs) ? best : 0;
}
function mod12(value) {
    const m = Number(value) % 12;
    return m < 0 ? m + 12 : m;
}
function stepAlterOctaveToMidiNumber(step, alter, octave) {
    const base = {
        C: 0,
        D: 2,
        E: 4,
        F: 5,
        G: 7,
        A: 9,
        B: 11
    };
    const s = String(step || "").toUpperCase();
    if (!Object.prototype.hasOwnProperty.call(base, s)) {
        return 60;
    }
    const semitone = base[s] + alter;
    return (octave + 1) * 12 + semitone;
}
function midiNumberToStepAlterOctave(midiNumber, preferFlats) {
    const normalized = Math.round(midiNumber);
    const octave = Math.floor(normalized / 12) - 1;
    const pitchClass = mod12(normalized);
    const sharpMap = [
        { step: "C", alter: 0 },
        { step: "C", alter: 1 },
        { step: "D", alter: 0 },
        { step: "D", alter: 1 },
        { step: "E", alter: 0 },
        { step: "F", alter: 0 },
        { step: "F", alter: 1 },
        { step: "G", alter: 0 },
        { step: "G", alter: 1 },
        { step: "A", alter: 0 },
        { step: "A", alter: 1 },
        { step: "B", alter: 0 }
    ];
    const flatMap = [
        { step: "C", alter: 0 },
        { step: "D", alter: -1 },
        { step: "D", alter: 0 },
        { step: "E", alter: -1 },
        { step: "E", alter: 0 },
        { step: "F", alter: 0 },
        { step: "G", alter: -1 },
        { step: "G", alter: 0 },
        { step: "A", alter: -1 },
        { step: "A", alter: 0 },
        { step: "B", alter: -1 },
        { step: "B", alter: 0 }
    ];
    const mapping = preferFlats ? flatMap : sharpMap;
    const pitch = mapping[pitchClass];
    return {
        step: pitch.step,
        alter: pitch.alter,
        octave
    };
}
function keySignatureAlterByStep(fifths) {
    const map = {};
    const sharpOrder = ["F", "C", "G", "D", "A", "E", "B"];
    const flatOrder = ["B", "E", "A", "D", "G", "C", "F"];
    const f = Number.isFinite(fifths) ? Math.max(-7, Math.min(7, Math.trunc(fifths))) : 0;
    if (f > 0) {
        for (let i = 0; i < f; i += 1) {
            map[sharpOrder[i]] = 1;
        }
    }
    else if (f < 0) {
        for (let i = 0; i < Math.abs(f); i += 1) {
            map[flatOrder[i]] = -1;
        }
    }
    return map;
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
function escapeAbcText(text) {
    return String(text || "").replace(/"/g, "'");
}
function normalizePartNameForAbc(partName, transposeApplied) {
    const name = String(partName || "").trim();
    if (!transposeApplied || !name) {
        return name;
    }
    return name
        .replace(/\s+in\s+[A-Ga-g](?:[#b]|♯|♭)?\b/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}
function buildPartNameMap(root) {
    const map = {};
    const partList = root.querySelector("part-list");
    if (!partList) {
        return map;
    }
    const scoreParts = Array.from(partList.children).filter((node) => node.nodeType === 1 && node.nodeName === "score-part");
    for (const scorePart of scoreParts) {
        const id = scorePart.getAttribute("id");
        if (!id) {
            continue;
        }
        const partNameNode = scorePart.querySelector(":scope > part-name");
        const partName = partNameNode && partNameNode.textContent ? partNameNode.textContent.trim() : "";
        map[id] = partName || id;
    }
    return map;
}
function parseFraction(text) {
    return abcCommon.parseFractionText(text, { num: 1, den: 8 });
}
function divideFractions(a, b) {
    return abcCommon.divideFractions(a, b, { num: 1, den: 1 });
}
function reduceFraction(num, den) {
    return abcCommon.reduceFraction(num, den, { num: 1, den: 1 });
}
function normalizeSource(rawText) {
    return musicXmlCommon.normalizeMusicXmlSource(rawText);
}
function resetOutput() {
    lastAbc = "";
    lastSynthSchedule = null;
    synthEngine.stop();
    abcOutput.textContent = "";
    previewText.textContent = "未変換";
    downloadBtn.disabled = true;
    playSineBtn.disabled = true;
}
function applyInputMode() {
    const sourceMode = inputModeSourceRadio.checked;
    sourceInputBlock.classList.toggle("md-hidden", !sourceMode);
    fileInputBlock.classList.toggle("md-hidden", sourceMode);
    if (sourceMode) {
        fileInput.value = "";
        updateFileName("");
    }
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
function playSine() {
    if (!lastSynthSchedule || lastSynthSchedule.events.length === 0) {
        setError("先に変換してください。");
        return;
    }
    synthEngine.playSchedule(lastSynthSchedule, "sine").then(() => {
        clearError();
        showToast("sine再生を開始しました。");
    }).catch((error) => {
        setError("sine再生に失敗しました: " + (error && error.message ? error.message : String(error)));
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
    }
    catch (_error) {
        // ignore broken localStorage
    }
}
