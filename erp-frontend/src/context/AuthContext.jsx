import { createContext, useContext, useState, useEffect } from "react";
import { BASE_URL } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/auth/me`, { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(u => setUser(u || null))
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  const login = async (data) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      credentials: "include",
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Login failed");
    setUser(result.user);
    return result;
  };

  const register = async (data) => {
    await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(data)
    });
  };

  const logout = async () => {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
    setUser(null);
  };


  return (
    <AuthContext.Provider value={{ user, login, register, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
