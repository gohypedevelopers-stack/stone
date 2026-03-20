import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

const API_URL = "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (customerId) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile?customerId=${customerId}`);
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      } else {
        localStorage.removeItem("customerId");
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    if (customerId) {
      fetchProfile(customerId);
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (mobile) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("customerId", data.data.customer.id);
        setUser(data.data.customer);
        return { success: true };
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError("Failed to connect to server");
      return { success: false, message: "Server connection failed" };
    }
  };

  const register = async (name, mobile, email) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile, email }),
      });
      const data = await response.json();
      if (data.success) {
        // After registration, log them in
        return await login(mobile);
      } else {
        setError(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError("Failed to connect to server");
      return { success: false, message: "Server connection failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("customerId");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
