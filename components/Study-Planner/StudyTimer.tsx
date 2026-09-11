"use client";

import React, { useEffect, useRef, useState } from "react";

type TimerMode = "focus" | "break";

type WakeLockHandle = {
  released: boolean;
  release: () => Promise<void>;
};

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockHandle>;
  };
};

const TRACKS = [
  {
    id: "lofi1",
    label: "Calm lofi mix",
    url: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
  },
  {
    id: "rain",
    label: "Soft rain",
    url: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
  },
];

const FOCUS_OPTIONS = [25, 30, 45, 60];

export default function StudyTimer() {
  const [focusMinutes, setFocusMinutes] = useState(30);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const [running, setRunning] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [focusViewOpen, setFocusViewOpen] = useState(false);
  const [completionPrompt, setCompletionPrompt] = useState(false);

  const [currentTrackId, setCurrentTrackId] = useState("lofi1");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wakeLockRef = useRef<WakeLockHandle | null>(null);

  const currentTrack =
    TRACKS.find((track) => track.id === currentTrackId) ?? TRACKS[0];

  async function requestWakeLock() {
    try {
      if (
        wakeLockRef.current &&
        !wakeLockRef.current.released
      ) {
        return;
      }

      const wakeLockApi = (navigator as NavigatorWithWakeLock).wakeLock;

      if (wakeLockApi) {
        wakeLockRef.current = await wakeLockApi.request("screen");
      }
    } catch {
      wakeLockRef.current = null;
    }
  }

  async function releaseWakeLock() {
    try {
      await wakeLockRef.current?.release();
    } catch {
      // The browser may have already released it.
    }

    wakeLockRef.current = null;
  }

  function speak(message: string) {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const announcement = new SpeechSynthesisUtterance(message);
    announcement.rate = 0.95;
    announcement.pitch = 1;

    window.speechSynthesis.speak(announcement);
  }

  async function requestNotificationPermission() {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return;
    }

    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        // Notifications are optional.
      }
    }
  }

  function sendCompletionNotification(message: string) {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    try {
      new Notification("Zaryx Study Session", {
        body: message,
      });
    } catch {
      // Some preview browsers block notifications.
    }
  }

  function pauseMusic() {
    audioRef.current?.pause();
  }

  function finishCurrentTimer() {
    setRunning(false);
    setCompletionPrompt(true);
    setFocusViewOpen(true);
    pauseMusic();
    void releaseWakeLock();

    const message =
      mode === "break"
        ? "Your break is over. Are you ready to continue studying?"
        : `Your ${focusMinutes} minute study session is complete. Would you like to continue or take a break?`;

    speak(message);
    sendCompletionNotification(message);
  }

  useEffect(() => {
    if (!running) return;

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) =>
        current > 0 ? current - 1 : 0
      );
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [running]);

  useEffect(() => {
    if (secondsLeft === 0 && running) {
      finishCurrentTimer();
    }
  }, [secondsLeft, running]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (
        document.visibilityState === "visible" &&
        sessionActive &&
        running
      ) {
        void requestWakeLock();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [sessionActive, running]);

  useEffect(() => {
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      if (!sessionActive || !running) return;

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warnBeforeLeaving);

    return () => {
      window.removeEventListener(
        "beforeunload",
        warnBeforeLeaving
      );
    };
  }, [sessionActive, running]);

  useEffect(() => {
    return () => {
      pauseMusic();
      void releaseWakeLock();
    };
  }, []);

  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");

    const seconds = (totalSeconds % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${seconds}`;
  }

  function chooseFocusLength(minutes: number) {
    if (sessionActive) return;

    setFocusMinutes(minutes);
    setMode("focus");
    setSecondsLeft(minutes * 60);
  }

  function startFocusSession() {
    setMode("focus");
    setSecondsLeft(focusMinutes * 60);
    setSessionActive(true);
    setFocusViewOpen(true);
    setCompletionPrompt(false);
    setRunning(true);

    void requestWakeLock();
    void requestNotificationPermission();

    speak(
      `Your ${focusMinutes} minute Zaryx focus session is starting now. Let's study.`
    );
  }

  function continueStudying() {
    setMode("focus");
    setSecondsLeft(focusMinutes * 60);
    setCompletionPrompt(false);
    setFocusViewOpen(true);
    setSessionActive(true);
    setRunning(true);

    void requestWakeLock();

    speak(
      `Starting another ${focusMinutes} minute focus session.`
    );
  }

  function startBreak() {
    setMode("break");
    setSecondsLeft(5 * 60);
    setCompletionPrompt(false);
    setFocusViewOpen(true);
    setSessionActive(true);
    setRunning(true);

    void requestWakeLock();

    speak("Your five minute break starts now.");
  }

  function endSession() {
    setRunning(false);
    setSessionActive(false);
    setFocusViewOpen(false);
    setCompletionPrompt(false);
    setMode("focus");
    setSecondsLeft(focusMinutes * 60);

    pauseMusic();
    void releaseWakeLock();

    speak("Focus session ended. Great work today.");
  }

  function confirmEndSession() {
    const shouldEnd = window.confirm(
      "Are you sure you want to end your Zaryx focus session?"
    );

    if (shouldEnd) {
      endSession();
    }
  }

  function toggleRunning() {
    if (running) {
      setRunning(false);
      void releaseWakeLock();
      return;
    }

    setRunning(true);
    void requestWakeLock();
  }

  function toggleMusic() {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  function selectTrack(trackId: string) {
    setCurrentTrackId(trackId);

    window.setTimeout(() => {
      audioRef.current?.play().catch(() => {});
    }, 50);
  }

  return (
    <>
      <section className="space-y-4 rounded-xl border border-emerald-500/30 bg-slate-950/90 p-4 text-xs">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-300">
            Zaryx Focus Session
          </p>

          <h3 className="mt-1 text-base font-semibold text-emerald-300">
            Study without distractions
          </h3>

          <p className="mt-1 text-[11px] text-slate-400">
            Choose your study time. Zaryx will keep you focused,
            keep the screen awake when supported, and notify you
            when the session ends.
          </p>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold text-slate-200">
            Choose a focus length
          </p>

          <div className="flex flex-wrap gap-2">
            {FOCUS_OPTIONS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                disabled={sessionActive}
                onClick={() => chooseFocusLength(minutes)}
                className={
                  "rounded-full border px-3 py-1.5 text-[11px] font-semibold transition disabled:opacity-50 " +
                  (focusMinutes === minutes
                    ? "border-pink-300 bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                    : "border-purple-500/60 bg-slate-900 text-slate-200")
                }
              >
                {minutes} min
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-500/40 bg-black/30 p-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              {mode === "focus" ? "Focus time" : "Break time"}
            </p>

            <p className="font-mono text-3xl font-bold text-white">
              {formatTime(secondsLeft)}
            </p>

            {sessionActive && (
              <p className="mt-1 text-[10px] text-emerald-300">
                Focus session active
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {!sessionActive ? (
              <button
                type="button"
                onClick={startFocusSession}
                className="rounded-full border border-yellow-300 bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-[11px] font-bold text-white shadow-lg"
              >
                Start focus session
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={toggleRunning}
                  className="rounded-full border border-emerald-400 px-4 py-2 text-[11px] font-semibold text-emerald-200"
                >
                  {running ? "Pause" : "Resume"}
                </button>

                <button
                  type="button"
                  onClick={() => setFocusViewOpen(true)}
                  className="rounded-full border border-purple-400 px-4 py-2 text-[11px] font-semibold text-purple-200"
                >
                  Open focus view
                </button>

                <button
                  type="button"
                  onClick={confirmEndSession}
                  className="rounded-full border border-rose-400 px-4 py-2 text-[11px] font-semibold text-rose-200"
                >
                  End
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-800 bg-black/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold text-emerald-200">
                Ambient study music
              </p>

              <p className="text-[10px] text-slate-500">
                Optional background sound for your session
              </p>
            </div>

            <button
              type="button"
              onClick={toggleMusic}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-200"
            >
              Play / Pause
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {TRACKS.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => selectTrack(track.id)}
                className={
                  "rounded-full border px-3 py-1 text-[11px] " +
                  (currentTrackId === track.id
                    ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                    : "border-slate-700 bg-slate-900 text-slate-300")
                }
              >
                {track.label}
              </button>
            ))}
          </div>

          <audio ref={audioRef} src={currentTrack.url} loop />
        </div>
      </section>

      {sessionActive && (focusViewOpen || completionPrompt) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/95 p-4 backdrop-blur-xl">
          <div className="w-full max-w-xl rounded-3xl border border-purple-400 bg-black/90 p-6 text-center shadow-2xl shadow-purple-500/20">
            {completionPrompt ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-300">
                  Zaryx Check-In
                </p>

                <h2 className="mt-4 text-3xl font-bold text-white">
                  {mode === "break"
                    ? "Your break is over"
                    : `${focusMinutes} minutes are up`}
                </h2>

                <p className="mt-3 text-sm text-slate-300">
                  Would you like to continue studying, take a
                  five-minute break, or finish your session?
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={continueStudying}
                    className="rounded-full border border-yellow-300 bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-3 text-sm font-bold text-white"
                  >
                    Continue studying
                  </button>

                  <button
                    type="button"
                    onClick={startBreak}
                    className="rounded-full border border-sky-400 px-5 py-3 text-sm font-semibold text-sky-200"
                  >
                    Take a 5-minute break
                  </button>

                  <button
                    type="button"
                    onClick={endSession}
                    className="rounded-full border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-300"
                  >
                    Finish session
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-300">
                  Zaryx Focus Mode
                </p>

                <h2 className="mt-4 text-2xl font-bold text-white">
                  Stay focused—you’ve got this.
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Use AffirmMe’s notes, flashcards, quizzes, and
                  study tools during this session.
                </p>

                <p className="mt-8 font-mono text-6xl font-bold text-emerald-300">
                  {formatTime(secondsLeft)}
                </p>

                <p className="mt-2 text-xs uppercase tracking-wider text-slate-400">
                  {mode === "focus"
                    ? "Study session"
                    : "Rest and recharge"}
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFocusViewOpen(false)}
                    className="rounded-full border border-yellow-300 bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-3 text-sm font-bold text-white"
                  >
                    Open study tools
                  </button>

                  <button
                    type="button"
                    onClick={toggleRunning}
                    className="rounded-full border border-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-200"
                  >
                    {running ? "Pause timer" : "Resume timer"}
                  </button>

                  <button
                    type="button"
                    onClick={confirmEndSession}
                    className="rounded-full border border-rose-400 px-5 py-3 text-sm font-semibold text-rose-200"
                  >
                    End session
                  </button>
                </div>

                <p className="mt-6 text-[10px] text-slate-500">
                  AffirmMe cannot block calls or other apps in this
                  web version. Use your device’s Study Focus to
                  silence outside notifications.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}