"use client";

import React, { useEffect, useRef } from "react";

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
        
        if (
          relativeX >= -150 &&
          relativeX <= rect.width + 150 &&
          relativeY >= -150 &&
          relativeY <= rect.height + 150
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

    // Parameters for Interactive Grid
    const gridSpacing = 60; // larger grid lines for a cleaner look
    const maxRadius = 180;  // spotlight / displacement radius

    // Colors
    const baseGridColor = isDark 
      ? "rgba(223, 202, 160, 0.04)" // very subtle gold lines
      : "rgba(10, 42, 30, 0.03)";    // very subtle emerald lines

    const activeGridColor = isDark
      ? "rgba(223, 202, 160, 0.25)"  // highlighted gold lines
      : "rgba(197, 168, 128, 0.35)"; // highlighted luxury gold lines

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
          smoothedMouseRef.current.x += (mouseRef.current.x - smoothedMouseRef.current.x) * 0.06;
          smoothedMouseRef.current.y += (mouseRef.current.y - smoothedMouseRef.current.y) * 0.06;
        }
      } else {
        // Slow retreat
        if (smoothedMouseRef.current.x !== -1000) {
          smoothedMouseRef.current.x += (-1000 - smoothedMouseRef.current.x) * 0.06;
          smoothedMouseRef.current.y += (-1000 - smoothedMouseRef.current.y) * 0.06;
          if (Math.abs(smoothedMouseRef.current.x + 1000) < 1) {
            smoothedMouseRef.current.x = -1000;
            smoothedMouseRef.current.y = -1000;
          }
        }
      }

      const hasMouse = smoothedMouseRef.current.x !== -1000;

      // 1. Draw Horizontal Grid Lines with warp effect
      const rowCount = Math.ceil(height / gridSpacing) + 1;
      const colCount = Math.ceil(width / gridSpacing) + 1;

      ctx.lineWidth = 1;

      for (let r = 0; r < rowCount; r++) {
        ctx.beginPath();
        const baseY = r * gridSpacing;

        for (let x = 0; x <= width; x += 15) {
          let drawY = baseY;

          if (hasMouse) {
            const dx = x - smoothedMouseRef.current.x;
            const dy = baseY - smoothedMouseRef.current.y;
            const dist = Math.hypot(dx, dy);

            if (dist < maxRadius) {
              const force = (maxRadius - dist) / maxRadius;
              // Push lines away vertically
              drawY += (dy / dist) * force * 15;
            }
          }

          if (x === 0) {
            ctx.moveTo(x, drawY);
          } else {
            ctx.lineTo(x, drawY);
          }
        }

        // Stroke with spotlight gradient effect
        if (hasMouse && smoothedMouseRef.current.x >= 0 && smoothedMouseRef.current.x <= width) {
          const grad = ctx.createLinearGradient(0, 0, width, 0);
          // Highlight gradient only near the cursor X position
          const cursorXRatio = Math.max(0, Math.min(1, smoothedMouseRef.current.x / width));
          const startRatio = Math.max(0, Math.min(1, cursorXRatio - 0.15));
          const endRatio = Math.max(0, Math.min(1, cursorXRatio + 0.15));

          grad.addColorStop(0, baseGridColor);
          grad.addColorStop(startRatio, baseGridColor);
          grad.addColorStop(cursorXRatio, activeGridColor);
          grad.addColorStop(endRatio, baseGridColor);
          grad.addColorStop(1, baseGridColor);
          ctx.strokeStyle = grad;
        } else {
          ctx.strokeStyle = baseGridColor;
        }
        ctx.stroke();
      }

      // 2. Draw Vertical Grid Lines with warp effect
      for (let c = 0; c < colCount; c++) {
        ctx.beginPath();
        const baseX = c * gridSpacing;

        for (let y = 0; y <= height; y += 15) {
          let drawX = baseX;

          if (hasMouse) {
            const dx = baseX - smoothedMouseRef.current.x;
            const dy = y - smoothedMouseRef.current.y;
            const dist = Math.hypot(dx, dy);

            if (dist < maxRadius) {
              const force = (maxRadius - dist) / maxRadius;
              // Push lines away horizontally
              drawX += (dx / dist) * force * 15;
            }
          }

          if (y === 0) {
            ctx.moveTo(drawX, y);
          } else {
            ctx.lineTo(drawX, y);
          }
        }

        // Stroke with spotlight gradient effect
        if (hasMouse && smoothedMouseRef.current.y >= 0 && smoothedMouseRef.current.y <= height) {
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          const cursorYRatio = Math.max(0, Math.min(1, smoothedMouseRef.current.y / height));
          const startRatio = Math.max(0, Math.min(1, cursorYRatio - 0.15));
          const endRatio = Math.max(0, Math.min(1, cursorYRatio + 0.15));

          grad.addColorStop(0, baseGridColor);
          grad.addColorStop(startRatio, baseGridColor);
          grad.addColorStop(cursorYRatio, activeGridColor);
          grad.addColorStop(endRatio, baseGridColor);
          grad.addColorStop(1, baseGridColor);
          ctx.strokeStyle = grad;
        } else {
          ctx.strokeStyle = baseGridColor;
        }
        ctx.stroke();
      }

      // 3. Highlight intersections near mouse with a glowing golden dot
      if (hasMouse) {
        for (let r = 0; r < rowCount; r++) {
          for (let c = 0; c < colCount; c++) {
            const bx = c * gridSpacing;
            const by = r * gridSpacing;

            const dx = bx - smoothedMouseRef.current.x;
            const dy = by - smoothedMouseRef.current.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 100) {
              const force = (100 - dist) / 100;
              // Warp intersection point
              const drawX = bx + (dx / dist) * force * 8;
              const drawY = by + (dy / dist) * force * 8;

              ctx.beginPath();
              ctx.arc(drawX, drawY, 2 + force * 1.5, 0, Math.PI * 2);
              ctx.fillStyle = isDark ? "rgba(223, 202, 160, 0.8)" : "rgba(197, 168, 128, 0.9)";
              ctx.fill();
            }
          }
        }
      }

      // 4. Soft radial aura centered on the smoothed cursor
      if (hasMouse) {
        const radGlow = ctx.createRadialGradient(
          smoothedMouseRef.current.x,
          smoothedMouseRef.current.y,
          0,
          smoothedMouseRef.current.x,
          smoothedMouseRef.current.y,
          260
        );

        if (isDark) {
          radGlow.addColorStop(0, "rgba(223, 202, 160, 0.08)");
          radGlow.addColorStop(0.5, "rgba(32, 120, 85, 0.02)");
          radGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        } else {
          radGlow.addColorStop(0, "rgba(197, 168, 128, 0.1)");
          radGlow.addColorStop(0.5, "rgba(10, 42, 30, 0.02)");
          radGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        }
        ctx.fillStyle = radGlow;
        ctx.fillRect(0, 0, width, height);
      }

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
