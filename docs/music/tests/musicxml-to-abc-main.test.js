// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runScript(relPath) {
  const code = readFileSync(path.resolve(__dirname, relPath), "utf8");
  new Function(code)();
}

function installLocalStorageMock() {
  const store = new Map();
  const mock = {
    getItem(key) {
      return store.has(String(key)) ? store.get(String(key)) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
    }
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: mock,
    configurable: true
  });
}

describe("musicxml-to-abc main", () => {
  it("applies transpose to key and pitch for transposing instruments", () => {
    document.body.innerHTML = `
      <textarea id="xmlInput"></textarea>
      <input id="fileInput" />
      <input id="inputModeSource" type="radio" checked />
      <input id="inputModeFile" type="radio" />
      <div id="sourceInputBlock"></div>
      <div id="fileInputBlock"></div>
      <button id="fileSelectBtn"></button>
      <span id="fileNameText"></span>
      <input id="defaultTitleInput" value="Untitled" />
      <input id="defaultComposerInput" value="Unknown" />
      <select id="defaultLengthSelect"><option value="1/4" selected>1/4</option></select>
      <button id="convertBtn"></button>
      <button id="downloadBtn"></button>
      <button id="playSineBtn"></button>
      <button id="copyBtn"></button>
      <pre id="previewText"></pre>
      <pre id="abcOutput"></pre>
      <p id="errorText"></p>
      <p id="warningText"></p>
      <div id="toast"></div>
      <div id="menuPanel"></div>
    `;
    installLocalStorageMock();

    const xmlInput = document.getElementById("xmlInput");
    xmlInput.value = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1"><part-name>clarinet in A</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>960</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <transpose><chromatic>-3</chromatic></transpose>
      </attributes>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>960</duration></note>
    </measure>
  </part>
</score-partwise>`;

    runScript("../src/common/ts/musicxml-common.ts");
    runScript("../src/common/ts/musicxml-synth-schedule-common.ts");
    runScript("../src/common/ts/music-synth-common.ts");
    runScript("../src/common/ts/abc-common.ts");
    runScript("../src/musicxml-to-abc/ts/main.ts");

    const output = document.getElementById("abcOutput").textContent;
    expect(output).toContain("K:A");
    expect(output).toContain("A");
    expect(output).not.toContain("in A");
  });

  it("applies chromatic plus octave-change to notes", () => {
    document.body.innerHTML = `
      <textarea id="xmlInput"></textarea>
      <input id="fileInput" />
      <input id="inputModeSource" type="radio" checked />
      <input id="inputModeFile" type="radio" />
      <div id="sourceInputBlock"></div>
      <div id="fileInputBlock"></div>
      <button id="fileSelectBtn"></button>
      <span id="fileNameText"></span>
      <input id="defaultTitleInput" value="Untitled" />
      <input id="defaultComposerInput" value="Unknown" />
      <select id="defaultLengthSelect"><option value="1/4" selected>1/4</option></select>
      <button id="convertBtn"></button>
      <button id="downloadBtn"></button>
      <button id="playSineBtn"></button>
      <button id="copyBtn"></button>
      <pre id="previewText"></pre>
      <pre id="abcOutput"></pre>
      <p id="errorText"></p>
      <p id="warningText"></p>
      <div id="toast"></div>
      <div id="menuPanel"></div>
    `;
    installLocalStorageMock();

    const xmlInput = document.getElementById("xmlInput");
    xmlInput.value = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1"><part-name>test</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>960</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <transpose><chromatic>2</chromatic><octave-change>-1</octave-change></transpose>
      </attributes>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>960</duration></note>
    </measure>
  </part>
</score-partwise>`;

    runScript("../src/common/ts/musicxml-common.ts");
    runScript("../src/common/ts/musicxml-synth-schedule-common.ts");
    runScript("../src/common/ts/music-synth-common.ts");
    runScript("../src/common/ts/abc-common.ts");
    runScript("../src/musicxml-to-abc/ts/main.ts");

    const output = document.getElementById("abcOutput").textContent;
    // C5 + (2 - 12) = D4
    expect(output).toContain("D");
  });
});
