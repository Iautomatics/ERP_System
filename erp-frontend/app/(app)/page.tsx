'use client';
import { useEffect, useState } from 'react';
import { Package, Users, ShoppingCart, TrendingUp, DollarSign, BarChart2 } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { api } from '@/lib/api';

interface DashboardData {
  productos: number;
  clientes: number;
  proveedores: number;
  ventas_total: number;
  compras_total: number;
  ventas_count: number;
  compras_count: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get('/dashboard/').then(setData).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Resumen general del sistema ERP</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard title="Productos" value={data?.productos ?? '—'} subtitle="Activos en sistema" color="bg-gradient-to-br from-indigo-500 to-indigo-700" icon={<Package size={24} />} />
        <StatCard title="Clientes" value={data?.clientes ?? '—'} subtitle="Clientes activos" color="bg-gradient-to-br from-emerald-500 to-emerald-700" icon={<Users size={24} />} />
        <StatCard title="Proveedores" value={data?.proveedores ?? '—'} subtitle="Proveedores activos" color="bg-gradient-to-br from-violet-500 to-violet-700" icon={<ShoppingCart size={24} />} />
        <StatCard title="Total Ventas" value={`$${Number(data?.ventas_total ?? 0).toLocaleString()}`} subtitle={`${data?.ventas_count ?? 0} órdenes`} color="bg-gradient-to-br from-sky-500 to-sky-700" icon={<TrendingUp size={24} />} />
        <StatCard title="Total Compras" value={`$${Number(data?.compras_total ?? 0).toLocaleString()}`} subtitle={`${data?.compras_count ?? 0} órdenes`} color="bg-gradient-to-br from-orange-500 to-orange-700" icon={<DollarSign size={24} />} />
        <StatCard title="Módulos Activos" value="7" subtitle="Todos operativos" color="bg-gradient-to-br from-pink-500 to-pink-700" icon={<BarChart2 size={24} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nueva Venta', href: '/ventas', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
              { label: 'Nueva Compra', href: '/compras', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
              { label: 'Ver Inventario', href: '/inventario', color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
              { label: 'Ver Productos', href: '/productos', color: 'bg-sky-50 text-sky-700 hover:bg-sky-100' },
            ].map(({ label, href, color }) => (
              <a key={href} href={href} className={`${color} rounded-xl px-4 py-3 text-sm font-medium transition text-center`}>
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Estado del Sistema</h2>
          <div className="space-y-3">
            {[
              { label: 'API Django', status: 'Conectado', color: 'bg-emerald-100 text-emerald-700' },
              { label: 'Base de Datos', status: 'Operativa', color: 'bg-emerald-100 text-emerald-700' },
              { label: 'Autenticación', status: 'Activa', color: 'bg-emerald-100 text-emerald-700' },
            ].map(({ label, status, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{label}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${color}`}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
