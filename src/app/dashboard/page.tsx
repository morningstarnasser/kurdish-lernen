"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LEVELS, CATEGORIES } from "@/lib/words";
import { useWords } from "@/lib/useWords";
import {
  Flame,
  Star,
  GraduationCap,
  BookOpen,
  PlayCircle,
  BarChart3,
  Settings,
  Loader2,
  Hand,
} from "lucide-react";
import { CategoryIcon, CATEGORY_COLORS } from "@/components/CategoryIcons";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  xp: number;
  streak: number;
  total_correct: number;
  total_wrong: number;
  quizzes_played: number;
}

interface ProgressEntry {
  level_id: number;
  completed: number;
  stars: number;
}

export default function DashboardHome() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { totalCount } = useWords();

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, progressRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/progress"),
        ]);
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
        }
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setProgress(progressData.progress || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const completedLevels = progress.filter((p) => p.completed).length;
  const playerLevel = Math.floor((user?.xp || 0) / 100) + 1;
  const xpForLevel = (user?.xp || 0) % 100;

  // Find next uncompleted level
  const nextLevel = LEVELS.find((lv, i) => {
    const isCompleted = progress.some(
      (p) => p.level_id === lv.id && p.completed
    );
    const isUnlocked =
      i === 0 ||
      progress.some((p) => p.level_id === LEVELS[i - 1].id && p.completed);
    return !isCompleted && isUnlocked;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[var(--green)] mx-auto mb-4 animate-spin" />
          <p className="text-[var(--gray-400)] font-semibold">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#1a5c2e] rounded-2xl p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 flex items-center gap-3">
          Silav, {user?.name || "Lernender"}!
          <Hand className="w-8 h-8 text-[#FFD54F]" />
        </h1>
        <p className="text-white/70 font-medium">
          Willkommen bei Ferheng. Lerne Kurdisch (Badini) Schritt für Schritt.
        </p>

        {/* XP Bar */}
        <div className="mt-6 max-w-md">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span>Level {playerLevel}</span>
            <span>{xpForLevel} / 100 XP</span>
          </div>
          <div className="h-4 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--gold)] rounded-full transition-all duration-500"
              style={{ width: `${xpForLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border-2 border-[var(--border)] p-5 text-center">
          <div className="w-10 h-10 mx-auto mb-2 bg-[var(--orange)]/10 rounded-xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-[var(--orange)]" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--gold)]">
            {user?.streak || 0}
          </p>
          <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
            Tage Serie
          </p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[var(--border)] p-5 text-center">
          <div className="w-10 h-10 mx-auto mb-2 bg-[var(--green-bg)] rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-[#FFD54F] fill-[#FFD54F]" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--green)]">
            {user?.xp || 0}
          </p>
          <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
            Total XP
          </p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[var(--border)] p-5 text-center">
          <div className="w-10 h-10 mx-auto mb-2 bg-[var(--blue)]/10 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-[var(--blue)]" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--blue)]">
            {completedLevels}
          </p>
          <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
            Lektionen
          </p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[var(--border)] p-5 text-center">
          <div className="w-10 h-10 mx-auto mb-2 bg-purple-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-600">
            {totalCount}
          </p>
          <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
            Wörter
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Continue Learning */}
        <button
          onClick={() =>
            nextLevel
              ? router.push(`/dashboard/quiz?level=${nextLevel.id}`)
              : router.push("/dashboard/learn")
          }
          className="bg-[var(--green)] text-white rounded-2xl p-6 text-left shadow-[0_4px_0_var(--green-dark)] active:shadow-none active:translate-y-1 transition-all cursor-pointer hover:brightness-105"
        >
          <div className="w-12 h-12 mb-3 bg-white/20 rounded-xl flex items-center justify-center">
            {nextLevel ? (
              <CategoryIcon
                category={nextLevel.cat}
                levelId={nextLevel.id}
                className="w-7 h-7 text-white"
              />
            ) : (
              <PlayCircle className="w-7 h-7 text-white" />
            )}
          </div>
          <h3 className="text-lg font-extrabold mb-1">Weiterlernen</h3>
          <p className="text-white/80 text-sm font-medium">
            {nextLevel
              ? `${nextLevel.name} – ${nextLevel.desc}`
              : "Alle Lektionen abgeschlossen!"}
          </p>
        </button>

        {/* Dictionary */}
        <button
          onClick={() => router.push("/dashboard/dictionary")}
          className="bg-white border-2 border-[var(--border)] rounded-2xl p-6 text-left hover:border-[var(--blue)] hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="w-12 h-12 mb-3 bg-[var(--blue)]/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-[var(--blue)]" />
          </div>
          <h3 className="text-lg font-extrabold text-[var(--gray-600)] mb-1">
            Wörterbuch
          </h3>
          <p className="text-[var(--gray-400)] text-sm font-medium">
            {Object.keys(CATEGORIES).length - 1} Kategorien durchsuchen
          </p>
        </button>

        {/* Profile */}
        <button
          onClick={() => router.push("/dashboard/profile")}
          className="bg-white border-2 border-[var(--border)] rounded-2xl p-6 text-left hover:border-[var(--gold)] hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="w-12 h-12 mb-3 bg-[var(--gold)]/10 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-[var(--gold)]" />
          </div>
          <h3 className="text-lg font-extrabold text-[var(--gray-600)] mb-1">
            Mein Fortschritt
          </h3>
          <p className="text-[var(--gray-400)] text-sm font-medium">
            Statistiken und Erfolge ansehen
          </p>
        </button>
      </div>

      {/* Admin Link */}
      {user?.role === "admin" && (
        <button
          onClick={() => router.push("/dashboard/admin")}
          className="w-full bg-[var(--gray-100)] border-2 border-[var(--border)] rounded-2xl p-4 text-center hover:bg-[var(--gray-200)] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Settings className="w-5 h-5 text-[var(--gray-500)]" />
          <span className="font-bold text-[var(--gray-500)]">
            Admin-Bereich
          </span>
        </button>
      )}
    </div>
    </div>
  );
}
