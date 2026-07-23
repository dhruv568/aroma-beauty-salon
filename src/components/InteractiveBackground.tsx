"use client";

import React from "react";

interface InteractiveBackgroundProps {
  absolute?: boolean;
  theme?: "light" | "dark";
}

export default function InteractiveBackground({ absolute = false, theme = "light" }: InteractiveBackgroundProps) {
  const isDark = theme === "dark";

  // Pure CSS-based luxurious, simple, and clean background with soft organic blur blobs
  return (
    <div
      style={{
        position: absolute ? "absolute" : "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: absolute ? 1 : -2,
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: isDark ? "#0A2A1E" : "#FAF8F5", // Deep forest green or soft luxury cream base
        transition: "background-color 0.5s ease",
      }}
    >
      {/* Decorative Blur Blobs for a high-end, clean, spa-like atmosphere */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "20%",
          width: "45vw",
          height: "45vw",
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(197, 168, 128, 0.12) 0%, rgba(10, 42, 30, 0) 70%)" // Gold aura in dark
            : "radial-gradient(circle, rgba(197, 168, 128, 0.15) 0%, rgba(250, 248, 245, 0) 70%)", // Gold aura in light
          filter: "blur(80px)",
          opacity: 0.8,
          animation: "floatSlow1 25s infinite ease-in-out alternate",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "15%",
          width: "40vw",
          height: "40vw",
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(32, 120, 85, 0.15) 0%, rgba(10, 42, 30, 0) 70%)" // Emerald aura in dark
            : "radial-gradient(circle, rgba(234, 222, 201, 0.6) 0%, rgba(250, 248, 245, 0) 70%)", // Warm cream in light
          filter: "blur(100px)",
          opacity: 0.7,
          animation: "floatSlow2 30s infinite ease-in-out alternate",
        }}
      />

      {/* Subtle overlay grid lines or texture if desired (very clean, low opacity lines) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: isDark
            ? "linear-gradient(rgba(223, 202, 160, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(223, 202, 160, 0.02) 1px, transparent 1px)"
            : "linear-gradient(rgba(10, 42, 30, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(10, 42, 30, 0.015) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.7,
        }}
      />

      <style jsx global>{`
        @keyframes floatSlow1 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          100% {
            transform: translate(5vw, 5vh) scale(1.1);
          }
        }
        @keyframes floatSlow2 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          100% {
            transform: translate(-4vw, -6vh) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
