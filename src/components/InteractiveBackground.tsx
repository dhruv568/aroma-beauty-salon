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

    // Parameters for Dot Grid
    const gridSpacing = 40; // spacing between dots
    const maxRadius = 160;  // cursor interactive radius
    const baseDotSize = 1.2;

    const dotColor = isDark 
      ? "rgba(223, 202, 160, 0.12)" // Soft Gold for dark mode
      : "rgba(10, 42, 30, 0.08)";    // Emerald for light mode

    const activeDotColor = isDark
      ? "rgba(223, 202, 160, 0.6)"  // Bright gold highlight
      : "rgba(197, 168, 128, 0.75)"; // Luxury gold highlight

    // Animation Loop
    let time = 0;
    const animate = () => {
      if (!isVisibleRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      time += 0.01;

      // Smoothly interpolate mouse position for fluid lag feel
      if (mouseRef.current.active) {
        if (smoothedMouseRef.current.x === -1000) {
          smoothedMouseRef.current.x = mouseRef.current.x;
          smoothedMouseRef.current.y = mouseRef.current.y;
        } else {
          smoothedMouseRef.current.x += (mouseRef.current.x - smoothedMouseRef.current.x) * 0.08;
          smoothedMouseRef.current.y += (mouseRef.current.y - smoothedMouseRef.current.y) * 0.08;
        }
      } else {
        // Slow drift cursor if mouse is inactive
        smoothedMouseRef.current.x = -1000;
        smoothedMouseRef.current.y = -1000;
      }

      // Draw interactive dot grid
      const cols = Math.ceil(width / gridSpacing) + 1;
      const rows = Math.ceil(height / gridSpacing) + 1;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const bx = c * gridSpacing;
          const by = r * gridSpacing;

          // Add a very subtle sinus idle movement
          const waveX = Math.sin(time + r * 0.1) * 2;
          const waveY = Math.cos(time + c * 0.1) * 2;
          const originalX = bx + waveX;
          const originalY = by + waveY;

          let drawX = originalX;
          let drawY = originalY;
          let dotSize = baseDotSize;
          let isHighlighted = false;
          let opacityFactor = 1.0;

          if (smoothedMouseRef.current.x !== -1000) {
            const dx = originalX - smoothedMouseRef.current.x;
            const dy = originalY - smoothedMouseRef.current.y;
            const dist = Math.hypot(dx, dy);

            if (dist < maxRadius) {
              isHighlighted = true;
              const force = (maxRadius - dist) / maxRadius;
              
              // Push dots away slightly (Gravitational repulsion) or pull them (Attraction)
              // We'll pull them slightly to make it feel like a magnetic field fabric
              const pull = force * 16;
              drawX -= (dx / dist) * pull;
              drawY -= (dy / dist) * pull;

              // Increase dot size & opacity based on proximity
              dotSize = baseDotSize + force * 1.5;
              opacityFactor = 1.0 + force * 1.5;
            }
          }

          ctx.beginPath();
          ctx.arc(drawX, drawY, dotSize, 0, Math.PI * 2);
          
          if (isHighlighted) {
            ctx.fillStyle = activeDotColor;
            ctx.globalAlpha = Math.min(1.0, 0.4 * opacityFactor);
          } else {
            ctx.fillStyle = dotColor;
            ctx.globalAlpha = 0.5;
          }
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;

      // Soft light/dark glow overlay following cursor
      if (smoothedMouseRef.current.x !== -1000) {
        const radGlow = ctx.createRadialGradient(
          smoothedMouseRef.current.x,
          smoothedMouseRef.current.y,
          0,
          smoothedMouseRef.current.x,
          smoothedMouseRef.current.y,
          250
        );

        if (isDark) {
          radGlow.addColorStop(0, "rgba(223, 202, 160, 0.06)");
          radGlow.addColorStop(0.5, "rgba(32, 120, 85, 0.02)");
          radGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        } else {
          radGlow.addColorStop(0, "rgba(197, 168, 128, 0.08)");
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
