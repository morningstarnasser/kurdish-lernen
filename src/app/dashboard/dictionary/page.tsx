"use client";

import { useState, useMemo, useCallback, Fragment } from "react";
import { WORDS, CATEGORIES } from "@/lib/words";
import type { Word } from "@/lib/words";

type Direction = "both" | "de" | "ku";

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-[#58CC02]/25 text-inherit rounded-sm px-0.5"
      >
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

export default function DictionaryPage() {
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState<Direction>("both");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredWords = useMemo(() => {
    let words = WORDS;

    if (activeCategory !== "all") {
      words = words.filter((w) => w.c === activeCategory);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      words = words.filter((w) => {
        if (direction === "de") return w.de.toLowerCase().includes(q);
        if (direction === "ku") return w.ku.toLowerCase().includes(q);
        return (
          w.de.toLowerCase().includes(q) || w.ku.toLowerCase().includes(q)
        );
      });
    }

    return words;
  }, [search, direction, activeCategory]);

  const groupedWords = useMemo(() => {
    const groups: Record<string, Word[]> = {};
    for (const word of filteredWords) {
      if (!groups[word.c]) groups[word.c] = [];
      groups[word.c].push(word);
    }
    return groups;
  }, [filteredWords]);

  const categoryKeys = Object.keys(CATEGORIES);

  const directionButtons: { value: Direction; label: string }[] = [
    { value: "both", label: "\u2194 Beide" },
    { value: "de", label: "DE\u2192KU" },
    { value: "ku", label: "KU\u2192DE" },
  ];

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    []
  );

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1b3d] via-[#132b4f] to-[#0d3b2e]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#58CC02]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#1CB0F6]/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ferheng{" "}
            <span className="text-[#58CC02]">&ndash;</span>{" "}
            <span className="bg-gradient-to-r from-[#58CC02] to-[#1CB0F6] bg-clip-text text-transparent">
              W&ouml;rterbuch
            </span>
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-gray-400 font-medium">
            Deutsch &harr; Kurdisch Badini
          </p>
        </div>
      </section>

      {/* Controls */}
      <div className="sticky top-0 z-30 bg-[#0a0f1a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
          {/* Search + Direction Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Wort suchen..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-[#1CB0F6] focus:ring-2 focus:ring-[#1CB0F6]/25 focus:bg-white/[0.07]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Direction Toggle */}
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 self-start sm:self-auto">
              {directionButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setDirection(btn.value)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                    direction === btn.value
                      ? "bg-[#58CC02] text-white shadow-lg shadow-[#58CC02]/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categoryKeys.map((key) => {
              const cat = CATEGORIES[key];
              const isActive = activeCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                    isActive
                      ? "bg-[#58CC02] text-white shadow-lg shadow-[#58CC02]/20"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-white/5"
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Word Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="text-[#58CC02] font-bold">
                {filteredWords.length}
              </span>{" "}
              {filteredWords.length === 1 ? "Wort" : "W\u00f6rter"} gefunden
            </p>
            {search && (
              <p className="text-sm text-gray-600">
                Suche: &ldquo;
                <span className="text-[#1CB0F6]">{search}</span>
                &rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {filteredWords.length === 0 ? (
          /* No Results */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">
              <svg
                className="w-16 h-16 text-gray-600 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">
              Kein Ergebnis
            </h3>
            <p className="text-gray-500 max-w-md">
              F&uuml;r &ldquo;
              <span className="text-[#1CB0F6] font-medium">{search}</span>
              &rdquo; wurde leider nichts gefunden. Versuche ein anderes Wort
              oder &auml;ndere die Filter.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
                setDirection("both");
              }}
              className="mt-6 px-6 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all duration-200 font-medium"
            >
              Filter zur&uuml;cksetzen
            </button>
          </div>
        ) : (
          /* Grouped Word Cards */
          <div className="space-y-10">
            {Object.entries(groupedWords).map(([catKey, words]) => {
              const cat = CATEGORIES[catKey];
              if (!cat) return null;
              return (
                <section key={catKey}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{cat.icon}</span>
                    <h2 className="text-xl font-bold text-white">
                      {cat.label}
                    </h2>
                    <span className="ml-2 text-xs font-semibold text-gray-500 bg-white/5 px-2.5 py-1 rounded-full">
                      {words.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {words.map((word, idx) => {
                      const isPhrase = word.t === 1;
                      return (
                        <div
                          key={`${catKey}-${idx}`}
                          className={`group relative rounded-xl border transition-all duration-200 cursor-default ${
                            isPhrase
                              ? "bg-gradient-to-br from-[#1CB0F6]/5 to-[#58CC02]/5 border-[#1CB0F6]/15 hover:border-[#1CB0F6]/40 hover:shadow-lg hover:shadow-[#1CB0F6]/5"
                              : "bg-white/[0.03] border-white/[0.06] hover:border-[#58CC02]/40 hover:shadow-lg hover:shadow-[#58CC02]/5"
                          } hover:-translate-y-0.5 p-4`}
                        >
                          {isPhrase && (
                            <div className="absolute top-3 right-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1CB0F6]/60 bg-[#1CB0F6]/10 px-2 py-0.5 rounded-full">
                                Satz
                              </span>
                            </div>
                          )}

                          {isPhrase ? (
                            <div className="space-y-2.5 pr-12">
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                                  Deutsch
                                </p>
                                <p className="text-white font-medium leading-snug">
                                  {highlightMatch(word.de, search)}
                                </p>
                              </div>
                              <div className="border-t border-white/5 pt-2.5">
                                <p className="text-xs font-semibold text-[#58CC02]/60 uppercase tracking-wider mb-0.5">
                                  Kurdisch
                                </p>
                                <p className="text-[#58CC02] font-medium leading-snug">
                                  {highlightMatch(word.ku, search)}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-semibold">
                                  {highlightMatch(word.de, search)}
                                </span>
                                <span className="text-gray-600 text-sm">
                                  &rarr;
                                </span>
                                <span className="text-[#58CC02] font-semibold">
                                  {highlightMatch(word.ku, search)}
                                </span>
                              </div>
                              {word.n && (
                                <p className="mt-1.5 text-xs text-gray-500 italic">
                                  {word.n}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Scroll-to-top floating hint */}
      <div className="h-20" />

      {/* Hide scrollbar for category pills */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
