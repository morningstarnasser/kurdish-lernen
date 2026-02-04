"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LEVELS, CATEGORIES } from "@/lib/words";

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
}

export default function LearnPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

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

  function isLevelUnlocked(levelId: number): boolean {
    if (levelId === 0) return true;
    const prevProgress = getLevelProgress(levelId - 1);
    return prevProgress?.completed === 1;
  }

  function getLevelState(
    levelId: number
  ): "completed" | "current" | "locked" {
    const p = getLevelProgress(levelId);
    if (p?.completed === 1) return "completed";
    if (isLevelUnlocked(levelId)) return "current";
    return "locked";
  }

  function handleLevelClick(levelId: number) {
    if (!isLevelUnlocked(levelId)) return;
    router.push(`/dashboard/quiz?level=${levelId}`);
  }

  // Calculate XP progress within the current "rank"
  // Every 100 XP is a new rank
  const currentXp = user?.xp || 0;
  const currentRank = Math.floor(currentXp / 100);
  const xpInRank = currentXp % 100;
  const xpForNextRank = 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce-in">📚</div>
          <p className="text-[var(--gray-400)] font-semibold text-lg">
            Laden...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a5c2e] via-[#58CC02] to-[#0d9488] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Kurdisch lernen
              </h1>
              <p className="text-white/80 font-medium mt-1">
                Schritt fur Schritt zum Erfolg!
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/profile")}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-2xl transition-colors cursor-pointer"
            >
              🧑‍🎓
            </button>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-bold mb-1.5">
              <span className="flex items-center gap-1.5">
                ⭐ Rang {currentRank + 1}
              </span>
              <span>
                {xpInRank} / {xpForNextRank} XP
              </span>
            </div>
            <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--gold)] rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(xpInRank / xpForNextRank) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Streak Banner */}
      {(user?.streak || 0) > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-gradient-to-r from-[var(--gold)] to-[#FF9500] rounded-2xl px-5 py-3 flex items-center gap-3 shadow-md">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="text-white font-extrabold text-lg leading-tight">
                {user?.streak} Tage Serie!
              </p>
              <p className="text-white/80 text-sm font-medium">
                Weiter so, du bist grossartig!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Level Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-extrabold text-[var(--gray-600)] mb-6">
          Deine Lektionen
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {LEVELS.map((level) => {
            const state = getLevelState(level.id);
            const p = getLevelProgress(level.id);
            const stars = p?.stars || 0;

            return (
              <button
                key={level.id}
                onClick={() => handleLevelClick(level.id)}
                disabled={state === "locked"}
                className={`
                  relative rounded-2xl p-5 text-left transition-all duration-200 border-2 cursor-pointer
                  ${
                    state === "completed"
                      ? "bg-white border-l-[6px] border-l-[var(--green)] border-[var(--green)]/30 hover:shadow-lg hover:-translate-y-0.5"
                      : state === "current"
                      ? "bg-white border-[var(--gold)] shadow-[0_0_20px_rgba(255,200,0,0.3)] hover:shadow-[0_0_30px_rgba(255,200,0,0.5)] hover:-translate-y-0.5"
                      : "bg-[var(--gray-50)] border-[var(--border)] opacity-45 cursor-not-allowed"
                  }
                `}
                style={
                  state === "current"
                    ? {
                        animation: "pulse 2.5s ease-in-out infinite",
                      }
                    : undefined
                }
              >
                {/* Completed badge */}
                {state === "completed" && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-[var(--green)] rounded-full flex items-center justify-center shadow-md">
                    <svg
                      className="w-4 h-4 text-white"
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
                )}

                {/* Lock icon for locked levels */}
                {state === "locked" && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-[var(--gray-300)] rounded-full flex items-center justify-center shadow-md">
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                {/* Level icon */}
                <div className="text-4xl mb-2">{level.icon}</div>

                {/* Level number */}
                <p className="text-xs font-bold text-[var(--gray-300)] uppercase tracking-wider">
                  Level {level.id + 1}
                </p>

                {/* Level name */}
                <h3 className="text-base font-extrabold text-[var(--gray-600)] mt-0.5 leading-tight">
                  {level.name}
                </h3>

                {/* Description */}
                <p className="text-xs font-semibold text-[var(--gray-400)] mt-1">
                  {level.desc}
                </p>

                {/* Progress bar for current level */}
                {state === "current" && (
                  <div className="mt-3 w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--gold)] rounded-full"
                      style={{ width: "0%" }}
                    />
                  </div>
                )}

                {/* Stars display */}
                {state === "completed" && (
                  <div className="mt-2.5 flex gap-0.5 text-lg">
                    {[1, 2, 3].map((s) => (
                      <span key={s} className={s <= stars ? "" : "opacity-30"}>
                        {s <= stars ? "⭐" : "☆"}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl border-2 border-[var(--border)] p-5 flex items-center justify-around">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-[var(--green)]">
              {user?.xp || 0}
            </p>
            <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
              XP Total
            </p>
          </div>
          <div className="w-px h-10 bg-[var(--border)]" />
          <div className="text-center">
            <p className="text-2xl font-extrabold text-[var(--gold)]">
              🔥 {user?.streak || 0}
            </p>
            <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
              Serie
            </p>
          </div>
          <div className="w-px h-10 bg-[var(--border)]" />
          <div className="text-center">
            <p className="text-2xl font-extrabold text-[var(--blue)]">
              {progress.filter((p) => p.completed === 1).length}
            </p>
            <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
              Abgeschlossen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
