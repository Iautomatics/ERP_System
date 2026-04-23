'use client';
import { useEffect, useState } from 'react';
import { Package, Users, ShoppingCart, TrendingUp, DollarSign, ArrowLeft, ExternalLink, BarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface DashboardData {
  productos: number; clientes: number; proveedores: number;
  ventas_total: number; compras_total: number; ventas_count: number; compras_count: number;
  ventas_meses: { mes: string; total: number }[];
  compras_meses: { mes: string; total: number }[];
  ventas_estado: { estado: string; total: number; monto: number }[];
  compras_estado: { estado: string; total: number; monto: number }[];
  productos_categoria: { categoria__nombre: string; total: number }[];
  stock_items: { producto__nombre: string; cantidad: number }[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];
type CardKey = 'productos' | 'clientes' | 'proveedores' | 'ventas' | 'compras';

const fmt = (v: unknown) => `$${Number(v).toLocaleString()}`;

// Verifica si hay datos graficables para cada tarjeta
const tieneGrafico = (key: CardKey, data: DashboardData): boolean => {
  switch (key) {
    case 'ventas': return (data.ventas_count ?? 0) > 0;
    case 'compras': return (data.compras_count ?? 0) > 0;
    case 'productos': return (data.productos ?? 0) > 0;
    case 'clientes': return (data.ventas_count ?? 0) > 0 || (data.compras_count ?? 0) > 0;
    case 'proveedores': return (data.compras_count ?? 0) > 0;
    default: return false;
  }
};

const rutaModulo: Record<CardKey, string> = {
  productos: '/productos',
  clientes: '/ventas',
  proveedores: '/compras',
  ventas: '/ventas',
  compras: '/compras',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activa, setActiva] = useState<CardKey | null>(null);
  const [error, setError] = useState(false);
  const [health, setHealth] = useState<{ api: boolean; base_datos: boolean; autenticacion: boolean } | null>(null);
  const router = useRouter();

  useEffect(() => {
    api.get('/dashboard/').then(d => {
      if (d) setData(d);
      else setError(true);
    }).catch(() => setError(true));
    api.get('/health/').then(d => { if (d) setHealth(d); }).catch(() => {});
  }, []);

  const handleCardClick = (key: CardKey) => {
    if (!data) return;
    if (tieneGrafico(key, data)) {
      setActiva(key);
    } else {
      router.push(rutaModulo[key]);
    }
  };

  const renderGrafico = (key: CardKey) => {
    if (!data) return null;

    switch (key) {
      case 'ventas':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Evolución mensual</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.ventas_meses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={fmt} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', r: 5 }} activeDot={{ r: 8 }} name="Ventas" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Distribución por estado</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.ventas_estado} dataKey="total" nameKey="estado" cx="50%" cy="50%" outerRadius={90} innerRadius={40} paddingAngle={3}>
                    {data.ventas_estado.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, name) => [v, name]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'compras':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Evolución mensual</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.compras_meses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={fmt} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="total" fill="#f97316" radius={[6, 6, 0, 0]} name="Compras" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Distribución por estado</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.compras_estado} dataKey="total" nameKey="estado" cx="50%" cy="50%" outerRadius={90} innerRadius={40} paddingAngle={3}>
                    {data.compras_estado.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'productos':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Productos por categoría</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data.productos_categoria} dataKey="total" nameKey="categoria__nombre"
                    cx="50%" cy="50%" outerRadius={110} innerRadius={50} paddingAngle={3}>
                    {data.productos_categoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Cantidad por categoría</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.productos_categoria}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="categoria__nombre" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} name="Productos">
                    {data.productos_categoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'clientes':
        return (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Ventas vs Compras por mes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.ventas_meses.map((v, i) => ({
                mes: v.mes,
                Ventas: v.total,
                Compras: data.compras_meses[i]?.total ?? 0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={fmt} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Bar dataKey="Ventas" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Compras" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'proveedores':
        return (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Resumen financiero</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { nombre: 'Total Ventas', valor: Number(data.ventas_total) },
                { nombre: 'Total Compras', valor: Number(data.compras_total) },
                { nombre: 'Utilidad', valor: Number(data.ventas_total) - Number(data.compras_total) },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={fmt} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]} name="Monto">
                  {[0, 1, 2].map(i => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
    }
  };

  const cards = [
    { key: 'productos' as CardKey, title: 'Productos', subtitle: 'Activos en sistema', gradiente: 'from-indigo-500 to-indigo-700', icon: <Package size={24} />, getValue: (d: DashboardData) => d.productos },
    { key: 'clientes' as CardKey, title: 'Clientes', subtitle: 'Clientes activos', gradiente: 'from-emerald-500 to-emerald-700', icon: <Users size={24} />, getValue: (d: DashboardData) => d.clientes },
    { key: 'proveedores' as CardKey, title: 'Proveedores', subtitle: 'Proveedores activos', gradiente: 'from-violet-500 to-violet-700', icon: <ShoppingCart size={24} />, getValue: (d: DashboardData) => d.proveedores },
    { key: 'ventas' as CardKey, title: 'Total Ventas', subtitle: (d: DashboardData | null) => `${d?.ventas_count ?? 0} órdenes`, gradiente: 'from-sky-500 to-sky-700', icon: <TrendingUp size={24} />, getValue: (d: DashboardData) => `$${parseFloat(String(d.ventas_total || 0)).toLocaleString()}` },
    { key: 'compras' as CardKey, title: 'Total Compras', subtitle: (d: DashboardData | null) => `${d?.compras_count ?? 0} órdenes`, gradiente: 'from-orange-500 to-orange-700', icon: <DollarSign size={24} />, getValue: (d: DashboardData) => `$${parseFloat(String(d.compras_total || 0)).toLocaleString()}` },
  ];

  const cardActiva = cards.find(c => c.key === activa);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Haz clic en una tarjeta para ver su gráfico</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6 text-sm">
          ⚠️ No se pudo conectar con Django. Asegúrate de que el servidor esté corriendo en <strong>http://127.0.0.1:8000</strong>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map(card => {
          const hayGrafico = data ? tieneGrafico(card.key, data) : false;
          return (
            <button key={card.key} onClick={() => handleCardClick(card.key)}
              className={`bg-gradient-to-br ${card.gradiente} text-white rounded-2xl p-6 shadow-lg flex items-center gap-4 text-left hover:scale-[1.03] active:scale-[0.98] transition-transform cursor-pointer w-full relative overflow-hidden group`}>
              <div className="bg-white/20 rounded-xl p-3 shrink-0">{card.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80">{card.title}</p>
                <p className="text-3xl font-bold truncate">{data ? card.getValue(data) : '—'}</p>
                <p className="text-xs text-white/70 mt-1">
                  {typeof card.subtitle === 'function' ? card.subtitle(data) : card.subtitle}
                </p>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {hayGrafico
                  ? <BarChart2 size={16} className="text-white/70" />
                  : <ExternalLink size={16} className="text-white/70" />
                }
              </div>
              <div className="absolute bottom-2 right-3 text-white/40 text-xs">
                {hayGrafico ? 'Ver gráfico' : 'Ir al módulo'}
              </div>
            </button>
          );
        })}
      </div>

      {activa && cardActiva && data && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`bg-gradient-to-br ${cardActiva.gradiente} text-white rounded-xl p-2.5`}>
                {cardActiva.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{cardActiva.title}</h2>
                <p className="text-sm text-slate-500">
                  {typeof cardActiva.subtitle === 'function' ? cardActiva.subtitle(data) : cardActiva.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={rutaModulo[activa]}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 text-sm transition">
                <ExternalLink size={14} /> Ir al módulo
              </a>
              <button onClick={() => setActiva(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition">
                <ArrowLeft size={16} /> Volver
              </button>
            </div>
          </div>
          {renderGrafico(activa)}
        </div>
      )}

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
              <a key={href} href={href} className={`${color} rounded-xl px-4 py-3 text-sm font-medium transition text-center`}>{label}</a>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Estado del Sistema</h2>
          <div className="space-y-3">
            {[
              { label: 'API Django', ok: health?.api ?? false },
              { label: 'Base de Datos', ok: health?.base_datos ?? false },
              { label: 'Autenticación JWT', ok: health?.autenticacion ?? false },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{label}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${
                  health === null ? 'bg-slate-100 text-slate-400' :
                  ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    health === null ? 'bg-slate-400' : ok ? 'bg-emerald-500' : 'bg-red-500'
                  }`} />
                  {health === null ? 'Verificando...' : ok ? 'Operativo' : 'Error'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
