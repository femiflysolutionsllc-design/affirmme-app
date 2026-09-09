"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

type TrackId = "rain" | "ocean" | "brown";

type Track = {
  id: TrackId;
  label: string;
};

type AmbientEngine = {
  source: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  master: GainNode;
  lfo?: OscillatorNode;
  lfoDepth?: GainNode;
};

const TRACKS: Track[] = [
  {
    id: "rain",
    label: "Gentle rain",
  },
  {
    id: "ocean",
    label: "Ocean waves",
  },
  {
    id: "brown",
    label: "Soft brown noise",
  },
];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function createAmbientBuffer(
  context: AudioContext,
  trackId: TrackId
): AudioBuffer {
  const duration = 12;
  const frameCount = context.sampleRate * duration;
  const buffer = context.createBuffer(
    2,
    frameCount,
    context.sampleRate
  );

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    let previousValue = 0;

    for (let i = 0; i < frameCount; i++) {
      const whiteNoise = Math.random() * 2 - 1;

      if (trackId === "rain") {
        const seconds = i / context.sampleRate;

        const gentleVariation =
          0.76 +
          Math.sin(seconds * 0.42 + channel) * 0.08 +
          Math.sin(seconds * 0.13) * 0.06;

        const softDrop =
          Math.random() > 0.998
            ? (Math.random() * 2 - 1) * 0.7
            : 0;

        data[i] =
          whiteNoise * gentleVariation * 0.65 +
          softDrop;
      } else if (trackId === "ocean") {
        previousValue =
          (previousValue + 0.025 * whiteNoise) / 1.025;

        data[i] = previousValue * 3.2;
      } else {
        previousValue =
          (previousValue + 0.02 * whiteNoise) / 1.02;

        data[i] = previousValue * 3.5;
      }
    }
  }

  return buffer;
}

export default function MeditationCoach() {
  const [minutes, setMinutes] = usePersistentState<number>(
    "meditation_minutes",
    5
  );

  const [trackId, setTrackId] = usePersistentState<TrackId>(
    "meditation_track",
    "rain"
  );

  const [secondsRemaining, setSecondsRemaining] = useState(
    minutes * 60
  );

  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const endTimeRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientEngineRef = useRef<AmbientEngine | null>(null);

  const bufferCacheRef = useRef<
    Partial<Record<TrackId, AudioBuffer>>
  >({});

  const selectedTrack =
    TRACKS.find((track) => track.id === trackId) ?? TRACKS[0];

  const totalSeconds = minutes * 60;

  useEffect(() => {
    if (!hasStarted && !isRunning) {
      setSecondsRemaining(minutes * 60);
    }
  }, [minutes, hasStarted, isRunning]);

  const progress =
    totalSeconds > 0
      ? Math.min(
          100,
          Math.max(
            0,
            ((totalSeconds - secondsRemaining) / totalSeconds) * 100
          )
        )
      : 0;

  function stopAmbientSound() {
    const engine = ambientEngineRef.current;

    if (!engine) return;

    try {
      engine.source.stop();
    } catch {
      // The source may already be stopped.
    }

    try {
      engine.lfo?.stop();
    } catch {
      // The oscillator may already be stopped.
    }

    engine.source.disconnect();
    engine.filter.disconnect();
    engine.master.disconnect();
    engine.lfo?.disconnect();
    engine.lfoDepth?.disconnect();

    ambientEngineRef.current = null;
  }

  async function startAmbientSound(nextTrackId: TrackId) {
    stopAmbientSound();

    const AudioContextClass =
      window.AudioContext ||
      (window as any).webkitAudioContext;

    if (!AudioContextClass) return;

    let context = audioContextRef.current;

    if (!context || context.state === "closed") {
      context = new AudioContextClass();
      audioContextRef.current = context;
      bufferCacheRef.current = {};
    }

    if (context.state === "suspended") {
      await context.resume();
    }

    let buffer = bufferCacheRef.current[nextTrackId];

    if (!buffer) {
      buffer = createAmbientBuffer(context, nextTrackId);
      bufferCacheRef.current[nextTrackId] = buffer;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const master = context.createGain();

    source.buffer = buffer;
    source.loop = true;

    let lfo: OscillatorNode | undefined;
    let lfoDepth: GainNode | undefined;
    let targetVolume = 0.3;

    if (nextTrackId === "rain") {
      filter.type = "bandpass";
      filter.frequency.value = 2600;
      filter.Q.value = 0.45;
      targetVolume = 0.3;
    }

    if (nextTrackId === "ocean") {
      filter.type = "lowpass";
      filter.frequency.value = 1150;
      filter.Q.value = 0.5;
      targetVolume = 0.22;

      lfo = context.createOscillator();
      lfoDepth = context.createGain();

      lfo.type = "sine";
      lfo.frequency.value = 0.075;
      lfoDepth.gain.value = 0.14;

      lfo.connect(lfoDepth);
      lfoDepth.connect(master.gain);
    }

    if (nextTrackId === "brown") {
      filter.type = "lowpass";
      filter.frequency.value = 700;
      filter.Q.value = 0.4;
      targetVolume = 0.34;
    }

    master.gain.setValueAtTime(0, context.currentTime);
    master.gain.linearRampToValueAtTime(
      targetVolume,
      context.currentTime + 0.4
    );

    source.connect(filter);
    filter.connect(master);
    master.connect(context.destination);

    ambientEngineRef.current = {
      source,
      filter,
      master,
      lfo,
      lfoDepth,
    };

    source.start();
    lfo?.start();
  }

  useEffect(() => {
    if (!isRunning) return;

    function updateTimer() {
      if (!endTimeRef.current) return;

      const nextSeconds = Math.max(
        0,
        Math.ceil((endTimeRef.current - Date.now()) / 1000)
      );

      setSecondsRemaining(nextSeconds);

      if (nextSeconds === 0) {
        setIsRunning(false);
        endTimeRef.current = null;
        stopAmbientSound();
      }
    }

    updateTimer();

    const timerId = window.setInterval(updateTimer, 250);

    return () => window.clearInterval(timerId);
  }, [isRunning]);

  useEffect(() => {
    return () => {
      stopAmbientSound();

      const context = audioContextRef.current;
      audioContextRef.current = null;

      if (context && context.state !== "closed") {
        void context.close();
      }
    };
  }, []);

  function chooseMinutes(nextMinutes: number) {
    setMinutes(nextMinutes);
    setSecondsRemaining(nextMinutes * 60);
    setIsRunning(false);
    setHasStarted(false);
    endTimeRef.current = null;
    stopAmbientSound();
  }

  function chooseTrack(nextTrack: TrackId) {
    setTrackId(nextTrack);

    if (isRunning) {
      void startAmbientSound(nextTrack);
    }
  }

  function toggleTimer() {
    if (isRunning) {
      if (endTimeRef.current) {
        const pausedSeconds = Math.max(
          0,
          Math.ceil(
            (endTimeRef.current - Date.now()) / 1000
          )
        );

        setSecondsRemaining(pausedSeconds);
      }

      setIsRunning(false);
      endTimeRef.current = null;
      stopAmbientSound();
      return;
    }

    const startingSeconds =
      secondsRemaining > 0
        ? secondsRemaining
        : totalSeconds;

    setSecondsRemaining(startingSeconds);
    endTimeRef.current =
      Date.now() + startingSeconds * 1000;

    setHasStarted(true);
    setIsRunning(true);

    void startAmbientSound(trackId);
  }

  function resetTimer() {
    setIsRunning(false);
    setHasStarted(false);
    setSecondsRemaining(totalSeconds);
    endTimeRef.current = null;
    stopAmbientSound();
  }

  const mainButtonLabel = isRunning
    ? "Pause Session"
    : hasStarted && secondsRemaining > 0
      ? "Resume Session"
      : secondsRemaining === 0
        ? "Start Again"
        : "Start Session";

  return (
    <div className="meditation-coach space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-300">
            Session length
          </p>

          <div className="flex gap-2">
            {[5, 10, 15].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => chooseMinutes(option)}
                className={`meditation-length-button flex-1 rounded-full border px-3 py-2 text-xs transition ${
                  minutes === option
                    ? "is-active border-emerald-400 bg-emerald-500/90 text-slate-950"
                    : "border-slate-700 bg-slate-900/50 text-slate-200 hover:bg-slate-800"
                }`}
              >
                {option} min
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-300">
            Background sound
          </p>

          <div className="flex gap-2">
            {TRACKS.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => chooseTrack(track.id)}
                className={`meditation-sound-button flex-1 rounded-full border px-3 py-2 text-xs transition ${
                  trackId === track.id
                    ? "is-active border-emerald-400 bg-emerald-500/90 text-slate-950"
                    : "border-slate-700 bg-slate-900/50 text-slate-200 hover:bg-slate-800"
                }`}
              >
                {track.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section
        className="meditation-timer-display rounded-2xl border border-slate-700 bg-slate-950/80 p-5 text-center"
        aria-live="polite"
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          {isRunning
            ? "Session in progress"
            : secondsRemaining === 0
              ? "Session complete"
              : "Ready when you are"}
        </p>

        <p className="mt-2 text-5xl font-black tabular-nums text-slate-100">
          {formatTime(secondsRemaining)}
        </p>

        <p className="mt-2 text-xs text-slate-400">
          {selectedTrack.label} · {minutes}-minute session
        </p>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="meditation-timer-progress h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {secondsRemaining === 0 && (
          <p className="mt-3 text-sm font-semibold text-emerald-300">
            Session complete. Take one slow breath before moving on.
          </p>
        )}
      </section>

      <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-3 text-xs text-slate-200">
        <p className="mb-1 font-semibold text-emerald-300">
          Simple Meditation Script
        </p>

        <ol className="list-inside list-decimal space-y-1">
          <li>Choose your session length and background sound.</li>
          <li>Press Start Session, then soften your gaze.</li>
          <li>Inhale for 4, hold for 4, and exhale for 6.</li>
          <li>
            When your mind wanders, return to the sound and your breath.
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
        <button
          type="button"
          onClick={toggleTimer}
          className={`w-full rounded-full border px-4 py-3 text-sm font-semibold transition ${
            isRunning
              ? "border-rose-400 bg-rose-500/90 text-slate-950"
              : "border-emerald-400 bg-emerald-500/90 text-slate-950"
          }`}
        >
          {mainButtonLabel}
        </button>

        <button
          type="button"
          onClick={resetTimer}
          className="rounded-full border border-slate-600 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
        >
          Reset
        </button>
      </div>

      <p className="text-[11px] text-slate-500">
        Ambient sound plays privately in your browser and stops automatically
        when the timer reaches zero.
      </p>
    </div>
  );
}