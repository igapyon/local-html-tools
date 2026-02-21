    function generateYoutubeCmd() {
      const audioFile = document.getElementById("audioFile").value.trim();
      const imageFile = document.getElementById("imageFile").value.trim();

      if (!audioFile || !imageFile) {
        alert("音声ファイルと画像ファイルを入力してください。");
        return;
      }

      if (!audioFile.toLowerCase().endsWith(".wav")) {
        alert("音声ファイルは .wav を指定してください。");
        return;
      }

      if (!(/\.(png|jpg|jpeg)$/i.test(imageFile))) {
        alert("画像ファイルは .png, .jpg, .jpeg のいずれかを指定してください。");
        return;
      }

      const outputFile = audioFile.replace(/\.wav$/i, ".mkv");

      const cmd = `ffmpeg -loop 1 -framerate 2 -i ${imageFile} -i ${audioFile} ` +
                  `-c:v libx264 -preset medium -tune stillimage -crf 18 ` +
                  `-c:a copy -shortest -pix_fmt yuv420p ${outputFile}`;

      document.getElementById("youtubeCmd").textContent = cmd;
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
