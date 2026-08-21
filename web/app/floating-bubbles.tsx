"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";

import { playAirHorn } from "./air-horn";

interface BubbleConfig {
  src: string;
  alt: string;
  minSize: number;
  maxSize: number;
}

const BUBBLES: BubbleConfig[] = [
  { src: "/images/George.jpg", alt: "George", minSize: 90, maxSize: 460 },
  { src: "/images/Amber.png", alt: "Amber", minSize: 70, maxSize: 380 },
  { src: "/images/Charlie.png", alt: "Charlie", minSize: 110, maxSize: 520 },
  { src: "/images/Dan1.png", alt: "Dan", minSize: 65, maxSize: 340 },
  { src: "/images/Dan2.png", alt: "Dan", minSize: 100, maxSize: 480 },
  { src: "/images/Zac.png", alt: "Zac", minSize: 80, maxSize: 400 }
];

const SPEED = 90;
const MIN_PULSE_PERIOD = 4;
const MAX_PULSE_PERIOD = 8;

const SMALLEST_SIZE = Math.min(...BUBBLES.map((bubble) => bubble.minSize));
const LARGEST_SIZE = Math.max(...BUBBLES.map((bubble) => bubble.maxSize));
const HIGHEST_PITCH = 2.2;
const LOWEST_PITCH = 0.55;

/**
 * Maps a bubble's on-screen size to an air-horn pitch multiplier: the smallest
 * bubble any config can reach sounds at HIGHEST_PITCH, the largest at
 * LOWEST_PITCH. Interpolation is geometric in both size and pitch so equal
 * visual size ratios give equal musical intervals.
 *
 * @param size The bubble's current diameter in pixels.
 * @returns The pitch multiplier to pass to the air horn.
 */
function pitchForSize(size: number): number {
  const clamped = Math.min(Math.max(size, SMALLEST_SIZE), LARGEST_SIZE);
  const t = Math.log(clamped / SMALLEST_SIZE) / Math.log(LARGEST_SIZE / SMALLEST_SIZE);
  return HIGHEST_PITCH * Math.pow(LOWEST_PITCH / HIGHEST_PITCH, t);
}

/**
 * One bubble bouncing around the viewport, DVD-logo style. Position and size
 * are written straight to the DOM every frame (skipping React state) so the
 * animation stays smooth; the bounding box used for wall collisions is
 * recomputed each frame from the bubble's current pulsing size, which swings
 * between minSize and maxSize on its own randomized period. Clicking the bubble
 * sounds an air horn pitched to whatever size it currently is.
 */
function Bubble({ config }: { config: BubbleConfig }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const currentSizeRef = useRef(config.minSize);

  const handleClick = useCallback(() => {
    playAirHorn(pitchForSize(currentSizeRef.current));
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const sizeEl = sizeRef.current;
    if (!wrap || !sizeEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = Math.random() * Math.max(window.innerWidth - config.maxSize, 0);
    let y = Math.random() * Math.max(window.innerHeight - config.maxSize, 0);
    const angle = Math.random() * Math.PI * 2;
    let dx = Math.cos(angle) * SPEED;
    let dy = Math.sin(angle) * SPEED;
    const period = MIN_PULSE_PERIOD + Math.random() * (MAX_PULSE_PERIOD - MIN_PULSE_PERIOD);
    const pulseFreq = (Math.PI * 2) / period;
    const pulsePhase = Math.random() * Math.PI * 2;
    let elapsed = Math.random() * period;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      elapsed += dt;

      const t = 0.5 + 0.5 * Math.sin(elapsed * pulseFreq + pulsePhase);
      const size = config.minSize + (config.maxSize - config.minSize) * t;
      currentSizeRef.current = size;

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
    <div ref={wrapRef} className="floating-bubble">
      <div
        ref={sizeRef}
        className="floating-bubble-size"
        style={{ width: config.minSize, height: config.minSize }}
        role="button"
        tabIndex={0}
        aria-label={`Sound the air horn for ${config.alt}`}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
          }
        }}
      >
        <Image src={config.src} alt={config.alt} fill sizes={`${config.maxSize}px`} style={{ objectFit: "cover" }} />
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
