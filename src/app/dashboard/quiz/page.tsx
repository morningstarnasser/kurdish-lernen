"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LEVELS } from "@/lib/words";
import type { Word } from "@/lib/words";
import { useWords } from "@/lib/useWords";
import { useSounds } from "@/lib/useSounds";
import {
  ConfettiAnimation,
  TrophyAnimation,
} from "@/components/LottieAnimations";
import { KurdishFlag, GermanFlag } from "@/components/KurdishFlag";
import {
  Heart,
  HeartCrack,
  Star,
  Check,
  X,
  ArrowRight,
  RotateCcw,
  ArrowLeft,
  Trophy,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Percent,
} from "lucide-react";

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
          {/* Broken heart icon with animation */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto animate-bounce" style={{ animationDuration: '2s' }}>
              <HeartCrack className="w-full h-full text-red-400" strokeWidth={1.5} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-red-100 animate-ping opacity-30" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-[var(--gray-600)] mb-2 animate-fade-in-up">
            Nicht aufgeben!
          </h1>
          <p className="text-[var(--gray-400)] font-semibold mb-8 animate-fade-in-up flex items-center justify-center gap-2" style={{ animationDelay: '0.1s' }}>
            Übung macht den Meister
            <Sparkles className="w-6 h-6 text-[var(--green)]" />
          </p>

          {/* Stats Card */}
          <div className="bg-white rounded-3xl border-2 border-[var(--border)] p-6 mb-8 shadow-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-around">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-2 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Check className="w-7 h-7 text-[var(--green)]" strokeWidth={3} />
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
                  <X className="w-7 h-7 text-[var(--red)]" strokeWidth={3} />
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
              className="btn-primary w-full text-lg py-4 hover-scale active-press flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Nochmal versuchen
            </button>
            <button
              onClick={handleClose}
              className="btn-secondary w-full text-lg py-4 hover-scale active-press flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
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
        {/* Lottie Confetti Animation - Full Screen */}
        <div className="fixed inset-0 pointer-events-none z-20">
          <ConfettiAnimation
            className="w-full h-full"
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        </div>

        <div className="text-center max-w-md w-full relative z-10">
          {/* Trophy Animation with Lottie */}
          <div className="relative mb-6">
            {/* Rays behind trophy */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-48 h-48 rounded-full animate-level-up-rays"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, var(--gold), transparent, var(--gold), transparent)',
                  opacity: 0.3,
                }}
              />
            </div>
            {/* Lottie Trophy Animation */}
            <div className="relative z-10 flex justify-center">
              <TrophyAnimation
                className="w-40 h-40"
                loop={true}
              />
            </div>
            {/* Burst circles */}
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-24 h-24 rounded-full bg-[var(--gold)] animate-celebration-burst" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-24 h-24 rounded-full bg-[var(--green)] animate-celebration-burst" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-[var(--gray-700)] mb-2 animate-level-up-badge">
            Level geschafft!
          </h1>
          <p className="text-lg text-[var(--gray-500)] font-semibold mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            Du bist fantastisch!
          </p>

          {/* Stars - Lucide Stars */}
          <div className="flex justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="relative"
                style={{ animationDelay: `${0.5 + s * 0.25}s` }}
              >
                {s <= stars ? (
                  <div className="w-16 h-16 animate-star-pop">
                    <Star className="w-full h-full text-[#FFD54F] fill-[#FFD54F] drop-shadow-[0_0_15px_rgba(255,213,79,0.8)]" />
                  </div>
                ) : (
                  <div className="w-16 h-16 opacity-20">
                    <Star className="w-full h-full text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* XP Badge with glow */}
          <div
            className="inline-flex items-center gap-3 xp-badge text-2xl rounded-full px-8 py-4 mb-8 animate-level-up-badge"
            style={{ animationDelay: '1s' }}
          >
            <Sparkles className="w-8 h-8 text-[var(--gold)] animate-bounce" />
            <span className="text-[var(--gray-700)]">+{xpEarned} XP</span>
            <Sparkles className="w-8 h-8 text-[var(--gold)] animate-bounce" style={{ animationDelay: '0.1s' }} />
          </div>

          {/* Stats Card - Game style with Lucide icons */}
          <div className="game-card p-6 mb-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex justify-around">
              <div className="text-center group cursor-default tap-feedback">
                <div className="w-16 h-16 mx-auto mb-2 bg-[var(--green-bg)] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-[var(--green)]/20">
                  <CheckCircle2 className="w-8 h-8 text-[var(--green)]" />
                </div>
                <p className="text-3xl font-extrabold text-[var(--green)] tabular-nums">
                  {correctCount}
                </p>
                <p className="text-xs font-bold text-[var(--gray-400)] uppercase tracking-wider">
                  Richtig
                </p>
              </div>
              <div className="w-px bg-[var(--border)]" />
              <div className="text-center group cursor-default tap-feedback">
                <div className="w-16 h-16 mx-auto mb-2 bg-red-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-[var(--red)]/20">
                  <XCircle className="w-8 h-8 text-[var(--red)]" />
                </div>
                <p className="text-3xl font-extrabold text-[var(--red)] tabular-nums">
                  {wrongCount}
                </p>
                <p className="text-xs font-bold text-[var(--gray-400)] uppercase tracking-wider">
                  Falsch
                </p>
              </div>
              <div className="w-px bg-[var(--border)]" />
              <div className="text-center group cursor-default tap-feedback">
                <div className="w-16 h-16 mx-auto mb-2 bg-[var(--blue)]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-[var(--blue)]/20">
                  <Percent className="w-7 h-7 text-[var(--blue)]" />
                </div>
                <p className="text-3xl font-extrabold text-[var(--blue)] tabular-nums">
                  {Math.round(pct)}
                </p>
                <p className="text-xs font-bold text-[var(--gray-400)] uppercase tracking-wider">
                  Genauigkeit
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="btn-primary btn-ripple w-full text-lg py-5 tracking-wider animate-fade-in-up"
            style={{ animationDelay: '0.9s' }}
          >
            Weiter lernen
            <ArrowRight className="inline-block ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // --- LOADING / NO LEVEL ---
  if (!level || questions.length === 0 || wordsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--background)] to-[#f0f0f0]">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto">
              <GraduationCap className="w-full h-full text-[var(--green)] animate-bounce" />
            </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--background)] to-[var(--gray-100)] flex flex-col">
      {/* Floating XP indicator when correct */}
      {feedback === "correct" && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 floating-xp text-3xl">
          +10 XP
        </div>
      )}

      {/* Top Bar - Glass Header */}
      <div className="sticky top-0 z-10 glass-header safe-area-top">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="w-11 h-11 rounded-full hover:bg-[var(--gray-100)] flex items-center justify-center transition-all duration-200 cursor-pointer tap-feedback"
          >
            <X className="w-6 h-6 text-[var(--gray-500)]" strokeWidth={2.5} />
          </button>

          {/* Progress Bar with shine */}
          <div className="flex-1 h-5 bg-[var(--gray-200)] rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[var(--green)] to-[var(--green-light)] rounded-full transition-all duration-700 ease-out progress-bar-shine"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Hearts Container - Lucide Hearts */}
          <div className="hearts-container min-w-[85px] justify-end">
            {[1, 2, 3].map((h) => (
              <span
                key={h}
                className={`heart ${h <= hearts ? "active" : "lost"}`}
              >
                <Heart
                  className={`w-6 h-6 ${h <= hearts ? "text-red-500 fill-red-500" : "text-gray-300"}`}
                  strokeWidth={h <= hearts ? 0 : 1.5}
                />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="max-w-lg w-full">
          {/* Direction label - Badge style */}
          <div className="text-center mb-5 animate-fade-in-down">
            <span className="level-badge inline-flex items-center gap-2 px-5 py-2">
              {question.direction === "de_to_ku" ? (
                <>
                  <GermanFlag className="w-6 h-4" />
                  <ArrowRight className="w-4 h-4 text-white" />
                  <KurdishFlag className="w-6 h-4" />
                </>
              ) : (
                <>
                  <KurdishFlag className="w-6 h-4" />
                  <ArrowRight className="w-4 h-4 text-white" />
                  <GermanFlag className="w-6 h-4" />
                </>
              )}
              <span className="text-xs font-bold uppercase tracking-wider ml-1">
                {directionLabel}
              </span>
            </span>
          </div>

          {/* Word Card - Game Card Style */}
          <div
            key={`card-${questionKey}`}
            className={`
              game-card p-10 text-center mb-6 word-card-enter
              ${feedback === "correct"
                ? "word-card-correct border-[var(--green)] bg-gradient-to-b from-white to-[var(--green-bg)]"
                : feedback === "wrong"
                ? "word-card-wrong border-[var(--red)] bg-gradient-to-b from-white to-red-50"
                : ""
              }
            `}
          >
            <p className="text-5xl font-extrabold text-[var(--gray-700)] mb-3 leading-tight">
              {promptWord}
            </p>
            {question.word.n && (
              <p className="text-sm text-[var(--gray-400)] font-semibold italic">
                ({question.word.n})
              </p>
            )}
          </div>

          {/* Feedback Message with Lottie animation */}
          {feedback && (
            <div
              className={`text-center mb-5 animate-bounce-in ${
                feedback === "correct" ? "text-[var(--green)]" : "text-[var(--red)]"
              }`}
            >
              {feedback === "correct" ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-14 h-14 text-[var(--green)] animate-bounce-in" />
                  <div>
                    <span className="font-extrabold text-2xl block">Richtig!</span>
                    <span className="xp-badge text-sm px-3 py-1 inline-block mt-1">+10 XP</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <XCircle className="w-10 h-10 text-[var(--red)] animate-wrong-shake" />
                    <span className="font-bold text-xl">Nicht ganz!</span>
                  </div>
                  <p className="text-[var(--gray-600)] font-semibold text-base">
                    Richtig wäre: <span className="text-[var(--green)] font-bold">{question.correctAnswer}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Multiple Choice Options - Answer Option Style */}
          <div
            key={`options-${questionKey}`}
            className="grid grid-cols-1 gap-3"
          >
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === question.correctAnswer;

              return (
                <button
                  key={idx}
                  onClick={() => checkAnswer(option)}
                  disabled={!!feedback}
                  className={`
                    answer-option flex items-center gap-4 animate-option-slide
                    ${feedback && isCorrectOption ? "correct" : ""}
                    ${feedback && isSelected && !isCorrectOption ? "wrong" : ""}
                    ${feedback && !isCorrectOption && !isSelected ? "opacity-50" : ""}
                  `}
                  style={{
                    animationDelay: `${idx * 0.1}s`,
                  }}
                >
                  {/* Option letter badge */}
                  <span className={`
                    w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shrink-0
                    transition-all duration-200 border-2
                    ${feedback && isCorrectOption
                      ? "bg-[var(--green)] border-[var(--green-dark)] text-white"
                      : feedback && isSelected && !isCorrectOption
                      ? "bg-[var(--red)] border-[var(--red-dark)] text-white"
                      : "bg-[var(--gray-100)] border-[var(--gray-200)] text-[var(--gray-600)]"
                    }
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </span>

                  <span className="flex-1 text-left">{option}</span>

                  {/* Checkmark/X indicator - Lucide Icons */}
                  {feedback && isCorrectOption && (
                    <CheckCircle2 className="w-8 h-8 text-[var(--green)] animate-bounce-in" />
                  )}
                  {feedback && isSelected && !isCorrectOption && (
                    <XCircle className="w-8 h-8 text-[var(--red)] animate-wrong-shake" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question counter - Badge style */}
      <div className="text-center pb-6 safe-area-bottom">
        <span className="inline-flex items-center gap-2 bg-white border-2 border-[var(--border)] rounded-full px-5 py-2 shadow-sm">
          <span className="text-sm font-bold text-[var(--gray-500)]">Frage</span>
          <span className="text-lg font-extrabold text-[var(--green)] tabular-nums">{currentIndex + 1}</span>
          <span className="text-sm font-bold text-[var(--gray-400)]">von</span>
          <span className="text-lg font-extrabold text-[var(--gray-600)] tabular-nums">{questions.length}</span>
        </span>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--background)] to-[#f0f0f0]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <GraduationCap className="w-full h-full text-[var(--green)] animate-bounce" />
            </div>
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
