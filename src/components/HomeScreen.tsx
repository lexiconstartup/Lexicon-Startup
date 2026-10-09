import { useState } from "react";
import { ArrowRight, RotateCw, Brain, Layers, Target } from "lucide-react";
import type { Language } from "../lib/types";
import { LANGUAGES, getFontForLanguage } from "../lib/types";

interface Props {
  onStudy: (lang: Language) => void;
  onDashboard: (lang: Language) => void;
}

export default function HomeScreen({ onStudy, onDashboard }: Props) {
  const [hoveredLang, setHoveredLang] = useState<Language | null>(null);

  return (
    <div className="fade-in">
      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "72px 24px 48px",
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontFamily: "var(--sans)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--primary)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 28,
            paddingBottom: 6,
            borderBottom: "1px solid var(--border-strong)",
          }}
        >
          Active Recall · Professional Fluency
        </div>

        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(36px, 6vw, 52px)",
            fontWeight: 500,
            lineHeight: 1.1,
            color: "var(--primary)",
            marginBottom: 24,
            letterSpacing: "-0.02em",
          }}
        >
          Speak confidently in any{" "}
          <em style={{ fontWeight: 400, color: "var(--primary-soft)" }}>
            professional setting
          </em>
          .
        </h1>

        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: 17,
            color: "var(--muted-foreground)",
            lineHeight: 1.65,
            maxWidth: 520,
            margin: "0 auto 40px",
          }}
        >
          Turn the language you already speak into the language your profession demands.
          Build industry-specific vocabulary in Spanish, Mandarin, and Hindi through active
          recall flashcards with spaced repetition.
        </p>

        {/* Language Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            maxWidth: 820,
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
                  background: "var(--card)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  padding: 28,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isHovered ? "translateY(-3px)" : "none",
                  boxShadow: isHovered ? "var(--shadow-lg)" : "var(--shadow-sm)",
                  borderColor: isHovered ? "var(--border-strong)" : "var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--muted-foreground)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {lang.flag}
                  </span>
                  <ArrowRight
                    size={18}
                    color={isHovered ? "var(--primary)" : "var(--cream-deep)"}
                    style={{
                      transition: "all 0.3s",
                      transform: isHovered ? "translateX(4px)" : "none",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: getFontForLanguage(lang.value),
                    fontSize: 30,
                    fontWeight: 700,
                    color: "var(--primary)",
                    marginBottom: 4,
                    lineHeight: 1.1,
                  }}
                >
                  {lang.nativeScript}
                </div>
                <div
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: 14,
                    color: "var(--muted-foreground)",
                  }}
                >
                  {lang.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Launching note */}
        <p
          style={{
            marginTop: 32,
            fontFamily: "var(--sans)",
            fontSize: 13,
            color: "var(--muted-foreground)",
            fontStyle: "italic",
          }}
        >
          Launching first in Hindi · Mandarin · Spanish
        </p>
      </section>

      {/* The Gap Section */}
      <section
        style={{
          background: "var(--primary)",
          padding: "80px 24px",
          marginTop: 40,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "var(--sans)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--accent-light)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            The Gap
          </div>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(26px, 4vw, 36px)",
              fontWeight: 500,
              lineHeight: 1.2,
              color: "var(--cream-soft)",
              marginBottom: 32,
              letterSpacing: "-0.01em",
            }}
          >
            You know the language. But do you know how your profession speaks it?
          </h2>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: 16,
              color: "rgba(245, 230, 200, 0.75)",
              lineHeight: 1.7,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            Traditional language learning teaches you how to order food, introduce yourself,
            or hold a conversation. It rarely teaches you how to explain a diagnosis, pitch an
            idea, or use the terminology professionals actually use.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              fontFamily: "var(--sans)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--muted-foreground)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            How It Works
          </div>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(26px, 4vw, 36px)",
              fontWeight: 500,
              color: "var(--primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Build professional fluency in 3 steps
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 24,
          }}
        >
          {[
            {
              num: "01",
              icon: Layers,
              title: "Choose your language and field",
              desc: "Select from Spanish, Mandarin, or Hindi and a professional category — healthcare, business, finance, or technology.",
            },
            {
              num: "02",
              icon: Brain,
              title: "Study through active recall",
              desc: "See the English term, recall the translation, then flip to check. Rate your recall to schedule the next review.",
            },
            {
              num: "03",
              icon: Target,
              title: "Retain with spaced repetition",
              desc: "Our algorithm resurfaces cards you struggle with more frequently, and confident cards less often — for long-term retention.",
            },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                style={{
                  background: "var(--card)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  padding: 32,
                  position: "relative",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--accent)",
                    marginBottom: 20,
                    letterSpacing: "0.05em",
                  }}
                >
                  {step.num}
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--cream)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <Icon size={22} color="var(--primary)" strokeWidth={1.5} />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--primary)",
                    marginBottom: 10,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: 14,
                    color: "var(--muted-foreground)",
                    lineHeight: 1.6,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "40px 24px 80px",
          textAlign: "center",
          maxWidth: 640,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "var(--card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border)",
            padding: "48px 32px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(22px, 3.5vw, 30px)",
              fontWeight: 500,
              color: "var(--primary)",
              marginBottom: 12,
              letterSpacing: "-0.01em",
            }}
          >
            Your expertise shouldn't get lost in translation.
          </h2>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: 15,
              color: "var(--muted-foreground)",
              lineHeight: 1.6,
              marginBottom: 28,
            }}
          >
            Build the professional vocabulary, confidence, and communication skills to be
            understood wherever your career takes you.
          </p>
          <button
            onClick={() => onDashboard("spanish")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--primary-soft)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--primary)";
              e.currentTarget.style.transform = "none";
            }}
          >
            Start Learning
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: 16,
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--primary)",
          }}
        >
          Your language, at work — professional fluency.
        </p>
        <p
          style={{
            marginTop: 8,
            fontFamily: "var(--sans)",
            fontSize: 12,
            color: "var(--muted-foreground)",
          }}
        >
          Hindi · Mandarin · Spanish
        </p>
      </footer>
    </div>
  );
}
