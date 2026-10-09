import type { Screen } from "../lib/types";

interface Props {
  screen: Screen;
  onLogo: () => void;
}

export default function Navbar({ screen, onLogo }: Props) {
  return (
    <header
      style={{
        background: "rgba(251, 243, 225, 0.88)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "20px 0",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={onLogo}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: 22,
              fontWeight: 600,
              color: "var(--primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Lexicon
          </span>
          <span
            style={{
              fontFamily: "var(--sans)",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--accent)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              paddingBottom: 2,
            }}
          >
            Recall
          </span>
        </button>

        {screen !== "home" && (
          <button
            onClick={onLogo}
            style={{
              fontFamily: "var(--sans)",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--muted-foreground)",
              padding: "8px 20px",
              borderRadius: 100,
              border: "1px solid var(--border)",
              transition: "all 0.25s ease",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--primary)";
              e.currentTarget.style.borderColor = "var(--border-strong)";
              e.currentTarget.style.background = "rgba(255,255,255,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--muted-foreground)";
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "none";
            }}
          >
            All Languages
          </button>
        )}
      </div>
    </header>
  );
}
