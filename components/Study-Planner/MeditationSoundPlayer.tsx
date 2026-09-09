"use client";

import React, { useRef, useState } from "react";

type Track = {
  id: string;
  label: string;
  url: string;
};

const TRACKS: Track[] = [
  {
    id: "rain",
    label: "Soft rain",
    url: "/audio/rain.mp3", // you can replace with your own file paths later
  },
  {
    id: "ocean",
    label: "Ocean waves",
    url: "/audio/ocean.mp3",
  },
  {
    id: "brown-noise",
    label: "Brown noise",
    url: "/audio/brown-noise.mp3",
  },
];

export default function MeditationSoundPlayer() {
  const [current, setCurrent] = useState<Track | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playTrack(track: Track) {
    setCurrent(track);
    if (!audioRef.current) return;
    audioRef.current.src = track.url;
    audioRef.current.play().catch(() => {});
  }

  function stop() {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }

  return (
    <div className="space-y-2 text-xs">
      <p className="font-semibold text-slate-200">
        Background sound (optional)
      </p>
      <div className="flex flex-wrap gap-2">
        {TRACKS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => playTrack(t)}
            className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300 hover:border-emerald-400 hover:text-emerald-300"
          >
            {t.label}
          </button>
        ))}
        {current && (
          <button
            type="button"
            onClick={stop}
            className="rounded-full border border-red-500 bg-slate-900/70 px-3 py-1 text-[11px] text-red-300 hover:bg-red-500/10"
          >
            Stop
          </button>
        )}
      </div>

      <audio ref={audioRef} loop />
      <p className="text-[10px] text-slate-500">
        You&apos;ll need to add your own audio files later at the paths shown above.
      </p>
    </div>
  );
}