    function parseTime(input) {
      const parts = input.split(":").map(Number);
      if (parts.some(isNaN)) return NaN;
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 1) return parseFloat(parts[0]);
      return NaN;
    }

    function generateClipCommand() {
      const fileInput = document.getElementById("filename").value.trim();
      const startInput = document.getElementById("start").value.trim();
      const endInput = document.getElementById("end").value.trim();
      const partNumber = document.getElementById("partNumber").value.trim() || "1";
      const commandNode = document.getElementById("clipCmd");
      if (!commandNode) return;
      if (!fileInput) {
        commandNode.textContent = "";
        return;
      }

      const startSec = startInput ? parseTime(startInput) : NaN;
      const endSec = endInput ? parseTime(endInput) : NaN;

      const startValid = !isNaN(startSec);
      const endValid = !isNaN(endSec);

      let ssPart = "";
      let tPart = "";

      if (startValid && endValid && endSec > startSec) {
        ssPart = ` -ss ${Math.round(startSec)}`;
        tPart  = ` -t ${Math.round(endSec - startSec)}`;
      } else if (startValid) {
        ssPart = ` -ss ${Math.round(startSec)}`;
      } else if (endValid) {
        tPart  = ` -t ${Math.round(endSec)}`;
      }

      const extMatch = fileInput.match(/\.([^.]+)$/);
      const extension = extMatch ? extMatch[1] : "wav";
      const baseName = fileInput.replace(/\.[^/.]+$/i, "");
      const outFile = `${baseName}-part${partNumber}.${extension}`;
      const cmd = `ffmpeg${ssPart} -i ${fileInput}${tPart} -c copy ${outFile}`;

      commandNode.textContent = cmd;
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
      ["filename", "start", "end", "partNumber"].forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        input.addEventListener("input", generateClipCommand);
        input.addEventListener("change", generateClipCommand);
      });
      generateClipCommand();
    });
