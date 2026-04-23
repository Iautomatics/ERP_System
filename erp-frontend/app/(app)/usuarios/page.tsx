'use client';
import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';

interface Usuario { id: number; username: string; email: string; first_name: string; last_name: string; is_active: boolean; is_staff: boolean; date_joined: string; rol: string; }
const empty = { id: 0, username: '', email: '', first_name: '', last_name: '', password: '', is_staff: false, rol: 'solo_lectura', is_active: true, date_joined: '' };
const roles = ['admin', 'contador', 'vendedor', 'comprador', 'almacenero', 'solo_lectura'];
const rolColor: Record<string, string> = {
  admin: 'bg-red-100 text-red-700', contador: 'bg-sky-100 text-sky-700',
  vendedor: 'bg-emerald-100 text-emerald-700', comprador: 'bg-orange-100 text-orange-700',
  almacenero: 'bg-violet-100 text-violet-700', solo_lectura: 'bg-slate-100 text-slate-600',
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/usuarios/').then(d => setUsuarios(d.results ?? d));
  useEffect(() => { load(); }, []);

  const save = async () => {
    setLoading(true);
    await api.post('/usuarios/', form);
    setModal(false); load(); setLoading(false);
  };

  const remove = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    await api.delete(`/usuarios/${id}/`); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2"><Users className="text-pink-600" /> Usuarios</h1>
          <p className="text-slate-500 mt-1">Gestión de usuarios y roles del sistema</p>
        </div>
        <button onClick={() => { setForm(empty); setModal(true); }}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-pink-50 text-pink-700">
            <tr>{['Usuario', 'Nombre', 'Email', 'Rol', 'Estado', 'Registro', ''].map(h => (
              <th key={h} className="px-6 py-4 text-left font-semibold">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400">No hay usuarios registrados</td></tr>
            ) : usuarios.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                  {u.is_staff && <ShieldCheck size={14} className="text-indigo-500" />}
                  {u.username}
                </td>
                <td className="px-6 py-4 text-slate-600">{`${u.first_name} ${u.last_name}`.trim() || '—'}</td>
                <td className="px-6 py-4 text-slate-500">{u.email || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rolColor[u.rol] ?? 'bg-slate-100 text-slate-600'}`}>{u.rol}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    {u.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{new Date(u.date_joined).toLocaleDateString('es')}</td>
                <td className="px-6 py-4">
                  <button onClick={() => remove(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Nuevo Usuario" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Usuario</label>
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Contraseña</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Nombre</label>
                <input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Apellido</label>
                <input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Rol</label>
              <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm">
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_staff" checked={form.is_staff} onChange={e => setForm({ ...form, is_staff: e.target.checked })} />
              <label htmlFor="is_staff" className="text-sm text-slate-700">Es administrador</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={save} disabled={loading} className="flex-1 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium transition disabled:opacity-60">
                {loading ? 'Guardando...' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
