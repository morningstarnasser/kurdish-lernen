"use client";

import { useState, useEffect, useRef } from "react";
import type { Word, DBWord } from "./words";
import { dbWordToWord } from "./words";

// In-memory cache shared across all hook instances
let cachedWords: Word[] | null = null;
let cachePromise: Promise<Word[]> | null = null;

async function fetchAllWords(): Promise<Word[]> {
  const res = await fetch("/api/words");
  if (!res.ok) throw new Error("Failed to fetch words");
  const data = await res.json();
  return (data.words as DBWord[]).map(dbWordToWord);
}

function getWords(): Promise<Word[]> {
  if (cachedWords) return Promise.resolve(cachedWords);
  if (cachePromise) return cachePromise;

  cachePromise = fetchAllWords().then((words) => {
    cachedWords = words;
    cachePromise = null;
    return words;
  }).catch((err) => {
    cachePromise = null;
    throw err;
  });

  return cachePromise;
}

export function useWords(category?: string) {
  const [words, setWords] = useState<Word[]>(cachedWords || []);
  const [loading, setLoading] = useState(!cachedWords);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (cachedWords) {
      setWords(cachedWords);
      setLoading(false);
      return;
    }

    getWords()
      .then((w) => {
        if (mountedRef.current) {
          setWords(w);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setLoading(false);
        }
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Filter by category if specified
  const filtered = category && category !== "all"
    ? words.filter((w) => w.c === category)
    : words;

  return { words: filtered, allWords: words, loading, totalCount: words.length };
}

// Prefetch words (call early to start loading)
export function prefetchWords() {
  getWords().catch(() => {});
}
