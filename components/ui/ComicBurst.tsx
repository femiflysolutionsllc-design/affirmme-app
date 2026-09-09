"use client";

import React from "react";

type ComicBurstProps = {
  text: string;
  className?: string;
  floating?: boolean;
};

export default function ComicBurst({
  text,
  className = "",
  floating = false,
}: ComicBurstProps) {
  return (
    <div
      className={[
        floating ? "absolute z-20" : "relative inline-flex",
        "pointer-events-none select-none rotate-6",
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      <div
        className="
          theme-burst
          relative
          bg-gradient-to-r
          from-[#FACC15]
          to-[#F97316]
          px-5
          py-2
          text-sm
          font-black
          uppercase
          text-black
          border-4
          border-black
          shadow-[5px_5px_0px_black]
        "
        style={{
          clipPath:
            "polygon(50% 0%,61% 18%,80% 5%,78% 28%,100% 25%,84% 44%,100% 50%,84% 56%,100% 75%,78% 72%,80% 95%,61% 82%,50% 100%,39% 82%,20% 95%,22% 72%,0% 75%,16% 56%,0% 50%,16% 44%,0% 25%,22% 28%,20% 5%,39% 18%)",
        }}
      >
        {text}
      </div>
    </div>
  );
}