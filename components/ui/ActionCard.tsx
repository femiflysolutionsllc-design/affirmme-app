"use client";

import React from "react";

type ActionCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
};

export default function ActionCard({
  icon,
  title,
  subtitle,
  onClick,
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="
  theme-action-card
  group
  relative
        overflow-hidden
        rounded-[24px]
        border-[3px]
        border-black
        bg-[#091223]
        p-6
        text-left
        shadow-[8px_8px_0px_rgba(0,0,0,.75)]
        transition-all
        duration-300
        hover:-translate-y-2
        hover:rotate-[-1deg]
        hover:shadow-[12px_12px_0px_rgba(0,0,0,.85)]
      "
    >
      {/* Halftone */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          background:
            "radial-gradient(circle at center, white 1px, transparent 1px)",
          backgroundSize: "13px 13px",
        }}
      />

      {/* Blue Glow */}
      <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-blue-500/25 blur-3xl" />

      {/* Pink Glow */}
      <div className="absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-pink-500/25 blur-3xl" />

      {/* Comic Sticker */}
      <div
        className="
          absolute
          right-4
          top-4
          rounded-full
          border-2
          border-black
          bg-yellow-300
          px-2
          py-1
          text-[10px]
          font-black
          uppercase
          shadow-[3px_3px_0px_black]
        "
      >
        NEW
      </div>

      <div className="relative">

        {/* Icon Box */}

        <div
          className="
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-[22px]
            border-[3px]
            border-black
            bg-gradient-to-br
            from-blue-500
            via-indigo-500
            to-pink-500
            text-5xl
            shadow-[5px_5px_0px_black]
            transition-all
            duration-300
            group-hover:rotate-6
            group-hover:scale-110
          "
        >
          {icon}
        </div>

        {/* Title */}

        <h3
          className="
            mt-6
            text-3xl
            font-black
            uppercase
            leading-none
            text-white
            drop-shadow-[3px_3px_0px_rgba(0,0,0,.7)]
          "
        >
          {title}
        </h3>

        {/* Subtitle */}

        <p className="mt-3 text-base text-slate-300">
          {subtitle}
        </p>

        {/* Bottom */}

        <div className="mt-8 flex items-center justify-between">

          <div
            className="
              rounded-full
              border-2
              border-black
              bg-pink-500
              px-4
              py-1
              text-xs
              font-black
              uppercase
              text-white
              shadow-[3px_3px_0px_black]
            "
          >
            GO →
          </div>

          <div
            className="
              text-4xl
              opacity-30
              transition-transform
              duration-300
              group-hover:rotate-12
              group-hover:scale-125
            "
          >
            ✦
          </div>

        </div>

      </div>
    </button>
  );
}