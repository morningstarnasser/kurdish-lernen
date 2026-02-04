"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/dashboard/learn", label: "Lernen", icon: "learn" },
  { href: "/dashboard/dictionary", label: "Ferheng", icon: "dictionary" },
  { href: "/dashboard/profile", label: "Profil", icon: "profile" },
];

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? "#58CC02" : "#777";
  const strokeWidth = active ? 2.5 : 2;

  switch (name) {
    case "home":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "learn":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" fill={active ? color : "none"} />
        </svg>
      );
    case "dictionary":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          <line x1="8" y1="7" x2="16" y2="7" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      );
    case "profile":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return null;
  }
}

export default function MobileBottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  // Don't show on quiz pages (full-screen experience)
  if (pathname.startsWith("/dashboard/quiz")) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-[var(--border)] safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`no-underline flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-all duration-200 ${
                active
                  ? "text-[#58CC02]"
                  : "text-[#777] active:bg-gray-100"
              }`}
            >
              <NavIcon name={item.icon} active={active} />
              <span className={`text-[10px] font-bold ${active ? "text-[#58CC02]" : "text-[#999]"}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-1 w-6 h-0.5 bg-[#58CC02] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
