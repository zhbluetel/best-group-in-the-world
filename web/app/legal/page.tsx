import type { Metadata } from "next";
import { DISCLAIMER, DOCUMENT, SECTIONS } from "./content";
import type { LegalBlock, LegalClause, LegalSection } from "./content";

export const metadata: Metadata = {
  title: "Legal — Plushie Pals",
  description: "The BluePlush master plush services, emotional infrastructure, and yarn sovereignty agreement.",
};

/**
 * Renders one content block. Kept exhaustive over the LegalBlock union so a new
 * block kind fails the type check rather than silently rendering nothing.
 */
function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case "text":
      return <p>{block.text}</p>;

    case "list":
      return (
        <ul className="legal-list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr>
                {block.headers.map((header) => (
                  <th key={header} scope="col">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell, index) => (
                    <td key={`${index}-${cell}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "diagram":
      return (
        <figure className="legal-diagram">
          <pre>{block.content}</pre>
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );

    case "terms":
      return (
        <div className="legal-terms">
          <p>{block.intro}</p>
          <ul className={`term-chips ${block.tone}`}>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      );

    case "signature":
      return (
        <div className="legal-signature">
          <h3>{block.party}</h3>
          <dl>
            {block.fields.map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.value ?? "______________________________"}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
  }
}

/** Renders a numbered provision with its optional short heading. */
function Clause({ clause }: { clause: LegalClause }) {
  return (
    <div className="legal-clause">
      <p className="legal-clause-title">
        {clause.number && <span className="legal-clause-number">{clause.number}</span>}
        {clause.heading && <span className="legal-clause-heading">{clause.heading}.</span>}
      </p>
      {clause.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

/** Renders one article or exhibit, with an anchor target for the contents list. */
function Section({ section }: { section: LegalSection }) {
  return (
    <section className="legal-section" id={section.id}>
      <h2>
        {section.label && <span className="legal-section-label">{section.label}</span>}
        {section.title}
      </h2>
      {section.intro?.map((block, index) => <Block key={index} block={block} />)}
      {section.clauses?.map((clause) => <Clause key={clause.number ?? clause.heading} clause={clause} />)}
    </section>
  );
}

/**
 * Legal page. Statically rendered from the structured document in `content.ts`,
 * with an in-page contents list for navigating the articles and exhibits.
 */
export default function LegalPage() {
  return (
    <article className="legal-container">
      <header className="legal-header">
        <p className="legal-eyebrow">Legal</p>
        <h1>{DOCUMENT.title}</h1>
        <p className="legal-entity">{DOCUMENT.entity}</p>
        <dl className="legal-meta">
          {DOCUMENT.meta.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <nav className="legal-toc" aria-label="Contents">
        <h2>Contents</h2>
        <ol>
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>
                {section.label ? `${section.label} — ${section.title}` : section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {SECTIONS.map((section) => (
        <Section key={section.id} section={section} />
      ))}

      <aside className="legal-disclaimer">
        <h2>Please read this bit</h2>
        <p>{DISCLAIMER}</p>
      </aside>
    </article>
  );
}
