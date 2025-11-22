import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";

// Contexts
import { AuthContext } from "../AuthContext";
import { ThemeContext } from "../ThemeContext"; // اطمینان حاصل کنید که این فایل وجود دارد

// Assets & Icons
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import logo from "../170.png";

export default function Header() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setCurrentUser(null);
    setUserMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const cycleTheme = () => {
    const modes = ["light", "dark", "system"];
    const currentIndex = modes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex]);
  };

  return (
    <header style={styles.header}>
      {/* Hamburger Menu (Right Side for RTL) */}
      <div style={styles.menuContainer} ref={menuRef}>
        <span style={styles.iconButton} onClick={() => setMenuOpen(!menuOpen)}>
          <MenuIcon />
        </span>
        {menuOpen && (
          <div style={styles.dropdownMenu}>
            <div style={styles.menuItem} onClick={() => handleNavigation("/workshops")}>لیست کارگاه‌ها</div>
            <div style={styles.menuItem} onClick={() => handleNavigation("/crypto")}>رمز ارز</div>
            <div style={styles.menuItem} onClick={() => handleNavigation("/invest")}>سرمایه گذاری</div>
          </div>
        )}
      </div>

      {/* Image Logo (Center) */}
      <div style={styles.logoContainer} onClick={() => navigate("/")}>
        <img src={logo} alt="Simin Pluse Logo" style={styles.logoImage} />
      </div>

      {/* Left-side Icons Container */}
      <div style={styles.leftIconsContainer}>
        {/* Theme Switcher Icon */}
        <span style={styles.iconButton} onClick={cycleTheme} title={`Current theme: ${theme}`}>
          <Brightness4Icon />
        </span>

        {/* User Menu */}
        <div style={styles.menuContainer} ref={userMenuRef}>
          <span style={styles.iconButton} onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <AccountCircleIcon />
          </span>
          {userMenuOpen && (
            <div style={styles.userDropdown}>
              {currentUser ? (
                <>
                  <p style={styles.welcomeMessage}>👋 سلام، {currentUser.username}</p>
                  <button onClick={handleLogout} style={styles.logoutButton}>خروج</button>
                </>
              ) : (
                <div style={styles.authButtonsContainer}>
                  <button onClick={() => navigate("/login")} style={styles.loginButton}>ورود</button>
                  <button onClick={() => navigate("/register")} style={styles.registerButton}>ثبت‌نام</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// --- Styles Object ---
const styles = {
  header: {
    direction: "rtl",
    backgroundColor: "var(--header-bg, #fff)", // استفاده از متغیر CSS برای تم
    color: "var(--text-color, #000)", // استفاده از متغیر CSS برای تم
    borderBottom: "1px solid var(--border-color, #ddd)",
    padding: "10px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    fontFamily: "'Vazirmatn', sans-serif",
    transition: 'background-color 0.3s, color 0.3s', // انیمیشن نرم برای تغییر تم
  },
  leftIconsContainer: { // استایل جدید برای کانتینر آیکون‌های چپ
    display: 'flex',
    alignItems: 'center',
    gap: '20px', // فاصله بین آیکون‌ها
  },
  menuContainer: {
    position: "relative",
  },
  iconButton: {
    cursor: "pointer",
    display: 'flex',
    alignItems: 'center',
  },
  dropdownMenu: {
    position: "absolute",
    top: "40px",
    right: 0,
    background: "var(--dropdown-bg, #fff)",
    color: "var(--text-color, #000)",
    border: "1px solid var(--border-color, #ddd)",
    borderRadius: "8px",
    minWidth: "160px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    zIndex: 1001,
  },
  menuItem: {
    padding: "10px 20px",
    cursor: "pointer",
    transition: 'background-color 0.2s',
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    cursor: "pointer",
    padding: '0 20px', // کمی فاصله از طرفین
  },
  logoImage: {
    height: "45px",
    objectFit: "contain",
  },
  userDropdown: {
    position: "absolute",
    top: "40px",
    left: 0,
    background: "var(--dropdown-bg, #fff)",
    color: "var(--text-color, #000)",
    border: "1px solid var(--border-color, #ddd)",
    borderRadius: "8px",
    padding: "12px",
    minWidth: "180px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "right",
    fontFamily: "'Vazirmatn', sans-serif",
    zIndex: 1001,
  },
  welcomeMessage: {
    margin: "0 0 10px 0",
    whiteSpace: 'nowrap',
    fontWeight: '500',
  },
  logoutButton: {
    width: "100%",
    padding: "8px",
    background: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: '14px',
  },
  authButtonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  loginButton: {
    width: "100%",
    padding: "8px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  registerButton: {
    width: "100%",
    padding: "8px",
    background: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
