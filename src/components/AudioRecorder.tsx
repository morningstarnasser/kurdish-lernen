"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square, Play, Pause, Trash2, Upload, Loader2, Volume2 } from "lucide-react";

interface AudioRecorderProps {
  wordId: number;
  wordKu: string;
  wordDe: string;
  existingAudioUrl?: string | null;
  onAudioSaved?: (audioUrl: string) => void;
  onAudioDeleted?: () => void;
}

export default function AudioRecorder({
  wordId,
  wordKu,
  wordDe,
  existingAudioUrl,
  onAudioSaved,
  onAudioDeleted,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Mikrofon konnte nicht gestartet werden. Bitte Berechtigung erteilen.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const playAudio = useCallback(() => {
    if (!audioUrl) return;

    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioElementRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onpause = () => setIsPlaying(false);

    audio.play();
  }, [audioUrl]);

  const pauseAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  }, []);

  const clearRecording = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setAudioBlob(null);
    setAudioUrl(existingAudioUrl || null);
    setIsPlaying(false);
  }, [existingAudioUrl]);

  const uploadAudio = useCallback(async () => {
    if (!audioBlob) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("word_id", String(wordId));
      formData.append("audio", audioBlob, `word_${wordId}.webm`);

      const res = await fetch("/api/words/audio", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload fehlgeschlagen");
      }

      // Convert blob to data URL for immediate display
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAudioUrl(dataUrl);
        setAudioBlob(null);
        onAudioSaved?.(dataUrl);
      };
      reader.readAsDataURL(audioBlob);
    } catch (err) {
      console.error("Error uploading audio:", err);
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }, [audioBlob, wordId, onAudioSaved]);

  const deleteAudio = useCallback(async () => {
    if (!confirm("Audio wirklich löschen?")) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/words/audio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word_id: wordId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Löschen fehlgeschlagen");
      }

      setAudioUrl(null);
      setAudioBlob(null);
      onAudioDeleted?.();
    } catch (err) {
      console.error("Error deleting audio:", err);
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen");
    } finally {
      setDeleting(false);
    }
  }, [wordId, onAudioDeleted]);

  const hasNewRecording = audioBlob !== null;
  const hasExistingAudio = existingAudioUrl && !hasNewRecording;

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#58CC02]" />
          <span className="text-sm font-semibold text-white">Audio Aufnahme</span>
        </div>
        <div className="text-xs text-gray-500">
          {wordKu} - {wordDe}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Audio Controls */}
      <div className="flex items-center gap-2">
        {/* Record Button */}
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          >
            <Mic className="w-4 h-4" />
            Aufnehmen
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all animate-pulse"
          >
            <Square className="w-4 h-4" />
            Stoppen
          </button>
        )}

        {/* Play/Pause Button */}
        {audioUrl && !isRecording && (
          <>
            {!isPlaying ? (
              <button
                onClick={playAudio}
                className="flex items-center gap-2 px-4 py-2 bg-[#58CC02] hover:bg-[#4CAF00] text-white rounded-lg text-sm font-semibold transition-all"
              >
                <Play className="w-4 h-4" />
                Abspielen
              </button>
            ) : (
              <button
                onClick={pauseAudio}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition-all"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            )}
          </>
        )}

        {/* Clear new recording */}
        {hasNewRecording && (
          <button
            onClick={clearRecording}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Aufnahme verwerfen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Upload/Delete Actions */}
      {(hasNewRecording || hasExistingAudio) && (
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
          {hasNewRecording && (
            <button
              onClick={uploadAudio}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-[#1CB0F6] hover:bg-[#1A9FDE] text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? "Speichern..." : "Audio speichern"}
            </button>
          )}

          {(hasExistingAudio || (audioUrl && !hasNewRecording)) && (
            <button
              onClick={deleteAudio}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {deleting ? "Löschen..." : "Audio löschen"}
            </button>
          )}

          {hasExistingAudio && (
            <span className="text-xs text-[#58CC02] ml-auto">
              Audio vorhanden
            </span>
          )}
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Aufnahme läuft...
        </div>
      )}
    </div>
  );
}
