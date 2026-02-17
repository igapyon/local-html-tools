    const KT_DATA = window.KT_DATA || {};
    const composers = Array.isArray(KT_DATA.composers) ? KT_DATA.composers : [];
    const extraWorks = KT_DATA.extraWorks && typeof KT_DATA.extraWorks === "object" ? KT_DATA.extraWorks : {};

    composers.forEach((composer) => {
      composer.works = (composer.works || []).map((work) => ({ ...work, featured: work.featured !== false }));
      const extras = extraWorks[composer.name];
      if (Array.isArray(extras) && extras.length > 0) {
        composer.works = [
          ...composer.works,
          ...extras.map((work) => ({ ...work, featured: false }))
        ];
      }
    });

    composers.sort((a, b) => {
      const aYears = Array.isArray(a.works) ? a.works.map((w) => w.year).filter((v) => Number.isFinite(v)) : [];
      const bYears = Array.isArray(b.works) ? b.works.map((w) => w.year).filter((v) => Number.isFinite(v)) : [];
      const aStart = a.active && Number.isFinite(a.active.start) ? a.active.start : (aYears.length > 0 ? Math.min(...aYears) : a.birth);
      const bStart = b.active && Number.isFinite(b.active.start) ? b.active.start : (bYears.length > 0 ? Math.min(...bYears) : b.birth);
      return aStart - bStart || a.birth - b.birth;
    });

    const cfg = {
      width: 1700,
      height: 1500,
      left: 20,
      right: 70,
      top: 70,
      bottom: 130,
      minYear: 1500,
      maxYear: 1980,
      rowStep: 38,
      bandHeight: 20
    };

    const historicalEvents = Array.isArray(KT_DATA.historicalEvents) ? KT_DATA.historicalEvents : [];
    const danceEvents = Array.isArray(KT_DATA.danceEvents) ? KT_DATA.danceEvents : [];
    const instrumentEvents = Array.isArray(KT_DATA.instrumentEvents) ? KT_DATA.instrumentEvents : [];

    const svg = document.getElementById("chart");
    const scrollPane = document.getElementById("scrollPane");
    const errorBox = document.getElementById("errorBox");
    const scaleFullButton = document.getElementById("scaleFull");
    const scale100Button = document.getElementById("scale100");
    const clearFocusButton = document.getElementById("clearFocus");
    const menuPanel = document.getElementById("menuPanel");
    const composerDialog = document.getElementById("composerDialog");
    const dialogName = document.getElementById("dialogName");
    const dialogMeta = document.getElementById("dialogMeta");
    const dialogFeatured = document.getElementById("dialogFeatured");
    const dialogOther = document.getElementById("dialogOther");
    const closeDialogButton = document.getElementById("closeDialog");
    const dialogYoutube = document.getElementById("dialogYoutube");

    const NS = "http://www.w3.org/2000/svg";
    const LIVING_DEATH_YEAR = 9999;
    let scaleMode = "full";
    let chartHeight = cfg.height;
    let focusedComposerName = null;

    function xForYear(year) {
      const plotWidth = cfg.width - cfg.left - cfg.right;
      return cfg.left + ((year - cfg.minYear) / (cfg.maxYear - cfg.minYear)) * plotWidth;
    }

    function add(tag, attrs, parent) {
      const el = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
      parent.appendChild(el);
      return el;
    }

    function isLivingComposer(composer) {
      return Boolean(composer) && composer.death === LIVING_DEATH_YEAR;
    }

    function getLifespanEndYear(composer) {
      if (!composer) return cfg.maxYear;
      if (isLivingComposer(composer)) {
        return Math.min(new Date().getFullYear(), cfg.maxYear);
      }
      return composer.death;
    }

    function getDeathLabel(composer) {
      return isLivingComposer(composer) ? "Living" : String(composer.death);
    }

    function getActiveRange(composer) {
      const workYears = Array.isArray(composer.works)
        ? composer.works.map((w) => w.year).filter((v) => Number.isFinite(v))
        : [];
      const start = composer.active && Number.isFinite(composer.active.start)
        ? composer.active.start
        : (workYears.length > 0 ? Math.min(...workYears) : composer.birth);
      const end = composer.active && Number.isFinite(composer.active.end)
        ? composer.active.end
        : (workYears.length > 0 ? Math.max(...workYears) : getLifespanEndYear(composer));
      return { start, end };
    }

    function computeRequiredHeight() {
      const composerRows = composers.length;
      const instrumentRows = instrumentEvents.length;
      const danceRows = danceEvents.length;
      const historyRows = historicalEvents.length;

      const firstRowY = cfg.top;
      const lastComposerY = firstRowY + (composerRows - 1) * cfg.rowStep;
      const axisYBottom = lastComposerY + 56;
      const instrumentStartY = axisYBottom + 48 + 24;
      const instrumentEndY = instrumentStartY + (instrumentRows - 1) * 22 + 10;
      const danceStartY = instrumentEndY + 18 + 24;
      const danceEndY = danceStartY + (danceRows - 1) * 22 + 10;
      const historyStartY = danceEndY + 18 + 24;
      const historyEndY = historyStartY + (historyRows - 1) * 22 + 10;

      return Math.max(900, historyEndY + 40);
    }

    function layoutEventsWithoutOverlap(events) {
      const laneEnds = [];
      const sorted = [...events].sort((a, b) => a.start - b.start || a.end - b.end);
      return sorted.map((ev) => {
        let lane = laneEnds.findIndex((laneEnd) => ev.start > laneEnd);
        if (lane === -1) {
          lane = laneEnds.length;
          laneEnds.push(ev.end);
        } else {
          laneEnds[lane] = ev.end;
        }
        return { ...ev, lane };
      });
    }

    function normalizeWorkCategory(kind, title) {
      const t = String(title || "").toLowerCase();
      if (kind === "symphony") return "symphony";
      if (kind === "choral" || kind === "song" || kind === "opera") return "vocal";
      if (kind === "strings" && t.includes("quartet")) return "quartet";
      if (kind === "chamber" || kind === "strings" || kind === "piano" || kind === "violin" || kind === "keyboard") return "chamber";
      return "other";
    }

    function addWorkIcon(parent, x, y, kind, title) {
      const category = normalizeWorkCategory(kind, title);
      const palette = {
        symphony: "#2563eb",
        chamber: "#16a34a",
        vocal: "#9333ea",
        quartet: "#d97706",
        other: "#0891b2"
      };
      const color = palette[category] || palette.other;
      const g = add("g", { class: "work-icon", transform: `translate(${x} ${y})`, "data-kind": kind, "data-category": category }, parent);

      if (category === "symphony") {
        add("circle", { cx: 0, cy: 0, r: 5, fill: color }, g);
      } else if (category === "chamber") {
        add("rect", { x: -5, y: -5, width: 10, height: 10, rx: 2, fill: color }, g);
      } else if (category === "vocal") {
        add("polygon", { points: "0,-7 7,6 -7,6", fill: color }, g);
      } else if (category === "quartet") {
        add("path", { d: "M0,-7 L2,-2 L7,0 L2,2 L0,7 L-2,2 L-7,0 L-2,-2 Z", fill: color }, g);
      } else {
        add("polygon", { points: "0,-7 7,0 0,7 -7,0", fill: color }, g);
      }

      add("circle", { cx: 0, cy: 0, r: 8, fill: "transparent" }, g);
      return g;
    }

    function draw() {
      svg.innerHTML = "";
      const axisYTop = cfg.top - 30;
      const firstRowY = cfg.top;
      const lastRowY = cfg.top + (composers.length - 1) * cfg.rowStep;
      const axisYBottom = lastRowY + 56;
      const plotTop = firstRowY - 18;
      const plotBottom = lastRowY + 18;

      add("rect", { x: 0, y: 0, width: cfg.width, height: cfg.height, fill: "#fff" }, svg);

      // Axis lines
      add("line", { x1: cfg.left, y1: plotTop, x2: cfg.left, y2: plotBottom, stroke: "#333", "stroke-width": 1.5 }, svg);
      add("line", { x1: cfg.left, y1: axisYBottom, x2: cfg.width - cfg.right, y2: axisYBottom, stroke: "#333", "stroke-width": 1.5 }, svg);
      add("line", { x1: cfg.left, y1: axisYTop, x2: cfg.width - cfg.right, y2: axisYTop, stroke: "#333", "stroke-width": 1.5 }, svg);

      // Grid + year labels (top and bottom)
      for (let year = cfg.minYear; year <= cfg.maxYear; year += 25) {
        const x = xForYear(year);
        const isMajor = year % 100 === 0;
        add("line", {
          x1: x,
          y1: plotTop,
          x2: x,
          y2: plotBottom,
          stroke: isMajor ? "#d0d7e2" : "#edf1f6",
          "stroke-width": isMajor ? 1.2 : 0.8
        }, svg);

        if (isMajor) {
          add("text", {
            x,
            y: axisYTop + 18,
            "text-anchor": "middle",
            "font-size": 12,
            fill: "#333"
          }, svg).textContent = String(year);

          add("text", {
            x,
            y: axisYBottom + 20,
            "text-anchor": "middle",
            "font-size": 12,
            fill: "#333"
          }, svg).textContent = String(year);
        }
      }

      add("text", { x: cfg.left, y: 26, "font-size": 15, fill: "#111", "font-weight": 600 }, svg)
        .textContent = "Classical Composers Timeline (Birth-Death)";

      composers.forEach((c, i) => {
        const y = cfg.top + i * cfg.rowStep;
        const x1 = xForYear(c.birth);
        const x2 = xForYear(getLifespanEndYear(c));
        const isFocused = focusedComposerName === c.name;

        const row = add("g", { class: "composer-row", "data-name": c.name, "data-birth": c.birth, "data-death": c.death }, svg);
        row.setAttribute("opacity", "1");

        const band = add("rect", {
          x: x1,
          y: y - cfg.bandHeight / 2,
          width: Math.max(2, x2 - x1),
          height: cfg.bandHeight,
          rx: 5,
          class: "lifespan-band",
          fill: isFocused ? "#60a5fa" : "#9ec5fe",
          opacity: isFocused ? 0.8 : 0.6,
          cursor: "pointer"
        }, row);

        const { start: activeStart, end: activeEnd } = getActiveRange(c);
        const activeX1 = xForYear(activeStart);
        const activeX2 = xForYear(activeEnd);
        add("rect", {
          x: activeX1,
          y: y - 6,
          width: Math.max(2, activeX2 - activeX1),
          height: 12,
          rx: 4,
          class: "active-band clickable",
          fill: "#60a5fa",
          opacity: isFocused ? 0.48 : 0.28,
          cursor: "pointer"
        }, row);
        row.setAttribute("data-active-start", String(activeStart));
        row.setAttribute("data-active-end", String(activeEnd));

        const rightLimit = cfg.width - cfg.right - 6;
        const estimatedNameWidth = c.name.length * 7;
        let nameX = x2 + 12;
        let nameAnchor = "start";
        if (nameX + estimatedNameWidth > rightLimit) {
          nameX = x1 - 10;
          nameAnchor = "end";
        }
        const nameText = add("text", {
          x: nameX,
          y,
          "text-anchor": nameAnchor,
          "dominant-baseline": "middle",
          "font-size": 12,
          fill: "#374151",
          "font-weight": isFocused ? 700 : 500,
          class: "composer-name clickable",
          "data-name": c.name,
          cursor: "pointer"
        }, svg);
        nameText.textContent = c.name;

        if (Array.isArray(c.works)) {
          c.works.forEach((w) => {
            const wx = xForYear(w.year);
            const icon = addWorkIcon(row, wx, y, w.kind, w.title);
            icon.setAttribute("data-composer", c.name);
            icon.setAttribute("data-title", w.title);
            icon.setAttribute("data-number", w.number);
            icon.setAttribute("data-year", String(w.year));
            icon.setAttribute("opacity", "1");
          });
        }
      });

      // Instrument context lanes
      const instrumentTitleY = axisYBottom + 48;
      add("text", {
        x: cfg.left,
        y: instrumentTitleY,
        "font-size": 13,
        "font-weight": 600,
        fill: "#374151"
      }, svg).textContent = "楽器関連";

      const instrumentY = instrumentTitleY + 24;
      const instrumentColors = {
        luthier: "#a5b4fc",
        violin: "#818cf8",
        bow: "#c4b5fd",
        piano: "#93c5fd",
        guitar: "#fdba74",
        strings: "#fcd34d",
        brass: "#f9a8d4",
        woodwind: "#67e8f9",
        other: "#cbd5e1"
      };

      let maxInstrumentLane = 0;
      instrumentEvents.forEach((ev, idx) => {
        const x1 = xForYear(ev.start);
        const x2 = xForYear(ev.end);
        const lane = idx;
        maxInstrumentLane = Math.max(maxInstrumentLane, lane);
        const y = instrumentY + lane * 22;
        const color = instrumentColors[ev.category] || instrumentColors.other;

        const eventRect = add("rect", {
          x: x1,
          y: y - 8,
          width: Math.max(3, x2 - x1),
          height: 16,
          rx: 4,
          class: "instrument-event",
          fill: color,
          opacity: 0.85
        }, svg);
        eventRect.setAttribute("data-name", ev.name);
        eventRect.setAttribute("data-start", String(ev.start));
        eventRect.setAttribute("data-end", String(ev.end));

        add("text", {
          x: x1 + 4,
          y: y + 4,
          "font-size": 11,
          fill: "#1f2937"
        }, svg).textContent = ev.name;
      });

      // Historical context lanes
      const danceTitleY = instrumentY + (maxInstrumentLane + 1) * 22 + 18;
      add("text", {
        x: cfg.left,
        y: danceTitleY,
        "font-size": 13,
        "font-weight": 600,
        fill: "#374151"
      }, svg).textContent = "舞曲史";

      const danceY = danceTitleY + 24;
      const danceColors = {
        court: "#fbcfe8",
        ballroom: "#fdba74",
        national: "#86efac",
        other: "#cbd5e1"
      };

      let maxDanceLane = 0;
      danceEvents.forEach((ev, idx) => {
        const x1 = xForYear(ev.start);
        const x2 = xForYear(ev.end);
        const lane = idx;
        maxDanceLane = Math.max(maxDanceLane, lane);
        const y = danceY + lane * 22;
        const color = danceColors[ev.category] || danceColors.other;

        const eventRect = add("rect", {
          x: x1,
          y: y - 8,
          width: Math.max(3, x2 - x1),
          height: 16,
          rx: 4,
          class: "dance-event",
          fill: color,
          opacity: 0.85
        }, svg);
        eventRect.setAttribute("data-name", ev.name);
        eventRect.setAttribute("data-start", String(ev.start));
        eventRect.setAttribute("data-end", String(ev.end));

        add("text", {
          x: x1 + 4,
          y: y + 4,
          "font-size": 11,
          fill: "#1f2937"
        }, svg).textContent = ev.name;
      });

      // Historical context lanes
      const historyTitleY = danceY + (maxDanceLane + 1) * 22 + 18;
      add("text", {
        x: cfg.left,
        y: historyTitleY,
        "font-size": 13,
        "font-weight": 600,
        fill: "#374151"
      }, svg).textContent = "社会情勢";

      const historyY = historyTitleY + 24;
      const historyColors = {
        war: "#fca5a5",
        revolution: "#f59e0b",
        culture: "#86efac",
        religion: "#c4b5fd",
        disaster: "#fb7185",
        other: "#cbd5e1"
      };

      historicalEvents.forEach((ev, idx) => {
        const x1 = xForYear(ev.start);
        const x2 = xForYear(ev.end);
        const lane = idx;
        const y = historyY + lane * 22;
        const color = historyColors[ev.category] || historyColors.other;

        const eventRect = add("rect", {
          x: x1,
          y: y - 8,
          width: Math.max(3, x2 - x1),
          height: 16,
          rx: 4,
          class: "history-event",
          fill: color,
          opacity: 0.8
        }, svg);
        eventRect.setAttribute("data-name", ev.name);
        eventRect.setAttribute("data-start", String(ev.start));
        eventRect.setAttribute("data-end", String(ev.end));

        add("text", {
          x: x1 + 4,
          y: y + 4,
          "font-size": 11,
          fill: "#1f2937"
        }, svg).textContent = ev.name;
      });

      const clickTargets = Array.from(svg.querySelectorAll(".lifespan-band, .active-band, .composer-name"));
      clickTargets.forEach((node) => {
        node.addEventListener("click", () => {
          const composerName = node.getAttribute("data-name") || node.parentElement.getAttribute("data-name");
          focusComposer(composerName);
        });
      });
    }

    function scrollToComposer(name) {
      const composer = composers.find((c) => c.name === name);
      if (!composer) return;
      const { start, end } = getActiveRange(composer);
      const targetYear = Math.round((start + end) / 2);
      scrollPane.scrollLeft = Math.max(0, xForYear(targetYear) - scrollPane.clientWidth * 0.45);
    }

    function updateFocusButtonState() {
      if (!clearFocusButton) return;
      clearFocusButton.disabled = !focusedComposerName;
      clearFocusButton.classList.toggle("active", Boolean(focusedComposerName));
    }

    function renderWorkItems(target, works, composerName, withYoutubeLink) {
      if (!target) return;
      target.innerHTML = "";
      if (!Array.isArray(works) || works.length === 0) {
        const li = document.createElement("li");
        li.textContent = "(No entries)";
        target.appendChild(li);
        return;
      }

      works
        .slice()
        .sort((a, b) => (a.year || 0) - (b.year || 0))
        .forEach((work) => {
          const li = document.createElement("li");
          const label = document.createElement("span");
          label.textContent = `${work.year}年: ${work.title}${work.number ? ` (${work.number})` : ""}`;
          li.appendChild(label);
          if (withYoutubeLink && composerName) {
            const a = document.createElement("a");
            const q = encodeURIComponent(`${composerName} ${work.title}`);
            a.href = `https://www.youtube.com/results?search_query=${q}`;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.className = "work-yt-link";
            a.textContent = "YouTube";
            li.appendChild(a);
          }
          target.appendChild(li);
        });
    }

    function showComposerDialog(name) {
      const composer = composers.find((c) => c.name === name);
      if (!composer || !composerDialog) return;
      const { start, end } = getActiveRange(composer);
      const featuredWorks = (composer.works || []).filter((w) => w.featured !== false);
      const otherWorks = (composer.works || []).filter((w) => w.featured === false);

      if (dialogName) dialogName.textContent = composer.name;
      if (dialogMeta) {
        dialogMeta.textContent = `${composer.birth} - ${getDeathLabel(composer)} (Active ${start} - ${end})`;
      }
      if (dialogYoutube) {
        const q = encodeURIComponent(composer.name);
        dialogYoutube.href = `https://www.youtube.com/results?search_query=${q}`;
      }
      renderWorkItems(dialogFeatured, featuredWorks, composer.name, true);
      renderWorkItems(dialogOther, otherWorks, composer.name, true);
      composerDialog.classList.add("visible");
    }

    function hideComposerDialog() {
      if (!composerDialog) return;
      composerDialog.classList.remove("visible");
    }

    function isDialogVisible() {
      return Boolean(composerDialog && composerDialog.classList.contains("visible"));
    }

    function focusComposer(name) {
      if (!name) return;
      focusedComposerName = name;
      updateFocusButtonState();
      if (scaleMode !== "focus100") {
        setScaleMode("focus100");
      } else {
        draw();
      }
      scrollToComposer(name);
      showComposerDialog(name);
    }

    function clearComposerFocus() {
      focusedComposerName = null;
      updateFocusButtonState();
      draw();
      hideComposerDialog();
    }

    function setScaleMode(mode) {
      scaleMode = mode;
      const yearSpan = cfg.maxYear - cfg.minYear;
      const focusYears = 100;
      const basePlotWidth = 1450;
      const focusCompression = 0.5;
      const pxPerYear = mode === "focus100"
        ? (basePlotWidth / focusYears) * focusCompression
        : basePlotWidth / yearSpan;
      cfg.width = Math.round(cfg.left + cfg.right + yearSpan * pxPerYear);
      chartHeight = computeRequiredHeight();
      cfg.height = chartHeight;

      svg.setAttribute("width", String(cfg.width));
      svg.setAttribute("height", String(chartHeight));
      svg.setAttribute("viewBox", `0 0 ${cfg.width} ${chartHeight}`);

      if (scaleFullButton) {
        scaleFullButton.classList.toggle("active", mode === "full");
      }
      if (scale100Button) {
        scale100Button.classList.toggle("active", mode === "focus100");
      }

      draw();

      if (mode === "full") {
        scrollPane.scrollLeft = 0;
      } else {
        const targetYear = focusedComposerName
          ? Math.round((() => {
            const composer = composers.find((c) => c.name === focusedComposerName);
            if (!composer) return 1800;
            const { start, end } = getActiveRange(composer);
            return (start + end) / 2;
          })())
          : 1800;
        scrollPane.scrollLeft = Math.max(0, xForYear(targetYear) - scrollPane.clientWidth * 0.45);
      }
    }

    if (scaleFullButton) {
      scaleFullButton.addEventListener("click", () => setScaleMode("full"));
    }
    if (scale100Button) {
      scale100Button.addEventListener("click", () => setScaleMode("focus100"));
    }
    if (clearFocusButton) {
      clearFocusButton.addEventListener("click", () => clearComposerFocus());
    }
    if (closeDialogButton) {
      closeDialogButton.addEventListener("click", () => clearComposerFocus());
    }
    document.addEventListener("keydown", (event) => {
      if (!isDialogVisible()) return;
      if (event.key === "Escape") {
        clearComposerFocus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!isDialogVisible()) return;
      const target = event && event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("#composerDialog")) return;
      if (target.closest(".lifespan-band, .active-band, .composer-name")) return;
      clearComposerFocus();
    });
    document.addEventListener("click", (event) => {
      if (!menuPanel) return;
      const target = event && event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".md-menu-button")) return;
      if (target.closest(".md-menu-panel")) return;
      menuPanel.classList.add("md-hidden");
    });

    try {
      updateFocusButtonState();
      setScaleMode("full");
    } catch (err) {
      if (errorBox) {
        errorBox.style.display = "block";
        errorBox.textContent = `描画エラー: ${err && err.message ? err.message : err}`;
      }
    }

    window.toggleMenu = function toggleMenu(event) {
      if (!menuPanel) return;
      if (event && typeof event.stopPropagation === "function") {
        event.stopPropagation();
      }
      menuPanel.classList.toggle("md-hidden");
    };
