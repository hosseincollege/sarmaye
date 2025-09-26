import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: "Vazir, Roboto, Arial",
    fontFamily: 'Vazirmatn, Arial, sans-serif',
    fontSize: 16, // پیش‌فرض برای body
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
