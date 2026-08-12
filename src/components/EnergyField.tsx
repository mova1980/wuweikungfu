"use client";
import { useEffect, useRef } from "react";

/**
 * "Living Energy Field" — a full-page canvas:
 *  - Particles are tiny glyphs of 無為功夫 (WU WEI KUNG FU) — a subtle,
 *    elegant matrix of the brand's Chinese characters drifting like stars.
 *  - On load they are magnetically attracted from the edges toward the center.
 *  - The mouse drags a golden "chi" light trail across the page.
 *  - Mood-aware: calm mode turns them indigo-blue & slow; aggressive red & fast.
 *  Motion, colors, twinkle and connective field lines are identical to the
 *  original star field — only the particle shape changed.
 */

const GLYPHS = ["無", "為", "功", "夫"];

export default function EnergyField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let raf = 0;
    const mouse = { x: w / 2, y: h / 2, active: false };
    const trail: { x: number; y: number; life: number }[] = [];
    const born = performance.now();

    const N = Math.min(110, Math.floor((w * h) / 16000));
    type P = {
      x: number; y: number; vx: number; vy: number;
      r: number;          // size scale (font size derives from it)
      hue: number;        // 0 = gold, 1 = cinnabar
      phase: number; arc: number;
      ch: string;         // the glyph this particle carries
      rot: number;        // fixed tiny rotation for organic feel
    };
    const particles: P[] = Array.from({ length: N }, (_, i) => {
      // start at the edges (magnetic filings)
      const side = i % 4;
      const x = side === 0 ? -20 : side === 1 ? w + 20 : Math.random() * w;
      const y = side === 2 ? -20 : side === 3 ? h + 20 : Math.random() * h;
      return {
        x, y,
        vx: 0, vy: 0,
        r: 0.8 + Math.random() * 2.2,
        hue: Math.random() < 0.82 ? 0 : 1,
        phase: Math.random() * Math.PI * 2,
        arc: 0.4 + Math.random() * 1.2,
        ch: GLYPHS[i % GLYPHS.length],
        rot: (Math.random() - 0.5) * 0.5, // ±~14° — subtle, keeps it tidy
      };
    });

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      trail.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (trail.length > 60) trail.shift();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove);

    const colorOf = (p: P, mood: string, a: number) => {
      if (mood === "calm") return `rgba(111,159,216,${a})`;
      if (mood === "aggr") return p.hue ? `rgba(224,75,70,${a})` : `rgba(240,180,90,${a})`;
      return p.hue ? `rgba(196,30,36,${a})` : `rgba(201,168,76,${a})`;
    };

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // canvas cannot resolve CSS var() in ctx.font — read the real family name
    // of the Noto Sans SC font loaded by next/font, with safe CJK fallbacks
    const notoFamily =
      getComputedStyle(document.documentElement).getPropertyValue("--font-noto-sc").trim() ||
      '"Noto Sans SC"';
    const fontStack = `${notoFamily}, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`;

    const tick = (now: number) => {
      const mood = document.documentElement.dataset.mood || "neutral";
      const speed = mood === "aggr" ? 1.8 : mood === "calm" ? 0.45 : 1;
      ctx.clearRect(0, 0, w, h);

      // chi trail
      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        t.life -= 0.02;
        if (t.life <= 0) continue;
        const g = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, 26 * t.life);
        const c = mood === "calm" ? "111,159,216" : "232,207,127";
        g.addColorStop(0, `rgba(${c},${0.16 * t.life})`);
        g.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 26 * t.life, 0, Math.PI * 2);
        ctx.fill();
      }

      const settle = Math.min(1, (now - born) / 2600); // initial magnetic pull
      const cx = w / 2, cy = h / 2;

      for (const p of particles) {
        // magnetic attraction to center at load, then drift in punch-arc paths
        const dx = cx - p.x, dy = cy - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = (1 - settle) * 0.05 + 0.0004;
        p.vx += (dx / dist) * pull;
        p.vy += (dy / dist) * pull;

        // arc motion — traces the curve of a strike
        p.phase += 0.01 * speed * p.arc;
        p.vx += Math.cos(p.phase) * 0.02 * speed;
        p.vy += Math.sin(p.phase * 1.3) * 0.02 * speed;

        // gentle mouse magnetism
        if (mouse.active) {
          const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
          const md = Math.hypot(mdx, mdy);
          if (md < 180 && md > 1) {
            p.vx += (mdx / md) * 0.015 * speed;
            p.vy += (mdy / md) * 0.015 * speed;
          }
        }

        p.vx *= 0.965;
        p.vy *= 0.965;
        p.x += p.vx * speed * 2;
        p.y += p.vy * speed * 2;

        if (p.x < -40) p.x = w + 30;
        if (p.x > w + 40) p.x = -30;
        if (p.y < -40) p.y = h + 30;
        if (p.y > h + 40) p.y = -30;

        // same twinkle as the original stars
        const a = 0.25 + 0.3 * Math.abs(Math.sin(p.phase));

        // tiny glyph instead of a dot — size maps from the old star radius
        const fs = 6 + p.r * 3.2; // ≈ 8.5–13px, star-scale
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.font = `${fs.toFixed(1)}px ${fontStack}`;
        ctx.fillStyle = colorOf(p, mood, a);
        ctx.fillText(p.ch, 0, 0);
        ctx.restore();
      }

      // connective threads (the field lines)
      ctx.lineWidth = 0.4;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < i + 5 && j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            const c = mood === "calm" ? "111,159,216" : "201,168,76";
            ctx.strokeStyle = `rgba(${c},${0.09 * (1 - d / 130)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-70"
    />
  );
}
