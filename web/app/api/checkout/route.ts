import { NextRequest, NextResponse } from "next/server";
import { getSalesforceAuth, getSalesforceProducts } from "@/lib/salesforce";
import { getStripeClient } from "@/lib/stripe";

interface CheckoutRequestBody {
  items?: unknown;
}

interface CheckoutItem {
  productKey: string;
  quantity: number;
}

function isValidItems(items: unknown): items is CheckoutItem[] {
  return (
    Array.isArray(items) &&
    items.length > 0 &&
    items.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as CheckoutItem).productKey === "string" &&
        typeof (item as CheckoutItem).quantity === "number" &&
        (item as CheckoutItem).quantity > 0,
    )
  );
}

export async function POST(request: NextRequest) {
  let body: CheckoutRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValidItems(body.items)) {
    return NextResponse.json({ error: "At least one basket item is required." }, { status: 400 });
  }

  const requestedItems = body.items;

  try {
    const auth = await getSalesforceAuth();
    const products = await getSalesforceProducts(auth);
    const productByKey = new Map(products.map((p) => [p.productKey, p]));

    const lineItems = [];
    for (const item of requestedItems) {
      const product = productByKey.get(item.productKey);
      if (!product || product.productPrice == null) {
        return NextResponse.json(
          { error: `"${item.productKey}" is not available for purchase.` },
          { status: 400 },
        );
      }

      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: "gbp",
          unit_amount: Math.round(product.productPrice * 100),
          product_data: {
            name: product.productName,
            images: product.productImageUrl ? [product.productImageUrl] : undefined,
          },
        },
      });
    }

    const origin = request.headers.get("origin") || new URL(request.url).origin;
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/basket`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Failed to create Stripe checkout session:", err);
    return NextResponse.json({ error: "Failed to start checkout. Please try again." }, { status: 502 });
  }
}
