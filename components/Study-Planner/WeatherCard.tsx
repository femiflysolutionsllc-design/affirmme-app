"use client";

import React, { useEffect, useState } from "react";

type WeatherState = {
  temp: string;
  summary: string;
  location: string;
};

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherState>({
    temp: "--",
    summary: "Checking the sky for you…",
    location: "Your area"
  });

  // Placeholder / fake weather for now.
  // Later you can replace this with a real API call.
  useEffect(() => {
    setWeather({
      temp: "82°",
      summary: "Warm, a little humid. Great for gym or a walk.",
      location: "Miami"
    });
  }, []);

  return (
    <section className="home-weather-shell rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Weather
        </p>
        {/* Voice will read this line */}
        <p
          id="weather-text"
          className="text-sm text-slate-100 mt-1 max-w-xs leading-snug"
        >
          {weather.location}, {weather.temp}. {weather.summary}
        </p>
      </div>
      <div className="text-3xl">☀️</div>
    </section>
  );
}