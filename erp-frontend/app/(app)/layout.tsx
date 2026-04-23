'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from '@/components/Sidebar';
import { LogOut, User } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-indigo-600" />
              </div>
              <span className="font-medium">{user.username}</span>
              {user.is_staff && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Admin</span>}
            </div>
            <button onClick={logout}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-600 transition">
              <LogOut size={16} /> Salir
            </button>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
