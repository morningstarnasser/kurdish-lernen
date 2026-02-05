"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LEVELS } from "@/lib/words";
import type { Word } from "@/lib/words";
import { useWords } from "@/lib/useWords";
import { useSounds } from "@/lib/useSounds";

interface Question {
  word: Word;
  direction: "de_to_ku" | "ku_to_de";
  options: string[];
  correctAnswer: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function QuizContent() {
  const { allWords: WORDS, loading: wordsLoading } = useWords();
  const router = useRouter();
  const searchParams = useSearchParams();
  const levelId = Number(searchParams.get("level") ?? 0);
  const { playCorrect, playWrong, playComplete, playStar, initAudio } = useSounds();

  const level = LEVELS.find((l) => l.id === levelId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questionKey, setQuestionKey] = useState(0); // For re-animating options

  // Initialize audio on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      initAudio();
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
    document.addEventListener("click", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);
    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [initAudio]);

  // Generate questions - ALL multiple choice
  const generateQuestions = useCallback(() => {
    if (!level || WORDS.length === 0) return [];

    const categoryWords =
      level.cat === "all"
        ? [...WORDS]
        : WORDS.filter((w) => w.c === level.cat);

    const selectedWords = shuffleArray(categoryWords).slice(0, level.count);
    const allCategoryWords =
      categoryWords.length >= 4 ? categoryWords : [...WORDS];

    return selectedWords.map((word) => {
      const direction: "de_to_ku" | "ku_to_de" =
        Math.random() > 0.5 ? "de_to_ku" : "ku_to_de";

      const correctAnswer = direction === "de_to_ku" ? word.ku : word.de;

      // Get 3 wrong options
      const wrongOptions = shuffleArray(
        allCategoryWords.filter(
          (w) => (direction === "de_to_ku" ? w.ku : w.de) !== correctAnswer
        )
      )
        .slice(0, 3)
        .map((w) => (direction === "de_to_ku" ? w.ku : w.de));

      const options = shuffleArray([correctAnswer, ...wrongOptions]);

      return {
        word,
        direction,
        options,
        correctAnswer,
      };
    });
  }, [level, WORDS]);

  useEffect(() => {
    if (!level || WORDS.length === 0) return;
    setQuestions(generateQuestions());
  }, [level, WORDS, generateQuestions]);

  // Save single answer progress to DB immediately
  const saveStepProgress = useCallback(
    async (isCorrect: boolean) => {
      try {
        await fetch("/api/progress/step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level_id: levelId,
            correct: isCorrect ? 1 : 0,
            wrong: isCorrect ? 0 : 1,
          }),
        });
      } catch (err) {
        console.error("Failed to save step progress:", err);
      }
    },
    [levelId]
  );

  const checkAnswer = useCallback(
    (answer: string) => {
      if (feedback) return;
      const question = questions[currentIndex];
      if (!question) return;

      const normalizeStr = (s: string) =>
        s.toLowerCase().trim().replace(/[?.!,;:]/g, "");

      const userAnswer = normalizeStr(answer);
      const correctFull = normalizeStr(question.correctAnswer);

      // Check if answer matches any part split by " / "
      const correctParts = question.correctAnswer
        .split(" / ")
        .map((p) => normalizeStr(p));

      const isCorrect =
        userAnswer === correctFull || correctParts.includes(userAnswer);

      if (isCorrect) {
        setFeedback("correct");
        setCorrectCount((c) => c + 1);
        setXpEarned((xp) => xp + 10);
        playCorrect();
      } else {
        setFeedback("wrong");
        setWrongCount((w) => w + 1);
        setHearts((h) => h - 1);
        playWrong();
      }

      setSelectedAnswer(answer);
      saveStepProgress(isCorrect);
    },
    [feedback, questions, currentIndex, saveStepProgress, playCorrect, playWrong]
  );

  // Auto-advance after feedback
  useEffect(() => {
    if (!feedback) return;

    const timer = setTimeout(() => {
      if (hearts <= 0 && feedback === "wrong") {
        setGameOver(true);
        return;
      }

      if (currentIndex + 1 >= questions.length) {
        setShowComplete(true);
        return;
      }

      setCurrentIndex((i) => i + 1);
      setQuestionKey((k) => k + 1);
      setFeedback(null);
      setSelectedAnswer(null);
    }, 1200);

    return () => clearTimeout(timer);
  }, [feedback, currentIndex, questions.length, hearts]);

  // Save level completion progress
  useEffect(() => {
    if ((!showComplete && !gameOver) || saving) return;

    if (showComplete) {
      playComplete();
      setTimeout(() => playStar(), 300);
      setTimeout(() => playStar(), 500);
      setTimeout(() => playStar(), 700);
    }

    async function saveProgress() {
      setSaving(true);
      const total = correctCount + wrongCount;
      const pct = total > 0 ? (correctCount / total) * 100 : 0;
      const stars = pct >= 100 ? 3 : pct >= 80 ? 2 : pct >= 60 ? 1 : 0;

      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level_id: levelId,
            correct: correctCount,
            wrong: wrongCount,
            stars,
          }),
        });
      } catch (err) {
        console.error("Failed to save progress:", err);
      } finally {
        setSaving(false);
      }
    }

    saveProgress();
  }, [showComplete, gameOver, saving, correctCount, wrongCount, levelId, playComplete, playStar]);

  function handleClose() {
    router.push("/dashboard/learn");
  }

  function handleRetry() {
    setCurrentIndex(0);
    setHearts(3);
    setCorrectCount(0);
    setWrongCount(0);
    setXpEarned(0);
    setFeedback(null);
    setSelectedAnswer(null);
    setGameOver(false);
    setShowComplete(false);
    setQuestionKey(0);
    setQuestions(generateQuestions());
  }

  // --- GAME OVER SCREEN ---
  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--background)] to-[#f0f0f0] flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          {/* Broken heart animation */}
          <div className="relative mb-8">
            <div className="text-8xl animate-bounce" style={{ animationDuration: '2s' }}>
              💔
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-red-100 animate-ping opacity-30" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-[var(--gray-600)] mb-2 animate-fade-in-up">
            Nicht aufgeben!
          </h1>
          <p className="text-[var(--gray-400)] font-semibold mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Übung macht den Meister 💪
          </p>

          {/* Stats Card */}
          <div className="bg-white rounded-3xl border-2 border-[var(--border)] p-6 mb-8 shadow-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-around">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-2 bg-green-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <p className="text-2xl font-extrabold text-[var(--green)] tabular-nums">
                  {correctCount}
                </p>
                <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
                  Richtig
                </p>
              </div>
              <div className="w-px bg-[var(--border)]" />
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-2 bg-red-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">✗</span>
                </div>
                <p className="text-2xl font-extrabold text-[var(--red)] tabular-nums">
                  {wrongCount}
                </p>
                <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
                  Falsch
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={handleRetry}
              className="btn-primary w-full text-lg py-4 hover-scale active-press"
            >
              🔄 Nochmal versuchen
            </button>
            <button
              onClick={handleClose}
              className="btn-secondary w-full text-lg py-4 hover-scale active-press"
            >
              Zurück
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- COMPLETE SCREEN ---
  if (showComplete) {
    const total = correctCount + wrongCount;
    const pct = total > 0 ? (correctCount / total) * 100 : 0;
    const stars = pct >= 100 ? 3 : pct >= 80 ? 2 : pct >= 60 ? 1 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--green-bg)] to-[var(--background)] flex items-center justify-center p-4 overflow-hidden">
        {/* Confetti particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                width: `${8 + Math.random() * 8}px`,
                height: `${8 + Math.random() * 8}px`,
                backgroundColor: ['#58CC02', '#FFC800', '#1CB0F6', '#FF4B4B', '#CE82FF', '#FF9500'][i % 6],
                animation: `confettiFall ${3 + Math.random() * 2}s ease-out forwards`,
                animationDelay: `${Math.random() * 1}s`,
              }}
            />
          ))}
        </div>

        <div className="text-center max-w-md w-full relative z-10">
          {/* Trophy animation */}
          <div className="relative mb-6">
            <div className="text-9xl animate-bounce-in">
              🏆
            </div>
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-32 h-32 rounded-full bg-yellow-200 animate-ping opacity-30" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-[var(--gray-600)] mb-4 animate-fade-in-up">
            Fantastisch! 🎉
          </h1>

          {/* Stars */}
          <div className="flex justify-center gap-4 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`relative ${s <= stars ? "animate-star-pop" : ""}`}
                style={{ animationDelay: `${0.3 + s * 0.2}s` }}
              >
                <span className={`text-5xl ${s <= stars ? "" : "opacity-20 grayscale"}`}>
                  ⭐
                </span>
                {s <= stars && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-300 animate-ping opacity-30" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* XP Badge */}
          <div
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[var(--gold)] to-[#FFD700] text-white font-extrabold text-2xl rounded-full px-8 py-4 mb-8 shadow-xl animate-bounce-in"
            style={{ animationDelay: '0.8s' }}
          >
            <span className="text-3xl">✨</span>
            <span>+{xpEarned} XP</span>
            <span className="text-3xl">✨</span>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-3xl border-2 border-[var(--border)] p-6 mb-8 shadow-lg animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex justify-around">
              <div className="text-center group cursor-default">
                <div className="w-14 h-14 mx-auto mb-2 bg-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">✓</span>
                </div>
                <p className="text-2xl font-extrabold text-[var(--green)] tabular-nums">
                  {correctCount}
                </p>
                <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
                  Richtig
                </p>
              </div>
              <div className="w-px bg-[var(--border)]" />
              <div className="text-center group cursor-default">
                <div className="w-14 h-14 mx-auto mb-2 bg-red-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">✗</span>
                </div>
                <p className="text-2xl font-extrabold text-[var(--red)] tabular-nums">
                  {wrongCount}
                </p>
                <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
                  Falsch
                </p>
              </div>
              <div className="w-px bg-[var(--border)]" />
              <div className="text-center group cursor-default">
                <div className="w-14 h-14 mx-auto mb-2 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">%</span>
                </div>
                <p className="text-2xl font-extrabold text-[var(--blue)] tabular-nums">
                  {Math.round(pct)}%
                </p>
                <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
                  Genauigkeit
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="btn-primary w-full text-lg py-4 tracking-wider hover-scale active-press animate-fade-in-up"
            style={{ animationDelay: '0.7s' }}
          >
            Weiter lernen →
          </button>
        </div>

        <style jsx>{`
          @keyframes confettiFall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  // --- LOADING / NO LEVEL ---
  if (!level || questions.length === 0 || wordsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--background)] to-[#f0f0f0]">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="text-7xl animate-bounce">📚</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-[var(--green)] border-t-transparent animate-spin" />
            </div>
          </div>
          <p className="text-[var(--gray-400)] font-semibold text-lg animate-pulse">
            Quiz wird vorbereitet...
          </p>
        </div>
      </div>
    );
  }

  // --- QUIZ GAMEPLAY ---
  const question = questions[currentIndex];
  const progressPercent = ((currentIndex + (feedback ? 1 : 0)) / questions.length) * 100;
  const promptWord = question.direction === "de_to_ku" ? question.word.de : question.word.ku;
  const directionLabel = question.direction === "de_to_ku"
    ? "Übersetze ins Kurdische"
    : "Übersetze ins Deutsche";
  const directionEmoji = question.direction === "de_to_ku" ? "🇩🇪 → 🟢" : "🟢 → 🇩🇪";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--background)] to-[#f0f0f0] flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[var(--border)] shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full hover:bg-[var(--gray-50)] flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90"
          >
            <svg
              className="w-6 h-6 text-[var(--gray-400)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Progress Bar */}
          <div className="flex-1 h-4 bg-[var(--gray-100)] rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[var(--green)] via-[var(--green-light)] to-[var(--green)] rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Hearts */}
          <div className="flex items-center gap-1.5 min-w-[80px] justify-end">
            {[1, 2, 3].map((h) => (
              <span
                key={h}
                className={`text-2xl transition-all duration-300 ${
                  h <= hearts
                    ? "scale-100 opacity-100"
                    : "scale-75 opacity-30 grayscale"
                }`}
                style={{
                  animation: h <= hearts ? "heartPulse 1.5s ease-in-out infinite" : "none",
                  animationDelay: `${h * 0.2}s`,
                }}
              >
                ❤️
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="max-w-lg w-full">
          {/* Direction label */}
          <div className="text-center mb-4 animate-fade-in-down">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[var(--border)]">
              <span className="text-sm">{directionEmoji}</span>
              <span className="text-sm font-bold text-[var(--gray-500)] uppercase tracking-wider">
                {directionLabel}
              </span>
            </span>
          </div>

          {/* Word Card */}
          <div
            key={`card-${questionKey}`}
            className={`
              bg-white rounded-3xl border-3 p-8 text-center mb-6 shadow-lg
              transition-all duration-300 animate-zoom-in
              ${feedback === "correct"
                ? "border-[var(--green)] bg-gradient-to-b from-white to-green-50 shadow-green-200"
                : feedback === "wrong"
                ? "border-[var(--red)] bg-gradient-to-b from-white to-red-50 shadow-red-200 animate-shake"
                : "border-[var(--border)]"
              }
            `}
          >
            <p className="text-4xl font-extrabold text-[var(--gray-700)] mb-2">
              {promptWord}
            </p>
            {question.word.n && (
              <p className="text-sm text-[var(--gray-400)] font-medium italic">
                ({question.word.n})
              </p>
            )}
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div
              className={`text-center mb-4 animate-bounce-in ${
                feedback === "correct" ? "text-[var(--green)]" : "text-[var(--red)]"
              }`}
            >
              {feedback === "correct" ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">✓</span>
                  <span className="font-extrabold text-xl">Richtig! +10 XP</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-2xl">✗</span>
                    <span className="font-bold">Falsch</span>
                  </div>
                  <p className="text-[var(--gray-600)] font-semibold">
                    Richtig: <span className="text-[var(--green)]">{question.correctAnswer}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Multiple Choice Options - 4 elegant buttons */}
          <div
            key={`options-${questionKey}`}
            className="grid grid-cols-1 gap-3"
          >
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === question.correctAnswer;

              let buttonClasses = `
                w-full p-5 rounded-2xl text-lg font-bold text-left
                transition-all duration-200 cursor-pointer
                border-2 flex items-center gap-4
              `;

              if (feedback) {
                if (isCorrectOption) {
                  buttonClasses += " bg-[var(--green-bg)] border-[var(--green)] text-[var(--green-dark)] scale-[1.02]";
                } else if (isSelected && !isCorrectOption) {
                  buttonClasses += " bg-red-50 border-[var(--red)] text-[var(--red-dark)]";
                } else {
                  buttonClasses += " bg-white border-[var(--border)] text-[var(--gray-400)] opacity-60";
                }
              } else {
                buttonClasses += " bg-white border-[var(--border)] text-[var(--gray-600)] hover:border-[var(--blue)] hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]";
              }

              return (
                <button
                  key={idx}
                  onClick={() => checkAnswer(option)}
                  disabled={!!feedback}
                  className={buttonClasses}
                  style={{
                    animation: `slideInOption 0.4s ease-out forwards`,
                    animationDelay: `${idx * 0.08}s`,
                    opacity: 0,
                  }}
                >
                  {/* Option letter badge */}
                  <span className={`
                    w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0
                    transition-all duration-200
                    ${feedback && isCorrectOption
                      ? "bg-[var(--green)] text-white"
                      : feedback && isSelected && !isCorrectOption
                      ? "bg-[var(--red)] text-white"
                      : "bg-[var(--gray-100)] text-[var(--gray-500)]"
                    }
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </span>

                  <span className="flex-1">{option}</span>

                  {/* Checkmark/X indicator */}
                  {feedback && isCorrectOption && (
                    <span className="text-[var(--green)] text-2xl animate-bounce-in">✓</span>
                  )}
                  {feedback && isSelected && !isCorrectOption && (
                    <span className="text-[var(--red)] text-2xl animate-shake">✗</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question counter */}
      <div className="text-center pb-4 text-sm font-semibold text-[var(--gray-400)]">
        Frage {currentIndex + 1} von {questions.length}
      </div>

      <style jsx>{`
        @keyframes slideInOption {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes heartPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--background)] to-[#f0f0f0]">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">📚</div>
            <p className="text-[var(--gray-400)] font-semibold text-lg animate-pulse">
              Quiz wird vorbereitet...
            </p>
          </div>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
