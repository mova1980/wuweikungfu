"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Cinematic hero slideshow — real photos of Sifu Shayanfar,
 * graded in the site's black & gold theme.
 * Transition: deep crossfade + Ken Burns drift + a golden energy sweep.
 */
const SLIDES = ["/images/sifu-hero1.jpg", "/images/sifu-hero2.jpg", "/images/sifu-hero3.jpg"];
const DURATION = 7000;

export default function HeroMedia() {
  const [active, setActive] = useState(0);
  const [sweep, setSweep] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setActive((a) => (a + 1) % SLIDES.length);
      setSweep((s) => s + 1);
    }, DURATION);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black" aria-hidden>
      {SLIDES.map((src, i) => {
        const on = i === active;
        return (
          <div
            key={src}
            className="absolute inset-0 transition-all duration-[2200ms]"
            style={{
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
              opacity: on ? 1 : 0,
              transform: on ? "scale(1)" : "scale(1.09)",
              filter: on ? "blur(0px) brightness(1)" : "blur(12px) brightness(0.55)",
            }}
          >
            <div className={`h-full w-full ${on ? "kenburns" : ""}`}>
              <Image src={src} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
            </div>
          </div>
        );
      })}

      {/* golden chi sweep — replays on every slide change */}
      {sweep > 0 && <div key={sweep} className="gold-sweep pointer-events-none absolute inset-0" />}

      {/* slide indicator */}
      <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <span key={i} className={`h-1 rounded-full transition-all duration-700 ${i === active ? "w-8 bg-[#c9a84c]" : "w-3 bg-white/25"}`} />
        ))}
      </div>
    </div>
  );
}
