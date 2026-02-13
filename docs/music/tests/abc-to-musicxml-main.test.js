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

describe("abc-to-musicxml main", () => {
  it("can disable transpose inference for in-A source", () => {
    document.body.innerHTML = `
      <textarea id="abcInput"></textarea>
      <input id="fileInput" />
      <input id="inputModeSource" type="radio" checked />
      <input id="inputModeFile" type="radio" />
      <div id="sourceInputBlock"></div>
      <div id="fileInputBlock"></div>
      <button id="fileSelectBtn"></button>
      <span id="fileNameText"></span>
      <input id="defaultTitleInput" value="Untitled" />
      <input id="defaultComposerInput" value="Unknown" />
      <input id="inferTransposeFromPartNameCheckbox" type="checkbox" checked />
      <button id="convertBtn"></button>
      <button id="downloadBtn"></button>
      <button id="playSineBtn"></button>
      <button id="copyBtn"></button>
      <pre id="previewText"></pre>
      <pre id="xmlOutput"></pre>
      <p id="errorText"></p>
      <p id="warningText"></p>
      <div id="toast"></div>
      <div id="menuPanel"></div>
    `;
    installLocalStorageMock();

    const abcInput = document.getElementById("abcInput");
    abcInput.value = `X:1
T:Test
M:4/4
L:1/4
K:C
V:1 name="clarinet in A"
^G A B c |`;

    runScript("../src/common/ts/abc-common.ts");
    runScript("../src/common/ts/musicxml-common.ts");
    runScript("../src/common/ts/musicxml-synth-schedule-common.ts");
    runScript("../src/common/ts/music-synth-common.ts");
    runScript("../src/common/ts/musicxml-writer-common.ts");
    runScript("../src/common/ts/abc-compat-parser.ts");
    runScript("../src/abc-to-musicxml/ts/main.ts");

    const checkbox = document.getElementById("inferTransposeFromPartNameCheckbox");
    checkbox.checked = false;
    document.getElementById("convertBtn").click();

    const xmlOutput = document.getElementById("xmlOutput");
    const xml1 = xmlOutput.textContent;
    expect(xml1).not.toContain("<transpose>");
    expect(xml1).toContain("<step>G</step>");
    expect(xml1).toContain("<alter>1</alter>");

    abcInput.value = `X:1
T:Test
M:4/4
L:1/4
K:A
V:1 name="clarinet in A"
G A B c |`;
    document.getElementById("convertBtn").click();

    const xml2 = xmlOutput.textContent;
    expect(xml2).not.toContain("<transpose>");
    expect(xml2).toContain("<key><fifths>3</fifths></key>");
    expect(xml2).toContain("<step>G</step>");
    expect(xml2).toContain("<alter>1</alter>");
  });

  it("enables transpose inference by default for in-A part name", () => {
    document.body.innerHTML = `
      <textarea id="abcInput"></textarea>
      <input id="fileInput" />
      <input id="inputModeSource" type="radio" checked />
      <input id="inputModeFile" type="radio" />
      <div id="sourceInputBlock"></div>
      <div id="fileInputBlock"></div>
      <button id="fileSelectBtn"></button>
      <span id="fileNameText"></span>
      <input id="defaultTitleInput" value="Untitled" />
      <input id="defaultComposerInput" value="Unknown" />
      <input id="inferTransposeFromPartNameCheckbox" type="checkbox" checked />
      <button id="convertBtn"></button>
      <button id="downloadBtn"></button>
      <button id="playSineBtn"></button>
      <button id="copyBtn"></button>
      <pre id="previewText"></pre>
      <pre id="xmlOutput"></pre>
      <p id="errorText"></p>
      <p id="warningText"></p>
      <div id="toast"></div>
      <div id="menuPanel"></div>
    `;
    installLocalStorageMock();

    const abcInput = document.getElementById("abcInput");
    abcInput.value = `X:1
T:Test
M:4/4
L:1/4
K:A
V:1 name="clarinet in A"
C |`;

    runScript("../src/common/ts/abc-common.ts");
    runScript("../src/common/ts/musicxml-common.ts");
    runScript("../src/common/ts/musicxml-synth-schedule-common.ts");
    runScript("../src/common/ts/music-synth-common.ts");
    runScript("../src/common/ts/musicxml-writer-common.ts");
    runScript("../src/common/ts/abc-compat-parser.ts");
    runScript("../src/abc-to-musicxml/ts/main.ts");

    const xml = document.getElementById("xmlOutput").textContent;
    expect(xml).toContain("<transpose>");
    expect(xml).toContain("<chromatic>-3</chromatic>");
  });

  it("infers transpose semitones from part names (in Bb / in F)", () => {
    document.body.innerHTML = `
      <textarea id="abcInput"></textarea>
      <input id="fileInput" />
      <input id="inputModeSource" type="radio" checked />
      <input id="inputModeFile" type="radio" />
      <div id="sourceInputBlock"></div>
      <div id="fileInputBlock"></div>
      <button id="fileSelectBtn"></button>
      <span id="fileNameText"></span>
      <input id="defaultTitleInput" value="Untitled" />
      <input id="defaultComposerInput" value="Unknown" />
      <input id="inferTransposeFromPartNameCheckbox" type="checkbox" checked />
      <button id="convertBtn"></button>
      <button id="downloadBtn"></button>
      <button id="playSineBtn"></button>
      <button id="copyBtn"></button>
      <pre id="previewText"></pre>
      <pre id="xmlOutput"></pre>
      <p id="errorText"></p>
      <p id="warningText"></p>
      <div id="toast"></div>
      <div id="menuPanel"></div>
    `;
    installLocalStorageMock();

    const abcInput = document.getElementById("abcInput");
    abcInput.value = `X:1
T:Test
M:4/4
L:1/4
K:C
%%score (V1) (V2)
V:V1 name="clarinet in Bb"
C |
V:V2 name="horn in F"
C |`;

    runScript("../src/common/ts/abc-common.ts");
    runScript("../src/common/ts/musicxml-common.ts");
    runScript("../src/common/ts/musicxml-synth-schedule-common.ts");
    runScript("../src/common/ts/music-synth-common.ts");
    runScript("../src/common/ts/musicxml-writer-common.ts");
    runScript("../src/common/ts/abc-compat-parser.ts");
    runScript("../src/abc-to-musicxml/ts/main.ts");

    const xml = document.getElementById("xmlOutput").textContent;
    expect(xml).toContain("<part-name>clarinet in Bb</part-name>");
    expect(xml).toContain("<part-name>horn in F</part-name>");
    expect(xml).toContain("<chromatic>-2</chromatic>");
    expect(xml).toContain("<chromatic>5</chromatic>");
  });

  it("supports M:C, tie, broken rhythm, and inline text", () => {
    document.body.innerHTML = `
      <textarea id="abcInput"></textarea>
      <input id="fileInput" />
      <input id="inputModeSource" type="radio" checked />
      <input id="inputModeFile" type="radio" />
      <div id="sourceInputBlock"></div>
      <div id="fileInputBlock"></div>
      <button id="fileSelectBtn"></button>
      <span id="fileNameText"></span>
      <input id="defaultTitleInput" value="Untitled" />
      <input id="defaultComposerInput" value="Unknown" />
      <input id="inferTransposeFromPartNameCheckbox" type="checkbox" />
      <button id="convertBtn"></button>
      <button id="downloadBtn"></button>
      <button id="playSineBtn"></button>
      <button id="copyBtn"></button>
      <pre id="previewText"></pre>
      <pre id="xmlOutput"></pre>
      <p id="errorText"></p>
      <p id="warningText"></p>
      <div id="toast"></div>
      <div id="menuPanel"></div>
    `;
    installLocalStorageMock();

    const abcInput = document.getElementById("abcInput");
    abcInput.value = `X:1
T:Q
M:C
L:1/8
K:Bb
V:1
D2-|D2 E > F "pizz." G2 |`;

    runScript("../src/common/ts/abc-common.ts");
    runScript("../src/common/ts/musicxml-common.ts");
    runScript("../src/common/ts/musicxml-synth-schedule-common.ts");
    runScript("../src/common/ts/music-synth-common.ts");
    runScript("../src/common/ts/musicxml-writer-common.ts");
    runScript("../src/common/ts/abc-compat-parser.ts");
    runScript("../src/abc-to-musicxml/ts/main.ts");

    const xml = document.getElementById("xmlOutput").textContent;
    const warning = document.getElementById("warningText").textContent;
    expect(xml).toContain("<time><beats>4</beats><beat-type>4</beat-type></time>");
    expect(xml).toContain("<tie type=\"start\"/>");
    expect(xml).toContain("<tie type=\"stop\"/>");
    expect(xml).toContain("<duration>720</duration>");
    expect(xml).toContain("<duration>240</duration>");
    expect(warning).toContain("インライン文字列");
  });

  it("accepts x rest tokens", () => {
    document.body.innerHTML = `
      <textarea id="abcInput"></textarea>
      <input id="fileInput" />
      <input id="inputModeSource" type="radio" checked />
      <input id="inputModeFile" type="radio" />
      <div id="sourceInputBlock"></div>
      <div id="fileInputBlock"></div>
      <button id="fileSelectBtn"></button>
      <span id="fileNameText"></span>
      <input id="defaultTitleInput" value="Untitled" />
      <input id="defaultComposerInput" value="Unknown" />
      <input id="inferTransposeFromPartNameCheckbox" type="checkbox" />
      <button id="convertBtn"></button>
      <button id="downloadBtn"></button>
      <button id="playSineBtn"></button>
      <button id="copyBtn"></button>
      <pre id="previewText"></pre>
      <pre id="xmlOutput"></pre>
      <p id="errorText"></p>
      <p id="warningText"></p>
      <div id="toast"></div>
      <div id="menuPanel"></div>
    `;
    installLocalStorageMock();

    const abcInput = document.getElementById("abcInput");
    abcInput.value = `X:1
T:R
M:4/4
L:1/16
K:C
V:1
x16|x8 z8|`;

    runScript("../src/common/ts/abc-common.ts");
    runScript("../src/common/ts/musicxml-common.ts");
    runScript("../src/common/ts/musicxml-synth-schedule-common.ts");
    runScript("../src/common/ts/music-synth-common.ts");
    runScript("../src/common/ts/musicxml-writer-common.ts");
    runScript("../src/common/ts/abc-compat-parser.ts");
    runScript("../src/abc-to-musicxml/ts/main.ts");

    const xml = document.getElementById("xmlOutput").textContent;
    expect(xml).toContain("<rest/>");
    expect(document.getElementById("errorText").textContent).toBe("");
  });

  it("supports tuplets and chord notes", () => {
    document.body.innerHTML = `
      <textarea id="abcInput"></textarea>
      <input id="fileInput" />
      <input id="inputModeSource" type="radio" checked />
      <input id="inputModeFile" type="radio" />
      <div id="sourceInputBlock"></div>
      <div id="fileInputBlock"></div>
      <button id="fileSelectBtn"></button>
      <span id="fileNameText"></span>
      <input id="defaultTitleInput" value="Untitled" />
      <input id="defaultComposerInput" value="Unknown" />
      <input id="inferTransposeFromPartNameCheckbox" type="checkbox" />
      <button id="convertBtn"></button>
      <button id="downloadBtn"></button>
      <button id="playSineBtn"></button>
      <button id="copyBtn"></button>
      <pre id="previewText"></pre>
      <pre id="xmlOutput"></pre>
      <p id="errorText"></p>
      <p id="warningText"></p>
      <div id="toast"></div>
      <div id="menuPanel"></div>
    `;
    installLocalStorageMock();

    const abcInput = document.getElementById("abcInput");
    abcInput.value = `X:1
T:Drowzy Maggie
M:4/4
L:1/8
K:D
(3bag (3agf gfed|[DFA] [EGB] [A,cf]|`;

    runScript("../src/common/ts/abc-common.ts");
    runScript("../src/common/ts/musicxml-common.ts");
    runScript("../src/common/ts/musicxml-synth-schedule-common.ts");
    runScript("../src/common/ts/music-synth-common.ts");
    runScript("../src/common/ts/musicxml-writer-common.ts");
    runScript("../src/common/ts/abc-compat-parser.ts");
    runScript("../src/abc-to-musicxml/ts/main.ts");

    const xml = document.getElementById("xmlOutput").textContent;
    expect(document.getElementById("errorText").textContent).toBe("");
    expect(xml).toContain("<chord/>");
  });
});
