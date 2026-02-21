    function generateSilenceCmd() {
      const audioFile = document.getElementById("audioFile").value.trim();
      const noiseDb = document.getElementById("noiseDb").value.trim();
      const minDuration = document.getElementById("minDuration").value.trim();

      if (!audioFile) {
        alert("音声ファイル名を入力してください。");
        return;
      }
      if (noiseDb === "" || isNaN(Number(noiseDb))) {
        alert("しきい値(dB)は数値で入力してください。");
        return;
      }
      if (minDuration === "" || isNaN(Number(minDuration))) {
        alert("最小時間(秒)は数値で入力してください。");
        return;
      }

      const base = audioFile.replace(/\.[^/.]+$/i, "");
      const logFile = `${base}-silence.log`;
      const cmd = `ffmpeg -i ${audioFile} -af silencedetect=noise=${noiseDb}dB:d=${minDuration} -f null - 2>&1 | tee ${logFile}`;
      document.getElementById("silenceCmd").textContent = cmd;
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
