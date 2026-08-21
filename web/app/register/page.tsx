import { getSalesforceAuth, getSalesforceProducts, SalesforceProduct } from "@/lib/salesforce";
import RegistrationForm from "./registration-form";

export default async function Home() {
  let products: SalesforceProduct[] = [];

  try {
    const auth = await getSalesforceAuth();
    products = await getSalesforceProducts(auth);
  } catch (err) {
    console.error("Failed to load Salesforce products:", err);
  }

  return <RegistrationForm products={products} />;
}
