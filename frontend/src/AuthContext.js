// src/AuthContext.js
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const fetchUser = () => {
    const token = localStorage.getItem("access");
    if (token) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/user/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => setCurrentUser(res.data))
        .catch(() => setCurrentUser(null));
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
