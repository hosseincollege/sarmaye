import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { fetchUser } = useContext(AuthContext); // 👈 اینجا آوردیمش داخل تابع

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const inputStyle = {
    display: "block",
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    boxSizing: "border-box",
  };

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
        credentials: "include", // 👈 اضافه شد
      });



      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("username", loginData.username);

        fetchUser(); // 👈 بعد از ذخیره توکن‌ها، کاربر رو دوباره بگیر

        toast.success("✅ ورود موفقیت‌آمیز بود!"); // 👈 جایگزین alert
        navigate("/"); // برگرد به صفحه اصلی
      } else {
        alert(`❌ خطا در ورود:\n${JSON.stringify(data)}`);
      }
    } catch (err) {
      alert("⚠️ خطای اتصال به سرور!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        direction: "rtl",
        textAlign: "right",
        maxWidth: "400px",
        margin: "auto",
      }}
    >
      <h2>ورود به حساب کاربری</h2>
      <form onSubmit={handleSubmit}>
        <label>نام کاربری:</label>
        <input
          style={inputStyle}
          type="text"
          name="username"
          placeholder="نام کاربری"
          value={loginData.username}
          onChange={handleChange}
          required
        />

        <label>رمز عبور:</label>
        <input
          style={inputStyle}
          type="password"
          name="password"
          placeholder="رمز عبور"
          value={loginData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>

      <br />
      <button type="button" onClick={() => navigate("/")}>
        بازگشت به صفحه اصلی
      </button>
    </div>
  );
}
