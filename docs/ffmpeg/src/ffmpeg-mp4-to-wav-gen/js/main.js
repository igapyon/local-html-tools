    function generateProbeCommand() {
      const input = document.getElementById("mp4File").value.trim();
      if (!input) {
        alert("MP4ファイル名を入力してください。");
        return;
      }
      const cmd = `ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate,channels,channel_layout -of json ${input}`;
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

    function applyProbeResult() {
      const raw = document.getElementById("probeOutput").value.trim();
      if (!raw) {
        alert("ffprobe 出力を貼り付けてください。");
        return;
      }

      const { sampleRate, channels, channelLayout } = parseProbeOutput(raw);
      const summaryParts = [];

      if (sampleRate) {
        const sampleSelect = document.getElementById("sampleRate");
        let hasOption = false;
        Array.from(getSelectOptions(sampleSelect)).forEach(option => {
          if (option.value === sampleRate) hasOption = true;
        });
        if (!hasOption) {
          appendSelectOption(sampleSelect, sampleRate, `${sampleRate} Hz（ソース）`);
        }
        sampleSelect.value = sampleRate;
        summaryParts.push(`サンプルレート: ${sampleRate} Hz`);
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
      document.getElementById("sampleRate").dataset.detectedSampleRate = sampleRate ? String(sampleRate) : "";

      document.getElementById("probeSummary").textContent =
        summaryParts.length ? `解析結果: ${summaryParts.join(" / ")}` : "解析結果: 解析できませんでした";
    }

    function generateWavCommand() {
      const input = document.getElementById("mp4File").value.trim();
      const sampleRateSelect = document.getElementById("sampleRate");
      const sampleRate = sampleRateSelect.value;
      const bitDepth = document.getElementById("bitDepth").value;
      const channelsSelect = document.getElementById("channels");
      const channelsValue = channelsSelect.value;
      const detectedChannels = channelsSelect.dataset.detectedChannels;

      if (!input) {
        alert("MP4ファイル名を入力してください。");
        return;
      }
      if (!input.toLowerCase().endsWith(".mp4")) {
        alert("ファイル名は .mp4 で終わる必要があります。");
        return;
      }

      const output = input.replace(/\.mp4$/i, `-audio-${sampleRate}.wav`);
      let channelPart = "";
      if (channelsValue === "auto") {
        if (detectedChannels) {
          channelPart = ` -ac ${detectedChannels}`;
        }
      } else {
        channelPart = ` -ac ${channelsValue}`;
      }
      const cmd = `ffmpeg -i ${input} -vn${channelPart} -acodec ${bitDepth} -ar ${sampleRate} ${output}`;
      document.getElementById("wavCmd").textContent = cmd;
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
