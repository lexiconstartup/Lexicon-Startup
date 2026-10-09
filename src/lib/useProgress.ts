import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Language } from "../lib/types";

interface ProgressData {
  totalCards: number;
  learnedCards: number;
  dueToday: number;
  streak: number;
  reviewsToday: number;
}

export function useProgress(language: Language | null) {
  const [progress, setProgress] = useState<ProgressData>({
    totalCards: 0,
    learnedCards: 0,
    dueToday: 0,
    streak: 0,
    reviewsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!language) {
      setLoading(false);
      return;
    }

    const { count: totalCards } = await supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("language", language);

    const { data: progressRows } = await supabase
      .from("card_progress")
      .select(`
        flashcard_id,
        repetitions,
        next_review,
        flashcards!inner(language)
      `)
      .eq("flashcards.language", language);

    const learned = progressRows?.filter((p) => p.repetitions >= 2).length ?? 0;
    const today = new Date().toISOString().split("T")[0];
    const due = progressRows?.filter((p) => p.next_review <= today).length ?? 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const { count: reviewsToday } = await supabase
      .from("review_logs")
      .select("*", { count: "exact", head: true })
      .gte("reviewed_at", startOfToday.toISOString());

    // Calculate streak from review_logs
    const { data: allReviews } = await supabase
      .from("review_logs")
      .select("reviewed_at")
      .order("reviewed_at", { ascending: false })
      .limit(500);

    let streak = 0;
    if (allReviews && allReviews.length > 0) {
      const days = new Set<string>();
      allReviews.forEach((r) => {
        const d = new Date(r.reviewed_at).toISOString().split("T")[0];
        days.add(d);
      });
      const sortedDays = Array.from(days).sort().reverse();
      const todayStr = new Date().toISOString().split("T")[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      if (sortedDays[0] === todayStr || sortedDays[0] === yesterdayStr) {
        streak = 1;
        for (let i = 1; i < sortedDays.length; i++) {
          const prev = new Date(sortedDays[i - 1]);
          const curr = new Date(sortedDays[i]);
          const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
          if (diff === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    setProgress({
      totalCards: totalCards ?? 0,
      learnedCards: learned,
      dueToday: due,
      streak,
      reviewsToday: reviewsToday ?? 0,
    });
    setLoading(false);
  }, [language]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, loading, refetch: fetchProgress };
}
