"use client";

import { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function AudioPlayer({ audioUrl, size = "md", className = "" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = useCallback(() => {
    if (!audioUrl) return;

    setError(false);

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    setIsLoading(true);

    audio.oncanplaythrough = () => {
      setIsLoading(false);
      audio.play().catch(() => {
        setError(true);
        setIsPlaying(false);
      });
    };

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };
    audio.onpause = () => setIsPlaying(false);
    audio.onerror = () => {
      setError(true);
      setIsPlaying(false);
      setIsLoading(false);
    };

    audio.load();
  }, [audioUrl]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (error) {
    return (
      <button
        onClick={handlePlay}
        className={`${sizeClasses[size]} rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all ${className}`}
        title="Fehler - Erneut versuchen"
      >
        <VolumeX className={iconSizes[size]} />
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-[#58CC02]/10 border border-[#58CC02]/20 flex items-center justify-center ${className}`}>
        <Loader2 className={`${iconSizes[size]} text-[#58CC02] animate-spin`} />
      </div>
    );
  }

  return (
    <button
      onClick={isPlaying ? handleStop : handlePlay}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ${
        isPlaying
          ? "bg-[#58CC02] text-white shadow-lg shadow-[#58CC02]/30"
          : "bg-[#58CC02]/10 border border-[#58CC02]/20 text-[#58CC02] hover:bg-[#58CC02]/20"
      } ${className}`}
      title={isPlaying ? "Stoppen" : "Abspielen"}
    >
      <Volume2 className={`${iconSizes[size]} ${isPlaying ? "animate-pulse" : ""}`} />
    </button>
  );
}
