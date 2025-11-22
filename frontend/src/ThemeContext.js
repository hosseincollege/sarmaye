import React, { createContext, useState, useEffect } from 'react';

// 1. ایجاد Context
export const ThemeContext = createContext();

// 2. ساخت Provider Component
export const ThemeProvider = ({ children }) => {
  // مقدار اولیه را از حافظه محلی (localStorage) می‌خوانیم. اگر وجود نداشت، 'system' را به عنوان پیش‌فرض قرار می‌دهیم.
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  // 3. استفاده از useEffect برای اعمال تغییرات در DOM
  useEffect(() => {
    const root = window.document.documentElement; // این همان تگ <html> است

    // بررسی می‌کنیم که آیا باید تم تاریک اعمال شود یا نه
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // ابتدا کلاس‌های قبلی را حذف می‌کنیم تا تداخل نکنند
    root.classList.remove(isDark ? 'light' : 'dark');
    
    // کلاس جدید را بر اساس وضعیت isDark اضافه می‌کنیم
    root.classList.add(isDark ? 'dark' : 'light');
    
    // انتخاب کاربر را در localStorage ذخیره می‌کنیم تا در بازدیدهای بعدی به یاد بماند
    localStorage.setItem('theme', theme);

  }, [theme]); // این افکت هر زمان که متغیر theme تغییر کند، دوباره اجرا می‌شود

  // 4. ارائه مقدار theme و تابع setTheme به کامپوننت‌های فرزند
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
