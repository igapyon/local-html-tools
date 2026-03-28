/*
 * Copyright 2026 Toshiki Iga
 * SPDX-License-Identifier: Apache-2.0
 */
const MusicXmlCommon = (() => {
    function readTextFileUtf8(file, onLoad, onError) {
        const reader = new FileReader();
        reader.onload = () => {
            onLoad(String(reader.result || ""));
        };
        reader.onerror = () => {
            if (typeof onError === "function") {
                onError(reader.error || new Error("file read failed"));
            }
        };
        reader.readAsText(file, "utf-8");
    }
    function normalizeMusicXmlSource(rawText) {
        if (!rawText) {
            return "";
        }
        const lines = String(rawText).split("\n");
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
    function parseScorePartwiseXml(source) {
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
        return xmlDoc;
    }
    return {
        readTextFileUtf8,
        normalizeMusicXmlSource,
        parseScorePartwiseXml
    };
})();
if (typeof window !== "undefined") {
    window["MusicXmlCommon"] = MusicXmlCommon;
}
