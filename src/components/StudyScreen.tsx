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
  { value: "again", label: "Again", color: "var(--destructive)", bg: "rgba(185, 28, 28, 0.06)", icon: XCircle },
  { value: "hard", label: "Hard", color: "var(--warning)", bg: "rgba(201, 120, 23, 0.08)", icon: ThumbsDown },
  { value: "good", label: "Good", color: "var(--primary)", bg: "rgba(10, 26, 63, 0.06)", icon: ThumbsUp },
  { value: "easy", label: "Easy", color: "var(--success)", bg: "rgba(45, 122, 79, 0.08)", icon: CheckCircle2 },
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

    const { data: newCardsData } = await supabase
      .from("flashcards")
      .select("*")
      .eq("language", language)
      .order("created_at", { ascending: true });

    const newCards: CardWithProgress[] = (newCardsData ?? []).filter(
      (c) => !dueIds.includes(c.id)
    );

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

    await supabase.from("review_logs").insert({ flashcard_id: currentCard.id, rating });

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
        <RotateCw size={28} className="pulse" color="var(--primary)" />
      </div>
    );
  }

  if (sessionComplete) {
    const accuracy = sessionStats.reviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
      : 0;
    return (
      <div className="fade-in" style={{ maxWidth: 460, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--cream)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <CheckCircle2 size={36} color="var(--success)" strokeWidth={1.5} />
        </div>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: 30,
            fontWeight: 500,
            color: "var(--primary)",
            marginBottom: 10,
          }}
        >
          Session Complete
        </h2>
        <p style={{ fontFamily: "var(--sans)", fontSize: 15, color: "var(--muted-foreground)", marginBottom: 36 }}>
          Great work studying {langInfo.label}. Here's your session summary:
        </p>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 36 }}>
          <StatBox label="Reviewed" value={sessionStats.reviewed} />
          <StatBox label="Correct" value={sessionStats.correct} />
          <StatBox label="Accuracy" value={`${accuracy}%`} />
        </div>
        <button
          onClick={onExit}
          style={{
            padding: "14px 36px",
            borderRadius: 100,
            background: "var(--primary)",
            color: "var(--cream-soft)",
            fontFamily: "var(--sans)",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.02em",
            boxShadow: "var(--shadow-md)",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-soft)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--primary)")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="fade-in" style={{ maxWidth: 460, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: 26,
            fontWeight: 500,
            color: "var(--primary)",
            marginBottom: 12,
          }}
        >
          No cards due right now
        </h2>
        <p style={{ fontFamily: "var(--sans)", fontSize: 15, color: "var(--muted-foreground)", marginBottom: 32 }}>
          You're all caught up. Come back later for your next review session.
        </p>
        <button
          onClick={onExit}
          style={{
            padding: "14px 36px",
            borderRadius: 100,
            background: "var(--primary)",
            color: "var(--cream-soft)",
            fontFamily: "var(--sans)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 660, margin: "0 auto", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button
          onClick={onExit}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--muted-foreground)",
            fontFamily: "var(--sans)",
            fontSize: 13,
            fontWeight: 500,
            padding: "8px 16px",
            borderRadius: 100,
            border: "1px solid var(--border)",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--primary)";
            e.currentTarget.style.borderColor = "var(--border-strong)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--muted-foreground)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          <ArrowLeft size={15} />
          Exit
        </button>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 13,
            color: "var(--muted-foreground)",
            fontWeight: 500,
          }}
        >
          {String(currentIndex + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "var(--cream)", borderRadius: 100, marginBottom: 32, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${(currentIndex / cards.length) * 100}%`,
            background: "var(--primary)",
            borderRadius: 100,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Category tag */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span
          style={{
            fontFamily: "var(--sans)",
            display: "inline-block",
            padding: "5px 16px",
            borderRadius: 100,
            background: "var(--cream)",
            color: "var(--primary)",
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {currentCard.category}
        </span>
        {currentCard.progress && (
          <span
            style={{
              marginLeft: 8,
              fontFamily: "var(--sans)",
              display: "inline-block",
              padding: "5px 16px",
              borderRadius: 100,
              background: currentCard.progress.repetitions >= 2 ? "rgba(45, 122, 79, 0.1)" : "rgba(201, 168, 76, 0.12)",
              color: currentCard.progress.repetitions >= 2 ? "var(--success)" : "var(--warning)",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
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
          background: "var(--card)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          padding: "48px 36px",
          minHeight: 340,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: flipped ? "default" : "pointer",
          transition: "all 0.3s ease",
        }}
      >
        {!flipped ? (
          <>
            <div
              style={{
                fontFamily: "var(--sans)",
                fontSize: 12,
                color: "var(--muted-foreground)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 20,
              }}
            >
              What is this in {langInfo.label}?
            </div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: 38,
                fontWeight: 500,
                color: "var(--primary)",
                textAlign: "center",
                marginBottom: 24,
                letterSpacing: "-0.01em",
              }}
            >
              {currentCard.front}
            </div>
            <div
              style={{
                fontFamily: "var(--sans)",
                fontSize: 13,
                color: "var(--cream-deep)",
                marginTop: 8,
              }}
            >
              Click to reveal answer
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontFamily: "var(--sans)",
                fontSize: 12,
                color: "var(--muted-foreground)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 10,
              }}
            >
              {currentCard.front}
            </div>
            <div
              style={{
                fontFamily: getFontForLanguage(language),
                fontSize: 42,
                fontWeight: 700,
                color: "var(--primary)",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              {currentCard.back}
            </div>
            {currentCard.romanization && (
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 18,
                  color: "var(--muted-foreground)",
                  marginBottom: 16,
                  fontStyle: "italic",
                }}
              >
                {currentCard.romanization}
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakWord(currentCard.back);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "var(--primary)",
                fontFamily: "var(--sans)",
                fontSize: 13,
                fontWeight: 500,
                padding: "8px 18px",
                borderRadius: 100,
                background: "var(--cream)",
                marginBottom: 24,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--cream-deep)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--cream)";
              }}
            >
              <Volume2 size={16} />
              Pronounce
            </button>
            {currentCard.example && (
              <div
                style={{
                  marginTop: 8,
                  padding: "18px 22px",
                  background: "var(--cream-soft)",
                  borderRadius: "var(--radius)",
                  maxWidth: 500,
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontFamily: getFontForLanguage(language),
                    fontSize: 16,
                    color: "var(--foreground)",
                    marginBottom: 8,
                    lineHeight: 1.5,
                  }}
                >
                  {currentCard.example}
                </div>
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 13,
                    color: "var(--muted-foreground)",
                    fontStyle: "italic",
                  }}
                >
                  {currentCard.example_translation}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div
          className="slide-up"
          style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}
        >
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
                  borderRadius: "var(--radius)",
                  background: r.bg,
                  color: r.color,
                  fontFamily: "var(--sans)",
                  fontSize: 13,
                  fontWeight: 600,
                  border: `1px solid ${r.color}22`,
                  minWidth: 84,
                  transition: "all 0.2s ease",
                  opacity: submitting ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Icon size={18} strokeWidth={1.5} />
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
      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: 28,
          fontWeight: 500,
          color: "var(--primary)",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--sans)",
          fontSize: 11,
          color: "var(--muted-foreground)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}
