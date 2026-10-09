import { Languages, LayoutDashboard } from "lucide-react";
import type { Screen } from "../lib/types";

interface Props {
  screen: Screen;
  onLogo: () => void;
}

export default function Navbar({ screen, onLogo }: Props) {
  return (
    <header
      style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--neutral-200)",
        padding: "16px 0",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
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
            gap: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, var(--primary-600), var(--primary-800))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <Languages size={20} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: "var(--neutral-900)" }}>
            Lexicon<span style={{ color: "var(--primary-600)" }}>Recall</span>
          </span>
        </button>

        {screen !== "home" && (
          <button
            onClick={onLogo}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--neutral-500)",
              fontSize: 14,
              fontWeight: 500,
              padding: "8px 16px",
              borderRadius: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--primary-600)";
              e.currentTarget.style.background = "var(--primary-50)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--neutral-500)";
              e.currentTarget.style.background = "none";
            }}
          >
            <LayoutDashboard size={16} />
            All Languages
          </button>
        )}
      </div>
    </header>
  );
}
