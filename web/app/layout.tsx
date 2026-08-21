import type { Metadata } from "next";
import SiteNav from "./site-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plushie Pals — Cuddly Plushies, Happy Hearts",
  description:
    "Impossibly soft plushies, hand-finished in small numbered first runs. Explore the range and register your interest before we launch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
