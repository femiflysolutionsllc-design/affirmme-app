"use client";

import React from "react";

export default function PiggyHero() {
  return (
    <div className="piggy-hero relative overflow-hidden rounded-[34px] border-[3px] border-black bg-gradient-to-br from-[#0D1433] via-[#151C44] to-[#090B17] p-6 shadow-[10px_10px_0px_black] md:p-10">
      {/* Background glows */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#3B82F6]/30 blur-3xl" />

      <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#F43F7A]/30 blur-3xl" />

      {/* Halftone texture */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle at center, white 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="piggy-hero-content relative flex flex-col items-center justify-between gap-8 md:flex-row md:gap-10">
        {/* Hero message */}
        <div className="piggy-hero-copy flex-1">
          <div className="piggy-hero-kicker inline-flex rounded-full border-[3px] border-black bg-[#FACC15] px-5 py-2 shadow-[4px_4px_0px_black]">
            <span className="font-black uppercase tracking-[0.25em] text-black">
              🐷 Piggy Bank HQ
            </span>
          </div>

          <h1 className="piggy-hero-title mt-7 text-[clamp(2.6rem,6vw,5rem)] font-black uppercase leading-[0.9] text-white drop-shadow-[5px_5px_0px_rgba(0,0,0,.55)]">
            Build Your
            <br />
            Future
          </h1>

          <p className="piggy-hero-description mt-6 max-w-xl text-lg text-slate-300">
            Every dollar you save powers your future. Complete savings
            missions, unlock achievements, and watch your vault grow.
          </p>
        </div>

        {/* Vault medallion */}
        <div className="piggy-vault-wrap relative flex shrink-0 items-center justify-center pb-4">
          {/* Integrated energy accents */}
          <span className="absolute -left-5 top-[30%] h-2 w-7 rotate-[25deg] rounded-full bg-[#60A5FA]" />
          <span className="absolute -left-7 top-[44%] h-2 w-5 rounded-full bg-[#60A5FA]" />
          <span className="absolute -right-5 top-[30%] h-2 w-7 -rotate-[25deg] rounded-full bg-[#F43F7A]" />
          <span className="absolute -right-7 top-[44%] h-2 w-5 rounded-full bg-[#F43F7A]" />

          {/* Silver vault casing */}
          <div
            className="piggy-vault relative flex h-[215px] w-[215px] items-center justify-center rounded-full border-[5px] border-black p-[13px] shadow-[8px_8px_0px_black,0_0_35px_rgba(96,165,250,.35)] md:h-[270px] md:w-[270px]"
            style={{
              background:
                "linear-gradient(145deg, #F8FAFC 0%, #94A3B8 28%, #E2E8F0 50%, #64748B 76%, #CBD5E1 100%)",
            }}
          >
            {/* Metal bolts */}
            <span className="absolute left-1/2 top-[3px] h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-black bg-slate-300" />
            <span className="absolute bottom-[3px] left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-black bg-slate-300" />
            <span className="absolute left-[3px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-black bg-slate-300" />
            <span className="absolute right-[3px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-black bg-slate-300" />

            <span className="absolute left-[12%] top-[12%] h-3.5 w-3.5 rounded-full border-[2px] border-black bg-slate-300" />
            <span className="absolute right-[12%] top-[12%] h-3.5 w-3.5 rounded-full border-[2px] border-black bg-slate-300" />
            <span className="absolute bottom-[12%] left-[12%] h-3.5 w-3.5 rounded-full border-[2px] border-black bg-slate-300" />
            <span className="absolute bottom-[12%] right-[12%] h-3.5 w-3.5 rounded-full border-[2px] border-black bg-slate-300" />

            {/* Illuminated progress ring */}
            <div
              className="flex h-full w-full items-center justify-center rounded-full border-[4px] border-black p-[10px]"
              style={{
                background:
                  "conic-gradient(from 210deg, #60A5FA 0 48%, #F43F7A 48% 96%, #1F2937 96% 100%)",
              }}
            >
              {/* Pig mascot */}
              <div
                className="flex h-full w-full items-center justify-center rounded-full border-[4px] border-black"
                style={{
                  background:
                    "radial-gradient(circle, #242044 0%, #0A1024 72%)",
                }}
              >
                <span className="text-[82px] leading-none drop-shadow-[0_0_28px_rgba(244,63,122,.45)] md:text-[105px]">
                  🐷
                </span>
              </div>
            </div>
          </div>

          <div className="piggy-vault-label absolute bottom-0 rounded-full border-[4px] border-black bg-[#0A1024] px-5 py-2 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[4px_4px_0px_black]">
            • Savings Mode •
          </div>
        </div>
      </div>
    </div>
  );
}