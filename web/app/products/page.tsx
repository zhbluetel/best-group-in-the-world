import { getSalesforceAuth, getSalesforceProducts, SalesforceProduct } from "@/lib/salesforce";
import ProductGrid from "./product-grid";

export default async function ProductsPage() {
  let products: SalesforceProduct[] = [];
  let loadError = false;

  try {
    const auth = await getSalesforceAuth();
    products = await getSalesforceProducts(auth);
  } catch (err) {
    console.error("Failed to load Salesforce products:", err);
    loadError = true;
  }

  return (
    <div className="products-container">
      <div className="hero">
        <h1>Shop the range</h1>
        <p>Every plushie in the Plushie Pals family, ready to add to your basket.</p>
      </div>

      {loadError && <p className="hint">We couldn&apos;t load the product catalog. Please try again shortly.</p>}
      {!loadError && products.length === 0 && <p className="hint">No products are available yet.</p>}
      {!loadError && products.length > 0 && <ProductGrid products={products} />}
    </div>
  );
}
