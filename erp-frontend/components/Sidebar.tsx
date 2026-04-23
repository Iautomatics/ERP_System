'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart,
  TrendingUp, BookOpen, Users, Shield, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/productos', label: 'Productos', icon: Package },
  { href: '/inventario', label: 'Inventario', icon: Warehouse },
  { href: '/ventas', label: 'Ventas', icon: TrendingUp },
  { href: '/compras', label: 'Compras', icon: ShoppingCart },
  { href: '/contabilidad', label: 'Contabilidad', icon: BookOpen },
  { href: '/usuarios', label: 'Usuarios', icon: Users },
  { href: '/seguridad', label: 'Seguridad', icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <>
      <aside className={`${open ? 'w-64' : 'w-16'} min-h-screen bg-gradient-to-b from-indigo-600 to-violet-700 text-white flex flex-col transition-all duration-300 shadow-xl`}>
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          {open && <span className="font-bold text-lg tracking-tight">ERP System</span>}
          <button onClick={() => setOpen(!open)} className="p-1 rounded-lg hover:bg-white/20 transition">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  active ? 'bg-white text-indigo-700 font-semibold shadow' : 'hover:bg-white/20'
                }`}>
                <Icon size={20} className="shrink-0" />
                {open && <span className="text-sm">{label}</span>}
              </Link>
            );
          })}
        </nav>
        {open && (
          <div className="p-4 border-t border-white/20 text-xs text-white/60 text-center">
            ERP v1.0
          </div>
        )}
      </aside>
    </>
  );
}
