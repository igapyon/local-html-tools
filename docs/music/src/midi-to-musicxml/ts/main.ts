/*
 * Copyright 2026 Toshiki Iga
 * SPDX-License-Identifier: Apache-2.0
 */

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
const keyModeSelect = document.getElementById("keyModeSelect");
const keyFifthsSelect = document.getElementById("keyFifthsSelect");
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
if (!(fileSelectBtn && fileSelectBtn.closest("lht-file-select"))) {
  fileSelectBtn.addEventListener("click", () => fileInput.click());
}
inputModeSourceRadio.addEventListener("change", applyInputMode);
inputModeFileRadio.addEventListener("change", applyInputMode);
defaultTitleInput.addEventListener("change", persistSettings);
defaultComposerInput.addEventListener("change", persistSettings);
defaultTempoInput.addEventListener("change", persistSettings);
keyModeSelect.addEventListener("change", persistSettings);
keyFifthsSelect.addEventListener("change", persistSettings);
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
      keyMode: normalizeKeyModeValue(keyModeSelect.value),
      keyFifths: normalizeKeyFifthsValue(keyFifthsSelect.value),
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
      "key fifths: " + conversion.summary.keyFifths,
      "key mode: " + conversion.summary.keyMode,
      "key source: " + conversion.summary.keySource,
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
  const keySignatureEvents = [];
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
    for (const ev of parsedTrack.keySignatureEvents) {
      keySignatureEvents.push(ev);
    }
    reader.offset = trackEnd;
  }

  const earliestTempo = findEarliestEvent(tempoEvents);
  const earliestMeter = findEarliestEvent(meterEvents);
  const earliestKeySignature = findEarliestEvent(keySignatureEvents);
  const allTempoEvents = tempoEvents
    .slice()
    .sort((a, b) => a.tick - b.tick)
    .map((ev) => ({
      tick: ev.tick,
      bpm: Math.max(20, Math.round(60000000 / ev.mpqn))
    }));

  return {
    format,
    trackCount,
    ppqn,
    tracks: trackParses,
    tempoBpm: earliestTempo ? Math.max(20, Math.round(60000000 / earliestTempo.mpqn)) : null,
    tempoEvents: allTempoEvents,
    meter: earliestMeter ? { beats: earliestMeter.beats, beatType: earliestMeter.beatType } : null,
    keySignature: earliestKeySignature ? {
      fifths: earliestKeySignature.fifths,
      mode: earliestKeySignature.mode
    } : null,
    warnings
  };
}

function parseTrackEvents(bytes, reader, trackEnd, trackIndex, warnings) {
  let tick = 0;
  let runningStatus = 0;
  const notes = [];
  const tempoEvents = [];
  const meterEvents = [];
  const keySignatureEvents = [];
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
      } else if (metaType === 0x59 && metaLen >= 2) {
        const sf = toSignedInt8(bytes[metaStart]);
        const mi = bytes[metaStart + 1];
        if (sf >= -7 && sf <= 7) {
          keySignatureEvents.push({
            tick,
            fifths: sf,
            mode: mi === 1 ? "minor" : "major"
          });
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
    meterEvents,
    keySignatureEvents
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
  const tempoChanges = buildTempoChangesByMeasure(parsedMidi, meter);

  const tracksWithNotes = parsedMidi.tracks.filter((track) => track.notes.length > 0);
  if (tracksWithNotes.length === 0) {
    throw new Error("ノートイベントが見つかりませんでした。");
  }

  const parts = [];
  let totalNotes = 0;
  let totalRests = 0;
  let totalMeasures = 0;
  let partSerial = 1;
  const estimatedKey = estimateKeyFromTracks(tracksWithNotes);
  const hasMidiKeySignature = !!parsedMidi.keySignature;
  let keyFifths = 0;
  let keyMode = "major";
  let keySource = "estimated";

  if (hasMidiKeySignature) {
    keyFifths = parsedMidi.keySignature.fifths;
    keyMode = parsedMidi.keySignature.mode;
    keySource = "midi-meta";
  } else {
    keyFifths = settings.keyFifths === null ? estimatedKey.fifths : settings.keyFifths;
    keyMode = settings.keyMode === "auto" ? estimatedKey.mode : settings.keyMode;
    if (settings.keyFifths !== null || settings.keyMode !== "auto") {
      keySource = "manual-fallback";
    }
  }

  for (let i = 0; i < tracksWithNotes.length; i += 1) {
    const track = tracksWithNotes[i];
    const basePartName = track.trackName || "Track " + String(track.trackIndex + 1);
    const clefLanes = splitTrackNotesIntoClefLanes(track.notes, quantizeTicks, settings.timeScale, track.trackIndex, warnings);
    for (let laneIndex = 0; laneIndex < clefLanes.length; laneIndex += 1) {
      const lane = clefLanes[laneIndex];
      if (!lane || !lane.notes || lane.notes.length === 0) {
        continue;
      }
      const partBuild = buildMeasuresFromMonophonicTrack(lane.notes, parsedMidi.ppqn, meter, keyFifths);
      totalNotes += partBuild.noteCount;
      totalRests += partBuild.restCount;
      totalMeasures = Math.max(totalMeasures, partBuild.measures.length);
      const laneNameSuffix = " " + lane.clef.label + " L" + String(lane.serialInClef);
      const midiProgram = Number.isFinite(track.program) ? Math.max(1, Math.min(128, Number(track.program) + 1)) : null;
      const midiChannel = detectPrimaryMidiChannel(lane.notes);
      parts.push({
        partId: "P" + String(partSerial),
        partName: clefLanes.length === 1 ? basePartName : (basePartName + laneNameSuffix),
        clef: {
          sign: lane.clef.sign,
          line: lane.clef.line
        },
        measures: partBuild.measures,
        measureDynamics: partBuild.measureDynamics,
        midiProgram,
        midiChannel
      });
      partSerial += 1;
    }
  }

  const parsedForXml = {
    meta: {
      title,
      composer,
      keyInfo: { fifths: keyFifths, mode: keyMode },
      meter,
      tempo,
      tempoChanges
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
      keyFifths,
      keyMode,
      keySource,
      meter: meter.beats + "/" + meter.beatType,
      notes: totalNotes,
      rests: totalRests,
      measures: totalMeasures
    }
  };
}

function buildTempoChangesByMeasure(parsedMidi, meter) {
  const out = [];
  if (!parsedMidi || !Array.isArray(parsedMidi.tempoEvents) || parsedMidi.tempoEvents.length === 0) {
    return out;
  }
  const ppqn = Math.max(1, Number(parsedMidi.ppqn) || 1);
  const beats = Math.max(1, Number(meter && meter.beats) || 4);
  const beatType = Math.max(1, Number(meter && meter.beatType) || 4);
  const ticksPerMeasure = Math.max(1, Math.round((ppqn * 4 * beats) / beatType));
  const byMeasure = new Map();
  for (const ev of parsedMidi.tempoEvents) {
    if (!ev || typeof ev !== "object") {
      continue;
    }
    const tick = Math.max(0, Number(ev.tick) || 0);
    const bpm = Number.parseInt(ev.bpm, 10);
    if (!Number.isFinite(bpm) || bpm <= 0) {
      continue;
    }
    const measure = Math.floor(tick / ticksPerMeasure) + 1;
    byMeasure.set(measure, bpm);
  }
  const sortedMeasures = Array.from(byMeasure.keys()).sort((a, b) => a - b);
  for (const measure of sortedMeasures) {
    out.push({ measure, bpm: byMeasure.get(measure) });
  }
  return out;
}

function detectPrimaryMidiChannel(notes) {
  if (!Array.isArray(notes) || notes.length === 0) {
    return null;
  }
  const counts = new Array(16).fill(0);
  for (const note of notes) {
    const channel = Number(note && note.channel);
    if (!Number.isFinite(channel) || channel < 0 || channel > 15) {
      continue;
    }
    counts[channel] += 1;
  }
  let bestChannel = -1;
  let bestCount = -1;
  for (let i = 0; i < counts.length; i += 1) {
    if (counts[i] > bestCount) {
      bestCount = counts[i];
      bestChannel = i;
    }
  }
  if (bestCount <= 0 || bestChannel < 0) {
    return null;
  }
  return bestChannel + 1;
}

function estimateKeyFromTracks(tracks) {
  const pitchClassWeights = new Array(12).fill(0);
  for (const track of tracks) {
    for (const note of track.notes) {
      const pitchClass = ((note.noteNumber % 12) + 12) % 12;
      pitchClassWeights[pitchClass] += Math.max(1, note.durationTick);
    }
  }

  const totalWeight = pitchClassWeights.reduce((sum, value) => sum + value, 0);
  if (totalWeight <= 0) {
    return { fifths: 0, mode: "major" };
  }

  const majorScale = [0, 2, 4, 5, 7, 9, 11];
  const naturalMinorScale = [0, 2, 3, 5, 7, 8, 10];
  const fifthsByTonicPitchClass = {
    0: 0,   // C
    1: -5,  // Db
    2: 2,   // D
    3: -3,  // Eb
    4: 4,   // E
    5: -1,  // F
    6: 6,   // F#
    7: 1,   // G
    8: -4,  // Ab
    9: 3,   // A
    10: -2, // Bb
    11: 5   // B
  };

  let bestMajorTonic = 0;
  let bestMajorScore = Number.NEGATIVE_INFINITY;
  let bestMinorTonic = 0;
  let bestMinorScore = Number.NEGATIVE_INFINITY;
  for (let tonic = 0; tonic < 12; tonic += 1) {
    let inScaleMajor = 0;
    for (const degree of majorScale) {
      inScaleMajor += pitchClassWeights[(tonic + degree) % 12];
    }
    const outScaleMajor = totalWeight - inScaleMajor;
    const majorScore = inScaleMajor - outScaleMajor * 0.75;
    if (majorScore > bestMajorScore) {
      bestMajorScore = majorScore;
      bestMajorTonic = tonic;
    }
  }

  for (let tonic = 0; tonic < 12; tonic += 1) {
    let inScaleMinor = 0;
    for (const degree of naturalMinorScale) {
      inScaleMinor += pitchClassWeights[(tonic + degree) % 12];
    }
    const outScaleMinor = totalWeight - inScaleMinor;
    const minorScore = inScaleMinor - outScaleMinor * 0.75;
    if (minorScore > bestMinorScore) {
      bestMinorScore = minorScore;
      bestMinorTonic = tonic;
    }
  }

  if (bestMinorScore > bestMajorScore + totalWeight * 0.01) {
    const relativeMajorTonic = (bestMinorTonic + 3) % 12;
    return {
      fifths: fifthsByTonicPitchClass[relativeMajorTonic] || 0,
      mode: "minor"
    };
  }

  return {
    fifths: fifthsByTonicPitchClass[bestMajorTonic] || 0,
    mode: "major"
  };
}

function toSignedInt8(value) {
  const normalized = value & 0xff;
  return normalized > 127 ? normalized - 256 : normalized;
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
      channel: Number.isFinite(note.channel) ? note.channel : 0,
      noteNumber: note.noteNumber,
      startTick,
      durationTick,
      velocity: Number.isFinite(note.velocity) ? note.velocity : 64
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

function buildMeasuresFromMonophonicTrack(notes, ppqn, meter, keyFifths) {
  const ticksPerMeasure = Math.max(1, Math.round((ppqn * 4 * meter.beats) / meter.beatType));
  const measures = [[]];
  const measureAccidentalStates = [];
  const keySignatureStepAlter = buildKeySignatureStepAlterMap(keyFifths);
  const measureVelocitySums = [];
  const measureVelocityCounts = [];
  let cursor = 0;
  let noteCount = 0;
  let restCount = 0;

  for (const note of notes) {
    let start = note.startTick;
    const duration = Math.max(1, note.durationTick);
    const originalStart = Math.max(0, note.startTick);

    if (start < cursor) {
      start = cursor;
    }

    if (start > cursor) {
      const inserted = pushDurationToken(
        measures,
        cursor,
        start - cursor,
        ticksPerMeasure,
        ppqn,
        null,
        measureAccidentalStates,
        keySignatureStepAlter
      );
      restCount += inserted;
      cursor = start;
    }

    const insertedNotes = pushDurationToken(
      measures,
      cursor,
      duration,
      ticksPerMeasure,
      ppqn,
      note.noteNumber,
      measureAccidentalStates,
      keySignatureStepAlter
    );
    noteCount += insertedNotes;
    const measureIndexForDynamic = Math.floor(originalStart / ticksPerMeasure);
    const velocity = clampMidiVelocity(note.velocity);
    measureVelocitySums[measureIndexForDynamic] = (measureVelocitySums[measureIndexForDynamic] || 0) + velocity;
    measureVelocityCounts[measureIndexForDynamic] = (measureVelocityCounts[measureIndexForDynamic] || 0) + 1;
    cursor += duration;
  }

  while (measures.length > 1 && measures[measures.length - 1].length === 0) {
    measures.pop();
  }

  const measureDynamics = [];
  let previousDynamic = null;
  for (let i = 0; i < measures.length; i += 1) {
    const count = measureVelocityCounts[i] || 0;
    if (count <= 0) {
      measureDynamics.push(null);
      continue;
    }
    const average = (measureVelocitySums[i] || 0) / count;
    const dynamic = velocityToDynamicMark(average);
    if (i === 0 || dynamic !== previousDynamic) {
      measureDynamics.push(dynamic);
      previousDynamic = dynamic;
    } else {
      measureDynamics.push(null);
    }
  }

  return {
    measures,
    noteCount,
    restCount,
    measureDynamics
  };
}

function clampMidiVelocity(rawVelocity) {
  const velocity = Number(rawVelocity);
  if (!Number.isFinite(velocity)) {
    return 64;
  }
  return Math.max(1, Math.min(127, Math.round(velocity)));
}

function velocityToDynamicMark(rawVelocity) {
  const velocity = clampMidiVelocity(rawVelocity);
  if (velocity <= 39) {
    return "p";
  }
  if (velocity <= 69) {
    return "mp";
  }
  if (velocity <= 99) {
    return "mf";
  }
  return "f";
}

function pushDurationToken(
  measures,
  startTick,
  durationTick,
  ticksPerMeasure,
  ppqn,
  midiNoteNumber,
  measureAccidentalStates,
  keySignatureStepAlter
) {
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
      const state = ensureMeasureAccidentalState(measureAccidentalStates, measureIndex);
      measures[measureIndex].push(
        buildNoteToken(midiNoteNumber, chunk, ppqn, keySignatureStepAlter, state)
      );
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
    type: durationToType(duration),
    voice: "1"
  };
}

function buildNoteToken(midiNoteNumber, durationTick, ppqn, keySignatureStepAlter, measureAccidentalState) {
  const duration = midiTicksToMusicXmlDuration(durationTick, ppqn);
  const pitch = midiNumberToPitch(midiNoteNumber, keySignatureStepAlter);
  const alterNumber = pitch.alter === null ? 0 : Number(pitch.alter);
  const accidentalText = resolveAccidentalTextForMeasure(
    pitch.step,
    pitch.octave,
    alterNumber,
    keySignatureStepAlter,
    measureAccidentalState
  );

  return {
    isRest: false,
    step: pitch.step,
    alter: pitch.alter,
    octave: pitch.octave,
    duration,
    type: durationToType(duration),
    accidentalText,
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

function midiNumberToPitch(midiNumber, keySignatureStepAlter) {
  const normalized = Math.max(0, Math.min(127, midiNumber));
  const semitone = normalized % 12;
  const octave = Math.floor(normalized / 12) - 1;
  const sharpMap = [
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
  const flatMap = [
    { step: "C", alter: null },
    { step: "D", alter: -1 },
    { step: "D", alter: null },
    { step: "E", alter: -1 },
    { step: "E", alter: null },
    { step: "F", alter: null },
    { step: "G", alter: -1 },
    { step: "G", alter: null },
    { step: "A", alter: -1 },
    { step: "A", alter: null },
    { step: "B", alter: -1 },
    { step: "B", alter: null }
  ];

  const preferFlats = countKeyFlats(keySignatureStepAlter) > countKeySharps(keySignatureStepAlter);
  const map = preferFlats ? flatMap : sharpMap;
  const found = map[semitone] || map[0];
  return {
    step: found.step,
    alter: found.alter,
    octave
  };
}

function buildKeySignatureStepAlterMap(fifths) {
  const normalizedFifths = Math.max(-7, Math.min(7, Number.parseInt(fifths, 10) || 0));
  const result = { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 };
  const sharpsOrder = ["F", "C", "G", "D", "A", "E", "B"];
  const flatsOrder = ["B", "E", "A", "D", "G", "C", "F"];
  if (normalizedFifths > 0) {
    for (let i = 0; i < normalizedFifths; i += 1) {
      result[sharpsOrder[i]] = 1;
    }
  } else if (normalizedFifths < 0) {
    for (let i = 0; i < Math.abs(normalizedFifths); i += 1) {
      result[flatsOrder[i]] = -1;
    }
  }
  return result;
}

function ensureMeasureAccidentalState(states, measureIndex) {
  while (states.length <= measureIndex) {
    states.push(new Map());
  }
  return states[measureIndex];
}

function resolveAccidentalTextForMeasure(step, octave, alterNumber, keySignatureStepAlter, measureAccidentalState) {
  const key = String(step) + String(octave);
  const keyDefault = Number(keySignatureStepAlter[step] || 0);
  const current = measureAccidentalState.has(key) ? Number(measureAccidentalState.get(key)) : keyDefault;
  if (current === alterNumber) {
    return null;
  }
  measureAccidentalState.set(key, alterNumber);
  return accidentalTextFromAlter(alterNumber);
}

function accidentalTextFromAlter(alterNumber) {
  if (alterNumber === -2) {
    return "flat-flat";
  }
  if (alterNumber === -1) {
    return "flat";
  }
  if (alterNumber === 0) {
    return "natural";
  }
  if (alterNumber === 1) {
    return "sharp";
  }
  if (alterNumber === 2) {
    return "double-sharp";
  }
  return null;
}

function countKeySharps(keySignatureStepAlter) {
  let count = 0;
  for (const step of Object.keys(keySignatureStepAlter || {})) {
    if (Number(keySignatureStepAlter[step]) > 0) {
      count += 1;
    }
  }
  return count;
}

function countKeyFlats(keySignatureStepAlter) {
  let count = 0;
  for (const step of Object.keys(keySignatureStepAlter || {})) {
    if (Number(keySignatureStepAlter[step]) < 0) {
      count += 1;
    }
  }
  return count;
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

function normalizeKeyModeValue(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text === "major" || text === "minor") {
    return text;
  }
  return "auto";
}

function normalizeKeyFifthsValue(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text === "auto") {
    return null;
  }
  const num = Number.parseInt(text, 10);
  if (!Number.isFinite(num)) {
    return null;
  }
  return Math.max(-7, Math.min(7, num));
}

function resetOutput() {
  lastXmlText = "";
  xmlOutput.textContent = "";
  previewText.textContent = "未変換";
  downloadBtn.disabled = true;
  copyBtn.disabled = true;
}

function setError(message) {
  if (errorText && typeof errorText.show === "function") {
    errorText.show(message);
  } else if (errorText) {
    errorText.textContent = message;
    errorText.classList.remove("md-hidden");
  }
}

function clearError() {
  if (errorText && typeof errorText.clear === "function") {
    errorText.clear();
  } else if (errorText) {
    errorText.textContent = "";
    errorText.classList.add("md-hidden");
  }
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
      keyMode: keyModeSelect.value,
      keyFifths: keyFifthsSelect.value,
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
    if (parsed.keyMode) {
      keyModeSelect.value = normalizeKeyModeValue(String(parsed.keyMode));
    }
    if (typeof parsed.keyFifths !== "undefined") {
      const normalized = normalizeKeyFifthsValue(String(parsed.keyFifths));
      keyFifthsSelect.value = normalized === null ? "auto" : String(normalized);
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

function showToast(message) {
  if (!toast || typeof toast.show !== "function") {
    return;
  }
  toast.show(message, 1600);
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
