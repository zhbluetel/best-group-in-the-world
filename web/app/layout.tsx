import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
