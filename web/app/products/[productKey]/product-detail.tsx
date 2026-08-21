"use client";

import Link from "next/link";
import { useState } from "react";
import type { SalesforceProduct } from "@/lib/salesforce";
import { useCart } from "@/lib/cart-context";
import { formatGBP } from "@/lib/currency";

export default function ProductDetail({ product }: { product: SalesforceProduct }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (product.productPrice == null) {
      return;
    }
    addItem(
      {
        productKey: product.productKey,
        productName: product.productName,
        productImageUrl: product.productImageUrl,
        unitPrice: product.productPrice,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="product-detail-container">
      <Link href="/products" className="hint">
        &larr; Back to all products
      </Link>

      <div className="product-detail">
        {product.productImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="product-detail-image" src={product.productImageUrl} alt={product.productName} />
        ) : (
          <span className="product-detail-image product-card-image-placeholder">🧸</span>
        )}

        <div className="product-detail-info">
          <h1>{product.productName}</h1>
          <p className="product-detail-price">
            {product.productPrice != null ? formatGBP(product.productPrice) : "Price coming soon"}
          </p>

          <div className="product-detail-quantity">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>

          <button type="button" disabled={product.productPrice == null} onClick={handleAdd}>
            {added ? "Added!" : "Add to basket"}
          </button>
        </div>
      </div>
    </div>
  );
}
