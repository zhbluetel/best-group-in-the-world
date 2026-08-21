import type { Metadata } from "next";
import Link from "next/link";
import { getSalesforceAuth, getSalesforceProducts, SalesforceProduct } from "@/lib/salesforce";

export const metadata: Metadata = {
  title: "Plushie Pals — Cuddly Plushies, Happy Hearts",
  description:
    "Impossibly soft plushies, hand-finished in small numbered first runs. Explore the range and register your interest before we launch.",
};

export default async function Home() {
  let products: SalesforceProduct[] = [];

  try {
    const auth = await getSalesforceAuth();
    products = await getSalesforceProducts(auth);
  } catch (err) {
    console.error("Failed to load Salesforce products:", err);
  }

  const collage = products.filter((product) => product.productImageUrl).slice(0, 3);

  return (
    <div className="home-container">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-eyebrow">Coming soon</p>
          <h1>
            Cuddly plushies, <span className="accent">happy hearts</span>
          </h1>
          <p className="home-hero-lead">
            Plushie Pals is a small first run of impossibly soft, hand-finished characters, made to be loved hard.
            Register your interest and be first to know when the range launches.
          </p>
          <div className="home-hero-actions">
            <Link href="/register" className="home-cta-primary">
              Register interest
            </Link>
            <Link href="/product-information" className="home-cta-secondary">
              See product details
            </Link>
          </div>
        </div>

        {collage.length > 0 && (
          <div className="home-hero-collage" aria-hidden="true">
            {collage.map((product, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={product.productKey}
                src={product.productImageUrl!}
                alt=""
                className={`home-collage-item home-collage-item-${index}`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="home-products">
        <p className="home-eyebrow">Our products</p>
        <h2>Meet the range</h2>

        {products.length > 0 ? (
          <div className="home-products-grid">
            {products.map((product) => (
              <article key={product.productKey} className="home-product-card">
                <div className="home-product-image">
                  {product.productImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.productImageUrl} alt={product.productName} />
                  ) : (
                    <span className="emoji">🧸</span>
                  )}
                </div>
                <h3>{product.productName}</h3>
                <p className="home-product-badge">Coming soon</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="hint">The range is being finalized — check back soon, or register below to hear first.</p>
        )}

        <div className="home-products-cta">
          <Link href="/register" className="home-cta-primary">
            Register your interest
          </Link>
          <Link href="/product-information" className="home-cta-secondary">
            Full product details
          </Link>
        </div>
      </section>
    </div>
  );
}
