import { useState } from "react";
import type { Language, Screen } from "./lib/types";
import HomeScreen from "./components/HomeScreen";
import StudyScreen from "./components/StudyScreen";
import DashboardScreen from "./components/DashboardScreen";
import Navbar from "./components/Navbar";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [language, setLanguage] = useState<Language | null>(null);

  const goHome = () => {
    setScreen("home");
    setLanguage(null);
  };

  const startStudy = (lang: Language) => {
    setLanguage(lang);
    setScreen("study");
  };

  const goDashboard = (lang: Language) => {
    setLanguage(lang);
    setScreen("dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar screen={screen} onLogo={goHome} />
      <main style={{ flex: 1 }}>
        {screen === "home" && (
          <HomeScreen onStudy={startStudy} onDashboard={goDashboard} />
        )}
        {screen === "study" && language && (
          <StudyScreen language={language} onExit={() => goDashboard(language)} />
        )}
        {screen === "dashboard" && language && (
          <DashboardScreen
            language={language}
            onStudy={() => setScreen("study")}
            onBack={goHome}
          />
        )}
      </main>
    </div>
  );
}
