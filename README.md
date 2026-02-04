# Ferheng - Kurdisch Lernen

Lerne Kurdisch (Badini) spielerisch mit interaktiven Lektionen, einem umfangreichen Deutsch-Kurdisch Wörterbuch und Fortschrittsverfolgung.

**Live:** [kurdish-lernen.vercel.app](https://kurdish-lernen.vercel.app)

## Features

- **2.300+ Wörter** in 29 Kategorien (Badini-Kurdisch)
- **Interaktive Quiz-Spiele** mit Multiple-Choice und Texteingabe
- **31 Lernlevel** vom Anfänger bis zum Meister
- **Wörterbuch** mit Suchfunktion und Kategoriefiltern
- **Fortschrittsverfolgung** mit XP, Streaks und Sternen
- **PWA** - als App auf dem Homescreen installierbar
- **Mobile-optimiert** mit Bottom-Navigation
- **Admin-Bereich** zum Verwalten der Wörter (CRUD)
- **Google & Apple Login** (OAuth 2.0)

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS v4
- **Datenbank:** Turso (libSQL)
- **Auth:** JWT (jose) + Google/Apple OAuth
- **Hosting:** Vercel
- **PWA:** Service Worker + Web App Manifest

## Kategorien

| Kategorie | Wörter | Kategorie | Wörter |
|-----------|--------|-----------|--------|
| Begrüssungen | 25 | Reisen | 83 |
| Familie | 28 | Gesundheit | 92 |
| Zahlen | 28 | Bildung | 84 |
| Farben | 15 | Technologie | 72 |
| Körper | 26 | Sport | 61 |
| Natur | 21 | Musik | 53 |
| Tiere | 23 | Religion | 49 |
| Essen | 165 | Politik | 45 |
| Zeit | 88 | Einkaufen | 41 |
| Verben | 272 | Wetter | 35 |
| Adjektive | 167 | Kultur | 48 |
| Grammatik | 107 | Orte | 106 |
| Haus | 110 | Gefühle | 102 |
| Kleidung | 86 | Sätze | 163 |
| Berufe | 107 | | |

## Lokale Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env.local

# Entwicklungsserver starten
npm run dev
```

### Umgebungsvariablen

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
JWT_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
APPLE_ID=...
APPLE_TEAM_ID=...
APPLE_KEY_ID=...
APPLE_PRIVATE_KEY=...
```

## Deployment

Das Projekt wird automatisch über Vercel deployed. Jeder Push auf `main` löst ein neues Deployment aus.

```bash
npm run build
```

## Lizenz

MIT
