"use client";

import Link from "next/link";
import { useState } from "react";
import type { SalesforceProduct } from "@/lib/salesforce";
import { useCart } from "@/lib/cart-context";
import { formatGBP } from "@/lib/currency";

export default function ProductGrid({ products }: { products: SalesforceProduct[] }) {
  const { addItem } = useCart();
  const [addedKey, setAddedKey] = useState<string | null>(null);

  function handleAdd(product: SalesforceProduct) {
    if (product.productPrice == null) {
      return;
    }
    addItem({
      productKey: product.productKey,
      productName: product.productName,
      productImageUrl: product.productImageUrl,
      unitPrice: product.productPrice,
    });
    setAddedKey(product.productKey);
    setTimeout(() => setAddedKey((current) => (current === product.productKey ? null : current)), 1500);
  }

  return (
    <div className="product-list-grid">
      {products.map((product) => (
        <div className="product-card" key={product.productKey}>
          <Link href={`/products/${encodeURIComponent(product.productKey)}`} className="product-card-link">
            {product.productImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="product-card-image" src={product.productImageUrl} alt={product.productName} />
            ) : (
              <span className="product-card-image product-card-image-placeholder">🧸</span>
            )}
            <span className="product-card-name">{product.productName}</span>
          </Link>
          <span className="product-card-price">
            {product.productPrice != null ? formatGBP(product.productPrice) : "Price coming soon"}
          </span>
          <button
            type="button"
            disabled={product.productPrice == null}
            onClick={() => handleAdd(product)}
          >
            {addedKey === product.productKey ? "Added!" : "Add to basket"}
          </button>
        </div>
      ))}
    </div>
  );
}
