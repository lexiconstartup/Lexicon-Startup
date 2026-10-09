export type Language = "spanish" | "mandarin" | "hindi";
export type Rating = "again" | "hard" | "good" | "easy";
export type Screen = "home" | "study" | "dashboard";

export interface Flashcard {
  id: string;
  language: Language;
  category: string;
  front: string;
  back: string;
  romanization: string | null;
  example: string | null;
  example_translation: string | null;
  created_at: string;
}

export interface CardProgress {
  id: string;
  flashcard_id: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  next_review: string;
  last_reviewed: string | null;
}

export interface CardWithProgress extends Flashcard {
  progress?: CardProgress;
}

export const LANGUAGES: { value: Language; label: string; nativeScript: string; flag: string }[] = [
  { value: "spanish", label: "Spanish", nativeScript: "Español", flag: "ES" },
  { value: "mandarin", label: "Mandarin", nativeScript: "中文", flag: "CN" },
  { value: "hindi", label: "Hindi", nativeScript: "हिन्दी", flag: "IN" },
];

export const CATEGORIES = ["healthcare", "business", "finance", "technology"] as const;

export function getFontForLanguage(lang: Language): string {
  switch (lang) {
    case "mandarin":
      return "'Noto Sans SC', sans-serif";
    case "hindi":
      return "'Noto Sans Devanagari', sans-serif";
    default:
      return "'Inter', sans-serif";
  }
}
