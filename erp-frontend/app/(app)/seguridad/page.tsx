'use client';
import { useEffect, useState } from 'react';
import { Shield, Settings } from 'lucide-react';
import { api } from '@/lib/api';

interface Auditoria { id: number; usuario_nombre: string; accion: string; modulo: string; ip: string; fecha: string; exitoso: boolean; }
interface Config { id: number; intentos_maximos: number; tiempo_bloqueo_minutos: number; sesion_expira_minutos: number; requiere_2fa: boolean; }

export default function SeguridadPage() {
  const [auditoria, setAuditoria] = useState<Auditoria[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [tab, setTab] = useState<'auditoria' | 'config'>('auditoria');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/seguridad/auditoria/').then(d => setAuditoria(d.results ?? d));
    api.get('/seguridad/configuracion/').then(d => {
      const list = d.results ?? d;
      if (list.length > 0) setConfig(list[0]);
    });
  }, []);

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    if (config.id) await api.put(`/seguridad/configuracion/${config.id}/`, config);
    else await api.post('/seguridad/configuracion/', config);
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2"><Shield className="text-red-600" /> Seguridad</h1>
        <p className="text-slate-500 mt-1">Auditoría de accesos y configuración de seguridad</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[{ key: 'auditoria', label: 'Auditoría de Accesos' }, { key: 'config', label: 'Configuración' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.key ? 'bg-red-600 text-white' : 'bg-white text-slate-600 hover:bg-red-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'auditoria' && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-red-50 text-red-700">
              <tr>{['Fecha', 'Usuario', 'Acción', 'Módulo', 'IP', 'Estado'].map(h => (
                <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditoria.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Sin registros de auditoría</td></tr>
              ) : auditoria.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-slate-500">{new Date(a.fecha).toLocaleString('es')}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{a.usuario_nombre}</td>
                  <td className="px-6 py-4 text-slate-600">{a.accion}</td>
                  <td className="px-6 py-4 text-slate-500">{a.modulo}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{a.ip || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${a.exitoso ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {a.exitoso ? 'Exitoso' : 'Fallido'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'config' && config && (
        <div className="bg-white rounded-2xl shadow p-6 max-w-lg">
          <div className="flex items-center gap-2 mb-6">
            <Settings size={20} className="text-red-600" />
            <h2 className="text-lg font-semibold text-slate-800">Parámetros de Seguridad</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Intentos máximos de login</label>
              <input type="number" value={config.intentos_maximos}
                onChange={e => setConfig({ ...config, intentos_maximos: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Tiempo de bloqueo (minutos)</label>
              <input type="number" value={config.tiempo_bloqueo_minutos}
                onChange={e => setConfig({ ...config, tiempo_bloqueo_minutos: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Expiración de sesión (minutos)</label>
              <input type="number" value={config.sesion_expira_minutos}
                onChange={e => setConfig({ ...config, sesion_expira_minutos: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="2fa" checked={config.requiere_2fa}
                onChange={e => setConfig({ ...config, requiere_2fa: e.target.checked })} />
              <label htmlFor="2fa" className="text-sm text-slate-700">Requerir autenticación de dos factores</label>
            </div>
            <button onClick={saveConfig} disabled={saving}
              className="w-full px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition disabled:opacity-60">
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
