"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const PHOTOS = [
  { src: "/images/George.jpg", alt: "George" },
  { src: "/images/Amber.png", alt: "Amber" },
  { src: "/images/Charlie.png", alt: "Charlie" },
  { src: "/images/Dan1.png", alt: "Dan" },
  { src: "/images/Dan2.png", alt: "Dan" },
  { src: "/images/Zac.png", alt: "Zac" },
];

const MIN_DELAY_MS = 15000;
const MAX_DELAY_MS = 45000;
const SCARE_DURATION_MS = 500;

/** Randomly flashes a random team photo full-screen, then hides it and reschedules. */
export default function JumpScare() {
  const [photo, setPhoto] = useState<(typeof PHOTOS)[number] | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let delayId: ReturnType<typeof setTimeout>;
    let hideId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
      delayId = setTimeout(() => {
        setPhoto(PHOTOS[Math.floor(Math.random() * PHOTOS.length)]);
        hideId = setTimeout(() => {
          setPhoto(null);
          scheduleNext();
        }, SCARE_DURATION_MS);
      }, delay);
    };

    scheduleNext();

    return () => {
      clearTimeout(delayId);
      clearTimeout(hideId);
    };
  }, []);

  if (!photo) return null;

  return (
    <div className="jump-scare" aria-hidden="true">
      <Image src={photo.src} alt={photo.alt} fill priority sizes="100vw" style={{ objectFit: "cover" }} />
    </div>
  );
}
