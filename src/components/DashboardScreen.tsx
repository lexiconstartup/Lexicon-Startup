import { useEffect, useState } from "react";
import { ArrowLeft, Play, TrendingUp, Flame, BookOpen, Target, Stethoscope, Briefcase, Banknote, Cpu } from "lucide-react";
import type { Language } from "../lib/types";
import { LANGUAGES } from "../lib/types";
import { supabase } from "../lib/supabase";
import { useProgress } from "../lib/useProgress";

interface Props {
  language: Language;
  onStudy: () => void;
  onBack: () => void;
}

const CATEGORY_ICONS: Record<string, typeof Stethoscope> = {
  healthcare: Stethoscope,
  business: Briefcase,
  finance: Banknote,
  technology: Cpu,
};

interface CategoryStat {
  category: string;
  total: number;
  learned: number;
}

export default function DashboardScreen({ language, onStudy, onBack }: Props) {
  const { progress, loading, refetch } = useProgress(language);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const langInfo = LANGUAGES.find((l) => l.value === language)!;

  useEffect(() => {
    refetch();
    loadCategoryStats();
  }, [language]);

  const loadCategoryStats = async () => {
    const { data: cards } = await supabase
      .from("flashcards")
      .select("id, category")
      .eq("language", language);

    const { data: progRows } = await supabase
      .from("card_progress")
      .select("flashcard_id, repetitions")
      .in("flashcard_id", (cards ?? []).map((c) => c.id));

    const learnedIds = new Set(
      (progRows ?? []).filter((p) => p.repetitions >= 2).map((p) => p.flashcard_id)
    );

    const catMap = new Map<string, { total: number; learned: number }>();
    (cards ?? []).forEach((c) => {
      if (!catMap.has(c.category)) catMap.set(c.category, { total: 0, learned: 0 });
      const entry = catMap.get(c.category)!;
      entry.total++;
      if (learnedIds.has(c.id)) entry.learned++;
    });

    const cats: CategoryStat[] = [];
    catMap.forEach((v, k) => cats.push({ category: k, total: v.total, learned: v.learned }));
    cats.sort((a, b) => a.category.localeCompare(b.category));
    setCategoryStats(cats);
  };

  const accuracyPct = progress.totalCards > 0
    ? Math.round((progress.learnedCards / progress.totalCards) * 100)
    : 0;

  return (
    <div className="fade-in" style={{ maxWidth: 840, margin: "0 auto", padding: "32px 24px 80px" }}>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "var(--muted-foreground)",
          fontFamily: "var(--sans)",
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 28,
          padding: "8px 18px",
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
        All Languages
      </button>

      {/* Language Header */}
      <div
        style={{
          background: "var(--primary)",
          borderRadius: "var(--radius-xl)",
          padding: "40px 36px",
          color: "var(--cream-soft)",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--accent-light)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {langInfo.flag} · Professional Fluency
          </div>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: 36,
              fontWeight: 500,
              marginBottom: 8,
              letterSpacing: "-0.01em",
            }}
          >
            {langInfo.label}
          </h1>
          <p style={{ fontFamily: "var(--sans)", fontSize: 16, color: "rgba(245, 230, 200, 0.8)" }}>
            {progress.dueToday > 0
              ? `${progress.dueToday} cards due for review today`
              : "No cards due — start a new study session"}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            right: -30,
            top: -30,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(201, 168, 76, 0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 50,
            bottom: -50,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(201, 168, 76, 0.05)",
          }}
        />
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard icon={<BookOpen size={18} />} label="Total Cards" value={loading ? "—" : progress.totalCards} />
        <StatCard icon={<Target size={18} />} label="Learned" value={loading ? "—" : progress.learnedCards} />
        <StatCard icon={<TrendingUp size={18} />} label="Due Today" value={loading ? "—" : progress.dueToday} />
        <StatCard icon={<Flame size={18} />} label="Day Streak" value={loading ? "—" : progress.streak} />
      </div>

      {/* Study Button */}
      <button
        onClick={onStudy}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "var(--radius)",
          background: "var(--primary)",
          color: "var(--cream-soft)",
          fontFamily: "var(--sans)",
          fontSize: 16,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          letterSpacing: "0.02em",
          boxShadow: "var(--shadow-md)",
          transition: "all 0.25s ease",
          marginBottom: 32,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--primary-soft)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--primary)";
          e.currentTarget.style.transform = "none";
        }}
      >
        <Play size={20} fill="currentColor" />
        {progress.dueToday > 0 ? `Study ${progress.dueToday} Due Cards` : "Start Study Session"}
      </button>

      {/* Progress bar */}
      <div
        style={{
          background: "var(--card)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          padding: 24,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3
            style={{
              fontFamily: "var(--sans)",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--primary)",
            }}
          >
            Overall Progress
          </h3>
          <span style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
            {accuracyPct}%
          </span>
        </div>
        <div style={{ height: 6, background: "var(--cream)", borderRadius: 100, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${accuracyPct}%`,
              background: "linear-gradient(90deg, var(--primary-soft), var(--accent))",
              borderRadius: 100,
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <div style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--muted-foreground)", marginTop: 8 }}>
          {progress.learnedCards} of {progress.totalCards} cards learned
        </div>
      </div>

      {/* Category breakdown */}
      <div
        style={{
          background: "var(--card)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          padding: 24,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--sans)",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--primary)",
            marginBottom: 20,
          }}
        >
          By Category
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {categoryStats.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.category] ?? BookOpen;
            const pct = cat.total > 0 ? Math.round((cat.learned / cat.total) * 100) : 0;
            return (
              <div key={cat.category}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <Icon size={16} color="var(--muted-foreground)" strokeWidth={1.5} />
                  <span
                    style={{
                      fontFamily: "var(--sans)",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--primary)",
                      textTransform: "capitalize",
                    }}
                  >
                    {cat.category}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {cat.learned}/{cat.total}
                  </span>
                </div>
                <div style={{ height: 5, background: "var(--cream)", borderRadius: 100, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "var(--primary-soft)",
                      borderRadius: 100,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        padding: 18,
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius-sm)",
          background: "var(--cream)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--primary)",
          marginBottom: 12,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: 24,
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
          fontWeight: 500,
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}
