export interface Word {
  de: string;
  ku: string;
  c: string;
  n?: string;
  t?: number;
  a?: string; // audio URL
  as?: string; // audio source: 'manual' | 'forvo' | 'tts'
  def?: string; // Kurdish definition from Wiktionary
}

// DB word type (from API)
export interface DBWord {
  id: number;
  de: string;
  ku: string;
  category: string;
  note: string | null;
  is_phrase: number;
  audio_url: string | null;
  audio_source: string | null;
  definition_ku: string | null;
}

// Convert DB word to Word format
export function dbWordToWord(w: DBWord): Word {
  return {
    de: w.de,
    ku: w.ku,
    c: w.category,
    n: w.note || undefined,
    t: w.is_phrase === 1 ? 1 : undefined,
    a: w.audio_url || undefined,
    as: w.audio_source || undefined,
    def: w.definition_ku || undefined,
  };
}

export const CATEGORIES: Record<string, { label: string; label_ku: string; icon: string }> = {
  all: { label: "Alle", label_ku: "Hemû", icon: "📚" },
  greetings: { label: "Begrüssungen", label_ku: "Silav", icon: "👋" },
  family: { label: "Familie", label_ku: "Malbat", icon: "👨‍👩‍👧‍👦" },
  numbers: { label: "Zahlen", label_ku: "Hejmar", icon: "🔢" },
  colors: { label: "Farben", label_ku: "Reng", icon: "🎨" },
  body: { label: "Körper", label_ku: "Laş", icon: "🧍" },
  nature: { label: "Natur", label_ku: "Xweza", icon: "🌿" },
  animals: { label: "Tiere", label_ku: "Ajal", icon: "🐾" },
  food: { label: "Essen", label_ku: "Xwarin", icon: "🍞" },
  time: { label: "Zeit", label_ku: "Dem", icon: "⏰" },
  verbs: { label: "Verben", label_ku: "Lêker", icon: "⚡" },
  adjectives: { label: "Adjektive", label_ku: "Rengdêr", icon: "✨" },
  grammar: { label: "Grammatik", label_ku: "Rêziman", icon: "📝" },
  house: { label: "Haus", label_ku: "Mal", icon: "🏠" },
  clothing: { label: "Kleidung", label_ku: "Cil", icon: "👔" },
  professions: { label: "Berufe", label_ku: "Kar", icon: "💼" },
  places: { label: "Orte", label_ku: "Cih", icon: "📍" },
  emotions: { label: "Gefühle", label_ku: "Hest", icon: "❤️" },
  phrases: { label: "Sätze", label_ku: "Hevok", icon: "💬" },
  travel: { label: "Reisen", label_ku: "Rêwîtî", icon: "✈️" },
  health: { label: "Gesundheit", label_ku: "Tenduristî", icon: "🏥" },
  education: { label: "Bildung", label_ku: "Perwerde", icon: "🎓" },
  technology: { label: "Technologie", label_ku: "Teknolojî", icon: "💻" },
  sports: { label: "Sport", label_ku: "Werzîş", icon: "⚽" },
  music: { label: "Musik", label_ku: "Muzîk", icon: "🎵" },
  religion: { label: "Religion", label_ku: "Ol", icon: "🕌" },
  politics: { label: "Politik", label_ku: "Siyaset", icon: "🏛️" },
  shopping: { label: "Einkaufen", label_ku: "Bazêr", icon: "🛒" },
  weather: { label: "Wetter", label_ku: "Hewa", icon: "🌤️" },
  culture: { label: "Kultur", label_ku: "Çand", icon: "🎭" },
};

export const LEVELS = [
  { id: 0, name: "Silav!", icon: "👋", cat: "greetings", desc: "Begrüssungen", count: 10 },
  { id: 1, name: "Malbat", icon: "👨‍👩‍👧‍👦", cat: "family", desc: "Familie", count: 10 },
  { id: 2, name: "Hejmar", icon: "🔢", cat: "numbers", desc: "Zahlen 1-20", count: 12 },
  { id: 3, name: "Reng", icon: "🎨", cat: "colors", desc: "Farben", count: 10 },
  { id: 4, name: "Laş", icon: "🧍", cat: "body", desc: "Körperteile", count: 12 },
  { id: 5, name: "Xwarin", icon: "🍞", cat: "food", desc: "Essen & Trinken", count: 12 },
  { id: 6, name: "Xweza", icon: "🌿", cat: "nature", desc: "Natur", count: 12 },
  { id: 7, name: "Ajal", icon: "🐾", cat: "animals", desc: "Tiere", count: 10 },
  { id: 8, name: "Dem", icon: "⏰", cat: "time", desc: "Zeit & Tage", count: 12 },
  { id: 9, name: "Lêker I", icon: "⚡", cat: "verbs", desc: "Verben Basis", count: 12 },
  { id: 10, name: "Rengdêr", icon: "✨", cat: "adjectives", desc: "Adjektive", count: 12 },
  { id: 11, name: "Rêziman", icon: "📝", cat: "grammar", desc: "Grammatik", count: 10 },
  { id: 12, name: "Mal", icon: "🏠", cat: "house", desc: "Haus & Wohnen", count: 10 },
  { id: 13, name: "Cil", icon: "👔", cat: "clothing", desc: "Kleidung", count: 10 },
  { id: 14, name: "Kar", icon: "💼", cat: "professions", desc: "Berufe", count: 10 },
  { id: 15, name: "Cih", icon: "📍", cat: "places", desc: "Orte", count: 10 },
  { id: 16, name: "Hest", icon: "❤️", cat: "emotions", desc: "Gefühle", count: 10 },
  { id: 17, name: "Hevok", icon: "💬", cat: "phrases", desc: "Wichtige Sätze", count: 10 },
  { id: 18, name: "Lêker II", icon: "🔥", cat: "verbs", desc: "Verben Fortgeschritten", count: 12 },
  { id: 19, name: "Rêwîtî", icon: "✈️", cat: "travel", desc: "Reisen", count: 10 },
  { id: 20, name: "Tenduristî", icon: "🏥", cat: "health", desc: "Gesundheit", count: 10 },
  { id: 21, name: "Perwerde", icon: "🎓", cat: "education", desc: "Bildung", count: 10 },
  { id: 22, name: "Teknolojî", icon: "💻", cat: "technology", desc: "Technologie", count: 10 },
  { id: 23, name: "Werzîş", icon: "⚽", cat: "sports", desc: "Sport", count: 10 },
  { id: 24, name: "Muzîk", icon: "🎵", cat: "music", desc: "Musik", count: 10 },
  { id: 25, name: "Ol", icon: "🕌", cat: "religion", desc: "Religion", count: 10 },
  { id: 26, name: "Siyaset", icon: "🏛️", cat: "politics", desc: "Politik", count: 10 },
  { id: 27, name: "Bazêr", icon: "🛒", cat: "shopping", desc: "Einkaufen", count: 10 },
  { id: 28, name: "Hewa", icon: "🌤️", cat: "weather", desc: "Wetter", count: 10 },
  { id: 29, name: "Çand", icon: "🎭", cat: "culture", desc: "Kultur", count: 10 },
  { id: 30, name: "Meister", icon: "🏆", cat: "all", desc: "Alles gemischt!", count: 15 },
];
