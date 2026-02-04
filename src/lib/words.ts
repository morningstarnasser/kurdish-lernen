export interface Word {
  de: string;
  ku: string;
  c: string;
  n?: string;
  t?: number;
}

// DB word type (from API)
export interface DBWord {
  id: number;
  de: string;
  ku: string;
  category: string;
  note: string | null;
  is_phrase: number;
}

// Convert DB word to Word format
export function dbWordToWord(w: DBWord): Word {
  return {
    de: w.de,
    ku: w.ku,
    c: w.category,
    n: w.note || undefined,
    t: w.is_phrase === 1 ? 1 : undefined,
  };
}

export const CATEGORIES: Record<string, { label: string; icon: string }> = {
  all: { label: "Alle", icon: "📚" },
  greetings: { label: "Begrüssungen", icon: "👋" },
  family: { label: "Familie", icon: "👨‍👩‍👧‍👦" },
  numbers: { label: "Zahlen", icon: "🔢" },
  colors: { label: "Farben", icon: "🎨" },
  body: { label: "Körper", icon: "🧍" },
  nature: { label: "Natur", icon: "🌿" },
  animals: { label: "Tiere", icon: "🐾" },
  food: { label: "Essen", icon: "🍞" },
  time: { label: "Zeit", icon: "⏰" },
  verbs: { label: "Verben", icon: "⚡" },
  adjectives: { label: "Adjektive", icon: "✨" },
  grammar: { label: "Grammatik", icon: "📝" },
  house: { label: "Haus", icon: "🏠" },
  clothing: { label: "Kleidung", icon: "👔" },
  professions: { label: "Berufe", icon: "💼" },
  places: { label: "Orte", icon: "📍" },
  emotions: { label: "Gefühle", icon: "❤️" },
  phrases: { label: "Sätze", icon: "💬" },
  travel: { label: "Reisen", icon: "✈️" },
  health: { label: "Gesundheit", icon: "🏥" },
  education: { label: "Bildung", icon: "🎓" },
  technology: { label: "Technologie", icon: "💻" },
  sports: { label: "Sport", icon: "⚽" },
  music: { label: "Musik", icon: "🎵" },
  religion: { label: "Religion", icon: "🕌" },
  politics: { label: "Politik", icon: "🏛️" },
  shopping: { label: "Einkaufen", icon: "🛒" },
  weather: { label: "Wetter", icon: "🌤️" },
  culture: { label: "Kultur", icon: "🎭" },
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
