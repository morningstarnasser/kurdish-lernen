"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LEVELS, CATEGORIES } from "@/lib/words";
import {
  Star,
  Flame,
  Check,
  Lock,
  Play,
  Sparkles,
  Trophy,
  GraduationCap,
  BookOpen,
  User,
} from "lucide-react";

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

interface CategoryData {
  label: string;
  label_ku: string;
  icon: string;
}

export default function LearnPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [categories, setCategories] = useState<Record<string, CategoryData>>(CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, progressRes, catRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/progress"),
          fetch("/api/categories"),
        ]);

        if (!meRes.ok) {
          router.push("/");
          return;
        }

        const meData = await meRes.json();
        const progressData = await progressRes.json();
        const catData = await catRes.json();

        setUser(meData.user);
        setProgress(progressData.progress || []);
        if (catData.categories) {
          setCategories(catData.categories);
        }
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
          <div className="w-16 h-16 mx-auto mb-4">
            <BookOpen className="w-full h-full text-[var(--green)] animate-bounce" />
          </div>
          <div className="w-12 h-12 mx-auto mb-4 spinner-duo" />
          <p className="text-[var(--gray-400)] font-semibold text-lg animate-pulse">
            Laden...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header - Ferheng Style */}
      <div className="bg-gradient-to-r from-[#2E7D32] via-[var(--green)] to-[#00897B] text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Sparkles className="absolute top-4 left-[10%] w-8 h-8 opacity-25 animate-float" style={{ animationDelay: '0s' }} />
          <Star className="absolute top-8 right-[15%] w-7 h-7 opacity-25 animate-float" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute bottom-4 left-[20%] w-6 h-6 opacity-25 animate-float" style={{ animationDelay: '1s' }} />
          <Star className="absolute bottom-6 right-[25%] w-7 h-7 opacity-25 animate-float fill-white" style={{ animationDelay: '1.5s' }} />
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full bg-white/5" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-8 safe-area-top">
          <div className="flex items-center justify-between mb-4">
            <div className="animate-fade-in-left">
              <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">
                Ferheng
              </h1>
              <p className="text-white/80 font-semibold mt-1">
                Kurdisch lernen - Schritt für Schritt!
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/profile")}
              className="w-14 h-14 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300 cursor-pointer tap-feedback border-2 border-white/20 animate-fade-in-right"
            >
              <User className="w-7 h-7 text-white" />
            </button>
          </div>

          {/* XP Progress Bar - Always Visible */}
          <div className="mt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between text-sm font-bold mb-2">
              <span className="flex items-center gap-2">
                <span className="level-badge bg-white/20 text-white text-xs">
                  Level {currentRank + 1}
                </span>
              </span>
              <span className="xp-badge text-xs px-3 py-1">
                {xpInRank} / {xpForNextRank} XP
              </span>
            </div>
            <div className="w-full h-5 bg-white/20 rounded-full overflow-hidden shadow-inner backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-[var(--gold)] via-[var(--gold-light)] to-[var(--gold)] rounded-full transition-all duration-1000 ease-out progress-bar-shine"
                style={{
                  width: `${(xpInRank / xpForNextRank) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-white/60 font-medium mt-1.5 text-right">
              Noch {xpForNextRank - xpInRank} XP bis Level {currentRank + 2}
            </p>
          </div>
        </div>
      </div>

      {/* Streak Banner - Milestone Style */}
      {(user?.streak || 0) > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-4 animate-slide-up">
          <div className={`
            rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg hover-lift cursor-default tap-feedback
            ${(user?.streak || 0) >= 100
              ? "streak-milestone-100"
              : (user?.streak || 0) >= 30
              ? "streak-milestone-30"
              : (user?.streak || 0) >= 7
              ? "streak-milestone-7"
              : "bg-gradient-to-r from-[var(--orange)] to-[var(--red)]"
            }
          `}>
            <Flame className="w-10 h-10 text-white animate-streak-flame" />
            <div className="flex-1">
              <p className="text-white font-extrabold text-xl leading-tight">
                {user?.streak} Tage Serie!
              </p>
              <p className="text-white/80 text-sm font-semibold flex items-center gap-1">
                {(user?.streak || 0) >= 100 ? (
                  <>Legendär! Du bist unaufhaltbar! <Trophy className="w-4 h-4" /></>
                ) : (user?.streak || 0) >= 30 ? (
                  <>Einen Monat dabei! Fantastisch! <Star className="w-4 h-4 fill-white" /></>
                ) : (user?.streak || 0) >= 7 ? (
                  <>Eine Woche! Weiter so! <Sparkles className="w-4 h-4" /></>
                ) : (
                  "Weiter so, du bist grossartig!"
                )}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex gap-0.5">
                {[...Array(Math.min(user?.streak || 0, 7))].map((_, i) => (
                  <Flame
                    key={i}
                    className="w-5 h-5 text-white animate-star-pop"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </div>
              {(user?.streak || 0) > 7 && (
                <span className="text-white/80 text-xs font-bold mt-1">
                  +{(user?.streak || 0) - 7} mehr
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Level Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-extrabold text-[var(--gray-600)] mb-6 animate-fade-in-up">
          Deine Lektionen
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {LEVELS.map((level, idx) => {
            const state = getLevelState(level.id);
            const p = getLevelProgress(level.id);
            const stars = p?.stars || 0;
            // Use dynamic category data if available
            const cat = categories[level.cat];
            const levelName = cat?.label_ku || level.name;
            const levelDesc = cat?.label || level.desc;
            const levelIcon = cat?.icon || level.icon;

            return (
              <button
                key={level.id}
                onClick={() => handleLevelClick(level.id)}
                disabled={state === "locked"}
                className={`
                  relative rounded-2xl p-5 text-left cursor-pointer
                  transition-all duration-300 ease-out
                  animate-pop-in tap-feedback
                  ${
                    state === "completed"
                      ? "game-card border-l-[6px] border-l-[var(--green)]"
                      : state === "current"
                      ? "game-card border-[var(--gold)] border-3 shadow-[0_4px_0_var(--gold-dark),0_0_20px_rgba(255,213,79,0.3)]"
                      : "bg-[var(--gray-100)] border-3 border-[var(--gray-200)] opacity-50 cursor-not-allowed"
                  }
                `}
                style={{
                  animationDelay: `${idx * 0.05}s`,
                }}
              >
                {/* Completed badge */}
                {state === "completed" && (
                  <div className="absolute -top-2.5 -right-2.5 w-8 h-8 bg-[var(--green)] rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-badge-unlock">
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Lock icon for locked levels */}
                {state === "locked" && (
                  <div className="absolute -top-2.5 -right-2.5 w-8 h-8 bg-[var(--gray-400)] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Current level indicator - Play button */}
                {state === "current" && (
                  <div className="absolute -top-2.5 -right-2.5 w-8 h-8 bg-[var(--gold)] rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-heartbeat">
                    <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                  </div>
                )}

                {/* Level icon with animation on hover */}
                <div className={`text-5xl mb-3 transition-transform duration-300 ${state === "current" ? "animate-bounce" : ""} ${state !== "locked" ? "hover:scale-110" : ""}`}>
                  {levelIcon}
                </div>

                {/* Level badge */}
                <span className={`
                  inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1
                  ${state === "completed"
                    ? "bg-[var(--green-bg)] text-[var(--green-dark)]"
                    : state === "current"
                    ? "bg-[var(--gold)]/20 text-[var(--gold-dark)]"
                    : "bg-[var(--gray-200)] text-[var(--gray-500)]"
                  }
                `}>
                  Level {level.id + 1}
                </span>

                {/* Level name (Kurdish) */}
                <h3 className="text-base font-extrabold text-[var(--gray-700)] mt-1 leading-tight">
                  {levelName}
                </h3>

                {/* Description (German) */}
                <p className="text-xs font-semibold text-[var(--gray-500)] mt-1">
                  {levelDesc}
                </p>

                {/* Progress bar for current level */}
                {state === "current" && (
                  <div className="mt-3 w-full h-2.5 bg-[var(--gray-200)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] rounded-full progress-bar-shine"
                      style={{ width: "0%" }}
                    />
                  </div>
                )}

                {/* Stars display - Lucide Stars */}
                {state === "completed" && (
                  <div className="star-display mt-3">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${s <= stars ? "text-[#FFD54F] fill-[#FFD54F]" : "text-gray-300"}`}
                        style={{ animationDelay: `${s * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Stats Bar - Game Card Style */}
      <div className="max-w-4xl mx-auto px-4 pb-8 safe-area-bottom">
        <div className="game-card p-6 flex items-center justify-around animate-slide-up">
          <div className="text-center group cursor-default tap-feedback">
            <div className="w-14 h-14 mx-auto mb-2 bg-[var(--green-bg)] rounded-2xl flex items-center justify-center border-2 border-[var(--green)]/20 group-hover:scale-110 transition-transform">
              <Star className="w-7 h-7 text-[#FFD54F] fill-[#FFD54F]" />
            </div>
            <p className="text-2xl font-extrabold text-[var(--green)] tabular-nums">
              {user?.xp || 0}
            </p>
            <p className="text-xs font-bold text-[var(--gray-400)] uppercase tracking-wider">
              XP Total
            </p>
          </div>
          <div className="w-px h-16 bg-[var(--border)]" />
          <div className="text-center group cursor-default tap-feedback">
            <div className="w-14 h-14 mx-auto mb-2 bg-[var(--orange)]/10 rounded-2xl flex items-center justify-center border-2 border-[var(--orange)]/20 group-hover:scale-110 transition-transform">
              <Flame className="w-7 h-7 text-[var(--orange)] group-hover:animate-streak-flame" />
            </div>
            <p className="text-2xl font-extrabold text-[var(--orange)] tabular-nums">
              {user?.streak || 0}
            </p>
            <p className="text-xs font-bold text-[var(--gray-400)] uppercase tracking-wider">
              Tage Serie
            </p>
          </div>
          <div className="w-px h-16 bg-[var(--border)]" />
          <div className="text-center group cursor-default tap-feedback">
            <div className="w-14 h-14 mx-auto mb-2 bg-[var(--blue)]/10 rounded-2xl flex items-center justify-center border-2 border-[var(--blue)]/20 group-hover:scale-110 transition-transform">
              <Check className="w-7 h-7 text-[var(--blue)]" strokeWidth={3} />
            </div>
            <p className="text-2xl font-extrabold text-[var(--blue)] tabular-nums">
              {progress.filter((p) => p.completed === 1).length}
            </p>
            <p className="text-xs font-bold text-[var(--gray-400)] uppercase tracking-wider">
              Levels
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
