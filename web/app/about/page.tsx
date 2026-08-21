import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us — Plushie Pals",
  description: "Meet the team behind Plushie Pals.",
};

export default function AboutPage() {
  return (
    <article className="about-container">
      <p className="about-eyebrow">About Us</p>
      <h1>Meet the team</h1>
      <figure className="about-card">
        <Image
          src="/images/George.jpg"
          alt="George"
          width={600}
          height={800}
          className="about-photo"
          priority
        />
        <figcaption>
          This is George. He Vibe Codes.
        </figcaption>
      </figure>
    </article>
  );
}
