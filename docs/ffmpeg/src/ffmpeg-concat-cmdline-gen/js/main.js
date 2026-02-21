    function generateConcatCmd() {
      const input = document.getElementById("fileList").value.trim();
      if (!input) return alert("ファイル名を1行ずつ入力してください。");

      const lines = input.split(/\r?\n/).map(l => l.trim()).filter(l => l);
      if (lines.length === 0) return alert("有効なファイル名がありません。");

      const baseFile = lines[0].replace(/\.wav$/i, "");
      const outputFile = baseFile + "-concat.wav";

      let cmd = "";

      lines.forEach((line, index) => {
        const redirect = index === 0 ? ">" : ">>";
        cmd += `echo file '${line}' ${redirect} filelist.txt\r\n`;
      });

      cmd += `ffmpeg -f concat -safe 0 -i filelist.txt -c copy ${outputFile}`;

      document.getElementById("concatCmd").textContent = cmd;
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
