"use client";

import React from "react";

export default function MonthlyReview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>Monthly Review</h2>

      <label>Systems Mastered</label>
      <input
        type="text"
        placeholder="List systems you mastered..."
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      />

      <label>Weak Areas to Revisit</label>
      <input
        type="text"
        placeholder="What needs more review?"
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      />

      <label>Average Practice Score (%)</label>
      <input
        type="number"
        min="0"
        max="100"
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      />

      <label>Stress Level (0–10)</label>
      <input
        type="number"
        min="0"
        max="10"
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      />

      <h3>3 Accomplishments</h3>
      <input
        type="text"
        placeholder="1."
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      />
      <input
        type="text"
        placeholder="2."
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      />
      <input
        type="text"
        placeholder="3."
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      />
    </div>
  );
}