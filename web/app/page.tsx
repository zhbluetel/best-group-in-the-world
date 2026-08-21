"use client";

import { useState } from "react";

const PLUSHIES = [
  { value: "Ferris", label: "Ferris", emoji: "🦀" },
  { value: "Gordo", label: "Gordo", emoji: "🐹" },
  { value: "Duke", label: "Duke", emoji: "☕" },
  { value: "Slippy", label: "Slippy", emoji: "🐍" },
  { value: "Cammy", label: "Cammy", emoji: "🐫" },
];

type Status = "idle" | "submitting" | "success" | "error";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [plushies, setPlushies] = useState<string[]>([]);
  const [dreamPlushie, setDreamPlushie] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function togglePlushie(value: string) {
    setPlushies((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, plushies, dreamPlushie }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setName("");
      setEmail("");
      setCompany("");
      setPlushies([]);
      setDreamPlushie("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="container">
      <div className="hero">
        <h1>
          Plushie Pals are <span className="accent">coming soon</span>
        </h1>
        <p>Our huggable new range is almost here. Register your interest below and be first to know when we launch.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="company">
            Company <span className="hint" style={{ display: "inline" }}>(optional)</span>
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div className="field">
          <label>
            Which plushie(s) catch your eye?
            <span className="hint">Select all that appeal to you</span>
          </label>
          <div className="plushie-grid">
            {PLUSHIES.map((plushie) => (
              <label className="plushie-option" key={plushie.value}>
                <input
                  type="checkbox"
                  name="plushies"
                  value={plushie.value}
                  checked={plushies.includes(plushie.value)}
                  onChange={() => togglePlushie(plushie.value)}
                />
                <span className="card">
                  <span className="emoji">{plushie.emoji}</span> {plushie.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="dream-plushie">
            Dreaming of a plushie we haven&apos;t made yet?
            <span className="hint">Optional — tell us what you&apos;d love to see</span>
          </label>
          <textarea
            id="dream-plushie"
            name="dreamPlushie"
            placeholder="e.g. a grumpy hedgehog wearing tiny glasses"
            value={dreamPlushie}
            onChange={(e) => setDreamPlushie(e.target.value)}
          />
        </div>

        <button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Registering..." : "Register interest"}
        </button>

        <div className={`message ${status === "error" ? "error" : "success"}`}>
          {status === "success" && "Thanks for registering! We'll be in touch before launch."}
          {status === "error" && errorMessage}
        </div>
      </form>

      <footer>&copy; {new Date().getFullYear()} Plushie Pals. All rights reserved.</footer>
    </div>
  );
}
