"use client";

import React from "react";

export default function SectionCard({
  title,
  subtitle,
  right,
  children,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="paysplit-section-card">
      <div className="paysplit-section-pattern" />

      {(title || subtitle || right) && (
        <header className="paysplit-section-header">
          <div>
            {title && (
              <div className="theme-action paysplit-section-title">
                <span aria-hidden="true">
                  ✦
                </span>

                {title}
              </div>
            )}

            {subtitle && (
              <p className="paysplit-section-subtitle">
                {subtitle}
              </p>
            )}
          </div>

          {right && (
            <div className="paysplit-section-action">
              {right}
            </div>
          )}
        </header>
      )}

      <div className="paysplit-section-body">
        {children}
      </div>
    </section>
  );
}