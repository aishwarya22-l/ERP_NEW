import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/me", { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(u => setUser(u || null))
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  const login = async (data) => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
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
    await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(data)
    });
  };

  const logout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", {
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