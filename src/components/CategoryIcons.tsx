"use client";

import {
  BookOpen,
  Hand,
  Users,
  Hash,
  Palette,
  User,
  Leaf,
  PawPrint,
  UtensilsCrossed,
  Clock,
  Zap,
  Sparkles,
  FileText,
  Home,
  Shirt,
  Briefcase,
  MapPin,
  Heart,
  MessageCircle,
  Plane,
  Stethoscope,
  GraduationCap,
  Laptop,
  Trophy,
  Music,
  Building,
  Landmark,
  ShoppingCart,
  CloudSun,
  Theater,
  Flame,
  type LucideIcon,
} from "lucide-react";

// Mapping von Kategorie-Keys zu Lucide Icons
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  all: BookOpen,
  greetings: Hand,
  family: Users,
  numbers: Hash,
  colors: Palette,
  body: User,
  nature: Leaf,
  animals: PawPrint,
  food: UtensilsCrossed,
  time: Clock,
  verbs: Zap,
  adjectives: Sparkles,
  grammar: FileText,
  house: Home,
  clothing: Shirt,
  professions: Briefcase,
  places: MapPin,
  emotions: Heart,
  phrases: MessageCircle,
  travel: Plane,
  health: Stethoscope,
  education: GraduationCap,
  technology: Laptop,
  sports: Trophy,
  music: Music,
  religion: Building,
  politics: Landmark,
  shopping: ShoppingCart,
  weather: CloudSun,
  culture: Theater,
};

// Spezielle Level-Icons (für Level 18 "Verben Fortgeschritten" und Level 30 "Meister")
export const LEVEL_ICONS: Record<number, LucideIcon> = {
  18: Flame, // Lêker II - Verben Fortgeschritten
  30: Trophy, // Meister
};

interface CategoryIconProps {
  category: string;
  levelId?: number;
  className?: string;
  size?: number;
}

export function CategoryIcon({ category, levelId, className = "", size = 24 }: CategoryIconProps) {
  // Zuerst prüfen ob es ein spezielles Level-Icon gibt
  if (levelId !== undefined && LEVEL_ICONS[levelId]) {
    const LevelIcon = LEVEL_ICONS[levelId];
    return <LevelIcon className={className} size={size} />;
  }

  // Dann das Kategorie-Icon verwenden
  const Icon = CATEGORY_ICONS[category] || BookOpen;
  return <Icon className={className} size={size} />;
}

// Farben für Kategorien
export const CATEGORY_COLORS: Record<string, string> = {
  all: "text-[var(--green)]",
  greetings: "text-amber-500",
  family: "text-blue-500",
  numbers: "text-purple-500",
  colors: "text-pink-500",
  body: "text-orange-500",
  nature: "text-green-600",
  animals: "text-amber-600",
  food: "text-red-500",
  time: "text-blue-600",
  verbs: "text-yellow-500",
  adjectives: "text-indigo-500",
  grammar: "text-gray-600",
  house: "text-teal-500",
  clothing: "text-cyan-500",
  professions: "text-slate-600",
  places: "text-rose-500",
  emotions: "text-red-400",
  phrases: "text-emerald-500",
  travel: "text-sky-500",
  health: "text-red-600",
  education: "text-violet-500",
  technology: "text-blue-400",
  sports: "text-green-500",
  music: "text-fuchsia-500",
  religion: "text-amber-700",
  politics: "text-gray-700",
  shopping: "text-orange-400",
  weather: "text-sky-400",
  culture: "text-purple-600",
};
