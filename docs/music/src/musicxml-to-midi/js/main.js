const musicXmlCommon = window["MusicXmlCommon"] || (typeof MusicXmlCommon !== "undefined" ? MusicXmlCommon : null);
const musicSynthCommon = window["MusicSynthCommon"] || (typeof MusicSynthCommon !== "undefined" ? MusicSynthCommon : null);
if (!musicXmlCommon || !musicSynthCommon) {
    throw new Error("Common scripts are not loaded.");
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
const defaultTempoInput = document.getElementById("defaultTempoInput");
const instrumentOverrideSelect = document.getElementById("instrumentOverrideSelect");
const synthWaveformSelect = document.getElementById("synthWaveformSelect");
const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const previewText = document.getElementById("previewText");
const errorText = document.getElementById("errorText");
const warningText = document.getElementById("warningText");
const toast = document.getElementById("toast");
const menuPanel = document.getElementById("menuPanel");
const SETTINGS_KEY = "musicxml-to-midi-settings";
const MIDI_TICKS_PER_QUARTER = 128;
let lastMidiBytes = null;
let lastSynthSchedule = null;
const synthEngine = musicSynthCommon.createBasicWaveSynthEngine({
    ticksPerQuarter: MIDI_TICKS_PER_QUARTER
});
restoreSettings();
convertBtn.addEventListener("click", convertMusicXml);
downloadBtn.addEventListener("click", downloadMidi);
playBtn.addEventListener("click", playMidi);
stopBtn.addEventListener("click", stopMidi);
fileInput.addEventListener("change", loadXmlFile);
fileSelectBtn.addEventListener("click", () => fileInput.click());
inputModeSourceRadio.addEventListener("change", applyInputMode);
inputModeFileRadio.addEventListener("change", applyInputMode);
defaultTitleInput.addEventListener("change", persistSettings);
defaultComposerInput.addEventListener("change", persistSettings);
defaultTempoInput.addEventListener("change", persistSettings);
instrumentOverrideSelect.addEventListener("change", persistSettings);
synthWaveformSelect.addEventListener("change", persistSettings);
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
            defaultTempo: clampTempo(defaultTempoInput.value)
        });
        const instrumentOverride = parseInstrumentOverride(instrumentOverrideSelect.value);
        const voiceIds = Object.keys(result.voiceTracksById).sort(compareTrackIds);
        const tracks = [];
        for (let trackIndex = 0; trackIndex < voiceIds.length; trackIndex += 1) {
            const voiceId = voiceIds[trackIndex];
            const voiceTrack = result.voiceTracksById[voiceId];
            const voiceEvents = voiceTrack.events;
            const channelToUse = resolveChannel(voiceTrack.channel, instrumentOverride, trackIndex);
            const track = new MidiWriter.Track();
            track.addTrackName(voiceTrack.trackName);
            track.addInstrumentName(voiceTrack.trackName);
            track.addText("composer:" + result.meta.composer);
            track.setTempo(result.meta.tempo);
            track.setTimeSignature(result.meta.meter.beats, result.meta.meter.beatType);
            const programToUse = resolveProgram(voiceTrack.program, instrumentOverride);
            if (programToUse !== null) {
                track.addEvent(new MidiWriter.ProgramChangeEvent({
                    instrument: programToUse,
                    channel: channelToUse
                }));
            }
            let cursor = 0;
            for (const event of voiceEvents) {
                const waitTicks = Math.max(0, event.start - cursor);
                const fields = {
                    pitch: [event.pitch],
                    duration: "T" + event.ticks,
                    velocity: 80,
                    channel: channelToUse
                };
                if (waitTicks > 0) {
                    fields.wait = "T" + waitTicks;
                }
                track.addEvent(new MidiWriter.NoteEvent(fields));
                cursor = Math.max(cursor, event.start + event.ticks);
            }
            tracks.push(track);
        }
        const writer = new MidiWriter.Writer(tracks);
        const built = writer.buildFile();
        lastMidiBytes = built instanceof Uint8Array ? built : Uint8Array.from(built || []);
        lastSynthSchedule = buildSynthSchedule(result.meta.tempo, voiceIds, result.voiceTracksById, instrumentOverride);
        downloadBtn.disabled = lastMidiBytes.length === 0;
        playBtn.disabled = !lastSynthSchedule || lastSynthSchedule.events.length === 0;
        stopBtn.disabled = true;
        previewText.textContent = [
            "title: " + result.meta.title,
            "composer: " + result.meta.composer,
            "tempo: " + result.meta.tempo,
            "instrument override: " + instrumentOverrideLabel(instrumentOverride),
            "synth waveform: " + musicSynthCommon.normalizeWaveform(synthWaveformSelect.value),
            "meter: " + result.meta.meter.beats + "/" + result.meta.meter.beatType,
            "parts: " + result.meta.partCount,
            "voices: " + result.meta.voiceCount,
            "measures: " + result.meta.measureCount,
            "notes: " + result.meta.noteCount,
            "rests: " + result.meta.restCount,
            "tracks: " + tracks.length,
            "midi bytes: " + lastMidiBytes.length
        ].join("\n");
        if (result.warnings.length > 0) {
            warningText.textContent = "警告:\n" + result.warnings.join("\n");
            warningText.classList.remove("md-hidden");
        }
        showToast("MIDIを生成しました。");
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
    const title = textOrFallback(root.querySelector("work > work-title") || root.querySelector("movement-title"), settings.defaultTitle);
    const composer = textOrFallback(root.querySelector('identification > creator[type="composer"]') || root.querySelector("identification > creator"), settings.defaultComposer);
    const partNameById = buildPartNameMap(root);
    const partPlaybackById = buildPartPlaybackMap(root);
    let globalMeter = { beats: 4, beatType: 4 };
    let meterFixed = false;
    let meter = { beats: 4, beatType: 4 };
    let tempo = settings.defaultTempo;
    let tempoDetected = false;
    let noteCount = 0;
    let restCount = 0;
    let measureCount = 0;
    const voiceTracksById = {};
    const logLines = [];
    let warnedChord = false;
    let warnedTie = false;
    for (let partIndex = 0; partIndex < partNodes.length; partIndex += 1) {
        const part = partNodes[partIndex];
        const partId = part.getAttribute("id") || "P" + String(partIndex + 1);
        const partName = partNameById[partId] || partId;
        const partPlayback = partPlaybackById[partId] || {};
        let divisions = 1;
        meter = meterFixed ? globalMeter : meter;
        let timelineTick = 0;
        let currentTranspose = 0;
        const measureNodes = Array.from(part.children).filter((node) => node.nodeType === 1 && node.nodeName === "measure");
        if (measureNodes.length === 0) {
            warnings.push("part " + partName + ": measure が見つからないためスキップしました。");
            continue;
        }
        for (const measureNode of measureNodes) {
            measureCount += 1;
            const measureNo = measureNode.getAttribute("number") || String(logLines.length + 1);
            const attrNode = firstDirectChild(measureNode, "attributes");
            if (attrNode) {
                const divText = getChildText(attrNode, "divisions");
                if (divText) {
                    const divVal = Number.parseInt(divText, 10);
                    if (Number.isFinite(divVal) && divVal > 0) {
                        divisions = divVal;
                    }
                }
                const timeNode = firstDirectChild(attrNode, "time");
                const beatsText = getChildText(timeNode, "beats");
                const beatTypeText = getChildText(timeNode, "beat-type");
                if (beatsText && beatTypeText) {
                    const beatsVal = Number.parseInt(beatsText, 10);
                    const beatTypeVal = Number.parseInt(beatTypeText, 10);
                    if (beatsVal > 0 && beatTypeVal > 0) {
                        meter = { beats: beatsVal, beatType: beatTypeVal };
                        if (!meterFixed) {
                            globalMeter = meter;
                            meterFixed = true;
                        }
                    }
                }
                const transposeNode = firstDirectChild(attrNode, "transpose");
                if (transposeNode) {
                    const chromaticText = getChildText(transposeNode, "chromatic");
                    const octaveChangeText = getChildText(transposeNode, "octave-change");
                    const chromatic = chromaticText ? Number.parseInt(chromaticText, 10) : 0;
                    const octaveChange = octaveChangeText ? Number.parseInt(octaveChangeText, 10) : 0;
                    const transposeSemitones = (Number.isFinite(chromatic) ? chromatic : 0) +
                        ((Number.isFinite(octaveChange) ? octaveChange : 0) * 12);
                    // Apply MusicXML transpose directly to move written pitch to sounding pitch.
                    currentTranspose = transposeSemitones;
                }
            }
            if (!tempoDetected) {
                for (const child of Array.from(measureNode.children)) {
                    if (child.nodeName !== "direction") {
                        continue;
                    }
                    const sound = firstDirectChild(child, "sound");
                    const tempoText = sound ? sound.getAttribute("tempo") : "";
                    if (tempoText) {
                        const tempoValue = Number.parseFloat(tempoText);
                        if (Number.isFinite(tempoValue) && tempoValue > 0) {
                            tempo = clampTempo(Math.round(tempoValue));
                            tempoDetected = true;
                            break;
                        }
                    }
                }
            }
            let cursorTick = 0;
            let measureMaxTick = 0;
            for (const child of Array.from(measureNode.children)) {
                const name = child.nodeName;
                if (name === "note") {
                    const event = noteToEvent(child, divisions, measureNo, warnings);
                    if (!event) {
                        continue;
                    }
                    if (event.kind === "chord") {
                        if (!warnedChord) {
                            warnings.push("和音（<chord/>）はMVPではスキップしています。");
                            warnedChord = true;
                        }
                        continue;
                    }
                    if (event.kind === "rest") {
                        restCount += 1;
                        logLines.push("part=" + partName + " m" + measureNo + " v" + event.voice + " rest T" + event.ticks);
                        cursorTick += event.ticks;
                        measureMaxTick = Math.max(measureMaxTick, cursorTick);
                        continue;
                    }
                    if (event.kind === "note") {
                        if (event.tied && !warnedTie) {
                            warnings.push("タイ/スラーはMVPでは厳密再現していません。");
                            warnedTie = true;
                        }
                        noteCount += 1;
                        const trackId = partId + ":" + event.voice;
                        if (!Object.prototype.hasOwnProperty.call(voiceTracksById, trackId)) {
                            const fallbackChannel = defaultChannelForPartIndex(partIndex);
                            voiceTracksById[trackId] = {
                                trackName: partName + " voice " + event.voice,
                                channel: normalizeMidiChannel(partPlayback.channel, fallbackChannel),
                                program: normalizeMidiProgram(partPlayback.program),
                                events: []
                            };
                        }
                        const soundingMidi = event.midiNumber + currentTranspose;
                        if (soundingMidi < 0 || soundingMidi > 127) {
                            warnings.push("part " + partName + " measure " + measureNo + ": 音高がMIDI範囲外のためスキップしました。");
                            continue;
                        }
                        const soundingPitch = midiNumberToMidiWriterPitch(soundingMidi);
                        voiceTracksById[trackId].events.push({
                            pitch: soundingPitch,
                            midiNumber: soundingMidi,
                            ticks: event.ticks,
                            start: timelineTick + cursorTick
                        });
                        logLines.push("part=" + partName + " m" + measureNo + " v" + event.voice + " " + soundingPitch + " T" + event.ticks + " @" + (timelineTick + cursorTick));
                        cursorTick += event.ticks;
                        measureMaxTick = Math.max(measureMaxTick, cursorTick);
                    }
                }
                else if (name === "backup") {
                    const ticks = parseDurationTicks(child, divisions, measureNo, warnings, "backup");
                    if (ticks > cursorTick) {
                        warnings.push("part " + partName + " measure " + measureNo + ": backup が小節開始を越えるため補正しました。");
                        cursorTick = 0;
                    }
                    else {
                        cursorTick -= ticks;
                    }
                }
                else if (name === "forward") {
                    const ticks = parseDurationTicks(child, divisions, measureNo, warnings, "forward");
                    cursorTick += ticks;
                    measureMaxTick = Math.max(measureMaxTick, cursorTick);
                }
            }
            if (measureMaxTick <= 0) {
                measureMaxTick = Math.max(1, Math.round((MIDI_TICKS_PER_QUARTER * 4 * meter.beats) / meter.beatType));
            }
            timelineTick += measureMaxTick;
        }
    }
    if (noteCount === 0 && restCount === 0) {
        throw new Error("変換対象の note/rest が見つかりませんでした。");
    }
    return {
        meta: {
            title,
            composer,
            tempo,
            meter: globalMeter,
            partCount: partNodes.length,
            voiceCount: Object.keys(voiceTracksById).length,
            measureCount,
            noteCount,
            restCount
        },
        voiceTracksById,
        warnings,
        logLines
    };
}
function buildPartNameMap(root) {
    const map = {};
    const partList = firstDirectChild(root, "part-list");
    if (!partList) {
        return map;
    }
    for (const child of Array.from(partList.children)) {
        if (child.nodeName !== "score-part") {
            continue;
        }
        const id = child.getAttribute("id");
        if (!id) {
            continue;
        }
        const name = getChildText(child, "part-name");
        map[id] = name || id;
    }
    return map;
}
function buildPartPlaybackMap(root) {
    const map = {};
    const partList = firstDirectChild(root, "part-list");
    if (!partList) {
        return map;
    }
    for (const child of Array.from(partList.children)) {
        if (child.nodeName !== "score-part") {
            continue;
        }
        const id = child.getAttribute("id");
        if (!id) {
            continue;
        }
        const midiInstrument = firstDirectChild(child, "midi-instrument");
        if (!midiInstrument) {
            continue;
        }
        const channelText = getChildText(midiInstrument, "midi-channel");
        const programText = getChildText(midiInstrument, "midi-program");
        const channel = channelText ? Number.parseInt(channelText, 10) : null;
        // MusicXML midi-program is 1-based. midi-writer-js expects 0-based.
        const program = programText ? Number.parseInt(programText, 10) - 1 : null;
        map[id] = {
            channel: Number.isFinite(channel) ? channel : null,
            program: Number.isFinite(program) ? program : null
        };
    }
    return map;
}
function noteToEvent(noteNode, divisions, measureNo, warnings) {
    if (firstDirectChild(noteNode, "grace")) {
        warnings.push("measure " + measureNo + ": grace note はスキップしました。");
        return null;
    }
    if (firstDirectChild(noteNode, "chord")) {
        return { kind: "chord" };
    }
    const durationText = getChildText(noteNode, "duration");
    if (!durationText) {
        warnings.push("measure " + measureNo + ": duration が無い note をスキップしました。");
        return null;
    }
    const durationVal = Number.parseInt(durationText, 10);
    if (!Number.isFinite(durationVal) || durationVal <= 0) {
        warnings.push("measure " + measureNo + ": duration が不正な note をスキップしました。");
        return null;
    }
    const ticks = Math.max(1, Math.round((durationVal / divisions) * MIDI_TICKS_PER_QUARTER));
    const voice = getChildText(noteNode, "voice") || "1";
    if (firstDirectChild(noteNode, "rest")) {
        return { kind: "rest", ticks, voice };
    }
    const pitchNode = firstDirectChild(noteNode, "pitch");
    const step = getChildText(pitchNode, "step");
    const octaveText = getChildText(pitchNode, "octave");
    if (!step || !octaveText) {
        warnings.push("measure " + measureNo + ": pitch 情報が不完全な note をスキップしました。");
        return null;
    }
    const octave = Number.parseInt(octaveText, 10);
    if (!Number.isFinite(octave)) {
        warnings.push("measure " + measureNo + ": octave が不正な note をスキップしました。");
        return null;
    }
    const alterText = getChildText(pitchNode, "alter");
    const alter = alterText === "" ? 0 : Number.parseInt(alterText, 10);
    const tied = Boolean(firstDirectChild(noteNode, "tie") || firstDirectChild(firstDirectChild(noteNode, "notations"), "tied"));
    return {
        kind: "note",
        midiNumber: pitchToMidiNumber(step, Number.isFinite(alter) ? alter : 0, octave),
        ticks,
        voice,
        tied
    };
}
function parseDurationTicks(node, divisions, measureNo, warnings, elementName) {
    const durationText = getChildText(node, "duration");
    if (!durationText) {
        warnings.push("measure " + measureNo + ": " + elementName + " の duration が無いため 0 扱いにしました。");
        return 0;
    }
    const durationVal = Number.parseInt(durationText, 10);
    if (!Number.isFinite(durationVal) || durationVal < 0) {
        warnings.push("measure " + measureNo + ": " + elementName + " の duration が不正なため 0 扱いにしました。");
        return 0;
    }
    return Math.max(0, Math.round((durationVal / divisions) * MIDI_TICKS_PER_QUARTER));
}
function pitchToMidiNumber(step, alter, octave) {
    const s = String(step || "C").toUpperCase();
    const base = {
        C: 0,
        D: 2,
        E: 4,
        F: 5,
        G: 7,
        A: 9,
        B: 11
    };
    if (!Object.prototype.hasOwnProperty.call(base, s)) {
        return 60;
    }
    const semitone = base[s] + alter;
    return (octave + 1) * 12 + semitone;
}
function midiNumberToMidiWriterPitch(midiNumber) {
    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const n = Math.max(0, Math.min(127, Math.round(midiNumber)));
    const octave = Math.floor(n / 12) - 1;
    const note = names[n % 12];
    return note + String(octave);
}
function firstDirectChild(parent, tagName) {
    if (!parent) {
        return null;
    }
    for (const child of Array.from(parent.children)) {
        if (child.nodeName === tagName) {
            return child;
        }
    }
    return null;
}
function getChildText(parent, tagName) {
    const node = firstDirectChild(parent, tagName);
    return node ? node.textContent.trim() : "";
}
function textOrFallback(node, fallback) {
    if (!node) {
        return fallback;
    }
    const text = node.textContent ? node.textContent.trim() : "";
    return text || fallback;
}
function normalizeSource(rawText) {
    return musicXmlCommon.normalizeMusicXmlSource(rawText);
}
function clampTempo(value) {
    const num = Number.parseInt(String(value || ""), 10);
    if (!Number.isFinite(num)) {
        return 120;
    }
    return Math.min(300, Math.max(20, num));
}
function compareTrackIds(a, b) {
    const [aPart, aVoice] = String(a).split(":");
    const [bPart, bVoice] = String(b).split(":");
    if (aPart !== bPart) {
        return String(aPart).localeCompare(String(bPart));
    }
    const aNum = Number.parseInt(aVoice, 10);
    const bNum = Number.parseInt(bVoice, 10);
    const aIsNum = Number.isFinite(aNum);
    const bIsNum = Number.isFinite(bNum);
    if (aIsNum && bIsNum) {
        return aNum - bNum;
    }
    if (aIsNum) {
        return -1;
    }
    if (bIsNum) {
        return 1;
    }
    return String(aVoice).localeCompare(String(bVoice));
}
function parseInstrumentOverride(value) {
    if (value === "fm_piano_1") {
        return { key: value, program: 4 };
    }
    if (value === "fm_piano_2") {
        return { key: value, program: 5 };
    }
    return { key: "", program: null };
}
function resolveProgram(originalProgram, override) {
    if (override && Number.isFinite(override.program)) {
        return override.program;
    }
    return originalProgram;
}
function resolveChannel(originalChannel, override, trackIndex) {
    if (override && Number.isFinite(override.program)) {
        return defaultChannelForTrackIndex(trackIndex);
    }
    return normalizeMidiChannel(originalChannel, defaultChannelForPartIndex(trackIndex));
}
function instrumentOverrideLabel(override) {
    if (!override || !override.key) {
        return "MusicXML";
    }
    if (override.key === "fm_piano_1") {
        return "FM Piano 1";
    }
    if (override.key === "fm_piano_2") {
        return "FM Piano 2";
    }
    return "MusicXML";
}
function defaultChannelForPartIndex(partIndex) {
    const oneBased = (partIndex % 16) + 1;
    // Keep channel 10 free by default.
    if (oneBased === 10) {
        return 11;
    }
    return oneBased;
}
function defaultChannelForTrackIndex(trackIndex) {
    return defaultChannelForPartIndex(trackIndex);
}
function normalizeMidiChannel(channel, fallback) {
    if (Number.isFinite(channel) && channel >= 1 && channel <= 16) {
        return channel;
    }
    return fallback;
}
function normalizeMidiProgram(program) {
    if (!Number.isFinite(program)) {
        return null;
    }
    return Math.max(0, Math.min(127, Math.round(program)));
}
function buildSynthSchedule(tempo, voiceIds, voiceTracksById, instrumentOverride) {
    const events = [];
    for (let trackIndex = 0; trackIndex < voiceIds.length; trackIndex += 1) {
        const voiceId = voiceIds[trackIndex];
        const voiceTrack = voiceTracksById[voiceId];
        if (!voiceTrack || !Array.isArray(voiceTrack.events)) {
            continue;
        }
        const channel = resolveChannel(voiceTrack.channel, instrumentOverride, trackIndex);
        for (const event of voiceTrack.events) {
            if (!event || !Number.isFinite(event.midiNumber) || !Number.isFinite(event.start) || !Number.isFinite(event.ticks)) {
                continue;
            }
            events.push({
                midiNumber: Math.max(0, Math.min(127, Math.round(event.midiNumber))),
                start: Math.max(0, Math.round(event.start)),
                ticks: Math.max(1, Math.round(event.ticks)),
                channel
            });
        }
    }
    events.sort((a, b) => {
        if (a.start !== b.start) {
            return a.start - b.start;
        }
        return a.midiNumber - b.midiNumber;
    });
    return {
        tempo: clampTempo(tempo),
        events
    };
}
function resetOutput() {
    stopMidi(false);
    lastMidiBytes = null;
    lastSynthSchedule = null;
    previewText.textContent = "未変換";
    downloadBtn.disabled = true;
    playBtn.disabled = true;
    stopBtn.disabled = true;
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
function downloadMidi() {
    if (!lastMidiBytes || lastMidiBytes.length === 0) {
        setError("先に変換してください。");
        return;
    }
    const blob = new Blob([lastMidiBytes], { type: "audio/midi" });
    downloadBlob(blob, "score.mid");
    showToast("MIDIを保存しました。");
}
function playMidi() {
    if (!lastSynthSchedule || lastSynthSchedule.events.length === 0) {
        setError("先に変換してください。");
        return;
    }
    const waveform = musicSynthCommon.normalizeWaveform(synthWaveformSelect.value);
    synthEngine.playSchedule(lastSynthSchedule, waveform, () => {
        stopBtn.disabled = true;
    }).then(() => {
        clearError();
        stopBtn.disabled = false;
        showToast("内蔵シンセ再生を開始しました。");
    }).catch((error) => {
        stopBtn.disabled = true;
        setError("内蔵シンセ再生に失敗しました: " + (error && error.message ? error.message : String(error)));
    });
}
function stopMidi(showMessage = true) {
    synthEngine.stop();
    stopBtn.disabled = true;
    if (showMessage) {
        showToast("内蔵シンセ再生を停止しました。");
    }
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
        defaultTempo: defaultTempoInput.value,
        instrumentOverride: instrumentOverrideSelect.value,
        synthWaveform: synthWaveformSelect.value
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
            if (typeof data.defaultTempo === "string" || typeof data.defaultTempo === "number") {
                defaultTempoInput.value = String(data.defaultTempo);
            }
            if (typeof data.instrumentOverride === "string") {
                instrumentOverrideSelect.value = data.instrumentOverride;
            }
            if (typeof data.synthWaveform === "string") {
                synthWaveformSelect.value = musicSynthCommon.normalizeWaveform(data.synthWaveform);
            }
        }
    }
    catch (_error) {
        // ignore broken localStorage
    }
}
