"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ein Fehler ist aufgetreten.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-6">📧</div>
          <h1 className="text-2xl font-extrabold text-[var(--gray-600)] mb-3">
            E-Mail gesendet!
          </h1>
          <p className="text-[var(--gray-400)] font-semibold mb-8 leading-relaxed">
            Falls ein Konto mit <strong className="text-[var(--gray-600)]">{email}</strong> existiert,
            haben wir dir einen Link zum Zurücksetzen deines Passworts gesendet.
          </p>
          <div className="card p-6">
            <p className="text-sm text-[var(--gray-400)] font-medium mb-4">
              Prüfe auch deinen Spam-Ordner.
            </p>
            <Link href="/login" className="btn-primary inline-block text-center w-full no-underline">
              Zurück zum Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="no-underline">
            <h1 className="text-5xl font-black text-green mb-2">Ferheng</h1>
          </Link>
          <p className="text-[var(--gray-400)] font-semibold text-lg">
            Passwort zurücksetzen
          </p>
        </div>

        {/* Form Card */}
        <div className="card">
          <p className="text-[var(--gray-400)] font-medium text-sm mb-6 leading-relaxed">
            Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen deines Passworts.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && <div className="error-message">{error}</div>}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-[var(--gray-500)] mb-2 uppercase tracking-wide"
              >
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="input-field"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Wird gesendet...
                </span>
              ) : (
                "Link senden"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-[var(--gray-400)] font-semibold">
          Erinnerst du dich?{" "}
          <Link href="/login" className="text-blue font-bold hover:underline no-underline">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
