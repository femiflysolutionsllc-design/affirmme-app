"use client";

import { useRef, useState } from "react";

type ZaryxWelcomeProps = {
  userName?: string;
};

export default function ZaryxWelcome({
  userName,
}: ZaryxWelcomeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  async function meetZaryx() {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.muted = false;

    try {
      await video.play();
    } catch {
      alert("Tap the play symbol on Zaryx’s video to begin.");
    }
  }

  const greeting = userName?.trim()
    ? `Welcome to AffirmMe, ${userName.trim()}.`
    : "Welcome to AffirmMe.";

  return (
    <section className="overflow-hidden rounded-2xl border border-purple-500/50 bg-slate-950/95 shadow-xl">
      <div className="grid grid-cols-[105px_1fr] gap-4 p-4 sm:grid-cols-[135px_1fr] sm:gap-6">
        <video
          ref={videoRef}
          src="/Zaryx_V1_Intro.mp4"
          poster="/Zaryx_V1_Poster.jpg"
          controls
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          className="aspect-[9/16] max-h-[225px] w-full rounded-xl bg-black object-cover"
        />

        <div className="flex min-w-0 flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-300">
            Meet Zaryx
          </p>

          <h2 className="mt-1 text-lg font-semibold text-purple-200 sm:text-xl">
            {greeting}
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
            I’m your personal guide for your mood, studies, calendar, goals,
            and PaySplit. Choose where you’d like to begin, and I’ll guide you
            forward one step at a time.
          </p>

          <button
            type="button"
            onClick={() => void meetZaryx()}
            className="mt-3 w-fit rounded-full border border-yellow-300 bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-xs font-semibold text-white shadow-lg"
          >
            {playing ? "Zaryx is speaking…" : "▶ Meet Zaryx"}
          </button>
        </div>
      </div>
    </section>
  );
}