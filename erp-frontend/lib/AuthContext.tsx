'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!api.isAuthenticated()) {
      setLoading(false);
      return;
    }
    api.get('/me/')
      .then(data => {
        if (data?.id) setUser(data);
        else api.logout();
      })
      .catch(() => api.logout())
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const data = await api.login(username, password);
    if (!data) return 'No se pudo conectar al servidor';
    if (data.access) {
      const me = await api.get('/me/');
      if (me?.id) {
        setUser(me);
        router.push('/dashboard');
        return null;
      }
    }
    return data.detail || 'Credenciales incorrectas';
  };

  const logout = () => {
    api.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
