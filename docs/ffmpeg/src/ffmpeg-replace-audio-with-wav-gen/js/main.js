    function inferOutputName(input, audio, container, offsetMs) {
      const base = input.replace(/\.[^/.]+$/i, "");
      const audioBase = audio.replace(/\.[^/.]+$/i, "");
      let offsetTag = "";
      if (offsetMs) {
        const normalized = String(offsetMs).trim();
        const prefix = normalized.startsWith("-") ? "" : "+";
        offsetTag = `-offset${prefix}${normalized}ms`;
      }
      return `${base}-replace-${audioBase}${offsetTag}.${container}`;
    }

    function generateProbeCommand() {
      const audioFile = document.getElementById("audioFile").value.trim();
      if (!audioFile) {
        alert("音声ファイル名を入力してください。");
        return;
      }
      const cmd = `ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate,channels,channel_layout -of json ${audioFile}`;
      document.getElementById("probeCmd").textContent = cmd;
    }

    function extractJson(text) {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start === -1 || end === -1 || end <= start) return null;
      return text.substring(start, end + 1);
    }

    function parseProbeOutput(raw) {
      let sampleRate = null;
      let channels = null;
      let channelLayout = null;

      const jsonText = extractJson(raw);
      if (jsonText) {
        try {
          const parsed = JSON.parse(jsonText);
          const stream = parsed.streams && parsed.streams[0];
          if (stream) {
            if (stream.sample_rate) sampleRate = String(stream.sample_rate);
            if (stream.channels) channels = Number(stream.channels);
            if (stream.channel_layout) channelLayout = String(stream.channel_layout);
          }
        } catch (e) {
          // fall through to regex parsing
        }
      }

      if (!sampleRate) {
        const match = raw.match(/sample_rate"?\s*[:=]\s*"?(\d+)/i);
        if (match) sampleRate = match[1];
      }
      if (!channels) {
        const match = raw.match(/channels"?\s*[:=]\s*"?(\d+)/i);
        if (match) channels = Number(match[1]);
      }
      if (!channelLayout) {
        const match = raw.match(/channel_layout"?\s*[:=]\s*"?([a-z_]+)"/i);
        if (match) channelLayout = match[1];
      }

      if (!channels && channelLayout) {
        if (channelLayout === "mono") channels = 1;
        if (channelLayout === "stereo") channels = 2;
      }

      return { sampleRate, channels, channelLayout };
    }

    function clampSampleRateForCodec(sampleRate, codec) {
      if (!sampleRate) return sampleRate;
      if (codec === "aac" && Number(sampleRate) > 96000) {
        return "96000";
      }
      return sampleRate;
    }

    function handleCodecChange() {
      const codec = document.getElementById("audioCodec").value;
      const containerSelect = document.getElementById("container");
      const sampleSelect = document.getElementById("sampleRate");
      const options = Array.from(getSelectOptions(sampleSelect));
      options.forEach(option => {
        if (option.value === "192000") {
          option.disabled = (codec === "aac");
        }
      });

      if (codec === "aac") {
        if (sampleSelect.value === "192000") {
          sampleSelect.value = "96000";
        }
        const detectedSampleRate = sampleSelect.dataset.detectedSampleRate;
        if (detectedSampleRate && Number(detectedSampleRate) > 96000) {
          sampleSelect.dataset.detectedSampleRate = "96000";
        }
      }

      const pcmSelected = codec.startsWith("pcm_");
      Array.from(getSelectOptions(containerSelect)).forEach(option => {
        if (option.value === "mp4") {
          option.disabled = pcmSelected;
        }
      });
      if (pcmSelected && containerSelect.value === "mp4") {
        containerSelect.value = "mkv";
      }

      const bitrateSelect = document.getElementById("audioBitrate");
      bitrateSelect.disabled = pcmSelected;
    }

    function handleContainerChange() {
      const container = document.getElementById("container").value;
      const outputInput = document.getElementById("outputFile");
      if (!outputInput.value) {
        outputInput.placeholder = `例: output.${container}`;
      }
    }

    function applyProbeResult() {
      const raw = document.getElementById("probeOutput").value.trim();
      if (!raw) {
        alert("ffprobe 出力を貼り付けてください。");
        return;
      }

      const codec = document.getElementById("audioCodec").value;
      const { sampleRate, channels, channelLayout } = parseProbeOutput(raw);
      const normalizedSampleRate = clampSampleRateForCodec(sampleRate, codec);
      const summaryParts = [];

      if (normalizedSampleRate) {
        const sampleSelect = document.getElementById("sampleRate");
        let hasOption = false;
        Array.from(getSelectOptions(sampleSelect)).forEach(option => {
          if (option.value === normalizedSampleRate) hasOption = true;
        });
        if (!hasOption) {
          appendSelectOption(sampleSelect, normalizedSampleRate, `${normalizedSampleRate} Hz（ソース）`);
        }
        sampleSelect.value = normalizedSampleRate;
        if (normalizedSampleRate !== sampleRate) {
          summaryParts.push(`サンプルレート: ${sampleRate} Hz → ${normalizedSampleRate} Hz`);
        } else {
          summaryParts.push(`サンプルレート: ${normalizedSampleRate} Hz`);
        }
      }

      if (channels) {
        const channelSelect = document.getElementById("channels");
        if (channels === 1 || channels === 2) {
          channelSelect.value = String(channels);
        } else {
          channelSelect.value = "auto";
          channelSelect.dataset.detectedChannels = String(channels);
        }
        summaryParts.push(`チャンネル数: ${channels}ch`);
      } else if (channelLayout) {
        summaryParts.push(`チャンネル構成: ${channelLayout}`);
      }

      document.getElementById("channels").dataset.detectedChannels = channels ? String(channels) : "";
      document.getElementById("sampleRate").dataset.detectedSampleRate = normalizedSampleRate ? String(normalizedSampleRate) : "";

      document.getElementById("probeSummary").textContent =
        summaryParts.length ? `解析結果: ${summaryParts.join(" / ")}` : "解析結果: 解析できませんでした";
    }

    function applyYoutubePreset() {
      document.getElementById("container").value = "mp4";
      document.getElementById("regenPts").checked = true;
      document.getElementById("audioCodec").value = "aac";
      document.getElementById("sampleRate").value = "48000";
      document.getElementById("channels").value = "2";
      document.getElementById("audioBitrate").value = "320k";
      handleCodecChange();
      handleContainerChange();
    }

    function generateReplaceAudioCmd() {
      const videoFile = document.getElementById("videoFile").value.trim();
      const audioFile = document.getElementById("audioFile").value.trim();
      const audioOffsetMs = document.getElementById("audioOffsetMs").value.trim();
      const audioCodec = document.getElementById("audioCodec").value;
      const audioBitrate = document.getElementById("audioBitrate").value;
      const outputInput = document.getElementById("outputFile").value.trim();
      const container = document.getElementById("container").value;
      const sampleRateSelect = document.getElementById("sampleRate");
      const channelsSelect = document.getElementById("channels");
      const regenPts = document.getElementById("regenPts").checked;

      if (!videoFile) {
        alert("動画ファイル名を入力してください。");
        return;
      }
      if (!audioFile) {
        alert("音声ファイル名を入力してください。");
        return;
      }
      if (!/\.(mp4|mkv|mov)$/i.test(videoFile)) {
        alert("動画ファイルは .mp4 / .mkv / .mov を指定してください。");
        return;
      }
      if (!/\.wav$/i.test(audioFile)) {
        alert("音声ファイルは .wav を指定してください。");
        return;
      }

      const output = outputInput || inferOutputName(videoFile, audioFile, container, audioOffsetMs);

      let offsetPart = "";
      if (audioOffsetMs) {
        const offsetValue = Number(audioOffsetMs);
        if (isNaN(offsetValue)) {
          alert("音声タイミング調整は数値で指定してください。");
          return;
        }
        if (offsetValue !== 0) {
          offsetPart = ` -itsoffset ${(offsetValue / 1000).toFixed(3)}`;
        }
      }

      let sampleRatePart = "";
      if (sampleRateSelect.value === "auto") {
        const detectedSampleRate = sampleRateSelect.dataset.detectedSampleRate;
        if (detectedSampleRate) {
          sampleRatePart = ` -ar ${detectedSampleRate}`;
        }
      } else {
        const selected = clampSampleRateForCodec(sampleRateSelect.value, audioCodec);
        if (selected !== sampleRateSelect.value) {
          sampleRateSelect.value = selected;
        }
        sampleRatePart = ` -ar ${selected}`;
      }

      let channelPart = "";
      if (channelsSelect.value === "auto") {
        const detectedChannels = channelsSelect.dataset.detectedChannels;
        if (detectedChannels) {
          channelPart = ` -ac ${detectedChannels}`;
        }
      } else {
        channelPart = ` -ac ${channelsSelect.value}`;
      }

      const bitratePart = audioCodec.startsWith("pcm_") ? "" : ` -b:a ${audioBitrate}`;
      const ptsPart = regenPts ? " -fflags +genpts" : "";
      const cmd = `ffmpeg${ptsPart} -i ${videoFile}${offsetPart} -i ${audioFile} -map 0:v:0 -map 1:a:0 -c:v copy -c:a ${audioCodec}${sampleRatePart}${channelPart}${bitratePart} -shortest ${output}`;
      document.getElementById("replaceCmd").textContent = cmd;
    }

    handleCodecChange();
    handleContainerChange();

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

    function getSelectOptions(selectElement) {
      const mdOptions = selectElement.querySelectorAll("md-select-option");
      if (mdOptions && mdOptions.length > 0) {
        return mdOptions;
      }
      return selectElement.options || [];
    }

    function appendSelectOption(selectElement, value, label) {
      if (selectElement.tagName && selectElement.tagName.toLowerCase() === "md-outlined-select") {
        const option = document.createElement("md-select-option");
        option.value = value;
        option.innerHTML = `<div slot="headline">${label}</div>`;
        selectElement.appendChild(option);
        return;
      }
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      selectElement.appendChild(option);
    }
