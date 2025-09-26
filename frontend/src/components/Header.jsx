import React, { useState, useEffect, useRef, useContext } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const userMenuRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setSubMenuOpen(false);
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

  const handleCategoryClick = (path) => {
    navigate(path);
    // بستن منوها پس از کلیک
    setMenuOpen(false);
    setSubMenuOpen(false);
  };


  return (
    <header
      style={{
        direction: "rtl",
        backgroundColor: "#fff",
        borderBottom: "1px solid #ddd",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        fontFamily: "'Vazirmatn', sans-serif",
      }}
    >
      {/* منوی همبرگری */}
      <div style={{ position: "relative" }} ref={menuRef}>
        <span style={{ cursor: "pointer" }} onClick={() => setMenuOpen(!menuOpen)}>
          <MenuIcon />
        </span>

        {/* منوی اصلی همبرگر */}
        <div
          style={{
            display: menuOpen ? "block" : "none",
            position: "absolute",
            top: "30px",
            right: 0,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "5px",
            minWidth: "150px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          }}
        >
          {/* آیتم لیست کارگاه‌ها  */}
          <div
            style={{
              padding: "5px 15px",
              cursor: "pointer",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>

            {/* لینک مستقیم */}
            <span onClick={() => handleCategoryClick("/workshops")}>لیست کارگاه‌ها</span>
          </div>
          {/* آیتم‌های دیگر */}
          <div style={{ padding: "5px 15px", cursor: "pointer" }} onClick={() => navigate("/crypto")}>
            رمز ارز
          </div>
          <div style={{ padding: "5px 15px", cursor: "pointer" }} onClick={() => navigate("/invest")}>
            سرمایه گذاری
          </div>
        </div>
      </div>

      {/* لوگو */}
      <div
        style={{
          fontFamily: "'Vazir', sans-serif",
          fontWeight: "700",
          fontSize: "22px",
          cursor: "pointer",
          color: "#4A4A4A",          // رنگ پیش‌فرض
          transition: "color 0.3s ease",
        }}
        onClick={() => navigate("/")}
        onMouseEnter={(e) => (e.target.style.color = "#D4AF37")}  // طلایی روشن
        onMouseLeave={(e) => (e.target.style.color = "#A9A9A9")}  // نقره‌ای
      >
        سیمین پلاس
      </div>




      {/* منوی کاربر */}
      <div style={{ position: "relative" }} ref={userMenuRef}>
        <span style={{ cursor: "pointer" }} onClick={() => setUserMenuOpen(!userMenuOpen)}>
          <AccountCircleIcon />
        </span>

        <div
          style={{
            display: userMenuOpen ? "block" : "none",
            position: "absolute",
            top: "35px",
            left: 0,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "5px",
            padding: "10px",
            minWidth: "150px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            textAlign: "right",
            fontFamily: "'Vazirmatn', sans-serif",
          }}
        >
          {currentUser ? (
            <>
              <p style={{ margin: "5px 0" }}>👋 سلام، {currentUser.username}</p>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "5px",
                  background: "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                خروج
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => navigate("/login")}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "#fff",
                  color: "#2b00ff",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                ورود
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "#fff",
                  color: "#ff00ee",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                ثبت‌نام
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
