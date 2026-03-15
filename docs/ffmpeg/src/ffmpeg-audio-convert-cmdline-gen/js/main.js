    const allowedInputPattern = /\.(wav|flac|aiff|aif|mp3|m4a|opus)$/i;

    function updateVbrOptions() {
      const vbrMode = document.getElementById("vbrMode").value;
      const quality = document.getElementById("vbrQuality");
      const bitrate = document.getElementById("bitrate");
      quality.disabled = vbrMode !== "on";
      bitrate.disabled = vbrMode === "on";
      bitrate.classList.toggle("md-disabled", vbrMode === "on");
    }

    function updateFormatOptions() {
      const format = document.getElementById("outputFormat").value;
      const bitrateBlock = document.getElementById("bitrateBlock");
      const vbrBlock = document.getElementById("vbrBlock");
      const flacBlock = document.getElementById("flacBlock");

      const isLossy = format === "m4a" || format === "mp3" || format === "opus";
      bitrateBlock.classList.toggle("md-hidden", !isLossy);
      vbrBlock.classList.toggle("md-hidden", !isLossy);
      flacBlock.classList.toggle("md-hidden", format !== "flac");
      updateVbrOptions();
    }

    function buildOutputName(input, format, tagParts) {
      const base = input.replace(/\.[^/.]+$/, "");
      const tag = tagParts.filter(Boolean).join("-");
      return `${base}-${tag}.${format}`;
    }

    function generateCommand() {
      const input = document.getElementById("audioFile").value.trim();
      const format = document.getElementById("outputFormat").value;
      const bitrate = document.getElementById("bitrate").value;
      const vbrMode = document.getElementById("vbrMode").value;
      const vbrQuality = document.getElementById("vbrQuality").value;
      const flacLevel = document.getElementById("flacLevel").value;
      const sampleRate = document.getElementById("sampleRate").value;

      if (!input) {
        alert("音声ファイル名を入力してください。");
        return;
      }
      if (!allowedInputPattern.test(input)) {
        alert("入力ファイルは wav/flac/aiff/aif/mp3/m4a/opus のいずれかを指定してください。");
        return;
      }

      const cmdParts = [`ffmpeg -i "${input}"`];
      if (sampleRate !== "keep") {
        cmdParts.push(`-ar ${sampleRate}`);
      }

      const tags = [format];
      if (format === "m4a") {
        cmdParts.push("-c:a aac");
        if (vbrMode === "on") {
          const qMap = { low: "1", mid: "3", high: "5" };
          cmdParts.push(`-q:a ${qMap[vbrQuality]}`);
          tags.push(`vbr-${vbrQuality}`);
        } else if (bitrate === "auto") {
          tags.push("auto");
        } else {
          cmdParts.push(`-b:a ${bitrate}`);
          tags.push(bitrate);
        }
      } else if (format === "mp3") {
        cmdParts.push("-c:a libmp3lame");
        if (vbrMode === "on") {
          const qMap = { low: "6", mid: "4", high: "2" };
          cmdParts.push(`-q:a ${qMap[vbrQuality]}`);
          tags.push(`vbr-${vbrQuality}`);
        } else if (bitrate === "auto") {
          tags.push("auto");
        } else {
          cmdParts.push(`-b:a ${bitrate}`);
          tags.push(bitrate);
        }
      } else if (format === "opus") {
        cmdParts.push("-c:a libopus");
        if (vbrMode === "on") {
          const qMap = { low: "96k", mid: "128k", high: "192k" };
          const opusBitrate = qMap[vbrQuality];
          cmdParts.push(`-vbr on -b:a ${opusBitrate}`);
          tags.push(`vbr-${vbrQuality}`);
        } else if (bitrate === "auto") {
          cmdParts.push("-vbr off");
          tags.push("auto");
        } else {
          cmdParts.push(`-vbr off -b:a ${bitrate}`);
          tags.push(bitrate);
        }
      } else if (format === "flac") {
        cmdParts.push(`-c:a flac -compression_level ${flacLevel}`);
        tags.push(`lv${flacLevel}`);
      } else if (format === "wav") {
        cmdParts.push("-c:a pcm_s16le");
      }

      if (sampleRate === "44100") {
        tags.push("sr44k");
      } else if (sampleRate === "48000") {
        tags.push("sr48k");
      }

      const output = buildOutputName(input, format, tags);
      cmdParts.push(`"${output}"`);
      document.getElementById("audioCmd").textContent = cmdParts.join(" ");
    }

    function applyPreset(preset) {
      const outputFormat = document.getElementById("outputFormat");
      const vbrMode = document.getElementById("vbrMode");
      const vbrQuality = document.getElementById("vbrQuality");
      const bitrate = document.getElementById("bitrate");
      const sampleRate = document.getElementById("sampleRate");
      const flacLevel = document.getElementById("flacLevel");

      if (preset === "hq-lossy") {
        outputFormat.value = "m4a";
        vbrMode.value = "on";
        vbrQuality.value = "high";
        bitrate.value = "256k";
        sampleRate.value = "keep";
      } else if (preset === "share") {
        outputFormat.value = "mp3";
        vbrMode.value = "on";
        vbrQuality.value = "mid";
        sampleRate.value = "44100";
      } else if (preset === "mobile") {
        outputFormat.value = "m4a";
        vbrMode.value = "on";
        vbrQuality.value = "low";
        sampleRate.value = "44100";
      } else if (preset === "archive") {
        outputFormat.value = "flac";
        flacLevel.value = "5";
        vbrMode.value = "off";
        bitrate.value = "auto";
        sampleRate.value = "keep";
      } else if (preset === "original") {
        outputFormat.value = "m4a";
        vbrMode.value = "off";
        bitrate.value = "192k";
        sampleRate.value = "keep";
      }

      updateFormatOptions();
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
    updateFormatOptions();
