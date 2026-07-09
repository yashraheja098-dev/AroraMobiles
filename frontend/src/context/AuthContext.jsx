import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      // Optional: Fetch latest user info from server to ensure token is valid
      api.get('/auth/me')
        .then(res => setUser({ ...parsedUser, ...res.data.data }))
        .catch(() => {
          logout(); // invalid token
        });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.data);
      localStorage.setItem('user', JSON.stringify(res.data.data));
    }
    return res.data;
  };

  const register = async (name, email, password, mobileNumber) => {
    const res = await api.post('/auth/register', { name, email, password, mobileNumber });
    if (res.data.success) {
      setUser(res.data.data);
      localStorage.setItem('user', JSON.stringify(res.data.data));
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
