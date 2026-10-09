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
      .in(
        "flashcard_id",
        (cards ?? []).map((c) => c.id)
      );

    const learnedIds = new Set(
      (progRows ?? []).filter((p) => p.repetitions >= 2).map((p) => p.flashcard_id)
    );

    const cats: CategoryStat[] = [];
    const catMap = new Map<string, { total: number; learned: number }>();

    (cards ?? []).forEach((c) => {
      if (!catMap.has(c.category)) catMap.set(c.category, { total: 0, learned: 0 });
      const entry = catMap.get(c.category)!;
      entry.total++;
      if (learnedIds.has(c.id)) entry.learned++;
    });

    catMap.forEach((v, k) => cats.push({ category: k, total: v.total, learned: v.learned }));
    cats.sort((a, b) => a.category.localeCompare(b.category));
    setCategoryStats(cats);
  };

  const accuracyPct = progress.totalCards > 0
    ? Math.round((progress.learnedCards / progress.totalCards) * 100)
    : 0;

  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "var(--neutral-500)",
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 24,
          padding: "8px 12px",
          borderRadius: 8,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--primary-600)"; e.currentTarget.style.background = "var(--primary-50)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--neutral-500)"; e.currentTarget.style.background = "none"; }}
      >
        <ArrowLeft size={16} />
        All Languages
      </button>

      {/* Language Header */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--primary-600), var(--primary-800))",
          borderRadius: "var(--radius-xl)",
          padding: "32px 36px",
          color: "white",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 14, opacity: 0.8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            {langInfo.flag} · Professional Fluency
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>{langInfo.label}</h1>
          <p style={{ fontSize: 16, opacity: 0.85 }}>
            {progress.dueToday > 0
              ? `${progress.dueToday} cards due for review today`
              : "No cards due — start a new study session!"}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            right: -20,
            top: -20,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: -40,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon={<BookOpen size={20} />}
          label="Total Cards"
          value={loading ? "—" : progress.totalCards}
          color="var(--primary-600)"
          bg="var(--primary-50)"
        />
        <StatCard
          icon={<Target size={20} />}
          label="Learned"
          value={loading ? "—" : progress.learnedCards}
          color="var(--accent-600)"
          bg="var(--accent-50)"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Due Today"
          value={loading ? "—" : progress.dueToday}
          color="var(--warning-600)"
          bg="var(--warning-50)"
        />
        <StatCard
          icon={<Flame size={20} />}
          label="Day Streak"
          value={loading ? "—" : progress.streak}
          color="var(--error-500)"
          bg="var(--error-50)"
        />
      </div>

      {/* Study Button */}
      <button
        onClick={onStudy}
        style={{
          width: "100%",
          padding: "18px",
          borderRadius: "var(--radius-lg)",
          background: "var(--primary-600)",
          color: "white",
          fontSize: 17,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          boxShadow: "var(--shadow-lg)",
          transition: "all 0.2s",
          marginBottom: 32,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--primary-700)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--primary-600)";
          e.currentTarget.style.transform = "none";
        }}
      >
        <Play size={22} fill="white" />
        {progress.dueToday > 0 ? `Study ${progress.dueToday} Due Cards` : "Start Study Session"}
      </button>

      {/* Progress bar */}
      <div
        style={{
          background: "white",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--neutral-200)",
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-900)" }}>Overall Progress</h3>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--primary-600)" }}>{accuracyPct}%</span>
        </div>
        <div style={{ height: 8, background: "var(--neutral-100)", borderRadius: 100, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${accuracyPct}%`,
              background: "linear-gradient(90deg, var(--primary-500), var(--accent-500))",
              borderRadius: 100,
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <div style={{ fontSize: 13, color: "var(--neutral-400)", marginTop: 8 }}>
          {progress.learnedCards} of {progress.totalCards} cards learned
        </div>
      </div>

      {/* Category breakdown */}
      <div
        style={{
          background: "white",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--neutral-200)",
          padding: 24,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-900)", marginBottom: 20 }}>
          By Category
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {categoryStats.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.category] ?? BookOpen;
            const pct = cat.total > 0 ? Math.round((cat.learned / cat.total) * 100) : 0;
            return (
              <div key={cat.category}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <Icon size={18} color="var(--neutral-500)" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--neutral-700)", textTransform: "capitalize" }}>
                    {cat.category}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--neutral-400)", marginLeft: "auto" }}>
                    {cat.learned}/{cat.total}
                  </span>
                </div>
                <div style={{ height: 6, background: "var(--neutral-100)", borderRadius: 100, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "var(--primary-500)",
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
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--neutral-200)",
        padding: 20,
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          marginBottom: 12,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "var(--neutral-900)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--neutral-400)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}
