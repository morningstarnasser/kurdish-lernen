"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LEVELS, CATEGORIES } from "@/lib/words";
import { useWords } from "@/lib/useWords";

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
          <div className="text-5xl mb-4" style={{ animation: "bounceIn 0.6s ease-out" }}>
            📚
          </div>
          <p className="text-[var(--gray-400)] font-semibold">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#1a5c2e] rounded-2xl p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
          Silav, {user?.name || "Lernender"}! 👋
        </h1>
        <p className="text-white/70 font-medium">
          Willkommen bei Ferheng. Lerne Kurdisch (Badini) Schritt fuer Schritt.
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
          <div className="text-2xl mb-1">🔥</div>
          <p className="text-2xl font-extrabold text-[var(--gold)]">
            {user?.streak || 0}
          </p>
          <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
            Tage Serie
          </p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[var(--border)] p-5 text-center">
          <div className="text-2xl mb-1">⭐</div>
          <p className="text-2xl font-extrabold text-[var(--green)]">
            {user?.xp || 0}
          </p>
          <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
            Total XP
          </p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[var(--border)] p-5 text-center">
          <div className="text-2xl mb-1">📝</div>
          <p className="text-2xl font-extrabold text-[var(--blue)]">
            {completedLevels}
          </p>
          <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
            Lektionen
          </p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[var(--border)] p-5 text-center">
          <div className="text-2xl mb-1">📚</div>
          <p className="text-2xl font-extrabold text-[var(--purple)]">
            {totalCount}
          </p>
          <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
            Woerter
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
          <div className="text-3xl mb-2">
            {nextLevel?.icon || "🎮"}
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
          <div className="text-3xl mb-2">📖</div>
          <h3 className="text-lg font-extrabold text-[var(--gray-600)] mb-1">
            Woerterbuch
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
          <div className="text-3xl mb-2">📊</div>
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
          className="w-full bg-[var(--gray-100)] border-2 border-[var(--border)] rounded-2xl p-4 text-center hover:bg-[var(--gray-200)] transition-all cursor-pointer"
        >
          <span className="font-bold text-[var(--gray-500)]">
            ⚙️ Admin-Bereich
          </span>
        </button>
      )}
    </div>
  );
}
