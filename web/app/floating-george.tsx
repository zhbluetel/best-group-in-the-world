"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const SIZE = 90;
const SPEED = 90;

/**
 * Bounces George around the viewport, DVD-logo style, using a
 * requestAnimationFrame loop that writes directly to the element's transform
 * (skipping React state) so the animation stays smooth every frame.
 */
export default function FloatingGeorge() {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = elRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = Math.random() * (window.innerWidth - SIZE);
    let y = Math.random() * (window.innerHeight - SIZE);
    const angle = Math.random() * Math.PI * 2;
    let dx = Math.cos(angle) * SPEED;
    let dy = Math.sin(angle) * SPEED;
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      x += dx * dt;
      y += dy * dt;

      const maxX = window.innerWidth - SIZE;
      const maxY = window.innerHeight - SIZE;

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

      node.style.transform = `translate(${x}px, ${y}px)`;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div ref={elRef} className="floating-george" aria-hidden="true">
      <Image src="/images/George.jpg" alt="" width={SIZE} height={SIZE} />
    </div>
  );
}
