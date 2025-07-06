import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.REACT_APP_API_BASE;

  // Check current session on mount
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const res = await fetch(`${API_BASE}/currentUser.php`, {
          credentials: 'include',
        });
        const json = await res.json();

        if (json.loggedIn) {
          setUser(json.user);
          localStorage.setItem('user', JSON.stringify(json.user));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Fetch current user failed:', err);
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();
  }, [API_BASE]);

  // Login function
  const login = useCallback(async (user_id, password) => {
    try {
      const res = await fetch(`${API_BASE}/signin.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, password }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setUser(json.user);
        localStorage.setItem('user', JSON.stringify(json.user));
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }

    return false;
  }, [API_BASE]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/logout.php`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  }, [API_BASE]);

if (loading) {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-green-50 to-green-100 text-stargreen-dark">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-stargreen-dark border-opacity-50 mb-4"></div>
      <p className="text-lg font-semibold">Please Wait...</p>
    </div>
  );
}


  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
