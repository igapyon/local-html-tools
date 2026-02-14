const musicXmlWriterCommon = window["MusicXmlWriterCommon"] || (typeof MusicXmlWriterCommon !== "undefined" ? MusicXmlWriterCommon : null);
if (!musicXmlWriterCommon) {
  throw new Error("MusicXmlWriterCommon is not loaded.");
}

const fileInput = document.getElementById("fileInput");
const fileSelectBtn = document.getElementById("fileSelectBtn");
const fileNameText = document.getElementById("fileNameText");
const inputModeSourceRadio = document.getElementById("inputModeSource");
const inputModeFileRadio = document.getElementById("inputModeFile");
const sourceInputBlock = document.getElementById("sourceInputBlock");
const fileInputBlock = document.getElementById("fileInputBlock");
const hexInput = document.getElementById("hexInput");
const defaultTitleInput = document.getElementById("defaultTitleInput");
const defaultComposerInput = document.getElementById("defaultComposerInput");
const defaultTempoInput = document.getElementById("defaultTempoInput");
const defaultBeatsInput = document.getElementById("defaultBeatsInput");
const defaultBeatTypeInput = document.getElementById("defaultBeatTypeInput");
const quantizeSelect = document.getElementById("quantizeSelect");
const timeScaleSelect = document.getElementById("timeScaleSelect");
const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");
const previewText = document.getElementById("previewText");
const xmlOutput = document.getElementById("xmlOutput");
const errorText = document.getElementById("errorText");
const warningText = document.getElementById("warningText");
const toast = document.getElementById("toast");
const menuPanel = document.getElementById("menuPanel");

const SETTINGS_KEY = "midi-to-musicxml-settings";
const MAX_POLYPHONY_LANES = 16;
const TREBLE_BASS_SPLIT_NOTE = 60;
const TREBLE_CLEF = { sign: "G", line: 2, label: "Treble" };
const BASS_CLEF = { sign: "F", line: 4, label: "Bass" };

let loadedMidiBytes = null;
let loadedMidiName = "";
let lastXmlText = "";

restoreSettings();

fileInput.addEventListener("change", onFileChange);
fileSelectBtn.addEventListener("click", () => fileInput.click());
inputModeSourceRadio.addEventListener("change", applyInputMode);
inputModeFileRadio.addEventListener("change", applyInputMode);
defaultTitleInput.addEventListener("change", persistSettings);
defaultComposerInput.addEventListener("change", persistSettings);
defaultTempoInput.addEventListener("change", persistSettings);
defaultBeatsInput.addEventListener("change", persistSettings);
defaultBeatTypeInput.addEventListener("change", persistSettings);
quantizeSelect.addEventListener("change", persistSettings);
timeScaleSelect.addEventListener("change", persistSettings);
convertBtn.addEventListener("click", convertMidi);
downloadBtn.addEventListener("click", downloadMusicXml);
copyBtn.addEventListener("click", copyMusicXml);
document.addEventListener("click", handleDocumentClick);

applyInputMode();

function onFileChange(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    loadedMidiBytes = null;
    loadedMidiName = "";
    updateFileName("");
    return;
  }

  inputModeFileRadio.checked = true;
  applyInputMode();

  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result;
    if (!(result instanceof ArrayBuffer)) {
      setError("MIDIファイルの読み込みに失敗しました。");
      return;
    }
    loadedMidiBytes = new Uint8Array(result);
    loadedMidiName = file.name;
    updateFileName(file.name);
    showToast("MIDIを読み込みました。");
  };
  reader.onerror = () => {
    setError("MIDIファイルの読み込みに失敗しました。");
  };
  reader.readAsArrayBuffer(file);
}

function updateFileName(name) {
  fileNameText.textContent = name || "未選択";
}

function applyInputMode() {
  const sourceMode = inputModeSourceRadio.checked;
  sourceInputBlock.classList.toggle("md-hidden", !sourceMode);
  fileInputBlock.classList.toggle("md-hidden", sourceMode);
}

function convertMidi() {
  clearError();
  clearWarning();

  try {
    const midiBytes = getInputMidiBytes();
    if (!midiBytes || midiBytes.length === 0) {
      throw new Error("MIDI入力が空です。");
    }

    const settings = {
      defaultTitle: (defaultTitleInput.value || "").trim() || "Untitled",
      defaultComposer: (defaultComposerInput.value || "").trim() || "Unknown",
      defaultTempo: clampNumber(defaultTempoInput.value, 120, 20, 300),
      defaultBeats: clampNumber(defaultBeatsInput.value, 4, 1, 12),
      defaultBeatType: clampNumber(defaultBeatTypeInput.value, 4, 1, 16),
      quantize: quantizeSelect.value || "1/16",
      timeScale: clampFloat(timeScaleSelect.value, 1, 0.1, 8)
    };

    const parsedMidi = parseMidiFile(midiBytes);
    const conversion = convertParsedMidiToMusicXmlData(parsedMidi, settings, loadedMidiName);
    const xml = musicXmlWriterCommon.buildScorePartwiseXml(conversion.parsedForXml);

    lastXmlText = xml;
    xmlOutput.textContent = xml;
    downloadBtn.disabled = false;
    copyBtn.disabled = false;

    const previewLines = [
      "title: " + conversion.summary.title,
      "composer: " + conversion.summary.composer,
      "format: " + parsedMidi.format,
      "tracks: " + parsedMidi.trackCount,
      "parts: " + conversion.summary.parts,
      "ppqn: " + parsedMidi.ppqn,
      "tempo: " + conversion.summary.tempo,
      "meter: " + conversion.summary.meter,
      "time scale: " + settings.timeScale + "x",
      "notes: " + conversion.summary.notes,
      "rests: " + conversion.summary.rests,
      "measures: " + conversion.summary.measures
    ];
    previewText.textContent = previewLines.join("\n");

    if (conversion.warnings.length > 0) {
      warningText.textContent = "警告:\n" + conversion.warnings.join("\n");
      warningText.classList.remove("md-hidden");
    }

    showToast("MusicXMLを生成しました。");
  } catch (error) {
    resetOutput();
    const message = error && error.message ? error.message : String(error);
    setError("変換に失敗しました: " + message);
  }
}

function getInputMidiBytes() {
  if (inputModeSourceRadio.checked) {
    const source = (hexInput.value || "").trim();
    if (!source) {
      return null;
    }
    return parseHexString(source);
  }
  return loadedMidiBytes;
}

function parseHexString(text) {
  const cleaned = text.replace(/[^0-9a-fA-F]/g, "");
  if (cleaned.length === 0) {
    return null;
  }
  if (cleaned.length % 2 !== 0) {
    throw new Error("16進ソースの桁数が不正です。");
  }
  const out = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function parseMidiFile(bytes) {
  const reader = createReader(bytes);
  const chunkId = readAscii(reader, 4);
  if (chunkId !== "MThd") {
    throw new Error("MIDIヘッダ (MThd) が見つかりません。");
  }

  const headerLength = readU32(reader);
  if (headerLength < 6) {
    throw new Error("MIDIヘッダ長が不正です。");
  }

  const format = readU16(reader);
  const trackCount = readU16(reader);
  const division = readU16(reader);
  if ((division & 0x8000) !== 0) {
    throw new Error("SMPTE形式のdivisionには未対応です。");
  }
  const ppqn = division;

  if (headerLength > 6) {
    reader.offset += headerLength - 6;
  }

  const trackParses = [];
  const tempoEvents = [];
  const meterEvents = [];
  const warnings = [];

  for (let trackIndex = 0; trackIndex < trackCount; trackIndex += 1) {
    const id = readAscii(reader, 4);
    if (id !== "MTrk") {
      throw new Error("MTrkチャンクが見つかりません。track=" + (trackIndex + 1));
    }
    const length = readU32(reader);
    const trackEnd = reader.offset + length;
    if (trackEnd > bytes.length) {
      throw new Error("MTrkチャンク長が不正です。track=" + (trackIndex + 1));
    }
    const parsedTrack = parseTrackEvents(bytes, reader, trackEnd, trackIndex, warnings);
    trackParses.push(parsedTrack);
    for (const ev of parsedTrack.tempoEvents) {
      tempoEvents.push(ev);
    }
    for (const ev of parsedTrack.meterEvents) {
      meterEvents.push(ev);
    }
    reader.offset = trackEnd;
  }

  const earliestTempo = findEarliestEvent(tempoEvents);
  const earliestMeter = findEarliestEvent(meterEvents);

  return {
    format,
    trackCount,
    ppqn,
    tracks: trackParses,
    tempoBpm: earliestTempo ? Math.max(20, Math.round(60000000 / earliestTempo.mpqn)) : null,
    meter: earliestMeter ? { beats: earliestMeter.beats, beatType: earliestMeter.beatType } : null,
    warnings
  };
}

function parseTrackEvents(bytes, reader, trackEnd, trackIndex, warnings) {
  let tick = 0;
  let runningStatus = 0;
  const notes = [];
  const tempoEvents = [];
  const meterEvents = [];
  const activeNotes = new Map();

  let trackName = "";
  let program = null;

  while (reader.offset < trackEnd) {
    tick += readVarLen(reader);

    if (reader.offset >= trackEnd) {
      break;
    }

    let status = readU8(reader);
    if (status < 0x80) {
      if (!runningStatus) {
        throw new Error("ランニングステータスが不正です。track=" + (trackIndex + 1));
      }
      reader.offset -= 1;
      status = runningStatus;
    } else {
      runningStatus = status;
    }

    if (status === 0xff) {
      const metaType = readU8(reader);
      const metaLen = readVarLen(reader);
      const metaStart = reader.offset;
      const metaEnd = metaStart + metaLen;
      if (metaEnd > trackEnd) {
        throw new Error("メタイベント長が不正です。track=" + (trackIndex + 1));
      }

      if (metaType === 0x03) {
        trackName = utf8Decode(bytes.slice(metaStart, metaEnd));
      } else if (metaType === 0x51 && metaLen === 3) {
        const mpqn = (bytes[metaStart] << 16) | (bytes[metaStart + 1] << 8) | bytes[metaStart + 2];
        if (mpqn > 0) {
          tempoEvents.push({ tick, mpqn });
        }
      } else if (metaType === 0x58 && metaLen >= 2) {
        const beats = bytes[metaStart];
        const beatType = 1 << bytes[metaStart + 1];
        if (beats > 0 && beatType > 0) {
          meterEvents.push({ tick, beats, beatType });
        }
      }

      reader.offset = metaEnd;
      continue;
    }

    if (status === 0xf0 || status === 0xf7) {
      const syxLen = readVarLen(reader);
      reader.offset += syxLen;
      if (reader.offset > trackEnd) {
        throw new Error("SysEx長が不正です。track=" + (trackIndex + 1));
      }
      continue;
    }

    const high = status >> 4;
    const channel = status & 0x0f;

    if (high === 0x8 || high === 0x9 || high === 0xa || high === 0xb || high === 0xe) {
      const data1 = readU8(reader);
      const data2 = readU8(reader);
      if (high === 0x9 && data2 > 0) {
        const key = channel + ":" + data1;
        const stack = activeNotes.get(key) || [];
        stack.push({ tick, velocity: data2 });
        activeNotes.set(key, stack);
      } else if (high === 0x8 || (high === 0x9 && data2 === 0)) {
        const key = channel + ":" + data1;
        const stack = activeNotes.get(key);
        if (!stack || stack.length === 0) {
          warnings.push("track " + (trackIndex + 1) + ": NoteOffに対応するNoteOnがありません。note=" + data1);
        } else {
          const start = stack.pop();
          const duration = Math.max(1, tick - start.tick);
          notes.push({
            trackIndex,
            channel,
            noteNumber: data1,
            startTick: start.tick,
            durationTick: duration,
            velocity: start.velocity
          });
        }
      }
      continue;
    }

    if (high === 0xc || high === 0xd) {
      const data = readU8(reader);
      if (high === 0xc && program === null) {
        program = data;
      }
      continue;
    }

    throw new Error("未対応のMIDIイベントです。status=0x" + status.toString(16));
  }

  if (activeNotes.size > 0) {
    warnings.push("track " + (trackIndex + 1) + ": 終端でクローズされないノートがあります。");
  }

  notes.sort((a, b) => {
    if (a.startTick !== b.startTick) {
      return a.startTick - b.startTick;
    }
    return a.noteNumber - b.noteNumber;
  });

  return {
    trackIndex,
    trackName,
    program,
    notes,
    tempoEvents,
    meterEvents
  };
}

function convertParsedMidiToMusicXmlData(parsedMidi, settings, loadedName) {
  const warnings = parsedMidi.warnings.slice();

  const title = deriveTitle(parsedMidi, settings.defaultTitle, loadedName);
  const composer = settings.defaultComposer;
  const tempo = parsedMidi.tempoBpm || settings.defaultTempo;
  const meter = parsedMidi.meter || {
    beats: settings.defaultBeats,
    beatType: settings.defaultBeatType
  };
  const quantizeTicks = resolveQuantizeTicks(settings.quantize, parsedMidi.ppqn);

  const tracksWithNotes = parsedMidi.tracks.filter((track) => track.notes.length > 0);
  if (tracksWithNotes.length === 0) {
    throw new Error("ノートイベントが見つかりませんでした。");
  }

  const parts = [];
  let totalNotes = 0;
  let totalRests = 0;
  let totalMeasures = 0;
  let partSerial = 1;

  for (let i = 0; i < tracksWithNotes.length; i += 1) {
    const track = tracksWithNotes[i];
    const basePartName = track.trackName || "Track " + String(track.trackIndex + 1);
    const clefLanes = splitTrackNotesIntoClefLanes(track.notes, quantizeTicks, settings.timeScale, track.trackIndex, warnings);
    for (let laneIndex = 0; laneIndex < clefLanes.length; laneIndex += 1) {
      const lane = clefLanes[laneIndex];
      if (!lane || !lane.notes || lane.notes.length === 0) {
        continue;
      }
      const partBuild = buildMeasuresFromMonophonicTrack(lane.notes, parsedMidi.ppqn, meter);
      totalNotes += partBuild.noteCount;
      totalRests += partBuild.restCount;
      totalMeasures = Math.max(totalMeasures, partBuild.measures.length);
      const laneNameSuffix = " " + lane.clef.label + " L" + String(lane.serialInClef);
      parts.push({
        partId: "P" + String(partSerial),
        partName: clefLanes.length === 1 ? basePartName : (basePartName + laneNameSuffix),
        clef: {
          sign: lane.clef.sign,
          line: lane.clef.line
        },
        measures: partBuild.measures
      });
      partSerial += 1;
    }
  }

  const parsedForXml = {
    meta: {
      title,
      composer,
      keyInfo: { fifths: 0 },
      meter,
      tempo
    },
    parts
  };

  return {
    parsedForXml,
    warnings,
    summary: {
      title,
      composer,
      parts: parts.length,
      tempo,
      meter: meter.beats + "/" + meter.beatType,
      notes: totalNotes,
      rests: totalRests,
      measures: totalMeasures
    }
  };
}

function splitTrackNotesIntoClefLanes(notes, quantizeTicks, timeScale, trackIndex, warnings) {
  const laneLimitPerClef = Math.max(1, Math.floor(MAX_POLYPHONY_LANES / 2));
  const trebleLanes = createLanePool(laneLimitPerClef, TREBLE_CLEF);
  const bassLanes = createLanePool(laneLimitPerClef, BASS_CLEF);
  const quantizedNotes = notes.map((note) => {
    const scaledStart = Math.max(0, Math.round(note.startTick * timeScale));
    const scaledDuration = Math.max(1, Math.round(note.durationTick * timeScale));
    const startTick = quantizeTick(scaledStart, quantizeTicks);
    const durationTick = Math.max(1, quantizeTick(scaledDuration, quantizeTicks));
    return {
      trackIndex: note.trackIndex,
      noteNumber: note.noteNumber,
      startTick,
      durationTick
    };
  });

  quantizedNotes.sort((a, b) => {
    if (a.startTick !== b.startTick) {
      return a.startTick - b.startTick;
    }
    if (a.noteNumber !== b.noteNumber) {
      return b.noteNumber - a.noteNumber;
    }
    return b.durationTick - a.durationTick;
  });

  for (const note of quantizedNotes) {
    const primaryPool = note.noteNumber >= TREBLE_BASS_SPLIT_NOTE ? trebleLanes : bassLanes;
    const secondaryPool = note.noteNumber >= TREBLE_BASS_SPLIT_NOTE ? bassLanes : trebleLanes;
    let lane = pickBestLane(primaryPool, note.startTick);
    if (!lane) {
      lane = pickBestLane(secondaryPool, note.startTick);
    }

    if (!lane) {
      warnings.push(
        "track " +
        (trackIndex + 1) +
        ": 同時発音が" +
        MAX_POLYPHONY_LANES +
        "を超えたため一部ノートをスキップしました。"
      );
      continue;
    }

    lane.notes.push(note);
    lane.endTick = note.startTick + note.durationTick;
  }

  return [...trebleLanes, ...bassLanes].filter((lane) => lane.notes.length > 0);
}

function createLanePool(size, clef) {
  return Array.from({ length: size }, (_unused, index) => ({
    notes: [],
    endTick: -1,
    serialInClef: index + 1,
    clef
  }));
}

function pickBestLane(pool, startTick) {
  let best = null;
  let bestGap = Number.POSITIVE_INFINITY;
  for (const lane of pool) {
    if (lane.endTick > startTick) {
      continue;
    }
    const gap = startTick - lane.endTick;
    if (gap < bestGap) {
      best = lane;
      bestGap = gap;
    }
  }
  return best;
}

function buildMeasuresFromMonophonicTrack(notes, ppqn, meter) {
  const ticksPerMeasure = Math.max(1, Math.round((ppqn * 4 * meter.beats) / meter.beatType));
  const measures = [[]];
  let cursor = 0;
  let noteCount = 0;
  let restCount = 0;

  for (const note of notes) {
    let start = note.startTick;
    const duration = Math.max(1, note.durationTick);

    if (start < cursor) {
      start = cursor;
    }

    if (start > cursor) {
      const inserted = pushDurationToken(measures, cursor, start - cursor, ticksPerMeasure, ppqn, null);
      restCount += inserted;
      cursor = start;
    }

    const insertedNotes = pushDurationToken(measures, cursor, duration, ticksPerMeasure, ppqn, note.noteNumber);
    noteCount += insertedNotes;
    cursor += duration;
  }

  while (measures.length > 1 && measures[measures.length - 1].length === 0) {
    measures.pop();
  }

  return {
    measures,
    noteCount,
    restCount
  };
}

function pushDurationToken(measures, startTick, durationTick, ticksPerMeasure, ppqn, midiNoteNumber) {
  let remaining = durationTick;
  let tick = startTick;
  let inserted = 0;

  while (remaining > 0) {
    const measureIndex = Math.floor(tick / ticksPerMeasure);
    while (measures.length <= measureIndex) {
      measures.push([]);
    }

    const tickInMeasure = tick % ticksPerMeasure;
    const freeInMeasure = ticksPerMeasure - tickInMeasure;
    const chunk = Math.max(1, Math.min(remaining, freeInMeasure));

    if (midiNoteNumber === null) {
      measures[measureIndex].push(buildRestToken(chunk, ppqn));
    } else {
      measures[measureIndex].push(buildNoteToken(midiNoteNumber, chunk, ppqn));
    }

    inserted += 1;
    tick += chunk;
    remaining -= chunk;
  }

  return inserted;
}

function buildRestToken(durationTick, ppqn) {
  const duration = midiTicksToMusicXmlDuration(durationTick, ppqn);
  return {
    isRest: true,
    duration,
    type: durationToType(duration)
  };
}

function buildNoteToken(midiNoteNumber, durationTick, ppqn) {
  const duration = midiTicksToMusicXmlDuration(durationTick, ppqn);
  const pitch = midiNumberToPitch(midiNoteNumber);
  return {
    isRest: false,
    step: pitch.step,
    alter: pitch.alter,
    octave: pitch.octave,
    duration,
    type: durationToType(duration),
    voice: "1"
  };
}

function midiTicksToMusicXmlDuration(ticks, ppqn) {
  return Math.max(1, Math.round((ticks * 960) / ppqn));
}

function durationToType(duration) {
  const table = [
    { duration: 3840, type: "whole" },
    { duration: 1920, type: "half" },
    { duration: 960, type: "quarter" },
    { duration: 480, type: "eighth" },
    { duration: 240, type: "16th" },
    { duration: 120, type: "32nd" },
    { duration: 60, type: "64th" }
  ];

  let best = table[0];
  let minDiff = Math.abs(duration - best.duration);
  for (const entry of table) {
    const diff = Math.abs(duration - entry.duration);
    if (diff < minDiff) {
      minDiff = diff;
      best = entry;
    }
  }
  return best.type;
}

function midiNumberToPitch(midiNumber) {
  const normalized = Math.max(0, Math.min(127, midiNumber));
  const semitone = normalized % 12;
  const octave = Math.floor(normalized / 12) - 1;
  const map = [
    { step: "C", alter: null },
    { step: "C", alter: 1 },
    { step: "D", alter: null },
    { step: "D", alter: 1 },
    { step: "E", alter: null },
    { step: "F", alter: null },
    { step: "F", alter: 1 },
    { step: "G", alter: null },
    { step: "G", alter: 1 },
    { step: "A", alter: null },
    { step: "A", alter: 1 },
    { step: "B", alter: null }
  ];
  const found = map[semitone] || map[0];
  return {
    step: found.step,
    alter: found.alter,
    octave
  };
}

function deriveTitle(parsedMidi, fallbackTitle, loadedName) {
  for (const track of parsedMidi.tracks) {
    if (track.trackName && track.trackName.trim()) {
      return track.trackName.trim();
    }
  }
  if (loadedName) {
    const dot = loadedName.lastIndexOf(".");
    if (dot > 0) {
      return loadedName.slice(0, dot);
    }
    return loadedName;
  }
  return fallbackTitle;
}

function findEarliestEvent(events) {
  if (!events || events.length === 0) {
    return null;
  }
  let earliest = events[0];
  for (const event of events) {
    if (event.tick < earliest.tick) {
      earliest = event;
    }
  }
  return earliest;
}

function resolveQuantizeTicks(quantizeValue, ppqn) {
  if (quantizeValue === "1/8") {
    return Math.max(1, Math.round(ppqn / 2));
  }
  if (quantizeValue === "1/32") {
    return Math.max(1, Math.round(ppqn / 8));
  }
  return Math.max(1, Math.round(ppqn / 4));
}

function quantizeTick(value, quantum) {
  return Math.max(0, Math.round(value / quantum) * quantum);
}

function createReader(bytes) {
  return {
    bytes,
    offset: 0
  };
}

function readAscii(reader, length) {
  ensureReadable(reader, length);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += String.fromCharCode(reader.bytes[reader.offset + i]);
  }
  reader.offset += length;
  return out;
}

function readU8(reader) {
  ensureReadable(reader, 1);
  const value = reader.bytes[reader.offset];
  reader.offset += 1;
  return value;
}

function readU16(reader) {
  ensureReadable(reader, 2);
  const value = (reader.bytes[reader.offset] << 8) | reader.bytes[reader.offset + 1];
  reader.offset += 2;
  return value;
}

function readU32(reader) {
  ensureReadable(reader, 4);
  const value =
    (reader.bytes[reader.offset] * 16777216) +
    (reader.bytes[reader.offset + 1] << 16) +
    (reader.bytes[reader.offset + 2] << 8) +
    reader.bytes[reader.offset + 3];
  reader.offset += 4;
  return value;
}

function readVarLen(reader) {
  let value = 0;
  let count = 0;
  while (true) {
    const byte = readU8(reader);
    value = (value << 7) | (byte & 0x7f);
    count += 1;
    if ((byte & 0x80) === 0) {
      return value;
    }
    if (count > 4) {
      throw new Error("可変長値が不正です。");
    }
  }
}

function ensureReadable(reader, length) {
  if (reader.offset + length > reader.bytes.length) {
    throw new Error("MIDIデータの末尾を超えて読み込みました。");
  }
}

function utf8Decode(bytes) {
  try {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
  } catch (_error) {
    let out = "";
    for (let i = 0; i < bytes.length; i += 1) {
      out += String.fromCharCode(bytes[i]);
    }
    return out;
  }
}

function clampNumber(value, fallback, min, max) {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, num));
}

function clampFloat(value, fallback, min, max) {
  const num = Number.parseFloat(value);
  if (!Number.isFinite(num)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, num));
}

function resetOutput() {
  lastXmlText = "";
  xmlOutput.textContent = "";
  previewText.textContent = "未変換";
  downloadBtn.disabled = true;
  copyBtn.disabled = true;
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

function persistSettings() {
  try {
    const payload = {
      defaultTitle: defaultTitleInput.value,
      defaultComposer: defaultComposerInput.value,
      defaultTempo: defaultTempoInput.value,
      defaultBeats: defaultBeatsInput.value,
      defaultBeatType: defaultBeatTypeInput.value,
      quantize: quantizeSelect.value,
      timeScale: timeScaleSelect.value
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
  } catch (_error) {
  }
}

function restoreSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    if (parsed.defaultTitle) {
      defaultTitleInput.value = String(parsed.defaultTitle);
    }
    if (parsed.defaultComposer) {
      defaultComposerInput.value = String(parsed.defaultComposer);
    }
    if (parsed.defaultTempo) {
      defaultTempoInput.value = String(parsed.defaultTempo);
    }
    if (parsed.defaultBeats) {
      defaultBeatsInput.value = String(parsed.defaultBeats);
    }
    if (parsed.defaultBeatType) {
      defaultBeatTypeInput.value = String(parsed.defaultBeatType);
    }
    if (parsed.quantize) {
      quantizeSelect.value = String(parsed.quantize);
    }
    if (parsed.timeScale) {
      timeScaleSelect.value = String(parsed.timeScale);
    }
  } catch (_error) {
  }
}

function downloadMusicXml() {
  if (!lastXmlText) {
    return;
  }
  const blob = new Blob([lastXmlText], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "score.musicxml";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast("MusicXMLを保存しました。");
}

async function copyMusicXml() {
  if (!lastXmlText) {
    return;
  }
  try {
    await navigator.clipboard.writeText(lastXmlText);
    showToast("MusicXMLをコピーしました。");
  } catch (_error) {
    showToast("コピーに失敗しました。");
  }
}

let toastTimer = 0;
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("md-hidden");
  toast.classList.add("md-visible");
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    toast.classList.remove("md-visible");
    toast.classList.add("md-hidden");
  }, 1600);
}

window["toggleMenu"] = function toggleMenu() {
  menuPanel.classList.toggle("md-hidden");
};

function handleDocumentClick(event) {
  if (menuPanel.classList.contains("md-hidden")) {
    return;
  }

  const target = event.target;
  if (!target) {
    return;
  }

  const menuButton = target.closest ? target.closest(".md-menu-button") : null;
  const panel = target.closest ? target.closest("#menuPanel") : null;
  if (!menuButton && !panel) {
    menuPanel.classList.add("md-hidden");
  }
}
