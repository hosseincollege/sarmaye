import { useContext } from "react";
// فرض بر این است که Context شما ThemeContext نام دارد تا با هدر هماهنگ باشد
import { ThemeContext } from "../ThemeContext"; 
import Brightness4Icon from "@mui/icons-material/Brightness4";

export default function ThemeSwitcher() {
  // نام‌ها برای هماهنگی با Header.jsx به theme و setTheme تغییر کرد
  const { theme, setTheme } = useContext(ThemeContext);

  const modes = ["light", "dark", "system"];
  
  const cycleTheme = () => {
    const currentIndex = modes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex]);
  };

  // تعیین رنگ آیکون بر اساس حالت تم
  const getIconColor = () => {
    if (theme === "dark") return "#888";      // خاکستری برای حالت تیره
    if (theme === "light") return "#000";     // مشکی برای حالت روشن
    return "#ffeb3b";                         // زرد/طلایی برای حالت سیستم
  };
  
  // استایل داینامیک برای آیکون
  const iconStyle = {
    color: getIconColor(),
  };

  return (
    <div style={styles.container}>
      <button
        onClick={cycleTheme}
        style={styles.button}
        title={`حالت فعلی: ${theme}`}
      >
        <Brightness4Icon style={iconStyle} />
      </button>
    </div>
  );
}

// --- Styles Object ---
const styles = {
  container: {
    position: "fixed",
    top: 8,
    left: 50, // Note: You might want to use 'right' for RTL layouts
    zIndex: 9999,
  },
  button: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "5px",
  },
};
