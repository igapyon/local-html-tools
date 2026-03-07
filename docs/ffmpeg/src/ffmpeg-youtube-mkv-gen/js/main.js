    function getSelectedVideoMode() {
      return document.querySelector('input[name="videoMode"]:checked')?.value || "youtube";
    }

    function updateVideoModeUi() {
      const mode = getSelectedVideoMode();
      const lead = document.getElementById("modeLead");

      if (!lead) return;

      if (mode === "general") {
        lead.textContent = "一般動画向けプリセットを選択中です。静止画 + 音声から動画を作る ffmpeg コマンドを生成します。";
        return;
      }

      lead.textContent = "YouTube向けプリセットを選択中です。静止画 + 音声から動画を作る ffmpeg コマンドを生成します。";
    }

    function updateYoutubeCmd() {
      const audioFile = document.getElementById("audioFile").value.trim();
      const imageFile = document.getElementById("imageFile").value.trim();
      const mode = getSelectedVideoMode();
      const commandBlock = document.getElementById("youtubeCmd");

      if (!commandBlock) return;
      if (!audioFile || !imageFile || !audioFile.toLowerCase().endsWith(".wav") || !(/\.(png|jpg|jpeg)$/i.test(imageFile))) {
        commandBlock.textContent = "";
        return;
      }

      const outputExt = mode === "general" ? ".mp4" : ".mkv";
      const outputFile = audioFile.replace(/\.wav$/i, outputExt);
      const cmd = `ffmpeg -loop 1 -framerate 2 -i ${imageFile} -i ${audioFile} ` +
                  `-c:v libx264 -preset medium -tune stillimage -crf 18 ` +
                  `-c:a copy -shortest -pix_fmt yuv420p ${outputFile}`;
      const prefix = mode === "general" ? "# 一般動画向けプリセット\n" : "# YouTube向けプリセット\n";

      commandBlock.textContent = `${prefix}${cmd}`;
    }

    function watchYoutubeCmdInputs() {
      let lastSignature = "";
      const sync = () => {
        const audioFile = document.getElementById("audioFile")?.value?.trim() || "";
        const imageFile = document.getElementById("imageFile")?.value?.trim() || "";
        const mode = getSelectedVideoMode();
        const signature = `${mode}\n${audioFile}\n${imageFile}`;
        if (signature === lastSignature) return;
        lastSignature = signature;
        updateYoutubeCmd();
      };

      document.querySelectorAll('input[name="videoMode"]').forEach((input) => {
        input.addEventListener("change", () => {
          updateVideoModeUi();
          sync();
        });
      });

      const audioField = document.getElementById("audioFile");
      const imageField = document.getElementById("imageFile");
      [audioField, imageField].forEach((field) => {
        if (!field) return;
        ["input", "change", "blur", "keyup"].forEach((eventName) => {
          field.addEventListener(eventName, sync);
        });
      });

      sync();
      window.setInterval(sync, 250);
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

    document.addEventListener("DOMContentLoaded", () => {
      updateVideoModeUi();
      watchYoutubeCmdInputs();
    });
