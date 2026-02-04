"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrierung fehlgeschlagen.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="no-underline">
            <h1 className="text-5xl font-black text-green mb-2">Ferheng</h1>
          </Link>
          <p className="text-[var(--gray-400)] font-semibold text-lg">
            Erstelle dein kostenloses Konto
          </p>
        </div>

        {/* Register Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-bold text-[var(--gray-500)] mb-2 uppercase tracking-wide"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dein Name"
                className="input-field"
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
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
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-[var(--gray-500)] mb-2 uppercase tracking-wide"
              >
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                className="input-field"
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold text-[var(--gray-500)] mb-2 uppercase tracking-wide"
              >
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Passwort wiederholen"
                className="input-field"
                required
                autoComplete="new-password"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Wird erstellt...
                </span>
              ) : (
                "Konto erstellen"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-sm font-bold text-[var(--gray-400)]">ODER</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Google Login */}
          <a
            href="/api/auth/google"
            className="no-underline flex items-center justify-center gap-3 w-full py-3 px-4 bg-white border-2 border-[var(--border)] rounded-2xl font-bold text-[var(--gray-600)] hover:bg-[var(--gray-50)] hover:border-[var(--gray-300)] transition-all duration-200 shadow-[0_2px_0_var(--border)] active:shadow-none active:translate-y-[2px]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Mit Google registrieren
          </a>

          {/* Apple Login */}
          <a
            href="/api/auth/apple"
            className="no-underline flex items-center justify-center gap-3 w-full py-3 px-4 bg-black border-2 border-black rounded-2xl font-bold text-white hover:bg-[#1a1a1a] transition-all duration-200 shadow-[0_2px_0_#000] active:shadow-none active:translate-y-[2px] mt-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Mit Apple registrieren
          </a>
        </div>

        {/* Login Link */}
        <p className="text-center mt-8 text-[var(--gray-400)] font-semibold">
          Bereits ein Konto?{" "}
          <Link
            href="/login"
            className="text-blue font-bold hover:underline no-underline"
          >
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
