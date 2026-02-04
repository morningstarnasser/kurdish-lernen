import Link from "next/link";

// Auth redirect handled by middleware.ts (keeps this page static/cached)
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Mountain landscape gradient background */}
        <div className="absolute inset-0 gradient-mountain" />

        {/* Decorative mountain shapes */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 320"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              fill="#2d8a4e"
              fillOpacity="0.3"
              d="M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,234.7C840,245,960,235,1080,213.3C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            />
            <path
              fill="#58CC02"
              fillOpacity="0.4"
              d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
            <path
              fill="#F7F7F7"
              d="M0,288L48,282.7C96,277,192,267,288,272C384,277,480,299,576,304C672,309,768,299,864,288C960,277,1056,267,1152,266.7C1248,267,1344,277,1392,282.7L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-40 md:pt-28 md:pb-52 text-center">
          {/* Logo */}
          <div className="animate-bounce-in mb-6">
            <span className="text-6xl md:text-8xl font-black text-white drop-shadow-lg">
              Ferheng
            </span>
          </div>

          {/* Kurdish sun symbol */}
          <div className="animate-float mb-8">
            <span className="text-5xl md:text-6xl">&#9788;</span>
          </div>

          {/* Tagline */}
          <p className="animate-fade-in-up text-xl md:text-2xl font-extrabold text-white drop-shadow-lg mb-4 max-w-xl mx-auto">
            Lerne Kurdisch (Badini) spielerisch
          </p>
          <p className="animate-fade-in-up delay-200 text-base md:text-lg font-semibold text-white/95 drop-shadow-md mb-12 max-w-lg mx-auto opacity-0">
            Interaktive Lektionen, ein umfangreiches Wörterbuch und
            Fortschrittsverfolgung - alles in einer App.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0">
            <Link
              href="/register"
              className="btn-primary text-lg px-10 py-4 inline-block no-underline w-full sm:w-auto text-center"
            >
              Jetzt starten
            </Link>
            <Link
              href="/login"
              className="btn-secondary text-lg px-10 py-4 inline-block no-underline w-full sm:w-auto text-center"
            >
              Anmelden
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-foreground mb-4">
            Warum Ferheng?
          </h2>
          <p className="text-center text-gray-400 font-semibold mb-14 max-w-md mx-auto">
            Alles was du brauchst, um Kurdisch zu lernen
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Wörterbuch */}
            <div className="card text-center group">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-blue-light/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                &#128218;
              </div>
              <h3 className="text-xl font-extrabold text-foreground mb-2">
                Wörterbuch
              </h3>
              <p className="text-gray-400 font-medium leading-relaxed">
                Umfangreiches Deutsch-Kurdisch Wörterbuch mit Kategorien und
                Suchfunktion.
              </p>
            </div>

            {/* Feature 2: Lernspiele */}
            <div className="card text-center group">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-green-bg flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                &#127918;
              </div>
              <h3 className="text-xl font-extrabold text-foreground mb-2">
                Lernspiele
              </h3>
              <p className="text-gray-400 font-medium leading-relaxed">
                Spannende Quiz-Spiele und interaktive Übungen zum Vokabeln
                lernen.
              </p>
            </div>

            {/* Feature 3: Fortschritt */}
            <div className="card text-center group">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gold/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                &#128200;
              </div>
              <h3 className="text-xl font-extrabold text-foreground mb-2">
                Fortschritt
              </h3>
              <p className="text-gray-400 font-medium leading-relaxed">
                Verfolge deinen Lernfortschritt mit XP, Streaks und
                Statistiken.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-14">
            So funktioniert es
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-green flex items-center justify-center text-white text-2xl font-black mb-4 shadow-lg">
                1
              </div>
              <h3 className="font-extrabold text-lg text-foreground mb-2">
                Registrieren
              </h3>
              <p className="text-gray-400 font-medium">
                Erstelle kostenlos dein Konto
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-blue flex items-center justify-center text-white text-2xl font-black mb-4 shadow-lg">
                2
              </div>
              <h3 className="font-extrabold text-lg text-foreground mb-2">
                Lernen
              </h3>
              <p className="text-gray-400 font-medium">
                Wähle Lektionen und lerne neue Wörter
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center text-white text-2xl font-black mb-4 shadow-lg">
                3
              </div>
              <h3 className="font-extrabold text-lg text-foreground mb-2">
                Meistern
              </h3>
              <p className="text-gray-400 font-medium">
                Sammle XP und baue deinen Streak auf
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-foreground text-white/60 text-center">
        <p className="font-bold text-white/80 mb-2">
          Ferheng{" "}
          <span className="text-green">&#9679;</span> Kurdisch Lernen
        </p>
        <p className="text-sm">
          Mit Liebe gemacht, um die kurdische Sprache zu bewahren.
        </p>
      </footer>
    </div>
  );
}
