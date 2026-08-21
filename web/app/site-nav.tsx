"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/register", label: "Register Interest" },
  { href: "/product-information", label: "Product Information" },
  { href: "/about", label: "About Us" },
  { href: "/legal", label: "Legal" }
];

/**
 * Site header bar. Rendered by the root layout on every page so that secondary
 * pages are reachable without individual page components having to link them.
 */
export default function SiteNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand">
          <Image src="/images/logo.png" alt="Plushie Pals" width={44} height={44} priority />
          <span>Plushie Pals</span>
        </Link>
        <nav aria-label="Main">
          <ul className="site-nav">
            {LINKS.map((link) => {
              const isCurrent = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link href={link.href} aria-current={isCurrent ? "page" : undefined}>
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href="/basket" aria-current={pathname === "/basket" ? "page" : undefined}>
                Basket{itemCount > 0 ? ` (${itemCount})` : ""}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
