"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  BookOpen,
  Gamepad2,
  User,
  Flame,
  Star,
  LogOut,
  Menu,
  X,
} from "lucide-react";

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
    { href: "/dashboard/dictionary", label: "Wörterbuch", icon: BookOpen },
    { href: "/dashboard/learn", label: "Lernen", icon: Gamepad2 },
    { href: "/dashboard/profile", label: "Profil", icon: User },
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
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`no-underline flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive(link.href)
                      ? "bg-green-bg text-green-dark border-2 border-green/30"
                      : "text-[var(--gray-400)] hover:bg-[var(--gray-50)] hover:text-[var(--gray-600)] border-2 border-transparent"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Stats + Logout (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-4">
                {/* Streak */}
                <div className="flex items-center gap-1.5 bg-[var(--gold)]/10 px-3 py-1.5 rounded-xl">
                  <Flame className="w-5 h-5 text-[var(--orange)]" />
                  <span className="text-sm font-extrabold text-[var(--gold-dark)]">
                    {user.streak || 0}
                  </span>
                </div>

                {/* XP */}
                <div className="flex items-center gap-1.5 bg-[var(--blue)]/10 px-3 py-1.5 rounded-xl">
                  <Star className="w-5 h-5 text-[#FFD54F] fill-[#FFD54F]" />
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[var(--gray-400)] hover:bg-[var(--red)]/10 hover:text-[var(--red)] border-2 border-transparent hover:border-[var(--red)]/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? "..." : "Abmelden"}
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-[var(--gray-50)] transition-colors cursor-pointer border-none bg-transparent"
            aria-label="Menü öffnen"
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-[var(--gray-500)]" />
            ) : (
              <Menu className="w-6 h-6 text-[var(--gray-500)]" />
            )}
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
                <Flame className="w-5 h-5 text-[var(--orange)]" />
                <span className="text-sm font-extrabold text-[var(--gold-dark)]">
                  {user.streak || 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[var(--blue)]/10 px-3 py-1.5 rounded-xl">
                <Star className="w-5 h-5 text-[#FFD54F] fill-[#FFD54F]" />
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
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
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
                <Icon className="w-6 h-6" />
                {link.label}
              </Link>
            );
          })}

          {/* Logout (mobile) */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[var(--red)] hover:bg-[var(--red)]/10 transition-all duration-200 cursor-pointer border-none bg-transparent text-left disabled:opacity-50"
          >
            <LogOut className="w-6 h-6" />
            {loggingOut ? "Wird abgemeldet..." : "Abmelden"}
          </button>
        </div>
      </div>
    </nav>
  );
}
