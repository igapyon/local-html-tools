const MusicSynthCommon = (() => {
  function normalizeWaveform(value) {
    if (value === "square" || value === "triangle") {
      return value;
    }
    return "sine";
  }

  function midiNumberToFrequency(midiNumber) {
    return 440 * Math.pow(2, (Number(midiNumber) - 69) / 12);
  }

  function createBasicWaveSynthEngine(options = {}) {
    const ticksPerQuarter = Number.isFinite(options.ticksPerQuarter)
      ? Math.max(1, Math.round(options.ticksPerQuarter))
      : 128;

    let audioContext = null;
    let activeSynthNodes = [];
    let synthStopTimer = null;

    async function playSchedule(schedule, waveform, onEnded) {
      if (!schedule || !Array.isArray(schedule.events) || schedule.events.length === 0) {
        throw new Error("先に変換してください。");
      }

      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) {
        throw new Error("このブラウザはWebAudioに対応していません。");
      }

      if (!audioContext) {
        audioContext = new AudioContextCtor();
      }

      stop();
      await audioContext.resume();

      const normalizedWaveform = normalizeWaveform(waveform);
      const secPerTick = 60 / (Math.max(1, Number(schedule.tempo) || 120) * ticksPerQuarter);
      const baseTime = audioContext.currentTime + 0.04;
      let latestEndTime = baseTime;

      for (const event of schedule.events) {
        const startAt = baseTime + (event.start * secPerTick);
        const bodyDuration = Math.max(0.04, event.ticks * secPerTick);
        latestEndTime = Math.max(
          latestEndTime,
          scheduleBasicWaveNote(event, startAt, bodyDuration, normalizedWaveform)
        );
      }

      if (synthStopTimer) {
        clearTimeout(synthStopTimer);
      }
      const waitMs = Math.max(0, Math.ceil((latestEndTime - audioContext.currentTime) * 1000));
      synthStopTimer = setTimeout(() => {
        activeSynthNodes = [];
        if (typeof onEnded === "function") {
          onEnded();
        }
      }, waitMs);
    }

    function stop() {
      if (synthStopTimer) {
        clearTimeout(synthStopTimer);
        synthStopTimer = null;
      }
      for (const node of activeSynthNodes) {
        try {
          node.oscillator.stop();
        } catch (_error) {
          // ignore already-stopped nodes
        }
        try {
          node.oscillator.disconnect();
          node.gainNode.disconnect();
        } catch (_error) {
          // ignore disconnect error
        }
      }
      activeSynthNodes = [];
    }

    function scheduleBasicWaveNote(event, startAt, bodyDuration, waveform) {
      const attack = 0.005;
      const release = 0.03;
      const endAt = startAt + bodyDuration;
      const oscillator = audioContext.createOscillator();
      oscillator.type = waveform;
      oscillator.frequency.setValueAtTime(midiNumberToFrequency(event.midiNumber), startAt);

      const gainNode = audioContext.createGain();
      const gainLevel = event.channel === 10 ? 0.06 : 0.1;
      gainNode.gain.setValueAtTime(0.0001, startAt);
      gainNode.gain.linearRampToValueAtTime(gainLevel, startAt + attack);
      gainNode.gain.setValueAtTime(gainLevel, endAt);
      gainNode.gain.linearRampToValueAtTime(0.0001, endAt + release);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start(startAt);
      oscillator.stop(endAt + release + 0.01);
      registerSynthNode(oscillator, gainNode);
      return endAt + release + 0.02;
    }

    function registerSynthNode(oscillator, gainNode) {
      oscillator.onended = () => {
        try {
          oscillator.disconnect();
          gainNode.disconnect();
        } catch (_error) {
          // ignore cleanup failure
        }
      };
      activeSynthNodes.push({ oscillator, gainNode });
    }

    return {
      playSchedule,
      stop
    };
  }

  return {
    normalizeWaveform,
    midiNumberToFrequency,
    createBasicWaveSynthEngine
  };
})();

if (typeof window !== "undefined") {
  window["MusicSynthCommon"] = MusicSynthCommon;
}
