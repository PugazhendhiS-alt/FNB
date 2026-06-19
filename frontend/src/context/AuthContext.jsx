import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, moduleAPI } from '../api/endpoints';
import { withTimeout } from '../api/client';

const AuthContext = createContext(null);

function safeGetItem(key, fallback = null) {
  try {
    return localStorage.getItem(key);
  } catch {
    return fallback;
  }
}

function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(safeGetItem('token'));
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(safeGetItem('isGuest') === 'true');
  const [allowedModules, setAllowedModules] = useState(null);

  const loadAllowedModules = async () => {
    try {
      const res = await moduleAPI.getMyAccess();
      setAllowedModules(res.data);
      try { localStorage.setItem('allowedModules', JSON.stringify(res.data)); } catch {}
    } catch {
      setAllowedModules([]);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (token) {
      Promise.all([
        withTimeout(authAPI.getProfile(), 10000).then((res) => {
          if (cancelled) return;
          setUser(res.data);
          try { localStorage.setItem('user', JSON.stringify(res.data)); } catch {}
        }).catch(() => {
          if (cancelled) return;
          safeRemoveItem('token');
          safeRemoveItem('user');
          safeRemoveItem('isGuest');
          safeRemoveItem('allowedModules');
          setToken(null);
          setUser(null);
          setIsGuest(false);
        }),
        loadAllowedModules(),
      ]).finally(() => { if (!cancelled) setLoading(false); });
    } else {
      setAllowedModules(null);
      setLoading(false);
    }
    return () => { cancelled = true; };
  }, [token]);

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password });
    try {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.removeItem('isGuest');
    } catch {}
    setToken(res.data.token);
    setUser(res.data.user);
    setIsGuest(false);
    loadAllowedModules();
    return res.data;
  };

  const sendOtp = async (identifier) => {
    const payload = identifier.includes('@') ? { email: identifier } : { phone: identifier };
    const res = await authAPI.sendOtp(payload);
    return res.data;
  };

  const verifyOtp = async (userId, code) => {
    const res = await authAPI.verifyOtp(userId, code);
    try {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.removeItem('isGuest');
    } catch {}
    setToken(res.data.token);
    setUser(res.data.user);
    setIsGuest(false);
    loadAllowedModules();
    return res.data;
  };

  const guestLogin = async (data) => {
    const res = await authAPI.guestLogin(data);
    try {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('isGuest', 'true');
    } catch {}
    setToken(res.data.token);
    setUser(res.data.user);
    setIsGuest(true);
    loadAllowedModules();
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    try {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.removeItem('isGuest');
    } catch {}
    setToken(res.data.token);
    setUser(res.data.user);
    setIsGuest(false);
    return res.data;
  };

  const logout = () => {
    safeRemoveItem('token');
    safeRemoveItem('user');
    safeRemoveItem('isGuest');
    safeRemoveItem('allowedModules');
    setToken(null);
    setUser(null);
    setIsGuest(false);
    setAllowedModules(null);
  };

  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data);
    try {
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch {}
    setUser(res.data);
    return res.data;
  };

  const switchRole = async (role) => {
    const res = await authAPI.switchRole(role);
    try {
      localStorage.setItem('token', res.data.token);
    } catch {}
    setToken(res.data.token);
    setUser(res.data.user);
    loadAllowedModules();
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isGuest, allowedModules, login, sendOtp, verifyOtp, guestLogin, register, logout, updateProfile, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
