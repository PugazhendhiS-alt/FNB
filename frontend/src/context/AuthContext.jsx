import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(localStorage.getItem('isGuest') === 'true');

  useEffect(() => {
    if (token) {
      authAPI.getProfile()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('isGuest');
          setToken(null);
          setIsGuest(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.removeItem('isGuest');
    setToken(res.data.token);
    setUser(res.data.user);
    setIsGuest(false);
    return res.data;
  };

  const sendOtp = async (identifier) => {
    const payload = identifier.includes('@') ? { email: identifier } : { phone: identifier };
    const res = await authAPI.sendOtp(payload);
    return res.data;
  };

  const verifyOtp = async (userId, code) => {
    const res = await authAPI.verifyOtp(userId, code);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.removeItem('isGuest');
    setToken(res.data.token);
    setUser(res.data.user);
    setIsGuest(false);
    return res.data;
  };

  const guestLogin = async (data) => {
    const res = await authAPI.guestLogin(data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.setItem('isGuest', 'true');
    setToken(res.data.token);
    setUser(res.data.user);
    setIsGuest(true);
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.removeItem('isGuest');
    setToken(res.data.token);
    setUser(res.data.user);
    setIsGuest(false);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isGuest');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  const switchRole = async (role) => {
    const res = await authAPI.switchRole(role);
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isGuest, login, sendOtp, verifyOtp, guestLogin, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);