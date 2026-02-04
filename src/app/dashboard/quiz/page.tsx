"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LEVELS, WORDS, Word } from "@/lib/words";

type QuestionType = "multiple" | "typein";

interface Question {
  word: Word;
  type: QuestionType;
  direction: "de_to_ku" | "ku_to_de";
  options?: string[];
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const levelId = Number(searchParams.get("level") ?? 0);

  const level = LEVELS.find((l) => l.id === levelId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [saving, setSaving] = useState(false);

  // Generate questions
  useEffect(() => {
    if (!level) return;

    const categoryWords =
      level.cat === "all"
        ? [...WORDS]
        : WORDS.filter((w) => w.c === level.cat);

    const selectedWords = shuffleArray(categoryWords).slice(0, level.count);
    const allCategoryWords =
      categoryWords.length >= 4 ? categoryWords : [...WORDS];

    const generated: Question[] = selectedWords.map((word) => {
      const type: QuestionType =
        Math.random() > 0.4 ? "multiple" : "typein";
      const direction: "de_to_ku" | "ku_to_de" =
        Math.random() > 0.5 ? "de_to_ku" : "ku_to_de";

      if (type === "multiple") {
        const correctAnswer =
          direction === "de_to_ku" ? word.ku : word.de;
        // Get 3 wrong options
        const wrongOptions = shuffleArray(
          allCategoryWords.filter(
            (w) =>
              (direction === "de_to_ku" ? w.ku : w.de) !== correctAnswer
          )
        )
          .slice(0, 3)
          .map((w) => (direction === "de_to_ku" ? w.ku : w.de));

        const options = shuffleArray([correctAnswer, ...wrongOptions]);

        return {
          word,
          type,
          direction,
          options,
          correctAnswer,
        };
      }

      return {
        word,
        type,
        direction,
        correctAnswer:
          direction === "de_to_ku" ? word.ku : word.de,
      };
    });

    setQuestions(generated);
  }, [level]);

  const checkAnswer = useCallback(
    (answer: string) => {
      if (feedback) return;
      const question = questions[currentIndex];
      if (!question) return;

      const normalizeStr = (s: string) =>
        s
          .toLowerCase()
          .trim()
          .replace(/[?.!,;:]/g, "");

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
      } else {
        setFeedback("wrong");
        setWrongCount((w) => w + 1);
        setHearts((h) => h - 1);
      }

      setSelectedAnswer(answer);
    },
    [feedback, questions, currentIndex]
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
      setFeedback(null);
      setSelectedAnswer(null);
      setTypedAnswer("");
    }, 1500);

    return () => clearTimeout(timer);
  }, [feedback, currentIndex, questions.length, hearts]);

  // Save progress on complete
  useEffect(() => {
    if (!showComplete || saving) return;

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
  }, [showComplete, saving, correctCount, wrongCount, levelId]);

  function handleTypeinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!typedAnswer.trim()) return;
    checkAnswer(typedAnswer);
  }

  function handleClose() {
    router.push("/dashboard/learn");
  }

  // --- GAME OVER SCREEN ---
  if (gameOver) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div
            className="text-7xl mb-6"
            style={{ animation: "bounceIn 0.8s ease-out" }}
          >
            💔
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--gray-600)] mb-2">
            Nicht aufgeben!
          </h1>
          <p className="text-[var(--gray-400)] font-semibold mb-8">
            Du hast alle Herzen verloren. Probier es nochmal!
          </p>
          <div className="bg-white rounded-2xl border-2 border-[var(--border)] p-6 mb-8">
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-[var(--green)]">
                  {correctCount}
                </p>
                <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
                  Richtig
                </p>
              </div>
              <div className="w-px bg-[var(--border)]" />
              <div className="text-center">
                <p className="text-2xl font-extrabold text-[var(--red)]">
                  {wrongCount}
                </p>
                <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
                  Falsch
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setHearts(3);
                setCorrectCount(0);
                setWrongCount(0);
                setXpEarned(0);
                setFeedback(null);
                setSelectedAnswer(null);
                setTypedAnswer("");
                setGameOver(false);
                setShowComplete(false);
                // Re-generate questions
                if (level) {
                  const categoryWords =
                    level.cat === "all"
                      ? [...WORDS]
                      : WORDS.filter((w) => w.c === level.cat);
                  const selectedWords = shuffleArray(categoryWords).slice(
                    0,
                    level.count
                  );
                  const allCategoryWords =
                    categoryWords.length >= 4
                      ? categoryWords
                      : [...WORDS];
                  const generated: Question[] = selectedWords.map(
                    (word) => {
                      const qType: QuestionType =
                        Math.random() > 0.4 ? "multiple" : "typein";
                      const dir: "de_to_ku" | "ku_to_de" =
                        Math.random() > 0.5 ? "de_to_ku" : "ku_to_de";
                      if (qType === "multiple") {
                        const correctAnswer =
                          dir === "de_to_ku" ? word.ku : word.de;
                        const wrongOptions = shuffleArray(
                          allCategoryWords.filter(
                            (w) =>
                              (dir === "de_to_ku" ? w.ku : w.de) !==
                              correctAnswer
                          )
                        )
                          .slice(0, 3)
                          .map((w) =>
                            dir === "de_to_ku" ? w.ku : w.de
                          );
                        const options = shuffleArray([
                          correctAnswer,
                          ...wrongOptions,
                        ]);
                        return {
                          word,
                          type: qType,
                          direction: dir,
                          options,
                          correctAnswer,
                        };
                      }
                      return {
                        word,
                        type: qType,
                        direction: dir,
                        correctAnswer:
                          dir === "de_to_ku" ? word.ku : word.de,
                      };
                    }
                  );
                  setQuestions(generated);
                }
              }}
              className="btn-primary w-full text-lg py-4"
            >
              Nochmal versuchen
            </button>
            <button
              onClick={handleClose}
              className="btn-secondary w-full text-lg py-4"
            >
              Zuruck
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
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div
            className="text-8xl mb-4"
            style={{ animation: "bounceIn 0.8s ease-out" }}
          >
            🏆
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--gray-600)] mb-2">
            Lektion abgeschlossen!
          </h1>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-4 text-4xl">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={s <= stars ? "" : "opacity-25"}
                style={{
                  animation:
                    s <= stars
                      ? `bounceIn 0.5s ease-out ${s * 0.2}s both`
                      : undefined,
                }}
              >
                {s <= stars ? "⭐" : "☆"}
              </span>
            ))}
          </div>

          {/* XP */}
          <div
            className="inline-block bg-[var(--gold)] text-white font-extrabold text-2xl rounded-2xl px-8 py-3 mb-8"
            style={{ animation: "fadeInUp 0.6s ease-out 0.4s both" }}
          >
            +{xpEarned} XP
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border-2 border-[var(--border)] p-6 mb-8">
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-[var(--green)]">
                  {correctCount}
                </p>
                <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
                  Richtig
                </p>
              </div>
              <div className="w-px bg-[var(--border)]" />
              <div className="text-center">
                <p className="text-2xl font-extrabold text-[var(--red)]">
                  {wrongCount}
                </p>
                <p className="text-xs font-bold text-[var(--gray-400)] uppercase">
                  Falsch
                </p>
              </div>
              <div className="w-px bg-[var(--border)]" />
              <div className="text-center">
                <p className="text-2xl font-extrabold text-[var(--blue)]">
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
            className="btn-primary w-full text-lg py-4 tracking-wider"
          >
            Weiter
          </button>
        </div>
      </div>
    );
  }

  // --- LOADING / NO LEVEL ---
  if (!level || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce-in">📝</div>
          <p className="text-[var(--gray-400)] font-semibold text-lg">
            Quiz wird geladen...
          </p>
        </div>
      </div>
    );
  }

  // --- QUIZ GAMEPLAY ---
  const question = questions[currentIndex];
  const progressPercent =
    ((currentIndex + (feedback ? 1 : 0)) / questions.length) * 100;
  const promptWord =
    question.direction === "de_to_ku" ? question.word.de : question.word.ku;
  const directionLabel =
    question.direction === "de_to_ku"
      ? "Ubersetze ins Kurdische"
      : "Ubersetze ins Deutsche";

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b-2 border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full hover:bg-[var(--gray-50)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg
              className="w-6 h-6 text-[var(--gray-400)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Progress Bar */}
          <div className="flex-1 h-4 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--green)] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Hearts */}
          <div className="flex items-center gap-1 text-xl min-w-[70px] justify-end">
            {[1, 2, 3].map((h) => (
              <span
                key={h}
                className={
                  h <= hearts
                    ? "transition-transform"
                    : "grayscale opacity-30 transition-all"
                }
                style={
                  h > hearts
                    ? { filter: "grayscale(1)" }
                    : undefined
                }
              >
                ❤️
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-lg w-full">
          {/* Direction label */}
          <p className="text-center text-sm font-bold text-[var(--gray-400)] uppercase tracking-wider mb-3">
            {directionLabel}
          </p>

          {/* Word Card */}
          <div
            className={`
              bg-white rounded-2xl border-2 border-[var(--border)] p-8 text-center mb-8
              transition-all duration-200
              ${
                feedback === "correct"
                  ? "border-[var(--green)] bg-[var(--green-bg)]"
                  : feedback === "wrong"
                  ? "border-[var(--red)] bg-[#FEE2E2]"
                  : ""
              }
            `}
            style={
              feedback === "wrong"
                ? {
                    animation:
                      "shake 0.5s ease-in-out",
                  }
                : undefined
            }
          >
            <p className="text-3xl font-extrabold text-[var(--gray-700)]">
              {promptWord}
            </p>
            {question.word.n && (
              <p className="text-sm text-[var(--gray-400)] font-medium mt-2">
                ({question.word.n})
              </p>
            )}
          </div>

          {/* XP animation on correct */}
          {feedback === "correct" && (
            <div
              className="text-center mb-4"
              style={{ animation: "fadeInUp 0.4s ease-out" }}
            >
              <span className="text-[var(--green)] font-extrabold text-xl">
                +10 XP ✓
              </span>
            </div>
          )}

          {/* Show correct answer on wrong */}
          {feedback === "wrong" && (
            <div
              className="text-center mb-4"
              style={{ animation: "fadeInUp 0.4s ease-out" }}
            >
              <p className="text-[var(--red)] font-bold text-sm mb-1">
                Richtige Antwort:
              </p>
              <p className="text-[var(--gray-600)] font-extrabold text-lg">
                {question.correctAnswer}
              </p>
            </div>
          )}

          {/* Multiple Choice Options */}
          {question.type === "multiple" && question.options && (
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption =
                  option === question.correctAnswer;

                let buttonStyle =
                  "bg-white border-2 border-[var(--border)] hover:border-[var(--blue)] hover:bg-blue-50";

                if (feedback) {
                  if (isCorrectOption) {
                    buttonStyle =
                      "bg-[var(--green-bg)] border-2 border-[var(--green)] scale-105";
                  } else if (isSelected && !isCorrectOption) {
                    buttonStyle =
                      "bg-[#FEE2E2] border-2 border-[var(--red)]";
                  } else {
                    buttonStyle =
                      "bg-white border-2 border-[var(--border)] opacity-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => checkAnswer(option)}
                    disabled={!!feedback}
                    className={`
                      ${buttonStyle}
                      rounded-2xl p-4 text-center font-bold text-[var(--gray-600)]
                      transition-all duration-200 cursor-pointer
                      ${!feedback ? "active:scale-95" : ""}
                    `}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* Type-in Answer */}
          {question.type === "typein" && (
            <form
              onSubmit={handleTypeinSubmit}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                disabled={!!feedback}
                placeholder="Deine Antwort..."
                autoFocus
                className={`
                  input-field text-center text-xl
                  ${
                    feedback === "correct"
                      ? "!border-[var(--green)] !bg-[var(--green-bg)]"
                      : feedback === "wrong"
                      ? "!border-[var(--red)] !bg-[#FEE2E2]"
                      : ""
                  }
                `}
              />
              {!feedback && (
                <button
                  type="submit"
                  disabled={!typedAnswer.trim()}
                  className={`
                    btn-primary w-full text-lg py-4 tracking-wider
                    ${!typedAnswer.trim() ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  Prufen
                </button>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Shake animation style */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-4px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(4px);
          }
        }
      `}</style>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce-in">📝</div>
            <p className="text-[var(--gray-400)] font-semibold text-lg">
              Quiz wird geladen...
            </p>
          </div>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
