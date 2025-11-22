// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from "./AuthContext";

import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as CustomThemeProvider } from './ThemeContext'; 

import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // تمی که خودتان ساختید را وارد کنید

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <CustomThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CustomThemeProvider>
    </MuiThemeProvider>
  </React.StrictMode>
);


reportWebVitals();
