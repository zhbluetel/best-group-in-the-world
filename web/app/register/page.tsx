import type { Metadata } from "next";
import { getSalesforceAuth, getSalesforceProducts, SalesforceProduct } from "@/lib/salesforce";
import RegistrationForm from "./registration-form";

export const metadata: Metadata = {
  title: "Register Interest — Plushie Pals",
  description: "Register your interest in the Plushie Pals range before launch.",
};

export default async function RegisterPage() {
  let products: SalesforceProduct[] = [];

  try {
    const auth = await getSalesforceAuth();
    products = await getSalesforceProducts(auth);
  } catch (err) {
    console.error("Failed to load Salesforce products:", err);
  }

  return <RegistrationForm products={products} />;
}
