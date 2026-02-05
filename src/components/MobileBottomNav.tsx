"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlayCircle, BookOpen, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/learn", label: "Lernen", icon: PlayCircle },
  { href: "/dashboard/dictionary", label: "Ferheng", icon: BookOpen },
  { href: "/dashboard/profile", label: "Profil", icon: User },
];

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
          const Icon = item.icon;
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
              <Icon
                className={`w-6 h-6 ${active ? "text-[#58CC02]" : "text-[#777]"}`}
                strokeWidth={active ? 2.5 : 2}
              />
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
