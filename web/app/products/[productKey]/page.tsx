import { notFound } from "next/navigation";
import { getSalesforceAuth, getSalesforceProducts } from "@/lib/salesforce";
import ProductDetail from "./product-detail";

export default async function ProductDetailPage({ params }: { params: { productKey: string } }) {
  let product;

  try {
    const auth = await getSalesforceAuth();
    const products = await getSalesforceProducts(auth);
    product = products.find((p) => p.productKey === params.productKey);
  } catch (err) {
    console.error("Failed to load Salesforce products:", err);
    notFound();
  }

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
