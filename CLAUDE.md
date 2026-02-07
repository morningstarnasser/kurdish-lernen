# Ferheng - Kurdisch (Badini) Lern-App

## Projekt

Gamifizierte Sprachlern-App (Duolingo-Stil) zum Lernen von Kurdisch (Badini-Dialekt). Deployed auf Vercel.

## Tech Stack

- **Framework:** Next.js 16 (App Router) mit React 19
- **Sprache:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/postcss`), kein separates Config-File
- **Datenbank:** Turso (libSQL) - SQLite-basiert, gehostet
- **Auth:** JWT (jose) + bcryptjs, Cookie-basiert (`token`)
- **Icons:** Lucide React (keine Emojis in UI-Komponenten)
- **Sounds:** Web Audio API (synthetisch, keine Audiodateien)
- **Deployment:** Vercel
- **Lottie:** lottie-react fuer Animationen

## Projektstruktur

```
src/
  app/
    api/auth/         # Login, Register, Google/Apple OAuth, Passwort-Reset
    api/words/        # Woerter CRUD + Audio
    api/progress/     # Lernfortschritt speichern/laden
    api/categories/   # Kategorien-Verwaltung
    api/seed/         # DB-Seeding
    dashboard/        # Hauptbereich (auth-geschuetzt via Layout)
      learn/          # Level-Uebersicht (Duolingo-Style)
      quiz/           # Quiz-Gameplay
      dictionary/     # Woerterbuch mit Suche/Filter
      profile/        # Profil + Statistiken
      admin/          # Admin-Bereich (Woerter/Kategorien verwalten)
    login/            # Login-Seite
    register/         # Registrierungs-Seite
  components/         # Wiederverwendbare Komponenten
  lib/
    auth.ts           # JWT-Helfer (createToken, verifyToken, getUser)
    db.ts             # Turso DB-Client (Proxy-Pattern, lazy init)
    words.ts          # Word/DBWord Types, CATEGORIES, LEVELS Definitionen
    words-data.ts     # Statische Wortdaten (Fallback)
    useWords.ts       # Client-Hook: Woerter laden mit In-Memory-Cache
    useSounds.ts      # Client-Hook: Sound-Effekte via Web Audio API
  middleware.ts       # Redirect eingeloggte User von / zu /dashboard
```

## Befehle

- `npm run dev` - Entwicklungsserver starten
- `npm run build` - Produktion-Build
- `npx tsc --noEmit` - TypeScript-Check
- `npx eslint src/` - Linting

## Konventionen

- **Sprache UI:** Deutsch (Benutzeroberflaeche), Kurdisch (Lerninhalte)
- **Imports:** `@/*` Alias fuer `./src/*`
- **Komponenten:** `"use client"` Direktive fuer Client-Komponenten
- **API Routes:** Server-seitig, nutzen `db` aus `@/lib/db` und `getUser()` aus `@/lib/auth`
- **Auth-Schutz:** Dashboard-Layout prueft serverseitig via `getUser()`, Client-Seiten pruefen via `/api/auth/me`
- **CSS:** Custom Properties in `globals.css` (--green, --gold, --blue etc.), Tailwind-Klassen mit `var()`-Referenzen
- **Animations:** Eigene CSS-Keyframes in globals.css, Klassen wie `.animate-fade-in-up`, `.game-card`, `.answer-option`
- **Keine Umlaute in Strings die an die DB gehen** - verwende ae/oe/ue wenn noetig

## Umgebungsvariablen

- `TURSO_DATABASE_URL` - Turso DB URL
- `TURSO_AUTH_TOKEN` - Turso Auth Token
- `JWT_SECRET` - JWT Signing Secret (Fallback: 'fallback-secret')
- `RESEND_API_KEY` - Resend API Key (Passwort-Reset E-Mails)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `APPLE_CLIENT_ID` / `APPLE_TEAM_ID` / `APPLE_KEY_ID` - Apple OAuth
- `NEXT_PUBLIC_APP_URL` - App-URL fuer OAuth Redirects

## Wichtig

- Woerter kommen primaer aus der DB (`/api/words`), mit `words-data.ts` als Fallback
- Levels sind statisch in `words.ts` definiert (31 Levels, 29 Kategorien + Meister)
- Quiz-Fortschritt wird pro Frage (`/api/progress/step`) und pro Level (`/api/progress`) gespeichert
- PWA-Support: manifest.json, Service Worker, Safe-Area-Insets
