"use client";

import { useCallback, useRef, useEffect } from "react";

type SoundName = "correct" | "wrong" | "levelUp" | "click" | "streak" | "complete" | "star" | "pop";

// Audio context singleton
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }

  return audioContext;
}

// Sound synthesis functions using Web Audio API
function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3
) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

function playCorrectSound(ctx: AudioContext, volume: number) {
  // Happy ascending two-note chime (like Duolingo)
  playTone(ctx, 523.25, 0.1, "sine", volume); // C5
  setTimeout(() => playTone(ctx, 659.25, 0.15, "sine", volume), 80); // E5
  setTimeout(() => playTone(ctx, 783.99, 0.2, "sine", volume * 0.8), 160); // G5
}

function playWrongSound(ctx: AudioContext, volume: number) {
  // Descending buzz (error sound)
  playTone(ctx, 200, 0.15, "sawtooth", volume * 0.4);
  setTimeout(() => playTone(ctx, 150, 0.2, "sawtooth", volume * 0.3), 100);
}

function playLevelUpSound(ctx: AudioContext, volume: number) {
  // Triumphant ascending arpeggio
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(ctx, freq, 0.2, "sine", volume * 0.8), i * 100);
  });
}

function playClickSound(ctx: AudioContext, volume: number) {
  // Quick pop/click
  playTone(ctx, 1000, 0.03, "sine", volume * 0.5);
}

function playStreakSound(ctx: AudioContext, volume: number) {
  // Fire/whoosh sound simulation
  playTone(ctx, 400, 0.1, "sawtooth", volume * 0.3);
  setTimeout(() => playTone(ctx, 600, 0.15, "sine", volume * 0.5), 50);
  setTimeout(() => playTone(ctx, 800, 0.1, "sine", volume * 0.4), 100);
}

function playCompleteSound(ctx: AudioContext, volume: number) {
  // Victory fanfare
  const melody = [
    { freq: 523.25, delay: 0 },     // C5
    { freq: 659.25, delay: 100 },   // E5
    { freq: 783.99, delay: 200 },   // G5
    { freq: 1046.5, delay: 350 },   // C6
    { freq: 783.99, delay: 450 },   // G5
    { freq: 1046.5, delay: 550 },   // C6
  ];
  melody.forEach(({ freq, delay }) => {
    setTimeout(() => playTone(ctx, freq, 0.2, "sine", volume * 0.6), delay);
  });
}

function playStarSound(ctx: AudioContext, volume: number) {
  // Sparkle/twinkle
  playTone(ctx, 1318.51, 0.1, "sine", volume * 0.5); // E6
  setTimeout(() => playTone(ctx, 1567.98, 0.15, "sine", volume * 0.4), 60); // G6
}

function playPopSound(ctx: AudioContext, volume: number) {
  // Bubble pop
  playTone(ctx, 800, 0.05, "sine", volume * 0.4);
  setTimeout(() => playTone(ctx, 400, 0.03, "sine", volume * 0.2), 30);
}

export function useSounds() {
  const enabled = useRef(true);
  const initialized = useRef(false);

  // Check if sounds are enabled from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("soundsEnabled");
      enabled.current = stored !== "false";
    }
  }, []);

  // Initialize audio context on first user interaction
  const initAudio = useCallback(() => {
    if (initialized.current) return;

    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }
    initialized.current = true;
  }, []);

  const playSound = useCallback((sound: SoundName, volume = 0.5) => {
    if (!enabled.current) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const vol = Math.min(1, Math.max(0, volume));

    switch (sound) {
      case "correct":
        playCorrectSound(ctx, vol);
        break;
      case "wrong":
        playWrongSound(ctx, vol);
        break;
      case "levelUp":
        playLevelUpSound(ctx, vol);
        break;
      case "click":
        playClickSound(ctx, vol);
        break;
      case "streak":
        playStreakSound(ctx, vol);
        break;
      case "complete":
        playCompleteSound(ctx, vol);
        break;
      case "star":
        playStarSound(ctx, vol);
        break;
      case "pop":
        playPopSound(ctx, vol);
        break;
    }
  }, []);

  const playCorrect = useCallback(() => playSound("correct", 0.5), [playSound]);
  const playWrong = useCallback(() => playSound("wrong", 0.4), [playSound]);
  const playLevelUp = useCallback(() => playSound("levelUp", 0.5), [playSound]);
  const playClick = useCallback(() => playSound("click", 0.3), [playSound]);
  const playStreak = useCallback(() => playSound("streak", 0.4), [playSound]);
  const playComplete = useCallback(() => playSound("complete", 0.5), [playSound]);
  const playStar = useCallback(() => playSound("star", 0.4), [playSound]);
  const playPop = useCallback(() => playSound("pop", 0.3), [playSound]);

  const toggleSounds = useCallback(() => {
    enabled.current = !enabled.current;
    if (typeof window !== "undefined") {
      localStorage.setItem("soundsEnabled", String(enabled.current));
    }
    // Play a test sound when enabling
    if (enabled.current) {
      playClick();
    }
    return enabled.current;
  }, [playClick]);

  const setSoundsEnabled = useCallback((value: boolean) => {
    enabled.current = value;
    if (typeof window !== "undefined") {
      localStorage.setItem("soundsEnabled", String(value));
    }
  }, []);

  return {
    playSound,
    playCorrect,
    playWrong,
    playLevelUp,
    playClick,
    playStreak,
    playComplete,
    playStar,
    playPop,
    toggleSounds,
    setSoundsEnabled,
    initAudio,
    isEnabled: () => enabled.current,
  };
}
