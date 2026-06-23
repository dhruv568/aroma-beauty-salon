"use client";

import React, { useEffect, useRef } from "react";

interface Wave {
  y: number; // base vertical position relative to screen height (0 to 1)
  length: number; // wavelength factor
  amplitude: number; // wave height
  speed: number; // movement speed
  phase: number; // current offset
  color: string; // stroke color
  lineWidth: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  color: string;
}

interface InteractiveBackgroundProps {
  absolute?: boolean;
  theme?: "light" | "dark";
}

export default function InteractiveBackground({ absolute = false, theme = "light" }: InteractiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const smoothedMouseRef = useRef({ x: -1000, y: -1000 });
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth);
    let height = (canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight);

    const isDark = theme === "dark";

    // Define 4 waves with rich, highly-visible stroke opacities depending on theme
    const waves: Wave[] = isDark
      ? [
          {
            y: 0.35,
            length: 0.002,
            amplitude: 45,
            speed: 0.012,
            phase: 0,
            color: "rgba(223, 202, 160, 0.4)", // Highly visible Champagne Gold
            lineWidth: 2,
          },
          {
            y: 0.5,
            length: 0.0015,
            amplitude: 60,
            speed: -0.009,
            phase: Math.PI / 3,
            color: "rgba(255, 255, 255, 0.45)", // Bright White Glow
            lineWidth: 2.5,
          },
          {
            y: 0.65,
            length: 0.0025,
            amplitude: 40,
            speed: 0.008,
            phase: Math.PI * 0.6,
            color: "rgba(197, 168, 128, 0.35)", // Soft Gold
            lineWidth: 1.5,
          },
          {
            y: 0.8,
            length: 0.001,
            amplitude: 50,
            speed: -0.01,
            phase: Math.PI * 0.9,
            color: "rgba(32, 120, 85, 0.3)", // Light Emerald glow
            lineWidth: 3,
          },
        ]
      : [
          {
            y: 0.35,
            length: 0.002,
            amplitude: 45,
            speed: 0.012,
            phase: 0,
            color: "rgba(197, 168, 128, 0.45)", // Rich classic gold on light background
            lineWidth: 2,
          },
          {
            y: 0.5,
            length: 0.0015,
            amplitude: 60,
            speed: -0.009,
            phase: Math.PI / 3,
            color: "rgba(10, 42, 30, 0.18)", // Elegant deep emerald contrast line
            lineWidth: 2.5,
          },
          {
            y: 0.65,
            length: 0.0025,
            amplitude: 40,
            speed: 0.008,
            phase: Math.PI * 0.6,
            color: "rgba(165, 139, 100, 0.4)", // Darker accent gold
            lineWidth: 1.5,
          },
          {
            y: 0.8,
            length: 0.001,
            amplitude: 50,
            speed: -0.01,
            phase: Math.PI * 0.9,
            color: "rgba(255, 255, 255, 0.8)", // Solid glowing white
            lineWidth: 3,
          },
        ];

    // Drifting essence droplets
    const particles: Particle[] = [];
    const maxParticles = 18; // Slightly fewer particles for cleaner performance when multiple canvases are active

    const particleColors = isDark
      ? ["rgba(223, 202, 160, 0.4)", "rgba(255, 255, 255, 0.45)", "rgba(32, 120, 85, 0.35)"]
      : ["rgba(197, 168, 128, 0.5)", "rgba(10, 42, 30, 0.2)", "rgba(255, 255, 255, 0.6)"];

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1, // Float upward
        size: Math.random() * 4 + 1.5, // slightly larger droplets
        alpha: Math.random() * 0.6 + 0.2,
        baseAlpha: Math.random() * 0.6 + 0.2,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
      });
    }

    // Set up Resize Observer to react properly to container changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width || window.innerWidth;
        height = canvas.height = entry.contentRect.height || window.innerHeight;
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    } else {
      window.addEventListener("resize", handleResize);
    }

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    // Mouse events (uses bounding rect calculation if absolute)
    const handleMouseMove = (e: MouseEvent) => {
      if (absolute && canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;
        
        // Only trigger mouse interaction if inside boundaries (with some padding)
        if (
          relativeX >= -100 &&
          relativeX <= rect.width + 100 &&
          relativeY >= -100 &&
          relativeY <= rect.height + 100
        ) {
          mouseRef.current.x = relativeX;
          mouseRef.current.y = relativeY;
          mouseRef.current.active = true;
        } else {
          mouseRef.current.active = false;
        }
      } else {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
        mouseRef.current.active = true;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Setup Intersection Observer to only run loop when canvas is visible
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.01 }
    );
    intersectionObserver.observe(canvas);

    // Animation Loop
    const animate = () => {
      if (!isVisibleRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smoothly interpolate mouse position for fluid lag feel
      if (mouseRef.current.active) {
        if (smoothedMouseRef.current.x === -1000) {
          smoothedMouseRef.current.x = mouseRef.current.x;
          smoothedMouseRef.current.y = mouseRef.current.y;
        } else {
          smoothedMouseRef.current.x += (mouseRef.current.x - smoothedMouseRef.current.x) * 0.05;
          smoothedMouseRef.current.y += (mouseRef.current.y - smoothedMouseRef.current.y) * 0.05;
        }
      }

      // 1. Draw soft radial aura centered on the smoothed cursor
      if (mouseRef.current.active) {
        const radGlow = ctx.createRadialGradient(
          smoothedMouseRef.current.x,
          smoothedMouseRef.current.y,
          0,
          smoothedMouseRef.current.x,
          smoothedMouseRef.current.y,
          280
        );

        if (isDark) {
          radGlow.addColorStop(0, "rgba(223, 202, 160, 0.16)"); // stronger gold glow in dark green
          radGlow.addColorStop(0.5, "rgba(32, 120, 85, 0.08)");
          radGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        } else {
          radGlow.addColorStop(0, "rgba(197, 168, 128, 0.18)"); // gold glow on light
          radGlow.addColorStop(0.5, "rgba(245, 239, 230, 0.1)");
          radGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        }
        ctx.fillStyle = radGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Draw Silk Waves with Mouse Ripple/Deformation
      waves.forEach((wave) => {
        ctx.beginPath();
        wave.phase += wave.speed;

        for (let x = 0; x <= width; x += 6) {
          const baseY = wave.y * height;
          
          // Base undulating wave
          let waveY = baseY + Math.sin(x * wave.length + wave.phase) * wave.amplitude;
          
          // Secondary octave
          waveY += Math.cos(x * (wave.length * 2.2) - wave.phase * 0.7) * (wave.amplitude * 0.2);

          // Cursor displacement
          if (mouseRef.current.active) {
            const dx = x - smoothedMouseRef.current.x;
            const dy = waveY - smoothedMouseRef.current.y;
            const distance = Math.hypot(dx, dy);

            if (distance < 200) {
              const effectStrength = Math.pow(1 - distance / 200, 2);
              const pushY = (dy > 0 ? 1 : -1) * 60 * effectStrength;
              const ripple = Math.sin(distance * 0.08 - wave.phase * 4) * 8 * effectStrength;

              waveY += pushY + ripple;
            }
          }

          if (x === 0) {
            ctx.moveTo(x, waveY);
          } else {
            ctx.lineTo(x, waveY);
          }
        }

        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave.lineWidth;
        ctx.lineCap = "round";
        ctx.stroke();
      });

      // 3. Render and drift essence particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Reset particle if it floats off screen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10 || p.x > width + 10) {
          p.x = Math.random() * width;
          p.y = height + 10;
        }

        // Mouse interaction for particles
        if (mouseRef.current.active) {
          const dx = p.x - smoothedMouseRef.current.x;
          const dy = p.y - smoothedMouseRef.current.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 130) {
            const force = (130 - distance) / 130;
            p.x += (dx / distance) * force * 1.5;
            p.y += (dy / distance) * force * 1.5;
            p.alpha = Math.min(1, p.baseAlpha + force * 0.4);
          } else {
            p.alpha += (p.baseAlpha - p.alpha) * 0.1;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      intersectionObserver.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, [absolute, theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: absolute ? "absolute" : "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: absolute ? 1 : -1,
        pointerEvents: "none",
        backgroundColor: "transparent",
      }}
    />
  );
}
