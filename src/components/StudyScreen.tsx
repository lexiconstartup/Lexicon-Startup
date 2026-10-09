import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RotateCw, Volume2, CircleCheck as CheckCircle2, Circle as XCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import type { Language, Rating, CardWithProgress } from "../lib/types";
import { LANGUAGES, getFontForLanguage } from "../lib/types";
import { supabase } from "../lib/supabase";
import { calculateNextReview } from "../lib/srs";

interface Props {
  language: Language;
  onExit: () => void;
}

const RATING_CONFIG: { value: Rating; label: string; color: string; bg: string; icon: typeof ThumbsUp }[] = [
  { value: "again", label: "Again", color: "var(--error-600)", bg: "var(--error-50)", icon: XCircle },
  { value: "hard", label: "Hard", color: "var(--warning-600)", bg: "var(--warning-50)", icon: ThumbsDown },
  { value: "good", label: "Good", color: "var(--primary-600)", bg: "var(--primary-50)", icon: ThumbsUp },
  { value: "easy", label: "Easy", color: "var(--accent-600)", bg: "var(--accent-50)", icon: CheckCircle2 },
];

export default function StudyScreen({ language, onExit }: Props) {
  const [cards, setCards] = useState<CardWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const langInfo = LANGUAGES.find((l) => l.value === language)!;

  const loadCards = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];

    // Get cards due for review + new cards
    const { data: dueProgress } = await supabase
      .from("card_progress")
      .select(`
        flashcard_id,
        interval_days,
        ease_factor,
        repetitions,
        next_review,
        last_reviewed,
        flashcards!inner(id, language, category, front, back, romanization, example, example_translation, created_at)
      `)
      .eq("flashcards.language", language)
      .lte("next_review", today);

    const dueCards: CardWithProgress[] = (dueProgress ?? [])
      .map((p: any) => ({
        ...p.flashcards,
        progress: {
          id: p.flashcard_id,
          flashcard_id: p.flashcard_id,
          interval_days: p.interval_days,
          ease_factor: p.ease_factor,
          repetitions: p.repetitions,
          next_review: p.next_review,
          last_reviewed: p.last_reviewed,
        },
      }))
      .filter((c) => c.id !== undefined);

    const dueIds = dueCards.map((c) => c.id);

    // Get new cards (no progress record yet)
    const { data: newCardsData } = await supabase
      .from("flashcards")
      .select("*")
      .eq("language", language)
      .order("created_at", { ascending: true });

    const newCards: CardWithProgress[] = (newCardsData ?? []).filter(
      (c) => !dueIds.includes(c.id)
    );

    // Prioritize due cards, then add new cards (max 20 total)
    const allCards = [...dueCards, ...newCards].slice(0, 20);

    setCards(allCards);
    setLoading(false);
  }, [language]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const currentCard = cards[currentIndex];

  const speakWord = (text: string) => {
    if ("speechSynthesis" in window) {
      const langMap: Record<Language, string> = {
        spanish: "es-ES",
        mandarin: "zh-CN",
        hindi: "hi-IN",
      };
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langMap[language];
      utterance.rate = 0.85;
      speechSynthesis.speak(utterance);
    }
  };

  const handleRate = async (rating: Rating) => {
    if (!currentCard || submitting) return;
    setSubmitting(true);

    const currentState = currentCard.progress
      ? {
          interval_days: currentCard.progress.interval_days,
          ease_factor: currentCard.progress.ease_factor,
          repetitions: currentCard.progress.repetitions,
        }
      : { interval_days: 0, ease_factor: 2.5, repetitions: 0 };

    const result = calculateNextReview(currentState, rating);

    // Log the review
    await supabase.from("review_logs").insert({
      flashcard_id: currentCard.id,
      rating,
    });

    // Upsert card progress
    if (currentCard.progress) {
      await supabase
        .from("card_progress")
        .update({
          interval_days: result.interval_days,
          ease_factor: result.ease_factor,
          repetitions: result.repetitions,
          next_review: result.next_review,
          last_reviewed: new Date().toISOString().split("T")[0],
        })
        .eq("flashcard_id", currentCard.id);
    } else {
      await supabase.from("card_progress").insert({
        flashcard_id: currentCard.id,
        interval_days: result.interval_days,
        ease_factor: result.ease_factor,
        repetitions: result.repetitions,
        next_review: result.next_review,
        last_reviewed: new Date().toISOString().split("T")[0],
      });
    }

    setSessionStats((prev) => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (rating === "good" || rating === "easy" ? 1 : 0),
    }));

    setSubmitting(false);

    if (currentIndex + 1 >= cards.length) {
      setSessionComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <RotateCw size={32} className="pulse" color="var(--primary-500)" />
      </div>
    );
  }

  if (sessionComplete) {
    const accuracy = sessionStats.reviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
      : 0;
    return (
      <div className="fade-in" style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--accent-100)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <CheckCircle2 size={40} color="var(--accent-600)" />
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 8 }}>
          Session Complete!
        </h2>
        <p style={{ color: "var(--neutral-500)", marginBottom: 32 }}>
          Great work studying {langInfo.label}. Here's your session summary:
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 32 }}>
          <StatBox label="Reviewed" value={sessionStats.reviewed} />
          <StatBox label="Correct" value={sessionStats.correct} />
          <StatBox label="Accuracy" value={`${accuracy}%`} />
        </div>
        <button
          onClick={onExit}
          style={{
            padding: "12px 32px",
            borderRadius: 10,
            background: "var(--primary-600)",
            color: "white",
            fontSize: 15,
            fontWeight: 600,
            boxShadow: "var(--shadow-md)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-700)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary-600)")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="fade-in" style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 12 }}>
          No cards due right now
        </h2>
        <p style={{ color: "var(--neutral-500)", marginBottom: 32 }}>
          You're all caught up! Come back later for your next review session.
        </p>
        <button
          onClick={onExit}
          style={{
            padding: "12px 32px",
            borderRadius: 10,
            background: "var(--primary-600)",
            color: "white",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: "0 auto", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <button
          onClick={onExit}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--neutral-500)",
            fontSize: 14,
            fontWeight: 500,
            padding: "8px 12px",
            borderRadius: 8,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--primary-600)"; e.currentTarget.style.background = "var(--primary-50)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--neutral-500)"; e.currentTarget.style.background = "none"; }}
        >
          <ArrowLeft size={16} />
          Exit
        </button>
        <div style={{ fontSize: 14, color: "var(--neutral-500)", fontWeight: 500 }}>
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "var(--neutral-200)", borderRadius: 100, marginBottom: 32, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${((currentIndex) / cards.length) * 100}%`,
            background: "linear-gradient(90deg, var(--primary-500), var(--primary-600))",
            borderRadius: 100,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Category tag */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span
          style={{
            display: "inline-block",
            padding: "4px 14px",
            borderRadius: 100,
            background: "var(--neutral-100)",
            color: "var(--neutral-600)",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {currentCard.category}
        </span>
        {currentCard.progress && (
          <span
            style={{
              marginLeft: 8,
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: 100,
              background: currentCard.progress.repetitions >= 2 ? "var(--accent-100)" : "var(--warning-100)",
              color: currentCard.progress.repetitions >= 2 ? "var(--accent-700)" : "var(--warning-600)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {currentCard.progress.repetitions >= 2 ? "Learning" : "New"}
          </span>
        )}
      </div>

      {/* Flashcard */}
      <div
        key={currentCard.id}
        className={flipped ? "flip-card" : ""}
        onClick={() => !flipped && setFlipped(true)}
        style={{
          background: "white",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--neutral-200)",
          boxShadow: "var(--shadow-lg)",
          padding: "48px 32px",
          minHeight: 340,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: flipped ? "default" : "pointer",
          position: "relative",
          transition: "all 0.3s",
        }}
      >
        {!flipped ? (
          <>
            <div style={{ fontSize: 13, color: "var(--neutral-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
              What is this in {langInfo.label}?
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "var(--neutral-900)", textAlign: "center", marginBottom: 24 }}>
              {currentCard.front}
            </div>
            <div style={{ fontSize: 14, color: "var(--neutral-400)", marginTop: 16 }}>
              Click to reveal answer
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: "var(--primary-600)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              {currentCard.front}
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: "var(--neutral-900)",
                textAlign: "center",
                marginBottom: 12,
                fontFamily: getFontForLanguage(language),
              }}
            >
              {currentCard.back}
            </div>
            {currentCard.romanization && (
              <div style={{ fontSize: 18, color: "var(--neutral-500)", marginBottom: 16, fontStyle: "italic" }}>
                {currentCard.romanization}
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); speakWord(currentCard.back); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "var(--primary-600)",
                fontSize: 14,
                fontWeight: 500,
                padding: "8px 16px",
                borderRadius: 8,
                background: "var(--primary-50)",
                marginBottom: 20,
                transition: "all 0.2s",
              }}
            >
              <Volume2 size={18} />
              Pronounce
            </button>
            {currentCard.example && (
              <div style={{ marginTop: 12, padding: "16px 20px", background: "var(--neutral-50)", borderRadius: 12, maxWidth: 500 }}>
                <div style={{ fontSize: 16, color: "var(--neutral-700)", marginBottom: 6, fontFamily: getFontForLanguage(language) }}>
                  {currentCard.example}
                </div>
                <div style={{ fontSize: 13, color: "var(--neutral-400)", fontStyle: "italic" }}>
                  {currentCard.example_translation}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="slide-up" style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
          {RATING_CONFIG.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.value}
                onClick={() => handleRate(r.value)}
                disabled={submitting}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 24px",
                  borderRadius: 12,
                  background: r.bg,
                  color: r.color,
                  fontSize: 14,
                  fontWeight: 600,
                  border: `1.5px solid ${r.color}22`,
                  minWidth: 90,
                  transition: "all 0.2s",
                  opacity: submitting ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Icon size={20} />
                {r.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--primary-600)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--neutral-400)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
    </div>
  );
}
