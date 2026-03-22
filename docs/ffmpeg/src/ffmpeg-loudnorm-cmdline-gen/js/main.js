    function generateAnalyzeCmd() {
      const filename = document.getElementById("filename").value.trim();
      const analyzeNode = document.getElementById("analyzeCmd");
      if (!analyzeNode) return;
      if (!filename) {
        analyzeNode.textContent = "";
        return;
      }
      const outFile = filename.replace(/\.WAV$/i, "-loudnorm-meta.json");
      const cmd = `ffmpeg -i ${filename} -af loudnorm=print_format=json -f null - 2>&1 | tee ${outFile}`;
      analyzeNode.textContent = cmd;
    }

    function extractJson(text) {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1 || end <= start) throw new Error("JSON部分が見つかりません");
      return text.substring(start, end + 1);
    }

    function getModeConfig() {
      const modeConfigs = {
        music_release: { I: -14, LRA: 11, tp: -1.0, linear: "true", tag: "music-release" },
        music_practice:{ I: -21, LRA: 20, tp: -1.5, linear: "true", tag: "music-practice" },
        strong:        { I: -17, LRA: 10, tp: -1.5, linear: "true", tag: "strong" },
        cinema:        { I: -23, LRA: 22, tp: -1.0, linear: "true", tag: "cinema" },
        variety:       { I: -16, LRA: 8,  tp: -1.0, linear: "true", tag: "variety" },
        podcast:       { I: -18, LRA: 7,  tp: -1.0, linear: "true", tag: "podcast" },
        livestream:    { I: -16, LRA: 6,  tp: -1.0, linear: "true", tag: "livestream" },
        lecture:       { I: -18, LRA: 9,  tp: -1.0, linear: "true", tag: "lecture" },
        bgm:           { I: -16, LRA: 5,  tp: -1.0, linear: "true", tag: "bgm" },
        asmr:          { I: -20, LRA: 12, tp: -1.5, linear: "true", tag: "asmr" }
      };
      const modeValue = document.querySelector('input[name="mode"]:checked').value;
      return modeConfigs[modeValue] || modeConfigs.music_release;
    }

    function getRezConfig() {
      const hires = document.getElementById("hires").checked;
      if (hires) {
        return { ar: 192000, sample_fmt: "s32", codec: "pcm_s24le", rezTag: "hires" };
      }
      return { ar: 44100, sample_fmt: "s16", codec: "pcm_s16le", rezTag: "lores" };
    }

    function generateNormalizeCmd() {
      try {
        const raw = document.getElementById("jsonInput").value;
        const extracted = extractJson(raw);
        const json = JSON.parse(extracted);

        const filenameInput = document.getElementById("filename");
        let inputFile = filenameInput.value.trim();

        if (!inputFile) {
          const match = raw.match(/from '([^']+\.(wav|WAV|flac|aiff))'/);
          if (match) {
            inputFile = match[1];
            filenameInput.value = inputFile;
          } else {
            alert("ファイル名を入力してください（または ffmpeg 出力に含まれる必要があります）。");
            return;
          }
        }

        // モード設定
        const modeConfig = getModeConfig();
        const { I, LRA, tp, linear, tag: modeTag } = modeConfig;

        // ローレゾ / ハイレゾ設定
        const { ar, sample_fmt, codec, rezTag } = getRezConfig();

        // 出力ファイル名にタグ追加
        const outFile = inputFile.replace(/\.(wav|WAV|flac|aiff)$/i, `-loudnorm-${rezTag}-${modeTag}.wav`);

        const cmd = `ffmpeg -i ${inputFile} \
-af loudnorm=I=${I}:TP=${tp}:LRA=${LRA}:measured_I=${json.input_i}:measured_TP=${json.input_tp}:measured_LRA=${json.input_lra}:measured_thresh=${json.input_thresh}:offset=${json.target_offset}:linear=${linear}:print_format=summary \
-ar ${ar} -sample_fmt ${sample_fmt} -c:a ${codec} \
${outFile}`;

        document.getElementById("normalizeCmd").textContent = cmd;
      } catch (e) {
        alert("正しい JSON を含む ffmpeg 出力を貼り付けてください。\n" + e.message);
      }
    }

    function buildGainCommand({ silent = false } = {}) {
      const raw = document.getElementById("jsonInput").value;
      const filenameInput = document.getElementById("filename");
      let inputFile = filenameInput.value.trim();

      let json;
      try {
        const extracted = extractJson(raw);
        json = JSON.parse(extracted);
      } catch (e) {
        if (!silent) {
          alert("正しい JSON を含む ffmpeg 出力を貼り付けてください。\n" + e.message);
        }
        return null;
      }

      if (!inputFile) {
        const match = raw.match(/from '([^']+\.(wav|WAV|flac|aiff))'/);
        if (match) {
          inputFile = match[1];
          filenameInput.value = inputFile;
        } else {
          if (!silent) {
            alert("ファイル名を入力してください（または ffmpeg 出力に含まれる必要があります）。");
          }
          return null;
        }
      }

      const targetTP = Number(document.getElementById("gainTargetTp").value);
      if (isNaN(targetTP)) {
        if (!silent) {
          alert("目標TPは数値で入力してください。");
        }
        return null;
      }

      const inputTP = Number(json.input_tp);
      if (isNaN(inputTP)) {
        if (!silent) {
          alert("input_tp が解析できません。ffmpeg 出力を確認してください。");
        }
        return null;
      }

      const gain = Math.round((targetTP - inputTP) * 10) / 10;
      const gainLabel = `${gain >= 0 ? "+" : ""}${gain}dB`;
      const useCompressor = document.getElementById("gainUseCompressor").checked;

      const { ar, sample_fmt, codec, rezTag } = getRezConfig();
      const tpTag = `tp${targetTP.toFixed(1).replace(".", "p")}`;
      const compTag = useCompressor ? "comp" : "plain";
      const outFileWithComp = inputFile.replace(/\.(wav|WAV|flac|aiff)$/i, `-gain-${rezTag}-${tpTag}-${compTag}-${gainLabel}.wav`);
      const filter = useCompressor
        ? `volume=${gainLabel},acompressor=threshold=-20dB:ratio=2.5:attack=8:release=150`
        : `volume=${gainLabel}`;
      return `ffmpeg -i ${inputFile} -af "${filter}" -ar ${ar} -sample_fmt ${sample_fmt} -c:a ${codec} ${outFileWithComp}`;
    }

    function generateGainCmd({ silent = false } = {}) {
      const gainNode = document.getElementById("gainCmd");
      if (!gainNode) return;
      const cmd = buildGainCommand({ silent });
      gainNode.textContent = cmd || "";
    }

    function showToast(message) {
      const toast = document.getElementById("toast");
      toast.textContent = message;
      toast.classList.remove("md-hidden");
      toast.classList.add("md-visible");
      setTimeout(() => {
        toast.classList.remove("md-visible");
        toast.classList.add("md-hidden");
      }, 2000);
    }

    function setActiveTab(targetId) {
      document.querySelectorAll(".md-tab-button").forEach(btn => {
        const isActive = btn.getAttribute("data-target") === targetId;
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      document.querySelectorAll(".md-tab-panel").forEach(panel => {
        const panelTarget = panel.getAttribute("data-tab");
        if (!panelTarget) return;
        panel.hidden = panelTarget !== targetId;
      });
    }

    document.querySelectorAll(".md-tab-button").forEach(button => {
      button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-target");
        if (!targetId) return;
        setActiveTab(targetId);
      });
    });

    setActiveTab("tab-icu");

    document.addEventListener("DOMContentLoaded", () => {
      const filenameInput = document.getElementById("filename");
      if (filenameInput) {
        filenameInput.addEventListener("input", generateAnalyzeCmd);
        filenameInput.addEventListener("change", generateAnalyzeCmd);
        filenameInput.addEventListener("input", () => generateGainCmd({ silent: true }));
        filenameInput.addEventListener("change", () => generateGainCmd({ silent: true }));
      }

      const jsonInput = document.getElementById("jsonInput");
      if (jsonInput) {
        jsonInput.addEventListener("input", () => generateGainCmd({ silent: true }));
        jsonInput.addEventListener("change", () => generateGainCmd({ silent: true }));
      }

      const gainTargetTpInput = document.getElementById("gainTargetTp");
      if (gainTargetTpInput) {
        gainTargetTpInput.addEventListener("input", () => generateGainCmd({ silent: true }));
        gainTargetTpInput.addEventListener("change", () => generateGainCmd({ silent: true }));
      }

      const hiresSwitch = document.getElementById("hires");
      if (hiresSwitch) {
        hiresSwitch.addEventListener("change", () => generateGainCmd({ silent: true }));
      }

      const gainUseCompressorSwitch = document.getElementById("gainUseCompressor");
      if (gainUseCompressorSwitch) {
        gainUseCompressorSwitch.addEventListener("change", () => generateGainCmd({ silent: true }));
      }
      generateAnalyzeCmd();
      generateGainCmd({ silent: true });
    });
