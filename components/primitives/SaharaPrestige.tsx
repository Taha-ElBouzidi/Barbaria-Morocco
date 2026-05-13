"use client";

import { useEffect, useRef } from "react";

interface SaharaPrestigeProps {
  /** Pepita count, defaults to 45 (good for full-screen heroes). Reduce
   *  for smaller surfaces like bento cards to keep density visually right. */
  count?: number;
  /** Speed of the drifting glow in percent of surface per second. */
  speed?: number;
  className?: string;
}

/**
 * SaharaPrestige — the brand's "gold dust caught in moving light" effect
 * for dark/brown surfaces.
 *
 * Layers two things on top of whatever brown background the parent
 * provides:
 *   1. A radial gold glow that drifts continuously across the surface at
 *      constant velocity. Direction is randomly perturbed each frame, so
 *      the path never repeats. Reflects off the surface bounds (no edge
 *      pinning). No targets, no easing, no perceived stops.
 *   2. A non-uniform scatter of small gold pepitas (some four-point
 *      stars, some pinprick dust dots) that twinkle independently on
 *      randomised timings.
 *
 * The parent MUST be `position: relative` and `overflow-hidden`. The
 * effect is decorative (`aria-hidden`) and pointer-transparent, so it
 * sits beneath any interactive layer.
 *
 * Respects `prefers-reduced-motion`: stars and glow are still rendered,
 * but the glow stays put at a default position and the twinkle animation
 * still runs (CSS-driven, low cost). Tab visibility pauses the rAF loop.
 */
export default function SaharaPrestige({
  count = 45,
  speed = 3.5,
  className = "",
}: SaharaPrestigeProps) {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const pepitasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const glow = glowRef.current;
    const pepitas = pepitasRef.current;
    if (!glow || !pepitas) return;

    // Generate the pepita scatter. Mix of small four-point stars and
    // pinprick dust dots, weighted toward sparkles. Every parameter
    // (position, size, peak opacity, twinkle duration, start delay)
    // is randomised so the field never reads as a grid.
    const glyphs = ["✦", "✦", "✧", "⋆", "·"];
    for (let i = 0; i < count; i++) {
      const isDot = Math.random() < 0.35;
      const el = document.createElement("span");
      el.className = "sp-pepita" + (isDot ? " sp-dot" : "");
      if (!isDot) {
        el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      el.style.left = (Math.random() * 96 + 2).toFixed(2) + "%";
      el.style.top = (Math.random() * 96 + 2).toFixed(2) + "%";
      if (isDot) {
        el.style.setProperty("--size", (1.2 + Math.random() * 2.3).toFixed(1) + "px");
      } else {
        el.style.fontSize = (5 + Math.random() * 7).toFixed(1) + "px";
      }
      el.style.setProperty("--dur", (3.5 + Math.random() * 4).toFixed(2) + "s");
      el.style.setProperty("--delay", (-Math.random() * 5).toFixed(2) + "s");
      el.style.setProperty("--peak", (0.4 + Math.random() * 0.55).toFixed(2));
      pepitas.appendChild(el);
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // Pepitas still render and CSS twinkle still runs, but no JS drift.
      return () => {
        pepitas.innerHTML = "";
      };
    }

    // Constant-speed random walk for the glow. Velocity magnitude is
    // preserved each frame (rotation only); reflects off X/Y bounds.
    const TURN_RATE = 1.1; // max radians per second
    const BX = 36;
    const BY = 22;

    let x = (Math.random() - 0.5) * 30;
    let y = (Math.random() - 0.5) * 20;
    const a0 = Math.random() * Math.PI * 2;
    let vx = Math.cos(a0) * speed;
    let vy = Math.sin(a0) * speed;
    let last = performance.now();
    let rafId = 0;
    let running = true;

    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        last = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    function tick(now: number) {
      if (!running) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;

      const turn = (Math.random() - 0.5) * 2 * TURN_RATE * dt;
      const c = Math.cos(turn);
      const s = Math.sin(turn);
      const nvx = vx * c - vy * s;
      const nvy = vx * s + vy * c;
      vx = nvx;
      vy = nvy;

      x += vx * dt;
      y += vy * dt;

      if (x > BX) {
        x = BX;
        vx = -Math.abs(vx);
      }
      if (x < -BX) {
        x = -BX;
        vx = Math.abs(vx);
      }
      if (y > BY) {
        y = BY;
        vy = -Math.abs(vy);
      }
      if (y < -BY) {
        y = -BY;
        vy = Math.abs(vy);
      }

      glow!.style.setProperty("--gx", x.toFixed(2) + "%");
      glow!.style.setProperty("--gy", y.toFixed(2) + "%");
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", onVisibility);
      pepitas.innerHTML = "";
    };
  }, [count, speed]);

  return (
    <div
      className={`sp-root absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden
    >
      <div ref={glowRef} className="sp-glow" />
      <div ref={pepitasRef} className="sp-pepitas absolute inset-0" />
    </div>
  );
}
