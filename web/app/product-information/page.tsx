import type { Metadata } from "next";
import Link from "next/link";
import { DETAILS, HIGHLIGHTS, SPEC_CARD, WHY } from "./content";

export const metadata: Metadata = {
  title: "Product Information — Plushie Pals",
  description:
    "How the Plushie Pals range is made: hand-finished, impossibly soft plushies in small numbered first runs, plus the full specification."
};

/**
 * Product Information page. Statically rendered from the structured copy in
 * `content.ts`: the qualities shared across the range, then the specification.
 */
export default function ProductInformationPage() {
  return (
    <article className="product-container">
      <section className="product-section">
        <p className="product-eyebrow">{WHY.eyebrow}</p>
        <h1>{WHY.title}</h1>
        <p className="product-lead">{WHY.intro}</p>
        <div className="product-highlights">
          {HIGHLIGHTS.map((highlight) => (
            <article key={highlight.title} className="product-highlight">
              <h2>{highlight.title}</h2>
              <p>{highlight.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="product-section">
        <p className="product-eyebrow">{DETAILS.eyebrow}</p>
        <h2 className="product-heading">{DETAILS.title}</h2>
        {DETAILS.body.map((paragraph) => (
          <p key={paragraph} className="product-lead">
            {paragraph}
          </p>
        ))}
        <Link href="/" className="product-cta">
          Join the waitlist
        </Link>

        <div className="product-spec-card">
          <h3>{SPEC_CARD.title}</h3>
          <p className="product-spec-intro">{SPEC_CARD.intro}</p>
          <dl className="product-spec-list">
            {SPEC_CARD.specs.map((spec) => (
              <div key={spec.term}>
                <dt>{spec.term}</dt>
                <dd>{spec.detail}</dd>
              </div>
            ))}
          </dl>
          <p className="product-spec-footnote">{SPEC_CARD.footnote}</p>
        </div>
      </section>
    </article>
  );
}
