import { useContext } from "react";
import { ThemeModeContext } from "../ThemeContext";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // آیکون خورشید/ماه

export default function ThemeSwitcher() {
  const { mode, setThemeMode } = useContext(ThemeModeContext);

  const modes = ["light", "dark", "system"];
  const nextMode = () => {
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  // رنگ آیکون بر اساس حالت
  const iconColor =
    mode === "dark" ? "#888" : mode === "light" ? "#000" : "#ffeb3b";

  return (
    <div
      style={{ position: "fixed", top: 8, left: 50, zIndex: 9999 }}
    >
    <button
      onClick={nextMode}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "5px",
      }}
      title={`حالت فعلی: ${mode}`}
    >
      <Brightness4Icon style={{ color: iconColor }} />
    </button>
    </div>
  );
}
