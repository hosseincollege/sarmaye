// src/theme.js

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  direction: "rtl",
  typography: {
    // فقط یک fontFamily باید وجود داشته باشد
    // استفاده از آرایه و join(',') روش استاندارد و پیشنهادی MUI است
    fontFamily: ['Vazirmatn', 'Roboto', 'Arial', 'sans-serif'].join(','),
    
    // بقیه تنظیمات سایز و وزن فونت شما عالی و صحیح است
    fontSize: 16,
    h1: { fontSize: '2.5rem', fontWeight: 'bold' },
    h2: { fontSize: '2.2rem', fontWeight: 'bold' },
    h3: { fontSize: '2rem', fontWeight: 'bold' },
    h4: { fontSize: '1.8rem', fontWeight: 'bold' },
    h5: { fontSize: '1.6rem', fontWeight: 'bold' },
    h6: { fontSize: '1.4rem', fontWeight: 500 },
    body1: { fontSize: '1.1rem' },
    body2: { fontSize: '1rem' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: "bold",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
