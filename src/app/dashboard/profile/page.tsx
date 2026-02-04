"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LEVELS } from "@/lib/words";

interface ProgressEntry {
  level_id: number;
  completed: number;
  stars: number;
  best_score: number;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  xp: number;
  streak: number;
  total_correct: number;
  total_wrong: number;
  quizzes_played: number;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, progressRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/progress"),
        ]);

        if (!meRes.ok) {
          router.push("/");
          return;
        }

        const meData = await meRes.json();
        const progressData = await progressRes.json();

        setUser(meData.user);
        setProgress(progressData.progress || []);
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  function getLevelProgress(levelId: number): ProgressEntry | undefined {
    return progress.find((p) => p.level_id === levelId);
  }

  const totalCorrect = user?.total_correct || 0;
  const totalWrong = user?.total_wrong || 0;
  const totalAnswers = totalCorrect + totalWrong;
  const accuracy =
    totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

  async function handleResetProgress() {
    setResetting(true);
    try {
      await fetch("/api/progress", {
        method: "DELETE",
      });
      setProgress([]);
      // Refresh user data
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }
    } catch (err) {
      console.error("Failed to reset progress:", err);
    } finally {
      setResetting(false);
      setShowResetConfirm(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce-in">🧑‍🎓</div>
          <p className="text-[var(--gray-400)] font-semibold text-lg">
            Profil laden...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Back Button */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <button
          onClick={() => router.push("/dashboard/learn")}
          className="flex items-center gap-2 text-[var(--gray-400)] hover:text-[var(--gray-600)] font-bold transition-colors cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Zuruck
        </button>
      </div>

      {/* Profile Card */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#1a5c2e] rounded-2xl p-8 text-white text-center shadow-xl">
          <div className="text-6xl mb-3">🧑‍🎓</div>
          <h1 className="text-2xl font-extrabold">
            {user?.name || "Lernender"}
          </h1>
          <p className="text-white/60 font-medium mt-1">{user?.email}</p>
          {user?.created_at && (
            <p className="text-white/40 text-sm font-medium mt-2">
              Mitglied seit{" "}
              {new Date(user.created_at).toLocaleDateString("de-DE", {
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <h2 className="text-lg font-extrabold text-[var(--gray-600)] mb-4">
          Statistiken
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {/* XP */}
          <div className="bg-white rounded-2xl border-2 border-[var(--border)] p-5">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-2xl font-extrabold text-[var(--green)]">
              {user?.xp || 0}
            </p>
            <p className="text-xs font-bold text-[var(--gray-400)] uppercase mt-1">
              Gesamt XP
            </p>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-2xl border-2 border-[var(--border)] p-5">
            <div className="text-3xl mb-2">🔥</div>
            <p className="text-2xl font-extrabold text-[var(--gold)]">
              {user?.streak || 0}
            </p>
            <p className="text-xs font-bold text-[var(--gray-400)] uppercase mt-1">
              Tage Serie
            </p>
          </div>

          {/* Quizzes */}
          <div className="bg-white rounded-2xl border-2 border-[var(--border)] p-5">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-2xl font-extrabold text-[var(--blue)]">
              {user?.quizzes_played || 0}
            </p>
            <p className="text-xs font-bold text-[var(--gray-400)] uppercase mt-1">
              Quizze
            </p>
          </div>

          {/* Accuracy */}
          <div className="bg-white rounded-2xl border-2 border-[var(--border)] p-5">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-2xl font-extrabold text-[#FF9500]">
              {accuracy}%
            </p>
            <p className="text-xs font-bold text-[var(--gray-400)] uppercase mt-1">
              Genauigkeit
            </p>
          </div>
        </div>
      </div>

      {/* Level Completion Overview */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
        <h2 className="text-lg font-extrabold text-[var(--gray-600)] mb-4">
          Lektionen
        </h2>
        <div className="bg-white rounded-2xl border-2 border-[var(--border)] overflow-hidden">
          {LEVELS.map((level, idx) => {
            const p = getLevelProgress(level.id);
            const isCompleted = p?.completed === 1;
            const stars = p?.stars || 0;

            return (
              <div
                key={level.id}
                className={`
                  flex items-center gap-4 px-5 py-4
                  ${idx < LEVELS.length - 1 ? "border-b border-[var(--border)]" : ""}
                `}
              >
                {/* Icon */}
                <div className="text-2xl w-10 text-center flex-shrink-0">
                  {level.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-[var(--gray-600)] text-sm">
                    {level.name}
                  </p>
                  <p className="text-xs font-medium text-[var(--gray-400)]">
                    {level.desc}
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isCompleted ? (
                    <>
                      <div className="flex gap-0.5 text-sm">
                        {[1, 2, 3].map((s) => (
                          <span
                            key={s}
                            className={s <= stars ? "" : "opacity-25"}
                          >
                            {s <= stars ? "⭐" : "☆"}
                          </span>
                        ))}
                      </div>
                      <div className="w-6 h-6 bg-[var(--green)] rounded-full flex items-center justify-center">
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <div className="w-6 h-6 bg-[var(--gray-100)] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-[var(--gray-300)] rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset Progress */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-12">
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full bg-white rounded-2xl border-2 border-[var(--border)] p-4 text-center font-bold text-[var(--red)] hover:bg-[#FEE2E2] hover:border-[var(--red)] transition-all cursor-pointer"
          >
            Fortschritt zurucksetzen
          </button>
        ) : (
          <div className="bg-[#FEE2E2] rounded-2xl border-2 border-[var(--red)] p-6">
            <p className="text-center font-bold text-[var(--red-dark)] mb-4">
              Bist du sicher? Dein gesamter Fortschritt wird unwiderruflich
              geloscht.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
              <button
                onClick={handleResetProgress}
                disabled={resetting}
                className="flex-1 bg-[var(--red)] text-white font-bold rounded-2xl py-3 px-4 hover:bg-[var(--red-dark)] transition-colors shadow-[0_4px_0_var(--red-dark)] active:shadow-none active:translate-y-1 cursor-pointer disabled:opacity-50"
              >
                {resetting ? "Wird geloscht..." : "Ja, loschen"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
