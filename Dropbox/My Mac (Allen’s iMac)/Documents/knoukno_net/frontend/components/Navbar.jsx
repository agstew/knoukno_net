"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/price", label: "Price" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" }
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="app-navbar navbar navbar-expand-lg px-3 py-2">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand text-white fw-bold d-flex gap-2 align-items-center">
          <span className="brand-chip">KnoUKno.net</span>
        </Link>
        <div className="d-flex gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`btn btn-sm ${pathname === item.href ? "btn-warning" : "btn-outline-light"}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
