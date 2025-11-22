// فایل: App.js

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import WorkshopList from "./components/WorkshopList";
import WorkshopDetail from "./components/WorkshopDetail";
import EditWorkshop from "./components/EditWorkshop";
import CreateWorkshopPage from "./components/CreateWorkshopPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import HomePage from "./components/HomePage";
import "react-toastify/dist/ReactToastify.css";
import EnvInfoButton from "./components/EnvInfoButton";
import { AuthContext } from "./AuthContext";

// 👇 ایمپورت‌های لازم برای راست‌چین کردن با MUI
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from 'stylis';

// --- شروع بخش تنظیمات راست‌چین (RTL) ---

// ساخت یک کش جدید برای استایل‌ها با پشتیبانی از RTL
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin], // اضافه کردن prefixer
});

const theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: "Vazirmatn, Arial, sans-serif",
    fontSize: 15, // 👈 اندازه پایه فونت کل برنامه (پیش‌فرض MUI حدود 14ه)
    h1: { fontSize: '2.8rem' },
    h2: { fontSize: '2.4rem' },
    h3: { fontSize: '2.5rem' },
    h4: { fontSize: '2.2rem' },
    h5: { fontSize: '1.6rem' }, // عنوان‌هایی مثل "📊 نمودار سالانه"
    h6: { fontSize: '1.5rem' },
  },
});


// --- پایان بخش تنظیمات راست‌چین (RTL) ---

export default function App() {
  const { currentUser } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);
  const [backendInfo, setBackendInfo] = useState(null);

  // تنظیم RTL برای کل صفحه
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    document.body.setAttribute('dir', 'rtl');
    document.documentElement.style.direction = 'rtl';
    document.body.style.direction = 'rtl';
    document.body.style.textAlign = 'right';
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access");

    fetch(`${process.env.REACT_APP_API_URL}/api/backend-info/`, {
      method: "GET",
      headers: token ? { "Authorization": `Bearer ${token}` } : {},
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setBackendInfo(prev => ({ ...prev, ...data })))
      .catch(err => console.error("Backend info fetch error:", err));

  }, [currentUser]);

  return (
    // کل اپلیکیشن را داخل ThemeProvider و CacheProvider قرار می‌دهیم
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <div style={{ direction: 'rtl', textAlign: 'right' }}>
          <ToastContainer position="top-center" autoClose={3000} rtl={true} />
          <Router>
            <Header />
            <EnvInfoButton backendInfo={backendInfo} />
            <div style={{ paddingTop: '70px', direction: 'rtl' }}>
                <Routes>
                  <Route
                    path="/"
                    element={<HomePage key={refreshKey} />}
                  />
                  <Route path="/workshops" element={<WorkshopList />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/create" element={<CreateWorkshopPage />} />
                  <Route path="/workshops/:id" element={<WorkshopDetail />} />
                  <Route path="/edit/:id" element={<EditWorkshop />} />
                </Routes>
            </div>
          </Router>
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}
