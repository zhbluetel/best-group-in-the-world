"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface BubbleConfig {
  src: string;
  alt: string;
  baseSize: number;
  pulse: number;
}

const BUBBLES: BubbleConfig[] = [
  { src: "/images/George.jpg", alt: "George", baseSize: 90, pulse: 18 },
  { src: "/images/Amber.png", alt: "Amber", baseSize: 70, pulse: 14 },
  { src: "/images/Charlie.png", alt: "Charlie", baseSize: 110, pulse: 22 },
  { src: "/images/Dan1.png", alt: "Dan", baseSize: 65, pulse: 13 },
  { src: "/images/Dan2.png", alt: "Dan", baseSize: 100, pulse: 20 },
  { src: "/images/Zac.png", alt: "Zac", baseSize: 80, pulse: 16 },
];

const SPEED = 90;
const PULSE_PERIOD = 4;

/**
 * One bubble bouncing around the viewport, DVD-logo style. Position and size
 * are written straight to the DOM every frame (skipping React state) so the
 * animation stays smooth; the bounding box used for wall collisions is
 * recomputed each frame from the bubble's current pulsing size.
 */
function Bubble({ config }: { config: BubbleConfig }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const sizeEl = sizeRef.current;
    if (!wrap || !sizeEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const maxSize = config.baseSize + config.pulse;
    let x = Math.random() * (window.innerWidth - maxSize);
    let y = Math.random() * (window.innerHeight - maxSize);
    const angle = Math.random() * Math.PI * 2;
    let dx = Math.cos(angle) * SPEED;
    let dy = Math.sin(angle) * SPEED;
    const pulseFreq = (Math.PI * 2) / PULSE_PERIOD;
    const pulsePhase = Math.random() * Math.PI * 2;
    let elapsed = Math.random() * PULSE_PERIOD;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      elapsed += dt;

      const size = config.baseSize + Math.sin(elapsed * pulseFreq + pulsePhase) * config.pulse;

      x += dx * dt;
      y += dy * dt;

      const maxX = window.innerWidth - size;
      const maxY = window.innerHeight - size;

      if (x <= 0) {
        x = 0;
        dx = Math.abs(dx);
      } else if (x >= maxX) {
        x = maxX;
        dx = -Math.abs(dx);
      }

      if (y <= 0) {
        y = 0;
        dy = Math.abs(dy);
      } else if (y >= maxY) {
        y = maxY;
        dy = -Math.abs(dy);
      }

      wrap.style.transform = `translate(${x}px, ${y}px)`;
      sizeEl.style.width = `${size}px`;
      sizeEl.style.height = `${size}px`;

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [config]);

  return (
    <div ref={wrapRef} className="floating-bubble" aria-hidden="true">
      <div ref={sizeRef} className="floating-bubble-size" style={{ width: config.baseSize, height: config.baseSize }}>
        <Image
          src={config.src}
          alt={config.alt}
          fill
          sizes={`${config.baseSize + config.pulse}px`}
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
}

/** Floats George and the team's photos around the viewport endlessly. */
export default function FloatingBubbles() {
  return (
    <>
      {BUBBLES.map((bubble) => (
        <Bubble key={bubble.src} config={bubble} />
      ))}
    </>
  );
}
