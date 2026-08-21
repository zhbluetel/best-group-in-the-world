import type { Metadata } from "next";
import SiteNav from "./site-nav";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plushie Pals — Coming Soon",
  description: "Register your interest in the Plushie Pals range before launch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SiteNav />
          <main className="site-main">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
