"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatGBP } from "@/lib/currency";

export default function BasketPage() {
  const { items, subtotal, removeItem, setQuantity } = useCart();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleCheckout() {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productKey: item.productKey, quantity: item.quantity })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      window.location.href = data.url;
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (items.length === 0) {
    return (
      <div className="basket-container">
        <h1>Your basket</h1>
        <p className="hint">Your basket is empty.</p>
        <Link href="/products">Browse the range &rarr;</Link>
      </div>
    );
  }

  return (
    <div className="basket-container">
      <h1>Your basket</h1>

      <ul className="basket-list">
        {items.map((item) => (
          <li className="basket-item" key={item.productKey}>
            {item.productImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="basket-item-image" src={item.productImageUrl} alt={item.productName} />
            ) : (
              <span className="basket-item-image product-card-image-placeholder">🧸</span>
            )}
            <div className="basket-item-details">
              <span className="basket-item-name">{item.productName}</span>
              <span className="hint">{formatGBP(item.unitPrice)} each</span>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => setQuantity(item.productKey, Math.max(1, Number(e.target.value) || 1))}
            />
            <span className="basket-item-line-total">{formatGBP(item.unitPrice * item.quantity)}</span>
            <button type="button" className="basket-item-remove" onClick={() => removeItem(item.productKey)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="basket-summary">
        <span>Subtotal</span>
        <span>{formatGBP(subtotal)}</span>
      </div>

      <button type="button" onClick={handleCheckout} disabled={status === "submitting"}>
        {status === "submitting" ? "Redirecting to checkout..." : "Checkout with Stripe"}
      </button>

      {status === "error" && <div className="message error">{errorMessage}</div>}
    </div>
  );
}
