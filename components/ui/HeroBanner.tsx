"use client";

import React from "react";
import { useTheme } from "../theme/ThemeProvider";

type HeroBannerProps = {
  greeting: string;
  title: string;
  subtitle: string;
  badge?: string;
};

export default function HeroBanner({
  greeting,
  title,
  subtitle,
  badge = "READY",
}: HeroBannerProps) {
  const { appTheme } = useTheme();

  const activeTheme =
  appTheme === "elegant" ||
  appTheme === "classic"
    ? appTheme
    : "comic";

    const themeDetails = {
      comic: {
        eyebrow: "⚡ HERO MODE",
        icon: "A",
        imageLabel: "YOUR HERO",
        badge: "HERO MODE",
      },
    
      elegant: {
        eyebrow: "✦ YOUR FUTURE SELF",
        icon: "✦",
        imageLabel: "BECOMING",
        badge: "FOCUS MODE",
      },
    
      classic: {
        eyebrow: "FINANCIAL OVERVIEW",
        icon: "A",
        imageLabel: "MY PROFILE",
        badge: "OVERVIEW",
      },
    }[activeTheme];

  return (
    <section className="theme-hero">
      <div className="theme-hero-pattern" />

      <div className="theme-hero-content">
        <div className="theme-hero-copy">
          <p className="theme-accent theme-hero-eyebrow">
            {themeDetails.eyebrow}
          </p>

          <p className="theme-hero-greeting">
            {greeting}
          </p>

          <h1 className="theme-heading theme-hero-title">
            {title}
          </h1>

          <p className="theme-hero-subtitle">
            {subtitle}
          </p>

          <div className="theme-hero-badge">
          {activeTheme === "comic"
  ? badge
  : themeDetails.badge}
          </div>
        </div>

        <div
          className="theme-hero-portrait"
          aria-label={`${themeDetails.imageLabel} placeholder`}
        >
          <span className="theme-hero-icon">
            {themeDetails.icon}
          </span>

          <span className="theme-action theme-hero-image-label">
            {themeDetails.imageLabel}
          </span>
        </div>
      </div>
    </section>
  );
}