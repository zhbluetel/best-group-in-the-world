"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/legal", label: "Legal" }
];

/**
 * Site header bar. Rendered by the root layout on every page so that secondary
 * pages are reachable without individual page components having to link them.
 */
export default function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand">
          Plushie Pals
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
          </ul>
        </nav>
      </div>
    </header>
  );
}
