"use client";

import { useState } from "react";
import Image from "next/image";
import type { SalesforceProduct } from "@/lib/salesforce";

type Status = "idle" | "submitting" | "success" | "error";

export default function RegistrationForm({ products }: { products: SalesforceProduct[] }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [productKeys, setProductKeys] = useState<string[]>([]);
  const [dreamPlushie, setDreamPlushie] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function toggleProduct(productKey: string) {
    setProductKeys((current) =>
      current.includes(productKey) ? current.filter((key) => key !== productKey) : [...current, productKey],
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
        body: JSON.stringify({ firstName, lastName, email, company, productKeys, dreamPlushie }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setFirstName("");
      setLastName("");
      setEmail("");
      setCompany("");
      setProductKeys([]);
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
          <label htmlFor="first-name">First name</label>
          <input
            type="text"
            id="first-name"
            name="firstName"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="last-name">Last name</label>
          <input
            type="text"
            id="last-name"
            name="lastName"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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
          {products.length > 0 ? (
            <div className="plushie-grid">
              {products.map((product) => (
                <label className="plushie-option" key={product.productKey}>
                  <input
                    type="checkbox"
                    name="productKeys"
                    value={product.productKey}
                    checked={productKeys.includes(product.productKey)}
                    onChange={() => toggleProduct(product.productKey)}
                  />
                  <span className="card">
                    {product.productImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="product-image" src={product.productImageUrl} alt={product.productName} />
                    ) : (
                      <span className="emoji">🧸</span>
                    )}{" "}
                    {product.productName}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="hint">Check back soon &mdash; the range is being finalized.</p>
          )}
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

        <div className="ssl-badge">
          <Image src="/images/SSLcertificate.png" alt="SSL secured" width={135} height={60} />
        </div>

        <div className={`message ${status === "error" ? "error" : "success"}`}>
          {status === "success" && "Thanks for registering! We'll be in touch before launch."}
          {status === "error" && errorMessage}
        </div>
      </form>

      <footer>&copy; {new Date().getFullYear()} Plushie Pals. All rights reserved.</footer>
    </div>
  );
}
