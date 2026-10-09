import { useState } from "react";
import { GraduationCap, Stethoscope, Briefcase, Banknote, Cpu, ArrowRight, ChartBar as BarChart3 } from "lucide-react";
import type { Language } from "../lib/types";
import { LANGUAGES, getFontForLanguage } from "../lib/types";

interface Props {
  onStudy: (lang: Language) => void;
  onDashboard: (lang: Language) => void;
}

const CATEGORY_ICONS: Record<string, typeof Stethoscope> = {
  healthcare: Stethoscope,
  business: Briefcase,
  finance: Banknote,
  technology: Cpu,
};

export default function HomeScreen({ onStudy, onDashboard }: Props) {
  const [hoveredLang, setHoveredLang] = useState<Language | null>(null);

  return (
    <div className="fade-in">
      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "80px 24px 60px",
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 18px",
            borderRadius: 100,
            background: "var(--primary-50)",
            color: "var(--primary-700)",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          <GraduationCap size={16} />
          Active Recall for Professional Fluency
        </div>
        <h1
          style={{
            fontSize: 44,
            fontWeight: 700,
            lineHeight: 1.15,
            color: "var(--neutral-900)",
            marginBottom: 20,
            letterSpacing: "-0.02em",
          }}
        >
          Speak confidently in any{" "}
          <span style={{ color: "var(--primary-600)" }}>professional setting</span>
        </h1>
        <p
          style={{
            fontSize: 18,
            color: "var(--neutral-500)",
            lineHeight: 1.6,
            maxWidth: 560,
            margin: "0 auto 40px",
          }}
        >
          Learn industry-specific terminology in Spanish, Mandarin, and Hindi through
          active recall flashcards with spaced repetition. Turn the language you know into
          the language your profession demands.
        </p>

        {/* Language Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            maxWidth: 880,
            margin: "0 auto",
          }}
        >
          {LANGUAGES.map((lang) => {
            const isHovered = hoveredLang === lang.value;
            return (
              <div
                key={lang.value}
                onClick={() => onDashboard(lang.value)}
                onMouseEnter={() => setHoveredLang(lang.value)}
                onMouseLeave={() => setHoveredLang(null)}
                style={{
                  background: "white",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--neutral-200)",
                  padding: 28,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isHovered ? "translateY(-4px)" : "none",
                  boxShadow: isHovered ? "var(--shadow-xl)" : "var(--shadow-sm)",
                  borderColor: isHovered ? "var(--primary-300)" : "var(--neutral-200)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--neutral-400)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {lang.flag}
                  </span>
                  <ArrowRight
                    size={20}
                    color={isHovered ? "var(--primary-600)" : "var(--neutral-300)"}
                    style={{
                      transition: "all 0.3s",
                      transform: isHovered ? "translateX(4px)" : "none",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--neutral-900)",
                    marginBottom: 4,
                    fontFamily: getFontForLanguage(lang.value),
                  }}
                >
                  {lang.nativeScript}
                </div>
                <div style={{ fontSize: 15, color: "var(--neutral-500)" }}>
                  {lang.label}
                </div>
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: "1px solid var(--neutral-100)",
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  {Object.keys(CATEGORY_ICONS).map((cat) => {
                    const Icon = CATEGORY_ICONS[cat];
                    return (
                      <div
                        key={cat}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          color: "var(--neutral-500)",
                          textTransform: "capitalize",
                        }}
                      >
                        <Icon size={14} />
                        {cat}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 40,
            color: "var(--neutral-900)",
          }}
        >
          How it works
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 24,
          }}
        >
          {[
            {
              num: "1",
              title: "Choose your language & field",
              desc: "Select from Spanish, Mandarin, or Hindi and a professional category like healthcare, business, finance, or technology.",
            },
            {
              num: "2",
              title: "Study with active recall",
              desc: "See the English term, try to recall the translation, then flip the card to check. Rate your recall to schedule the next review.",
            },
            {
              num: "3",
              title: "Build long-term retention",
              desc: "Our spaced repetition algorithm schedules cards you struggle with more frequently, and confident cards less often.",
            },
          ].map((step) => (
            <div
              key={step.num}
              style={{
                background: "white",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--neutral-200)",
                padding: 28,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "var(--primary-600)",
                  color: "white",
                  fontSize: 18,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                {step.num}
              </div>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: "var(--neutral-900)",
                  marginBottom: 8,
                }}
              >
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--neutral-500)", lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
