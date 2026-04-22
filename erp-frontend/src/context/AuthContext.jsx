import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (data) => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      credentials: "include",
      body: JSON.stringify(data)
    });

    const result = await res.json();
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
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);