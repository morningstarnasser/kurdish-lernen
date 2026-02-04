"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  xp: number;
  streak: number;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // User not authenticated
      }
    }
    fetchUser();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      setLoggingOut(false);
    }
  }

  const navLinks = [
    { href: "/dashboard/dictionary", label: "Wörterbuch", icon: "\uD83D\uDCDA" },
    { href: "/dashboard/learn", label: "Lernen", icon: "\uD83C\uDFAE" },
    { href: "/dashboard/profile", label: "Profil", icon: "\uD83D\uDC64" },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-[var(--border)] pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="no-underline flex items-center gap-2">
            <span className="text-2xl font-black text-green">Ferheng</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`no-underline flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-green-bg text-green-dark border-2 border-green/30"
                    : "text-[var(--gray-400)] hover:bg-[var(--gray-50)] hover:text-[var(--gray-600)] border-2 border-transparent"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Stats + Logout (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-4">
                {/* Streak */}
                <div className="flex items-center gap-1.5 bg-[var(--gold)]/10 px-3 py-1.5 rounded-xl">
                  <span className="text-lg" title="Streak">
                    &#x1F525;
                  </span>
                  <span className="text-sm font-extrabold text-[var(--gold-dark)]">
                    {user.streak || 0}
                  </span>
                </div>

                {/* XP */}
                <div className="flex items-center gap-1.5 bg-[var(--blue)]/10 px-3 py-1.5 rounded-xl">
                  <span className="text-lg" title="XP">
                    &#x2B50;
                  </span>
                  <span className="text-sm font-extrabold text-[var(--blue-dark)]">
                    {user.xp || 0} XP
                  </span>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--gray-400)] hover:bg-[var(--red)]/10 hover:text-[var(--red)] border-2 border-transparent hover:border-[var(--red)]/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loggingOut ? "..." : "Abmelden"}
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl hover:bg-[var(--gray-50)] transition-colors cursor-pointer border-none bg-transparent"
            aria-label="Menü öffnen"
          >
            <span
              className={`block w-6 h-0.5 bg-[var(--gray-500)] rounded-full transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-[var(--gray-500)] rounded-full transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-[var(--gray-500)] rounded-full transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden border-t-2 border-[var(--border)] bg-white overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 flex flex-col gap-2">
          {/* Stats row (mobile) */}
          {user && (
            <div className="flex items-center gap-3 pb-3 mb-2 border-b-2 border-[var(--border)]">
              <div className="flex items-center gap-1.5 bg-[var(--gold)]/10 px-3 py-1.5 rounded-xl">
                <span className="text-lg">&#x1F525;</span>
                <span className="text-sm font-extrabold text-[var(--gold-dark)]">
                  {user.streak || 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[var(--blue)]/10 px-3 py-1.5 rounded-xl">
                <span className="text-lg">&#x2B50;</span>
                <span className="text-sm font-extrabold text-[var(--blue-dark)]">
                  {user.xp || 0} XP
                </span>
              </div>
              <span className="text-sm font-bold text-[var(--gray-400)] ml-auto">
                {user.name}
              </span>
            </div>
          )}

          {/* Nav Links (mobile) */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`no-underline flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                isActive(link.href)
                  ? "bg-green-bg text-green-dark"
                  : "text-[var(--gray-500)] hover:bg-[var(--gray-50)]"
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              {link.label}
            </Link>
          ))}

          {/* Logout (mobile) */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[var(--red)] hover:bg-[var(--red)]/10 transition-all duration-200 cursor-pointer border-none bg-transparent text-left disabled:opacity-50"
          >
            <span className="text-xl">&#x1F6AA;</span>
            {loggingOut ? "Wird abgemeldet..." : "Abmelden"}
          </button>
        </div>
      </div>
    </nav>
  );
}
