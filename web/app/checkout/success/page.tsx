import Link from "next/link";
import { getStripeClient } from "@/lib/stripe";
import { formatGBP } from "@/lib/currency";
import ClearCart from "./clear-cart";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return (
      <div className="basket-container">
        <h1>Order not found</h1>
        <p className="hint">No checkout session was provided.</p>
        <Link href="/products">Back to products &rarr;</Link>
      </div>
    );
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return (
        <div className="basket-container">
          <h1>Payment not completed</h1>
          <p className="hint">This order has not been paid for yet.</p>
          <Link href="/basket">Back to basket &rarr;</Link>
        </div>
      );
    }

    const lineItems = session.line_items?.data || [];

    return (
      <div className="basket-container">
        <ClearCart />
        <h1>Thank you for your order!</h1>
        <p className="hint">A confirmation has been sent to {session.customer_details?.email || "your email"}.</p>

        <ul className="basket-list">
          {lineItems.map((lineItem) => (
            <li className="basket-item" key={lineItem.id}>
              <div className="basket-item-details">
                <span className="basket-item-name">{lineItem.description}</span>
                <span className="hint">Qty {lineItem.quantity}</span>
              </div>
              <span className="basket-item-line-total">{formatGBP((lineItem.amount_total || 0) / 100)}</span>
            </li>
          ))}
        </ul>

        <div className="basket-summary">
          <span>Total paid</span>
          <span>{formatGBP((session.amount_total || 0) / 100)}</span>
        </div>

        <Link href="/products">Continue shopping &rarr;</Link>
      </div>
    );
  } catch (err) {
    console.error("Failed to retrieve Stripe checkout session:", err);
    return (
      <div className="basket-container">
        <h1>Order not found</h1>
        <p className="hint">We couldn&apos;t find that order. If you were charged, please contact us.</p>
        <Link href="/products">Back to products &rarr;</Link>
      </div>
    );
  }
}
