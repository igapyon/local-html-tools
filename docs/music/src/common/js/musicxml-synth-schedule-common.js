/*
 * Copyright 2026 Toshiki Iga
 * SPDX-License-Identifier: Apache-2.0
 */
const MusicXmlSynthScheduleCommon = (() => {
    const musicXmlCommonRef = window["MusicXmlCommon"] || (typeof MusicXmlCommon !== "undefined" ? MusicXmlCommon : null);
    if (!musicXmlCommonRef) {
        throw new Error("MusicXmlCommon is not loaded.");
    }
    function buildSynthScheduleFromMusicXml(source, options) {
        const ticksPerQuarter = normalizeTicksPerQuarter(options && options.ticksPerQuarter);
        const xmlDoc = musicXmlCommonRef.parseScorePartwiseXml(source);
        const root = xmlDoc.documentElement;
        const partNodes = Array.from(root.children).filter((node) => node.nodeType === 1 && node.nodeName === "part");
        if (partNodes.length === 0) {
            throw new Error("part が見つかりません。");
        }
        let tempo = 120;
        let tempoDetected = false;
        const events = [];
        for (let partIndex = 0; partIndex < partNodes.length; partIndex += 1) {
            const part = partNodes[partIndex];
            let divisions = 960;
            let timelineTick = 0;
            let currentTranspose = 0;
            const channel = defaultChannelForPartIndex(partIndex);
            const measureNodes = Array.from(part.children).filter((node) => node.nodeType === 1 && node.nodeName === "measure");
            for (const measureNode of measureNodes) {
                const attrNode = firstDirectChild(measureNode, "attributes");
                if (attrNode) {
                    const divText = getChildText(attrNode, "divisions");
                    if (divText) {
                        const divVal = Number.parseInt(divText, 10);
                        if (Number.isFinite(divVal) && divVal > 0) {
                            divisions = divVal;
                        }
                    }
                    const transposeNode = firstDirectChild(attrNode, "transpose");
                    if (transposeNode) {
                        const chromaticText = getChildText(transposeNode, "chromatic");
                        const octaveChangeText = getChildText(transposeNode, "octave-change");
                        const chromatic = chromaticText ? Number.parseInt(chromaticText, 10) : 0;
                        const octaveChange = octaveChangeText ? Number.parseInt(octaveChangeText, 10) : 0;
                        currentTranspose =
                            (Number.isFinite(chromatic) ? chromatic : 0) +
                                ((Number.isFinite(octaveChange) ? octaveChange : 0) * 12);
                    }
                }
                if (!tempoDetected) {
                    for (const child of Array.from(measureNode.children)) {
                        if (child.nodeName !== "direction") {
                            continue;
                        }
                        const soundNode = firstDirectChild(child, "sound");
                        const tempoText = soundNode ? soundNode.getAttribute("tempo") : "";
                        if (tempoText) {
                            const tempoVal = Number.parseFloat(tempoText);
                            if (Number.isFinite(tempoVal) && tempoVal > 0) {
                                tempo = Math.max(20, Math.min(300, Math.round(tempoVal)));
                                tempoDetected = true;
                                break;
                            }
                        }
                    }
                }
                let cursorTick = 0;
                let measureMaxTick = 0;
                for (const child of Array.from(measureNode.children)) {
                    if (child.nodeName === "note") {
                        const durationVal = Number.parseInt(getChildText(child, "duration"), 10);
                        const ticks = durationToMidiTicks(durationVal, divisions, ticksPerQuarter);
                        const isRest = !!firstDirectChild(child, "rest");
                        const isChord = !!firstDirectChild(child, "chord");
                        const startTick = isChord ? Math.max(0, timelineTick + cursorTick - ticks) : timelineTick + cursorTick;
                        if (!isRest) {
                            const pitchNode = firstDirectChild(child, "pitch");
                            const step = getChildText(pitchNode, "step");
                            const octave = Number.parseInt(getChildText(pitchNode, "octave"), 10);
                            const alterText = getChildText(pitchNode, "alter");
                            const alter = alterText === "" ? 0 : Number.parseInt(alterText, 10);
                            if (step && Number.isFinite(octave)) {
                                const soundingMidi = stepAlterOctaveToMidiNumber(step, Number.isFinite(alter) ? alter : 0, octave) + currentTranspose;
                                if (soundingMidi >= 0 && soundingMidi <= 127) {
                                    events.push({
                                        midiNumber: soundingMidi,
                                        start: Math.max(0, Math.round(startTick)),
                                        ticks: Math.max(1, ticks),
                                        channel
                                    });
                                }
                            }
                        }
                        if (!isChord) {
                            cursorTick += ticks;
                            measureMaxTick = Math.max(measureMaxTick, cursorTick);
                        }
                    }
                    else if (child.nodeName === "backup") {
                        cursorTick = Math.max(0, cursorTick - durationToMidiTicks(Number.parseInt(getChildText(child, "duration"), 10), divisions, ticksPerQuarter));
                    }
                    else if (child.nodeName === "forward") {
                        cursorTick += durationToMidiTicks(Number.parseInt(getChildText(child, "duration"), 10), divisions, ticksPerQuarter);
                        measureMaxTick = Math.max(measureMaxTick, cursorTick);
                    }
                }
                timelineTick += Math.max(0, measureMaxTick);
            }
        }
        events.sort((a, b) => {
            if (a.start !== b.start) {
                return a.start - b.start;
            }
            return a.midiNumber - b.midiNumber;
        });
        return {
            tempo,
            events
        };
    }
    function normalizeTicksPerQuarter(value) {
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0) {
            return Math.round(parsed);
        }
        return 128;
    }
    function durationToMidiTicks(durationVal, divisions, ticksPerQuarter) {
        if (!Number.isFinite(durationVal) || durationVal <= 0 || !Number.isFinite(divisions) || divisions <= 0) {
            return 1;
        }
        return Math.max(1, Math.round((durationVal * ticksPerQuarter) / divisions));
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
    function defaultChannelForPartIndex(partIndex) {
        const oneBased = (partIndex % 16) + 1;
        if (oneBased === 10) {
            return 11;
        }
        return oneBased;
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
    return {
        buildSynthScheduleFromMusicXml
    };
})();
if (typeof window !== "undefined") {
    window["MusicXmlSynthScheduleCommon"] = MusicXmlSynthScheduleCommon;
}
