import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Role } from '@/data/types';

interface AuthUser {
  username: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, _password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'wfds-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((username: string, _password: string) => {
    const u = username.trim().toLowerCase();
    let role: Role | null = null;
    if (u === 'admin') role = 'admin';
    else if (u === 'supervisor') role = 'supervisor';
    if (!role) return false;
    const authUser: AuthUser = { username: u, role };
    setUser(authUser);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser)); } catch { /* ignore */ }
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
